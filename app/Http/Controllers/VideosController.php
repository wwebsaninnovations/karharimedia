<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Youtube;
use Illuminate\Support\Facades\Storage;
use App\Models\Videos;

class VideosController extends Controller
{
    public function createVideos()
    {
        return view('create');
    }

    public function allVideos(Request $request)
    {
   $channelId = $request->input('channelId');
          $video = Videos::orderBy('id', 'desc')->paginate(3);
    return view('index', [ 'channelId' => $channelId,'video' => $video]);
    }

    public function index()
    {
        return view('login');
    }


}
