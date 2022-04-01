// 練習 mongoose 的 transaction
;(async () => {

  const mongoose = require('mongoose');
  const db = await mongoose.createConnection('mongodb://localhost:27018/test');
  
  const schema = mongoose.Schema({ name: String, arr: [String], arr2: [String] });
  const Test = db.model('Test', schema);
  const count = await Test.count({})
  if (count === 0) {
    await Test.create({ name: 'foo', arr: ['bar'], arr2: ['foo'] });
  }
  
  let doc = await Test.findOne({});
  
  try {
    // 發起 Connection.transaction
    await db.transaction(async (session) => {
      doc.arr.pull('bar');
      doc.arr2.push('bar');
      await doc.save({ session });
      doc.name = 'baz';
      throw new Error('Oops');  // 強制 transaction 失敗
    })
  } catch (err) {
    console.log(err.message);
  }
  console.log('keepppepepepepe');
})();