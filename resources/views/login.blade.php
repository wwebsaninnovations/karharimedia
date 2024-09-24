@extends('layout.app')
@section('title', 'Video Page')
@section('content')
@if(session('message'))
<div class="alert alert-{{ session('status') }} alert-dismissible fade show" role="alert">
  <strong>{{ session('message') }}</strong>
  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
</div>
@endif
<div class="row g-4 mt-1">

<div class="col-sm-10 col-lg-8 mx-auto p-4 p-xl-0 pb-xl-5 my-5">
       
        <div class="py-5 text-center">
            <a href="{{route ('auth/redirect')}}">
                <button class="gsi-material-button">
                    <div class="gsi-material-button-state"></div>
                    <div class="gsi-material-button-content-wrapper">
                        <div class="gsi-material-button-icon">
                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlns:xlink="http://www.w3.org/1999/xlink" style="display: block;">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                <path fill="none" d="M0 0h48v48H0z"></path>
                            </svg>
                        </div>
                        <span class="gsi-material-button-contents">Continue with Google</span>
                        <span style="display: none;">Continue with Google</span>
                    </div>
                </button>
            </a>
        </div>
        <div class="col mx-auto">
            <div class="row p-xl-5 align-items-center rounded-3 border shadow-lg">
                <div class="col p-4 p-xl-5">
                    <div class="px-xl-5 mb-0">
                        <div class="pb-5 pt-5 pt-xl-0">
                            <div class="d-flex">
                                <p class="mb-0 fs-1 fw-light text-end">Upload MP3s to </p>
                            </div>
                            <div class="d-flex">
                                <img id="youtube_logo" src="/yt_logo_rgb_light.svg" alt="YouTube logo" width="300px">
                            </div>
                        </div>
                        <div class="fw-light fs-5_5">TunesToTube enables users to <mark>upload audio files to YouTube</mark> by combining them with an image, and converting them into videos.<br><br>
                            It's particularly useful for musicians, producers, and recording studios. The service is able to encode a 5-minute audio clip in just 3 seconds, and it doesn't alter the audio file, ensuring no loss in quality.<br><br>
                            TunesToTube also offers a range of additional features, such as batch upload mode, scheduled uploads, ID3 tag support, and for lossless audio formats like WAV or FLAC.<br><br>
                            Since its inception in 2011, it has been trusted by over <mark>1,500,000 users</mark> and has completed over <mark>35,000,000 uploads</mark>.
                        </div>
                    </div>
                </div>
                <!--
				<div class="col-5 p-5 shadow bg-light bg-gradient d-none d-xl-block">
					<div class="p-3 text-center">
						<a href="oauth2callback.php">
							<button class="gsi-material-button">
								<div class="gsi-material-button-state"></div>
								<div class="gsi-material-button-content-wrapper">
									<div class="gsi-material-button-icon">
										<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlns:xlink="http://www.w3.org/1999/xlink" style="display: block;">
											<path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
											<path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
											<path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
											<path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
											<path fill="none" d="M0 0h48v48H0z"></path>
										</svg>
									</div>
									<span class="gsi-material-button-contents">Continue with Google</span>
									<span style="display: none;">Continue with Google</span>
								</div>
							</button>
						</a>
					</div>
				</div>
				-->
            </div>
        </div>
    </div>

    @endsection