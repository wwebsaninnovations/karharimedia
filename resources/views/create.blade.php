@extends('layout.app')
@section('title', 'Add New Video')
@section('heading', 'Create a New Video')
@section('link_text', 'Goto All Video')
@section('link', '/all-videos')
@section('content')
<div class="row my-3">
  <div class="col-lg-8 mx-auto">
    <div class="card shadow">
      @error('title')
              <div class="invalid-feedback">{{ $message }}</div>
            @enderror
            
 @if (session('success'))
            <div class="alert alert-success">
                {{ session('success') }}
            </div>
        @endif

      <div class="card-header bg-primary">
        <h3 class="text-light fw-bold">Add New Video</h3>
      </div>
      <div class="card-body p-4">
        <form action="{{ route('upload') }}" method="POST" enctype="multipart/form-data">
          @csrf
          <div class="my-2">
            <input type="text" name="title" id="title" class="form-control @error('title') is-invalid @enderror" placeholder="Title" value="{{ old('title') }}">

             
@if ($errors->any())
    <div class="alert alert-danger">
        <ul>
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif


 @if (session('error'))
    <div class="alert alert-danger">
        {{ session('error') }}
    </div>
@endif           


          </div>

           <div class="my-2">
            <textarea name="description" id="description" rows="6" class="form-control @error('description') is-invalid @enderror" placeholder="Video Descrption">{{ old('description') }}</textarea>
            @error('description')
              <div class="invalid-feedback">{{ $message }}</div>
            @enderror
          </div>

           <div class="my-2">
            <textarea name="tags" id="tags" rows="6" class="form-control @error('tags') is-invalid @enderror" placeholder="Video Tags">{{ old('tags') }}</textarea>
            @error('tags')
              <div class="invalid-feedback">{{ $message }}</div>
            @enderror
          </div>


        <div class="my-3">
    <div class="btn-group" role="group" aria-label="Privacy Options">
        <!-- Public Option -->
        <input type="radio" class="btn-check" name="privacy" id="btnradiolive" value="public" autocomplete="off" checked>
        <label class="btn btn-success" for="btnradiolive">Public</label>

        <!-- Private Option -->
        <input type="radio" class="btn-check" name="privacy" id="btnradioprivate" value="private" autocomplete="off">
        <label class="btn btn-success" for="btnradioprivate">Private</label>

        <!-- Unlisted Option -->
        <input type="radio" class="btn-check" name="privacy" id="btnradiounlisted" value="unlisted" autocomplete="off">
        <label class="btn btn-success" for="btnradiounlisted">Unlisted</label>
    </div>
</div>



         
          <div class="my-2">
            <input type="file" name="thumbnail" id="thumbnail" accept="image/*" class="form-control @error('thumbnail') is-invalid @enderror">
            @error('thumbnail')
              <div class="invalid-feedback">{{ $message }}</div>
            @enderror
          </div>

           <div class="my-2">
            <input type="file" name="audio" id="audio" accept="mp3/*" class="form-control @error('audio') is-invalid @enderror">
            @error('audio')
              <div class="invalid-feedback">{{ $message }}</div>
            @enderror
          </div>


         
          <div class="my-2">
            <input type="submit" value="Add Video" class="btn btn-primary">
          </div>
        </form>
      </div>
    </div>
  </div>
</div>
@endsection