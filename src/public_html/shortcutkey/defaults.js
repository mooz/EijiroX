(function () {
    var Root = /BackCompat/.test(document.compatMode) ? document.body : document.documentElement;

    function toArray(al) {
        return Array.prototype.slice.call(al);
    }

    Action.addAction("scroll_down", function (arg) {
        window.scrollBy(0, 100);
    }, "下へスクロール");

    Action.addAction("scroll_up", function (arg) {
        window.scrollBy(0, -100);
    }, "上へスクロール");

    Action.addAction("scroll_right", function (arg) {
        window.scrollBy(100, 0);
    }, "右へスクロール");

    Action.addAction("scroll_left", function (arg) {
        window.scrollBy(-100, 0);
    }, "左へスクロール");

    Action.addAction("scroll_to_top", function (arg) {
        window.scrollBy(0, -1 * Root.scrollHeight);
    }, "ページ先頭へスクロール");

    Action.addAction("scroll_to_bottom", function (arg) {
        window.scrollBy(0, Root.scrollHeight);
    }, "ページ末尾へスクロール");

    Action.addAction("scroll_page_down", function (arg) {
        window.scrollBy(0, Root.clientHeight);
    }, "１ページ分下へスクロール");

    Action.addAction("scroll_page_up", function (arg) {
        window.scrollBy(0, -1 * Root.clientHeight);
    }, "１ページ分上へスクロール");

    Action.addAction("blur", function (arg) {
        document.activeElement.blur();
    }, "テキストエリアからフォーカスを外す");

    Action.addAction("reset", function (arg) {
        var query = document.querySelector("#query");
        if (query) {
            query.value = "";
            query.focus();
        }
    }, "検索結果をクリアして入力欄へフォーカス");

    function notifyWord(word, timeout) {
        var notification = webkitNotifications.createNotification(
            '../icons/icon48.png', // icon url - can be relative
            'EijiroX',             // notification title
            word + " を単語リストに追加しました"
        );

        notification.show();
        if (timeout) {
            setTimeout(function () {
                notification.cancel();
            }, timeout);
        }
    }

    try {
        var stockedWords = JSON.parse(localStorage.stockedWords || "");
        if (!(stockedWords instanceof Array))
            stockedWords = [];
    } catch (x) {
        stockedWords = [];
    }

    Action.addAction("stock_word", function (arg) {
        var word = $("query").value;
        stockedWords.push(word);
        notifyWord(word, 1000);
    }, "現在入力されている単語を記録");

    window.addEventListener("unload", function () {
        localStorage.stockedWords = JSON.stringify(stockedWords);
    }, false);

    Action.addAction("absorption", function (arg) {}, "(デフォルトの) ショートカットキーを無効に");
})();

if (!ShortcutKey.restore()) {
    // default
    ShortcutKey.add("C-n", "scroll_down");
    ShortcutKey.add("C-p", "scroll_up");

    ShortcutKey.add("C-g", "blur");

    ShortcutKey.add("j", "scroll_down");
    ShortcutKey.add("k", "scroll_up");

    ShortcutKey.add("C-v", "scroll_page_down");
    ShortcutKey.add("M-v", "scroll_page_up");

    ShortcutKey.add("C-c", "reset");
    ShortcutKey.add("f", "reset");

    ShortcutKey.add("C-l", "absorption");
    ShortcutKey.add("C-m", "stock_word");

    ShortcutKey.save();
}
