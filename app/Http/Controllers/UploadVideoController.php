<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use FFMpeg\FFMpeg;
use FFMpeg\Coordinate\Dimension;
use Google_Client;
use Google_Service_YouTube;
use Google_Service_YouTube_Video;
use Google_Service_YouTube_VideoSnippet;
use Google_Service_YouTube_VideoStatus;
use Google_Http_MediaFileUpload;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;

class UploadVideoController extends Controller
{
    protected $googleClient;

    public function __construct()
    {
        $this->googleClient = new Google_Client();
        // Initialize your Google Client with necessary credentials and scopes
        $this->googleClient->setClientId(env('GOOGLE_CLIENT_ID'));
        $this->googleClient->setClientSecret(env('GOOGLE_CLIENT_SECRET'));
        $this->googleClient->setRedirectUri(env('GOOGLE_REDIRECT_URI'));
        $this->googleClient->setScopes(['https://www.googleapis.com/auth/youtube.upload']);
    }

   public function upload(Request $request)
{
    $request->validate([
        'thumbnail' => 'required|image|mimes:jpg,jpeg,png',
        'audio' => 'required|mimes:mp3',
        'title' => 'required|string',
        'description' => 'required|string',
        'tags' => 'nullable|string',
        'privacy' => 'required|in:public,unlisted,private',
    ]);

    $image = $request->file('thumbnail');
    $audio = $request->file('audio');

    $imagePath = $image->store('thumbnail');
    $audioPath = $audio->store('audio');

    $imageFullPath = storage_path('app/' . $imagePath);
    $audioFullPath = storage_path('app/' . $audioPath);

    try {
        $videoPath = $this->createVideoFromImageAndAudio($imageFullPath, $audioFullPath);

        $publicVideoPath = 'videos/' . basename($videoPath);

        if (file_exists($videoPath)) {
            Storage::disk('public')->put($publicVideoPath, file_get_contents($videoPath));
        } else {
            throw new \Exception("Video file does not exist at path: " . $videoPath);
        }

        // Proceed with YouTube upload
        $this->uploadToYouTube($videoPath, $request);

        unlink($imageFullPath);
        unlink($audioFullPath);
        unlink($videoPath);


        return redirect()->back()->with('success', 'Video created and uploaded successfully!')->with('video', $publicVideoPath);

    } catch (\Exception $e) {
        Log::error('Failed to create or upload video: ' . $e->getMessage());
        return redirect()->back()->with('error', 'Failed to create or upload video: ' . $e->getMessage());
    }
}


    private function createVideoFromImageAndAudio($imagePath, $audioPath)
    {
        $tempVideoPath = storage_path('app/videos/temp_video.mp4');
        $videoPath = storage_path('app/videos/' . uniqid('video_') . '.mp4');

        $duration = $this->getAudioDuration($audioPath);

        // Generate a video from the image
        $command = "ffmpeg -loop 1 -i {$imagePath} -c:v libx264 -t {$duration} -pix_fmt yuv420p -vf scale=1280:720 {$tempVideoPath} 2>&1";
        $output = shell_exec($command);
        Log::info("FFmpeg output (image to video): " . $output);

        if (!file_exists($tempVideoPath) || filesize($tempVideoPath) === 0) {
            throw new \Exception("Failed to create or empty temporary video: " . $tempVideoPath);
        }

        // Add audio to the video
        $command = "ffmpeg -i {$tempVideoPath} -i {$audioPath} -c:v copy -c:a aac -strict experimental -shortest {$videoPath} 2>&1";
        $output = shell_exec($command);
        Log::info("FFmpeg output (add audio): " . $output);

        if (!file_exists($videoPath) || filesize($videoPath) === 0) {
            throw new \Exception("Failed to create final video: " . $videoPath);
        }

        // Clean up temporary video file
        unlink($tempVideoPath);

        return $videoPath;
    }

    private function getAudioDuration($audioPath)
    {
        // Use FFprobe to get the duration of the audio file
        $command = "ffprobe -v error -show_entries format=duration -of csv=p=0 {$audioPath}";
        $output = shell_exec($command);
        
        // Parse the duration and return it
        if ($output === null || trim($output) === '') {
            throw new \Exception("Failed to get audio duration for: " . $audioPath);
        }

        return (float) trim($output);
    }

 protected function uploadToYouTube($videoPath, Request $request)
{
    // Set up the Google Client
    $this->googleClient->setAccessToken(Session::get('access_token'));
    $youtube = new Google_Service_YouTube($this->googleClient);

    // Create video snippet
    $snippet = new Google_Service_YouTube_VideoSnippet();
    $snippet->setTitle($request->input('title'));
    $snippet->setDescription($request->input('description'));
    $snippet->setTags(explode(',', $request->input('tags')));
    $snippet->setCategoryId('22'); // Category ID for "People & Blogs"

    // Create video status
    $status = new Google_Service_YouTube_VideoStatus();
    $status->setPrivacyStatus($request->input('privacy'));

    // Create video
    $video = new Google_Service_YouTube_Video();
    $video->setSnippet($snippet);
    $video->setStatus($status);

    // Create media file upload
    $chunkSizeBytes = 1 * 1024 * 1024; // 1 MB
    $client = $this->googleClient;
    $client->setDefer(true);
    $insertRequest = $youtube->videos->insert('snippet,status', $video);
    $media = new Google_Http_MediaFileUpload(
        $client,
        $insertRequest,
        'video/*',
        null,
        true,
        $chunkSizeBytes
    );
    $media->setFileSize(filesize($videoPath));

    // Upload video in chunks
    $status = false;
    $handle = fopen($videoPath, 'rb');

    if ($handle === false) {
        Log::error('Failed to open video file for upload: ' . $videoPath);
        throw new \Exception('Failed to open video file for upload.');
    }

    try {
        while (!$status && !feof($handle)) {
            $chunk = fread($handle, $chunkSizeBytes);
            if ($chunk === false) {
                Log::error('Error reading video file chunk.');
                throw new \Exception('Error reading video file chunk.');
            }
            $status = $media->nextChunk($chunk);
        }

        if ($status instanceof Google_Service_YouTube_Video) {
            Log::info('Video uploaded successfully with ID: ' . $status->getId());
            return redirect()->back()->with('success', 'Video created and uploaded successfully!')->with('status', $status);
           
        } else {
            Log::error('Failed to upload video. Status received: ' . print_r($status, true));
            throw new \Exception('Failed to upload video. Status received: ' . print_r($status, true));
        }
    } catch (\Exception $e) {
        Log::error('Error uploading video to YouTube: ' . $e->getMessage());
        // Ensure handle is closed on error
        if (is_resource($handle)) {
            fclose($handle);
        }
        throw new \Exception('Failed to upload video to YouTube: ' . $e->getMessage());
    } finally {
        // Ensure handle is closed in the finally block
        if (is_resource($handle)) {
            fclose($handle);
        }
    }
}




}
