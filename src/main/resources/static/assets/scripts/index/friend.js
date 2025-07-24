import {HyObject} from "../common/object.js";
import {showFriendCancelDialog} from "./friend/cancel.js";
import {showFriendAcceptDialog} from "./friend/accept.js";
import {showFriendDeclineDialog} from "./friend/decline.js";
import {showFriendAddDialog} from "./friend/add.js";

{
    const $submenu = $submenuMap['friend'];
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
            const friends = JSON.parse(xhr.responseText);
            if (friends.length === 0) {
                $empty.show();
                return;
            }
            for (const friend of friends) {
                $list.innerHTML += `
                    <li class="item -visible" data-hy-reference="item" data-hy-requester="${friend['requesterUserEmail']}">
                        <span class="text-container">
                            <span class="nickname">${friend['requesterUserNickname']}</span>
                            <span class="email">${friend['requesterUserEmail']}</span>
                        </span>
                        <span class="action-container">
                            <button class="button" name="decline" type="button">
                                <img alt="X" class="icon" draggable="false" src="./assets/images/index/submenu/friend/decline.png">
                            </button>
                            <button class="button" name="accept" type="button">
                                <img alt="X" class="icon" draggable="false" src="./assets/images/index/submenu/friend/accept.png">
                            </button>
                        </span>
                    </li>`;
            }
            $list.querySelectorAll(`[data-hy-reference="item"]`).forEach(($item) => {
                const $decline = $item.querySelector('button[name="decline"]');
                const $accept = $item.querySelector('button[name="accept"]');
                $decline.addEventListener('click', () => showFriendDeclineDialog($item.dataset['hyRequester']).then((response) => {
                    if (response.result === 'success') {
                        loadReceived();
                    }
                }));
                $accept.addEventListener('click', () => showFriendAcceptDialog($item.dataset['hyRequester']).then((response) => {
                    if (response.result === 'success') {
                        loadReceived();
                        loadActive();
                    }
                }));
            });
        }
        xhr.open('GET', `${origin}/friend/received`);
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
            const friends = JSON.parse(xhr.responseText);
            if (friends.length === 0) {
                $empty.show();
                return;
            }
            for (const friend of friends) {
                $list.innerHTML += `
                    <li class="item -visible" data-hy-reference="item" data-hy-requestee="${friend['requesteeUserEmail']}">
                        <span class="text-container">
                            <span class="nickname">${friend['requesteeUserNickname']}</span>
                            <span class="email">${friend['requesteeUserEmail']}</span>
                        </span>
                        <span class="action-container">
                            <button class="button" name="cancel" type="button">
                                <img alt="X" class="icon" draggable="false" src="./assets/images/index/submenu/friend/cancel.png">
                            </button>
                        </span>
                    </li>`;
            }
            $list.querySelectorAll(`[data-hy-reference="item"]`).forEach(($item) => {
                const $cancel = $item.querySelector('button[name="cancel"]');
                $cancel.addEventListener('click', () => showFriendCancelDialog($item.dataset['hyRequestee']).then((response) => {
                    if (response.result === 'success') {
                        loadSent();
                    }
                }));
            });
        }
        xhr.open('GET', `${origin}/friend/sent`);
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
            const friends = JSON.parse(xhr.responseText);
            if (friends.length === 0) {
                $empty.show();
                return;
            }
            for (const friend of friends) {
                $list.innerHTML += `
                    <li class="item -visible" data-hy-reference="item" data-hy-requester="${friend['requesterUserEmail']}">
                        <span class="text-container">
                            <span class="user">
                                <span class="status ${friend['online'] === true ? 'online' : ''}"></span>
                                <span class="nickname">${friend['requesterUserNickname'] ?? friend['requesteeUserNickname']}</span>
                            </span>
                            <span class="email">${friend['requesterUserEmail'] ?? friend['requesteeUserEmail']}</span>
                        </span>
                        <span class="action-container">
                            <button class="button" name="chat" type="button">
                                <img alt="X" class="icon" draggable="false" src="./assets/images/index/submenu/friend/chat.png">
                            </button>
                            <button class="button" name="detail" type="button">
                                <img alt="X" class="icon" draggable="false" src="./assets/images/index/submenu/friend/detail.png">
                            </button>
                        </span>
                    </li>`;
            }
            $list.querySelectorAll(`[data-hy-reference="item"]`).forEach(($item) => {
                const $detail = $item.querySelector('button[name="detail"]');
                $detail.addEventListener('click', () => {
                    alert(`${$item.dataset['hyId']} - 상세 정보 보여주기`);
                });
            });
        }
        xhr.open('GET', `${origin}/friend/active`);
        xhr.send();
    }
    $submenu.querySelector('[data-hy-reference="close"]').addEventListener('click', () => {
        $submenu.hide();
        asideHandler.$menuItemMap['friend'].classList.remove('-selected');
    });
    $submenu.querySelector('[data-hy-reference="addFriend"]').addEventListener('click', () => showFriendAddDialog().then(() => {
        loadSent();
        loadActive();
    }));
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
    asideHandler.menuItemCallbackMap['friend'] = () => {
        loadReceived();
        loadSent();
        loadActive();
    }
    asideHandler.menuItemCallbackMap['friend'](); // TODO : Dev Only
}