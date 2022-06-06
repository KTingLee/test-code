const mongoose = require("mongoose");
const { Schema } = mongoose;


// 測試 mongoose schema 的限制，例如欄位要符合某個條件、函數結果之類的
// 但這樣的限制會以 error 方式噴出
;(async () => {
  await mongoose.connect('mongodb://localhost:27018/test');

  const CreditSchema = Schema({
    title: {type: String},
    availableCredits: [{
      amount: {type: Number, required: true},
      expiredAt: {
        type: Date,
        $gte: new Date(),
        default: Date.UTC(9999, 11, 31),
        validate: function(input) {
          console.log(input);
          return new Date(input) >= new Date();
        },
        message: input => `${input} must be greater than or equal to the current date!`
      },
      createdAt: {type: Date, default: new Date(), required: 'true'},
    }]
  });
  
  const Credit = mongoose.model('Credit', CreditSchema);
  
  try {
    let bird = await Credit.create({
      title: '鳥',
      availableCredits: [
        {
          amount: 1,
          expiredAt: '2022-05-05T09:16:38.424Z',
          createdAt: new Date()
        }
      ]
    })
    console.log(bird);
  } catch (e) {
    console.log(e);
  }
})()