import {HyLabel} from "../../common/object/label.js";
import {Alignment, Autoformat, AutoImage, Autosave, BlockQuote, Bold, ClassicEditor, Essentials, FindAndReplace, FontBackgroundColor, FontColor, FontFamily, FontSize, GeneralHtmlSupport, Highlight, ImageBlock, ImageCaption, ImageInline, ImageInsert, ImageInsertViaUrl, ImageResize, ImageStyle, ImageTextAlternative, ImageToolbar, ImageUpload, Indent, IndentBlock, Italic, Link, LinkImage, List, ListProperties, MediaEmbed, Mention, Paragraph, PasteFromOffice, RemoveFormat, SimpleUploadAdapter, Strikethrough, Table, TableCaption, TableCellProperties, TableColumnResize, TableProperties, TableToolbar, TextTransformation, TodoList, Underline} from '../../../libraries/ckeditor5/ckeditor5.js';
import translations from '../../../libraries/ckeditor5/translations/ko.js';

class ScheduleViewHandler {
    /**
     * @param {number} size
     * @return {string} */
    static formatFileSize = (size) => {
        if (size >= 1048576) {
            return (Math.trunc(size / 1048576 * 100) / 100).toLocaleString() + 'MB';
        } else if (size >= 1024) {
            return (Math.trunc(size / 1024 * 100) / 100).toLocaleString() + 'KB';
        } else {
            return size.toLocaleString() + 'Byte';
        }
    }

    /** @type {HTMLElement} */ $side;
    /** @type {HTMLElement} */ $element;
    /** @type {HTMLElement} */ $title;
    /** @type {HTMLElement} */ $due;
    /** @type {HTMLElement} */ $location;
    /** @type {HTMLElement} */ $map;
    /** @type {HTMLElement} */ $addressPrimary;
    /** @type {HTMLElement} */ $addressSecondary;
    /** @type {HTMLUListElement} */ $attachmentList;
    /** @type {{[p: string]: HTMLLIElement}} */ $attachmentListMessageMap = {};
    /** @type {HTMLAnchorElement} */ $uploadAnchor;
    /** @type {HTMLUListElement} */ $articleList;
    /** @type {HTMLElement} */ $articleCount;
    /** @type {HTMLFormElement} */ $articleWriteForm;
    /** @type {{[p: string]: HTMLLIElement}} */ $articleListMessageMap = {};
    mapInstance;
    mapCenterMarker;
    editorInstance;
    lastSchedule;

