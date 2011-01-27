(function () {
    var Root = /BackCompat/.test(document.compatMode) ? document.body : document.documentElement;

    KeyHandler.addAction("scroll_down", function (arg) {
        window.scrollBy(0, 100);
    });

    KeyHandler.addAction("scroll_up", function (arg) {
        window.scrollBy(0, -100);
    });

    KeyHandler.addAction("scroll_right", function (arg) {
        window.scrollBy(100, 0);
    });

    KeyHandler.addAction("scroll_left", function (arg) {
        window.scrollBy(-100, 0);
    });

    KeyHandler.addAction("scroll_right", function (arg) {
        window.scrollBy(100, 0);
    });

    KeyHandler.addAction("scroll_to_top", function (arg) {
        window.scrollBy(0, -1 * Root.scrollHeight);
    });

    KeyHandler.addAction("scroll_to_bottom", function (arg) {
        window.scrollBy(0, Root.scrollHeight);
    });

    KeyHandler.addAction("blur", function (arg) {
        document.activeElement.blur();
    });

    KeyHandler.addAction("reset", function (arg) {
        var query = document.querySelector("#query");
        if (query) {
            query.value = "";
            query.focus();
        }
    });
})();
