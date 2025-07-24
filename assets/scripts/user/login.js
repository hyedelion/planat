import {HyObject} from "../common/object.js";
import {ObjectManager} from "../common/object-manager.js";

const objectManager = new ObjectManager();
const dialog = /** @type {HyDialog} */ objectManager.get('dialog');
const loading = /** @type {HyLoading} */ objectManager.get('loading');
const $main = document.getElementById('main');
const $mainContentMap = /** @type {{[p: string]: HTMLElement}} */ Array.from($main.querySelectorAll(`[data-hy-reference="content"][data-hy-name]`)).reduce((map, $content) => (map[$content.getAttribute(HyObject.NAME_ATTR_NAME)] = $content, map), {});
const $loginForm = /** @type {HTMLFormElement} */ document.forms['loginForm'];
const $registerForm = /** @type {HTMLFormElement} */ document.forms['registerForm'];
const $registerStepMap = Array.from($registerForm.querySelectorAll(`[data-hy-reference="step"][data-hy-name]`)).reduce((map, $step) => (map[$step.getAttribute(HyObject.NAME_ATTR_NAME)] = $step, map), {});
const $registerContentMap = Array.from($registerForm.querySelectorAll(`[data-hy-reference="content"][data-hy-name]`)).reduce((map, $content) => (map[$content.getAttribute(HyObject.NAME_ATTR_NAME)] = $content, map), {});
const $recoverForm = /** @type {HTMLFormElement} */ document.forms['recoverForm'];

window.objectManager = objectManager;
window.dialog = dialog;

{
    /** @type {HTMLElement} */
    const $introContainer = document.body.querySelector(':scope > .intro-container');
    /** @type {HTMLVideoElement[]} */
    const $videos = Array.from($introContainer.querySelectorAll(':scope > .video'));
    for (let i = 0; i < $videos.length; i++) {
        $videos[i].addEventListener('timeupdate', () => {
            if ($videos[i].duration - $videos[i].currentTime <= 3) {
                let nextIndex = i === $videos.length - 1 ? 0 : i + 1;
                $videos[i].pause();
                $videos[i].currentTime = 0;
                $videos[i].setVisible(false);
                $videos[nextIndex].play();
                $videos[nextIndex].setVisible(true);
            }
        });
    }
}

