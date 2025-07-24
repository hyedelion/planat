HTMLElement.VISIBLE_CLASS_NAME = '-visible';

/** @returns {HTMLLIElement} */
HTMLElement.prototype.hide = function () {
    this.classList.remove(HTMLElement.VISIBLE_CLASS_NAME);
    return this;
}

/** @returns {boolean} */
HTMLElement.prototype.isVisible = function () {
    return this.classList.contains(HTMLLIElement.VISIBLE_CLASS_NAME);
}

/**
 * @param {boolean} b
 * @returns {HTMLElement} */
HTMLElement.prototype.setVisible = function (b) {
    if (b === true) {
        this.classList.add(HTMLElement.VISIBLE_CLASS_NAME);
    } else if (b === false) {
        this.classList.remove(HTMLElement.VISIBLE_CLASS_NAME);
    }
    return this;
}

/** @returns {HTMLLIElement} */
HTMLElement.prototype.show = function () {
    this.classList.add(HTMLElement.VISIBLE_CLASS_NAME);
    return this;
}

Date.prototype.formatToDate = function () {
    const year = this.getFullYear();
    const month = String(this.getMonth() + 1).padStart(2, '0');
    const day = String(this.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

window.origin = 'http://172.17.0.27:8080';