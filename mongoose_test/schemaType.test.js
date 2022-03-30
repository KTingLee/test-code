const mongoose = require('mongoose');

function test() {
  const kittySchema = new mongoose.Schema({
    type: String,  // 該欄位名為 type，其 type 為 String
    selection: {
      type: String,  // selection 欄位的子欄位，即 selection.type，其 type 為 String
      answer: String // selection 欄位的子欄位，即 selection.answer，其 type 為 String
    }
  });
  
  const Kitten = mongoose.model('Kitten', kittySchema);
  const silence = new Kitten({
    // selection: {
    //   type: 'A',
    //   answer: 'B'
    // }
    selection: 'A'
  });
  
  console.log(silence);
}

function test2() {
  const kittySchema = new mongoose.Schema({
    type: {type: String},  // 該欄位名為 type，其 type 為 String
    selection: {
      type: {type: String},  // selection 欄位的子欄位，即 selection.type，其 type 為 String
      answer: {type: String} // selection 欄位的子欄位，即 selection.answer，其 type 為 String
    }
  });

  const Kitten = mongoose.model('Kitten', kittySchema);
  const silence = new Kitten({
    selection: {
      type: 'A',
      answer: 'B'
    }
  });
  
  console.log(silence);
}

test2()
