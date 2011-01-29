var Action = (function () {
    var Root = /BackCompat/.test(document.compatMode) ? document.body : document.documentElement;

    function toArray(al) {
        return Array.prototype.slice.call(al);
    }

    var actions = {};

    var actionList = $("shortcutkey-actions");

    function createActionElement(action) {
        var name = action.name;
        var desc = action.desc;

        var elem = document.createElement("option");
        elem.textContent = name + (desc ? " (" + desc + ")" : "");
        elem.setAttribute("value", name);

        return elem;
    }

    function addAction(name, func, desc) {
        KeyHandler.addAction(name, func);

        var action = actions[name] = {
            name : name,
            func : func,
            desc : desc
        };

        actionList.appendChild(action.elem = createActionElement(action));
    }

    return {
        addAction: addAction,
        // deleteAction: deleteAction,
        getDescription: function (name) {
            return actions[name] ? actions[name].desc : null;
        },
        getSelectedAction: function () {
            var selectedItem = actionList.children[actionList.selectedIndex];

            return actions[selectedItem.getAttribute("value")];
        }
    };
})();