{
    const $menu = $loginForm.querySelector(':scope > .menu');
    const $actionMap = /** @type {{[p: string]: HTMLAnchorElement}} */ Array.from($menu.querySelectorAll(`[data-hy-reference="action"][data-hy-name]`)).reduce((map, $action) => (map[$action.getAttribute(HyObject.NAME_ATTR_NAME)] = $action, map), {});
    $loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailLabel = /** @type {HyLabel} */ objectManager.get('loginEmail');
        const passwordLabel = /** @type {HyLabel} */ objectManager.get('loginPassword');
        const labels = [emailLabel, passwordLabel];
        labels.forEach((label) => label.setInvalid(false));
        if ($loginForm['email'].value === '') {
            emailLabel.setInvalid(true).$message.innerText = '이메일을 입력해 주세요.';
        } else if (!/^(?=.{8,50}$)([\da-z\-_.]{4,})@([\da-z][\da-z\-]*[\da-z]\.)?([\da-z][\da-z\-]*[\da-z])\.([a-z]{2,15})(\.[a-z]{2,3})?$/.test($loginForm['email'].value)) {
            emailLabel.setInvalid(true).$message.innerText = '올바른 이메일을 입력해 주세요.';
        }
        if ($loginForm['password'].value === '') {
            passwordLabel.setInvalid(true).$message.innerText = '비밀번호를 입력해 주세요.';
        } else if (!/^([\da-zA-Z`~!@#$%^&*\(\)\-_=+\[\{\]\}\\\|;:'",<.>\/?]{8,50})$/.test($loginForm['password'].value)) {
            passwordLabel.setInvalid(true).$message.innerText = '올바른 비밀번호를 입력해 주세요.';
        }
        if (labels.some((label) => label.isInvalid() === true) === true) {
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('email', $loginForm['email'].value);
        formData.append('password', $loginForm['password'].value);
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            loading.hide();
            if (xhr.status < 200 || xhr.status >= 300) {
                dialog.showSimpleOk('오류', '요청을 처리하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
                return;
            }
            console.log(xhr.responseText);
            const response = JSON.parse(xhr.responseText);
            switch (response.result) {
                case 'failure_suspended':
                    dialog.showSimpleOk('경고', '해당 계정은 이용이 정지된 상태입니다. 고객센터를 통해 문의해 주세요.');
                    break;
                case 'success':
                    location.reload();
                    break;
                default:
                    dialog.showSimpleOk('경고', '이메일 혹은 비밀번호가 올바르지 않습니다.');
            }
        };
        xhr.open('POST', `${origin}/user/login`);
        xhr.send(formData);
        loading.show();
    })
    $actionMap['register'].addEventListener('click', (e) => {
        e.preventDefault();
        Object.values($mainContentMap).forEach(($content) => $content.hide());
        Object.values($registerStepMap).forEach(($step) => $step.classList.remove('-selected'));
        Object.values($registerContentMap).forEach(($content) => $content.hide());
        $registerForm.reset();
        $registerStepMap['terms'].classList.add('-selected');
        $registerContentMap['terms'].show();
        $mainContentMap['registerForm'].show();
    });
    $actionMap['recover'].addEventListener('click', (e) => {
        e.preventDefault();
        Object.values($mainContentMap).forEach(($content) => $content.hide());
        $recoverForm.reset();
        $mainContentMap['recoverForm'].show();
    });
}

{
    const $emailCount = $registerContentMap['information'].querySelector(`[data-hy-reference="emailCount"]`);
    const $emailRemainingMinutes = $registerContentMap['information'].querySelector(`[data-hy-reference="emailRemainingMinutes"]`);
    const $emailRemainingSeconds = $registerContentMap['information'].querySelector(`[data-hy-reference="emailRemainingSeconds"]`);
    const $emailCancel = $registerContentMap['information'].querySelector(`[data-hy-reference="emailCancel"]`);
    const $contactCount = $registerContentMap['information'].querySelector(`[data-hy-reference="contactCount"]`);
    const $contactRemainingMinutes = $registerContentMap['information'].querySelector(`[data-hy-reference="contactRemainingMinutes"]`);
    const $contactRemainingSeconds = $registerContentMap['information'].querySelector(`[data-hy-reference="contactRemainingSeconds"]`);
    const $contactCancel = $registerContentMap['information'].querySelector(`[data-hy-reference="contactCancel"]`);
    let emailCount = 0;
    let emailCountInterval = -1;
    let contactCount = 0;
    let contactCountInterval = -1;
    $emailCancel.addEventListener('click', (e) => {
        e.preventDefault();
        $registerForm['emailSalt'].value = '';
        $registerForm['email'].removeAttribute('disabled');
        $registerForm['emailSend'].removeAttribute('disabled');
        $registerForm['emailCode'].setAttribute('disabled', '');
        $registerForm['emailVerify'].setAttribute('disabled', '');
        $registerForm['email'].focus();
        clearInterval(emailCountInterval);
        emailCount = 0;
        emailCountInterval = -1;
        $emailCount.hide();
        $emailRemainingMinutes.innerText = '0';
        $emailRemainingSeconds.innerText = '00';
    });
    $contactCancel.addEventListener('click', (e) => {
        e.preventDefault();
        $registerForm['contactSalt'].value = '';
        $registerForm['contactFirst'].removeAttribute('disabled');
        $registerForm['contactSecond'].removeAttribute('disabled');
        $registerForm['contactThird'].removeAttribute('disabled');
        $registerForm['contactSend'].removeAttribute('disabled');
        $registerForm['contactCode'].setAttribute('disabled', '');
        $registerForm['contactVerify'].setAttribute('disabled', '');
        $registerForm['contactFirst'].focus();
        clearInterval(contactCountInterval);
        contactCount = 0;
        contactCountInterval = -1;
        $contactCount.hide();
        $contactRemainingMinutes.innerText = '0';
        $contactRemainingSeconds.innerText = '00';
    });
    [$registerForm['termCancel'], $registerForm['informationCancel']].forEach(($cancel) => $cancel.addEventListener('click', () => {
        dialog.showSimpleYesNo('경고', '회원가입을 취소할까요? 모든 내용이 유실됩니다.', {
            onClickYesCallback: () => {
                $emailCancel.dispatchEvent(new Event('click'));
                $contactCancel.dispatchEvent(new Event('click'));
                $registerForm.hide();
                $loginForm.show();
                $loginForm['email'].focus();
            }
        })
    }));
    $registerForm['termNext'].addEventListener('click', () => {
        const termServiceCheckLabel = /** @type {HyCheckLabel} */ objectManager.get('registerTermServiceCheck');
        const termPrivacyCheckLabel = /** @type {HyCheckLabel} */ objectManager.get('registerTermPrivacyCheck');
        const termMarketingCheckLabel = /** @type {HyCheckLabel} */ objectManager.get('registerTermMarketingCheck');
        const labels = [termServiceCheckLabel, termPrivacyCheckLabel, termMarketingCheckLabel];
        labels.forEach((label) => label.setInvalid(false));
        if (!termServiceCheckLabel.$input.checked) {
            termServiceCheckLabel.setInvalid(true);
        }
        if (!termPrivacyCheckLabel.$input.checked) {
            termPrivacyCheckLabel.setInvalid(true);
        }
        if (labels.some((label) => label.isInvalid() === true) === true) {
            return;
        }
        $registerStepMap['terms'].classList.remove('-selected');
        $registerStepMap['information'].classList.add('-selected');
        $registerContentMap['terms'].hide();
        $registerContentMap['information'].show();
        $registerForm['email'].focus();
    });
    $registerForm['email'].addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            $registerForm['emailSend'].dispatchEvent(new Event('click'));
        }
    });
    $registerForm['emailSend'].addEventListener('click', () => {
        const emailLabel = /** @type {HyLabel} */ objectManager.get('registerEmail');
        emailLabel.setInvalid(false);
        if ($registerForm['email'].value === '') {
            emailLabel.setInvalid(true).$message.innerText = '이메일을 입력해 주세요.';
        } else if (!/^(?=.{8,50}$)([\da-z\-_.]{4,})@([\da-z][\da-z\-]*[\da-z]\.)?([\da-z][\da-z\-]*[\da-z])\.([a-z]{2,15})(\.[a-z]{2,3})?$/.test($registerForm['email'].value)) {
            emailLabel.setInvalid(true).$message.innerText = '올바른 이메일을 입력해 주세요.';
        }
        if (emailLabel.isInvalid()) {
            emailLabel.$field.focus();
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('email', $registerForm['email'].value);
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
                case 'failure_duplicate':
                    dialog.showSimpleOk('경고', `입력하신 이메일(<b>${$registerForm['email'].value}</b>)은 이미 사용 중입니다.`, {isContentHtml: true});
                    break;
                case 'success':
                    emailCount = 300;
                    emailCountInterval = setInterval(() => {
                        emailCount--;
                        if (emailCount <= 0) {
                            $emailCancel.dispatchEvent(new Event('click'));
                            dialog.showSimpleOk('경고', '이메일 인증번호 입력 시간이 초과되었습니다. 처음부터 다시 시도해 주세요.');
                            return;
                        }
                        $emailRemainingMinutes.innerText = Math.trunc(emailCount / 60);
                        $emailRemainingSeconds.innerText = (emailCount % 60).toString().padStart(2, '0');
                    }, 1000);
                    $emailRemainingMinutes.innerText = '5';
                    $emailRemainingSeconds.innerText = '00';
                    $emailCount.show();
                    dialog.showSimpleOk('알림', `입력하신 이메일(<b>${$registerForm['email'].value}</b>)로 인증번호가 포함된 메일을 전송하였습니다. 인증번호는 5분간만 유효하니 유의해 주세요.`, {
                        isContentHtml: true,
                        onClickOkCallback: () => {
                            $registerForm['emailSalt'].value = response['salt'];
                            $registerForm['email'].setAttribute('disabled', '');
                            $registerForm['emailSend'].setAttribute('disabled', '');
                            $registerForm['emailCode'].removeAttribute('disabled');
                            $registerForm['emailVerify'].removeAttribute('disabled');
                            $registerForm['emailCode'].focus();
                        }
                    })
                    break;
                default:
                    dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
            }
        };
        xhr.open('POST', `${origin}/email-token/email?type=register`);
        xhr.send(formData);
        loading.show();
    });
    $registerForm['emailVerify'].addEventListener('click', () => {
        const emailCodeLabel = /** @type {HyLabel} */ objectManager.get('registerEmailCode');
        emailCodeLabel.setInvalid(false);
        if ($registerForm['email'].value === '') {
            emailCodeLabel.setInvalid(true).$message.innerText = '이메일 인증번호를 입력해 주세요.';
        } else if (!/^(\d{6})$/.test($registerForm['emailCode'].value)) {
            emailCodeLabel.setInvalid(true).$message.innerText = '올바른 이메일 인증번호를 입력해 주세요.';
        }
        if (emailCodeLabel.isInvalid()) {
            emailCodeLabel.$field.focus();
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('email', $registerForm['email'].value);
        formData.append('code', $registerForm['emailCode'].value);
        formData.append('salt', $registerForm['emailSalt'].value);
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
                    dialog.showSimpleOk('경고', '인증번호가 올바르지 않습니다. 다시 확인해 주세요.');
                    break;
                case 'failure_expired':
                    $emailCancel.dispatchEvent(new Event('click'));
                    dialog.showSimpleOk('경고', '이메일 인증번호 입력 시간이 초과되었습니다. 처음부터 다시 시도해 주세요.');
                    break;
                case 'success':
                    clearInterval(emailCountInterval);
                    emailCount = 0;
                    emailCountInterval = -1;
                    $emailCount.hide();
                    $emailRemainingMinutes.innerText = '0';
                    $emailRemainingSeconds.innerText = '00';
                    dialog.showSimpleOk('알림', '이메일 인증이 완료되었습니다.', {
                        isContentHtml: true,
                        onClickOkCallback: () => {
                            $registerForm['emailCode'].setAttribute('disabled', '');
                            $registerForm['emailVerify'].setAttribute('disabled', '');
                        }
                    })
                    break;
                default:
                    dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
            }
        };
        xhr.open('PATCH', `${origin}/email-token/email`);
        xhr.send(formData);
        loading.show();
    });
    $registerForm['nickname'].addEventListener('focusout', () => {
        const nicknameLabel = /** @type {HyLabel} */ objectManager.get('registerNickname');
        nicknameLabel.setInvalid(false);
        nicknameLabel.setValid(false);
        if ($registerForm['nickname'].value === '') {
            nicknameLabel.setInvalid(true).$message.innerText = '닉네임을 입력해 주세요.';
        } else if (!/^([\da-zA-Z가-힣]{2,10})$/.test($registerForm['nickname'].value)) {
            nicknameLabel.setInvalid(true).$message.innerText = '올바른 닉네임을 입력해 주세요.';
        }
        if (nicknameLabel.isInvalid() === true) {
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('nickname', $registerForm['nickname'].value);
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            loading.hide();
            if (xhr.status < 200 || xhr.status >= 300) {
                nicknameLabel.setInvalid(true).$message.innerText = '닉네임을 확인하지 못하였습니다. 잠시 후 다시 시도해 주세요.';
                return;
            }
            const response = JSON.parse(xhr.responseText);
            switch (response.result) {
                case 'failure_duplicate':
                    nicknameLabel.setInvalid(true).$message.innerText = '입력하신 닉네임은 이미 사용 중입니다.';
                    break;
                case 'success':
                    nicknameLabel.setValid(true).$message.innerText = '입력하신 닉네임은 사용할 수 있는 닉네임입니다.';
                    break;
                default:
                    nicknameLabel.setInvalid(true).$message.innerText = '닉네임을 확인하지 못하였습니다. 잠시 후 다시 시도해 주세요.';
            }
        };
        xhr.open('POST', `${origin}/user/nickname-check`);
        xhr.send(formData);
        loading.show();
    });
    $registerForm['contactSend'].addEventListener('click', () => {
        const contactLabel = /** @type {HyLabel} */ objectManager.get('registerContact');
        contactLabel.setInvalid(false);
        if ($registerForm['contactSecond'].value === '' || $registerForm['contactThird'].value === '') {
            contactLabel.setInvalid(true).$message.innerText = '연락처를 입력해 주세요.';
        } else if (!/^(\d{3,4})$/.test($registerForm['contactSecond'].value) || !/^(\d{4})$/.test($registerForm['contactThird'].value)) {
            contactLabel.setInvalid(true).$message.innerText = '올바른 연락처를 입력해 주세요.';
        }
        if (contactLabel.isInvalid()) {
            contactLabel.$field.focus();
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('contactFirst', $registerForm['contactFirst'].value);
        formData.append('contactSecond', $registerForm['contactSecond'].value);
        formData.append('contactThird', $registerForm['contactThird'].value);
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
                case 'failure_duplicate':
                    dialog.showSimpleOk('경고', `입력하신 연락처(<b>${$registerForm['contactFirst'].value}-${$registerForm['contactSecond'].value}-${$registerForm['contactThird'].value}</b>)는 이미 사용 중입니다.`, {isContentHtml: true});
                    break;
                case 'success':
                    contactCount = 300;
                    contactCountInterval = setInterval(() => {
                        contactCount--;
                        if (contactCount <= 0) {
                            $contactCancel.dispatchEvent(new Event('click'));
                            dialog.showSimpleOk('경고', '연락처 인증번호 입력 시간이 초과되었습니다. 처음부터 다시 시도해 주세요.');
                            return;
                        }
                        $contactRemainingMinutes.innerText = Math.trunc(contactCount / 60);
                        $contactRemainingSeconds.innerText = (contactCount % 60).toString().padStart(2, '0');
                    }, 1000);
                    $contactRemainingMinutes.innerText = '5';
                    $contactRemainingSeconds.innerText = '00';
                    $contactCount.show();
                    dialog.showSimpleOk('알림', `입력하신 연락처(<b>${$registerForm['contactFirst'].value}-${$registerForm['contactSecond'].value}-${$registerForm['contactThird'].value}</b>)로 인증번호가 포함된 문자 메세지를 전송하였습니다. 인증번호는 5분간만 유효하니 유의해 주세요.`, {
                        isContentHtml: true,
                        onClickOkCallback: () => {
                            $registerForm['contactSalt'].value = response['salt'];
                            $registerForm['contactFirst'].setAttribute('disabled', '');
                            $registerForm['contactSecond'].setAttribute('disabled', '');
                            $registerForm['contactThird'].setAttribute('disabled', '');
                            $registerForm['contactSend'].setAttribute('disabled', '');
                            $registerForm['contactCode'].removeAttribute('disabled');
                            $registerForm['contactVerify'].removeAttribute('disabled');
                            $registerForm['contactCode'].focus();
                        }
                    })
                    break;
                default:
                    dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
            }
        };
        xhr.open('POST', `${origin}/contact-token/sms?type=register`);
        xhr.send(formData);
        loading.show();
    });
    $registerForm['contactVerify'].addEventListener('click', () => {
        const contactCodeLabel = /** @type {HyLabel} */ objectManager.get('registerContactCode');
        contactCodeLabel.setInvalid(false);
        if ($registerForm['contactCode'].value === '') {
            contactCodeLabel.setInvalid(true).$message.innerText = '휴대폰 인증번호를 입력해 주세요.';
        } else if (!/^(\d{6})$/.test($registerForm['contactCode'].value)) {
            contactCodeLabel.setInvalid(true).$message.innerText = '올바른 휴대폰 인증번호를 입력해 주세요.';
        }
        if (contactCodeLabel.isInvalid()) {
            contactCodeLabel.$field.focus();
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('contactFirst', $registerForm['contactFirst'].value);
        formData.append('contactSecond', $registerForm['contactSecond'].value);
        formData.append('contactThird', $registerForm['contactThird'].value);
        formData.append('code', $registerForm['contactCode'].value);
        formData.append('salt', $registerForm['contactSalt'].value);
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
                    dialog.showSimpleOk('경고', '인증번호가 올바르지 않습니다. 다시 확인해 주세요.');
                    break;
                case 'failure_expired':
                    $contactCancel.dispatchEvent(new Event('click'));
                    dialog.showSimpleOk('경고', '휴대폰 인증번호 입력 시간이 초과되었습니다. 처음부터 다시 시도해 주세요.');
                    break;
                case 'success':
                    clearInterval(contactCountInterval);
                    contactCount = 0;
                    contactCountInterval = -1;
                    $contactCount.hide();
                    $contactRemainingMinutes.innerText = '0';
                    $contactRemainingSeconds.innerText = '00';
                    dialog.showSimpleOk('알림', '휴대폰 인증이 완료되었습니다.', {
                        isContentHtml: true,
                        onClickOkCallback: () => {
                            $registerForm['contactCode'].setAttribute('disabled', '');
                            $registerForm['contactVerify'].setAttribute('disabled', '');
                        }
                    })
                    break;
                default:
                    dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
            }
        };
        xhr.open('PATCH', `${origin}/contact-token/sms`);
        xhr.send(formData);
        loading.show();
    });
    $registerForm['addressFind'].addEventListener('click', () => {
        const $addressFindDialog = $registerForm.querySelector(`[data-hy-reference="addressFindDialog"]`);
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
                $registerForm['addressPostal'].value = data['zonecode'];
                $registerForm['addressPrimary'].value = data['roadAddress'];
                $registerForm['addressSecondary'].focus();
                $addressFindDialog.hide();
            }
        }).embed($modal);
        $addressFindDialog.show();
    });
    $registerForm['informationPrevious'].addEventListener('click', () => {
        $registerStepMap['information'].classList.remove('-selected');
        $registerStepMap['terms'].classList.add('-selected');
        $registerContentMap['information'].hide();
        $registerContentMap['terms'].show();
    });
    $registerForm['informationNext'].addEventListener('click', () => {
        const emailLabel = /** @type {HyLabel} */ objectManager.get('registerEmail');
        const emailCodeLabel = /** @type {HyLabel} */ objectManager.get('registerEmailCode');
        const passwordLabel = /** @type {HyLabel} */ objectManager.get('registerPassword');
        const passwordCheckLabel = /** @type {HyLabel} */ objectManager.get('registerPasswordCheck');
        const nicknameLabel = /** @type {HyLabel} */ objectManager.get('registerNickname');
        const nameLabel = /** @type {HyLabel} */ objectManager.get('registerName');
        const contactLabel = /** @type {HyLabel} */ objectManager.get('registerContact');
        const contactCodeLabel = /** @type {HyLabel} */ objectManager.get('registerContactCode');
        const addressPostalLabel = /** @type {HyLabel} */ objectManager.get('registerAddressPostal');
        const addressPrimaryLabel = /** @type {HyLabel} */ objectManager.get('registerAddressPrimary');
        const addressSecondaryLabel = /** @type {HyLabel} */ objectManager.get('registerAddressSecondary');
        const labels = [emailLabel, emailCodeLabel, passwordLabel, passwordCheckLabel, nicknameLabel, nameLabel, contactLabel, contactCodeLabel, addressPostalLabel, addressPrimaryLabel, addressSecondaryLabel];
        labels.forEach((label) => label.setInvalid(false));
        if (!$registerForm['emailSend'].hasAttribute('disabled') || !$registerForm['emailVerify'].hasAttribute('disabled')) {
            emailCodeLabel.setInvalid(true).$message.innerText = '이메일 인증을 완료해 주세요.';
        }
        if ($registerForm['password'].value === '') {
            passwordLabel.setInvalid(true).$message.innerText = '비밀번호를 입력해 주세요.';
        } else if (!/^([\da-zA-Z`~!@#$%^&*\(\)\-_=+\[\{\]\}\\\|;:'",<.>\/?]{8,50})$/.test($registerForm['password'].value)) {
            passwordLabel.setInvalid(true).$message.innerText = '올바른 비밀번호를 입력해 주세요.';
        } else if ($registerForm['passwordCheck'].value === '') {
            passwordCheckLabel.setInvalid(true).$message.innerText = '비밀번호를 한 번 더 입력해 주세요.';
        } else if ($registerForm['password'].value !== $registerForm['passwordCheck'].value) {
            passwordCheckLabel.setInvalid(true).$message.innerText = '비밀번호가 일치하지 않습니다.';
        }
        if ($registerForm['nickname'].value === '') {
            nicknameLabel.setInvalid(true).$message.innerText = '닉네임을 입력해 주세요.';
        } else if (!/^([\da-zA-Z가-힣]{2,10})$/.test($registerForm['nickname'].value)) {
            nicknameLabel.setInvalid(true).$message.innerText = '올바른 닉네임을 입력해 주세요.';
        }
        if ($registerForm['name'].value === '') {
            nameLabel.setInvalid(true).$message.innerText = '이름을 입력해 주세요.';
        } else if (!/^([가-힣]{2,5})$/.test($registerForm['name'].value)) {
            nameLabel.setInvalid(true).$message.innerText = '올바른 이름을 입력해 주세요.';
        }
        if ($registerForm['birth'].value === '') {
            nameLabel.setInvalid(true).$message.innerText = '생년월일을 선택해 주세요.';
        } else if ($registerForm['gender'].value === '') {
            nameLabel.setInvalid(true).$message.innerText = '성별을 선택해 주세요.';
        }
        if ($registerForm['contactMvno'].value === 'null') {
            contactLabel.setInvalid(true).$message.innerText = '통신사를 선태해 주세요.';
        }
        if (!$registerForm['contactSend'].hasAttribute('disabled') || !$registerForm['contactVerify'].hasAttribute('disabled')) {
            contactCodeLabel.setInvalid(true).$message.innerText = '휴대폰 인증을 완료해 주세요.';
        }
        if ($registerForm['addressPostal'].value === '') {
            addressPostalLabel.setInvalid(true).$message.innerText = '우편번호 찾기 버튼을 클릭하여 주소를 완성해 주세요.';
        }
        if ($registerForm['addressPrimary'].value === '') {
            addressPrimaryLabel.setInvalid(true).$message.innerText = '우편번호 찾기 버튼을 클릭하여 주소를 완성해 주세요.';
        }
        if (labels.some((label) => label.isInvalid() === true) === true) {
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('email', $registerForm['email'].value);
        formData.append('emailCode', $registerForm['emailCode'].value);
        formData.append('emailSalt', $registerForm['emailSalt'].value);
        formData.append('password', $registerForm['password'].value);
        formData.append('nickname', $registerForm['nickname'].value);
        formData.append('name', $registerForm['name'].value);
        formData.append('birth', $registerForm['birth'].value);
        formData.append('gender', $registerForm['gender'].value);
        formData.append('contactMvnoCode', $registerForm['contactMvno'].value);
        formData.append('contactFirst', $registerForm['contactFirst'].value);
        formData.append('contactSecond', $registerForm['contactSecond'].value);
        formData.append('contactThird', $registerForm['contactThird'].value);
        formData.append('contactCode', $registerForm['contactCode'].value);
        formData.append('contactSalt', $registerForm['contactSalt'].value);
        formData.append('addressPostal', $registerForm['addressPostal'].value);
        formData.append('addressPrimary', $registerForm['addressPrimary'].value);
        formData.append('addressSecondary', $registerForm['addressSecondary'].value);
        formData.append('marketingChecked', $registerForm['termMarketingCheck'].checked);
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
                case 'failure_duplicate_email':
                    $emailCancel.dispatchEvent(new Event('click'));
                    dialog.showSimpleOk('경고', `입력하신 이메일(<b>${$registerForm['email'].value}</b>)은 이미 사용 중입니다. 다른 이메일을 사용해 주세요.`, {isContentHtml: true});
                    break;
                case 'failure_duplicate_nickname':
                    dialog.showSimpleOk('경고', `입력하신 닉네임(<b>${$registerForm['nickname'].value}</b>)은 이미 사용 중입니다. 다른 닉네임을 사용해 주세요.`, {isContentHtml: true});
                    break;
                case 'failure_duplicate_contact':
                    $contactCancel.dispatchEvent(new Event('click'));
                    dialog.showSimpleOk('경고', `입력하신 연락처(<b>${$registerForm['contactFirst'].value}-${$registerForm['contactSecond'].value}-${$registerForm['contactThird'].value}</b>)는 이미 사용 중입니다. 다른 연락처를 사용해 주세요.`, {isContentHtml: true});
                    break;
                case 'success':
                    $registerStepMap['information'].classList.remove('-selected');
                    $registerStepMap['complete'].classList.add('-selected');
                    $registerContentMap['information'].hide();
                    $registerContentMap['complete'].show();
                    break;
                default:
                    dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
            }
        };
        xhr.open('POST', `${origin}/user/register`);
        xhr.send(formData);
        loading.show();
    });
    $registerForm['completeForward'].addEventListener('click', () => {
        $mainContentMap['registerForm'].hide();
        $mainContentMap['loginForm'].show();
    });
}

