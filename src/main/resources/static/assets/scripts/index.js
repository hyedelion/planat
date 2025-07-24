import {HyObject} from "./common/object.js";
import {ObjectManager} from "./common/object-manager.js";

class AsideHandler {
    $element;
    $notification;
    $notificationList;
    $deleteAllAction;
    $notificationCount;
    $menuItemMap;
    $groupList;
    $groupItemMap = {};
    $groupCheckMap = {};
    menuItemCallbackMap = {};
    notifications = [];

    /** @param {{$element: HTMLElement}} args */
    constructor(args) {
        this.$element = args.$element;
        this.$notification = this.$element.querySelector('[data-hy-reference="notification"]');
        this.$notificationList = this.$element.querySelector('[data-hy-reference="notificationList"]');
        this.$deleteAllAction = this.$notificationList.querySelector('[data-hy-reference="deleteAllAction"]');
        this.$notificationCount = this.$element.querySelector('[data-hy-reference="notificationCount"]');
        this.$menuItemMap = /** @type {{[p: string]: HTMLElement}} */ Array.from(this.$element.querySelectorAll('[data-hy-reference="menuItem"][data-hy-name]')).reduce((map, $menuItem) => (map[$menuItem.getAttribute(HyObject.NAME_ATTR_NAME)] = $menuItem, map), {});
        this.$groupList = this.$element.querySelector(`[data-hy-reference="groupList"]`);

        this.$notification.addEventListener('click', this.#notificationOnClick);
        this.$notificationList.addEventListener('focusout', this.#notificationListOnFocusout);
        this.$deleteAllAction.addEventListener('click', this.#deleteAllActionOnClick);
    }

    #notificationOnClick = () => {
        if (!this.$notificationList.isVisible()) {
            this.$notificationList.show();
            this.$notificationList.focus();

            if (this.notifications.length > 0) {
                const xhr = new XMLHttpRequest();
                const formData = new FormData();
                for (const notification of this.notifications) {
                    formData.append('ids', notification['id']);
                }
                xhr.onreadystatechange = () => {
                    if (xhr.readyState !== XMLHttpRequest.DONE) {
                        return;
                    }
                    if (xhr.status < 200 || xhr.status >= 300) {
                        return;
                    }
                    const response = JSON.parse(xhr.responseText);
                    if (response.result === 'success') {
                        this.$notificationCount.innerText = '0';
                    }
                };
                xhr.open('PATCH', `${origin}/notification/`);
                xhr.send(formData);
            }
        }
    }

    #notificationListOnFocusout = () => {
        this.$notificationList.hide();
    }

    #deleteAllActionOnClick = () => {
        this.deleteNotifications(this.notifications.map((notification) => notification['id']));
    }

    /** @param {number[]} ids */
    deleteNotifications = (ids) => {
        loading.show();
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        for (const id of ids) {
            formData.append('ids', id.toString());
        }
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            loading.hide();
            if (xhr.status < 200 || xhr.status >= 300) {
                dialog.showSimpleOk('오류', '요청을 처리하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
                return;
            }
            const response = JSON.parse(xhr.responseText);
            switch (response.result) {
                case 'failure':
                    dialog.showSimpleOk('경고', '알 수 없는 이유로 알림을 삭제하지 못하였습니다.')
                    break;
                case 'success':
                    this.$notificationList.querySelectorAll('[data-hy-reference="item"]').forEach(($item) => $item.remove());
                    this.loadNotifications();
                    break;
                default:
                    dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
            }
        };
        xhr.open('DELETE', `${origin}/notification/`);
        xhr.send(formData);
    }

