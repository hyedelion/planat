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
 * @param {number} targetYear
 * @param {number} targetMonth */
const draw = (targetYear, targetMonth) => {
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
            const index = availableIndexes[0].filter(value => availableIndexes.every(arr => arr.includes(value))).sort((a, b) => a - b).filter((x) => x != null)[0] ?? null;
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

// const $navForm = $main.querySelector('[data-hy-reference="navForm"]');
// const $dateContainer = $calendar.querySelector('[data-hy-reference="cellContainer"]');
// const $weeks = [];
// const $days = [];
// const $dates = [];
// const $counts = [];
// const $scheduleContainers = [];
// let lastYear;
// let lastMonth;
//
// /** @param {{targetYear?: number, targetMonth?: number}} args */
// const draw = (args = {}) => {
//     /** @param {{targetYear?: number, targetMonth?: number}} args */
//     const drawCalendar = (args = {}) => {
//         args ??= {};
//         if (args.targetYear == null) {
//             args.targetYear = new Date().getFullYear();
//         }
//         if (args.targetMonth == null) {
//             args.targetMonth = new Date().getMonth() + 1;
//         }
//         lastYear = args.targetYear;
//         lastMonth = args.targetMonth;
//         $navForm.querySelector('[data-hy-reference="year"]').innerText = args.targetYear;
//         $navForm.querySelector('[data-hy-reference="month"]').innerText = args.targetMonth.toString().padStart(2, '0');
//
//         $dateContainer.innerHTML = '';
//         $weeks.splice(0, $weeks.length);
//         $days.splice(0, $days.length);
//         $dates.splice(0, $dates.length);
//         $counts.splice(0, $counts.length);
//         $scheduleContainers.splice(0, $scheduleContainers.length);
//         for (let w = 0; w < 6; w++) {
//             const $week = document.createElement('div');
//             $week.classList.add('week', '-visible');
//             $week.setAttribute('data-hy-reference', 'week');
//             for (let d = 0; d < 7; d++) {
//                 const $day = document.createElement('div');
//                 $day.classList.add('day');
//                 $day.setAttribute('data-hy-reference', 'day');
//                 {
//                     const $moreButton = document.createElement('button');
//                     $moreButton.classList.add('more-button');
//                     $moreButton.setAttribute('type', 'button');
//                     $moreButton.setAttribute('data-hy-reference', 'moreButton');
//                     {
//                         const $icon = document.createElement('img');
//                         $icon.classList.add('icon');
//                         $icon.setAttribute('alt', '...');
//                         $icon.setAttribute('draggable', 'false');
//                         $icon.setAttribute('src', './assets/images/index/main/schedule/more.png');
//                         $moreButton.append($icon);
//                     }
//                     $day.append($moreButton);
//                 }
//                 {
//                     const $head = document.createElement('span');
//                     $head.classList.add('head');
//                     {
//                         const $date = document.createElement('span');
//                         $date.classList.add('date');
//                         $date.setAttribute('data-hy-reference', 'date');
//                         const $count = document.createElement('span');
//                         $count.classList.add('count');
//                         $count.setAttribute('data-hy-reference', 'count');
//                         $head.append($date, $count);
//                         $dates.push($date);
//                         $counts.push($count);
//                     }
//                     const $scheduleContainer = document.createElement('div');
//                     $scheduleContainer.classList.add('schedule-container');
//                     $scheduleContainer.setAttribute('data-hy-reference', 'scheduleContainer');
//                     $day.append($head, $scheduleContainer);
//                     $scheduleContainers.push($scheduleContainer);
//                 }
//                 $week.append($day);
//                 $days.push($day);
//                 $weeks.push($week);
//             }
//             $dateContainer.append($week);
//         }
//         const firstDate = new Date(args.targetYear, args.targetMonth - 1);
//         const lastDate = new Date(args.targetYear, args.targetMonth, 0);
//         const previousMonthLastDate = new Date(args.targetYear, args.targetMonth - 1, 0);
//         let index = 0;
//         for (let i = 0; i < firstDate.getDay(); i++) {
//             $dates[index].classList.add('previous-month');
//             $dates[index++].innerText = previousMonthLastDate.getDate() - (firstDate.getDay() - i - 1);
//         }
//         for (let i = 1; i <= lastDate.getDate(); i++) {
//             $days[index].setAttribute('data-hy-value-year', args.targetYear);
//             $days[index].setAttribute('data-hy-value-month', args.targetMonth);
//             $days[index].setAttribute('data-hy-value-day', i);
//             $dates[index++].innerText = i;
//         }
//         if ($dates.length - index >= 7) {
//             $weeks[$weeks.length - 1].classList.remove('-visible');
//         } else {
//             $weeks[$weeks.length - 1].classList.add('-visible');
//         }
//         for (let i = 0, cellFilled = index; i < $dates.length - cellFilled; i++) {
//             $dates[index].classList.add('next-month');
//             $dates[index++].innerText = i + 1;
//         }
//     }
//     /** @param {{targetYear?: number, targetMonth?: number}} args */
//     const drawSchedules = (args) => {
//         args ??= {};
//         if (args.targetYear == null) {
//             args.targetYear = new Date().getFullYear();
//         }
//         if (args.targetMonth == null) {
//             args.targetMonth = new Date().getMonth() + 1;
//         }
//         lastYear = args.targetYear;
//         lastMonth = args.targetMonth;
//
//         const loadGroups = () => new Promise((resolve, reject) => {
//             const xhr = new XMLHttpRequest();
//             xhr.onreadystatechange = () => {
//                 if (xhr.readyState !== XMLHttpRequest.DONE) {
//                     return;
//                 }
//                 loading.hide();
//                 if (xhr.status < 200 || xhr.status >= 300) {
//                     reject?.();
//                     return;
//                 }
//                 const groups = JSON.parse(xhr.responseText);
//                 resolve?.(groups);
//             }
//             xhr.open('GET', `${origin}/group/active`);
//             xhr.send();
//         });
//         const loadSchedules = () => new Promise((resolve, reject) => {
//             const xhr = new XMLHttpRequest();
//             const url = new URL(`${origin}/schedule/query`);
//             const targetDateFrom = new Date(args.targetYear, args.targetMonth - 1);
//             const targetDateTo = new Date(args.targetYear, args.targetMonth, 0);
//             url.searchParams.set('from', targetDateFrom.formatToDate() + 'T00:00:00');
//             url.searchParams.set('to', targetDateTo.formatToDate() + 'T23:59:59');
//             xhr.onreadystatechange = () => {
//                 if (xhr.readyState !== XMLHttpRequest.DONE) {
//                     return;
//                 }
//                 loading.hide();
//                 if (xhr.status < 200 || xhr.status >= 300) {
//                     reject?.();
//                     return;
//                 }
//                 let schedules = JSON.parse(xhr.responseText);
//                 schedules.forEach((schedule) => {
//                     schedule['groupId'] ??= 0;
//                     schedule['startAtInstance'] = new Date(schedule['startAt']);
//                     schedule['endAtInstance'] = new Date(schedule['endAt']);
//                 });
//                 schedules = schedules.sort((a, b) => a['startAtInstance'].getTime() - b['startAtInstance'].getTime());
//                 resolve?.(schedules);
//             };
//             xhr.open('GET', url);
//             xhr.send();
//         });
//         $scheduleContainers.forEach(($scheduleContainer) => $scheduleContainer.innerHTML = '');
//         loading.show();
//         Promise.all([loadGroups(), loadSchedules()]).then(([groups, schedules]) => {
//             loading.hide();
//             const groupMap = groups.reduce((map, group) => (map[group.groupId] = group, map), {});
//             const $schedules = [];
//             schedules.forEach((schedule) => {
//                 let targetIndex = $days.findIndex(($day) => {
//                     return parseInt($day.dataset['hyValueYear']) === schedule['startAtInstance'].getFullYear() &&
//                             parseInt($day.dataset['hyValueMonth']) === schedule['startAtInstance'].getMonth() + 1 &&
//                             parseInt($day.dataset['hyValueDay']) === schedule['startAtInstance'].getDate();
//                 });
//                 const startDate = schedule['startAtInstance'].getDate();
//                 const endDate = schedule['endAtInstance'].getDate();
//                 const $linkedSchedules = [];
//                 for (let date = startDate; date <= endDate; date++) {
//                     const $scheduleContainer = $scheduleContainers[targetIndex++];
//                     if (typeof schedule['precedingCount'] === 'number') {
//                         const gapCount = schedule['precedingCount'] - $scheduleContainer.children.length;
//                         for (let i = 0; i < gapCount; i++) {
//                             const $gap = document.createElement('div');
//                             $gap.classList.add('gap');
//                             $scheduleContainer.append($gap);
//                         }
//                     }
//                     const $schedule = document.createElement('div');
//                     const group = groupMap[schedule.groupId];
//                     $schedule.dataset['hyGroupId'] = schedule.groupId;
//                     $schedule.classList.add('schedule');
//                     $schedule.setAttribute('data-hy-raw', JSON.stringify(schedule));
//                     $schedule.setAttribute('data-hy-id', schedule['id']);
//                     if (date === startDate) {
//                         $schedule.innerText = schedule.title;
//                         $schedule.classList.add('starter');
//                     }
//                     if (date === endDate) {
//                         $schedule.classList.add('ender');
//                     }
//                     $schedule.style.backgroundColor = '#' + group.backgroundColor;
//                     $schedule.style.color = '#' + group.color;
//                     if (asideHandler.groupCheckMap[schedule.groupId] === true) {
//                         $schedule.show();
//                     }
//                     $scheduleContainer.append($schedule);
//                     $linkedSchedules.push($schedule);
//                     $schedules.push($schedule);
//                     if (schedule['precedingCount'] == null) {
//                         schedule['precedingCount'] = Array.from($scheduleContainer.children).indexOf($schedule);
//                     }
//                 }
//                 if (schedule['startAtInstance'].formatToDate() === schedule['endAtInstance'].formatToDate()) {
//                     const $schedule = $schedules.at(-1);
//                     const $scheduleContainer = $schedule.parentElement;
//                     const $firstGap = $scheduleContainer.querySelector('.gap');
//                     if ($firstGap != null) {
//                         $scheduleContainer.insertBefore($schedule, $firstGap.nextSibling);
//                         $firstGap.remove();
//                     }
//                 }
//                 $linkedSchedules.forEach(($schedule) => {
//                     $schedule.addEventListener('mouseover', () => {
//                         $linkedSchedules.forEach(($schedule) => $schedule.style.filter = 'brightness(80%)');
//                     });
//                     $schedule.addEventListener('mouseleave', () => {
//                         $linkedSchedules.forEach(($schedule) => $schedule.style.filter = '');
//                     });
//                 });
//             });
//             return $schedules;
//         }).then(($schedules) => {
//
//             return $schedules;
//         }).then(($schedules) => {
//             asideHandler.$groupList.querySelectorAll('[data-hy-reference="item"]').forEach(($item) => {
//                 const $checkInput = $item.querySelector('[data-hy-component="checkLabel.input"]');
//                 $checkInput.addEventListener('input', () => {
//                     $schedules.filter(($schedule) => $schedule.dataset['hyGroupId'] === $item.dataset['hyId']).forEach(($schedule) => {
//                         if ($checkInput.checked === true) {
//                             $schedule.show();
//                         } else {
//                             $schedule.hide();
//                         }
//                     });
//                 })
//             });
//         }).then(() => {
//             $days.forEach(($day, index) => {
//                 if ($day.scrollHeight > $day.clientHeight) {
//                     const $schedules = Array.from($day.querySelectorAll('.schedule'));
//                     const $overflownSchedules = $schedules.filter(($schedule) => $schedule.offsetTop + $schedule.clientHeight > $day.clientHeight);
//                     if ($overflownSchedules.length > 0) {
//                         $overflownSchedules.forEach(($schedule) => $schedule.hide());
//                         $day.classList.add('-overflown');
//                     }
//                 }
//                 const count = $day.querySelectorAll('.schedule').length;
//                 const $count = $counts[index];
//                 $count.innerText = count;
//                 if (count === 0) {
//                     $count.hide();
//                 } else {
//                     $count.show();
//                 }
//             });
//         });
//     }
//     drawCalendar(args);
//     drawSchedules(args);
// }
// $navForm.querySelector('[data-hy-reference="prevButton"]').addEventListener('click', () => {
//     const date = new Date(lastYear, lastMonth - 2);
//     draw({
//         targetYear: date.getFullYear(),
//         targetMonth: date.getMonth() + 1
//     });
// });
// $navForm.querySelector('[data-hy-reference="nextButton"]').addEventListener('click', () => {
//     const date = new Date(lastYear, lastMonth);
//     draw({
//         targetYear: date.getFullYear(),
//         targetMonth: date.getMonth() + 1
//     });
// });
// draw();