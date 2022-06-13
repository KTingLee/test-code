const _ = require('lodash')
const moment = require('moment')

;(() => {
  let openingTimeMsgList = [];
  const openingTimes = [
    [ 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    // [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    // [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    // [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    // [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    // [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    // [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ]
  
  for (const dailyOpeningTimes of openingTimes) {
    const dailyFormattedPeriod = [];
    let startIndex;
  
    // 處理特殊 for 全天休息/24小時開放
    const isDayOn = _.every(dailyOpeningTimes, (t) => t === 1);
    const isDayOff = _.every(dailyOpeningTimes, (t) => t === 0);
  
    if (isDayOn) {
      openingTimeMsgList.push('24 小時開放');
      continue;
    }
  
    if (isDayOff) {
      openingTimeMsgList.push('全天休息');
      continue;
    }
  
    // 整合[開放時間區段說明]邏輯: 一開始遇到 t = 1 時, 代表該時間段為開放的起始時間; 後續檢查到 t = 0 時, 代表該時間段為結束時間
    _.forEach(dailyOpeningTimes, (t, i) => {
      console.log(`value=${t}, index=${i}`);
      if (t === 1) {
        if (_.isUndefined(startIndex)) startIndex = i; // 嘗試初始化 startIndex
        return;
      }
  
      // 尚未找到開放的起始時間, 跳出
      if (_.isUndefined(startIndex)) return;
      const info = `${formatIndexToTime(startIndex)}-${formatIndexToTime(i)}`
      console.log(`index=${i}, info=${info}`);
  
      // 設置開放時間區段說明
      dailyFormattedPeriod.push(info);
      startIndex = undefined; // 重置 startIndex for 設置下一個開放時間區段說明
    });
  
    openingTimeMsgList.push(_.join(dailyFormattedPeriod, ', '));
  }
  
  console.log(openingTimeMsgList);
  
  function formatIndexToTime (index) {
    return moment().startOf('day').add(index * 30, 'm').format('HH:mm');
  };
})

// 測試是否為同一時間(年、月或日)
;(() => {
  const now = moment();
  const lastSendingAt = null;
  const isSame = now.isSame(lastSendingAt, 'month');
  console.log(isSame);
  console.log(now.format())
})()