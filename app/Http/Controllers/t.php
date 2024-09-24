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
        if (!$handle) {
            return response()->json(['error' => 'Failed to open video file.'], 500);
        }

        try {
            while (!$status && !feof($handle)) {
                $chunk = fread($handle, $chunkSizeBytes);
                $status = $media->nextChunk($chunk);
            }
        } catch (\Exception $e) {
            \Log::error('Error uploading video to YouTube: ' . $e->getMessage());
            fclose($handle);
            return response()->json(['error' => 'Failed to upload video.'], 500);
        }

        fclose($handle);

        // Check upload status
        if ($status) {
            return response()->json(['message' => 'Video uploaded successfully.'], 200);
        } else {
            return response()->json(['error' => 'Failed to upload video.'], 500);
        }
    }