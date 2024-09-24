<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Google\Client as GoogleClient;
use Google\Service\Oauth2 as GoogleServiceOauth2;
use Google\Service\YouTube as YouTubeService;
use Illuminate\Support\Facades\Redirect;

class GoogleController extends Controller
{
    public function redirectToGoogle()
    {
        $client = new GoogleClient();
        $client->setClientId(config('services.google.client_id'));
        $client->setClientSecret(config('services.google.client_secret'));
        $client->setRedirectUri(route('auth.google.callback'));
        
        // Add the required YouTube scopes
         $client->addScope('https://www.googleapis.com/auth/youtube.upload');
        $client->addScope('https://www.googleapis.com/auth/youtube.readonly');
        $client->addScope('profile');
        $client->addScope('email');
        
        return redirect()->away($client->createAuthUrl());
    }

    public function handleGoogleCallback(Request $request)
    {
        $client = new GoogleClient();
        $client->setClientId(config('services.google.client_id'));
        $client->setClientSecret(config('services.google.client_secret'));
        $client->setRedirectUri(route('auth.google.callback'));

        try {
            // Fetch the access token
            $tokenResponse = $client->fetchAccessTokenWithAuthCode($request->input('code'));

            // Check if the response contains the 'access_token'
            if (isset($tokenResponse['access_token'])) {
                $client->setAccessToken($tokenResponse['access_token']);

                // Store the access token in the session
                $request->session()->put('access_token', $tokenResponse['access_token']);

                $youtube = new YouTubeService($client);

                // Make the API request to list channels
                $channelResponse = $youtube->channels->listChannels('snippet', ['mine' => true]);
                $channelId = $channelResponse->getItems()[0]->getId();

                session()->put('channelId', $channelId);

                // Get user info
                $oauth = new GoogleServiceOauth2($client);
                $userInfo = $oauth->userinfo->get();

                // Find or create the user
                $user = User::firstOrCreate([
                    'google_id' => $userInfo->id,
                ], [
                    'name' => $userInfo->name,
                    'email' => $userInfo->email,
                    'avatar' => $userInfo->picture,
                ]);

                // Log the user in
                Auth::login($user);

                return redirect()->route('createVideos', ['channelId' => $channelId]);
            } else {
                throw new \Exception('Failed to authenticate with Google.');
            }
        } catch (\Exception $e) {
            // Handle errors
            return redirect()->back()->withErrors('Failed to retrieve YouTube data: ' . $e->getMessage());
        }
    }
}
