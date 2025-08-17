/** @type {HTMLElement} */
const $main = document.getElementById('main');
/** @type {HTMLFormElement} */
const $navForm = $main.querySelector('[data-hy-reference="navForm"]');
/** @type {HTMLElement} */
const $calendar = $main.querySelector('[data-hy-reference="calendar"]');
/** @type {HTMLElement} */
const $cellContainer = $calendar.querySelector('[data-hy-reference="cellContainer"]');
/** @type {HTMLElement[]} */
const $cachedSchedules = [];
let lastYear;
let lastMonth;
/**
 * @param {number|undefined} targetYear
 * @param {number|undefined} targetMonth */
const draw = (targetYear, targetMonth) => {
    targetYear ??= lastYear;
    targetMonth ??= lastMonth;
    const loadGroups = () => new Promise((resolve, reject) => fetch(`${origin}/group/active`, {
        method: 'GET'
    }).then((response) => {
        if (!response.ok) {
            reject?.();
        }
        return response.json();
    }).then((groups) => {
        resolve?.(groups);
    }).catch((error) => {
        console.error(error);
        reject?.();
    }));
    const loadSchedules = (from, to) => new Promise((resolve, reject) => fetch(`${origin}/schedule/query?from=${from}&to=${to}`, {
        method: 'GET'
    }).then((response) => {
        if (!response.ok) {
            reject?.();
        }
        return response.json();
    }).then((schedules) => {
        resolve?.(schedules);
    }).catch((error) => {
        console.error(error);
        reject?.();
    }));
    const currentMonthFirstDate = new Date(targetYear, targetMonth - 1, 1);
    const currentMonthLastDate = new Date(targetYear, targetMonth, 0);
    const lastMonthLastDate = new Date(targetYear, targetMonth - 1, 0);
    loading.show();
    $cellContainer.innerHTML = '';
    $cachedSchedules.splice(0, $cachedSchedules.length);
    Promise.all([loadGroups(), loadSchedules(currentMonthFirstDate.toFormattedDate() + 'T00:00:00', currentMonthLastDate.toFormattedDate() + 'T23:59:59')]).then(([groups, schedules]) => {
        const $days = [];
        const groupMap = groups.reduce((map, group) => (map[group['groupId']] = group, map), {});
        schedules.forEach((schedule) => {
            schedule['startAtInstance'] = new Date(schedule['startAt']);
            schedule['endAtInstance'] = new Date(schedule['endAt']);
            schedule['periodInDays'] = Math.ceil((schedule['endAtInstance'].getTime() - schedule['startAtInstance'].getTime()) / 86400000);
        });
        schedules = schedules.sort((a, b) => a['startAtInstance'].getTime() - b['startAtInstance'].getTime());
        for (let week = 0; week < 6; week++) {
            const $week = document.createElement('div');
            $week.classList.add('week', '-visible');
            $week.setAttribute('data-hy-reference', 'week');
            for (let day = 0; day < 7; day++) {
                const $day = new DOMParser().parseFromString(`
                    <div class="day" data-hy-reference="day" data-hy-value-year="${targetYear}" data-hy-value-month="${targetMonth}">
                        <button class="more-button" type="button" data-hy-reference="moreButton">
                            <img class="icon" alt="..." draggable="false" src="./assets/images/index/main/schedule/more.png">
                        </button>
                        <span class="head">
                            <span class="date" data-hy-reference="date"></span>
                            <span class="count" data-hy-reference="count"></span>
                        </span>
                        <div class="schedule-container" data-hy-reference="scheduleContainer">
                            <div class="gap"></div>
                            <div class="gap"></div>
                            <div class="gap"></div>
                            <div class="gap"></div>
                            <div class="gap"></div>
                            <div class="gap"></div>
                            <div class="gap"></div>
                            <div class="gap"></div>
                            <div class="gap"></div>
                            <div class="gap"></div>
                        </div>
                    </div>`, 'text/html').querySelector('[data-hy-reference="day"]');
                let date = week * 7 + (day + 1) - currentMonthFirstDate.getDay();
                if (date <= 0) {
                    date += lastMonthLastDate.getDate();
                    $day.classList.add('previous-month');
                } else if (date > currentMonthLastDate.getDate()) {
                    date -= currentMonthLastDate.getDate();
                    $day.classList.add('next-month');
                }
                $day.setAttribute('data-hy-value-day', date.toString());
                $day.querySelector('[data-hy-reference="date"]').innerText = date.toString();
                if (!$day.classList.contains('previous-month') && !$day.classList.contains('next-month')) {
                    $day.addEventListener('click', (e) => {
                        if (e.target.getAttribute('data-hy-reference') !== 'schedule') {
                            scheduleAddHandler.show({
                                initDate: `${targetYear}-${targetMonth.toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`
                            });
                        }
                    });
                }
                $days.push($day);
                $week.append($day);
            }
            $cellContainer.append($week);
        }
        schedules.forEach((schedule) => {
            const dayIndex = $days.findIndex(($day) =>
                    !$day.classList.contains('previous-month') &&
                    !$day.classList.contains('next-month') &&
                    parseInt($day.getAttribute('data-hy-value-year')) === schedule['startAtInstance'].getFullYear() &&
                    parseInt($day.getAttribute('data-hy-value-month')) === schedule['startAtInstance'].getMonth() + 1 &&
                    parseInt($day.getAttribute('data-hy-value-day')) === schedule['startAtInstance'].getDate());
            const $daysFragment = $days.slice(dayIndex, dayIndex + schedule['periodInDays']);
            const availableIndexes = $daysFragment.map(($day) => {
                const $scheduleContainer = $day.querySelector('[data-hy-reference="scheduleContainer"]');
                const $children = Array.from($scheduleContainer.children);
                return $children.map(($child, index) => $child.classList.contains('gap') ? index : null);
            });
            const index = availableIndexes[0]?.filter(value => availableIndexes.every(arr => arr.includes(value))).sort((a, b) => a - b).filter((x) => x != null)[0] ?? 0;
            for (let i = 0; i < schedule['periodInDays']; i++) {
                const $day = $days[dayIndex + i];
                const $scheduleContainer = $day.querySelector('[data-hy-reference="scheduleContainer"]');
                const $children = Array.from($scheduleContainer.children);
                const $schedule = document.createElement('div');
                $schedule.classList.add('schedule');
                if (asideHandler.$groupCheckMap[schedule['groupId'] ?? '0'].checked === true) {
                    $schedule.classList.add('-visible');
                }
                $schedule.style.backgroundColor = groupMap[schedule['groupId']] == null ? '#a47764' : ('#' + groupMap[schedule['groupId']]['backgroundColor']);
                $schedule.style.color = groupMap[schedule['groupId']] == null ? '#ffffff' : ('#' + groupMap[schedule['groupId']]['color']);
                $schedule.setAttribute('data-hy-reference', 'schedule');
                $schedule.setAttribute('data-hy-id', schedule['id']);
                $schedule.setAttribute('data-hy-group-id', schedule['groupId'] ?? '0');
                if (i === 0) {
                    $schedule.classList.add('starter');
                    $schedule.innerText = schedule['title'];
                }
                if (i === schedule['periodInDays'] - 1) {
                    $schedule.classList.add('ender');
                }
                $scheduleContainer.insertBefore($schedule, $children[index].nextSibling);
                $children[index].remove();
                $cachedSchedules.push($schedule);
                $schedule.addEventListener('click', () => {
                    scheduleViewHandler.show({scheduleId: schedule['id']});
                });
                $schedule.addEventListener('mouseover', () => {
                    $cachedSchedules.filter(($cachedSchedule) => $schedule.getAttribute('data-hy-id') === $cachedSchedule.getAttribute('data-hy-id')).forEach(($schedule) => {
                        $schedule.style.filter = 'brightness(90%)';
                    });
                });
                $schedule.addEventListener('mouseleave', () => {
                    $cachedSchedules.filter(($cachedSchedule) => $schedule.getAttribute('data-hy-id') === $cachedSchedule.getAttribute('data-hy-id')).forEach(($schedule) => {
                        $schedule.style.filter = '';
                    });
                });
            }
        });
        lastYear = targetYear;
        lastMonth = targetMonth;
        $navForm.querySelector('[data-hy-reference="year"]').innerText = lastYear;
        $navForm.querySelector('[data-hy-reference="month"]').innerText = lastMonth.toString().padStart(2, '0');
    }).catch((error) => {
        console.error(error);
    }).finally(() => loading.hide());
};

window.drawCalendar = draw;

$navForm.querySelector('[data-hy-reference="prevButton"]').addEventListener('click', () => {
    const date = new Date(lastYear, lastMonth - 2);
    draw(date.getFullYear(), date.getMonth() + 1);
});
$navForm.querySelector('[data-hy-reference="nextButton"]').addEventListener('click', () => {
    const date = new Date(lastYear, lastMonth);
    draw(date.getFullYear(), date.getMonth() + 1);
});

const currentDate = new Date();
draw(currentDate.getFullYear(), currentDate.getMonth() + 1);