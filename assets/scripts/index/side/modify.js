import {HyLabel} from "../../common/object/label.js";

class ScheduleModifyHandler {
    /** @type {HTMLFormElement} */ $element;
    /** @type {{[p: string]: HTMLLabelElement}} */ $labelMap;
    /** @type {HTMLUListElement} */ $locationList;
    /** @type {HTMLElement} */ $map;
    mapInstance;
    mapMarker;
    lastSchedule;

    /** @param {{$element: HTMLFormElement}} args */
    constructor(args) {
        this.$element = args.$element;
        this.$labelMap = {};
        this.$element.querySelectorAll('[data-hy-object="label"], [data-hy-object="checkLabel"]').forEach(($label) => {
            const name = $label.getAttribute('data-hy-name');
            this.$labelMap[name] = $label;
        });
        this.$locationList = this.$element.querySelector('[data-hy-reference="locationList"]');
        this.$map = this.$element.querySelector('[data-hy-reference="map"]');

        this.$element['allDay'].addEventListener('input', this.#_allDayOnInput);
        this.$element['startAt'].addEventListener('input', this.#_startAtOnInput);
        this.$element['locationKeyword'].addEventListener('keydown', this.#_locationKeywordOnKeydown);
        this.$element['locationSearchButton'].addEventListener('click', this.#_locationSearchButtonOnClick);
        this.$element['locationRemoveButton'].addEventListener('click', this.#_locationRemoveButtonOnClick);
        this.$element['cancel'].addEventListener('click', this.#_cancelOnClick);
        this.$element.addEventListener('submit', this.#_onSubmit);

        sideHandler.actionCallbackMap['close'].push(() => {
            if (!this.$element.isVisible()) {
                return;
            }
            sideHandler.hideAllActions();
            scheduleViewHandler.show({scheduleId: this.lastSchedule.id});
        });
    }

    #_allDayOnInput = () => {
        if (this.$element['allDay'].checked === true) {
            this.$element['endAt'].setAttribute('disabled', '');
            this.$element['startAt'].dispatchEvent(new Event('input'));
        } else {
            this.$element['endAt'].removeAttribute('disabled');
        }
    }

    #_startAtOnInput = () => {
        if (this.$element['allDay'].checked === true && this.$element['startAt'].value !== '') {
            /** @type {Date} */
            const startAt = new Date(this.$element['startAt'].value);
            this.$element['startAt'].value = startAt.toFormattedDate() + 'T00:00:00';
            this.$element['endAt'].value = startAt.toFormattedDate() + 'T23:59:59';
        }
    }

    #_locationKeywordOnKeydown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.$element['locationSearchButton'].dispatchEvent(new Event('click'));
        }
    }

    #_locationSearchButtonOnClick = async () => {
        const $locationLabel = this.$labelMap['location'];
        const locationLabel = new HyLabel({$element: $locationLabel});
        locationLabel.setInvalid(false).$message.innerText = '';
        if (this.$element['locationKeyword'].value === '') {
            locationLabel.setInvalid(true).$message.innerText = '검색할 장소를 입력해 주세요.';
        }
        if (locationLabel.isInvalid() === true) {
            return;
        }
        const {Place} = await google.maps.importLibrary('places');
        const request = {
            textQuery: this.$element['locationKeyword'].value,
            fields: ['displayName', 'location', 'addressComponents'],
            isOpenNow: true,
            language: 'ko-KR',
            maxResultCount: 10,
            useStrictTypeFiltering: false
        };
        loading.show();
        const {places} = await Place.searchByText(request);
        const $locationList = this.$locationList;
        const $emptyMessage = $locationList.querySelector('[data-hy-reference="message"][data-hy-name="empty"]');
        this.$labelMap['address'].hide();
        this.$map.hide();
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
                    if (this.mapMarker != null) {
                        this.mapMarker.position = null;
                        this.mapMarker = null;
                    }
                    const {AdvancedMarkerElement} = await google.maps.importLibrary("marker");
                    const map = this.mapInstance;
                    place['_marker'] = new AdvancedMarkerElement({
                        map,
                        position: place['location'],
                        title: place['displayName'],
                    });
                    $item.classList.add('-selected');
                    this.$element['addressPrimary'].value = address;
                    this.$element['latitude'].value = place['location']['lat']();
                    this.$element['longitude'].value = place['location']['lng']();
                    $locationList.show();
                    this.$labelMap['address'].show();
                    this.$map.show();
                    this.mapInstance.setCenter(place['location']);
                });
                $locationList.append($item);
            }
            $firstItem?.dispatchEvent(new Event('click'));
        }
        loading.hide();
    }

    #_locationRemoveButtonOnClick = () => {
        this.$element['locationKeyword'].value = '';
        this.$element['addressPrimary'].value = '';
        this.$element['addressSecondary'].value = '';
        this.$element['latitude'].value = '';
        this.$element['longitude'].value = '';
        this.$locationList.hide();
        this.$map.hide();
        this.$labelMap['address'].hide();
    }

    #_cancelOnClick = () => {
        sideHandler.$actionMap['close'].dispatchEvent(new Event('click'));
    }

    #_onSubmit = (e) => {
        e.preventDefault();
        const $form = this.$element;
        /** @type {{[p: string]: HyLabel}} */
        const hyLabelMap = {};
        Object.keys(this.$labelMap).forEach((name) => hyLabelMap[name] = new HyLabel({$element: this.$labelMap[name]}));
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
        formData.append('id', this.lastSchedule.id);
        if ($form['group'].value !== '0') {
            formData.append('groupId', $form['group'].value);
        }
        formData.append('title', $form['title'].value);
        formData.append('startAt', $form['startAt'].value);
        formData.append('endAt', $form['endAt'].value);
        if (this.$map.isVisible() === true) {
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
                    dialog.showSimpleOk('경고', '알 수 없는 이유로 스케줄을 수정하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
                    break;
                case 'failure_session_expired':
                    dialog.showSimpleOk('경고', '세션이 만료되었거나 해당 그룹에 스케줄을 수정할 권한이 없습니다.');
                    break;
                case 'success':
                    this.$element.hide();
                    scheduleViewHandler.show({
                        scheduleId: this.lastSchedule.id
                    });
                    drawCalendar();
                    break;
                default:
                    dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
            }
        };
        xhr.open('PATCH', `${origin}/schedule/`);
        xhr.send(formData);
    }

    /** @param {{[p: string]: any, schedule: {[p: string]: any, id: number, userEmail: string, groupId: number, title: string, startAt: string, endAt: string, addressPrimary: string, addressSecondary: string, latitude: number, longitude: number}}} args */
    show = (args) => {
        sideHandler.$title.innerText = '스케줄 수정';
        sideHandler.hideAllActions();
        sideHandler.$actionMap['close'].show();
        loading.show();
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = async () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            loading.hide();
            if (xhr.status < 200 || xhr.status >= 300) {
                dialog.showSimpleOk('오류', '요청을 처리하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
                return;
            }
            this.lastSchedule = args.schedule;
            if (this.mapInstance == null) {
                const {Map} = await google.maps.importLibrary('maps');
                this.mapInstance = new Map(this.$map, {
                    zoom: 16,
                    mapId: 'modifyMap',
                });
            }
            const groups = JSON.parse(xhr.responseText);
            this.$element.reset();
            this.$element['group'].querySelectorAll('option:not([value="0"])').forEach(($option) => $option.remove());
            this.$element['group'].append(...groups.map((group) => {
                const $option = document.createElement('option');
                $option.setAttribute('value', group['groupId']);
                $option.innerText = group['groupName'];
                return $option;
            }));
            this.$element['group'].value = args.schedule.groupId ?? '0';
            this.$element['endAt'].removeAttribute('disabled');
            this.$element['allDay'].checked = false;
            this.$element['startAt'].value = args.schedule.startAt;
            this.$element['endAt'].value = args.schedule.endAt;
            this.$element['allDay'].checked =
                    args.schedule.startAt.substring(0, 10) === args.schedule.endAt.substring(0, 10) &&
                    args.schedule.startAt.endsWith('00:00:00') &&
                    args.schedule.endAt.endsWith('23:59:59');
            this.$element['title'].value = args.schedule.title;
            if (this.mapMarker != null) {
                this.mapMarker.position = null;
                this.mapMarker = null;
            }
            if (args.schedule.latitude != null && args.schedule.longitude != null) {
                this.$element['addressPrimary'].value = args.schedule.addressPrimary;
                this.$element['addressSecondary'].value = args.schedule.addressSecondary;
                this.$element['longitude'].value = args.schedule.longitude;
                this.$element['latitude'].value = args.schedule.latitude;
                this.$labelMap['address'].show();
                this.$map.show();

                const {AdvancedMarkerElement} = await google.maps.importLibrary("marker");
                this.mapInstance.setCenter({lat: args.schedule.latitude, lng: args.schedule.longitude});
                this.mapMarker = new AdvancedMarkerElement({
                    map: this.mapInstance,
                    position: {lat: args.schedule.latitude, lng: args.schedule.longitude},
                });
            } else {
                this.$labelMap['address'].hide();
                this.$map.hide();
            }
            sideHandler.hideAllBodies();
            this.$element.show();
        };
        xhr.open('GET', `${origin}/group/active`);
        xhr.send();
    }
}

window.scheduleModifyHandler = new ScheduleModifyHandler({
    $element: sideHandler.$bodyMap['modify']
});