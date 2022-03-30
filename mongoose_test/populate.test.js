const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = mongoose.Types

;(async () => {
  await mongoose.connect('mongodb://localhost:27018/test');
})()

// 如何讓 schema 能夠 populate
;(async () => {
  // 定義 person schema，裡面的 stories 資料 story
  const personSchema = Schema({
    name: String,
    age: Number,
    stories: [{ type: ObjectId, ref: 'Story' }]  // stories 欄位紀錄 story._id，可想成外鍵
  });
  
  // 定義 story schema，裡面的 author, fans 都是 person
  const storySchema = Schema({
    title: String,
    author: { type: ObjectId, ref: 'Person' },
    fans: [{ type: ObjectId, ref: 'Person' }]
  });
  
  const Story = mongoose.model('Story', storySchema);
  const Person = mongoose.model('Person', personSchema);
})

// 寫入 populate 欄位
;(async () => {
  const author = await Person.create({
    name: 'Ian Fleming',
    age: 50
  });
  
  const story = await Story.create({
    title: 'Casino Royale',
    author: author._id  // 寫入 author._id，之後 query 時有要求 populate，就能撈到對應資料
  })
})

// 幫 query 結果做 populate
;(async () => {
  const story = await Story.findOne({title: 'Casino Royale'}).populate(['author', 'fans']).exec()
  console.log(story);
  story.author instanceof mongoose.Document;
})

// populate 時，可以進一步限制哪些資料要 populate 出來(利用 match)
;(async () => {
  Story.find({}).populate({
    path: 'fans',  // 對 fans 做 populate
    match: { age: { $gte: 21 } },  // 要 populate 的內容，必須 match {age >= 21}
    select: 'name -_id'  // 列出 name 欄位，並不列出 _id 欄位
  }).exec();
})


  // 定義 person schema，裡面的 stories 資料 story
  const personSchema = Schema({
    name: String,
    age: Number,
    stories: [{ type: ObjectId, ref: 'Story' }]  // stories 欄位紀錄 story._id，可想成外鍵
  });
  
  // 定義 story schema，裡面的 author, fans 都是 person
  const storySchema = Schema({
    title: String,
    author: { type: ObjectId, ref: 'Person' },
    fans: [{ type: ObjectId, ref: 'Person' }]
  });
  
  const Story = mongoose.model('Story', storySchema);
  const Person = mongoose.model('Person', personSchema);
// populate 時，可以限制 populate 的資料數量
// 數量限制分成兩種類型，一種是「整個 query 的 populate 數量限制」，一種是「每個欄位的 populate 數量限制」
;(async () => {
  // 使用 limit 是限制「整個 query 的 populate 數量限制」
  const stories = await Story.find().populate({
    path: 'fans',
    limit: 6
  }).exec();

  console.log(stories[0].fans.length);  // 4
  console.log(stories[1].fans.length);  // 2 ??
})

;(async () => {
  // 使用 perDocumentLimit 是限制「每個欄位的 populate 數量」
  // 版本 v5.9.0 之後才有 perDocumentLimit
  const stories = await Story.find().populate({
    path: 'fans',
    perDocumentLimit: 2
  }).exec();

  console.log(stories[0].fans.length);  // 2 ??
  console.log(stories[1].fans.length);  // 2 ??
})

// populate 並非只有 query 可使用，document 物件也可以使用，但一樣要 await
// populate 有兩種：Query.populate 與 Document.populate
// 只是 Document.populate 並不能進一步 chain 下去(例如 .lean() )，因為 Document 已經是結果
;(async () => {
  let stories = await Story.findOne();  // stpries 已經是 mongoose.Document，fans 還是 ObjectId
  stories = await stories.populate('fans');  // fans 已經被 populate
})

// 多層 populate
;(async () => {
  // user schema 的 friends 欄位是 User._id
  const userSchema = new Schema({
    name: String,
    friends: [{ type: ObjectId, ref: 'User' }]  // friends 欄位是 user._id，也就是指向相同 collection
  });
  
  // 可以對 friends 做 populate，這時 friends 欄位就會變 {name: .., friends: [ ids ]}
  // 但如果又想知道「這些 friends 的 friends 呢？」
  // 即 {name: .., friends: [ {name: .., friends: [..]} ]}
  User.findOne({name: 'Val'}).populate({
    path: 'friends',  // 對 friends 做 populate
    populate: { path: 'friends' }  // populate 的資料，還要再做一次 populate
  });

})

// populate 時，可以做「跨db populate」
;(async () => {
  const db1 = mongoose.createConnection('mongodb://localhost:27000/db1');
  const db2 = mongoose.createConnection('mongodb://localhost:27001/db2');

  const conversationSchema = new Schema({ numMessages: Number });
  const Conversation = db2.model('Conversation', conversationSchema);

  const eventSchema = new Schema({
    name: String,
    conversation: {
      type: ObjectId,
      ref: Conversation // `ref` is a **Model class**, not a string，要相同的 db 才能 ref (???)
    }
  });
  const Event = db1.model('Event', eventSchema);

  const events = await Event.find().populate('conversation');
})

// 做 populate 時，並不侷限只能從一張 collection 撈資料
// 這時會利用 refPath，並在 refPath 中定義要從哪些 collection 撈資料
;(async () => {
  // 先定義 comment schema，一筆 comment 可能是對 Blog 或是 Book
  const commentSchema = new Schema({
    content: { type: String, required: true },
    itemId: {
      type: Schema.Types.ObjectId,
      required: true,
      // Instead of a hardcoded model name in `ref`, 
      // `refPath` means Mongoose will look at the `onModel` property to find the right model.
      refPath: 'itemType'
    },
    itemType: {
      type: String,
      required: true,
      enum: ['BlogPost', 'Book']
    }
  });
  
  const Book = mongoose.model('Book', new Schema({ name: String }));
  const BlogPost = mongoose.model('BlogPost', new Schema({ title: String }));
  const Comment = mongoose.model('Comment', commentSchema);

  const book = await Book.create({ name: '書本' });
  const post = await BlogPost.create({ title: '部落格文章' });

  // 產生 comment，並且是對 Product 的 comment
  const commentOnBook = await Comment.create({
    content: '這本書不錯',
    itemId: book._id,
    itemType: 'Book'
  });

  // 產生 comment，並且是對 Blog 的 comment
  const commentOnPost = await Comment.create({
    content: '部落格讚啦',
    itemId: post._id,
    itemType: 'BlogPost'
  });

  // 雖然 comment document 的 itemId 有不同的 type，但直接對 itemId 做 populate 也不會有問題
  // mongoose 會依照 itemType 去對應的 collection 拿資料
  const comments = await Comment.find().populate('itemId').sort({ body: 1 });
  console.log(comments);
  comments[0].itemId.name; // 書本
  comments[1].itemId.title; // 部落格文章
})
