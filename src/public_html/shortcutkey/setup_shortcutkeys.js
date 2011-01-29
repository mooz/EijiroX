var ShortcutKey = (function () {
    var listArea     = $("shortcutkey-list-area");
    var inputKeyArea = $("shortcutkey-key");

    var keyElements = {};

    inputKeyArea.addEventListener("keydown", function (ev) {
        inputKeyArea.value = KeyHandler.keyEventToString(ev);
        KeyHandler.killEvent(ev);
    });

    listArea.addEventListener("click", function (ev) {
        var elem = ev.target;

        if (elem.localName !== "button" ||
            elem.getAttribute("class") !== "shortcutkey-delete-button")
            return;

        var key = elem.getAttribute("data-key");
        if (confirm(key + " を削除してもよろしいですか？"))
            deleteKeyBind(key);
    });

    function createKeyBindElement(key, action) {
        var elem = document.createElement("tr");

        elem.setAttribute("class", "shortcutkey-definition");

        var keyLabel = document.createElement("td");
        keyLabel.textContent = key;
        elem.appendChild(keyLabel);

        var actionLabel = document.createElement("td");
        actionLabel.textContent = action;
        elem.appendChild(actionLabel);

        var buttonContainer = document.createElement("td");

        var deleteButton = document.createElement("button");
        deleteButton.setAttribute("class", "shortcutkey-delete-button", "");
        deleteButton.setAttribute("data-key", key);
        deleteButton.textContent = "削除";
        buttonContainer.appendChild(deleteButton);
        elem.appendChild(buttonContainer);

        return elem;
    }

    function addKeyBind(key, action) {
        listArea.appendChild(keyElements[key] = createKeyBindElement(key, action));
        KeyHandler.addKeyBind(key, action);
    }

    function deleteKeyBind(key) {
        delete KeyHandler.keyMap[key];
        listArea.removeChild(keyElements[key]);
        delete keyElements[key];
    }

    var self = {
        add: function (key, action) {
            if (keyElements.hasOwnProperty(key)) {
                if (!confirm("既に " + key + " は定義されています．既存の設定を削除しますか？"))
                    return;
                deleteKeyBind(key);
            }

            addKeyBind(key, action);
        }
    };

    return self;
})();

ShortcutKey.add("C-n", "scroll_down");
ShortcutKey.add("C-p", "scroll_up");

ShortcutKey.add("C-g", "blur");

ShortcutKey.add("j", "scroll_down");
ShortcutKey.add("k", "scroll_up");

ShortcutKey.add("C-v", "scroll_page_down");
ShortcutKey.add("M-v", "scroll_page_up");

ShortcutKey.add("C-c", "reset");
ShortcutKey.add("f", "reset");

ShortcutKey.add("<down>", "next_entry");
ShortcutKey.add("<up>", "previous_entry");

ShortcutKey.add("C-d", "last_entry");
ShortcutKey.add("C-u", "first_entry");