    /** @param {{$side: HTMLElement}} args */
    constructor(args) {
        this.$side = args.$side;
        this.$element = this.$side.querySelector('[data-hy-reference="body"][data-hy-name="view"]');
        this.$title = this.$element.querySelector('[data-hy-reference="title"]');
        this.$due = this.$element.querySelector('[data-hy-reference="due"]');
        this.$location = this.$element.querySelector('[data-hy-reference="location"]');
        this.$map = this.$element.querySelector('[data-hy-reference="map"]');
        this.$addressPrimary = this.$element.querySelector('[data-hy-reference="addressPrimary"]');
        this.$addressSecondary = this.$element.querySelector('[data-hy-reference="addressSecondary"]');
        this.$attachmentList = this.$element.querySelector('[data-hy-reference="attachmentList"]');
        this.$attachmentListMessageMap = {};
        this.$attachmentList.querySelectorAll('[data-hy-reference="message"][data-hy-name]').forEach(($message) => {
            this.$attachmentListMessageMap[$message.getAttribute('data-hy-name')] = $message;
        });
        this.$uploadAnchor = this.$element.querySelector('[data-hy-reference="uploadAnchor"]');
        this.$articleList = this.$element.querySelector('[data-hy-reference="articleList"]');
        this.$articleCount = this.$articleList.querySelector('[data-hy-reference="articleCount"]');
        this.$articleWriteForm = this.$articleList.querySelector('[data-hy-reference="writeForm"]')
        this.$articleListMessageMap = {};
        this.$articleList.querySelectorAll('[data-hy-reference="message"][data-hy-name]').forEach(($message) => {
            this.$articleListMessageMap[$message.getAttribute('data-hy-name')] = $message;
        });

        this.$uploadAnchor.addEventListener('click', this.#_uploadAnchorOnClick);
        this.$articleWriteForm.addEventListener('submit', this.#_articleWriteFormOnSubmit);

        ClassicEditor.create(this.$articleWriteForm['content'], {
            toolbar: {
                items: ['fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|', 'bold', 'italic', 'underline', 'strikethrough', 'removeFormat', '|', 'link', 'insertImage', 'mediaEmbed', 'insertTable', 'highlight', 'blockQuote', '|', 'alignment', '|', 'bulletedList', 'numberedList', 'todoList', 'outdent', 'indent'],
                shouldNotGroupWhenFull: true
            },
            plugins: [Alignment, Autoformat, AutoImage, Autosave, BlockQuote, Bold, Essentials, FindAndReplace, FontBackgroundColor, FontColor, FontFamily, FontSize, GeneralHtmlSupport, Highlight, ImageBlock, ImageCaption, ImageInline, ImageInsert, ImageInsertViaUrl, ImageResize, ImageStyle, ImageTextAlternative, ImageToolbar, ImageUpload, Indent, IndentBlock, Italic, Link, LinkImage, List, ListProperties, MediaEmbed, Mention, Paragraph, PasteFromOffice, RemoveFormat, SimpleUploadAdapter, Strikethrough, Table, TableCaption, TableCellProperties, TableColumnResize, TableProperties, TableToolbar, TextTransformation, TodoList, Underline],
            fontFamily: {
                supportAllValues: true
            },
            fontSize: {
                options: [10, 12, 14, 'default', 18, 20, 22],
                supportAllValues: true
            },
            htmlSupport: {
                allow: [
                    {
                        name: /^.*$/,
                        styles: true,
                        attributes: true,
                        classes: true
                    }
                ]
            },
            image: {
                toolbar: ['toggleImageCaption', 'imageTextAlternative', '|', 'imageStyle:inline', 'imageStyle:wrapText', 'imageStyle:breakText', '|', 'resizeImage']
            },
            initialData: '',
            language: 'ko',
            licenseKey: 'GPL',
            link: {
                addTargetToExternalLinks: true,
                defaultProtocol: 'https://',
                decorators: {
                    toggleDownloadable: {
                        mode: 'manual',
                        label: 'Downloadable',
                        attributes: {
                            download: 'file'
                        }
                    }
                }
            },
            list: {
                properties: {
                    styles: true,
                    startIndex: true,
                    reversed: true
                }
            },
            mention: {
                feeds: [{marker: '@', feed: []}]
            },
            placeholder: '내용을 입력해 주세요.',
            table: {contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties']},
            translations: [translations]
        }).then((editor) => this.editorInstance = editor);
    }

    #_uploadAnchorOnClick = (e) => {
        e.preventDefault();
        const $input = document.createElement('input');
        $input.addEventListener('input', () => {
            if ($input.files == null || $input.files.length === 0) {
                return;
            }
            loading.show();
            const file = $input.files[0];
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append('scheduleId', this.lastSchedule.id);
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
                switch (response.result) {
                    case 'failure':
                        dialog.showSimpleOk('경고', '알 수 없는 이유로 첨부 파일을 업로드하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
                        break;
                    case 'failure_session_expired':
                        dialog.showSimpleOk('경고', '세션이 만료되었거나 첨부 파일을 업로드할 권한이 없습니다.');
                        break;
                    case 'success':
                        this.lastSchedule.attachments = null;
                        this.#drawAttachmentList(this.lastSchedule);
                        break;
                    default:
                        dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
                }
            };
            xhr.open('POST', `${origin}/attachment/`);
            xhr.send(formData);
        });
        $input.setAttribute('type', 'file');
        $input.click();
    }

    #_articleWriteFormOnSubmit = (e) => {
        e.preventDefault();
        if (this.editorInstance.getData().length === 0) {
            dialog.showSimpleOk('경고', '게시글 내용을 입력해 주세요.');
            return;
        }
        loading.show();
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('scheduleId', this.lastSchedule.id);
        formData.append('content', this.editorInstance.getData());
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
                    dialog.showSimpleOk('경고', '알 수 없는 이유로 게시글을 작성하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
                    break;
                case 'failure_session_expired':
                    dialog.showSimpleOk('경고', '세션이 만료되었거나 게시글을 작성할 권한이 없습니다.');
                    break;
                case 'success':
                    this.editorInstance.setData('');
                    this.lastSchedule.articles = null;
                    this.#drawArticleList(this.lastSchedule);
                    break;
                default:
                    dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
            }
        };
        xhr.open('POST', `${origin}/article/`);
        xhr.send(formData);
    }