{
    const $emailCount = $recoverForm.querySelector(`[data-hy-reference="emailCount"]`);
    const $emailRemainingMinutes = $recoverForm.querySelector(`[data-hy-reference="emailRemainingMinutes"]`);
    const $emailRemainingSeconds = $recoverForm.querySelector(`[data-hy-reference="emailRemainingSeconds"]`);
    const $emailCancel = $recoverForm.querySelector(`[data-hy-reference="emailCancel"]`);
    const $passwordCount = $recoverForm.querySelector(`[data-hy-reference="passwordCount"]`);
    const $passwordRemainingMinutes = $recoverForm.querySelector(`[data-hy-reference="passwordRemainingMinutes"]`);
    const $passwordRemainingSeconds = $recoverForm.querySelector(`[data-hy-reference="passwordRemainingSeconds"]`);
    const $passwordCancel = $recoverForm.querySelector(`[data-hy-reference="passwordCancel"]`);
    let emailCount = 0;
    let emailCountInterval = -1;
    let passwordCount = 0;
    let passwordCountInterval = -1;
    $emailCancel.addEventListener('click', (e) => {
        e.preventDefault();
        $recoverForm['emailContactSalt'].value = '';
        $recoverForm['emailContactFirst'].removeAttribute('disabled');
        $recoverForm['emailContactSecond'].removeAttribute('disabled');
        $recoverForm['emailContactThird'].removeAttribute('disabled');
        $recoverForm['emailContactSend'].removeAttribute('disabled');
        $recoverForm['emailContactCode'].setAttribute('disabled', '');
        $recoverForm['emailContactVerify'].setAttribute('disabled', '');
        $recoverForm['emailContactFirst'].focus();
        clearInterval(emailCountInterval);
        emailCount = 0;
        emailCountInterval = -1;
        $emailCount.hide();
        $emailRemainingMinutes.innerText = '0';
        $emailRemainingSeconds.innerText = '00';
    });
    $passwordCancel.addEventListener('click', (e) => {
        e.preventDefault();
        $recoverForm['passwordContactSalt'].value = '';
        $recoverForm['passwordContactFirst'].removeAttribute('disabled');
        $recoverForm['passwordContactSecond'].removeAttribute('disabled');
        $recoverForm['passwordContactThird'].removeAttribute('disabled');
        $recoverForm['passwordContactSend'].removeAttribute('disabled');
        $recoverForm['passwordContactCode'].setAttribute('disabled', '');
        $recoverForm['passwordContactVerify'].setAttribute('disabled', '');
        $recoverForm['passwordContactFirst'].focus();
        clearInterval(passwordCountInterval);
        passwordCount = 0;
        passwordCountInterval = -1;
        $passwordCount.hide();
        $passwordRemainingMinutes.innerText = '0';
        $passwordRemainingSeconds.innerText = '00';
    });
    $recoverForm['type'].forEach(($type) => $type.addEventListener('input', () => {
        $emailCancel.dispatchEvent(new Event('click'));
        $passwordCancel.dispatchEvent(new Event('click'));
        if ($recoverForm['type'].value === 'email') {
            $recoverForm['emailContactSalt'].value = '';
            $recoverForm['emailContactMvno'].value = 'null';
            $recoverForm['emailContactFirst'].value = '010';
            $recoverForm['emailContactSecond'].value = '';
            $recoverForm['emailContactThird'].value = '';
            $recoverForm['emailContactSend'].removeAttribute('disabled');
            $recoverForm['emailContactCode'].value = '';
            $recoverForm['emailContactVerify'].setAttribute('disabled', '');
            $recoverForm['emailSuccessPassword'].hide();
            $recoverForm.querySelector(`[data-hy-reference="emailResult"]`).hide();
        } else if ($recoverForm['type'].value === 'password') {
            const passwordLabel = /** @type {HyLabel} */ objectManager.get('recoverPasswordNew');
            const passwordCheckLabel = /** @type {HyLabel} */ objectManager.get('recoverPasswordNewCheck');
            $recoverForm['passwordContactSalt'].value = '';
            $recoverForm['passwordEmail'].value = '';
            $recoverForm['passwordContactMvno'].value = 'null';
            $recoverForm['passwordContactFirst'].value = '010';
            $recoverForm['passwordContactSecond'].value = '';
            $recoverForm['passwordContactThird'].value = '';
            $recoverForm['passwordContactSend'].removeAttribute('disabled');
            $recoverForm['passwordContactCode'].value = '';
            $recoverForm['passwordContactVerify'].setAttribute('disabled', '');
            $recoverForm['passwordSuccessModify'].hide();
            $recoverForm.querySelector(`[data-hy-reference="passwordSuccessPassword"]`).hide();
            passwordLabel.$element.hide();
            passwordCheckLabel.$element.hide();
        }
    }));
    $recoverForm['emailContactSend'].addEventListener('click', () => {
        const contactLabel = /** @type {HyLabel} */ objectManager.get('recoverEmailContact');
        contactLabel.setInvalid(false);
        if ($recoverForm['emailContactSecond'].value === '' || $recoverForm['emailContactThird'].value === '') {
            contactLabel.setInvalid(true).$message.innerText = '연락처를 입력해 주세요.';
        } else if (!/^(\d{3,4})$/.test($recoverForm['emailContactSecond'].value) || !/^(\d{4})$/.test($recoverForm['emailContactThird'].value)) {
            contactLabel.setInvalid(true).$message.innerText = '올바른 연락처를 입력해 주세요.';
        }
        if (contactLabel.isInvalid()) {
            contactLabel.$field.focus();
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('contactFirst', $recoverForm['emailContactFirst'].value);
        formData.append('contactSecond', $recoverForm['emailContactSecond'].value);
        formData.append('contactThird', $recoverForm['emailContactThird'].value);
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
                case 'success':
                    emailCount = 300;
                    emailCountInterval = setInterval(() => {
                        emailCount--;
                        if (emailCount <= 0) {
                            $emailCancel.dispatchEvent(new Event('click'));
                            dialog.showSimpleOk('경고', '연락처 인증번호 입력 시간이 초과되었습니다. 처음부터 다시 시도해 주세요.');
                            return;
                        }
                        $emailRemainingMinutes.innerText = Math.trunc(emailCount / 60);
                        $emailRemainingSeconds.innerText = (emailCount % 60).toString().padStart(2, '0');
                    }, 1000);
                    $emailRemainingMinutes.innerText = '5';
                    $emailRemainingSeconds.innerText = '00';
                    $emailCount.show();
                    dialog.showSimpleOk('알림', `입력하신 연락처(<b>${$recoverForm['emailContactFirst'].value}-${$recoverForm['emailContactSecond'].value}-${$recoverForm['emailContactThird'].value}</b>)로 인증번호가 포함된 문자 메세지를 전송하였습니다. 인증번호는 5분간만 유효하니 유의해 주세요.`, {
                        isContentHtml: true,
                        onClickOkCallback: () => {
                            $recoverForm['emailContactSalt'].value = response['salt'];
                            $recoverForm['emailContactFirst'].setAttribute('disabled', '');
                            $recoverForm['emailContactSecond'].setAttribute('disabled', '');
                            $recoverForm['emailContactThird'].setAttribute('disabled', '');
                            $recoverForm['emailContactSend'].setAttribute('disabled', '');
                            $recoverForm['emailContactCode'].removeAttribute('disabled');
                            $recoverForm['emailContactVerify'].removeAttribute('disabled');
                            $recoverForm['emailContactCode'].focus();
                        }
                    })
                    break;
                default:
                    dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
            }
        };
        xhr.open('POST', `${origin}/contact-token/sms?type=recoverEmail`);
        xhr.send(formData);
        loading.show();
    });
    $recoverForm['emailContactVerify'].addEventListener('click', () => {
        const contactCodeLabel = /** @type {HyLabel} */ objectManager.get('recoverEmailContactCode');
        contactCodeLabel.setInvalid(false);
        if ($recoverForm['emailContactCode'].value === '') {
            contactCodeLabel.setInvalid(true).$message.innerText = '휴대폰 인증번호를 입력해 주세요.';
        } else if (!/^(\d{6})$/.test($recoverForm['emailContactCode'].value)) {
            contactCodeLabel.setInvalid(true).$message.innerText = '올바른 휴대폰 인증번호를 입력해 주세요.';
        }
        if (contactCodeLabel.isInvalid()) {
            contactCodeLabel.$field.focus();
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('contactFirst', $recoverForm['emailContactFirst'].value);
        formData.append('contactSecond', $recoverForm['emailContactSecond'].value);
        formData.append('contactThird', $recoverForm['emailContactThird'].value);
        formData.append('code', $recoverForm['emailContactCode'].value);
        formData.append('salt', $recoverForm['emailContactSalt'].value);
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
                    dialog.showSimpleOk('경고', '인증번호가 올바르지 않습니다. 다시 확인해 주세요.');
                    break;
                case 'failure_expired':
                    $emailCancel.dispatchEvent(new Event('click'));
                    dialog.showSimpleOk('경고', '휴대폰 인증번호 입력 시간이 초과되었습니다. 처음부터 다시 시도해 주세요.');
                    break;
                case 'failure_not_found':
                    $emailCancel.dispatchEvent(new Event('click'));
                    dialog.showSimpleOk('경고', '휴대폰 인증에는 성공하였으나 해당 연락처로 조회되는 회원이 없습니다. 다시 확인해 주세요.');
                    break;
                case 'success':
                    const $emailResult = $recoverForm.querySelector(`[data-hy-reference="emailResult"]`);
                    clearInterval(emailCountInterval);
                    emailCount = 0;
                    emailCountInterval = -1;
                    $emailCount.hide();
                    $emailRemainingMinutes.innerText = '0';
                    $emailRemainingSeconds.innerText = '00';
                    $recoverForm['emailContactCode'].setAttribute('disabled', '');
                    $recoverForm['emailContactVerify'].setAttribute('disabled', '');
                    $recoverForm['emailSuccessPassword'].show();
                    $emailResult.querySelectorAll(':scope > .email').forEach(($email) => $email.remove());
                    for (const email of response['emails']) {
                        $emailResult.insertAdjacentHTML('beforeend', `<span class="email">${email}</span>`);
                    }
                    $emailResult.show();
                    dialog.showSimpleOk('알림', `휴대폰 인증이 완료되었습니다. 입력하신 연락처로 조회되는 계정은 총 ${response['emails'].length}개 입니다.`, {isContentHtml: true});
                    break;
                default:
                    dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
            }
        };
        xhr.open('PATCH', `${origin}/contact-token/sms?type=recoverEmail`);
        xhr.send(formData);
        loading.show();
    });
    $recoverForm['passwordContactSend'].addEventListener('click', () => {
        const contactLabel = /** @type {HyLabel} */ objectManager.get('recoverPasswordContact');
        contactLabel.setInvalid(false);
        if ($recoverForm['passwordContactSecond'].value === '' || $recoverForm['passwordContactThird'].value === '') {
            contactLabel.setInvalid(true).$message.innerText = '연락처를 입력해 주세요.';
        } else if (!/^(\d{3,4})$/.test($recoverForm['passwordContactSecond'].value) || !/^(\d{4})$/.test($recoverForm['passwordContactThird'].value)) {
            contactLabel.setInvalid(true).$message.innerText = '올바른 연락처를 입력해 주세요.';
        }
        if (contactLabel.isInvalid()) {
            contactLabel.$field.focus();
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('contactFirst', $recoverForm['passwordContactFirst'].value);
        formData.append('contactSecond', $recoverForm['passwordContactSecond'].value);
        formData.append('contactThird', $recoverForm['passwordContactThird'].value);
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
                case 'success':
                    passwordCount = 300;
                    passwordCountInterval = setInterval(() => {
                        passwordCount--;
                        if (passwordCount <= 0) {
                            $passwordCancel.dispatchEvent(new Event('click'));
                            dialog.showSimpleOk('경고', '연락처 인증번호 입력 시간이 초과되었습니다. 처음부터 다시 시도해 주세요.');
                            return;
                        }
                        $passwordRemainingMinutes.innerText = Math.trunc(passwordCount / 60);
                        $passwordRemainingSeconds.innerText = (passwordCount % 60).toString().padStart(2, '0');
                    }, 1000);
                    $passwordRemainingMinutes.innerText = '5';
                    $passwordRemainingSeconds.innerText = '00';
                    $passwordCount.show();
                    dialog.showSimpleOk('알림', `입력하신 연락처(<b>${$recoverForm['passwordContactFirst'].value}-${$recoverForm['passwordContactSecond'].value}-${$recoverForm['passwordContactThird'].value}</b>)로 인증번호가 포함된 문자 메세지를 전송하였습니다. 인증번호는 5분간만 유효하니 유의해 주세요.`, {
                        isContentHtml: true,
                        onClickOkCallback: () => {
                            $recoverForm['passwordContactSalt'].value = response['salt'];
                            $recoverForm['passwordContactFirst'].setAttribute('disabled', '');
                            $recoverForm['passwordContactSecond'].setAttribute('disabled', '');
                            $recoverForm['passwordContactThird'].setAttribute('disabled', '');
                            $recoverForm['passwordContactSend'].setAttribute('disabled', '');
                            $recoverForm['passwordContactCode'].removeAttribute('disabled');
                            $recoverForm['passwordContactVerify'].removeAttribute('disabled');
                            $recoverForm['passwordContactCode'].focus();
                        }
                    })
                    break;
                default:
                    dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
            }
        };
        xhr.open('POST', `${origin}/contact-token/sms?type=recoverPassword`);
        xhr.send(formData);
        loading.show();
    });
    $recoverForm['passwordContactVerify'].addEventListener('click', () => {
        const contactCodeLabel = /** @type {HyLabel} */ objectManager.get('recoverPasswordContactCode');
        const passwordLabel = /** @type {HyLabel} */ objectManager.get('recoverPasswordNew');
        const passwordCheckLabel = /** @type {HyLabel} */ objectManager.get('recoverPasswordNewCheck');
        contactCodeLabel.setInvalid(false);
        if ($recoverForm['passwordContactCode'].value === '') {
            contactCodeLabel.setInvalid(true).$message.innerText = '휴대폰 인증번호를 입력해 주세요.';
        } else if (!/^(\d{6})$/.test($recoverForm['passwordContactCode'].value)) {
            contactCodeLabel.setInvalid(true).$message.innerText = '올바른 휴대폰 인증번호를 입력해 주세요.';
        }
        if (contactCodeLabel.isInvalid()) {
            contactCodeLabel.$field.focus();
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('contactFirst', $recoverForm['passwordContactFirst'].value);
        formData.append('contactSecond', $recoverForm['passwordContactSecond'].value);
        formData.append('contactThird', $recoverForm['passwordContactThird'].value);
        formData.append('code', $recoverForm['passwordContactCode'].value);
        formData.append('salt', $recoverForm['passwordContactSalt'].value);
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
                    dialog.showSimpleOk('경고', '인증번호가 올바르지 않습니다. 다시 확인해 주세요.');
                    break;
                case 'failure_expired':
                    $passwordCancel.dispatchEvent(new Event('click'));
                    dialog.showSimpleOk('경고', '휴대폰 인증번호 입력 시간이 초과되었습니다. 처음부터 다시 시도해 주세요.');
                    break;
                case 'success':
                    clearInterval(passwordCountInterval);
                    passwordCount = 0;
                    passwordCountInterval = -1;
                    $passwordCount.hide();
                    $passwordRemainingMinutes.innerText = '0';
                    $passwordRemainingSeconds.innerText = '00';
                    $recoverForm['passwordContactCode'].setAttribute('disabled', '');
                    $recoverForm['passwordContactVerify'].setAttribute('disabled', '');
                    $recoverForm['passwordSuccessModify'].show();
                    $recoverForm.querySelector(`[data-hy-reference="passwordSuccessPassword"]`).show();
                    passwordLabel.$element.show();
                    passwordCheckLabel.$element.show();
                    dialog.showSimpleOk('알림', '휴대폰 인증이 완료되었습니다. 새로 사용할 비밀번호를 입력해 주세요.', {isContentHtml: true});
                    break;
                default:
                    dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
            }
        };
        xhr.open('PATCH', `${origin}/contact-token/sms`);
        xhr.send(formData);
        loading.show();
    });
    $recoverForm['passwordSuccessModify'].addEventListener('click', () => {
        const emailLabel = /** @type {HyLabel} */ objectManager.get('recoverPasswordEmail');
        const passwordLabel = /** @type {HyLabel} */ objectManager.get('recoverPasswordNew');
        const passwordCheckLabel = /** @type {HyLabel} */ objectManager.get('recoverPasswordNewCheck');
        const labels = [emailLabel, passwordLabel, passwordCheckLabel];
        labels.forEach((label) => label.setInvalid(false));
        if ($recoverForm['passwordEmail'].value === '') {
            emailLabel.setInvalid(true).$message.innerText = '이메일을 입력해 주세요.';
        } else if (!/^(?=.{8,50}$)([\da-z\-_.]{4,})@([\da-z][\da-z\-]*[\da-z]\.)?([\da-z][\da-z\-]*[\da-z])\.([a-z]{2,15})(\.[a-z]{2,3})?$/.test($recoverForm['passwordEmail'].value)) {
            emailLabel.setInvalid(true).$message.innerText = '올바른 이메일을 입력해 주세요.';
        }
        if ($recoverForm['passwordNew'].value === '') {
            passwordLabel.setInvalid(true).$message.innerText = '비밀번호를 입력해 주세요.';
        } else if (!/^([\da-zA-Z`~!@#$%^&*\(\)\-_=+\[\{\]\}\\\|;:'",<.>\/?]{8,50})$/.test($recoverForm['passwordNew'].value)) {
            passwordLabel.setInvalid(true).$message.innerText = '올바른 비밀번호를 입력해 주세요.';
        } else if ($recoverForm['passwordNewCheck'].value === '') {
            passwordCheckLabel.setInvalid(true).$message.innerText = '비밀번호를 한 번 더 입력해 주세요.';
        } else if ($recoverForm['passwordNew'].value !== $recoverForm['passwordNewCheck'].value) {
            passwordCheckLabel.setInvalid(true).$message.innerText = '비밀번호가 일치하지 않습니다.';
        }
        if (labels.some((label) => label.isInvalid() === true) === true) {
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('email', $recoverForm['passwordEmail'].value);
        formData.append('contactFirst', $recoverForm['passwordContactFirst'].value);
        formData.append('contactSecond', $recoverForm['passwordContactSecond'].value);
        formData.append('contactThird', $recoverForm['passwordContactThird'].value);
        formData.append('code', $recoverForm['passwordContactCode'].value);
        formData.append('salt', $recoverForm['passwordContactSalt'].value);
        formData.append('password', $recoverForm['passwordNew'].value);
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
                    dialog.showSimpleOk('경고', '알 수 없는 이유로 비밀번호를 재설정하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
                    break;
                case 'success':
                    dialog.showSimpleOk('알림', '비밀번호가 재설정되었습니다. 확인 버튼을 클릭하면 로그인 화면으로 돌아갑니다.', {
                        onClickOkCallback: () => {
                            $emailCancel.dispatchEvent(new Event('click'));
                            $passwordCancel.dispatchEvent(new Event('click'));
                            $mainContentMap['recoverForm'].hide();
                            $mainContentMap['loginForm'].show();
                        }
                    });
                    break;
                default:
                    dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
            }
        };
        xhr.open('PATCH', `${origin}/user/recover-password`);
        xhr.send(formData);
        loading.show();
    });
    [$recoverForm['recoverCancel'], $recoverForm['emailCancel'], $recoverForm['passwordCancel']].forEach(($cancel) => {
        $cancel.addEventListener('click', () => {
            dialog.showSimpleYesNo('경고', '정말로 계정 복구를 취소하고 로그인 화면으로 돌아갈까요? 입력된 모든 내용은 유실됩니다.', {
                onClickYesCallback: () => {
                    $emailCancel.dispatchEvent(new Event('click'));
                    $passwordCancel.dispatchEvent(new Event('click'));
                    $mainContentMap['recoverForm'].hide();
                    $mainContentMap['loginForm'].show();
                }
            })
        });
    });
}