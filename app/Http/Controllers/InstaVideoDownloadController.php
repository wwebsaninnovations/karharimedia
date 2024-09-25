<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

class InstaVideoDownloadController extends Controller
{

    public function index(){
        return view('instagram.index');
    }

    public function fetchInstaVideo(Request $request)
    {
        $url = $request->input('url');

        if (!$url) {
            return back()->with('error', 'Please provide a valid Instagram video URL.');
        }

        try {

            $scriptPath = base_path('script.py');
            
            $process = new Process(['python3', $scriptPath, $url]);
            $process->run();

            $output = $process->getOutput();
            
            $videoNamepath = explode(".", $output);

            $filePath = $videoNamepath[0]. "." ."mp4";

            if (!file_exists($filePath)) {
                return back()->with('error', 'Downloaded video file not found.');
            }

            return response()->download($filePath);

        } catch (\Exception $e) {
            return back()->with('error', 'Failed to download video. Error: ' . $e->getMessage());
        }
    }
}