    loadNotifications = () => {
        this.notifications = [];
        const $empty = this.$notificationList.querySelector('[data-hy-reference="message"][data-hy-name="empty"]');
        const $error = this.$notificationList.querySelector('[data-hy-reference="message"][data-hy-name="error"]');
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            loading.hide();
            if (xhr.status < 200 || xhr.status >= 300) {
                $empty.hide();
                $error.show();
                this.$notificationCount.innerText = '!';
                return;
            }
            this.notifications = JSON.parse(xhr.responseText).sort((a, b) => parseInt(b['id']) - parseInt(a['id']));
            if (this.notifications.length === 0) {
                $error.hide();
                $empty.show();
            } else {
                $empty.hide();
                $error.hide();
                for (const notification of this.notifications) {
                    let $item = this.$notificationList.querySelector(`[data-hy-reference="item"][data-hy-id="${notification['id']}"]`);
                    if ($item == null) {
                        $item = new DOMParser().parseFromString(`
                            <li class="item" data-hy-reference="item" data-hy-id="${notification['id']}">
                                <span class="message" data-hy-reference="message"></span>
                                <span class="foot">
                                    <span class="timestamp" data-hy-reference="timestamp"></span>
                                    <span class="action-container">
                                        <span class="action" data-hy-reference="delete">삭제</span>
                                    </span>
                                </span>
                            </li>`, 'text/html').querySelector('[data-hy-reference="item"]');
                        $item.querySelector('[data-hy-reference="message"]').innerText = notification['message'];
                        $item.querySelector('[data-hy-reference="timestamp"]').innerText = notification['createdAt'].split('T').join(' ');
                        $item.querySelector('[data-hy-reference="delete"]').addEventListener('click', () => {
                            this.deleteNotifications([notification['id']]);
                        });
                        this.$notificationList.prepend($item);
                    }
                }
            }
            this.$notificationCount.innerText = this.notifications.filter((notification) => notification['read'] === false).length.toLocaleString();
        };
        xhr.open('GET', `${origin}/notification/all`);
        xhr.send();
    }

    loadGroups = () => {
        const $empty = this.$groupList.querySelector(`[data-hy-reference="message"][data-hy-name="empty"]`);
        const $error = this.$groupList.querySelector(`[data-hy-reference="message"][data-hy-name="error"]`);
        this.$groupList.querySelectorAll(`[data-hy-reference="item"]`).forEach(($item) => $item.remove());
        $empty.hide();
        $error.hide();
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            loading.hide();
            if (xhr.status < 200 || xhr.status >= 300) {
                $error.show();
                return;
            }
            const groups = JSON.parse(xhr.responseText);
            if (groups.length === 0) {
                $empty.show();
                return;
            }
            const groupCheckStatuses = JSON.parse(localStorage.getItem('group_check_statuses') ?? '{}');
            const toCheck = groupCheckStatuses['0'] ?? true;
            this.$groupList.innerHTML += `
                <li class="item" data-hy-reference="item" data-hy-id="0">
                    <label class="check" data-hy-object="checkLabel">
                        <input ${toCheck !== false ? 'checked' : ''} required type="checkbox" data-hy-component="checkLabel.input">
                        <span data-hy-component="checkLabel.box"></span>
                        <span data-hy-component="checkLabel.caption">(기본)</span>
                        <span class="-flex-stretch"></span>
                        <span class="color" style="background-color: #a47764;"></span>
                    </label>
                </li>`;
            for (const group of groups) {
                const toCheck = groupCheckStatuses[group['groupId']] ?? true;
                this.$groupList.innerHTML += `
                    <li class="item" data-hy-reference="item" data-hy-id="${group['groupId']}">
                        <label class="check" data-hy-object="checkLabel">
                            <input ${toCheck !== false ? 'checked' : ''} required type="checkbox" data-hy-component="checkLabel.input">
                            <span data-hy-component="checkLabel.box"></span>
                            <span data-hy-component="checkLabel.caption">${group['groupName']}</span>
                            <span class="-flex-stretch"></span>
                            <span class="color" style="background-color: ${'#' + (group['backgroundColor'] ?? 'bdbdbd')}"></span>
                        </label>
                    </li>`;
            }
            this.$groupItemMap = Array.from(this.$groupList.querySelectorAll('[data-hy-reference="item"]')).reduce((map, $item) => (map[$item.dataset['hyId']] = $item, map), {});
            this.$groupList.querySelectorAll(`[data-hy-reference="item"]`).forEach(($item) => {
                const $checkInput = $item.querySelector(`[${HyObject.COMPONENT_ATTR_NAME}="checkLabel.input"]`);
                this.$groupCheckMap[$item.dataset['hyId']] = $checkInput;
                $checkInput.addEventListener('input', () => {
                    const groupCheckStatuses = JSON.parse(localStorage.getItem('group_check_statuses') ?? '{}');
                    groupCheckStatuses[$item.getAttribute('data-hy-id')] = $checkInput.checked;
                    localStorage.setItem('group_check_statuses', JSON.stringify(groupCheckStatuses));
                    document.getElementById('main').querySelectorAll(`[data-hy-reference="calendar"] [data-hy-reference="schedule"][data-hy-group-id="${$item.getAttribute('data-hy-id')}"]`).forEach(($schedule) => $schedule.setVisible($checkInput.checked));
                });
            });
        }
        xhr.open('GET', `${origin}/group/active`);
        xhr.send();
    }
}

window.objectManager = new ObjectManager();
window.dialog = /** @type {HyDialog} */ objectManager.get('dialog');
window.loading = /** @type {HyLoading} */ objectManager.get('loading');
window.asideHandler = new AsideHandler({
    $element: document.getElementById('aside')
});
window.$submenuMap = /** @type {{[p: string]: HTMLElement}} */ Array.from(document.body.querySelectorAll(`[data-hy-reference="submenu"][data-hy-name]`)).reduce((map, $submenu) => (map[$submenu.getAttribute(HyObject.NAME_ATTR_NAME)] = $submenu, map), {});

Object.entries(asideHandler.$menuItemMap).forEach(([name, $menuItem]) => {
    $menuItem.addEventListener('click', () => {
        if ($submenuMap[name] != null && !$submenuMap[name].isVisible()) {
            Object.values(asideHandler.$menuItemMap).forEach(($menuItem) => $menuItem.classList.remove('-selected'));
            Object.values($submenuMap).forEach(($submenu) => $submenu.hide());
            $menuItem.classList.add('-selected');
            $submenuMap[name]?.show();
            asideHandler.menuItemCallbackMap[name]?.();
        }
    });
});

setInterval(() => asideHandler.loadNotifications(), 2500);

asideHandler.loadNotifications();
asideHandler.loadGroups();

import('./index/friend.js');
import('./index/group.js');
import('./index/schedule.js');
import('./index/main/calendar.js');