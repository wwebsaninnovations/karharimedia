<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Google\Client as GoogleClient;


class GoogleServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(GoogleClient::class, function ($app) {
            $client = new GoogleClient();
            $client->setClientId(env('GOOGLE_CLIENT_ID'));
            $client->setClientSecret(env('GOOGLE_CLIENT_SECRET'));
            $client->setRedirectUri(env('GOOGLE_REDIRECT_URI'));
            $client->addScope('https://www.googleapis.com/auth/youtube.upload');
            $client->setAccessType('offline');
            return $client;
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
