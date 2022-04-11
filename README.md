# MananaEditor
I needed an editor that can only attach files, so I made my own.  
I'm a PHP developer, so there may be some weird javascript code.

## Demo
[https://manana.kr/editor](https://manana.kr/editor)

## CDN
I'm Use [BunnyCDN](https://bunny.net).

```html
<link type="text/css" rel="stylesheet" href="https://cdn.manana.kr/assets/manana-editor/css/manana-editor.min.css">

<script type="text/javascript" charset="UTF-8" src="https://cdn.manana.kr/assets/manana-editor/js/manana-editor.min.js"></script>
<script type="text/javascript" charset="UTF-8" src="https://cdn.manana.kr/assets/manana-editor/plugins/line-break/line-break.min.js"></script>
<script type="text/javascript" charset="UTF-8" src="https://cdn.manana.kr/assets/manana-editor/plugins/upload-file/upload-file.min.js"></script>
<script type="text/javascript" charset="UTF-8" src="https://cdn.manana.kr/assets/manana-editor/plugins/upload-image/upload-image.min.js"></script>
<script type="text/javascript" charset="UTF-8" src="https://cdn.manana.kr/assets/manana-editor/plugins/upload-audio/upload-audio.min.js"></script>
<script type="text/javascript" charset="UTF-8" src="https://cdn.manana.kr/assets/manana-editor/plugins/upload-video/upload-video.min.js"></script>
<script type="text/javascript" charset="UTF-8" src="https://cdn.manana.kr/assets/manana-editor/plugins/embed/embed.min.js"></script>
<script type="text/javascript" charset="UTF-8" src="https://cdn.manana.kr/assets/manana-editor/plugins/paste/paste.js"></script>
```

## Use
### Default
```html
<div class="form-group">
    <label for="editor">Manana Editor</label>
    <textarea id="editor" name="editor"></textarea>
</div>

<ul class="list-inline text-right">
    <li class="list-inline-item">
        <button type="submit" class="btn btn-outline-primary">Submit</button>
    </li>
</ul>

<script type="text/javascript">
let objEditor = new MananaEditor(document.getElementById('editor'), {});
</script>
```

### Custom Toolbar
#### Default
```html
<script type="text/javascript">
let objEditor = new MananaEditor(document.getElementById('editor'), {
    toolbar: ['uploadFile', 'uploadImage', 'uploadAudio', 'uploadVideo'],
});
</script>
```

#### Not Use
```html
<script type="text/javascript">
let objEditor = new MananaEditor(document.getElementById('editor'), {
    toolbar: [],
});
</script>
```

### File Upload
```php
// editor send PHP Server Variable $_POST['file'];
/**
 * @var ?array{name: string, size: string, type: string, lastModified: string} $fileData
 */
$fileData = $_POST['file'];
```

#### Base64 (default)
```html
<script type="text/javascript">
let strEditorMode = 'base64';

let objEditor = new MananaEditor(document.getElementById('editor'), {
    toolbar: [
        'uploadFile',
        'uploadImage',
        'uploadAudio',
        'uploadVideo',
    ],
    plugins: {
        paste: {
            image: {
                mode: strEditorMode,
            },
        },
        uploadFile: {
            mode: strEditorMode,
            accept: 'application/zip',
        },
        uploadImage: {
            mode: strEditorMode,
            accept: 'image/*',
        },
        uploadAudio: {
            mode: strEditorMode,
            accept: 'audio/wav,audio/mp3',
        },
        uploadVideo: {
            mode: strEditorMode,
            accept: 'video/mp4',
        },
    },
});
</script>
```

#### Server
```html
<script type="text/javascript">
let strEditorMode = 'server';
let strEditorUploadURL = '{Your Upload Server URL}';

let objEditor = new MananaEditor(document.getElementById('editor'), {
    toolbar: [
        'uploadFile',
        'uploadImage',
        'uploadAudio',
        'uploadVideo',
    ],
    plugins: {
        paste: {
            image: {
                mode: strEditorMode,
                uploadURL: strEditorUploadURL,
            },
        },
        uploadFile: {
            mode: strEditorMode,
            accept: 'application/zip',
            uploadURL: strEditorUploadURL,
        },
        uploadImage: {
            mode: strEditorMode,
            accept: 'image/*',
            uploadURL: strEditorUploadURL,
        },
        uploadAudio: {
            mode: strEditorMode,
            accept: 'audio/wav,audio/mp3',
            uploadURL: strEditorUploadURL,
        },
        uploadVideo: {
            mode: strEditorMode,
            accept: 'video/mp4',
            uploadURL: strEditorUploadURL,
        },
    },
});
</script>
```

```php
<?php
// This File: let strEditorUploadURL = '{Your Upload Server URL}';
...
{Your File Upload Code}
...

// fail
echo json_encode([
    'status'    => false,
    'message'   => '{Your Alert Message}',
]);

// success
echo json_encode([
    'src'   => '{Your File URL}',
]);
```

#### S3
```html
<script type="text/javascript">
let strEditorMode = 's3';
let strEditorUploadURL = '{Your Upload Server URL}';

let objEditor = new MananaEditor(document.getElementById('editor'), {
    toolbar: [
        'uploadFile',
        'uploadImage',
        'uploadAudio',
        'uploadVideo',
    ],
    plugins: {
        paste: {
            image: {
                mode: strEditorMode,
                uploadURL: strEditorUploadURL,
            },
        },
        uploadFile: {
            mode: strEditorMode,
            accept: 'application/zip',
            uploadURL: strEditorUploadURL,
        },
        uploadImage: {
            mode: strEditorMode,
            accept: 'image/*',
            uploadURL: strEditorUploadURL,
        },
        uploadAudio: {
            mode: strEditorMode,
            accept: 'audio/wav,audio/mp3',
            uploadURL: strEditorUploadURL,
        },
        uploadVideo: {
            mode: strEditorMode,
            accept: 'video/mp4',
            uploadURL: strEditorUploadURL,
        },
    },
});
</script>
```

```php
<?php
// This File: let strEditorUploadURL = '{Your Upload Server URL}';
...
{Your File DB Insert Code}
...

// fail
echo json_encode([
    'status'    => false,
    'message'   => '{Your Alert Message}',
]);

// success
if (isset($_POST['file']))
{
    /**
     * @var ?array{name: string, size: string, type: string, lastModified: string} $fileData
     */
    $fileData = $_POST['file'];

    require_once {Your AWS S3 Library};
    $s3Client = new \Aws\S3\S3Client([
        'endpoint'      => '{Your S3 URL}',
        'region'        => '{Your S3 Region}',
        'version'       => 'latest',
        'credentials'   => [
            'key'       => '{Your S3 API Key}',
            'secret'    => '{Your S3 API Secret}'
        ]
    ]);

    $cmd = $s3Client->getCommand('PutObject', [
        'Bucket'    => '{Your S3 Bucket}',
        'Key'       => '{Your S3 File Name}',

        'ContentType'   => $fileData['type'],
        'Body'          => '',
    ]);

    echo json_encode([
        'url'   => (string) $s3Client->createPresignedRequest($cmd, '+1 minutes')->getUri(),
        'src'   => {Your File URL},
    ]);
}
```
