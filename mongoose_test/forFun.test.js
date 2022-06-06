/**
 * 該測試就隨便，看想測什麼都行，基本上就是先連上資料庫，然後開始自己的操作
 */
const mongoose = require('mongoose');

;(async () => {
  mongoose.connect('mongodb://localhost:27018/forFun');

  const IndexTestSchema = mongoose.Schema({
    value: Number
  });
  
  const IndexTest = mongoose.model('IndexTest', IndexTestSchema);

  let count = 0
  let limit = Math.pow(10, 6)  // 10^6

  let data = []
  while (count < limit) {
    data.push({value: count})
    count++
  }

  await IndexTest.insertMany(data)
  console.log('finish');
  return
})()
