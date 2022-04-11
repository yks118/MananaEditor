if (typeof MananaEditor === 'function') {
    MananaEditor.registerPlugin('paste', function (objEditor, options) {
        this.options = objEditor.deepMerge({
            image: {
                mode: 'base64',
                uploadURL: null,
                insertNode: {
                    _imageTag: function (objEditor, objFile, objResponse) {
                        if (typeof objResponse.src === 'undefined' || !objResponse.src) {
                            console.log('Not Data: objResponse.src');
                            return false;
                        }

                        let objPicture = document.createElement('picture');

                        // HTML5
                        let objSource = document.createElement('source');
                        objSource.srcset = objResponse.src;
                        objSource.type = objResponse.type?objResponse.type:objFile.type;

                        // no HTML5
                        let objImg = document.createElement('img');
                        objImg.alt = objResponse.name?objResponse.name:objFile.name;
                        objImg.src = objResponse.src;

                        objPicture.appendChild(objSource);
                        objPicture.appendChild(objImg);

                        objEditor.insertNode(objPicture);
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
                        if (objEditor.options.plugins['paste'].image.uploadURL === null) {
                            console.log('Not Data: objEditor.options.plugins[\'paste\'].image.uploadURL');
                            return false;
                        }

                        let objFormData = new FormData();
                        objFormData.append('file', objFile);

                        return await fetch(objEditor.options.plugins['paste'].image.uploadURL, {
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
                        if (objEditor.options.plugins['paste'].image.uploadURL === null) {
                            console.log('Not Data: objEditor.options.plugins[\'paste\'].image.uploadURL');
                            return false;
                        }

                        let strBody = '';
                        strBody += '&file[name]=' + objFile.name;
                        strBody += '&file[size]=' + objFile.size;
                        strBody += '&file[type]=' + objFile.type;
                        strBody += '&file[lastModified]=' + objFile.lastModified;

                        return await fetch(objEditor.options.plugins['paste'].image.uploadURL, {
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
            },
        }, options);

        // Ctrl + v
        objEditor.addEventListener('paste', event => {
            event.preventDefault();

            let pastedData = event.clipboardData;
            if (pastedData.types.indexOf('Files') !== -1) {
                if (pastedData.files[0].type === 'image/png') {
                    if (
                        pastedData.types.indexOf('text/plain') === -1
                        && pastedData.types.indexOf('text/html') !== -1
                    ) {
                        // image?
                        let strHTML = pastedData.getData('text/html');

                        let objTemplate = document.createElement('template');
                        objTemplate.innerHTML = strHTML;
                        objEditor.insertNode(objTemplate.content.childNodes[2]);
                    } else {
                        // excel
                        objEditor.setCurtain();

                        (async () => {
                            let objFile = pastedData.files[0];
                            let objResponse = await objEditor
                                .options
                                .plugins['paste']
                                .image
                                .insertNode[objEditor.options.plugins['paste'].image.mode](objEditor, objFile)
                            ;
                            if (typeof objResponse.src === 'string') {
                                objEditor.options.plugins['paste'].image.insertNode['_imageTag'](objEditor, objFile, objResponse);
                            }

                            objEditor.delCurtain();
                        })();
                    }
                }
            } else if (pastedData.types.indexOf('text/plain') !== -1) {
                let strText = pastedData.getData('text/plain');
                // set Auto Link
                strText = strText.replace(/(https?:\/\/\S+)/, '<a rel="noopener noreferrer" target="_blank" href="$1">$1</a>');

                let objTemplate = document.createElement('template');
                objTemplate.innerHTML = strText;
                objEditor.insertNode(objTemplate.content.firstChild);
            }
        });

        return this.options;
    });
}
