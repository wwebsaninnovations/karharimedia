$(document).ready(function () {
    //$(onPageLoaded);
    $("a#single_image").fancybox();
    $("a#inline").fancybox({
        'hideOnContentClick': true
    });
    $("a.group").fancybox({
        'transitionIn': 'elastic',
        'transitionOut': 'elastic',
        'speedIn': 600,
        'speedOut': 200,
        'overlayShow': false
    });
    updatePinnedItems();
});
function togglePin() {
    if (localStorage.getItem('upload_options_pinned') === 'true') {
        localStorage.setItem('upload_options_pinned', 'false');
    } else {
        localStorage.setItem('upload_options_pinned', 'true');
    }
    updatePinnedItems();
}
function updatePinnedItems() {
    if ($('#upload_options_pin').length) {
        if (localStorage.getItem('upload_options_pinned') === 'true') {
            $('#accordion_options-collapseOne').addClass('show');
            $("button[aria-controls=accordion_options-collapseOne]").removeClass('collapsed');
            $('#upload_options_pin > i').removeClass('bi-pin').addClass('bi-pin-fill');
            if (typeof bootstrap !== 'undefined') {
                const tooltip = bootstrap.Tooltip.getInstance('#upload_options_pin')
                tooltip.setContent({ '.tooltip-inner': 'Unpin' })
            }
        } else {
            $('#upload_options_pin > i').removeClass('bi-pin-fill').addClass('bi-pin');
            if (typeof bootstrap !== 'undefined') {
                const tooltip = bootstrap.Tooltip.getInstance('#upload_options_pin')
                tooltip.setContent({ '.tooltip-inner': 'Pin this menu open' })
            }
        }
    }
}
function checkDirty() {
    dataChanged = 0;     // global variable flags unsaved changes      
    function bindForChange() {
        $('input,checkbox,textarea,radio,select').bind('change', function (event) { dataChanged = 1 })
        $(':reset,:submit').bind('click', function (event) { dataChanged = 0 })
    }
    function askConfirm() {
        if (dataChanged) {
            return "You have some unsaved changes.  Press OK to continue without saving."
        }
    }
    window.onbeforeunload = askConfirm;
    window.onload = bindForChange;
}
function onPageLoaded() {
    var jqxhrs = [];
    $(window).bind("beforeunload", function (event) {
        $.each(jqxhrs, function (idx, jqxhr) {
            if (jqxhr)
                jqxhr.abort();
        });
    });
    function registerJqxhr(event, jqxhr, settings) {
        jqxhrs.push(jqxhr);
    }
    function unregisterJqxhr(event, jqxhr, settings) {
        var idx = $.inArray(jqxhr, jqxhrs);
        jqxhrs.splice(idx, 1);
    }
    $(document).ajaxSend(registerJqxhr);
    $(document).ajaxComplete(unregisterJqxhr);
};
function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
function EncodeAndUpload() {
    var b = $('#hidden_batch_mode_indicator').val();
    if (b == 'batch') {
        var url = "encode_and_upload.php?mode=batch";
        var mymessage = 'Creating videos and uploading to YouTube, please wait...';
        //Add fileorder
        $form = $("<form></form>");
        $form.append('<textarea id="fileorder" name="fileorder">');
        $('body').append($form);
        $("#fileorder").hide()
        $('div.files div.file_download_template').each(function (i, e) {
            console.log($(e).attr("data-id"));
            var areaValue = $("#fileorder").val();
            if ($(e).attr("data-id") !== undefined) {
                $("#fileorder").val(areaValue + $(e).attr("data-id") + "\n");
            }
        });
    } else {
        var url = "encode_and_upload.php";
        var mymessage = 'Creating video and uploading to YouTube, please wait...';
    }
    $('#upload_error').hide();
    $('#upload_complete').hide();
    $('#upload_form').hide();
    $('#messages').show();
    $('#upload_complete').show();
    var registered = $('#hidden_registered_indicator').val();
    if (registered == 'false') {
        //$('#upload_ad').html('<div id="upload_ad" style="margin-top:50px;"><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script><ins class="adsbygoogle"	style="display:block" data-ad-client="ca-pub-5221618874461322" data-ad-slot="7460325809" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script></div>');
        $('#upload_ad').html('<div id="upload_ad" style="margin-top:50px;"><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5221618874461322" crossorigin="anonymous"></script><!-- Uploading --><ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-5221618874461322"	data-ad-slot="7460325809" data-ad-format="auto"	data-full-width-responsive="true"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({}); </script></div>');
    }
    $('#youtube_response').show().html('<h3 class="py-3">Please wait for files to be encoded and uploaded...</h3>');
    $.post(
        url,
        $('form').serialize(),
        function (data) {
            var json = data;
            if (data !== "") {
                if (IsJsonString(json) === true) {
                    obj = JSON && JSON.parse(json) || $.parseJSON(json);
                    myresponse = obj.response;
                    mymessage = obj.message;
                    myids = JSON.stringify(obj.ids);
                } else {
                    myresponse = data;
                }
            } else {
                myresponse = "";
            }
            switch (myresponse) {
                case "ERROR":
                    if (typeof grecaptcha != 'undefined') {
                        grecaptcha.reset();
                    }
                    $('#upload_complete').hide();
                    $('#youtube_response').hide();
                    $('#upload_form').show();
                    $('#instructions').show();
                    $('#donate').show();
                    $('#messages').show();
                    $('#upload_ad').html('');
                    $('#upload_error').show().html(mymessage);
                    reloadUploads("delete");
                    break;
                case "OK":
                    checkUploads(myids);
                    $('#upload_form').hide();
                    dataChanged = 0;
                    $('#upload_complete').show();
                    $('#messages').show();
                    if (b == 'batch') {
                        if (($('#skip_youtube_upload').prop('checked') == false)||($('#skip_youtube_upload').prop('checked') == undefined)) {
                            $('#create_another_btn').prepend("<div class='my-3' id='createYouTubePlaylist'><button class='btn btn-success btn-lg' onClick='createPlaylist(" + myids.trim() + ")'><i class='bi bi-music-note-list'></i> Create Playlist</button></div>");
                        }
                        $('#create_another_btn').prepend("<div class='my-3'><a href='downloadZip.php?ids=" + myids.trim() + "'><button class='btn btn-success btn-lg'><i class='bi bi-download'></i> Download All Video Files</button></div>");
                    }

                    break;
                case "NOTSIGNEDIN":
                    log_error("NOTSIGNEDIN", "upload form create button press");
                    alert("You have been signed out of your YouTube account. Please log in again.");
                    window.location = 'http://www.tunestotube.com/logout';
                    break;
                default:
                    log_error(myresponse, "upload form create button press");
                    alert("Oops, there has been an error. Please send a screenshot of this message box to info@tunestotube.com - Error:" + myresponse);
                    break;
            }
        }
    );
}
function createPlaylist(myids) {
    myids = JSON.stringify(myids);
    my_url = '/createPlaylist.php';
    $.ajax({
        type: "POST",
        url: my_url,
        dataType: "json",
        success: function (data) {
            $('#createYouTubePlaylist').append(data);
        },
        error: function (a, b, c) {
            log_error(a + b + c, "shouldn't hit this - createPlaylist routine javascript.js");
        },
        data: myids
    });
}
function checkUploads() {
    var my_url = '/checkUpload.php';
    var mymessage = "";
    var myresponse = "";
    $.ajax({
        type: "POST",
        url: my_url,
        dataType: "json",
        data: myids,
        success: function (checkUploadData) {
            mymessage = checkUploadData.message;
            ids = checkUploadData.ids;
            myresponse = checkUploadData.response;
            myembedhtml = checkUploadData.embed_html;
            if (myresponse === 1) { //there are still files being processed
                $('#youtube_response').show().html('<h3 class="py-5">Please wait for files to be encoded and uploaded...</h3>' + mymessage);
                sleep(2000, checkUploads);
            } else { //Finished
                $('#youtube_response').show().html('<h3 class="py-5">Processing Complete!</h3>' + mymessage);
                if (myembedhtml) {
                    $('#embed_html').show();
                    $('#embed_textarea').html(myembedhtml);
                }
                $('#create_another_btn').show();
            }
        },
        error: function (a, b, c) {
            log_error(a + b + c, "shouldn't hit this - checkUploads routine javascript.js");
        }
    });
}
function sleep(millis, callback) {
    setTimeout(function () { callback(); }
        , millis);
}
function clearText(field) {
    if (field.defaultValue == field.value) field.value = '';
    else if (field.value == '') field.value = field.defaultValue;
}
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
function showSoundCloudUploads(offset) {
    if ($('#soundcloud_links').length) {
        if ($.trim($('#soundcloud_links').html()).length == 0) {
            document.getElementById('soundcloud_links').innerHTML = "<img src='img/Gear.svg'><strong>&nbsp;SoundCloud Files loading..... </strong>";
            //document.getElementById('soundcloud_pagination').innerHTML = "<img src='img/Gear.svg'><strong>&nbsp;SoundCloud Files loading..... </strong>";
            var soundcloudAjax = $.ajax({
                type: "GET",
                url: 'getSoundCloudUploads.php?offset=' + offset,
                success: function (data) {
                    document.getElementById('soundcloud_links').innerHTML = data;
                }
            });
        }
    } else {
    }
}
function getID3() {
    myurl = "/id3.php";
    $('#ID3Imagebtn').html('<i class="bi bi-upload"></i> Processing').attr('disabled', 'true');
    $.ajax({
        type: "GET",
        async: true,
        url: myurl,
        success: function (data) {
            var json = data;
            if (data !== "") {
                obj = JSON && JSON.parse(json) || $.parseJSON(json);
                mydata = obj.message;
            } else {
                mydata = "";
            }
            switch (obj.image) {
                case "NO IMAGE":
                    var response = "No Image could be found in the MP3's ID3 Tag";
                    break;
                case "ERROR":
                    var response = "There was an error when trying to extract ID3 cover art";
                    break;
                case "NO MP3":
                    var response = "It doesn't look like you've uploaded an MP3!";
                    break;
                default:
                    var response = "OK";
                    reloadUploads();
                    break;
            }
            $('#ID3Imagebtn').html('<i class="bi bi-image"></i> Get ID3 Image').removeAttr('disabled');
            if (response == "OK") {
                $('#id3image__error').show().html(response).attr('class', 'alert alert-success');
            } else {
                $('#id3image__error').show().html(response).attr('class', 'alert alert-danger');
            }
        }
    });
}
function abortDriveUploadsAjax() {
    driveUploadsAjax.abort();
}
function uploadPoll() {
    $('#imageCombine').hide();
    $('#description').height(100); $('#description').height($('#description').prop('scrollHeight'));
    if ($('#hidden_batch_mode_indicator').val() == 'batch') {
        my_url = '/getuploadstatus.php?mode=batch';
    } else {
        my_url = '/getuploadstatus.php';
    }
    $(".file_select").hide();
    $.ajax({
        type: "GET",
        url: my_url,
        success: function (data) {
            switch (data) {
                case '0': //Nothing is uploaded
                    form_inactive();
                    $('#uploadWaiting').html('Waiting for you to upload Audio and an Image...').attr('class', 'alert alert-danger');
                    $('#mp3status').html('<i class="bi bi-exclamation-circle-fill"></i> Audio not uploaded').attr('class', 'alert alert-danger');
                    $('#imagestatus').html('<i class="bi bi-exclamation-circle-fill"></i> Image not uploaded').attr('class', 'alert alert-danger');
                    var BATCH_ID3_IMAGEIsChecked = $('input[name="BATCH_ID3_IMAGE"]:checked').length > 0;
                    if (BATCH_ID3_IMAGEIsChecked == true) { //we don't need an image so ask for audio
                        $('#uploadWaiting').html('Waiting for you to upload <strong>Audio</strong>...').attr('class', 'alert alert-danger');
                        $('#mp3status').html('<i class="bi bi-exclamation-circle-fill"></i> Audio not uploaded').attr('class', 'alert alert-danger');
                        $('#imagestatus').html('<i class="bi bi-check2"></i> Image uploaded').attr('class', 'alert alert-success');
                    }
                    break;
                case '1': //The uploads are ok
                    $('#uploadWaiting').hide();
                    $('#spinner').hide();
                    $('#createVideoButton').prop('disabled', false);
                    $('#file_upload_label_button').html('Upload Files');
                    $('#file_upload_label_button').html('Uploads Complete!');
                    $('#hidden_file_upload_label_button').attr("disabled", true);
                    $('#mp3status').html('').removeClass();
                    $('#imagestatus').html('').removeClass();
                    var autoSubmitIsChecked = $('input[name="auto_submit"]:checked').length > 0;
                    if (autoSubmitIsChecked == true) {
                        EncodeAndUpload();
                        $('input[name=auto_submit]').attr('checked', false);
                    }
                    $('#autoSubmitDiv').hide();
                    $('#imageCombine').hide();
                    /*
                    var b = $('#hidden_batch_mode_indicator').val();
                    if (b != 'batch') {
                        if ($('#upload_accordion .show').length == 0) { //only move to Create accordion if the uploaded accordion is completely collapsed
                            $("button[aria-controls=accordion_main-collapseUpload]").addClass("collapsed") //collapse Upload
                            $("#accordion_main-collapseUpload").removeClass("show") //hide Upload
                            $("#accordion_main-collapseCreate").addClass("show") //show Create
                            $("button[aria-controls=accordion_main-collapseCreate]").removeClass("collapsed") //un-collapse Create
                            //Jump tp Create accordion
                            $('html, body').animate({
                                scrollTop: $("#create_accordion_top").offset().top
                            }, 100);
                        }
                    }
                    */
                    break;
                case '2': //Only the mp3 is uploaded
                    form_inactive();
                    $('#uploadWaiting').html('Waiting for you to upload an <strong>Image</strong>...').attr('class', 'alert alert-danger');
                    $('#mp3status').html('<i class="bi bi-check2"></i> Audio uploaded').attr('class', 'alert alert-success');
                    $('#imagestatus').html('<i class="bi bi-exclamation-circle-fill"></i> Image not uploaded').attr('class', 'alert alert-danger');
                    var BATCH_ID3_IMAGEIsChecked = $('input[name="BATCH_ID3_IMAGE"]:checked').length > 0;
                    if (BATCH_ID3_IMAGEIsChecked == true) { //we don't need an image so all is ok
                        $('#uploadWaiting').hide();
                        $('#spinner').hide();
                        $('#createVideoButton').prop('disabled', false);
                        $('#file_upload_label_button').html('Upload Files');
                        $('#file_upload_label_button').html('Uploads Complete!');
                        $('#hidden_file_upload_label_button').attr("disabled", true);
                        $('#mp3status').html('').removeClass();
                        $('#imagestatus').html('').removeClass();
                        var autoSubmitIsChecked = $('input[name="auto_submit"]:checked').length > 0;
                        if (autoSubmitIsChecked == true) {
                            EncodeAndUpload();
                            $('input[name=auto_submit]').attr('checked', false);
                        }
                        $('#autoSubmitDiv').hide();
                        $('#imageCombine').hide();
                    }
                    break;
                case '3': //Only the image is uploaded
                    form_inactive();
                    $('#uploadWaiting').html('Waiting for you to upload <strong>Audio</strong>...').attr('class', 'alert alert-danger');
                    $('#mp3status').html('<i class="bi bi-exclamation-circle-fill"></i> Audio not uploaded').attr('class', 'alert alert-danger');
                    $('#imagestatus').html('<i class="bi bi-check2"></i> Image uploaded').attr('class', 'alert alert-success');
                    break;
                case '10': //more than one mp3 uploaded
                    form_inactive();
                    $('#uploadWaiting').html('There are multiple Audio files uploaded!<br />Please remove one of them and upload an Image').attr('class', 'alert alert-danger');
                    $('#mp3status').html('<i class="bi bi-exclamation-circle-fill"></i> Delete one of the Audio files').attr('class', 'alert alert-danger');
                    $('#imagestatus').html('').attr('class', '');
                    break;
                case '11': //more than one image uploaded
                    form_inactive();
                    $('#uploadWaiting').html('There are multiple images uploaded!').attr('class', 'alert alert-danger');
                    $('#mp3status').html('<i class="bi bi-exclamation-circle-fill"></i> Delete one of the images').attr('class', 'alert alert-danger');
                    $('#imagestatus').html('').attr('class', '');
                    break;
                case '4': //Two images have been uploaded but no MP3 - show image combine div
                    form_inactive();
                    $('#uploadWaiting').html('Waiting for you to upload <strong>Audio</strong>...').attr('class', 'alert alert-danger');
                    $('#mp3status').html('<i class="bi bi-exclamation-circle-fill"></i> Audio not uploaded').attr('class', 'alert alert-danger');
                    $('#imagestatus').html('<i class="bi bi-check2"></i> Image uploaded').attr('class', 'alert alert-success');
                    $(".file_select").show();
                    $('#imageCombine').show();
                    //Try to combine automatically
                    combineImages($('#location').val());
                    break;
                case '5': //This is a multiple image upload - show image combine div
                    form_inactive();
                    $('#mp3status').html('').removeClass();
                    $('#imagestatus').html('').removeClass();
                    $('#uploadWaiting').html('Waiting for you to combine images (or delete one)...').attr('class', 'alert alert-danger');
                    $(".file_select").show();
                    $('#imageCombine').show();
                    //Try to combine automatically
                    combineImages($('#location').val());
                    break;
                case '20': //An MP4 has been uploaded in batch upload mode
                    $('#uploadWaiting').hide();
                    $('#spinner').hide();
                    $('#createVideoButton').prop('disabled', false);
                    $('#createVideoButton').html('Send MP4 Files to YouTube');
                    $('#hidden_file_upload_label_button').attr("disabled", true);
                    $('#mp3status').html('').removeClass();
                    $('#imagestatus').html('').removeClass();
                    var autoSubmitIsChecked = $('input[name="auto_submit"]:checked').length > 0;
                    if (autoSubmitIsChecked == true) {
                        EncodeAndUpload();
                        $('input[name=auto_submit]').attr('checked', false);
                    }
                    $('#autoSubmitDiv').hide();
                    $('#imageCombine').hide();
                    break;
                default:
                    log_error(data, "shouldn't hit this - uploadPoll");
                    break;
            }
        }
    });
};
function form_inactive() {
    $('#uploadWaiting').show();
    $('#createVideoButton').prop('disabled', true);
    $('#file_upload_label_button').html('Upload Files');
    $('#spinner').show();
    $('#url_download').show();
    $('#autoSubmitDiv').show();
    $('#hidden_file_upload_label_button').attr("disabled", false);
    var mode = getParameterByName('mode');
    if (mode == 'makinItMag') {
        $('#textImageColour').val('makinItMag');
        $('#textImageFont').hide();
        $('#textImageFontSize').hide();
        $('#videoHeight').hide();
        $('#youtubeCategoryID').hide();
        $('#connectDriveAccount').hide();
        $('#watermark_dummy').hide();
        $('#autoSubmitDiv').hide();
    }
}
function combineImages(location) {
    $('#imageCombineErrors').hide();
    var backgroundImage = "";
    var foregroundImage = "";
    var selected = [];
    $('.files input:checked').each(function () {
        selected.push($(this).attr('value'));
    });
    if (selected.length === 0) { //they have not selected a foreground, but they might have a background image saved to automatically combine
        for (i = 0; i < $('.files input').length; i++) {
            if ($('.files input:checkbox').get(i).value.toLowerCase().indexOf("background") != -1) {
                var backgroundImage = $('.files input:checkbox').get(i).value;
            } else {
                if ($('.files input:checkbox').get(i).value.toLowerCase() != 'watermark.jpg') {
                    if (($('.files input:checkbox').get(i).value.toLowerCase().indexOf("jpg") != -1) || ($('.files input:checkbox').get(i).value.toLowerCase().indexOf("png") != -1)) {
                        var foregroundImage = $('.files input:checkbox').get(i).value;
                    }
                }
            }
        }
        if (backgroundImage == "") { //there is no image with the word background in, and they have not selected a foreground image, so display an error
            $('#imageCombineErrors').show().html('<i class="bi bi-exclamation-circle-fill"></i> Please select a foreground image').attr('class', 'alert alert-warning');
            return;
        }
    }
    if (selected.length > 1) { //they have selected more than one foreground images
        $('#imageCombineErrors').show().html('<i class="bi bi-exclamation-circle-fill"></i> You have selected multiple foreground images!').attr('class', 'alert alert-danger');
        return;
    }
    if (selected.length === 1) { //they have just selected one foreground image, find it and the background image
        for (i = 0; i < $('.files input').length; i++) {
            if ($('.files input:checkbox').get(i).checked == false) {
                var backgroundImage = $('.files input:checkbox').get(i).value;
            } else {
                var foregroundImage = $('.files input:checkbox').get(i).value;
            }
        }
    }
    if ((foregroundImage != "") && (backgroundImage != "")) {
        myurl = "/combineImages.php?foregroundImage=" + encodeURIComponent(foregroundImage) + "&location=" + location + "&backgroundImage=" + encodeURIComponent(backgroundImage);
        $.ajax({
            type: "GET",
            async: true,
            url: myurl,
            success: function (data) {
                if (data === 0) {
                    $('#imageCombineErrors').show().html('<i class="bi bi-exclamation-circle-fill"></i> Sorry, there has been an error').attr('class', 'alert alert-danger');
                    return;
                }
                //$('#imageCombineErrors').show().html('<i class="bi bi-exclamation-circle-fill"></i> ' + data).attr('class', 'alert alert-success');
                $('#imageCombine').hide();
                reloadUploads();
            }
        });
    }
}
function addbyurl(custom_url, myid, batch) {
    if (batch === "undefined") {
        batch = "false";
    }
    if (typeof custom_url === "undefined") {
        var ks = $('#url').val().split("\n");
        if (ks.length > 50) {
            response = 'Please make sure you paste no more than 50 links at a time.';
            $('#mp3_url_error').show().html(response).attr('class', 'alert alert-danger');;
            return false;
        }
    } else { //probably Google Drive Download
        var ks = custom_url.split("\n");
        if (batch === "false") {
            var addDriveLinkToDescription = $('input[name="addDriveLinkToDescription"]:checked').length > 0;
            if (addDriveLinkToDescription == true) {
                if ($('#description').val() == 'Description') {
                    $('#description').val('');
                }
                if (typeof (myid) != 'undefined') {
                    $('#description').val('https://drive.google.com/uc?export=download&id=' + myid + "\n" + $('#description').val()); //add URL to Description
                }
            }
        }
    }
    $.each(ks, function (k) {
        var url = ks[k];
        $('#mp3_url_error').hide();
        if (url === "") {
            response = 'Enter a URL for the image or Audio file in the box above';
            $('#mp3_url_error').show().html(response).attr('class', 'alert alert-danger');
            return false;
        }
        $('#mp3status').html('<i class="bi bi-check2"></i> Downloading...').attr('class', 'alert alert-info');
        $('#url_download_button').html('<i class="bi bi-upload"></i> Downloading').attr('disabled', 'disabled');
        var previousMessage = $('#uploadWaiting').html();
        $('#spinner').hide();
        $.ajax({
            type: "GET",
            async: true,
            url: "/addFileByURL.php?url=" + encodeURIComponent(url),
            success: function (data) {
                var next_url = ks[k + 1];
                if (next_url !== undefined) {
                    $('#url_download_button').html('<i class="bi bi-upload"></i> Downloading').attr('disabled', 'disabled');
                }
                var json = data;
                if (data !== "") {
                    obj = JSON && JSON.parse(json) || $.parseJSON(json);
                    mydata = obj.message;
                } else {
                    mydata = "";
                }
                switch (mydata) {
                    case "OK":
                        $('#mp3status').html('').removeClass();
                        reloadUploads('add');
                        $('#mp3_url_error').show().html('Download successful - Speed: ' + obj.speed + ' KiB/s').attr('class', 'alert alert-success');
                        if (obj.myfilename.indexOf(".mp3") > 0) {
                            if (document.getElementById('VideoTitle').value === '') {
                                document.getElementById('VideoTitle').value = obj.myfilename.replace(/.mp3/gi, "").replace(/.wav/gi, "").replace(/.flac/gi, "").replace(/.m4a/gi, "");
                            }
                            if ($('#TextImageTitle').length > 0) {
                                if (document.getElementById('TextImageTitle').value === '') {
                                    document.getElementById('TextImageTitle').value = obj.myfilename.replace(/.mp3/gi, "").replace(/.wav/gi, "").replace(/.flac/gi, "").replace(/.m4a/gi, "");
                                }
                            }
                        }
                        break;
                    default:
                        reloadUploads();
                        $('#uploadWaiting').html(previousMessage);
                        $('#mp3_url_error').show().html(obj.message);
                }
                $('#url_download_button').html('<i class="bi bi-upload"></i> Download').removeAttr('disabled');
            }
        });
    });
}
function log_error(error, page) {
    $.ajax({
        type: "GET",
        async: true,
        url: "/js_error_log.php?error=" + encodeURIComponent(error) + "&page=" + encodeURIComponent(page),
        success: function (data) {
        }
    });
}
function addfromsoundcloud(trackId, filepath, artwork_url, title, stream_url) {
    $('#soundcloud_error').hide();
    $('#url_download_button').html('<i class="bi bi-upload"></i> Downloading').attr('disabled', 'disabled');
    $('#mp3status').html('<i class="bi bi-check2"></i> Downloading...').attr('class', 'alert alert-info');
    $.ajax({
        url: "/soundcloud_functions.php",
        type: "POST",
        data: { cmd: "download", trackId: encodeURIComponent(trackId), filepath: encodeURIComponent(filepath), stream_url: stream_url},
        
        success: function (data) {
            json = $.parseJSON(data);
            switch (json.message) {
                case "OK":
                    var download_sc_artwork = $('input[name="download_sc_artwork"]:checked').length > 0;
                    if (download_sc_artwork == true) {
                        if (artwork_url != "") {
                            addbyurl(artwork_url); //download artwork
                        } else {
                            alert("There is no artwork for this SoundCloud sound.");
                        }
                    }
                    reloadUploads('add');
                    $('#soundcloud_error').show().html('Download successful').attr('class', 'alert alert-success');
                    //var filename = filepath.replace(/^.*[\\\/]/, '');
                    //filename = filename.replace('.mp3','');
                    title = title.replace('.mp3', '');
                    title = title.replace('`', "'"); //used ¬ character for a single quote
                    if (document.getElementById('VideoTitle').value === '') {
                        document.getElementById('VideoTitle').value = title;
                    }
                    if ($('#TextImageTitle').length > 0) {
                        if (document.getElementById('TextImageTitle').value === '') {
                            document.getElementById('TextImageTitle').value = title;
                        }
                    }

                    var b = $('#hidden_batch_mode_indicator').val();
                    if (b != 'batch') {
                        document.getElementById('description').value = (document.getElementById('description').value + " " + json.soundcloud_description).trim();
                    }
                    break;
                default:
                    reloadUploads();
                    $('#soundcloud_error').show().html('Error ' + data).attr('class', 'alert alert-danger');
            }
            $('#url_download_button').html('<i class="bi bi-upload"></i> Download').removeAttr('disabled');
        }
    });
}
function reloadUploads(addOrDelete) {
    $.getJSON($('#file_upload').fileUploadUIX('option', 'url'), function (files) {
        var options = $('#file_upload').fileUploadUIX('option');
        $('.file_download_template').remove();
        if (files !== null) {
            if (files.length == 0) {
                $('#delete_uploaded_files').hide();
            } else {
                $('#delete_uploaded_files').show();
            }
            if (addOrDelete == "add") {
                options.adjustMaxNumberOfFiles(-files.length);
            } else {
                options.adjustMaxNumberOfFiles(+files.length);
            }
            $.each(files, function (index, file) {
                options.buildDownloadRow(file, options)
                    .appendTo(options.downloadTable).fadeIn();
            });
        } else {
            $('#delete_uploaded_files').hide();
        }
    });
    uploadPoll();
}
function createTextImage() {
    var mode = getParameterByName('mode');
    mode = typeof mode !== 'undefined' ? mode : ''; //make the default mode nothing
    switch (mode) {
        case 'makinItMag': //Use Artist and title
            var myText = encodeURIComponent(document.getElementById('VideoArtist').value + ' - ' + document.getElementById('VideoTitle').value);
            break;
        default:
            var myText = encodeURIComponent(document.getElementById('TextImageTitle').value);
            break;
    }
    $('#textImage_error').hide();
    if (document.getElementById('videoHeight') === null) {
        height = 720;
    } else {
        height = document.getElementById('videoHeight').value;
    }
    $.ajax({
        type: "GET",
        async: true,
        url: "/createTextImage.php?height=" + height + "&background_colour=" + document.getElementById('textImageColour').value + "&text=" + myText + "&font=" + document.getElementById('textImageFont').value + "&font_size=" + document.getElementById('textImageFontSize').value + "&vertical_align=" + document.getElementById('textImageVerticalAlignment').value,
        success: function (data) {
            switch (data) {
                case "OK":
                    reloadUploads('add');
                    if (myText != "") {
                        $('#textImage_error').show().html('Image creation successful').attr('class', 'alert alert-success');
                    } else {
                        $('#textImage_error').show().html('An image was created but there was no text entered').attr('class', 'alert alert-warning');
                    }
                    break;
                default:
                    reloadUploads();
                    $('#textImage_error').show().html('Error ' + data).attr('class', 'alert alert-danger');
            }
        }
    });
}
function basename(path) {
    return path.split('/').reverse()[0];
}
function blur_background() {
    var $image_file_name = "";
    $('#image_options_waiting_spinner').removeClass('d-none'); //show spinner
    $('#ImageOptions_error').hide(); //hide previous errors
    $('.file_download_preview a').each(function (i, ele) {
        $image_file_name = basename(ele.href);
        console.log($image_file_name);
    });
    if ($image_file_name == "") {
        $('#ImageOptions_error').show().html('No image uploaded!').attr('class', 'alert alert-danger');
        $('#image_options_waiting_spinner').addClass('d-none'); //remove spinner
        return false;
    }
    if (document.getElementById("watermark").checked == true) {
        $watermark = "true";
    } else {
        $watermark = "false"
    }
    $video_height = document.getElementById('videoHeight').value;
    $background_colour = document.getElementById("background_colour").value;
    $.ajax({
        type: "GET",
        async: true,
        url: "/blur_background.php?image_file=" + $image_file_name + "&video_height=" + $video_height + "&background_colour=" + encodeURIComponent($background_colour) + "&watermark=" + $watermark,
        success: function (data) {
            $('#image_options_waiting_spinner').addClass('d-none'); //remove spinner
            switch (data) {
                case "OK":
                    reloadUploads();
                    $('#ImageOptions_error').show().html('Image creation successful').attr('class', 'alert alert-success');
                    break;
                default:
                    reloadUploads();
                    $('#ImageOptions_error').show().html('Error ' + data).attr('class', 'alert alert-danger');
            }
        }
    });
}
