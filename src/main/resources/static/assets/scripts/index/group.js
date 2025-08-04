import {HyObject} from "../common/object.js";
import {showGroupDetail} from "./group/detail.js";
import {showGroupAddDialog} from "./group/add.js";

{
    const $submenu = $submenuMap['group'];
    const $searchForm = $submenu.querySelector('[data-hy-reference="searchForm"]');
    const loadReceived = () => {
        const $list = $submenu.querySelector(`[data-hy-reference="list"][data-hy-name="received"]`);
        const $empty = $list.querySelector(`[data-hy-reference="message"][data-hy-name="empty"]`);
        const $error = $list.querySelector(`[data-hy-reference="message"][data-hy-name="error"]`);
        loading.show();
        $empty.hide();
        $error.hide();
        $list.querySelectorAll(`[data-hy-reference="item"]`).forEach(($item) => $item.remove());
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
            for (const group of groups) {
                $list.innerHTML += `
                    <li class="item -visible" data-hy-reference="item" data-hy-id="${group['groupId']}">
                        <span class="text-container">
                            <span class="name">${group['groupName']}</span>
                            <span class="host">
                                <span class="nickname">${group['userNickname']}</span>
                                <span class="email">${group['userEmail']}</span>
                            </span>
                        </span>
                        <span class="action-container">
                            <button class="button" name="decline" type="button">
                                <img alt="X" class="icon" draggable="false" src="./assets/images/index/submenu/group/decline.png">
                            </button>
                            <button class="button" name="accept" type="button">
                                <img alt="X" class="icon" draggable="false" src="./assets/images/index/submenu/group/accept.png">
                            </button>
                        </span>
                    </li>`;
            }
            $list.querySelectorAll(`[data-hy-reference="item"]`).forEach(($item) => {
                const $decline = $item.querySelector('button[name="decline"]');
                const $accept = $item.querySelector('button[name="accept"]');
                $decline.addEventListener('click', () => {
                    dialog.showSimpleYesNo('경고', '해당 초대를 정말로 거절할까요?', {
                        onClickYesCallback: () => {
                            loading.show();
                            const xhr = new XMLHttpRequest();
                            const formData = new FormData();
                            formData.append('groupId', $item.dataset['hyId']);
                            xhr.onreadystatechange = () => {
                                if (xhr.readyState !== XMLHttpRequest.DONE) {
                                    return;
                                }
                                loading.hide();
                                if (xhr.status < 200 || xhr.status >= 300) {
                                    dialog.showSimpleOk('오류', '요청을 처리하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
                                    return;
                                }
                                loadReceived();
                            };
                            xhr.open('PUT', `${origin}/group/request`);
                            xhr.send(formData);
                        }
                    });
                });
                $accept.addEventListener('click', () => {
                    dialog.showSimpleYesNo('경고', '해당 초대를 정말로 수락할까요?', {
                        onClickYesCallback: () => {
                            loading.show();
                            const xhr = new XMLHttpRequest();
                            const formData = new FormData();
                            formData.append('groupId', $item.dataset['hyId']);
                            xhr.onreadystatechange = () => {
                                if (xhr.readyState !== XMLHttpRequest.DONE) {
                                    return;
                                }
                                loading.hide();
                                if (xhr.status < 200 || xhr.status >= 300) {
                                    dialog.showSimpleOk('오류', '요청을 처리하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
                                    return;
                                }
                                loadReceived();
                                loadActive();
                            };
                            xhr.open('PATCH', `${origin}/group/request`);
                            xhr.send(formData);
                        }
                    });
                });
            });
        }
        xhr.open('GET', `${origin}/group/received`);
        xhr.send();
    }
    const loadSent = () => {
        const $list = $submenu.querySelector(`[data-hy-reference="list"][data-hy-name="sent"]`);
        const $empty = $list.querySelector(`[data-hy-reference="message"][data-hy-name="empty"]`);
        const $error = $list.querySelector(`[data-hy-reference="message"][data-hy-name="error"]`);
        loading.show();
        $empty.hide();
        $error.hide();
        $list.querySelectorAll(`[data-hy-reference="item"]`).forEach(($item) => $item.remove());
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
            for (const group of groups) {
                $list.innerHTML += `
                    <li class="item" data-hy-reference="item" data-hy-id="${group['groupId']}" data-hy-email="${group['userEmail']}">
                        <span class="text-container">
                            <span class="name">${group['groupName']}</span>
                            <span class="host">
                                <span class="nickname">${group['userNickname']}</span>
                                <span class="email">${group['userEmail']}</span>
                            </span>
                        </span>
                        <span class="action-container">
                            <button class="button" name="cancel" type="button">
                                <img alt="X" class="icon" draggable="false" src="./assets/images/index/submenu/group/cancel.png">
                            </button>
                        </span>
                    </li>`;
            }
            $list.querySelectorAll(`[data-hy-reference="item"]`).forEach(($item) => {
                const $cancel = $item.querySelector('button[name="cancel"]');
                $cancel.addEventListener('click', () => {
                    dialog.showSimpleYesNo('경고', '해당 초대를 정말로 취소할까요?', {
                        onClickYesCallback: () => {
                            loading.show();
                            const xhr = new XMLHttpRequest();
                            const formData = new FormData();
                            formData.append('groupId', $item.dataset['hyId']);
                            formData.append('userEmail', $item.dataset['hyEmail']);
                            xhr.onreadystatechange = () => {
                                if (xhr.readyState !== XMLHttpRequest.DONE) {
                                    return;
                                }
                                loading.hide();
                                if (xhr.status < 200 || xhr.status >= 300) {
                                    dialog.showSimpleOk('오류', '요청을 처리하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
                                    return;
                                }
                                loadSent();
                            };
                            xhr.open('DELETE', `${origin}/group/request`);
                            xhr.send(formData);
                        }
                    });
                });
            });
        }
        xhr.open('GET', `${origin}/group/sent`);
        xhr.send();
    }
    const loadActive = () => {
        const $list = $submenu.querySelector(`[data-hy-reference="list"][data-hy-name="active"]`);
        const $empty = $list.querySelector(`[data-hy-reference="message"][data-hy-name="empty"]`);
        const $error = $list.querySelector(`[data-hy-reference="message"][data-hy-name="error"]`);
        loading.show();
        $empty.hide();
        $error.hide();
        $list.querySelectorAll(`[data-hy-reference="item"]`).forEach(($item) => $item.remove());
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
            for (const group of groups) {
                $list.innerHTML += `
                    <li class="item -visible" data-hy-reference="item" data-hy-id="${group['groupId']}">
                        <span class="text-container">
                            <span class="name">
                                <span class="color"></span>
                                <span class="caption">${group['groupName']}</span>
                                <span class="count">
                                    <img alt="" class="icon" draggable="false" src="./assets/images/index/submenu/group/user-count.png">
                                    <span class="value">${group['userCount'].toLocaleString()}</span>
                                </span>
                            </span>
                            <span class="host">
                                <span class="nickname">${group['userNickname']}</span>
                                ${group['isMine'] === true ? `
                                <span class="mine">
                                    <img alt="" class="icon" draggable="false" src="./assets/images/index/submenu/group/mine.png">
                                </span>` : `
                                <span class="email">${group['userEmail']}</span>`}
                            </span>
                        </span>
                        <span class="action-container">
                            <button class="button" name="detail" type="button">
                                <img alt="X" class="icon" draggable="false" src="./assets/images/index/submenu/group/detail.png">
                            </button>
                        </span>
                    </li>`;
            }
            $list.querySelectorAll(`[data-hy-reference="item"]`).forEach(($item, index) => {
                const group = groups[index];
                const $detail = $item.querySelector('button[name="detail"]');
                $item.querySelector(':scope > .text-container > .name > .color').style.backgroundColor = `#${group['backgroundColor'] ?? 'ffffff'}`;
                $detail.addEventListener('click', () => showGroupDetail(group).then(() => {
                    loadSent();
                    loadReceived();
                    loadActive();
                }));
            });
        }
        xhr.open('GET', `${origin}/group/active`);
        xhr.send();
    }
    $submenu.querySelector('[data-hy-reference="close"]').addEventListener('click', () => {
        $submenu.hide();
        asideHandler.$menuItemMap['group'].classList.remove('-selected');
    });
    $submenu.querySelector('[data-hy-reference="addGroup"]').addEventListener('click', () => showGroupAddDialog().then(() => loadActive()));
    $searchForm.addEventListener('submit' ,(e) => {
        e.preventDefault();
        const $list = $submenu.querySelector(`[data-hy-reference="list"][data-hy-name="active"]`);
        const $empty = $list.querySelector(`[data-hy-reference="message"][data-hy-name="empty"]`);
        const $items = Array.from($list.querySelectorAll('[data-hy-reference="item"]'));
        $items.forEach(($item) => {
            $item.setVisible($searchForm['keyword'].value === '' || $item.innerText.toLowerCase().replaceAll(' ', '').includes($searchForm['keyword'].value.toLowerCase().replaceAll(' ', '')));
        });
        $empty.setVisible($items.every(($item) => !$item.isVisible()));
    });
    asideHandler.menuItemCallbackMap['group'] = () => {
        loadReceived();
        loadSent();
        loadActive();
    }
    asideHandler.menuItemCallbackMap['group'](); // TODO : Dev Only
}