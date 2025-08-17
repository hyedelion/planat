import {HyObject} from "./common/object.js";
import {ObjectManager} from "./common/object-manager.js";
import {HyLabel} from "./common/object/label.js";

class AsideHandler {
    $element;
    $userMenu;
    $userMenuItemMap;
    $notification;
    $notificationList;
    $notificationDeleteAllAction;
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
        this.$userMenu = this.$element.querySelector('[data-hy-reference="userMenu"]');
        this.$userMenuItemMap = {};
        this.$userMenu.querySelectorAll('[data-hy-reference="item"][data-hy-name]').forEach(($item) => {
            const name = $item.getAttribute('data-hy-name');
            this.$userMenuItemMap[name] = $item;
        });
        this.$notification = this.$element.querySelector('[data-hy-reference="notification"]');
        this.$notificationList = this.$element.querySelector('[data-hy-reference="notificationList"]');
        this.$notificationDeleteAllAction = this.$notificationList.querySelector('[data-hy-reference="deleteAllAction"]');
        this.$notificationCount = this.$element.querySelector('[data-hy-reference="notificationCount"]');
        this.$menuItemMap = /** @type {{[p: string]: HTMLElement}} */ Array.from(this.$element.querySelectorAll('[data-hy-reference="menuItem"][data-hy-name]')).reduce((map, $menuItem) => (map[$menuItem.getAttribute(HyObject.NAME_ATTR_NAME)] = $menuItem, map), {});
        this.$groupList = this.$element.querySelector(`[data-hy-reference="groupList"]`);

