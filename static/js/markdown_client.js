document.addEventListener('DOMContentLoaded', function() {
    function syntaxHighlight() {
        if (hljs !== undefined) {
            var codeBlocks = document.querySelectorAll('pre code');
            for (var i = 0; i < codeBlocks.length; i++) {
                var codeBlock = codeBlocks[i];
                hljs.highlightBlock(codeBlock);

                // Since the github css doesn't play nice with highlight.js, we
                // need to set the background of all `pre` elements to be the
                // color of the inner `code` block.
                codeBlock.parentNode.style.background = (
                    getComputedStyle(codeBlock)
                        .getPropertyValue('background'));
            }
        }
    }

    function renderMath() {
      if (typeof renderMathInElement === 'function') {
        renderMathInElement(
            document.getElementById("markdown-preview"),
            {
                delimiters: [
                    {left: "$$", right: "$$", display: true},
                    {left: "\\[", right: "\\]", display: true},
                    {left: "$", right: "$", display: false},
                    {left: "\\(", right: "\\)", display: false}
                ]
            }
        );
      }
    }


    syntaxHighlight();
    renderMath();
    var previewWindow = document.getElementById('markdown-preview');
    var webSocketUrl = 'ws://' + window.location.host;

    var socket = new ReconnectingWebSocket(webSocketUrl);
    socket.maxReconnectInterval = 5000;

    socket.onmessage = function(event) {
        document.getElementById('markdown-preview').innerHTML = event.data;
        syntaxHighlight();
        renderMath();

        // detect SOMA Semaphore comment <!-- SOMA: {"scrollTo": 0.42} -->
        var [_, json] = event.data.match(/<!-- SOMA: (\{.*?\}) -->/)
        var {scrollTo} = JSON.parse(json);

        if (!isNaN(scrollTo)) {
            var height = document.body.scrollHeight;
            console.log(`scrollTo(0, ${scrollTo * height})`);
            window.scrollTo(0, scrollTo * height);
        }
    }

    socket.onclose = function(event) {
        // Close the browser window.
        window.open('', '_self', '');
        window.close();
    }
});