    /** @param {{[p: string]: any, title: string, startAt: string, endAt: string}} schedule */
    #drawTitle = (schedule) => {
        this.$title.innerText = schedule.title;
        const startAtDate = new Date(schedule.startAt);
        const endAtDate = new Date(schedule.endAt);
        if (startAtDate.toFormattedDate() === endAtDate.toFormattedDate()) {
            if (startAtDate.toFormattedTime() === '00:00:00' && endAtDate.toFormattedTime() === '23:59:59') {
                this.$due.innerText = startAtDate.toFormattedDate();
            } else {
                this.$due.innerText = `${startAtDate.toFormattedDateTime()} ~ ${endAtDate.toFormattedTime()}`;
            }
        } else {
            this.$due.innerText = `${startAtDate.toFormattedDateTime()} ~ ${endAtDate.toFormattedDateTime()}`;
        }
    }

    /** @param {{[p: string]: any, addressPrimary?: string, addressSecondary?: string, latitude?: number, longitude?: number}} schedule */
    #drawLocation = async (schedule) => {
        if (schedule.addressPrimary == null || schedule.latitude == null || schedule.longitude == null) {
            this.$location.hide();
            return;
        }
        if (this.mapInstance == null) {
            const {Map} = await google.maps.importLibrary('maps');
            this.mapInstance = new Map(this.$map, {
                zoom: 16,
                mapId: 'mapInstance',
            });
        }
        this.mapInstance.setCenter({
            lat: schedule.latitude,
            lng: schedule.longitude
        });
        this.mapCenterMarker?.setMap(null);
        this.mapCenterMarker = new google.maps.marker.AdvancedMarkerElement({
            map: this.mapInstance,
            position: {
                lat: schedule.latitude,
                lng: schedule.longitude
            },
        });
        this.$addressPrimary.innerText = schedule.addressPrimary;
        this.$addressSecondary.innerText = schedule.addressSecondary ?? '';
        this.$location.show();
    }

    /** @param {{[p: string]: any, id: number, mine: boolean, attachments?: {id: number, name: string, size: number}[]}} schedule */
    #drawAttachmentList = (schedule) => {
        Object.values(this.$attachmentListMessageMap).forEach(($message) => $message.hide());
        this.$attachmentList.querySelectorAll('[data-hy-reference="item"]').forEach(($item) => $item.remove());
        this.$uploadAnchor.setVisible(schedule.mine);
        if (schedule.attachments == null) {
            loading.show();
            fetch(`${origin}/attachment/all?scheduleId=${schedule.id}`, {
                method: 'GET'
            }).then((response) => {
                if (!response.ok) {
                    throw new Error(response.status.toString());
                }
                return response.json();
            }).then((attachments) => {
                this.#drawAttachmentList({...schedule, attachments: attachments});
            }).catch((error) => {
                console.error(error);
                this.$attachmentListMessageMap['error'].show();
            }).finally(() => loading.hide());
            return;
        }
        if (schedule.attachments.length === 0) {
            this.$attachmentListMessageMap['empty'].show();
            return;
        }
        for (const attachment of schedule.attachments) {
            const $item = new DOMParser().parseFromString(`
                <li class="item" data-hy-reference="item">
                    <a class="name" target="_blank" data-hy-reference="nameAnchor"></a>
                    <span class="size" data-hy-reference="size"></span>
                    <span class="-flex-stretch" role="none"></span>
                    ${schedule.mine === true ? `
                    <a href="#" data-hy-reference="delete">삭제</a>`: ''}
                </li>`, 'text/html').querySelector('[data-hy-reference="item"]');
            const $nameAnchor = $item.querySelector('[data-hy-reference="nameAnchor"]');
            $nameAnchor.innerText = attachment.name;
            $nameAnchor.setAttribute('href', `${origin}/attachment/?id=${attachment.id}`);
            $item.querySelector('[data-hy-reference="size"]').innerText = ScheduleViewHandler.formatFileSize(attachment.size);
            if (schedule.mine === true) {
                $item.querySelector('[data-hy-reference="delete"]').addEventListener('click', (e) => {
                    e.preventDefault();
                    dialog.showSimpleYesNo('경고', `정말로 선택한 첨부 파일(${attachment.name})을 삭제할까요?`, {
                        onClickYesCallback: () => {
                            loading.show();
                            const xhr = new XMLHttpRequest();
                            const formData = new FormData();
                            formData.append('id', attachment.id.toString());
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
                                        dialog.showSimpleOk('경고', '알 수 없는 이유로 첨부 파일을 삭제하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
                                        break;
                                    case 'failure_session_expired':
                                        dialog.showSimpleOk('경고', '세션이 만료되었거나 해당 첨부 파일을 삭제할 권한이 없습니다.');
                                        break;
                                    case 'success':
                                        dialog.showSimpleOk('알림', '첨부 파일을 성공적으로 삭제하였습니다.', {
                                            onClickOkCallback: () => {
                                                schedule.attachments = null;
                                                this.#drawAttachmentList(schedule);
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
                });
            }
            this.$attachmentList.append($item);
        }
    }

    /** @param {{[p: string]: any, id: number, mine: boolean, articles?: {id: number, userNickname: string, content: string, mine: boolean, attachments?: {id: number, name: string, size: number, contentType: string}[], comments: {[p: string]: any, id: number, commentId?: number, content: string, userNickname: string, createdAt: string, mine: boolean}[]}[]}} schedule */
    #drawArticleList = (schedule) => {
        Object.values(this.$articleListMessageMap).forEach(($message) => $message.hide());
        this.$articleList.querySelectorAll('[data-hy-reference="item"]').forEach(($item) => $item.remove());
        if (schedule.articles == null) {
            loading.show();
            fetch(`${origin}/article/all?scheduleId=${schedule.id}`, {
                method: 'GET'
            }).then((response) => {
                if (!response.ok) {
                    throw new Error(response.status.toString());
                }
                return response.json();
            }).then((articles) => {
                this.#drawArticleList({...schedule, articles: articles});
            }).catch((error) => {
                console.error(error);
                this.$articleListMessageMap['error'].show();
            }).finally(() => loading.hide());
            return;
        }
        this.$articleCount.innerText = schedule.articles.length.toLocaleString();
        if (schedule.articles.length === 0) {
            this.$articleListMessageMap['empty'].show();
            return;
        }
        for (const article of schedule.articles) {
            const $item = new DOMParser().parseFromString(`
                <li class="item" data-hy-reference="item">
                    <div class="head" data-hy-reference="head">
                        <span class="nickname" data-hy-reference="nickname"></span>
                        <span class="timestamp" data-hy-reference="timestamp"></span>
                        <span class="-flex-stretch" role="none"></span>
                        ${article.mine === true ? `
                        <a class="action" href="#" data-hy-reference="uploadAttachment">첨부 파일 추가</a>
                        <a class="action" href="#" data-hy-reference="modify">수정</a>
                        <a class="action" href="#" data-hy-reference="delete">삭제</a>` : ''}
                    </div>
                    <div class="image-container" data-hy-reference="imageContainer"></div>
                    <div class="body content -visible" data-hy-reference="content"></div>
                    <div class="foot" data-hy-reference="foot">
                        <span class="stat" data-hy-reference="commentToggle">
                            <img alt="댓글" class="icon" src="./assets/images/index/schedule/article/comment.png">
                            <span class="caption" data-hy-reference="commentCount">${article.comments?.length.toLocaleString() ?? 0}</span>
                        </span>
                        <span class="stat" data-hy-reference="attachmentToggle">
                            <img alt="첨부 파일" class="icon" src="./assets/images/index/schedule/article/attachment.png">
                            <span class="caption" data-hy-reference="attachmentCount">${article.attachments.length.toLocaleString()}</span>
                        </span>
                        <span class="-flex-stretch" role="none"></span>
                    </div>
                    <form class="comment-form" data-hy-reference="commentForm">
                        <label data-hy-object="label" data-hy-name="value" data-hy-reference="contentLabel">
                            <span data-hy-component="label.caption">댓글 작성</span>
                            <span data-hy-component="label.row">
                                <input autocomplete="off" class="-flex-stretch" maxlength="200" minlength="1" name="content" placeholder="댓글을 입력해 주세요." type="text" data-hy-object="field" data-hy-component="label.field" data-hy-theme="box">
                                <button name="submit" type="submit" data-hy-object="button" data-hy-color="main" data-hy-border-radius="none">
                                    <span data-hy-component="button.caption">댓글 쓰기</span>
                                </button>
                            </span>
                            <span data-hy-component="label.message">댓글을 입력해 주세요.</span>
                        </label>
                    </form>
                    <ul class="list comments" data-hy-reference="commentList">
                        <li class="message" data-hy-reference="message" data-hy-name="empty">작성된 댓글이 없습니다.</li>
                    </ul>
                    <ul class="list attachments" data-hy-reference="attachmentList">
                        <li class="message" data-hy-reference="message" data-hy-name="empty">첨부 파일이 없습니다.</li>
                    </ul>
                </li>`, 'text/html').querySelector('[data-hy-reference="item"]');
            const $head = $item.querySelector('[data-hy-reference="head"]');
            $head.querySelector('[data-hy-reference="nickname"]').innerText = article.userNickname;
            $head.querySelector('[data-hy-reference="timestamp"]').innerText = article['createdAt'].split('T').join(' ');
            if (article.mine === true) {
                $head.querySelector('[data-hy-reference="uploadAttachment"]').addEventListener('click', (e) => {
                    e.preventDefault();
                    const $input = document.createElement('input');
                    $input.addEventListener('input', () => {
                        if ($input.files == null || $input.files.length === 0) {
                            return;
                        }
                        loading.show();
                        const file = $input.files[0];
                        const xhr = new XMLHttpRequest();
                        const formData = new FormData();
                        formData.append('articleId', article.id.toString());
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
                            switch (response.result) {
                                case 'failure':
                                    dialog.showSimpleOk('경고', '알 수 없는 이유로 첨부 파일을 업로드하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
                                    break;
                                case 'failure_session_expired':
                                    dialog.showSimpleOk('경고', '세션이 만료되었거나 첨부 파일을 업로드할 권한이 없습니다.');
                                    break;
                                case 'success':
                                    article.attachments = null;
                                    this.#drawArticleAttachmentList(article, $attachmentList);
                                    $commentList.hide();
                                    $attachmentList.show();
                                    break;
                                default:
                                    dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
                            }
                        };
                        xhr.open('POST', `${origin}/attachment/`);
                        xhr.send(formData);
                    });
                    $input.setAttribute('type', 'file');
                    $input.click();
                });
                $head.querySelector('[data-hy-reference="modify"]').addEventListener('click', (e) => {
                    e.preventDefault();
                    alert('수정');
                });
                $head.querySelector('[data-hy-reference="delete"]').addEventListener('click', (e) => {
                    e.preventDefault();
                    dialog.showSimpleYesNo('경고', '정말로 선택한 게시글을 삭제할까요? 해당 게시글에 작성된 댓글과 첨부된 파일이 모두 삭제됩니다.', {
                        onClickYesCallback: () => {
                            loading.show();
                            const xhr = new XMLHttpRequest();
                            const formData = new FormData();
                            formData.append('id', article.id.toString());
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
                                        dialog.showSimpleOk('경고', '알 수 없는 이유로 게시글을 삭제하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
                                        break;
                                    case 'failure_session_expired':
                                        dialog.showSimpleOk('경고', '세션이 만료되었거나 게시글을 삭제할 권한이 없습니다.');
                                        break;
                                    case 'success':
                                        schedule.articles = null;
                                        this.#drawArticleList(schedule);
                                        break;
                                    default:
                                        dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
                                }
                            };
                            xhr.open('DELETE', `${origin}/article/`);
                            xhr.send(formData);
                        }
                    });
                });
            }
            $item.querySelector('[data-hy-reference="content"]').innerHTML = article.content;
            const $imageContainer = $item.querySelector('[data-hy-reference="imageContainer"]');
            const $commentForm = $item.querySelector('[data-hy-reference="commentForm"]');
            const $commentList = $item.querySelector('[data-hy-reference="commentList"]');
            const $attachmentList = $item.querySelector('[data-hy-reference="attachmentList"]');
            this.#drawArticleImages(article, $imageContainer);
            this.#drawArticleCommentList(article, $commentList);
            this.#drawArticleAttachmentList(article, $attachmentList);
            $item.querySelector('[data-hy-reference="commentToggle"]').addEventListener('click', (e) => {
                e.preventDefault();
                $commentList.setVisible(!$commentList.isVisible());
                $commentForm.setVisible($commentList.isVisible());
                $attachmentList.setVisible(false);
            });
            $item.querySelector('[data-hy-reference="attachmentToggle"]').addEventListener('click', (e) => {
                e.preventDefault();
                $commentList.setVisible(false);
                $commentForm.setVisible(false);
                $attachmentList.setVisible(!$attachmentList.isVisible());
            });
            $commentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const contentLabel = /** @type {HyLabel} */ new HyLabel({$element: $commentForm.querySelector('[data-hy-reference="contentLabel"]')});
                if (contentLabel.$field.value === '') {
                    contentLabel.setInvalid(true).$message.innerText = '댓글을 입력해 주세요.';
                }
                if (contentLabel.isInvalid()) {
                    return;
                }
                loading.show();
                const xhr = new XMLHttpRequest();
                const formData = new FormData();
                formData.append('articleId', article.id.toString());
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
                            dialog.showSimpleOk('경고', '알 수 없는 이유로 댓글을 작성하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
                            break;
                        case 'failure_session_expired':
                            dialog.showSimpleOk('경고', '세션이 만료되었거나 댓글을 작성할 권한이 없습니다.');
                            break;
                        case 'success':
                            article.comments = null;
                            contentLabel.$field.value = '';
                            contentLabel.$field.focus();
                            this.#drawArticleCommentList(article, $commentList);
                            break;
                        default:
                            dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
                    }
                };
                xhr.open('POST', `${origin}/comment/`);
                xhr.send(formData);
            });
            this.$articleList.append($item);
        }
    }

    /**
     * @param {{[p: string]: any, attachments: {[p: string]: any}[]}} article
     * @param {HTMLElement} $imageContainer */
    #drawArticleImages = (article, $imageContainer) => {
        const imageAttachments = article.attachments.filter((attachment) => attachment.contentType.startsWith('image/'));
        if (imageAttachments.length > 0) {
            for (const attachment of imageAttachments) {
                const $imageWrapper = new DOMParser().parseFromString(`
                    <a class="image-wrapper" href="#" target="_blank" data-hy-reference="imageWrapper">
                        <img alt="" class="image" src="" data-hy-reference="image">
                    </a>`, 'text/html').querySelector('[data-hy-reference="imageWrapper"]');
                $imageWrapper.setAttribute('href', `${origin}/attachment/?id=${attachment.id}`);
                $imageWrapper.querySelector('[data-hy-reference="image"]').setAttribute('src', $imageWrapper.href);
                $imageContainer.append($imageWrapper);
            }
            $imageContainer.show();
        }
    }

    /**
     * @param {{[p: string]: any, comments: {[p: string]: any, id: number, commentId: number, userNickname: string, content: string, createdAt: string, mine: boolean}[]}} article
     * @param $commentList */
    #drawArticleCommentList = (article, $commentList) => {
        const $commentListMessageMap = {};
        $commentList.querySelectorAll('[data-hy-reference="message"]').forEach(($message) => {
            $commentListMessageMap[$message.getAttribute('data-hy-name')] = $message;
        });
        Object.values($commentListMessageMap).forEach(($message) => $message.hide());
        $commentList.querySelectorAll('[data-hy-reference="item"]').forEach(($item) => $item.remove());
        if (article.comments == null) {
            loading.show();
            fetch(`${origin}/comment/all?articleId=${article.id}`, {
                method: 'GET'
            }).then((response) => {
                if (!response.ok) {
                    throw new Error(response.status.toString());
                }
                return response.json();
            }).then((comments) => {
                article.comments = comments;
                this.#drawArticleCommentList(article, $commentList);
            }).catch((error) => {
                console.error(error);
                this.$attachmentListMessageMap['error'].show();
            }).finally(() => loading.hide());
            return;
        }
        if (article.comments.length === 0) {
            $commentListMessageMap['empty'].show();
        } else {
            /**
             * @param {HTMLUListElement} $commentList
             * @param {{[p: string]: any, id: number, commentId: number, userNickname: string, content: string, createdAt: string, mine: boolean}[]} filteredComments
             * @param {{[p: string]: any, id: number, commentId: number, userNickname: string, content: string, createdAt: string, mine: boolean}[]} wholeComments
             * @param {number} step */
            const appendComments = ($commentList, filteredComments, wholeComments, step = 0) => {
                for (const comment of filteredComments) {
                    const $item = new DOMParser().parseFromString(`
                        <li class="item ${comment.commentId == null ? 'root' : 'sub'}" style="margin-left: ${step}rem;" data-hy-reference="item" data-hy-step="${step}">
                            <div class="head">
                                <span class="nickname">${comment.userNickname}</span>
                                <span class="timestamp -flex-stretch">${comment.createdAt.split('T').join(' ')}</span>
                                ${comment.mine === true ? `
                                <a class="action modify-cancel" href="#" data-hy-reference="modifyCancel">취소</a>
                                <a class="action modify-apply" href="#" data-hy-reference="modifyApply">완료</a>
                                <a class="action modify -visible" href="#" data-hy-reference="modify">수정</a>
                                <a class="action delete -visible" href="#" data-hy-reference="delete">삭제</a>` : ''}
                            </div>                                
                            <div class="body content -visible" data-hy-reference="contentBody">${comment.content}</div>
                            ${comment.mine === true ? `
                            <div class="body modify" data-hy-reference="modifyBody">
                                <label data-hy-object="label" data-hy-name="value" data-hy-reference="contentLabel">
                                    <input autocomplete="email" class="-flex-stretch" maxlength="500" minlength="1" name="content" placeholder="수정할 내용을 입력해 주세요." type="text" value="${comment.content}" data-hy-object="field" data-hy-component="label.field">
                                    <span data-hy-component="label.message">수정할 내용을 입력해 주세요.</span>
                                </label>
                            </div>
                            <form novalidate class="reply-form" data-hy-reference="replyForm">
                                <input hidden name="commentId" type="hidden" value="${comment.id}">
                                <label data-hy-object="label" data-hy-name="value" data-hy-reference="contentLabel">
                                    <span data-hy-component="label.caption">답글 작성</span>
                                    <span data-hy-component="label.row">
                                        <input autocomplete="off" class="-flex-stretch" maxlength="200" minlength="1" name="content" placeholder="답글을 입력해 주세요." type="text" data-hy-object="field" data-hy-component="label.field" data-hy-theme="box">
                                        <button name="submit" type="submit" data-hy-object="button" data-hy-color="main" data-hy-border-radius="none">
                                            <span data-hy-component="button.caption">답글 쓰기</span>
                                        </button>
                                    </span>
                                    <span data-hy-component="label.message">답글을 입력해 주세요.</span>
                                </label>
                            </form>` : ''}
                        </li>`, 'text/html').querySelector('[data-hy-reference="item"]');
                    if (comment.mine === true) {
                        const $contentBody = $item.querySelector('[data-hy-reference="contentBody"]');
                        const $replyForm = $item.querySelector('[data-hy-reference="replyForm"]');
                        const $modifyBody = $item.querySelector('[data-hy-reference="modifyBody"]');
                        const $modify = $item.querySelector('[data-hy-reference="modify"]');
                        const $modifyCancel = $item.querySelector('[data-hy-reference="modifyCancel"]');
                        const $modifyApply = $item.querySelector('[data-hy-reference="modifyApply"]');
                        const $delete = $item.querySelector('[data-hy-reference="delete"]');
                        $contentBody.addEventListener('click', (e) => {
                            e.preventDefault();
                            if ($replyForm.isVisible()) {
                                $replyForm.hide();
                            } else {
                                const contentLabel = new HyLabel({$element: $replyForm.querySelector('[data-hy-reference="contentLabel"]')});
                                $replyForm.show();
                                contentLabel.setInvalid(false);
                                contentLabel.$field.value = '';
                                contentLabel.$field.focus();
                            }
                        });
                        $replyForm.addEventListener('submit', (e) => {
                            e.preventDefault();
                            const contentLabel = new HyLabel({$element: $replyForm.querySelector('[data-hy-reference="contentLabel"]')});
                            contentLabel.setInvalid(false);
                            if (contentLabel.$field.value === '') {
                                contentLabel.setInvalid(true).$message.innerText = '답글 내용을 입력해 주세요.';;
                            }
                            if (contentLabel.isInvalid()) {
                                return;
                            }
                            loading.show();
                            const xhr = new XMLHttpRequest();
                            const formData = new FormData();
                            formData.append('articleId', article.id);
                            formData.append('content', contentLabel.$field.value);
                            formData.append('commentId', $replyForm['commentId'].value);
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
                                        dialog.showSimpleOk('경고', '알 수 없는 이유로 답글을 작성하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
                                        break;
                                    case 'failure_session_expired':
                                        dialog.showSimpleOk('경고', '세션이 만료되었거나 답글을 작성할 권한이 없습니다.');
                                        break;
                                    case 'success':
                                        article.comments = null;
                                        this.#drawArticleCommentList(article, $commentList);
                                        break;
                                    default:
                                        dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
                                }
                            };
                            xhr.open('POST', `${origin}/comment/`);
                            xhr.send(formData);
                        });
                        $modify.addEventListener('click', (e) => {
                            e.preventDefault();
                            $contentBody.hide();
                            $modifyBody.show();
                            $modifyCancel.show();
                            $modifyApply.show();
                            $modify.hide();
                            $delete.hide();
                        });
                        $modifyCancel.addEventListener('click', (e) => {
                            e.preventDefault();
                            $contentBody.show();
                            $modifyBody.hide();
                            $modifyCancel.hide();
                            $modifyApply.hide();
                            $modify.show();
                            $delete.show();
                        });
                        $modifyApply.addEventListener('click', (e) => {
                            e.preventDefault();
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
                            formData.append('id', comment.id.toString());
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
                                        comment.content = contentLabel.$field.value;
                                        $contentBody.innerText = comment.content;
                                        $modifyCancel.dispatchEvent(new Event('click'));
                                        break;
                                    default:
                                        dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
                                }
                            };
                            xhr.open('PATCH', `${origin}/comment/`);
                            xhr.send(formData);
                        });
                        $delete.addEventListener('click', (e) => {
                            e.preventDefault();
                            dialog.showSimpleYesNo('경고', '정말로 선택한 댓글을 삭제할까요?', {
                                onClickYesCallback: () => {
                                    loading.show();
                                    const xhr = new XMLHttpRequest();
                                    const formData = new FormData();
                                    formData.append('id', comment.id.toString());
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
                                                article.comments = null;
                                                this.#drawArticleCommentList(article, $commentList);
                                                break;
                                            default:
                                                dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
                                        }
                                    };
                                    xhr.open('DELETE', `${origin}/comment/`);
                                    xhr.send(formData);
                                }
                            });
                        });
                    }
                    $commentList.append($item);
                    const subComments = wholeComments.filter((x) => comment.id === x.commentId);
                    if (subComments.length > 0) {
                        appendComments($commentList, subComments, wholeComments, step + 1);
                    }
                }
            };
            appendComments($commentList, article.comments.filter((comment) => comment.commentId == null), article.comments);
        }
    }

    /**
     * @param {{[p: string]: any, id: number, mine: boolean, attachments: {[p: string]: any, id: number, name: string, size: number}[]}} article
     * @param {HTMLUListElement} $attachmentList */
    #drawArticleAttachmentList = (article, $attachmentList) => {
        const $attachmentListMessageMap = {};
        $attachmentList.querySelectorAll('[data-hy-reference="message"]').forEach(($message) => {
            $attachmentListMessageMap[$message.getAttribute('data-hy-name')] = $message;
        });
        Object.values($attachmentListMessageMap).forEach(($message) => $message.hide());
        $attachmentList.querySelectorAll('[data-hy-reference="item"]').forEach(($item) => $item.remove());
        if (article.attachments == null) {
            loading.show();
            fetch(`${origin}/attachment/all?articleId=${article.id}`, {
                method: 'GET'
            }).then((response) => {
                if (!response.ok) {
                    throw new Error(response.status.toString());
                }
                return response.json();
            }).then((attachments) => {
                article.attachments = attachments;
                this.#drawArticleAttachmentList(article, $attachmentList);
            }).catch((error) => {
                console.error(error);
                this.$attachmentListMessageMap['error'].show();
            }).finally(() => loading.hide());
            return;
        }
        if (article.attachments.length === 0) {
            $attachmentListMessageMap['empty'].show();
        } else {
            for (const attachment of article.attachments) {
                const $item = new DOMParser().parseFromString(`
                    <li class="item" data-hy-reference="item">
                        <a class="name" href="${origin}/attachment/?id=${attachment.id}" target="_blank" data-hy-reference="anchor">${attachment.name}</a>
                        <span class="size">${ScheduleViewHandler.formatFileSize(attachment.size)}</span>
                        <span class="-flex-stretch"></span>
                        ${article.mine === true ? '<a class="action" href="#" data-hy-reference="deleteAnchor">삭제</a>' : ''}
                    </li>`, 'text/html').querySelector('[data-hy-reference="item"]');
                $item.querySelector('[data-hy-reference="deleteAnchor"]').addEventListener('click', (e) => {
                    e.preventDefault();
                    dialog.showSimpleYesNo('경고', `정말로 선택한 첨부 파일(${attachment.name})을 삭제할까요?`, {
                        onClickYesCallback: () => {
                            loading.show();
                            const xhr = new XMLHttpRequest();
                            const formData = new FormData();
                            formData.append('id', attachment.id.toString());
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
                                        dialog.showSimpleOk('경고', '알 수 없는 이유로 첨부 파일을 삭제하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
                                        break;
                                    case 'failure_session_expired':
                                        dialog.showSimpleOk('경고', '세션이 만료되었거나 해당 첨부 파일을 삭제할 권한이 없습니다.');
                                        break;
                                    case 'success':
                                        dialog.showSimpleOk('알림', '첨부 파일을 성공적으로 삭제하였습니다.', {
                                            onClickOkCallback: () => {
                                                article.attachments = null;
                                                this.#drawArticleAttachmentList(article, $attachmentList);
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
                });
                $attachmentList.append($item);
            }
        }
    }

    /** @param {{[p: string]: any, scheduleId: number}} args */
    show = (args) => {
        loading.show();
        fetch(`${origin}/schedule/?id=${args.scheduleId}`, {
            method: 'GET'
        }).then((response) => {
            if (!response.ok) {
                throw new Error(response.status.toString());
            }
            return response.json();
        }).then(/** @param {{[p: string]: any, id: number, title: string, startAt: string, endAt: string, addressPrimary?: string, addressSecondary?: string, latitude?: number, longitude?: number, mine: boolean, attachments?: {id: number, name: string, size: number}[]}} schedule */(schedule) => {
            this.lastSchedule = schedule;
            this.#drawTitle(schedule);
            this.#drawLocation(schedule);
            this.#drawAttachmentList(schedule);
            this.#drawArticleList(schedule);
            this.$element.show();
        }).catch((error) => {
            console.error(error);
            dialog.showSimpleOk('오류', `스케줄 정보를 불러오지 못하였습니다. 잠시 후 다시 시도해 주세요.`, {
                onClickOkCallback: () => {
                    this.$element.hide();
                }
            });
        }).finally(() => loading.hide());
    }
}

window.scheduleViewHandler = new ScheduleViewHandler({
    $side: document.getElementById('side')
});