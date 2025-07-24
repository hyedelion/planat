import {HyObject} from "../object.js";

export class HyButton extends HyObject {
    static COLOR_ATTR_NAME = 'data-hy-color';
    static OBJECT_ATTR_VALUE = 'button';

    /** @param {{$element: HTMLButtonElement}} args */
    constructor(args) {
        super(args);
    }
}