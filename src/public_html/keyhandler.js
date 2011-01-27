var KeyHandler = {
    actions: {},
    keyMap: {},

    addAction: function (name, func) {
        this.actions[name] = func;
    },

    addKeyBind: function (name, action) {
        this.keyMap[name] = action;
    },

    isCharacterKey: function (ev) {
        return ev.keyCode >= 48 && ev.keyCode <= 90;
    },

    // https://github.com/decklin/yakshave/blob/master/yakshave.js
    keyCodeMap: {
        3: '<Cancel>',
        6: '<Help>',
        8: 'DEL',
        9: 'TAB',
        12: '<Clear>',
        13: 'LFD',
        14: 'RET',
        16: '<Shift>',
        17: '<Control>',
        18: '<Alt>',
        19: '<pause>',
        20: '<CapsLock>',
        27: 'ESC',
        32: 'SPC',
        33: '<next>',
        34: '<prior>',
        35: '<end>',
        36: '<home>',
        37: '<left>',
        38: '<up>',
        39: '<right>',
        40: '<down>',
        44: '<print>',
        45: '<insert>',
        46: '<delete>',
        48: '0',
        49: '1',
        50: '2',
        51: '3',
        52: '4',
        53: '5',
        54: '6',
        55: '7',
        56: '8',
        57: '9',
        65: 'a',
        66: 'b',
        67: 'c',
        68: 'd',
        69: 'e',
        70: 'f',
        71: 'g',
        72: 'h',
        73: 'i',
        74: 'j',
        75: 'k',
        76: 'l',
        77: 'm',
        78: 'n',
        79: 'o',
        80: 'p',
        81: 'q',
        82: 'r',
        83: 's',
        84: 't',
        85: 'u',
        86: 'v',
        87: 'w',
        88: 'x',
        89: 'y',
        90: 'z',
        93: '<menu>',
        96: '<kp-0>',
        97: '<kp-1>',
        98: '<kp-2>',
        99: '<kp-3>',
        100: '<kp-4>',
        101: '<kp-5>',
        102: '<kp-6>',
        103: '<kp-7>',
        104: '<kp-8>',
        105: '<kp-9>',
        106: '<kp-multiply>',
        107: '<kp-add>',
        108: '<kp-backtab>',
        109: '<kp-subtract>',
        110: '<kp-decimal>',
        111: '<kp-divide>',
        112: '<f1>',
        113: '<f2>',
        114: '<f3>',
        115: '<f4>',
        116: '<f5>',
        117: '<f6>',
        118: '<f7>',
        119: '<f8>',
        120: '<f9>',
        121: '<f10>',
        122: '<f11>',
        123: '<f12>',
        124: '<f13>',
        125: '<f14>',
        126: '<f15>',
        127: '<f16>',
        128: '<f17>',
        129: '<f18>',
        130: '<f19>',
        131: '<f20>',
        132: '<f21>',
        133: '<f22>',
        134: '<f23>',
        135: '<f24>',
        144: '<NumLock>',
        145: '<Scroll_Lock>',
        186: ';',
        187: '=',
        188: ',',
        190: '.',
        191: '/',
        192: '`',
        219: '[',
        220: '\\',
        221: ']',
        222: '\'',
        224: '<Meta>'
    },

    keyEventToString: function (ev) {
        var keyStr;

        keyStr = this.keyCodeMap[ev.keyCode];

        if (!keyStr)
            return null;

        keyStr = (this.getModifier() || "") + keyStr;

        return keyStr;
    },

    getModifier: function () {
        var modifier = "";

        for (var mod in this.modifierStatus) {
            if (this.modifierStatus.hasOwnProperty(mod) && this.modifierStatus[mod]) {
                modifier = mod + "-" + modifier;
            }
        }

        return modifier;
    },

    editableTypes: {
        password : true,
        text     : true
    },

    inEditMode: function () {
        var elem = document.activeElement;

        return elem.localName === "input" &&
            (!elem.hasAttribute("type") || this.editableTypes[elem.getAttribute("type")]);
    },

    killEvent: function (ev) {
        ev.stopPropagation();
        ev.preventDefault();
    },

    modifierStatus: {
        C: false,                 // control
        M: false,                 // alt
        S: false                  // shift
    },

    modifierMap: {
        16  : "S",              // shit
        17  : "C",              // control
        18  : "M",              // alt
        224 : "M"               // meta
    },

    handleKeyUp: function (ev) {
        if (this.modifierMap.hasOwnProperty(ev.keyCode)) {
            this.modifierStatus[this.modifierMap[ev.keyCode]] = false;
            console.log("Modifier released " + this.modifierMap[ev.keyCode]);
        }
    },

    handleKeyDown: function (ev) {
        if (this.modifierMap.hasOwnProperty(ev.keyCode)) {
            // handle modifier
            console.log("Modifier pressed " + this.modifierMap[ev.keyCode]);
            this.modifierStatus[this.modifierMap[ev.keyCode]] = true;
        } else {
            // normal
            var keyStr = this.keyEventToString(ev);

            console.log("Key Pressed " + keyStr);

            if (this.keyMap.hasOwnProperty(keyStr)) {
                var action = this.actions[this.keyMap[keyStr]];

                if (action) {
                    if ((this.isCharacterKey(ev) && !this.getModifier()) && this.inEditMode()) {
                        return;
                    }

                    this.killEvent(ev);
                    action();
                }
            }
        }
    },

    handleEvent: function (ev) {
        switch (ev.type) {
        case "keydown":
            this.handleKeyDown(ev);
            break;
        case "keyup":
            this.handleKeyUp(ev);
            break;
        }
    }
};

document.addEventListener('keydown', KeyHandler, true);
document.addEventListener('keyup', KeyHandler, true);

