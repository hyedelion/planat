import {HyObject} from "../../../common/object.js";
import {HyCheckLabel} from "../../../common/object/check-label.js";

export const showGroupAddDialog = (group) => new Promise((resolve, reject) => {
    const $addModal = dialog.show({
        title: '그룹 사용자 추가',
        content: `
            <span class="message">그룹에 추가할 사용자 이메일 혹은 닉네임을 입력해 주세요. 초대를 받은 사용자가 수락하여야 해당 그룹에 사용자가 추가됩니다.</span>
            <form class="addForm" data-hy-reference="addForm">
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
                onClickCallback: ($dialog) => {
                    reject?.();
                    dialog.hide($dialog);
                }
            },
            {
                caption: '초대하기',
                color: 'tendril',
                onClickCallback: ($addModal) => {
                    const $addForm = $addModal.querySelector(`[data-hy-reference="addForm"]`);
                    const valueLabel = /** @type {HyCheckLabel} */ new HyCheckLabel({$element: $addModal.querySelector(`[data-hy-reference="valueLabel"]`)});
                    const formData = new FormData();
                    valueLabel.setInvalid(false);
                    if ($addForm['value'].value === '') {
                        valueLabel.setInvalid(true).$message.innerText = '이메일 혹은 닉네임을 입력해 주세요.';
                    }
                    if (/^(?=.{8,50}$)([\da-z\-_.]{4,})@([\da-z][\da-z\-]*[\da-z]\.)?([\da-z][\da-z\-]*[\da-z])\.([a-z]{2,15})(\.[a-z]{2,3})?$/.test($addForm['value'].value)) {
                        formData.append('email', $addForm['value'].value);
                    } else if (/^([\da-zA-Z가-힣]{2,10})$/.test($addForm['value'].value)) {
                        formData.append('nickname', $addForm['value'].value);
                    } else {
                        valueLabel.setInvalid(true).$message.innerText = '올바른 이메일 혹은 닉네임을 입력해 주세요.';
                    }
                    if (valueLabel.isInvalid()) {
                        return;
                    }
                    const xhr = new XMLHttpRequest();
                    formData.append('groupId', group['groupId']);
                    xhr.onreadystatechange = () => {
                        if (xhr.readyState !== XMLHttpRequest.DONE) {
                            return;
                        }
                        loading.hide();
                        if (xhr.status < 200 || xhr.status >= 300) {
                            dialog.showSimpleOk('오류', '요청을 처리하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.', {onClickOkCallback: () => resolve?.()});
                            return;
                        }
                        const response = JSON.parse(xhr.responseText);
                        switch (response.result) {
                            case 'failure':
                                dialog.showSimpleOk('경고', '알 수 없는 이유로 회원을 초대하지 못하였습니다.', {onClickOkCallback: () => resolve?.(response)});
                                break;
                            case 'failure_duplicate':
                                dialog.showSimpleOk('경고', '입력하신 정보로 조회되는 회원은 이미 해당 그룹에 속해있습니다.', {onClickOkCallback: () => resolve?.(response)});
                                break;
                            case 'failure_not_found':
                                dialog.showSimpleOk('경고', '입력하신 정보로 회원을 조회하지 못하였습니다.', {onClickOkCallback: () => resolve?.(response)});
                                break;
                            case 'failure_self':
                                dialog.showSimpleOk('경고', '스스로를 그룹에 초대할 수 없습니다.', {onClickOkCallback: () => resolve?.(response)});
                                break;
                            case 'failure_session_expired':
                                dialog.showSimpleOk('경고', '해당 그룹에 사용자를 초대할 권한이 없습니다.', {onClickOkCallback: () => resolve?.(response)});
                                break;
                            case 'success':
                                dialog.showSimpleOk('알림', '입력하신 정보로 조회되는 회원을 해당 그룹에 초대하였습니다. 해당 회원이 초대를 수락하여야 그룹 회원 목록에 표시됩니다.', {
                                    onClickOkCallback: () => {
                                        dialog.hide($addModal);
                                        resolve?.(response);
                                    }
                                });
                                break;
                            default:
                                dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.', {onClickOkCallback: () => resolve?.(response)});
                        }
                    };
                    xhr.open('POST', `${origin}/group/request`);
                    xhr.send(formData);
                    loading.show();
                }
            }
        ]
    });
    $addModal.classList.add('group-detail-add');
    $addModal.querySelector(`[data-hy-reference="addForm"]`).addEventListener('submit', (e) => e.preventDefault());
});