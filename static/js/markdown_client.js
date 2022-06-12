const aurelius = {
    debounce: function(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this,
                args = arguments;
            var later = function() {
                timeout = null;
                if ( !immediate ) {
                    func.apply(context, args);
                }
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait || 200);
            if ( callNow ) {
                func.apply(context, args);
            }
        }
    }
}

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

    function renderMermaid() {
        var mermaidCodeBlocks = document.querySelectorAll(".mermaid-language");
        mermaidCodeBlocks.forEach( i => i.classList.add('mermaid') );
        mermaid.initialize();
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
        aurelius.debounce(renderMermaid, 500);

        // detect SOMA comment e.g. <!-- SOMA: {"scrollTo": 0.42} -->
        // extensible via JSON
        var json = event?.data?.match(/<!-- SOMA: (\{.*?\}) -->/)?.[1]

        if (json) {
            var parsed = JSON.parse(json);

            // throw away everything except scrollTo.
            var {scrollTo} = parsed;

            // if it's there and it's a number.
            if (!isNaN(scrollTo)) {
                var height = document.body.scrollHeight;
                console.log(`scrollTo(0, ${scrollTo * height})`);

                // scroll to it as a percentage of body.height.
                window.scrollTo(0, scrollTo * height);
            }
        }
    }

    socket.onclose = function(event) {
        // Close the browser window.
        window.open('', '_self', '');
        window.close();
    }
});
