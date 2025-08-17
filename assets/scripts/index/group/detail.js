import {HyObject} from "../../common/object.js";
import {showGroupModifyDialog} from "./detail/modify.js";
import {showGroupAddDialog} from "./detail/add.js";
import {showGroupKickDialog} from "./detail/kick.js";
import {showGroupCancelDialog} from "./detail/cancel.js";
import {showGroupUnregisterDialog} from "./detail/unregister.js";

export const showGroupDetail = (group) => new Promise((resolve, reject) => {
    const loadActiveUsers = new Promise((resolve, reject) => {
        const url = new URL(`${origin}/group/users`);
        url.searchParams.set('groupId', group['groupId']);
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            if (xhr.status < 200 || xhr.status >= 300) {
                reject?.();
            }
            resolve?.(JSON.parse(xhr.responseText));
        };
        xhr.open('GET', url);
        xhr.send();
    });
    const loadSentUsers = new Promise((resolve, reject) => {
        const url = new URL(`${origin}/group/sent`);
        url.searchParams.set('groupId', group['groupId']);
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            if (xhr.status < 200 || xhr.status >= 300) {
                reject?.();
            }
            resolve?.(JSON.parse(xhr.responseText));
        };
        xhr.open('GET', url);
        xhr.send();
    });
    Promise.all([loadActiveUsers, loadSentUsers]).then(([activeUsers, sentUsers]) => {
        sentUsers = sentUsers.filter((user) => user['groupId'] === group['groupId']);
        const $groupModal = dialog.show({
            title: '그룹 상세',
            content: `
                <div class="title-wrapper ${group['isMine'] === true ? 'mine' : ''}">
                    <h2 class="title" data-hy-reference="groupName">${group['groupName']}</h2>
                    <div class="users">
                        <img alt="" class="icon" draggable="false" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAABnElEQVR4nO2SPWgVURCFn4qKWohgI4oIWqlgY+1Po02sA9poES2CsbKU11lo9QTBC+6eb+6yzW3EIo2IjaminaRRsBHBIggihIA/T0Y28rzuPhOwkndgijtzzznDzPR6E0zwzxFC2Arsz/NlWV6Q9EDS7RjjkfVw/kBRFCeAD8AQeOJEzwP9JvczJH02s5PjOK2Q9DgTulRV1T5JX0bzTe1ZF2ecwfPs85yZnc/Fm9qnLk6nAXBl5ONHn2uM8XibAbDUxRm7B+AscEPSIX8Ph8NNwNMWg6tdnFaEEHYDdyS9AVYlvTKzaa/Vdb0HkKRl4LWkWTeOMe6SdBd4L2kFWCzL8qLXfhNPKe2Q9CLr8JufZQhhZ7/f3+yjMrMpSWeqqjrQdH4MeNmyn1v5WK61iF9OKW2RdFPSu5YRLZjZ6ZTSNuBRZvC1ruu9owYPM/I9FwfmOxY82shMM6q3We3cL4OiKI4CEUgeZnZQ0vW/iK/Fqv/3fa3xfS+DwWD72GuSdH+dBh6nehsFcNgXL+l7l3BzOYWPc8MGE/w/+AFB4TAA3KxRfQAAAABJRU5ErkJggg==">
                        <span class="count">${activeUsers.length.toLocaleString()} (${sentUsers.length.toLocaleString()})</span>                                
                    </div>
                    <div class="-flex-stretch" role="none"></div>
                    <div class="action-container">
                        <button class="button" name="modify" data-hy-object="button" data-hy-color="cornflowerBlue" data-hy-reference="groupModify">
                            <img alt="" class="icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAt0lEQVR4nO2TMQrCQBBFpxFPYWdjI1YpvYNV4kG0TYhVDiCewFIrb2Rh4Q0C8cnCLC6LWpjZQshrBqZ4s//DigyICFAADTAxLwSoeHEFppbybSAPj9gkAebA/c2Rpq84B0ZfjhQWnV+Ase5mwE33pYXcc46SbCzlxElSyD15Snk5yM1rcZ+o4zPVz/LgyCmZ3AEcUr18qTMD9sAReFjJF0ALrKL9urdcRbVW0fokpmiCnZvmcvlnnq8KBAR+qmpKAAAAAElFTkSuQmCC" data-hy-component="button.icon">
                        </button>
                        <button class="button" name="delete" data-hy-object="button" data-hy-color="roseTan" data-hy-reference="groupDelete">
                            <img alt="" class="icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAd0lEQVR4nO2VsQnAIBBFXcNGkhmcLNkkpQPoLCncwVFeECyCETSmSKEPPlic9+A3J8QQABI4AJMS37J3mQN8lsCTUJhzLQJb+OgbY8XvAOrWtXkZ1SLQ9KOnoMasqMqsqMogFa0fBEtVkCQ7cL64A3F2a1o+ERkXj58itwLSrJAAAAAASUVORK5CYII=" data-hy-component="button.icon">
                        </button>
                    </div>
                </div>
                <div class="host">
                    <span class="nickname">${group['userNickname']}</span>
                    <span class="email">${group['userEmail']}</span>
                </div>
                <div class="user-grid ${group['isMine'] === true ? 'mine' : ''}">
                    <ul class="users active" data-hy-reference="activeList"> 
                        <li class="title">활성 사용자</li>
                        ${activeUsers.length === 0 ? '<li class="message -visible" data-hy-reference="message" data-hy-name="empty">표시할 항목이 없습니다.</li>' : ''}
                        ${activeUsers.map((user) => `
                        <li class="item" data-hy-reference="item">
                            <span class="nickname">${user['userNickname']}</span>
                            <span class="email">${user['userEmail']}</span>
                            <span class="-flex-stretch" role="none"></span>
                            <div class="action-container">
                                <button class="button" name="kick" type="button" data-hy-reference="kick">
                                    <img alt="X" class="icon" draggable="false" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAkUlEQVR4nGNgGBHA1tZW0snJaaKTk9NMKJ4IEiPLMCcnp2VOTk5n0PB9Jyen/2j4PhZ1y4ixYCkWjWeIxEsZBhy4uLjIIYX1TFIwSC9BCxwdHY2xhPd/YjBI76gF/0eDiGE0FTGMZjQnSosKV1dXRXLLInt7ewWiSlRnZ+ciJyenEyTUAyccHR0LiTJ8FDCgAQCdob7keqm5mgAAAABJRU5ErkJggg==">
                                </button>
                            </div>
                        </li>`).join('')}
                    </ul>
                    <ul class="users sent" data-hy-reference="sentList">
                        <li class="title">보낸 초대</li>
                        ${sentUsers.length === 0 ? '<li class="message -visible" data-hy-reference="message" data-hy-name="empty">표시할 항목이 없습니다.</li>' : ''}
                        ${sentUsers.map((user) => `
                        <li class="item" data-hy-reference="item">
                            <span class="nickname">${user['userNickname']}</span>
                            <span class="email">${user['userEmail']}</span>
                            <span class="-flex-stretch" role="none"></span>
                            <div class="action-container">
                                <button class="button" name="cancel" type="button" data-hy-reference="cancel">
                                    <img alt="X" class="icon" draggable="false" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAkUlEQVR4nGNgGBHA1tZW0snJaaKTk9NMKJ4IEiPLMCcnp2VOTk5n0PB9Jyen/2j4PhZ1y4ixYCkWjWeIxEsZBhy4uLjIIYX1TFIwSC9BCxwdHY2xhPd/YjBI76gF/0eDiGE0FTGMZjQnSosKV1dXRXLLInt7ewWiSlRnZ+ciJyenEyTUAyccHR0LiTJ8FDCgAQCdob7keqm5mgAAAABJRU5ErkJggg==">
                                </button>
                            </div>
                        </li>`).join('')}
                    </ul>
                </div>
                <div class="button-container ${group['isMine'] === true ? 'mine' : ''}">
                    <button class="button add" name="add" data-hy-object="button" data-hy-color="tendril" data-hy-reference="add">
                        <img alt="" class="icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAcUlEQVR4nO2TUQqAIBAF/THowEZGdA8v5nUmRCMhSQgloh0Q9kMY9vFWqd8AjMAGrGHuIVg4mXsIXCZwIriARAQMwJSiKD2ftcjf/DOALmVsaYd9RaDTen0iqoHUtAYSUQ1i/Q6Mag3xTsIxzo96/ll2UpEZ5FoniRwAAAAASUVORK5CYII=" data-hy-component="button.icon">
                        <span data-hy-component="button.caption">사용자 초대</span>
                    </button>
                    <button class="button unregister" name="unregister" data-hy-object="button" data-hy-color="mochaMousse" data-hy-reference="unregister">
                        <img alt="" class="icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAcUlEQVR4nO2TUQqAIBAF/THowEZGdA8v5nUmRCMhSQgloh0Q9kMY9vFWqd8AjMAGrGHuIVg4mXsIXCZwIriARAQMwJSiKD2ftcjf/DOALmVsaYd9RaDTen0iqoHUtAYSUQ1i/Q6Mag3xTsIxzo96/ll2UpEZ5FoniRwAAAAASUVORK5CYII=" data-hy-component="button.icon">
                        <span data-hy-component="button.caption">그룹 탈퇴</span>
                    </button>
                    <div class="-flex-stretch" role="none"></div>
                    <button class="button" name="close" data-hy-object="button" data-hy-color="gray" data-hy-reference="close">
                        <img alt="" class="icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAArElEQVR4nO2UUQrCMBQEWynUXkMs6vWr9iO3EPQ8I49GUHgmKzbiR/ez2czktSVVteQvAzTAHqiF7ip2GxW+Bi5MOQNdotsBY+zanlYRbHlN8CQRbmvP2ahTDCkJPnyQ4BHQAidPklqTBYlThjfPPoNnJpkHLkjC1/DigqKvqOhHpuRvCtQ5AP50R1VwUE6HL9mpl93tcSryl511LFfbq05hkl4qT/1ehi/5ee7tVF1U73rqfgAAAABJRU5ErkJggg==" data-hy-component="button.icon">
                        <span data-hy-component="button.caption">닫기</span>
                    </button>
                </div>`,
            isContentHtml: true
        });
        $groupModal.classList.add('group-detail');
        if (group['isMine'] === true) {
            const $modifyButton = $groupModal.querySelector('[data-hy-reference="groupModify"]');
            const $deleteButton = $groupModal.querySelector('[data-hy-reference="groupDelete"]');
            $modifyButton.addEventListener('click', () => showGroupModifyDialog(group).then((response) => {
                if (response.result === 'success') {
                    dialog.hide($groupModal);
                    showGroupDetail(group).then(() => resolve?.()).catch(() => reject?.());
                }
            }));
            $deleteButton.addEventListener('click', () => dialog.showSimpleYesNo('삭제', '정말로 그룹을 삭제할까요?', {
                onClickYesCallback: () => {
                    loading.show();
                    fetch(`${origin}/group/?id=${group['groupId']}`, {method: 'DELETE'}).then((response) => {
                        if (!response.ok) {
                            throw new Error();
                        }
                        return response.json();
                    }).then((response) => {
                        switch (response['result']) {
                            case 'failure':
                                dialog.showSimpleOk('경고', '알 수 없는 이유로 그룹을 삭제하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
                                break;
                            case 'success':
                                dialog.showSimpleOk('알림', '그룹을 성공적으로 삭제하였습니다.');
                                dialog.hide($groupModal);
                                resolve?.();
                                break;
                            default:
                                dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
                        }
                    }).catch(() => {
                        dialog.showSimpleOk('오류', '요청을 처리하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
                    }).finally(() => loading.hide());
                }
            }));
            const $activeItems = Array.from($groupModal.querySelectorAll('[data-hy-reference="activeList"] > [data-hy-reference="item"]'));
            const $sentItems = Array.from($groupModal.querySelectorAll('[data-hy-reference="sentList"] > [data-hy-reference="item"]'));
            $activeItems.forEach(($item, index) => {
                const $kickButton = $item.querySelector(`[data-hy-reference="kick"]`);
                $kickButton.addEventListener('click', () => showGroupKickDialog(group, activeUsers[index]).then((response) => {
                    if (response.result === 'success') {
                        dialog.hide($groupModal);
                        showGroupDetail(group).then(() => resolve?.()).catch(() => reject?.());
                    }
                }));
            });
            $sentItems.forEach(($item, index) => {
                const $cancelButton = $item.querySelector(`[data-hy-reference="cancel"]`);
                $cancelButton.addEventListener('click', () => showGroupCancelDialog(group, sentUsers[index]).then(() => {
                    dialog.hide($groupModal);
                    showGroupDetail(group).then(() => resolve?.()).catch(() => reject?.());
                }));
            });
            const $addButton = $groupModal.querySelector(`[data-hy-reference="add"]`);
            $addButton.addEventListener('click', () => showGroupAddDialog(group).then((response) => {
                if (response?.result === 'success') {
                    dialog.hide($groupModal);
                    showGroupDetail(group).then(() => resolve?.()).catch(() => reject?.());
                }
            }));
        } else {
            const $unregisterButton = $groupModal.querySelector(`[data-hy-reference="unregister"]`);
            $unregisterButton.addEventListener('click', () => showGroupUnregisterDialog(group).then((response) => {
                if (response.result === 'success') {
                    dialog.hide($groupModal);
                    showGroupDetail(group).then(() => resolve?.()).catch(() => reject?.());
                }
            }));
        }
        const $closeButton = $groupModal.querySelector(`[data-hy-reference="close"]`);
        $closeButton.addEventListener('click', () => {
            dialog.hide($groupModal);
            resolve?.();
        });
    }).catch((error) => {
        dialog.showSimpleOk('오류', '요청을 처리하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
        throw error;
    }).finally(() => loading.hide());
    loading.show();
});