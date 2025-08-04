import {HyLabel} from "../../common/object/label.js";

export const showFriendAddDialog = () => new Promise((resolve, reject) => {
    const $addModal = dialog.show({
        title: '친구 추가',
        content: `
            <span class="message">친구로 추가할 사용자 이메일 혹은 닉네임을 입력해 주세요. 초대를 받은 사용자가 수락하여야 친구가 됩니다.</span>
            <form class="form" data-hy-reference="form">
                <label data-hy-object="label" data-hy-name="value" data-hy-reference="valueLabel">
                    <span data-hy-component="label.caption">이메일 혹은 닉네임</span>
                    <input autocomplete="email" class="-flex-stretch" maxlength="50" minlength="8" name="value" placeholder="이메일 혹은 닉네임을 입력해 주세요." type="text" data-hy-object="field" data-hy-component="label.field">
                    <span data-hy-component="label.message">이메일 혹은 닉네임을 입력해 주세요.</span>
                </label>
            </form>`,
        isContentHtml: true,
        buttons: [
            {
                caption: '취소',
                onClickCallback: ($modal) => {
                    dialog.hide($modal);
                    reject?.();
                }
            },
            {
                caption: '추가',
                color: 'mochaMousse',
                onClickCallback: () => {
                    const $form = $addModal.querySelector('[data-hy-reference="form"]');
                    const valueLabel = /** @type {HyLabel} */ new HyLabel({$element: $form.querySelector('[data-hy-reference="valueLabel"]')});
                    const formData = new FormData();
                    valueLabel.setInvalid(false);
                    if ($form['value'].value === '') {
                        valueLabel.setInvalid(true).$message.innerText = '이메일 혹은 닉네임을 입력해 주세요.';
                    }
                    if (/^(?=.{8,50}$)([\da-z\-_.]{4,})@([\da-z][\da-z\-]*[\da-z]\.)?([\da-z][\da-z\-]*[\da-z])\.([a-z]{2,15})(\.[a-z]{2,3})?$/.test($form['value'].value)) {
                        formData.append('email', $form['value'].value);
                    } else if (/^([\da-zA-Z가-힣]{2,10})$/.test($form['value'].value)) {
                        formData.append('nickname', $form['value'].value);
                    } else {
                        valueLabel.setInvalid(true).$message.innerText = '올바른 이메일 혹은 닉네임을 입력해 주세요.';
                    }
                    if (valueLabel.isInvalid()) {
                        return;
                    }
                    loading.show();
                    const xhr = new XMLHttpRequest();
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
                                dialog.showSimpleOk('경고', '알 수 없는 이유로 그룹을 추가하지 못하였습니다.');
                                break;
                            case 'failure_duplicate':
                                dialog.showSimpleOk('경고', '이미 친구이거나 친구 요청을 전송하였습니다.');
                                break;
                            case 'failure_not_found':
                                dialog.showSimpleOk('경고', '입력하신 정보로 회원을 조회하지 못하였습니다.');
                                break;
                            case 'failure_self':
                                dialog.showSimpleOk('경고', '스스로를 친구로 추가할 수 없습니다.');
                                break;
                            case 'success':
                                dialog.showSimpleOk('알림', '친구 요청을 성공적으로 전송하였습니다.', {
                                    onClickOkCallback: () => {
                                        dialog.hide($addModal);
                                        resolve?.(response);
                                    }
                                });
                                break;
                            default:
                                dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
                        }
                    };
                    xhr.open('POST', `${origin}/friend/request`);
                    xhr.send(formData);
                }
            }
        ]
    });
    $addModal.classList.add('friend-add');
});