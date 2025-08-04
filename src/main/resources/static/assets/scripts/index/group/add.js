import {HyLabel} from "../../common/object/label.js";

export const showGroupAddDialog = () => new Promise((resolve, reject) => {
    const $addModal = dialog.show({
        title: '그룹 추가',
        content: `
                <form novalidate class="form" data-hy-reference="form">
                    <label data-hy-object="label" data-hy-name="value" data-hy-reference="nameLabel">
                        <span data-hy-component="label.caption">그룹 이름</span>
                        <input autocomplete="email" class="-flex-stretch" maxlength="10" minlength="1" name="name" placeholder="그룹 이름을 입력해 주세요." type="text" data-hy-object="field" data-hy-component="label.field">
                        <span data-hy-component="label.message">그룹 이름을 입력해 주세요.</span>
                    </label>
                    <span class="row">
                        <label class="label -flex-stretch" data-hy-object="label" data-hy-name="value" data-hy-reference="backgroundColorLabel">
                            <span data-hy-component="label.caption">배경 색상</span>
                            <input autocomplete="email" class="color-input -flex-stretch" name="backgroundColor" type="color" value="#a47764" data-hy-object="field" data-hy-component="label.field">
                            <span data-hy-component="label.message">배경 색상을 선택해 주세요.</span>
                            <div class="palette">
                                <div class="color" data-hy-reference="paletteColorBackground" data-hy-value="#a47764"></div>
                                <div class="color" data-hy-reference="paletteColorBackground" data-hy-value="#899f6b"></div>
                                <div class="color" data-hy-reference="paletteColorBackground" data-hy-value="#7391c9"></div>
                                <div class="color" data-hy-reference="paletteColorBackground" data-hy-value="#a793b9"></div>
                                <div class="color" data-hy-reference="paletteColorBackground" data-hy-value="#d19c97"></div>
                                <div class="color" data-hy-reference="paletteColorBackground" data-hy-value="#a89b8f"></div>
                                <div class="color" data-hy-reference="paletteColorBackground" data-hy-value="#f0e9e0"></div>
                            </div>
                        </label>
                        <label class="label -flex-stretch" data-hy-object="label" data-hy-name="value" data-hy-reference="textColorLabel">
                            <span data-hy-component="label.caption">글씨 색상</span>
                            <input autocomplete="email" class="color-input -flex-stretch" name="textColor" type="color" value="#ffffff" data-hy-object="field" data-hy-component="label.field">
                            <span data-hy-component="label.message">글씨 색상을 선택해 주세요.</span>
                            <div class="palette">
                                <div class="color" data-hy-reference="paletteColorText" data-hy-value="#ffffff"></div>
                                <div class="color" data-hy-reference="paletteColorText" data-hy-value="#000000"></div>
                            </div>
                        </label>
                    </span>
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
                    loading.show();
                    const $form = $addModal.querySelector('[data-hy-reference="form"]');
                    const nameLabel = /** @type {HyLabel} */ new HyLabel({$element: $form.querySelector('[data-hy-reference="nameLabel"]')});
                    nameLabel.setInvalid(false);
                    if (nameLabel.$field.value === '') {
                        nameLabel.setInvalid(true).$message.innerText = '그룹 이름을 입력해 주세요.';
                    } else if (!/^(.{1,10})$/.test(nameLabel.$field.value)) {
                        nameLabel.setInvalid(true).$message.innerText = '올바른 그룹 이름을 입력해 주세요.';
                    }
                    if (nameLabel.isInvalid()) {
                        return;
                    }
                    const xhr = new XMLHttpRequest();
                    const formData = new FormData();
                    formData.append('name', $form['name'].value);
                    formData.append('backgroundColor', $form['backgroundColor'].value.replace('#', ''));
                    formData.append('color', $form['textColor'].value.replace('#', ''));
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
                                dialog.showSimpleOk('경고', '이미 사용 중인 이름입니다.');
                                break;
                            case 'success':
                                dialog.showSimpleOk('알림', '그룹을 성공적으로 추가하였습니다.', {onClickOkCallback: () => resolve?.(response)});
                                break;
                            default:
                                dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
                        }
                    };
                    xhr.open('POST', `${origin}/group/`);
                    xhr.send(formData);
                }
            }
        ]
    });
    $addModal.classList.add('group-add');
    const $form = $addModal.querySelector('[data-hy-reference="form"]');
    $form.querySelectorAll('[data-hy-reference="paletteColorBackground"]').forEach(($color) => {
        $color.style.backgroundColor = $color.getAttribute('data-hy-value');
        $color.addEventListener('click', (e) => {
            e.preventDefault();
            $form['backgroundColor'].value = $color.getAttribute('data-hy-value');
        });
    });
    $form.querySelectorAll('[data-hy-reference="paletteColorText"]').forEach(($color) => {
        $color.style.backgroundColor = $color.getAttribute('data-hy-value');
        $color.addEventListener('click', (e) => {
            e.preventDefault();
            $form['textColor'].value = $color.getAttribute('data-hy-value');
        });
    });
});