var KeyHandler = {
    actions: {},
    keyMap: {},

    addAction: function (name, func) {
        this.actions[name] = func;
    },

    addKeyBind: function (name, action) {
        this.keyMap[name] = action;
    },

    // ============================================================ //

    isControlKey: function (ev) {
        return ev.ctrlKey || ev.commandKey;
    },

    isMetaKey: function (ev) {
        return ev.altKey || ev.metaKey;
    },

    isDisplayableKey: function (ev) {
        return ev.charCode >= 0x20 && ev.charCode <= 0x7e;
    },

    // ============================================================ //

    specialKeyEventToString: function (ev) {
        var keyStr;

        // special charactors
        switch (ev.keyCode) {
        case ev.DOM_VK_ESCAPE:
            keyStr = "ESC";
            break;
        case ev.DOM_VK_RETURN:
        case ev.DOM_VK_ENTER:
            keyStr = "RET";
            break;
        case ev.DOM_VK_RIGHT:
            keyStr = "<right>";
            break;
        case ev.DOM_VK_LEFT:
            keyStr = "<left>";
            break;
        case ev.DOM_VK_UP:
            keyStr = "<up>";
            break;
        case ev.DOM_VK_DOWN:
            keyStr = "<down>";
            break;
        case ev.DOM_VK_PAGE_UP:
            keyStr = "<prior>";
            break;
        case ev.DOM_VK_PAGE_DOWN:
            keyStr = "<next>";
            break;
        case ev.DOM_VK_END:
            keyStr = "<end>";
            break;
        case ev.DOM_VK_HOME:
            keyStr = "<home>";
            break;
        case ev.DOM_VK_TAB:
            keyStr = "<tab>";
            break;
        case ev.DOM_VK_BACK_SPACE:
            keyStr = "<backspace>";
            break;
        case ev.DOM_VK_PRINTSCREEN:
            keyStr = "<print>";
            break;
        case ev.DOM_VK_INSERT:
            keyStr = "<insert>";
            break;
        case ev.DOM_VK_PAUSE:
            keyStr = "<pause>";
            break;
        case ev.DOM_VK_DELETE:
            keyStr = "<delete>";
        default:
            break;
        }

        return keyStr;
    },

    keyEventToString: function (ev) {
        var keyStr;

        if (this.isDisplayableKey(ev)) {
            keyStr = (ev.charCode === 0x20) ? "SPC" : String.fromCharCode(ev.charCode);
        } else if (ev.keyCode >= ev.DOM_VK_F1 && ev.keyCode <= ev.DOM_VK_F24) {
            keyStr = "<f" + (ev.keyCode - ev.DOM_VK_F1 + 1) + ">";
        } else {
            keyStr = this.specialKeyEventToString(ev);
        }

        if (!keyStr)
            return null;

        // append modifier
        if (this.isMetaKey(ev))
            keyStr = "M-" + keyStr;
        if (this.isControlKey(ev))
            keyStr = "C-" + keyStr;
        if (ev.shiftKey && (!this.isDisplayableKey(ev) || ev.charCode == 0x20))
            keyStr = "S-" + keyStr;

        return keyStr;
    },

    inEditMode: function () {
        return (document.activeElement.localName === "input");
    },

    killEvent: function (ev) {
        ev.stopPropagation();
        ev.preventDefault();
    },

    handleEvent: function (ev) {
        console.log("Handled " + ev);

        var keyStr = this.keyEventToString(ev);

        console.log("Name is " + keyStr);

        if (this.keyMap.hasOwnProperty(keyStr)) {
            var action = this.actions[this.keyMap[keyStr]];

            if (action) {
                if (this.isDisplayableKey(ev) &&  this.inEditMode()) {
                    return console.log("Does not allowed");
                }

                console.log("Call action for " + keyStr);
                this.killEvent(ev);
                action();
            }
        }
    }
};

document.addEventListener('keypress', KeyHandler, true);
