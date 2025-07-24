import {HyLabel} from "../../../common/object/label.js";

export const showGroupModifyDialog = (group) => new Promise((resolve, reject) => {
    const $modifyModal = dialog.show({
        title: '그룹 수정',
        content: `
            <span class="message">수정할 이름을 입력해 주세요. 기존에 사용하던 이름이랑 같거나, 다른 그룹에서 사용 중인 이름을 사용할 수 없습니다.</span>
            <form novalidate class="form" data-hy-reference="form">
                <label data-hy-object="label" data-hy-name="value" data-hy-reference="nameLabel">
                    <span data-hy-component="label.caption">그룹 이름</span>
                    <input autocomplete="off" class="-flex-stretch" maxlength="10" minlength="1" name="name" placeholder="그룹 이름을 입력해 주세요." type="text" value="${group['groupName']}" data-hy-object="field" data-hy-component="label.field">
                    <span data-hy-component="label.message">그룹 이름을 입력해 주세요.</span>
                </label>
            </form>`,
        isContentHtml: true,
        buttons: [
            {
                caption: '취소',
                onClickCallback: ($modifyModal) => {
                    dialog.hide($modifyModal);
                    reject?.();
                }
            },
            {
                caption: '수정하기',
                color: 'mochaMousse',
                onClickCallback: ($modifyModal) => {
                    const $form = $modifyModal.querySelector('[data-hy-reference="form"]');
                    const nameLabel = /** @type {HyLabel} */ new HyLabel({$element: $form.querySelector('[data-hy-reference="nameLabel"]')});
                    nameLabel.setInvalid(false);
                    if (nameLabel.$field.value === '') {
                        nameLabel.setInvalid(true).$message.innerText = '그룹 이름을 입력해 주세요.';
                    } else if (!/^(.{1,10})$/.test(nameLabel.$field.value)) {
                        nameLabel.setInvalid(true).$message.innerText = '올바른 그룹 이름을 입력해 주세요.';
                    } else if ($form['name'].value === group['groupName']) {
                        nameLabel.setInvalid(true).$message.innerText = '기존에 사용하던 이름과 같습니다.';
                    }
                    if (nameLabel.isInvalid()) {
                        return;
                    }
                    const xhr = new XMLHttpRequest();
                    const formData = new FormData();
                    formData.append('id', group['groupId']);
                    formData.append('name', $form['name'].value);
                    xhr.onreadystatechange = () => {
                        if (xhr.readyState !== XMLHttpRequest.DONE) {
                            return;
                        }
                        loading.hide();
                        if (xhr.status < 200 || xhr.status >= 300) {
                            dialog.showSimpleOk('오류', '요청을 처리하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.', {onClickOkCallback: () => resolve?.(response)});
                            return;
                        }
                        const response = JSON.parse(xhr.responseText);
                        switch (response.result) {
                            case 'failure':
                                dialog.showSimpleOk('경고', '알 수 없는 이유로 그룹을 수정하지 못하였습니다.', {onClickOkCallback: () => resolve?.(response)});
                                break;
                            case 'failure_duplicate':
                                dialog.showSimpleOk('경고', '이미 사용 중인 이름입니다.', {onClickOkCallback: () => resolve?.(response)});
                                break;
                            case 'success':
                                dialog.showSimpleOk('알림', '그룹을 성공적으로 수정하였습니다.', {
                                    onClickOkCallback: () => {
                                        dialog.hide($modifyModal);
                                        resolve?.(response);
                                    }
                                });
                                break;
                            default:
                                dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.', {onClickOkCallback: () => resolve?.(response)});
                        }
                    };
                    xhr.open('PATCH', `${origin}/group/`);
                    xhr.send(formData);
                }
            }
        ]
    });
    $modifyModal.classList.add('group-detail-modify');
});