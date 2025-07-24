import {HyObject} from "./object.js";
import {HyButton} from "./object/button.js";
import {HyCheckLabel} from "./object/check-label.js";
import {HyCover} from "./object/cover.js";
import {HyDialog} from "./object/dialog.js";
import {HyLabel} from "./object/label.js";
import {HyLoading} from "./object/loading.js";

export class ObjectManager {
    /** @type {HyObject[]} */
    $objects;
    /** @type {{[p: string]: HyObject}} */
    $objectMap;

    constructor() {
        const $elements = Array.from(document.body.querySelectorAll('[data-hy-object]'));
        this.$objects = $elements.map(($element) => {
            const object = $element.getAttribute(HyObject.OBJECT_ATTR_NAME);
            const args = {$element: $element};
            switch (object) {
                case HyButton.OBJECT_ATTR_VALUE:
                    return new HyButton(args);
                case HyCheckLabel.OBJECT_ATTR_VALUE:
                    return new HyCheckLabel(args);
                case HyCover.OBJECT_ATTR_VALUE:
                    return new HyCover(args);
                case HyDialog.OBJECT_ATTR_VALUE:
                    return new HyDialog(args);
                case HyLabel.OBJECT_ATTR_VALUE:
                    return new HyLabel(args);
                case HyLoading.OBJECT_ATTR_VALUE:
                    return new HyLoading(args);
                default:
                    return new HyObject(args);
            }
        });
        this.$objectMap = /** @type {{[p: string]: HyObject}} */ this.$objects.reduce((map, object) => (map[object.name] = object, map), {});
    }

    /**
     * @param {string} name
     * @returns {HyObject} */
    get = (name) => {
        return this.$objectMap[name];
    }

    getElement = (name) => {
        return this.$objectMap[name]?.$element;
    }
}