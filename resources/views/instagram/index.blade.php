<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Download Instagram Video</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="icon" href="{{ asset('favicon.svg') }}" type="image/svg">
</head>
<body>
<div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
    <form action="{{ route('fetch.insta.video') }}" method="POST" class="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        @csrf
        <h2 class="text-2xl font-bold mb-6 text-center">Download Instagram Video</h2> <h3 class="text-1xl font-bold mb-6 text-center">Laravel Tailwind</h3>
        <input
            type="text"
            name="url"
            placeholder="Enter Instagram video URL"
            class="border border-gray-300 rounded-md p-3 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
        >
        <button
            type="submit"
            class="bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition duration-200 w-full"
        >
            Download Video
        </button>
    </form>

    @if (session('error'))
        <div class="alert alert-danger mt-4 text-red-600">
            {{ session('error') }}
        </div>
    @endif
</div>
</body>
</html>





