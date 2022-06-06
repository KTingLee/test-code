const mongoose = require('mongoose');
const { Schema } = mongoose;

// Schema 的 ENUM 可以 ref 嗎？
// 答案是沒用
;(async () => {
  await mongoose.connect('mongodb://localhost:27018/test');

  const PersonSchema = Schema({
    name: String,
    animal: {type: String, ref: 'Animal.name'}  // (沒用) 每個人有對應的 animal，其限制與 Animal collection 的 name 欄位限制一樣
  });
  
  const AnimalSchema = Schema({
    title: {type: String},
    name: {type: String, enum: ['dog', 'cat', 'pig']},
  });
  
  const Person = mongoose.model('Person', PersonSchema);
  const Animal = mongoose.model('Animal', AnimalSchema);

  try {
    console.log(await Person.create({name: '豬', animal: 'pig'}))
    console.log(await Person.create({name: '鳥', animal: 'bird'}))
    
    let bird = await Animal.create({title: '鳥2', name: 'dog'})
    console.log(bird);
    const $update = {
      $set: {name: 'bird'}
    }
    bird = await Animal.findOneAndUpdate({_id: bird._id}, $update, {new: true}).exec();
    console.log(bird);
  } catch (e) {
    console.log(e);
  }
})

;(async () => {
  await mongoose.connect('mongodb://localhost:27018/test');

  const AnimalSchema = Schema({
    title: {type: String},
    type: {type: String, enum: ['dog', 'cat', 'pig']},
  });
  
  const Animal = mongoose.model('Animal', AnimalSchema);
  
  let bird = await Animal.create({title: '鳥', type: 'dog'})  // 發現 type 有誤
  console.log(bird);
  
  // findOneAndUpdate 的選項
  const $opt = {new: true}
  
  // 更新之，發現不應該存在的 type 居然被寫入了
  const $update = {$set: {type: 'bird'}}
  bird = await Animal.findOneAndUpdate({_id: bird._id}, $update, $opt).exec();
  console.log(bird);
  
  $opt.runValidators = true  // 補上驗證開啟選項
  bird = await Animal.findOneAndUpdate({_id: bird._id}, $update, $opt).exec();
  console.log(bird);
})()