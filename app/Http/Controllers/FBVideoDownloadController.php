<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class FBVideoDownloadController extends Controller
{
    public function index()
    {
        return view('facebook.index');
    }

    public function fetchVideo(Request $request)
    {
        $msg = [];

        try {
            // Get the URL from the request
            $url = $request->input('url');

            // Validate the URL
            if (empty($url)) {
                throw new \Exception('Please provide the URL', 1);
            }

            // Headers for the HTTP request
            $headers = [
                'sec-fetch-user' => '?1',
                'sec-ch-ua-mobile' => '?0',
                'sec-fetch-site' => 'none',
                'sec-fetch-dest' => 'document',
                'sec-fetch-mode' => 'navigate',
                'cache-control' => 'max-age=0',
                'authority' => 'www.facebook.com',
                'upgrade-insecure-requests' => '1',
                'accept-language' => 'en-GB,en;q=0.9,tr-TR;q=0.8,tr;q=0.7,en-US;q=0.6',
                'sec-ch-ua' => '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
                'user-agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36',
                'accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
            ];

            // Make the HTTP request
            $response = Http::withHeaders($headers)
                ->timeout(10)
                ->withOptions(['verify' => false, 'allow_redirects' => true, 'max_redirects' => 5])
                ->get($url);

            $data = $response->body();

            // Handle response
            $msg['success'] = true;
            $msg['id'] = $this->generateId($url);
            $msg['title'] = $this->getTitle($data);

            // Extract SD and HD download links
            if ($sdLink = $this->getSDLink($data)) {
                $msg['links']['Download Low Quality'] = $sdLink . '&dl=1';
            }

            if ($hdLink = $this->getHDLink($data)) {
                $msg['links']['Download High Quality'] = $hdLink . '&dl=1';
            }
        } catch (\Exception $e) {
            $msg['success'] = false;
            $msg['message'] = $e->getMessage();
        }

        return response()->json($msg);
    }

    // Generate video ID from URL
    private function generateId($url)
    {
        $id = '';
        if (is_int($url)) {
            $id = $url;
        } elseif (preg_match('#(\d+)/?$#', $url, $matches)) {
            $id = $matches[1];
        }
        return $id;
    }

    // Clean string for JSON-safe decoding
    private function cleanStr($str)
    {
        $tmpStr = "{\"text\": \"{$str}\"}";
        return json_decode($tmpStr)->text;
    }

    // Extract SD link
    private function getSDLink($content)
    {
        $regexRateLimit = '/browser_native_sd_url":"([^"]+)"/';
        if (preg_match($regexRateLimit, $content, $match)) {
            return $this->cleanStr($match[1]);
        }
        return false;
    }

    // Extract HD link
    private function getHDLink($content)
    {
        $regexRateLimit = '/browser_native_hd_url":"([^"]+)"/';
        if (preg_match($regexRateLimit, $content, $match)) {
            return $this->cleanStr($match[1]);
        }
        return false;
    }

    // Extract page title
    private function getTitle($content)
    {
        $title = null;
        if (preg_match('/<title>(.*?)<\/title>/', $content, $matches)) {
            $title = $matches[1];
        } elseif (preg_match('/title id="pageTitle">(.+?)<\/title>/', $content, $matches)) {
            $title = $matches[1];
        }

        return $this->cleanStr($title);
    }
}
