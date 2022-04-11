if (typeof MananaEditor === 'function') {
    MananaEditor.registerPlugin('lineBreak', function (objEditor, options) {
        this.options = objEditor.deepMerge({
            mode: 'p',
            insertNode: {
                br: function (objEditor) {
                    objEditor._lineBreakObjBR = document.createElement('br');

                    objEditor._lineBreakAddBR = function (objEditor) {
                        if (objEditor.lastChild === null || objEditor.lastChild.tagName !== 'BR') {
                            objEditor.appendChild(objEditor._lineBreakObjBR.cloneNode(true));
                        }
                    };

                    objEditor.addEventListener('keydown', event => {
                        if (event.key === 'Enter') {
                            event.preventDefault();

                            objEditor.insertNode(objEditor._lineBreakObjBR.cloneNode(true));
                        }
                    });

                    objEditor._lineBreakAddBR(objEditor);
                },
                p: function (objEditor) {
                    if (objEditor.childNodes.length > 0) {
                        // replace text node -> p node
                        for (let i = 0; i < objEditor.childNodes.length; i++) {
                            if (objEditor.childNodes[i].tagName === undefined) {
                                let objP = document.createElement('p');
                                objP.innerHTML = objEditor.childNodes[i].nodeValue;
                                objEditor.replaceChild(objP, objEditor.childNodes[i]);
                            }
                        }
                    } else {
                        let objP = document.createElement('p');
                        let objBR = document.createElement('br');
                        objP.appendChild(objBR);
                        objEditor.appendChild(objP);
                    }

                    objEditor.addEventListener('keydown', event => {
                        if (event.key === 'Backspace' || event.key === 'Delete') {
                            if (objEditor.innerHTML === '<p><br></p>') {
                                event.preventDefault();
                            }
                        }
                    });
                },
            },
        }, options);

        if (typeof this.options.insertNode[this.options.mode] === 'function') {
            this.options.insertNode[this.options.mode](objEditor);
        } else {
            console.log('Error: Not Found ' + this.options.mode);
        }

        return this.options;
    });
}
