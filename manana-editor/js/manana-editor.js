let MananaEditor = function (objEditorElement, options) {
    // return editor content
    this.getData = function () {
        return objEditor.innerHTML;
    };

    /**
     * insertNode
     *
     * @param {Element} objElement
     */
    this.insertNode = function (objElement) {
        let objSelection, objRange;
        if (window.getSelection && (objSelection = window.getSelection()).rangeCount) {
            // remove br
            if (objSelection.anchorNode.childNodes.length === 1) {
                objSelection.anchorNode.childNodes.forEach(value => {
                    if (value.nodeName === 'BR') {
                        objSelection.anchorNode.removeChild(value);
                    }
                });
            }

            objRange = objSelection.getRangeAt(0);
            objRange.collapse(true);
            objRange.insertNode(objElement);

            objRange.setStartAfter(objElement);
            objRange.collapse(true);
            objSelection.removeAllRanges();
            objSelection.addRange(objRange);
        } else {
            document.execCommand('insertHTML', null, objElement.outerHTML);
        }
    };

    // insert New Line (Element)
    this.insertNodeNewLine = function () {
        let objSelection, objRange;
        if (window.getSelection && (objSelection = window.getSelection()).rangeCount) {
            let objBR = document.createElement('br');

            let objChild = objSelection.anchorNode;
            while (objChild.parentElement.className !== 'manana-editor') {
                objChild = objChild.parentNode;
            }

            if (objChild.nodeType === 3) {
                // #text
                this.insertNode(objBR);
            } else {
                // p or div
                let objNL = objChild.cloneNode();
                objNL.appendChild(objBR);
                objChild.parentNode.insertBefore(objNL, objChild.nextSibling);

                objRange = document.createRange();
                objRange.selectNodeContents(objNL);
                objRange.collapse(false);
                objSelection.removeAllRanges();
                objSelection.addRange(objRange);
            }
        } else {
            // document.execCommand('insertHTML', false, '<br>');
        }
    };

    // set editor focus
    this.setCursor = function () {
        if (window.getSelection) {
            let objSelection = document.getSelection();

            if (
                objSelection.focusNode === null
                || (
                    objSelection.getRangeAt(0).startContainer.parentNode !== objEditor
                    && document.activeElement !== objEditor
                )
            ) {
                objEditor.focus();

                let objRange = document.createRange();
                objRange.selectNodeContents(objEditor.lastChild);
                objRange.collapse(false);
                objSelection.removeAllRanges();
                objSelection.addRange(objRange);
            }
        } else {
            //
        }
    };

    /**
     * setCurtain
     *
     * show curtain
     */
    this.setCurtain = function () {
        let objCurtain = document.createElement('div');
        objCurtain.className = 'manana-editor-curtain';
        objEditorWrap.appendChild(objCurtain);
    };

    /**
     * delCurtain
     *
     * delete curtain
     */
    this.delCurtain = function () {
        let objCurtain = objEditorWrap.querySelector('.manana-editor-curtain');
        if (objCurtain !== null) {
            objCurtain.remove();
        }
    };

    this.deepMerge = function (target, source) {
        const isObject = (obj) => obj && typeof obj === 'object';

        if (typeof target !== 'undefined' && typeof source === 'undefined') {
            return target;
        } else if (!isObject(target) || !isObject(source)) {
            return source;
        }

        Object.keys(source).forEach(key => {
            const targetValue = target[key];
            const sourceValue = source[key];

            if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
                target[key] = sourceValue;
            } else if (isObject(targetValue) && isObject(sourceValue)) {
                target[key] = this.deepMerge(Object.assign({}, targetValue), sourceValue);
            } else {
                target[key] = sourceValue;
            }
        });

        return target;
    };

    if (objEditorElement === null) {
        console.log('Check Editor Element');
        return false;
    }

    this.options = this.deepMerge({
        toolbar: ['uploadFile', 'uploadImage', 'uploadAudio', 'uploadVideo'],
        plugins: {},
    }, options);

    // auto submit catch and insert data
    let objForm = objEditorElement.closest('form');
    if (objForm !== null) {
        objForm.addEventListener('submit', event => {
            objEditorElement.innerHTML = this.getData();
        });
    }

    // disable original element
    objEditorElement.style.display = 'none';

    let objEditorWrap = document.createElement('div');
    objEditorWrap.className = 'manana-editor-wrap';

    let objEditor = document.createElement('div');
    objEditor.className = 'manana-editor';
    objEditor.contentEditable = 'true';
    // objEditor.innerHTML = objEditorElement.innerHTML;

    if (objEditorElement.innerHTML !== '')
    {
        let objTemplate = document.createElement('template');
        objTemplate.innerHTML = objEditorElement.innerHTML
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, '\'')
        ;
        objEditor.appendChild(objTemplate.content);
    }

    // set objEditor this functions and this objects
    for (let item in this) {
        if (typeof this[item] === 'function' || typeof this[item] === 'object') {
            objEditor[item] = this[item];
        }
    }

    // set plugin
    for (let key in MananaEditor._registerPlugin) {
        this.options.plugins[key] = new MananaEditor._registerPlugin[key](objEditor, this.options.plugins[key]);
    }

    // set toolbar
    if (typeof this.options.toolbar === 'object') {
        let objEditorToolbar = document.createElement('ul');
        objEditorToolbar.className = 'manana-editor-toolbar';

        for (let i = 0; i < this.options.toolbar.length; i++) {
            let objLi = document.createElement('li');
            objLi.appendChild(this.options.plugins[this.options.toolbar[i]].iconElement);
            objEditorToolbar.appendChild(objLi);
        }

        objEditorWrap.className += ' manana-editor-toolbar';
        objEditorWrap.appendChild(objEditorToolbar);
    }

    objEditorWrap.appendChild(objEditor);
    objEditorElement.after(objEditorWrap);
    return this;
};

MananaEditor._registerPlugin = {};
MananaEditor.registerPlugin = function (strPluginName, funFunction) {
    MananaEditor._registerPlugin[strPluginName] = funFunction;
};
