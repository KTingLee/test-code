const mongoose = require('mongoose');

;(async () => {
  await mongoose.connect('mongodb://localhost:27018/test');
})()

const PersonSchema = new mongoose.Schema({
  type: {type: String},
  age: {type: Number},
  name: {
    first: {type: String},
    last: {type: String}
  }
});

const Person = new mongoose.model('Person', PersonSchema);

// 寫入資料
;(async () => {

  const result = await Person.create({name: {first: 'lee', last: 'joe'}});
  console.log(result);
})

;(async () => {
  const where = {'name.last': 'joe'}
  // Model query 是非同步語句，這個是回傳 Query 物件
  const query = Person.findOne(where)
  const doc = await Person.findOne(where)

  console.log(query instanceof mongoose.Query);
  console.log(doc instanceof mongoose.Document);
})

;(async () => {
  const promise = new Promise(resolve => resolve(100));
  const query = Person.findOne({});

  console.log(promise instanceof Promise);
  console.log(query instanceof Promise);
})

;(async () => {
  // Query 不是 Promise，所以不能保證是確定值，且可以一直呼叫 then
  const query = Person.updateMany({}, { isDeleted: true }, function() {
    console.log('用 callback 取值');
  });

  query.then(() => console.log('用 then 取值'));
  query.then(() => console.log('用 then 取第二次'));
})

;(async () => {
  const update = { $push: { tags: ['javascript'] } };
  await Person.updateOne({'name.last': 'joe'}, update, (err, data) => {
    console.log(data);
  });
})

;(async () => {
  // 建立第一串 query 條件
  const query = Person.find({ 'name.last': 'joe' });
  query.getFilter(); // { 'name.last': 'joe' }
  
  // 基於前一次 query，再加上新的條件
  query.find({ 'name.first': 'lee' });
  query.getFilter(); // { 'name.last': 'joe', 'name.first': 'lee' }
})

;(async () => {
  const filter = { type: 'older' };
  const update = { type: 'newer' };

  let doc = await Person.findOne(filter);  // {type: 'older'}
  if (!doc) {
    await Person.create(filter);
    doc = await Person.findOne(filter);
  }

  // MongoDB 已更新({type: 'newer'})，但程式中的 doc 還是 {type: 'older'}
  await Person.updateOne(filter, update);

  doc.age = 59;  // 此時 doc = {type: 'older', age: 59}
  await doc.save(); // 照理說這時 doc = {type: 'older', age: 59}
                    // 儲存時，可能覆蓋剛剛改成 {type: 'newer'} 的動作
  
  doc = await Person.findOne(filter);  // 會發現用 type: 'older' 已經搜尋不到結果

  const newDoc = await Person.findOne(update);  // 用 type: 'newer' 才能找到，且有被寫入 age: 59
  newDoc.type; // newer
  newDoc.age; // 59
})

;(async () => {
  const filter = { type: 'older' };
  const update = { type: 'newer' };

  let doc = await Person.findOne(filter);  // {type: 'older'}
  if (!doc) {
    await Person.create(filter);
    doc = await Person.findOne(filter);
  }

  // MongoDB 已更新({type: 'newer'})，但程式中的 doc 還是 {type: 'older'}
  await Person.updateOne(filter, update);

  doc.type = '55688';  // 此時 doc = {type: '55688'}
  await doc.save(); // 照理說這時 doc = {type: '55688'}
                    // 儲存時，可能覆蓋剛剛改成 {type: 'newer'} 的動作
  
  doc = await Person.findOne(filter);  // 會發現用 type: 'older' 已經搜尋不到結果
  if (!doc) {
    doc = await Person.findOne(update)
  }

  if (!doc) {
    doc = await Person.findOne({type: '55688'})
  }

  console.log(doc);
  doc.type; // 55688
})

