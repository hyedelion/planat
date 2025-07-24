export const showFriendCancelDialog = (requestee) => new Promise((resolve, reject) => {
    dialog.showSimpleYesNo('경고', '해당 친구 신청을 정말로 취소할까요?', {
        onClickNoCallback: () => reject?.(),
        onClickYesCallback: () => {
            loading.show();
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append('requesteeUserEmail', requestee);
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
                        dialog.showSimpleOk('경고', '알 수 없는 이유로 친구 신청을 취소하지 못하였습니다.', {onClickOkCallback: () => resolve?.(response)})
                        break;
                    case 'success':
                        dialog.showSimpleOk('알림', '친구 신청을 성공적으로 취소하였습니다.', {onClickOkCallback: () => resolve?.(response)})
                        break;
                    default:
                        dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.', {onClickOkCallback: () => resolve?.(response)});
                }
            };
            xhr.open('DELETE', `${origin}/friend/request`);
            xhr.send(formData);
        }
    });
});