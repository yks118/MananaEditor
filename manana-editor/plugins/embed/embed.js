if (typeof MananaEditor === 'function') {
    MananaEditor.registerPlugin('embed', function (objEditor, options) {
        this.options = objEditor.deepMerge({
            regex: {
                YouTube: [
                    /^https:\/\/(www\.)?youtube\.com\/watch\?v=(?<id>[^& ]+)/i,
                    /^https:\/\/(www\.)?youtube\.be\/(?<id>[^& ]+)/i,
                ],
                Vimeo: [
                    /^https:\/\/(www\.)?vimeo\.com\/(?<id>[0-9]+)/i,
                ],
                Twitch: [
                    /^https:\/\/(www\.)?twitch\.tv\/[^\/]+\/video\/(?<videoID>[0-9]+)/i,
                    /^https:\/\/(www\.)?twitch\.tv\/videos\/(?<videoID>[0-9]+)/i,
                    /^https:\/\/(www\.)?twitch\.tv\/collections\/(?<collectionID>[^\/]+)/i,
                    /^https:\/\/(www\.)?twitch\.tv\/(?<channelID>[^\/]+)/i,
                ],

                Twitter: [
                    /^https:\/\/(www\.|mobile\.)?twitter\.com\/(?<username>[^\/]+)\/status\/(?<tweetID>[0-9]+)\/?\??/i,
                ],
                Facebook: [
                    /^(?<url>https:\/\/(www\.)?facebook\.com\/[^\/]+\/posts\/[0-9]+)\/?\??/i,
                ],
                Instagram: [
                    /^(?<url>https:\/\/(www\.)?instagram\.com\/p\/[a-zA-Z0-9]+)\/?\??/i,
                ],
            },
            insertNode: {
                /**
                 * YouTube
                 * @param {{
                 *     id: String,
                 * }} matches
                 * @return {HTMLDivElement}
                 * @constructor
                 */
                YouTube: function (matches) {
                    let objIframe = document.createElement('iframe');
                    objIframe.src = 'https://www.youtube.com/embed/' + matches.id;
                    objIframe.title = 'YouTube video player';
                    objIframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                    objIframe.allowFullscreen = true;

                    objIframe.style.position = 'absolute';
                    objIframe.style.top = '0';
                    objIframe.style.left = '0';
                    objIframe.style.width = '100%';
                    objIframe.style.height = '100%';

                    let objDiv = document.createElement('div');
                    objDiv.className = 'editor-youtube-wrap';

                    objDiv.style.float = 'none';
                    objDiv.style.clear = 'both';
                    objDiv.style.width = '100%';
                    objDiv.style.height = '0';
                    objDiv.style.position = 'relative';
                    objDiv.style.paddingTop = '25px';
                    objDiv.style.paddingBottom = '56.25%';

                    objDiv.appendChild(objIframe);

                    return objDiv;
                },

                /**
                 * Twitter
                 * @param {{
                 *     username: String,
                 *     tweetID: String,
                 * }} matches
                 * @return {HTMLQuoteElement}
                 * @constructor
                 */
                Twitter: function (matches) {
                    let strTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';

                    if (typeof matches.username === 'string' && typeof matches.tweetID === 'string') {
                        // status
                        let objBQ = document.createElement('blockquote');
                        objBQ.className = 'twitter-tweet editor-twitter-wrap';
                        objBQ.setAttribute('data-theme', strTheme);

                        objBQ.style.maxWidth = '100% !important';

                        let objA = document.createElement('a');
                        objA.href = 'https://twitter.com/' + matches.username + '/status/' + matches.tweetID;

                        // <script async src="https://platform.twitter.com/widgets.js" charset="UTF-8"></script>
                        let objScript = document.createElement('script');
                        objScript.async = true;
                        objScript.src = 'https://platform.twitter.com/widgets.js';

                        objBQ.appendChild(objA);
                        objBQ.appendChild(objScript);
                        return objBQ;
                    }

                    return null;
                },

                /**
                 * Facebook
                 * @param {{
                 *     url: String
                 * }} matches
                 * @return {HTMLDivElement}
                 * @constructor
                 */
                Facebook: function (matches) {
                    let objDivWrap = document.createElement('div');
                    objDivWrap.className = 'editor-facebook-wrap';

                    let objDivPost = document.createElement('div');
                    objDivPost.className = 'fb-post';
                    objDivPost.setAttribute('data-href', matches.url);
                    objDivPost.setAttribute('data-width', '350');
                    objDivPost.setAttribute('data-show-text', 'true');

                    objDivPost.addEventListener('DOMSubtreeModified', event => {
                        if (
                            event.target['tagName'] === 'IFRAME'
                            && objDivWrap.querySelector('#fb-root') !== null
                        ) {
                            event.target['style'].backgroundColor = '#fff';
                            event.target['style'].borderRadius = '3px';

                            objDivWrap.querySelector('#fb-root').remove();

                            if (objDivWrap.querySelector('script') !== null) {
                                objDivWrap.querySelector('script').remove();
                            }
                        }
                    });

                    let objDivRoot = document.createElement('div');
                    objDivRoot.id = 'fb-root';

                    if (!window.FB) {
                        let objScript = document.createElement('script');
                        objScript.async = true;
                        objScript.defer = true;
                        objScript.crossOrigin = 'anonymous';
                        objScript.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v13.0';
                        objScript.nonce = 'WM9CWvy4';

                        objDivWrap.appendChild(objScript);
                    } else {
                        objDivWrap.addEventListener('DOMNodeInserted', event => {
                            if (event.target === event.currentTarget) {
                                FB.XFBML.parse(event.target);
                            }
                        });
                    }

                    objDivWrap.appendChild(objDivPost);
                    objDivWrap.appendChild(objDivRoot);
                    return objDivWrap;
                },

                /**
                 * Instagram
                 * @param {{
                 *     url: String
                 * }} matches
                 * @return {HTMLDivElement}
                 * @constructor
                 */
                Instagram: function (matches) {
                    let objDivWrap = document.createElement('div');
                    objDivWrap.className = 'editor-instagram-wrap';

                    objDivWrap.style.position = 'relative';
                    objDivWrap.style.paddingBottom = '120%';
                    objDivWrap.style.height = '0';
                    objDivWrap.style.overflow = 'hidden';

                    let objIframe = document.createElement('iframe');
                    objIframe.src = matches.url + '/embed';

                    objIframe.style.position = 'absolute';
                    objIframe.style.top = '0';
                    objIframe.style.left = '0';
                    objIframe.style.width = '100%';
                    objIframe.style.height = '100%';

                    objDivWrap.appendChild(objIframe);
                    return objDivWrap;
                },

                /**
                 * Vimeo
                 * @param {{
                 *     id: String
                 * }} matches
                 * @return {HTMLDivElement}
                 * @constructor
                 */
                Vimeo: function (matches) {
                    let objDivWrap = document.createElement('div');
                    objDivWrap.className = 'editor-vimeo-wrap';

                    objDivWrap.style.position = 'relative';
                    objDivWrap.style.paddingBottom = '56.25%';
                    objDivWrap.style.height = '0';
                    objDivWrap.style.maxWidth = '100%';
                    objDivWrap.style.overflow = 'hidden';

                    let objIframe = document.createElement('iframe');
                    objIframe.src = 'https://player.vimeo.com/video/' + matches.id;
                    objIframe.allow = 'autoplay; fullscreen; picture-in-picture';
                    objIframe.allowFullscreen = true;

                    objIframe.style.position = 'absolute';
                    objIframe.style.top = '0';
                    objIframe.style.left = '0';
                    objIframe.style.width = '100%';
                    objIframe.style.height = '100%';

                    objDivWrap.appendChild(objIframe);
                    return objDivWrap;
                },

                /**
                 * Twitch
                 * @param {{
                 *     videoID: String,
                 *     channelID: String,
                 *     collectionID: String,
                 * }} matches
                 * @return {HTMLDivElement}
                 * @constructor
                 */
                Twitch: function (matches) {
                    let objDivWrap = document.createElement('div');
                    objDivWrap.className = 'editor-twitch-wrap';

                    objDivWrap.style.position = 'relative';
                    objDivWrap.style.paddingBottom = '56.25%';
                    objDivWrap.style.height = '0';

                    let strParam = '';
                    if (typeof matches.videoID === 'string') {
                        strParam = 'video=' + matches.videoID;
                    } else if (typeof matches.channelID === 'string') {
                        strParam = 'channel=' + matches.channelID;
                    } else if (typeof matches.collectionID === 'string') {
                        strParam = 'collection=' + matches.collectionID;
                    } else {
                        return null;
                    }

                    let objIframe = document.createElement('iframe');
                    objIframe.src = 'https://player.twitch.tv/?' + strParam + '&parent=' + window.location.hostname + '&autoplay=false';
                    objIframe.allowFullscreen = true;

                    objIframe.style.position = 'absolute';
                    objIframe.style.top = '0';
                    objIframe.style.left = '0';
                    objIframe.style.width = '100%';
                    objIframe.style.height = '100%';

                    objDivWrap.appendChild(objIframe);
                    return objDivWrap;
                },
            },
        }, options);

        objEditor._embedSearchRegex = function (strText) {
            let result = null;

            for (let key in objEditor.options.plugins['embed'].regex) {
                for (let i = 0; i < objEditor.options.plugins['embed'].regex[key].length; i++) {
                    let matches = strText.match(objEditor.options.plugins['embed'].regex[key][i]);
                    if (matches) {
                        result = {
                            key: key,
                            matches: matches.groups,
                        };
                        break;
                    }
                }
            }

            return result;
        };

        // Ctrl + v
        objEditor.addEventListener('paste', event => {
            let pastedData = event.clipboardData;
            if (pastedData.types.indexOf('text/plain') !== -1) {
                let strText = pastedData.getData('text/plain');

                // check URL
                if (strText.match(/^https?:\/\//i)) {
                    let result = objEditor._embedSearchRegex(strText);
                    if (result) {
                        let objNode = objEditor.options.plugins['embed'].insertNode[result.key](result.matches);
                        if (objNode !== null) {
                            event.preventDefault();
                            event.stopImmediatePropagation();

                            // set cursor And iMac safari objEditor.insertNodeNewLine(); is not error
                            let objBR = document.createElement('br');
                            objNode.appendChild(objBR);

                            objEditor.insertNode(objNode);
                            objEditor.insertNodeNewLine();
                        }
                    }
                }
            }
        });

        return this.options;
    });
}
