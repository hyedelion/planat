import {HyObject} from "../object.js";

export class HyLabel extends HyObject {
    static OBJECT_ATTR_VALUE = 'label';

    /** @type {HTMLElement} */
    $message;
    /** @type {HTMLButtonElement|HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement} */
    $field;
    /** @type {HTMLElement[]} */
    $fields;

    /** @param {{$element: HTMLElement}} args */
    constructor(args) {
        super(args);
        this.$message = args.$element.querySelector(`[${HyObject.COMPONENT_ATTR_NAME}="label.message"]`);
        this.$field = this.$element.querySelector(`[${HyObject.COMPONENT_ATTR_NAME}="label.field"]`);
        this.$fields = Array.from(this.$element.querySelectorAll(`[${HyObject.COMPONENT_ATTR_NAME}="label.field"]`));
    }

    /** @returns {boolean} */
    isInvalid = () => this.$element.classList.contains('-invalid');

    /** @returns {boolean} */
    isValid = () => this.$element.classList.contains('-valid');

    /**
     * @param {boolean} b
     * @returns {HyLabel} */
    setInvalid = (b) => {
        if (b === true) {
            this.$element.classList.add('-invalid');
        } else if (b === false) {
            this.$element.classList.remove('-invalid');
        }
        return this;
    }

    /**
     * @param {boolean} b
     * @returns {HyLabel} */
    setValid = (b) => {
        if (b === true) {
            this.$element.classList.add('-valid');
        } else if (b === false) {
            this.$element.classList.remove('-valid');
        }
        return this;
    }
}