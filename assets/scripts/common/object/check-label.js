import {HyObject} from "../object.js";

export class HyCheckLabel extends HyObject {
    static OBJECT_ATTR_VALUE = 'checkLabel';

    /** @type {HTMLInputElement} */
    $input;
    /** @type {HTMLElement} */
    $message;

    /** @param {{$element: HTMLElement}} args */
    constructor(args) {
        super(args);
        this.$input = args.$element.querySelector(`[${HyObject.COMPONENT_ATTR_NAME}="checkLabel.input"]`);
        this.$message = args.$element.querySelector(`[${HyObject.COMPONENT_ATTR_NAME}="checkLabel.message"]`);
    }

    /** @returns {boolean} */
    isInvalid = () => this.$element.classList.contains('-invalid');

    /**
     * @param {boolean} b
     * @returns {HyCheckLabel} */
    setInvalid = (b) => {
        if (b === true) {
            this.$element.classList.add('-invalid');
        } else if (b === false) {
            this.$element.classList.remove('-invalid');
        }
        return this;
    }
}