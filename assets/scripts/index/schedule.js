class ScheduleHandler {
    /** @type {HTMLElement} */
    $element;
    /** @type {{
     *     [p: string]: any,
     *     $element?: HTMLFormElement,
     *     $labelMap?: {[p: string]: HTMLLabelElement},
     *     $locationList?: HTMLUListElement,
     *     $map?: HTMLElement,
     *     mapInstance?: google.maps.Map,
     *     onAllDayInput?: function(InputEvent?),
     *     onCancelClick?: function(PointerEvent?),
     *     onLocationKeywordKeydown?: function(KeyboardEvent?),
     *     onLocationRemoveButtonClick?: function(PointerEvent?),
     *     onLocationSearchButtonClick?: function(PointerEvent?),
     *     onStartAtInput?: function(InputEvent?),
     *     onSubmit?: function(SubmitEvent?)
     * }} */
    add = {
        onAllDayInput: () => {
            if (this.add.$element['allDay'].checked === true) {
                this.add.$element['endAt'].setAttribute('disabled', '');
                this.add.onStartAtInput();
            } else {
                this.add.$element['endAt'].removeAttribute('disabled');
            }
        },
        onCancelClick: () => {
            this.$element.hide();
        },
        onLocationKeywordKeydown: (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.add.onLocationSearchButtonClick();
            }
        },
        onLocationRemoveButtonClick: () => {
            this.add.$element['locationKeyword'].value = '';
            this.add.$element['addressPrimary'].value = '';
            this.add.$element['addressSecondary'].value = '';
            this.add.$element['latitude'].value = '';
            this.add.$element['longitude'].value = '';
            this.add.$locationList.hide();
            this.add.$map.hide();
            this.add.$labelMap['address'].hide();
        },
        onLocationSearchButtonClick: async () => {
            const $form = this.add.$element;
            const $label = this.add.$labelMap['location'];
            const hyLabel = new HyLabel({$element: $label});
            hyLabel.setInvalid(false).$message.innerText = '';
            if ($form['locationKeyword'].value === '') {
                hyLabel.setInvalid(true).$message.innerText = '검색할 장소를 입력해 주세요.';
            }
            if (hyLabel.isInvalid() === true) {
                return;
            }
            const {Place} = await google.maps.importLibrary('places');
            const request = {
                textQuery: $form['locationKeyword'].value,
                fields: ['displayName', 'location', 'addressComponents'],
                isOpenNow: true,
                language: "ko-KR",
                maxResultCount: 10,
                useStrictTypeFiltering: false
            };
            loading.show();
            const {places} = await Place.searchByText(request);
            const $locationList = this.add.$locationList;
            const $emptyMessage = $locationList.querySelector('[data-hy-reference="message"][data-hy-name="empty"]');
            this.add.$labelMap['address'].hide();
            this.add.$map.hide();
            $locationList.querySelectorAll('[data-hy-reference="item"]').forEach(($item) => $item.remove());
            $locationList.hide();
            $emptyMessage.hide();
            if (places.length === 0) {
                $emptyMessage.show();
            } else {
                let $firstItem = null;
                for (const place of places) {
                    const addressComponents = place['Dg']['addressComponents'];
                    const address = `${addressComponents[4]?.['longText'] ?? ''} ${addressComponents[3]?.['longText'] ?? ''} ${addressComponents[2]?.['longText'] ?? ''} ${addressComponents[1]?.['longText'] ?? ''} ${addressComponents[0]?.['longText'] ?? ''}`;
                    const $item = new DOMParser().parseFromString(`
                    <li class="item" data-hy-reference="item">
                        <span class="display-name">${place['Dg']['displayName']}</span>
                        <span class="address" data-hy-reference="address">${address}</span>
                    </li>`, 'text/html').querySelector('[data-hy-reference="item"]');
                    $firstItem ??= $item;
                    $item.addEventListener('click', async () => {
                        $locationList.querySelectorAll('[data-hy-reference="item"]').forEach(($item) => $item.classList.remove('-selected'));
                        places.forEach((place) => {
                            if (place['_marker'] != null) {
                                place['_marker']['position'] = null;
                            }
                        })
                        if (place['_marker'] == null) {
                            const {AdvancedMarkerElement} = await google.maps.importLibrary("marker");
                            const map = this.add.mapInstance;
                            place['_marker'] = new AdvancedMarkerElement({
                                map,
                                position: place['location'],
                                title: place['displayName'],
                            });
                        }
                        $item.classList.add('-selected');
                        $form['addressPrimary'].value = address;
                        $form['latitude'].value = place['location']['lat']();
                        $form['longitude'].value = place['location']['lng']();
                        $locationList.show();
                        this.add.$labelMap['address'].show();
                        this.add.$map.show();
                        this.add.mapInstance.setCenter(place['location']);
                    });
                    $locationList.append($item);
                }
                $firstItem?.dispatchEvent(new Event('click'));
            }
            loading.hide();
        },
        onStartAtInput: () => {
            if (this.add.$element['allDay'].checked === true && this.add.$element['startAt'].value !== '') {
                /** @type {Date} */
                const startAt = new Date(this.add.$element['startAt'].value);
                this.add.$element['startAt'].value = `${startAt.getFullYear()}-${(startAt.getMonth() + 1).toString().padStart(2, '0')}-${startAt.getDate().toString().padStart(2, '0')}T00:00:00`;
                this.add.$element['endAt'].value = `${startAt.getFullYear()}-${(startAt.getMonth() + 1).toString().padStart(2, '0')}-${startAt.getDate().toString().padStart(2, '0')}T23:59:59`;
            }
        },
        onSubmit: (e) => {
            e.preventDefault();
            const $form = this.add.$element;
            /** @type {{[p: string]: HyLabel}} */
            const hyLabelMap = {};
            Object.keys(this.add.$labelMap).forEach((name) => hyLabelMap[name] = new HyLabel({$element: this.add.$labelMap[name]}));
            Object.values(hyLabelMap).forEach((label) => label.setInvalid(false));
            if ($form['startAt'].value === '' || $form['endAt'].value === '') {
                hyLabelMap['due'].setInvalid(true).$message.innerText = '날짜 및 시간을 선택해 주세요.';
            } else {
                const startAtDate = new Date($form['startAt'].value);
                const endAtDate = new Date($form['endAt'].value);
                if (startAtDate > endAtDate) {
                    hyLabelMap['due'].setInvalid(true).$message.innerText = '날짜 및 시간을 확인해 주세요. 시작 일시는 종료 일시보다 과거여야 합니다.';
                }
            }
            if ($form['title'].value === '') {
                hyLabelMap['title'].setInvalid(true).$message.innerText = '제목을 입력해 주세요.';
            }
            if (Object.values(hyLabelMap).some((label) => label.isInvalid())) {
                return;
            }
            loading.show();
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append('groupId', $form['group'].value);
            formData.append('title', $form['title'].value);
            formData.append('startAt', $form['startAt'].value);
            formData.append('endAt', $form['endAt'].value);
            if (this.add.$map.isVisible() === true) {
                formData.append('addressPrimary', $form['addressPrimary'].value);
                formData.append('addressSecondary', $form['addressSecondary'].value);
                formData.append('latitude', $form['latitude'].value);
                formData.append('longitude', $form['longitude'].value);
            }
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
                switch (response['result']) {
                    case 'failure':
                        dialog.showSimpleOk('경고', '알 수 없는 이유로 스케줄을 추가하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
                        break;
                    case 'failure_session_expired':
                        dialog.showSimpleOk('경고', '세션이 만료되었거나 해당 그룹에 스케줄을 추가할 권한이 없습니다.');
                        break;
                    case 'success':
                        this.$element.hide();
                        break;
                    default:
                        dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
                }
            };
            xhr.open('POST', `${origin}/schedule/`);
            xhr.send(formData);
        }
    };
    /** @type {{
     *     [p: string]: any,
     *     $element?: HTMLElement,
     *     $title?: HTMLElement,
     *     $due?: HTMLElement,
     *     $location?: HTMLElement,
     *     $map?: HTMLElement,
     *     $addressPrimary?: HTMLElement,
     *     $addressSecondary?: HTMLElement,
     *     $attachmentList?: HTMLUListElement,
     *     $attachmentMessageMap?: {[p: string]: HTMLLIElement},
     *     $articleCount?: HTMLElement,
     *     $articleList?: HTMLUListElement,
     *     $articleListMessageMap?: {[p: string]: HTMLLIElement},
     *     mapInstance?: google.maps.Map,
     *     appendComments: function(HTMLUListElement, {[p: string]: any}[], {[p: string]: any}[], number),
     *     onAttachmentItemDeleteClick?: function(PointerEvent?, {[p: string]: any}, HTMLLIElement),
     *     onCommentDeleteClick?: function(Event?, {[p: string]:any}, HTMLUListElement),
     *     onCommentModifyApplyClick?: function(Event?, {[p: string]: any}, HTMLLIElement),
     *     onCommentUploadAttachmentClick?: function(Event?, {[p: string]: any}, HTMLElement, HTMLUListElement),
     *     onUploadAnchorClick?: function(PointerEvent?)
     * }} */
    view = {
        $attachmentMessageMap: {},
        $articleListMessageMap: {},
        appendComments: ($commentList, filteredComments, wholeComments, step = 0) => {
            for (const comment of filteredComments) {
                const $item = new DOMParser().parseFromString(`
                    <li class="item ${comment['commentId'] == null ? 'root' : 'sub'}" data-hy-reference="item" data-hy-step="${step}">
                        <div class="head">
                            <span class="nickname">${comment['userNickname']}</span>
                            <span class="timestamp -flex-stretch">${comment['createdAt'].split('T').join(' ')}</span>
                            ${comment['mine'] === true ? `
                            <a class="action modify-cancel" data-hy-reference="modifyCancel">취소</a>
                            <a class="action modify-apply" data-hy-reference="modifyApply">완료</a>
                            <a class="action modify" data-hy-reference="modify">수정</a>
                            <a class="action delete" data-hy-reference="delete">삭제</a>` : ''}
                        </div>                                
                        <div class="body content" data-hy-reference="content">${comment['content']}</div>
                        <div class="body modify">
                            <label data-hy-object="label" data-hy-name="value" data-hy-reference="contentLabel">
                                <input autocomplete="email" class="-flex-stretch" maxlength="500" minlength="1" name="content" placeholder="수정할 내용을 입력해 주세요." type="text" value="${comment['content']}" data-hy-object="field" data-hy-component="label.field">
                                <span data-hy-component="label.message">수정할 내용을 입력해 주세요.</span>
                            </label>
                        </div>
                    </li>`, 'text/html').querySelector('[data-hy-reference="item"]');
                $item.querySelector('[data-hy-reference="modify"]')?.addEventListener('click', () => {
                    const contentLabel = new HyLabel({$element: $item.querySelector('[data-hy-reference="contentLabel"]')});
                    $item.classList.add('modifying');
                    contentLabel.$field.value = comment['content'];
                    contentLabel.$field.focus();
                });
                $item.querySelector('[data-hy-reference="modifyCancel"]')?.addEventListener('click', () => $item.classList.remove('modifying'));
                $item.querySelector('[data-hy-reference="modifyApply"]')?.addEventListener('click', (e) => this.view.onCommentModifyApplyClick(e, comment, $item));
                $item.querySelector('[data-hy-reference="delete"]')?.addEventListener('click', (e) => this.view.onCommentDeleteClick(e, comment, $commentList));
                $item.style.marginLeft = `${step}rem`;
                $commentList.append($item);
                const subComments = wholeComments.filter((x) => comment['id'] === x['commentId']);
                if (subComments.length > 0) {
                    this.view.appendComments($commentList, subComments, wholeComments, step + 1);
                }
            }
        },
        onAttachmentItemDeleteClick: (e, attachment, $item) => {
            e.preventDefault();
            dialog.showSimpleYesNo('경고', `정말로 선택한 첨부 파일(${attachment['name']})을 삭제할까요?`, {
                onClickYesCallback: () => {
                    loading.show();
                    const xhr = new XMLHttpRequest();
                    const formData = new FormData();
                    formData.append('id', attachment['id']);
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
                            case 'failure_session_expired':
                                dialog.showSimpleOk('경고', '첨부 파일을 삭제하지 못하였습니다. 세션이 만료되었거나 권한이 없습니다.');
                                break;
                            case 'success':
                                dialog.showSimpleOk('알림', '첨부 파일을 성공적으로 삭제하였습니다.', {
                                    onClickOkCallback: () => {
                                        $item.remove();
                                        if (this.view.$attachmentList.querySelectorAll('[data-hy-reference="item"]').length === 0) {
                                            this.view.$attachmentMessageMap['empty'].show();
                                        }
                                    }
                                });
                                break;
                            default:
                                dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
                        }
                    };
                    xhr.open('DELETE', `${origin}/attachment/`);
                    xhr.send(formData);
                }
            });
        },
        onCommentDeleteClick: (e, comment, $commentList) => {
            dialog.showSimpleYesNo('경고', '정말로 선택한 댓글을 삭제할까요?', {
                onClickYesCallback: () => {
                    loading.show();
                    const xhr = new XMLHttpRequest();
                    const formData = new FormData();
                    formData.append('id', comment['id']);
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
                                dialog.showSimpleOk('경고', '알 수 없는 이유로 댓글을 삭제하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
                                break;
                            case 'failure_session_expired':
                                dialog.showSimpleOk('경고', '세션이 만료되었거나 댓글을 삭제할 권한이 없습니다.');
                                break;
                            case 'success':
                                loading.show();
                                $commentList.querySelectorAll('[data-hy-reference="item"]').forEach(($item) => $item.remove());
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
                                    const comments = JSON.parse(xhr.responseText);
                                    if (comments.length === 0) {
                                        $commentList.querySelector('[data-hy-reference="message"][data-hy-name="empty"]').show();
                                    } else {
                                        this.view.appendComments($commentList, comments.filter((comment) => comment['commentId'] == null), comments, 0);
                                    }
                                };
                                xhr.open('GET', `${origin}/comment/all?articleId=${comment['articleId']}`);
                                xhr.send();
                                break;
                            default:
                                dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
                        }
                    };
                    xhr.open('DELETE', `${origin}/comment/`);
                    xhr.send(formData);
                }
            });
        },
        onCommentModifyApplyClick: (e, comment, $item) => {
            const contentLabel = new HyLabel({$element: $item.querySelector('[data-hy-reference="contentLabel"]')});
            if (contentLabel.$field.value === '') {
                contentLabel.setInvalid(true).$message.innerText = '수정할 내용을 입력해 주세요.';
            }
            if (contentLabel.isInvalid() === true) {
                return;
            }
            loading.show();
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append('id', comment['id']);
            formData.append('content', contentLabel.$field.value);
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
                        dialog.showSimpleOk('경고', '알 수 없는 이유로 댓글을 수정하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
                        break;
                    case 'failure_session_expired':
                        dialog.showSimpleOk('경고', '세션이 만료되었거나 댓글을 수정할 권한이 없습니다.');
                        break;
                    case 'success':
                        comment['content'] = contentLabel.$field.value;
                        $item.querySelector('[data-hy-reference="content"]').innerText = comment['content'];
                        $item.classList.remove('modifying');
                        break;
                    default:
                        dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
                }
            };
            xhr.open('PATCH', `${origin}/comment/`);
            xhr.send(formData);
        },
        onCommentUploadAttachmentClick: (e, article, $attachmentCount, $attachmentList) => {
            e.preventDefault();
            const $input = document.createElement('input');
            $input.addEventListener('input', () => {
                for (const file of $input.files) {
                    loading.show();
                    const xhr = new XMLHttpRequest();
                    const formData = new FormData();
                    formData.append('articleId', article['id']);
                    formData.append('_file', file);
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
                        switch (response['result']) {
                            case 'failure':
                                dialog.showSimpleOk('경고', '알 수 없는 이유로 첨부 파일을 업로드하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
                                break;
                            case 'success':
                                let size = file.size;
                                if (size >= 1048576) {
                                    size = (Math.trunc(size / 1048576 * 100) / 100).toLocaleString() + 'MB';
                                } else if (size >= 1024) {
                                    size = (Math.trunc(size / 1024 * 100) / 100).toLocaleString() + 'KB';
                                } else {
                                    size = size.toLocaleString() + 'Byte';
                                }
                                const $item = new DOMParser().parseFromString(`
                                    <li class="item uploading" data-hy-reference="item">
                                        <a class="name" data-hy-reference="anchor">${file.name}</a>
                                        <span class="size">${size}</span>
                                        <span class="-flex-stretch"></span>
                                        <a class="action" data-hy-reference="delete">삭제</a>
                                    </li>`, 'text/html').querySelector('[data-hy-reference="item"]');
                                const $anchor = $item.querySelector('[data-hy-reference="anchor"]');
                                $anchor.setAttribute('href', `${origin}/attachment/?id=${response['id']}`);
                                $anchor.setAttribute('target', '_blank');
                                $attachmentList.append($item);
                                $attachmentCount.innerText = (parseInt($attachmentCount.innerText) + 1).toLocaleString();
                                break;
                            default:
                                dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
                        }
                    };
                    xhr.open('POST', `${origin}/attachment/`);
                    xhr.send(formData);
                }
            });
            $input.setAttribute('multiple', '');
            $input.setAttribute('type', 'file');
            $input.click();
        },
        onUploadAnchorClick: (e) => {
            e.preventDefault();
            const $input = document.createElement('input');
            $input.addEventListener('input', () => {
                for (const file of $input.files) {
                    let size = file.size;
                    if (size >= 1048576) {
                        size = (Math.trunc(size / 1048576 * 100) / 100).toLocaleString() + 'MB';
                    } else if (size >= 1024) {
                        size = (Math.trunc(size / 1024 * 100) / 100).toLocaleString() + 'KB';
                    } else {
                        size = size.toLocaleString() + 'Byte';
                    }
                    const $item = new DOMParser().parseFromString(`
                        <li class="item uploading" data-hy-reference="item">
                            <a class="name" data-hy-reference="anchor">${file.name}</a>
                            <span class="size">${size}</span>
                            <span class="-flex-stretch"></span>
                            <span class="status working" data-hy-reference="status">업로드 중</span>
                        </li>`, 'text/html').querySelector('[data-hy-reference="item"]');
                    const $anchor = $item.querySelector('[data-hy-reference="anchor"]');
                    const $status = $item.querySelector('[data-hy-reference="status"]');
                    const xhr = new XMLHttpRequest();
                    const formData = new FormData();
                    formData.append('scheduleId', this.lastScheduleId);
                    formData.append('_file', file);
                    xhr.upload.onprogress = (e) => {
                        if (e.lengthComputable === true) {
                            const percent = Math.trunc(e.loaded / e.total * 10000) / 100;
                            $status.innerText = `업로드 중 (${percent}%)`;
                        }
                    };
                    xhr.upload.onerror = () => {
                        $status.innerText = '오류';
                        $status.setAttribute('class', 'status error');
                    };
                    xhr.upload.onload = () => {
                        $item.classList.remove('uploading');
                        $status.innerText = '완료';
                        $status.setAttribute('class', 'status complete');
                    };
                    xhr.onreadystatechange = () => {
                        if (xhr.readyState !== XMLHttpRequest.DONE) {
                            return;
                        }
                        if (xhr.status < 200 || xhr.status >= 300) {
                            xhr.upload.onerror(null);
                            return;
                        }
                        const response = JSON.parse(xhr.responseText);
                        if (response.result === 'success') {
                            $anchor.setAttribute('href', `${origin}/attachment/?id=${response.id}`);
                            $anchor.setAttribute('target', '_blank');
                            xhr.upload.onload(null);
                            this.view.$attachmentMessageMap['empty'].hide();
                        } else {
                            xhr.upload.onerror(null);
                        }
                    };
                    xhr.open('POST', `${origin}/attachment/`);
                    xhr.send(formData);
                    this.view.$attachmentList.append($item);
                }
            });
            $input.setAttribute('multiple', '');
            $input.setAttribute('type', 'file');
            $input.click();
        }
    };
    /** @type {google.maps.Map} */
    mapInstance;
    /** @type {number|undefined|null} */
    lastScheduleId;

    constructor() {
        this.$element = document.getElementById('schedule');

        this.add.$element = this.$element.querySelector('[data-hy-reference="body"][data-hy-name="add"]');
        this.add.$labelMap = {};
        this.add.$element.querySelectorAll('[data-hy-object="label"], [data-hy-object="checkLabel"]').forEach(($label) => {
            const name = $label.getAttribute('data-hy-name');
            this.add.$labelMap[name] = $label;
        });
        this.add.$locationList = this.add.$element.querySelector('[data-hy-reference="locationList"]');
        this.add.$map = this.add.$element.querySelector('[data-hy-reference="map"]');

        this.view.$element = this.$element.querySelector('[data-hy-reference="body"][data-hy-name="view"]');
        this.view.$title = this.view.$element.querySelector('[data-hy-reference="title"]');
        this.view.$due = this.view.$element.querySelector('[data-hy-reference="due"]');
        this.view.$location = this.view.$element.querySelector('[data-hy-reference="location"]');
        this.view.$map = this.view.$location.querySelector('[data-hy-reference="map"]');
        this.view.$addressPrimary = this.view.$location.querySelector('[data-hy-reference="addressPrimary"]');
        this.view.$addressSecondary = this.view.$location.querySelector('[data-hy-reference="addressSecondary"]');
        this.view.$attachmentList = this.view.$element.querySelector('[data-hy-reference="attachmentList"]');
        this.view.$attachmentList.querySelectorAll('[data-hy-reference="message"][data-hy-name]').forEach(($message) => {
            this.view.$attachmentMessageMap[$message.getAttribute('data-hy-name')] = $message;
        });
        this.view.$articleCount = this.view.$element.querySelector('[data-hy-reference="articleCount"]');
        this.view.$articleList = this.view.$element.querySelector('[data-hy-reference="articleList"]');
        this.view.$articleList.querySelectorAll('[data-hy-reference="message"][data-hy-name]').forEach(($message) => {
            this.view.$articleListMessageMap[$message.getAttribute('data-hy-name')] = $message;
        });

        this.$element.querySelector('[data-hy-reference="add"]').addEventListener('click', this.#addOnClick)
        this.$element.querySelector('[data-hy-reference="close"]').addEventListener('click', this.#closeOnClick);
        this.$element.querySelector('[data-hy-reference="delete"]').addEventListener('click', this.#deleteOnClick);

        this.add.$element.addEventListener('submit', this.add.onSubmit);
        this.add.$element['startAt'].addEventListener('input', this.add.onStartAtInput);
        this.add.$element['allDay'].addEventListener('input', this.add.onAllDayInput);
        this.add.$element['locationKeyword'].addEventListener('keydown', this.add.onLocationKeywordKeydown);
        this.add.$element['locationSearchButton'].addEventListener('click', this.add.onLocationSearchButtonClick);
        this.add.$element['locationRemoveButton'].addEventListener('click', this.add.onLocationRemoveButtonClick);
        this.add.$element['cancel'].addEventListener('click', this.add.onCancelClick);

        this.view.$element.querySelector('[data-hy-reference="uploadAnchor"]').addEventListener('click', this.view.onUploadAnchorClick);
    }

    #addOnClick = () => {
        this.$element.setAttribute('data-hy-mode', 'add');
    }

    #closeOnClick = () => {
        this.$element.hide();
    }

    #deleteOnClick = () => {
        dialog.showSimpleYesNo('경고', '정말로 해당 스케줄을 삭제할까요? 연관된 첨부파일과 댓글이 모두 삭제되며 되돌릴 수 없습니다.', {
            onClickYesCallback: () => {
                loading.show();
                const xhr = new XMLHttpRequest();
                const formData = new FormData();
                formData.append('id', this.lastScheduleId);
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
                    switch (response['result']) {
                        case 'failure_not_found':
                            dialog.showSimpleOk('경고', '해당 스케줄을 찾을 수 없습니다. 이미 삭제되었을 수도 있습니다.');
                            break;
                        case 'failure_session':
                            dialog.showSimpleOk('경고', '세션이 만료되었거나 해당 스케줄을 삭제할 권한이 없습니다.');
                            break;
                        case 'success':
                            dialog.showSimpleOk('알림', '해당 스케줄을 성공적으로 삭제하였습니다.');
                            this.$element.hide();
                            break;
                        default:
                            dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
                    }
                };
                xhr.open('DELETE', `${origin}/schedule/`);
                xhr.send(formData);
            }
        });
    }

    /** @param {{mode: 'add'|'modify'|'view', scheduleId?: number, initDate?: string}} args */
    show = (args) => {
        this.$element.setAttribute('data-hy-mode', args['mode']);
        if (args['mode'] === 'add') {
            this.showAdd(args);
        } else if (args['mode'] === 'view') {
            this.showView(args);
        }
    }

    /** @param {{[p: string]: any, initDate?: string}} args */
    showAdd = (args) => {
        loading.show();
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = async () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            loading.hide();
            if (xhr.status < 200 || xhr.status >= 300) {
                dialog.showSimpleOk('오류', '그룹 목록을 불러오지 못하였습니다. 잠시 후 다시 시도해 주세요.');
                return;
            }
            if (this.add.mapInstance == null) {
                const {Map} = await google.maps.importLibrary('maps');
                this.add.mapInstance = new Map(this.add.$map, {
                    zoom: 16,
                    mapId: 'addMap',
                });
            }
            // ClassicEditor.create(this.add.$element['content'], editorConfig);
            const groups = JSON.parse(xhr.responseText);
            this.add.$element.reset();
            this.add.$element['group'].querySelectorAll('option:not([value="0"])').forEach(($option) => $option.remove());
            this.add.$element['group'].append(...groups.map((group) => {
                const $option = document.createElement('option');
                $option.setAttribute('value', group['groupId']);
                $option.innerText = group['groupName'];
                return $option;
            }));
            if (args['initDate'] != null) {
                this.add.$element['startAt'].value = args['initDate'] + 'T00:00:00';
                this.add.$element['endAt'].value = args['initDate'] + 'T00:00:00';
            }
            this.$element.show();
            this.add.$element['title'].focus();
        };
        xhr.open('GET', `${origin}/group/active`);
        xhr.send();
        loading.show();
    }

    /** @param {{[p: string]: any, scheduleId: number}} args */
    showView = (args) => {
        loading.show();
        this.view.$location.hide();
        this.view.$addressPrimary.innerText = '';
        this.view.$addressSecondary.innerText = '';
        this.view.$attachmentList.querySelectorAll('[data-hy-reference="item"]').forEach(($item) => $item.remove());
        this.view.$attachmentMessageMap['empty'].show();
        this.view.$articleCount.innerText = '0';
        this.view.$articleList.querySelectorAll('[data-hy-reference="item"]').forEach(($item) => $item.remove());
        this.view.$articleListMessageMap['empty'].show();
        const xhr = new XMLHttpRequest();
        const url = new URL(`${origin}/schedule/`);
        url.searchParams.set('id', args.scheduleId.toString());
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            loading.hide();
            if (xhr.status < 200 || xhr.status >= 300) {
                dialog.showSimpleOk('오류', '요청을 처리하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
                return;
            }
            const schedule = JSON.parse(xhr.responseText);
            const startAtDate = new Date(/** @type {string} */ schedule['startAt']);
            const endAtDate = new Date(/** @type {string} */ schedule['endAt']);
            const startAt = schedule['startAt'].split('T').join(' ');
            const endAt = startAtDate.toDateString() === endAtDate.toDateString() ? schedule['endAt'].split('T')[1] : schedule['endAt'].split('T').join(' ');
            this.lastScheduleId = args['scheduleId'];
            this.view.$title.innerText = schedule['title'];
            this.view.$due.innerText = `${startAt} ~ ${endAt}`;
            if (schedule['latitude'] != null && schedule['longitude'] != null) {
                const map = new google.maps.Map(this.view.$map, {
                    center: new google.maps.LatLng(schedule['latitude'], schedule['longitude']),
                    mapId: 'defaultMap',
                    zoom: 12
                });
                new google.maps.marker.AdvancedMarkerElement({
                    map,
                    position: {lat: schedule['latitude'], lng: schedule['longitude']},
                });
                this.mapInstance = map;
                this.view.$addressPrimary.innerText = /** @type {string} */ schedule['addressPrimary'];
                this.view.$addressSecondary.innerText = /** @type {string} */ schedule['addressSecondary'] ?? '';
                this.view.$location.show();
            }
            this.view.$articleCount.innerText = schedule['articles'].length.toLocaleString();
            if (schedule['attachments'].length > 0) {
                this.view.$attachmentMessageMap['empty'].hide();
                for (const attachment of schedule['attachments']) {
                    let size = attachment['size'];
                    if (size >= 1048576) {
                        size = (Math.trunc(size / 1048576 * 100) / 100).toLocaleString() + 'MB';
                    } else if (size >= 1024) {
                        size = (Math.trunc(size / 1024 * 100) / 100).toLocaleString() + 'KB';
                    } else {
                        size = size.toLocaleString() + 'Byte';
                    }
                    const $item = new DOMParser().parseFromString(`
                        <li class="item" data-hy-reference="item">
                            <a class="name" href="${origin}/attachment/?id=${attachment['id']}" target="_blank" data-hy-reference="anchor">${attachment['name']}</a>
                            <span class="size">${size}</span>
                            <span class="-flex-stretch"></span>
                            ${schedule['mine'] === true ? '<a class="action" href="#" data-hy-reference="deleteAnchor">삭제</a>' : ''}
                        </li>`, 'text/html').querySelector('[data-hy-reference="item"]');
                    const $deleteAnchor = $item.querySelector('[data-hy-reference="deleteAnchor"]');
                    $deleteAnchor?.addEventListener('click', (e) => this.view.onAttachmentItemDeleteClick(e, attachment, $item));
                    this.view.$attachmentList.append($item);
                }
            }
            if (schedule['articles'].length > 0) {
                this.view.$articleListMessageMap['empty'].hide();
                for (const article of schedule['articles']) {
                    const $item = new DOMParser().parseFromString(`
                        <li class="item" data-hy-reference="item">
                            <div class="head">
                                <span class="nickname">${article['userNickname']}</span>
                                <span class="timestamp">${article['createdAt'].split('T').join(' ')}</span>
                                ${article['mine'] === true ? '<a class="action" data-hy-reference="delete">삭제</a>' : ''}
                            </div>
                            <div class="image-container" data-hy-reference="imageContainer"></div>
                            <div class="content" data-hy-reference="content"></div>
                            <div class="foot">
                                <span class="stat" data-hy-reference="commentStat">
                                    <img alt="댓글" class="icon" src="./assets/images/index/schedule/article/comment.png">
                                    <span class="caption" data-hy-reference="commentCount">${article['comments'].length.toLocaleString()}</span>
                                </span>
                                <span class="stat" data-hy-reference="attachmentStat">
                                    <img alt="첨부 파일" class="icon" src="./assets/images/index/schedule/article/attachment.png">
                                    <span class="caption" data-hy-reference="attachmentCount">${article['attachments'].length.toLocaleString()}</span>
                                </span>
                                <span class="-flex-stretch" role="none"></span>
                                ${article['mine'] === true ? '<span class="action" data-hy-reference="uploadAttachment">첨부파일 추가</span>' : ''}
                            </div>
                        </li>`, 'text/html').querySelector('[data-hy-reference="item"]');
                    const imageAttachments = article['attachments'].filter((attachment) => attachment['contentType'].startsWith('image/'));
                    if (imageAttachments.length > 0) {
                        const $imageContainer = $item.querySelector('[data-hy-reference="imageContainer"]');
                        for (const attachment of imageAttachments) {
                            const $imageWrapper = new DOMParser().parseFromString(`
                                <a class="image-wrapper" href="#" target="_blank" data-hy-reference="imageWrapper">
                                    <img alt="" class="image" src="${origin}/attachment/?id=${attachment['id']}">
                                </a>`, 'text/html').querySelector('[data-hy-reference="imageWrapper"]');
                            $imageContainer.append($imageWrapper);
                        }
                        $imageContainer.show();
                    }
                    const $content = $item.querySelector('[data-hy-reference="content"]');
                    $content.innerHTML = article['content'];
                    const $commentStat = $item.querySelector('[data-hy-reference="commentStat"]');
                    const $commentSubItem = new DOMParser().parseFromString(`
                        <li class="sub-item" data-hy-reference="subItem">
                            <ul class="list comment" data-hy-reference="commentList">
                                <li class="message" data-hy-reference="message" data-hy-name="empty">댓글이 없습니다.</li>
                            </ul>
                        </li>
                    `, 'text/html').querySelector('[data-hy-reference="subItem"]');
                    const $commentList = $commentSubItem.querySelector('[data-hy-reference="commentList"]');
                    if (article['comments'].length === 0) {
                        $commentList.querySelector('[data-hy-reference="message"][data-hy-name="empty"]').show();
                    } else {
                        this.view.appendComments($commentList, article['comments'].filter((comment) => comment['commentId'] == null), article['comments'], 0);
                    }
                    const $attachmentStat = $item.querySelector('[data-hy-reference="attachmentStat"]');
                    const $attachmentSubItem = new DOMParser().parseFromString(`
                        <li class="sub-item" data-hy-reference="subItem">
                            <ul class="list attachment" data-hy-reference="attachmentList">
                                <li class="message" data-hy-reference="message" data-hy-name="empty">첨부파일이 없습니다.</li>
                            </ul>
                        </li>
                    `, 'text/html').querySelector('[data-hy-reference="subItem"]');
                    const $attachmentList = $attachmentSubItem.querySelector('[data-hy-reference="attachmentList"]');
                    if (article['attachments'].length === 0) {
                        $attachmentList.querySelector('[data-hy-reference="message"][data-hy-name="empty"]').show();
                    } else {
                        for (const attachment of article['attachments']) {
                            let size = attachment['size'];
                            if (size >= 1048576) {
                                size = (Math.trunc(size / 1048576 * 100) / 100).toLocaleString() + 'MB';
                            } else if (size >= 1024) {
                                size = (Math.trunc(size / 1024 * 100) / 100).toLocaleString() + 'KB';
                            } else {
                                size = size.toLocaleString() + 'Byte';
                            }
                            const $item = new DOMParser().parseFromString(`
                                <li class="item uploading" data-hy-reference="item">
                                    <a class="name" data-hy-reference="anchor">${attachment['name']}</a>
                                    <span class="size -flex-stretch">${size}</span>
                                    <a class="action" data-hy-reference="delete">삭제</a>
                                </li>`, 'text/html').querySelector('[data-hy-reference="item"]');
                            const $anchor = $item.querySelector('[data-hy-reference="anchor"]');
                            $anchor.setAttribute('href', `${origin}/attachment/?id=${attachment['id']}`);
                            $anchor.setAttribute('target', '_blank');
                            $attachmentList.append($item);
                        }
                    }
                    $commentStat.addEventListener('click', () => {
                        $attachmentSubItem.setVisible(false);
                        $commentSubItem.setVisible(!$commentSubItem.isVisible());
                    });
                    $attachmentStat.addEventListener('click', () => {
                        $commentSubItem.setVisible(false);
                        $attachmentSubItem.setVisible(!$attachmentSubItem.isVisible());
                    });
                    const $attachmentCount = $item.querySelector('[data-hy-reference="attachmentCount"]');
                    const $uploadAttachment = $item.querySelector('[data-hy-reference="uploadAttachment"]');
                    $uploadAttachment?.addEventListener('click', (e) => this.view.onCommentUploadAttachmentClick(e, article, $attachmentCount, $attachmentList));
                    this.view.$articleList.append($item);
                    this.view.$articleList.append($commentSubItem);
                    this.view.$articleList.append($attachmentSubItem);
                }
            }
            this.$element.show();
        };
        xhr.open('GET', url);
        xhr.send();
    }
}

import ('./side/add.js');
import ('./side/view.js');