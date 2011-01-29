var ShortcutKey = (function () {
    var listArea     = $("shortcutkey-list-area");
    var inputKeyArea = $("shortcutkey-key");
    var addButton    = $("shortcutkey-add");

    var keyElements = {};

    addButton.addEventListener("click", function (ev) {
        if (ev.button !== 0)
            return;

        if (!inputKeyArea.value)
            return alert("キーが入力されていません");

        var action = Action.getSelectedAction();

        self.add(inputKeyArea.value, action.name);
        self.save();            // XXX
    }, false);

    inputKeyArea.addEventListener("keydown", function (ev) {
        inputKeyArea.value = KeyHandler.keyEventToString(ev);
        KeyHandler.killEvent(ev);
    }, false);

    listArea.addEventListener("click", function (ev) {
        if (ev.button !== 0)
            return;

        var elem = ev.target;

        if (elem.localName !== "button" ||
            elem.getAttribute("class") !== "shortcutkey-delete-button")
            return;

        var key = elem.getAttribute("data-key");
        if (confirm(key + " を削除してもよろしいですか？")) {
            deleteKeyBind(key);
            self.save();        // XXX
        }
    }, false);

    function createKeyBindElement(key, action) {
        var elem = document.createElement("tr");

        elem.setAttribute("class", "shortcutkey-definition");

        var keyLabel = document.createElement("td");
        keyLabel.textContent = key;
        elem.appendChild(keyLabel);

        var actionLabel = document.createElement("td");
        actionLabel.textContent = action;
        elem.appendChild(actionLabel);

        var descLabel = document.createElement("td");
        descLabel.textContent = Action.getDescription(action);
        elem.appendChild(descLabel);

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
        },

        save: function () {
            localStorage.keyMap = JSON.stringify(KeyHandler.keyMap);
        },

        restore: function () {
            if (localStorage.keyMap) {
                try {
                    var keyMap = JSON.parse(keyMap);

                    for (var key in keyMap) if (keyMap.hasOwnProperty(key)) {
                        self.add(key, keyMap[key]);
                    }
                    return true;
                } catch (x) {
                    localStorage.keyMap = null;
                }
            }
        }
    };

    return self;
})();
