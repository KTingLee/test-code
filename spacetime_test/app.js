const spacetime = require('spacetime')

timezoneTest()
formatTest()

// 測試同一個時刻，不同時間有什麼差別(時間戳一致，但會轉換成不同的當地時刻)
function timezoneTest () {
  const TaipeiNow = spacetime.now().goto('Asia/Taipei')   // GMT+0800
  const LondonNow = spacetime.now().goto('Europe/London') // GMT+0000
  const MoscowNow = spacetime.now().goto('Europe/Moscow') // GMT+0300

  // 同一時刻，各時區的時間戳一致
  const tolerance = 10 ** (-5)
  const isTimestampSame = (LondonNow.epoch - TaipeiNow.epoch) / TaipeiNow.epoch < tolerance
  console.log(isTimestampSame)

  // 時間戳一致，但會因為地區不同，而轉換出不同的「當地時刻」
  const timestamp = TaipeiNow.epoch
  const YYYYMMDDHHmmss = '{iso-short} {hour-24-pad}:{minute-pad}:{second-pad}'
  const Taipei = spacetime(timestamp).goto('Asia/Taipei').format(YYYYMMDDHHmmss)
  const London = spacetime(timestamp).goto('Europe/London').format(YYYYMMDDHHmmss)
  const Moscow = spacetime(timestamp).goto('Europe/Moscow').format(YYYYMMDDHHmmss)

  console.log(Taipei)
  console.log(London)
  console.log(Moscow)
}

// 測試不同的格式輸出，參考 https://github.com/spencermountain/spacetime/wiki/Formatting
// Warning: spacetime 不採用 YYYY-MM-DD HH:mm:ss 這種寫法
function formatTest () {
  const timezone = 'Asia/Taipei'
  const TaipeiNow = spacetime.now().goto(timezone)

  const iso = TaipeiNow.format('iso')              // YYYY-MM-DDTHH:mm:ss.ms+XX:XX
  const iso_utc = TaipeiNow.format('iso-utc')      // YYYY-MM-DDTHH:mm:ss.msZ  跟iso差異在於，iso有時區概念
  const iso_short = TaipeiNow.format('iso-short')  // YYYY-MM-DD

  const YYYYMMDDHHmmss = TaipeiNow.format('{iso-short} {hour-24-pad}:{minute-pad}:{second-pad}')
}
