import {HyObject} from "../object.js";

export class HyCover extends HyObject {
    static OBJECT_ATTR_VALUE = 'cover';

    /** @param {{$element: HTMLElement}} args */
    constructor(args) {
        super(args);
    }

    /** @returns {HTMLElement} */
    hide = () => {
        document.body.querySelectorAll('button, input ,select, textarea').forEach(($field) => {
            if ($field.hasAttribute('data-hy-cover-blocked')) {
                $field.removeAttribute('disabled');
                $field.removeAttribute('data-hy-cover-blocked');
            }
        });
        this.$element.hide();
    }

    /** @returns {boolean} */
    isVisible = () => this.$element.isVisible();

    /**
     * @param {boolean} b
     * @returns {HTMLElement} */
    setVisible = (b) => {
        if (b === true) {
            this.show();
        } else if (b === false) {
            this.hide();
        }
        return this.$element;
    }

    /** @returns {HTMLElement} */
    show = () => {
        document.body.querySelectorAll('button, input ,select, textarea').forEach(($field) => {
            if (!$field.hasAttribute('disabled')) {
                $field.setAttribute('disabled', '');
                $field.setAttribute('data-hy-cover-blocked', '');
            }
        });
        return this.$element.show();
    }
}