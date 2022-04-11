if (typeof MananaEditor === 'function') {
    MananaEditor.registerPlugin('uploadFile', function (objEditor, options) {
        this.options = objEditor.deepMerge({
            icon: '<button type="button"><i class="far fa-file fa-fw"></i></button>',
            mode: 'base64',
            accept: '*/*',
            uploadURL: null,
            insertNode: {
                _tag: function (objEditor, objFile, objResponse) {
                    if (typeof objResponse.src === 'undefined' || !objResponse.src) {
                        console.log('Not Data: objResponse.src');
                        return false;
                    }

                    let objA = document.createElement('a');
                    objA.href = objResponse.src;
                    objA.innerText = objResponse.name?objResponse.name:objFile.name;
                    objA.download = objResponse.name?objResponse.name:objFile.name;

                    objEditor.insertNode(objA);
                    objEditor.insertNodeNewLine();
                },

                base64: async function (objEditor, objFile) {
                    let objPromise = await new Promise((resolve) => {
                        let objFileReader = new FileReader();
                        objFileReader.onload = () => {
                            resolve(objFileReader.result.toString());
                        };
                        objFileReader.readAsDataURL(objFile);
                    });

                    return {
                        src: objPromise
                    };
                },

                server: async function (objEditor, objFile) {
                    if (objEditor.options.plugins['uploadFile'].uploadURL === null) {
                        console.log('Not Data: objEditor.options.plugins[\'uploadFile\'].uploadURL');
                        return false;
                    }

                    let objFormData = new FormData();
                    objFormData.append('file', objFile);

                    return await fetch(objEditor.options.plugins['uploadFile'].uploadURL, {
                        method: 'POST',
                        body: objFormData,
                    }).then((response) => {
                        if (response.ok) {
                            return response.json();
                        }
                    }).then((json) => {
                        if (
                            typeof json.status === 'boolean'
                            && typeof json.message === 'string'
                            && json.status === false
                        ) {
                            alert(json.message);
                        } else if (typeof json.src === 'undefined' || !json.src) {
                            console.log('Not Data: json.src');
                            return false;
                        }

                        return json;
                    });
                },

                s3: async function (objEditor, objFile) {
                    if (objEditor.options.plugins['uploadFile'].uploadURL === null) {
                        console.log('Not Data: objEditor.options.plugins[\'uploadFile\'].uploadURL');
                        return false;
                    }

                    let strBody = '';
                    strBody += '&file[name]=' + objFile.name;
                    strBody += '&file[size]=' + objFile.size;
                    strBody += '&file[type]=' + objFile.type;
                    strBody += '&file[lastModified]=' + objFile.lastModified;

                    return await fetch(objEditor.options.plugins['uploadFile'].uploadURL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: strBody.substring(1),
                    }).then((response) => {
                        return response.json();
                    }).then(async (json) => {
                        if (
                            typeof json.status === 'boolean'
                            && typeof json.message === 'string'
                            && json.status === false
                        ) {
                            alert(json.message);
                        } else if (typeof json.url === 'undefined' || !json.url) {
                            console.log('Not Data: json.url');
                            return false;
                        } else if (typeof json.src === 'undefined' || !json.src) {
                            console.log('Not Data: json.src');
                            return false;
                        }

                        return await fetch(json.url, {
                            method: 'PUT',
                            body: objFile,
                        }).then((response) => {
                            if (response.ok) {
                                return json;
                            }

                            return false;
                        });
                    });
                },
            },
        }, options);

        let objTemplate = document.createElement('template');
        objTemplate.innerHTML = this.options.icon;
        this.options.iconElement = objTemplate.content.firstChild;
        this.options.iconElement.addEventListener('click', event => {
            objEditor.setCursor();

            let objInputFile = objEditor.closest('.manana-editor-wrap').querySelector('input[type="file"]');
            if (objInputFile !== null) {
                objInputFile.remove();
            }

            objInputFile = document.createElement('input');
            objInputFile.type = 'file';
            objInputFile.accept = this.options.accept;
            objInputFile.style.display = 'none';
            objInputFile.multiple = true;

            objInputFile.mode = this.options.mode;
            objInputFile.addEventListener('change', function (event) {
                objEditor.setCurtain();

                if (this.files && this.files.length > 0) {
                    (async () => {
                        let strMode = objEditor.options.plugins['uploadFile'].mode;
                        for await (let i = 0; i < this.files.length; i++) {
                            let objResponse = await objEditor.options.plugins['uploadFile'].insertNode[strMode](objEditor, this.files[i]);
                            if (typeof objResponse.src === 'string') {
                                objEditor.options.plugins['uploadFile'].insertNode['_tag'](objEditor, this.files[i], objResponse);
                            }
                        }

                        objEditor.delCurtain();
                    })();
                }

                event.target.remove();
            });

            objEditor.after(objInputFile);
            objInputFile.click();
        });

        return this.options;
    });
}