        this.$userMenuItemMap['myPage'].addEventListener('click', this.#userMenuMyPageOnClick);
        this.$notification.addEventListener('click', this.#notificationOnClick);
        this.$notificationList.addEventListener('focusout', this.#notificationListOnFocusout);
        this.$notificationDeleteAllAction.addEventListener('click', this.#deleteAllActionOnClick);
    }

    #userMenuMyPageOnClick = () => {
        const $dialog = dialog.show({
            title: '마이페이지',
            content: `
                <form novalidate class="form" data-hy-reference="form">
                    <div class="address-find-dialog" data-hy-reference="addressFindDialog">
                        <div class="modal" data-hy-reference="modal"></div>
                    </div>
                    <div class="separator" role="none"></div>
                    <label data-hy-object="label" data-hy-name="currentPassword">
                        <span data-hy-component="label.caption">현재 비밀번호</span>
                        <input autocomplete="off" class="-flex-stretch" maxlength="50" minlength="6" name="password" placeholder="현재 비밀번호를 입력해 주세요." type="password" data-hy-object="field" data-hy-component="label.field">
                        <span data-hy-component="label.message">현재 비밀번호를 입력해 주세요.</span>
                    </label>
                    <label class="toggler password-check" data-hy-object="checkLabel" data-hy-name="passwordChangeCheck">
                        <input required name="passwordChangeCheck" type="checkbox" data-hy-component="checkLabel.input">
                        <span data-hy-component="checkLabel.box"></span>
                        <span data-hy-component="checkLabel.caption">비밀번호 변경하기</span>
                    </label>
                    <div class="toggleable">
                        <label data-hy-object="label" data-hy-name="password">
                            <input autocomplete="off" class="-flex-stretch" maxlength="50" minlength="6" name="password" placeholder="변경할 비밀번호를 입력해 주세요." type="password" data-hy-object="field" data-hy-component="label.field">
                            <span data-hy-component="label.message">변경할 비밀번호를 입력해 주세요.</span>
                        </label>
                        <label data-hy-object="label" data-hy-name="passwordCheck">
                            <input autocomplete="off" class="-flex-stretch" maxlength="50" minlength="6" name="passwordCheck" placeholder="변경할 비밀번호를 한 번 더 입력해 주세요." type="password" data-hy-object="field" data-hy-component="label.field">
                            <span data-hy-component="label.message">변경할 비밀번호를 한 번 더 입력해 주세요.</span>
                        </label>
                    </div>
                    <div class="separator" role="none"></div>
                    <label data-hy-object="label" data-hy-name="nickname">
                        <span data-hy-component="label.caption">닉네임</span>
                        <input autocomplete="off" class="-flex-stretch" maxlength="10" minlength="2" name="nickname" placeholder="닉네임을 입력해 주세요." type="text" value="${document.head.querySelector('meta[name="_user.nickname"]').getAttribute('content')}" data-hy-object="field" data-hy-component="label.field">
                        <span data-hy-component="label.message">닉네임을 입력해 주세요.</span>
                        <span data-hy-component="label.description">입력하신 닉네임은 다른 회원에게 표시되며 친구 추가 등에 활용될 수 있으므로 신중하게 선택해 주세요.</span>
                    </label>
                    <div class="separator" role="none"></div>
                    <label data-hy-object="label" data-hy-name="addressPostal">
                        <span data-hy-component="label.caption">주소</span>
                        <span data-hy-component="label.row">
                            <input readonly required autocomplete="off" class="-flex-stretch" inputmode="numeric" maxlength="5" minlength="5" name="addressPostal" placeholder="우편번호 찾기 버튼을 클릭해 주세요." value="${document.head.querySelector('meta[name="_user.addressPostal"]').getAttribute('content')}" type="text" data-hy-object="field" data-hy-component="label.field">
                            <button name="addressFind" type="button" data-hy-object="button" data-hy-color="main">
                                <span data-hy-component="button.caption">우편번호 찾기</span>
                            </button>
                        </span>
                        <span data-hy-component="label.message"></span>
                    </label>
                    <label data-hy-object="label" data-hy-name="addressPrimary">
                        <input readonly required autocomplete="off" class="-flex-stretch" maxlength="100" minlength="10" name="addressPrimary" placeholder="우편번호 찾기 버튼을 클릭해 주세요." value="${document.head.querySelector('meta[name="_user.addressPrimary"]').getAttribute('content')}" type="text" data-hy-object="field" data-hy-component="label.field">
                        <span data-hy-component="label.message"></span>
                    </label>
                    <label data-hy-object="label" data-hy-name="addressSecondary">
                        <input autocomplete="off" class="-flex-stretch" maxlength="100" minlength="0" name="addressSecondary" placeholder="상세 주소를 입력해 주세요. (건물 이름, 동, 호수 등)" value="${document.head.querySelector('meta[name="_user.addressSecondary"]').getAttribute('content')}" type="text" data-hy-object="field" data-hy-component="label.field">
                    </label>
                </form>`,
            isContentHtml: true,
            buttons: [
                {
                    caption: '취소',
                    onClickCallback: ($dialog) => {
                        dialog.hide($dialog);
                    }
                },
                {
                    caption: '수정',
                    color: 'mochaMousse',
                    onClickCallback: ($dialog) => {
                        $form.dispatchEvent(new Event('submit'));
                    }
                }
            ]
        });
        $dialog.classList.add('my-page');
        const $form = $dialog.querySelector('[data-hy-reference="form"]');
        $form['addressFind'].addEventListener('click', () => {
            const $addressFindDialog = $form.querySelector(`[data-hy-reference="addressFindDialog"]`);
            const $modal = $addressFindDialog.querySelector(`[data-hy-reference="modal"]`);
            $addressFindDialog.onclick = (e) => {
                if (e.target === e.currentTarget) {
                    $addressFindDialog.hide();
                }
            }
            // noinspection JSUnusedGlobalSymbols
            new daum.Postcode({
                width: '100%',
                height: '100%',
                oncomplete: (data) => {
                    $form['addressPostal'].value = data['zonecode'];
                    $form['addressPrimary'].value = data['roadAddress'];
                    $form['addressSecondary'].focus();
                    $addressFindDialog.hide();
                }
            }).embed($modal);
            $addressFindDialog.show();
        });
        $form.addEventListener('submit', (e) => {
            e.preventDefault();
            /** @type {{[p: string]: HyLabel}} */
            const labelMap = {};
            $form.querySelectorAll('[data-hy-object="label"][data-hy-name]').forEach(($label) => {
                const name = $label.getAttribute('data-hy-name');
                labelMap[name] = new HyLabel({
                    $element: $label
                });
            });
            Object.values(labelMap).forEach((label) => label.setInvalid(false));
            if (labelMap['currentPassword'].$field.value === '') {
                labelMap['currentPassword'].setInvalid(true).$message.innerText = '현재 비밀번호를 입력해 주세요.';
            }
            if ($form['passwordChangeCheck'].checked === true) {
                if (labelMap['password'].$field.value === '') {
                    labelMap['password'].setInvalid(true).$message.innerText = '신규 비밀번호를 입력해 주세요.';
                } else if (!/^([\da-zA-Z`~!@#$%^&*\(\)\-_=+\[\{\]\}\\\|;:'",<.>\/?]{8,50})$/.test(labelMap['password'].$field.value)) {
                    labelMap['password'].setInvalid(true).$message.innerText = '올바른 신규 비밀번호를 입력해 주세요.';
                } else if (labelMap['passwordCheck'].$field.value === '') {
                    labelMap['passwordCheck'].setInvalid(true).$message.innerText = '신규 비밀번호를 한 번 더 입력해 주세요.';
                } else if (labelMap['password'].$field.value !== labelMap['passwordCheck'].$field.value) {
                    labelMap['passwordCheck'].setInvalid(true).$message.innerText = '신규 비밀번호가 일치하지 않습니다.';
                } else if (labelMap['currentPassword'].$field.value === labelMap['password'].$field.value) {
                    labelMap['password'].setInvalid(true).$message.innerText = '입력하신 신규 비밀번호가 현재 비밀번호와 같습니다.';
                }
            }
            if (labelMap['nickname'].$field.value === '') {
                labelMap['nickname'].setInvalid(true).$message.innerText = '닉네임을 입력해 주세요.';
            } else if (!/^([\da-zA-Z가-힣]{2,10})$/.test(labelMap['nickname'].$field.value)) {
                labelMap['nickname'].setInvalid(true).$message.innerText = '올바른 닉네임을 입력해 주세요.';
            }
            if (labelMap['addressPostal'].$field.value === '') {
                labelMap['addressPostal'].setInvalid(true).$message.innerText = '우편번호 찾기 버튼을 클릭하여 주소를 완성해 주세요.';
            }
            if (labelMap['addressPrimary'].$field.value === '') {
                labelMap['addressPrimary'].setInvalid(true).$message.innerText = '우편번호 찾기 버튼을 클릭하여 주소를 완성해 주세요.';
            }
            if (Object.values(labelMap).some((label) => label.isInvalid() === true)) {
                return;
            }
            loading.show();
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append('currentPassword', $form['currentPassword'].value);
            formData.append('nickname', $form['nickname'].value);
            formData.append('addressPostal', $form['addressPostal'].value);
            formData.append('addressPrimary', $form['addressPrimary'].value);
            formData.append('addressSecondary', $form['addressSecondary'].value);
            if ($form['changePasswordCheck'].checked === true) {
                formData.append('password', $form['password'].value);
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
                        dialog.showSimpleOk('경고', '알 수 없는 이유로 개인 정보를 수정하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
                        break;
                    case 'failure_duplicate':
                        dialog.showSimpleOk('경고', '입력하신 닉네임은 이미 다른 회원에 의해 사용 중입니다.');
                        break;
                    case 'failure_wrong_password':
                        dialog.showSimpleOk('경고', '비밀번호가 올바르지 않습니다.');
                        break;
                    case 'success':
                        dialog.showSimpleOk('알림', '개인 정보를 성공적으로 수정하였습니다. 확인 버튼을 클릭하면 페이지를 다시 불러옵니다.', {
                            onClickOkCallback: () => {
                                location.reload();
                            }
                        });
                        break;
                    default:
                        dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
                }
            }
            xhr.open('PATCH', `${origin}/user/`);
            xhr.send(formData);
        })
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
// import('./index/schedule.js');
import('./index/side.js');
import('./index/main/calendar.js');