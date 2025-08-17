class SideDefaultHandler {
    /** @type {HTMLElement} */ $element;
    /** @type {HTMLElement} */ $currentWeather;
    /** @type {HTMLImageElement} */ $currentIcon;
    /** @type {HTMLElement} */ $currentTemperature;
    /** @type {HTMLElement} */ $currentTemperatureMin;
    /** @type {HTMLElement} */ $currentTemperatureMax;
    /** @type {HTMLElement} */ $currentTemperatureBar;
    /** @type {HTMLElement} */ $currentCaption;
    /** @type {HTMLElement} */ $currentWind;
    /** @type {HTMLElement} */ $currentHumidity;
    /** @type {HTMLElement} */ $todayWeather;
    /** @type {HTMLElement} */ $dailyWeather;

    /** @param {{$element: HTMLElement}} args */
    constructor(args) {
        this.$element = args.$element;
        this.$currentWeather = this.$element.querySelector('[data-hy-reference="currentWeather"]');
        this.$currentIcon = this.$currentWeather.querySelector('[data-hy-reference="currentIcon"]');
        this.$currentTemperature = this.$currentWeather.querySelector('[data-hy-reference="currentTemperature"]');
        this.$currentTemperatureMin = this.$currentWeather.querySelector('[data-hy-reference="currentTemperatureMin"]');
        this.$currentTemperatureMax = this.$currentWeather.querySelector('[data-hy-reference="currentTemperatureMax"]');
        this.$currentTemperatureBar = this.$currentWeather.querySelector('[data-hy-reference="currentTemperatureBar"]');
        this.$currentCaption = this.$currentWeather.querySelector('[data-hy-reference="currentCaption"]');
        this.$currentWind = this.$currentWeather.querySelector('[data-hy-reference="currentWind"]');
        this.$currentHumidity = this.$currentWeather.querySelector('[data-hy-reference="currentHumidity"]');
        this.$todayWeather = this.$element.querySelector('[data-hy-reference="todayWeather"]');
        this.$dailyWeather = this.$element.querySelector('[data-hy-reference="dailyWeather"]');

        new PerfectScrollbar(this.$element.querySelector('[data-hy-reference="todayWeather"]'));
    }

    #loadCurrentWeather = (latitude, longitude) => new Promise((resolve, reject) => fetch(`${origin}/weather/?latitude=${latitude}&longitude=${longitude}`, {method: 'GET'}).then((response) => {
        if (!response.ok) {
            throw new Error();
        }
        if (typeof resolve === 'function') {
            resolve(response.json());
        }
    }).catch(() => {
        if (typeof reject === 'function') {
            reject();
        }
    }));

    #loadHourlyWeather = (latitude, longitude) => new Promise((resolve, reject) => fetch(`${origin}/weather/hourly?latitude=${latitude}&longitude=${longitude}`, {method: 'GET'}).then((response) => {
        if (!response.ok) {
            throw new Error();
        }
        if (typeof resolve === 'function') {
            resolve(response.json());
        }
    }).catch(() => {
        if (typeof reject === 'function') {
            reject();
        }
    }));

    #loadDailyWeather = (latitude, longitude) => new Promise((resolve, reject) => fetch(`${origin}/weather/daily?latitude=${latitude}&longitude=${longitude}`, {method: 'GET'}).then((response) => {
        if (!response.ok) {
            throw new Error();
        }
        if (typeof resolve === 'function') {
            resolve(response.json());
        }
    }).catch(() => {
        if (typeof reject === 'function') {
            reject();
        }
    }));

    /**
     * @param {string} weatherCode
     * @return {[string, string]} */
    #getWeatherIconAndCaption = (weatherCode) => {
        const [icon, caption] = {
            '0': ['clear-day', '맑음'],
            '1': ['clear-day', '맑음'],
            '2': ['partly-cloudy-day', '구름 약간'],
            '3': ['cloudy', '구름'],
            '45': ['partly-cloudy-day-fog', '안개'],
            '48': ['fog', '안개'],
            '51': ['partly-cloudy-day-drizzle', '약한 이슬비'],
            '53': ['drizzle', '이슬비'],
            '55': ['drizzle', '많은 이슬비'],
            '56': ['partly-cloudy-day-snow', '약한 서리'],
            '57': ['partly-cloudy-day-snow', '서리'],
            '61': ['partly-cloudy-day-drizzle', '가벼운 비'],
            '63': ['rain', '비'],
            '65': ['thunderstorms-rain', '번개 및 많은 비'],
            '71': ['partly-cloudy-day-snow', '가벼운 눈'],
            '73': ['snow', '눈'],
            '75': ['snow', '많은 눈'],
            '77': ['snow', '눈'],
            '80': ['raindrop', '약한 소나기'],
            '81': ['raindrops', '소나기'],
            '82': ['raindrops', '강한 소나기'],
            '85': ['snowflake', '소낙눈'],
            '86': ['snowflake', '소낙눈'],
        }[weatherCode] || ['barometer', '알 수 없음'];
        return [icon, caption];
    }

    /** @param {{latitude?: number, longitude?: number}?} args */
    loadWeather(args = undefined) {
        if (args == null || args.latitude == null || args.longitude == null) {
            navigator.geolocation.getCurrentPosition((position) => {
                this.loadWeather({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            }, () => {
                let latitude = 35.8703;
                let longitude = 128.591;
                fetch('http://ip-api.com/json/', {
                    method: 'GET'
                }).then((response) => {
                    if (response.ok) {
                        const responseObject = response.json();
                        if (responseObject['status'] === 'success') {
                            latitude = responseObject['lat'];
                            longitude = responseObject['lon'];
                        }
                    }
                }).catch(() => {
                    latitude = 35.8703;
                    longitude = 128.591;
                }).finally(() => {
                    this.loadWeather({
                        latitude: latitude,
                        longitude: longitude
                    });
                });
            });
            return;
        }
        Promise.all([this.#loadCurrentWeather(args.latitude, args.longitude), this.#loadHourlyWeather(args.latitude, args.longitude), this.#loadDailyWeather(args.latitude, args.longitude)]).then(([currentWeather, hourlyWeathers, dailyWeathers]) => {
            let barLeft = (currentWeather['temperatureMax'] - dailyWeathers[0]['temperatureMin']) / (dailyWeathers[0]['temperatureMax'] - dailyWeathers[0]['temperatureMin']) * 100;
            barLeft = Math.max(0, barLeft);
            barLeft = Math.min(100, barLeft);
            const [currentIcon, currentCaption] = this.#getWeatherIconAndCaption(currentWeather['weatherCode']);
            this.$currentTemperature.innerText = currentWeather['temperatureMax'];
            this.$currentIcon.src = `./assets/images/index/side/default/current-weather/${currentIcon}.svg`;
            this.$currentCaption.innerText = currentCaption;
            this.$currentTemperatureMin.innerText = dailyWeathers[0]['temperatureMin'];
            this.$currentTemperatureMax.innerText = dailyWeathers[0]['temperatureMax'];
            this.$currentTemperatureBar.style.left = `${barLeft}%`;
            this.$currentWind.innerText = currentWeather['windSpeed'];
            this.$currentHumidity.innerText = currentWeather['humidity'];
            return [hourlyWeathers, dailyWeathers];
        }).then(([hourlyWeathers, dailyWeathers]) => {
            const currentTime = new Date();
            currentTime.setHours(currentTime.getHours() - 1);
            hourlyWeathers = hourlyWeathers.filter((weather) => {
                return new Date(weather['timestamp']) >= currentTime;
            });
            this.$todayWeather.querySelectorAll('[data-hy-reference="item"]').forEach(($item) => $item.remove());
            hourlyWeathers.forEach((weather, index) => {
                const [icon, _] = this.#getWeatherIconAndCaption(weather['weatherCode']);
                const time = index === 0 ? '지금' : weather['timestamp'].split('T')[1].substring(0, 2) + '시';
                // noinspection HtmlUnknownTarget
                const $item = new DOMParser().parseFromString(`
                    <div class="item" data-hy-reference="item">
                        <span class="time">${time}</span>
                        <img alt="" class="icon" src="./assets/images/index/side/default/current-weather/${icon}.svg">
                        <span class="temperature">${weather['temperatureMax']}</span>
                        <span class="collapsing humidity">
                            ${index === 0 ? '<img alt="" class="icon" src="./assets/images/index/side/default/today-weather.humidity.png">' : ''}
                            ${weather['humidity']}
                        </span>
                        <span class="collapsing wind">
                            ${index === 0 ? '<img alt="" class="icon" src="./assets/images/index/side/default/today-weather.wind.png">' : ''}
                            ${weather['windSpeed']}
                        </span>
                        <span class="collapsing rain">
                            ${index === 0 ? '<img alt="" class="icon" src="./assets/images/index/side/default/today-weather.rain.png">' : ''}
                            ${weather['rain']}
                        </span>
                        <span class="collapsing snowfall">
                            ${index === 0 ? '<img alt="" class="icon" src="./assets/images/index/side/default/today-weather.snowfall.png">' : ''}
                            ${weather['snowfall']}
                        </span>
                    </div>`, 'text/html').querySelector('[data-hy-reference="item"]');
                this.$todayWeather.append($item);
            });
            return dailyWeathers;
        }).then((dailyWeathers) => {
            const today = new Date();
            const dates = ['일', '월', '화', '수', '목', '금', '토'];
            this.$dailyWeather.querySelectorAll('[data-hy-reference="item"]').forEach(($item) => $item.remove());
            dailyWeathers.forEach((weather, index) => {
                const [icon, caption] = this.#getWeatherIconAndCaption(weather['weatherCode']);
                const $item = new DOMParser().parseFromString(`
                    <div class="item" data-hy-reference="item">
                        <span class="date">${index === 0 ? '오늘' : dates[(today.getDay() + index) % 7]}</span>
                        <img alt="" class="icon" src="./assets/images/index/side/default/current-weather/${icon}.svg" title="${caption}">
                        <span class="-flex-stretch" role="none"></span>
                        <span class="temperature min">${weather['temperatureMin']}</span>
                        <span class="temperature max">${weather['temperatureMax']}</span>
                    </div>
                `, 'text/html').querySelector('[data-hy-reference="item"]');
                this.$dailyWeather.append($item);
            });
        });
    }
}

//  navigator.geolocation.getCurrentPosition((position) => {
//   doSomething(position.coords.latitude, position.coords.longitude);
// });

window.sideDefaultHandler = new SideDefaultHandler({
    $element: sideHandler.$bodyMap['default']
});

sideDefaultHandler.loadWeather();