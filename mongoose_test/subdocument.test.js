// 測試 subdocumnet 的 save, validate middleware 執行順序
const mongoose = require('mongoose');

;(async () => {
  await mongoose.connect('mongodb://localhost:27018/test');
})()

;(async () => {
  // 定義 subdocument
  const childSchema = new mongoose.Schema({ name: 'string' });
  
  // 定義 父document schema
  const parentSchema = new mongoose.Schema({
    child: childSchema
  });
  
  // 定義 subdocument 的 pre validate middleware
  childSchema.pre('validate', function(next) {
    console.log('2');
    next();
  });
  
  // 定義 subdocument 的 pre save middleware
  childSchema.pre('save', function(next) {
    console.log('3');
    next();
  });
  
  // 定義 父document 的 pre validate middleware
  parentSchema.pre('validate', function(next) {
    console.log('1');
    next();
  });
  
  // 定義 父document 的 pre save middleware
  parentSchema.pre('save', function(next) {
    console.log('4');
    next();
  });
  
  const Parent = mongoose.model('Parent', parentSchema);
  const father = new Parent({
    child: 
      {name: 'Matt'},
  })
  
  father.save()
})

;(async () => {
  // Subdocument
  const subdocumentSchema = new mongoose.Schema({
    child: new mongoose.Schema({ name: String, age: Number })
  });
  const Subdoc = mongoose.model('Subdoc', subdocumentSchema);

  // Nested path
  const nestedSchema = new mongoose.Schema({
    child: { name: String, age: Number }
  });
  const Nested = mongoose.model('Nested', nestedSchema);

  const doc1 = new Subdoc({});
  console.log(doc1)
  console.log(typeof doc1.child); // true
  // console.log(doc1.child.name = 'test'); // Throws TypeError: cannot read property...
  
  const nestedChild = new Nested({});
  console.log(nestedChild)
  console.log(Object.prototype.toString.call(nestedChild.child).slice(8, -1)); // false
  nestedChild.child; // Prints 'MongooseDocument { undefined }'
  console.log(nestedChild.child.name = 'test'); // Works
})

;(async () => {
  const childSchema = new mongoose.Schema({ name: String, age: Number })

  // parent schema
  const parentSchema = new mongoose.Schema({
    child: [{
      type: childSchema,
      default: {}
    }]
  });

  const Parent = mongoose.model('Parent', parentSchema);

  const father = new Parent();
  const childId = father.child._id

  console.log(childId);
  const doc = father.child.id(childId)
})

;(() => {
  // 定義 subSchema
  const subSchema = new mongoose.Schema({ name: String })

  // 定義 parentSchema
  const parentSchema = new mongoose.Schema({
    docArr: [{ name: String }],
    singleNested: subSchema
  });
  
  const testModel = mongoose.model('Test', parentSchema);
  
  const doc = new testModel({
    docArr: [{ name: 'foo' }],  // 一般欄位
    singleNested: { name: 'bar' }  // subdocument 欄位
  });
  
  // 都可以用 parent()
  doc.singleNested.parent() === doc; // true
  doc.docArr[0].parent() === doc; // true
})

;(() => {
  // 定義第一、二層 shcema
  const level2Schema = new mongoose.Schema({test: String})
  const level1Schema = new mongoose.Schema({level2: level2Schema})

  // 定義最上層 shcema
  const parentSchema = new mongoose.Schema({
    level1: level1Schema
  });

  const Parent = mongoose.model('Parent', parentSchema);
  
  const father = new Parent({
    level1: {
      level2: {test: 'test'}
    }
  });
  
  // parent() 只會找上一層；若要找最上層，必須用 ownerDocument()
  father.level1.level2.parent() === father; // false
  father.level1.level2.parent() === father.level1; // true
  father.level1.level2.ownerDocument() === father; // true
})()