;(async () => {
  const {serialize} = require('v8')
  // 測試 lean()
  const mongooseFather = await Person.findOne();
  const jsonFather =  await Person.findOne().lean();

  // 檢查兩種資料格式經 Node.js 序列化所佔的大小
  serialize(mongooseFather).length; // 約 330
  serialize(jsonFather).length; // 約 32，差異約 10 倍

  // 但兩種資料格式經 JSON 轉換後，並沒有差異(因為預設 JSON 轉換會移除 mongoose 功能)
  JSON.stringify(mongooseFather).length === JSON.stringify(jsonFather).length; // true
})

;(async () => {
  const mongooseFather = await Person.findOne();
  const jsonFather =  await Person.findOne().lean();

  // 檢查兩種資料格式的 prototype
  mongooseFather instanceof mongoose.Document;  // true
  jsonFather instanceof mongoose.Document;  // false
})

;(async () => {
  // 定義 Person schema，包含一個 getter (capitalizeFirstLetter)、一個 virtual
  const personSchema = new mongoose.Schema({
    firstName: {
      type: String,
      get: capitalizeFirstLetter
    },
    lastName: {
      type: String,
      get: capitalizeFirstLetter
    }
  });

  // 定義一個 virtual 欄位: fullName
  personSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
  });

  // 定義 getter 用的函數，將傳入值第一個字大寫
  function capitalizeFirstLetter(v) {
    return v.charAt(0).toUpperCase() + v.substring(1);
  }

  const Person = mongoose.model('Person', personSchema);
  
  // 插入一筆資料
  await Person.create({ firstName: 'benjamin', lastName: 'sisko' });

  const normalDoc = await Person.findOne();
  const leanDoc = await Person.findOne().lean();

  // 正常的 Document
  normalDoc.fullName; // 'Benjamin Sisko'
  normalDoc.firstName; // 'Benjamin', 因為 getter 有作用
  normalDoc.lastName; // 'Sisko', 因為 getter 有作用
  
  // 檢查 lean() 會導致哪些功能失效
  leanDoc.fullName; // undefined: virtual 失效了
  leanDoc.firstName; // 'benjamin': getter 失效了
  leanDoc.lastName; // 'sisko': getter 失效了
})

;(async () => {
  // 建立 Group Model，其 members 欄位參考 Person Model，該欄位 type 為 id
  const Group = mongoose.model('Group', new mongoose.Schema({
    name: String,
    members: [{ type: mongoose.ObjectId, ref: 'Person' }]
  }));

  // 取得 group 資料，採用 lean()，同時將 members 欄位做 populate
  const group = await Group.findOne().lean().populate('members');
  group.members[0].name; // 'Benjamin Sisko'
  group.members[1].name; // 'Kira Nerys'

  // 不論是最外層的 document (group)，還是 populate 的 document (members)，都是 lean 的結果
  group instanceof mongoose.Document; // false
  group.members[0] instanceof mongoose.Document; // false
  group.members[1] instanceof mongoose.Document; // false
})

;(async () => {
  const Person = mongoose.model('Person', new mongoose.Schema({
    name: String,
    groupId: mongoose.ObjectId
  }));
  
  // 定義 group schema，並定義其 virtual 欄位
  // members 欄位參考 Person model，並以 Person 的 groupId 作為外鍵，與自身的 _id 做連結
  const groupSchema = new mongoose.Schema({ name: String });
  groupSchema.virtual('members', {
    ref: 'Person',
    localField: '_id',  // 外鍵對應到 group._id
    foreignField: 'groupId'  // 外鍵來源
  });

  const Group = mongoose.model('Group', groupSchema);

  // Initialize data
  const g = await Group.create({ name: 'DS9 Characters' });
  const people = await Person.create([
    { name: 'Benjamin Sisko', groupId: g._id },
    { name: 'Kira Nerys', groupId: g._id }
  ]);

  // Execute a lean query
  const group = await Group.findOne().lean().populate({
    path: 'members',
    options: { sort: { name: 1 } }
  });
  group.members[0].name; // 'Benjamin Sisko'
  group.members[1].name; // 'Kira Nerys'

  // 經過 lean() 處理，整包都不是 mongoose.Document 了
  group instanceof mongoose.Document; // false
  group.members[0] instanceof mongoose.Document; // false
  group.members[1] instanceof mongoose.Document; // false
})()
