(function () {
    var Root = /BackCompat/.test(document.compatMode) ? document.body : document.documentElement;

    function toArray(al) {
        return Array.prototype.slice.call(al);
    }

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

    KeyHandler.addAction("scroll_page_down", function (arg) {
        window.scrollBy(0, Root.clientHeight);
    });

    KeyHandler.addAction("scroll_page_up", function (arg) {
        window.scrollBy(0, -1 * Root.clientHeight);
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

    // ============================================================ //
    // Item
    // ============================================================ //

    function allItems() {
        return toArray(document.querySelectorAll("#results .result"));
    }

    function currentItem() {
        return document.querySelector("#results .result[data-selected]");
    }

    function deselectCurrentItem() {
        var current = currentItem();
        if (current)
            current.removeAttribute("data-selected");
        return current;
    }

    function ensureInRange(n, min, max) {
        if (n > max)
            n = max;
        else if (n < min)
            n = min;
        return n;
    }

    function selectItem(idx) {
        var items = allItems();
        deselectCurrentItem();

        items[ensureInRange(idx, 0, items.length - 1)].setAttribute("data-selected", "true");
    }

    function selectNextItem(direction) {
        var items   = allItems();
        var current = deselectCurrentItem();

        var index = Math.max(items.indexOf(current), 0);

        var nextIndex = direction > 0 ? Math.min(index + direction, items.length - 1) : Math.max(index + direction, 0);

        var nextItem = items[nextIndex];

        nextItem.setAttribute("data-selected", "true");
    }

    KeyHandler.addAction("next_entry", function (arg) {
        selectNextItem(1);
    });

    KeyHandler.addAction("previous_entry", function (arg) {
        selectNextItem(-1);
    });

    KeyHandler.addAction("first_entry", function (arg) {
        selectItem(0);
    });

    KeyHandler.addAction("last_entry", function (arg) {
        selectItem(Infinity);
    });
})();
