class SideHandler {
    /** @type {HTMLElement} */ $element;
    /** @type {HTMLElement} */ $title;
    /** @type {{[p: string]: HTMLButtonElement}} */ $actionMap = {};
    /** @type {{[p: string]: function()[]}} */ actionCallbackMap = {};
    /** @type {{[p: string]: HTMLElement}} */ $bodyMap = {};

    /** @param {{$element: HTMLElement}} args */
    constructor(args) {
        this.$element = args.$element;
        this.$title = this.$element.querySelector('[data-hy-reference="title"]');
        this.$actionMap = {};
        this.$element.querySelectorAll('[data-hy-reference="topMenu"] [data-hy-reference="action"][data-hy-name]').forEach(($action) => {
            const name = $action.getAttribute('data-hy-name');
            this.$actionMap[name] = $action;
            this.actionCallbackMap[name] = [];
            $action.addEventListener('click', () => this.actionCallbackMap[name]?.forEach((f) => f()));
        });
        this.$bodyMap = {};
        this.$element.querySelectorAll('[data-hy-reference="body"][data-hy-name]').forEach(($body) => {
            this.$bodyMap[$body.getAttribute('data-hy-name')] = $body;
        });
    }

    hideAllActions = () => Object.values(this.$actionMap).forEach(($action) => $action.hide());

    hideAllBodies = () => Object.values(this.$bodyMap).forEach(($body) => $body.hide());
}

window.sideHandler = new SideHandler({
    $element: document.getElementById('side')
});

import ('./side/default.js');
import ('./side/add.js');
import ('./side/modify.js');
import ('./side/view.js');