export class HyObject {
    static COMPONENT_ATTR_NAME = 'data-hy-component';
    static NAME_ATTR_NAME = 'data-hy-name';
    static OBJECT_ATTR_NAME = 'data-hy-object';
    static REFERENCE_ATTR_NAME = 'data-hy-reference';

    static generateRandomName = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 16; i++) {
            const randIndex = Math.floor(Math.random() * chars.length);
            result += chars[randIndex];
        }
        return result;
    }

    $element;
    name;

    /** @param {{$element: HTMLElement}} args */
    constructor(args) {
        this.$element = args.$element;
        this.name = args.$element.getAttribute(HyObject.NAME_ATTR_NAME);
        if (this.name == null || this.name.length === 0) {
            this.name = HyObject.generateRandomName();
        }
    }
}