export const showGroupKickDialog = (group, user) => new Promise((resolve, reject) => {
    dialog.showSimpleYesNo('경고', '정말로 해당 사용자를 그룹에서 제외시킬까요?', {
        onClickNoCallback: () => {
            reject?.();
        },
        onClickYesCallback: () => {
            loading.show();
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append('groupId', group['groupId']);
            formData.append('userEmail', user['userEmail']);
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
                        dialog.showSimpleOk('경고', '알 수 없는 이유로 사용자를 그룹에서 제외시키지 못하였습니다.', {onClickOkCallback: () => resolve?.(response)});
                        break;
                    case 'failure_self':
                        dialog.showSimpleOk('경고', '스스로를 그룹에서 제외시킬 수 없습니다.', {onClickOkCallback: () => resolve?.(response)});
                        break;
                    case 'success':
                        dialog.showSimpleOk('알림', '선택한 사용자를 그룹에서 제외시켰습니다.', {onClickOkCallback: () => resolve?.(response)});
                        break;
                    default:
                        dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.', {onClickOkCallback: () => resolve?.(response)});
                }
            };
            xhr.open('DELETE', `${origin}/group/user`);
            xhr.send(formData);
        }
    });
});