import {HyObject} from "../object.js";

export class HyLoading extends HyObject {
    static OBJECT_ATTR_VALUE = 'loading';

    $caption;

    /** @param {{$element: HTMLButtonElement}} args */
    constructor(args) {
        super(args);
        this.$caption = args.$element.querySelector(`[${HyObject.COMPONENT_ATTR_NAME}="loading.caption"]`);
    }

    /** @returns {HTMLElement} */
    hide = () => {
        document.body.querySelectorAll('button, input ,select, textarea').forEach(($field) => {
            if ($field.hasAttribute('data-hy-loading-blocked')) {
                $field.removeAttribute('disabled');
                $field.removeAttribute('data-hy-loading-blocked');
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

    /**
     * @param {{caption?: string}?} args
     * @returns {HTMLElement} */
    show = (args = {}) => {
        document.body.querySelectorAll('button, input ,select, textarea').forEach(($field) => {
            if (!$field.hasAttribute('disabled')) {
                $field.setAttribute('disabled', '');
                $field.setAttribute('data-hy-loading-blocked', '');
            }
        });
        this.$caption.innerText = args?.caption ?? '잠시만 기다려 주세요.';
        return this.$element.show();
    }
}