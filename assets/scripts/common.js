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

/** @param {{separator?: string}} args */
Date.prototype.toFormattedDate = function (args = {separator: '-'}) {
    args ??= {};
    args.separator ??= '-';
    return `${this.getFullYear().toString().padStart(4, '0')}${args.separator}${(this.getMonth() + 1).toString().padStart(2, '0')}${args.separator}${this.getDate().toString().padStart(2, '0')}`;
}

/** @param {{separator?: string, includeSeconds?: boolean}} args */
Date.prototype.toFormattedTime = function (args = {separator: ':', includeSeconds: true}) {
    args ??= {};
    args.separator ??= ':';
    args.includeSeconds ??= true;
    return `${this.getHours().toString().padStart(2, '0')}${args.separator}${this.getMinutes().toString().padStart(2, '0')}${args.separator}${args.includeSeconds === true ? this.getSeconds().toString().padStart(2, '0') : ''}`;
}

/** @param {{dateTimeSeparator?: string, dateSeparator?: string, timeSeparator?: string, includeSeconds?: boolean}} args */
Date.prototype.toFormattedDateTime = function (args = {dateTimeSeparator: ' ', dateSeparator: '-', timeSeparator: ':', includeSeconds: true}) {
    return `${this.toFormattedDate({separator: args.dateSeparator})}${args.dateTimeSeparator}${this.toFormattedTime({separator: args.timeSeparator, includeSeconds: args.includeSeconds})}`;
}

window.origin = 'http://172.30.1.42:8080';