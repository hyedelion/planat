import {HyObject} from "../object.js";
import {HyButton} from "./button.js";

export class HyDialog extends HyObject {
    static OBJECT_ATTR_VALUE = 'dialog';

    /** @type {HTMLElement[]} */
    $modals = [];

    /** @param {{$element: HTMLElement}} args */
    constructor(args) {
        super(args);
    }

    /**
     * @param {HTMLElement} $modal
     * @returns {boolean} */
    hide = ($modal) => {
        const index = this.$modals.indexOf($modal);
        if (index < 0) {
            return false;
        }
        setTimeout(() => $modal.remove(), 1000);
        $modal.hide();
        this.$modals.splice(index, 1);
        if (this.$modals.length === 0) {
            document.body.querySelectorAll('button, input ,select, textarea').forEach(($field) => {
                if ($field.hasAttribute('data-hy-dialog-blocked')) {
                    $field.removeAttribute('disabled');
                    $field.removeAttribute('data-hy-dialog-blocked');
                }
            });
            this.$element.hide();
        } else {
            this.$modals[this.$modals.length - 1].classList.remove('-collapsed');
        }
        return true;
    }

    /**
     * @param {{title: string, content: string, buttons?: {caption: string, color?: 'gray'|'mochaMousse', onClickCallback?: function(HTMLElement?)}[], isContentHtml?: boolean}} args
     * @returns {HTMLElement} */
    show = (args) => {
        for (const $modal of this.$modals) {
            $modal.classList.add('-collapsed');
        }
        const $modal = document.createElement('div');
        $modal.setAttribute(HyObject.COMPONENT_ATTR_NAME, 'dialog.modal');
        const $title = document.createElement('div');
        $title.setAttribute(HyObject.COMPONENT_ATTR_NAME, 'dialog.modal.title');
        $title.innerText = args.title;
        const $content = document.createElement('div');
        $content.setAttribute(HyObject.COMPONENT_ATTR_NAME, 'dialog.modal.content');
        if (args.isContentHtml === true) {
            $content.innerHTML = args.content;
        } else {
            $content.innerText = args.content;
        }
        $modal.append($title, $content);
        let $firstButton = null;
        if (args.buttons != null && args.buttons.length > 0) {
            const $buttonContainer = document.createElement('div');
            $buttonContainer.setAttribute(HyObject.COMPONENT_ATTR_NAME, 'dialog.modal.buttonContainer');
            for (const button of args.buttons) {
                const $button = document.createElement('button');
                $button.innerText = button.caption;
                $button.setAttribute('type', 'button');
                $button.setAttribute(HyObject.OBJECT_ATTR_NAME, 'button');
                $button.setAttribute(HyButton.COLOR_ATTR_NAME, button.color ?? 'gray');
                $button.setAttribute(HyObject.COMPONENT_ATTR_NAME, 'dialog.modal.buttonContainer.button');
                if (typeof button.onClickCallback === 'function') {
                    $button.addEventListener('click', () => button.onClickCallback($modal));
                }
                $buttonContainer.append($button);
                $firstButton ??= $button;
            }
            $modal.append($buttonContainer);
        }
        setTimeout(() => {
            $modal.show();
            $firstButton?.focus();
        }, 50);
        document.body.querySelectorAll('button, input ,select, textarea').forEach(($field) => {
            if (!$field.hasAttribute('disabled') && this.$modals.every(($modal) => !$modal.contains($field))) {
                $field.setAttribute('disabled', '');
                $field.setAttribute('data-hy-dialog-blocked', '');
            }
        });
        this.$element.append($modal);
        this.$element.show();
        this.$modals.push($modal);
        return $modal;
    }

    /**
     * @param {string} title
     * @param {string} content
     * @param {{okButtonCpation?: string, okButtonColor?: 'gray'|'mochaMousse', isContentHtml?: boolean, onClickOkCallback?: function(HTMLElement?)}} args
     * @returns {HTMLElement} */
    showSimpleOk = (title, content, args = {}) => this.show({
        title: title,
        content: content,
        isContentHtml: args?.isContentHtml,
        buttons: [
            {
                caption: args?.okButtonCpation ?? '확인',
                color: args?.okButtonColor ?? 'gray',
                onClickCallback: ($modal) => {
                    this.hide($modal);
                    if (typeof args.onClickOkCallback === 'function') {
                        args.onClickOkCallback($modal);
                    }
                }
            }
        ]
    })

    /**
     * @param {string} title
     * @param {string} content
     * @param {{noButtonCpation?: string, noButtonColor?: 'gray'|'mochaMousse', yesButtonCpation?: string, yesButtonColor?: 'gray'|'mochaMousse', isContentHtml?: boolean, onClickNoCallback?: function(HTMLElement?), onClickYesCallback?: function(HTMLElement?)}} args
     * @returns {HTMLElement} */
    showSimpleYesNo = (title, content, args = {}) => this.show({
        title: title,
        content: content,
        isContentHtml: args?.isContentHtml,
        buttons: [
            {
                caption: args?.noButtonCpation ?? '아니요',
                color: args?.noButtonColor ?? 'gray',
                onClickCallback: ($modal) => {
                    this.hide($modal);
                    if (typeof args.onClickNoCallback === 'function') {
                        args.onClickNoCallback($modal);
                    }
                }
            },
            {
                caption: args?.noButtonCpation ?? '네',
                color: args?.noButtonColor ?? 'mochaMousse',
                onClickCallback: ($modal) => {
                    this.hide($modal);
                    if (typeof args.onClickYesCallback === 'function') {
                        args.onClickYesCallback($modal);
                    }
                }
            }
        ]
    })
}