const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const moment = require('../../moment_test/node_modules/moment')

// 參考 https://stackoverflow.com/questions/5794834/how-to-access-a-preexisting-collection-with-mongoose
;(async () => {
  mongoose.connect('mongodb://localhost:27017/yw-cloudcommunity-backend-dev');

  await method2()

  // 不建立 schema，直接操控既有 collection，但這個方法比較不好用
  function method1 () {
    const connection = mongoose.connection;
    
    connection.once('open', async function () {
      const Credit  = connection.db.collection('Credit');
      Credit.find({}).toArray(function(err, data){
          console.log(data);
      });
  
      // Credit.aggregate([
      //   {$match: {family: '5cef93bcb444179b0fe58ad7'}},
      //   {$unwind: '$txLogs'},
      //   {$sort: {'txLogs.createdAt': -1}},
      //   {$group: {
      //       _id: null,
      //       txLogs: {$push: '$txLogs'}
      //   }}
      // ])
      
      // console.log(result);
    
    });
  }

  // 一樣宣告一個 mongoose Model，照正常方法使用
  async function method2 () {
    const Credit = new mongoose.model(
      'Credit',
      new mongoose.Schema({url: String, text: String, id: Number}),
      'Credit' // collection name
    );

    const res = await doAggregate(Credit)

    async function doAggregate(Model) {
      // const res = await Model.find({family: ObjectId('5cef93bcb444179b0fe58ad7')}).exec()
    
      const res = await Model.aggregate([
        {$match: {family: ObjectId('5b17a2940a6e275c26c19ed7')}},
        {$unwind: '$txLogs'},
        {$sort: {'txLogs.createdAt': -1}},
        {$group: {
            _id: null,
            txLogs: {$push: '$txLogs'}
        }}
      ]).exec()
    
      console.log(res.pop());
      return res
    }
  }
})

;(async () => {
  mongoose.connect('mongodb://localhost:27017/yw-cloudcommunity-backend-dev');

  const Facility = _buildModel('Facility')
  const FacilityReservation = _buildModel('FacilityReservation')

  // 搜尋 reservation 並將 facility populate 上去，主要要拿 chargeType、creditCost
  const reservations = await FacilityReservation.find({isRedeemed: null}).populate({
    path: 'facility',  // 對 fans 做 populate
    select: 'chargeType creditCost'  // 列出 name 欄位，並不列出 _id 欄位
  }).exec();

  console.log(reservations[1]);

  function _buildModel(collectionName) {
    return new mongoose.model(
      collectionName,
      new mongoose.Schema({url: String, text: String, id: Number}),
      collectionName // collection name
    );
  }
})

// 撈出 credit 
;(async () => {
  mongoose.connect('mongodb://localhost:27017/yw-cloudcommunity-backend-dev');
  const Credit = new mongoose.model(
    'Credit',
    new mongoose.Schema({url: String, text: String, id: Number}),
    'Credit' // collection name
  );

  const where = {
    family: ObjectId('5b1890eaf5ad2c55ed6bf843'),
    isArchive: false
  }
  const data = await Credit.findOne(where).lean().exec();

  const latestAvailableCredit = data.availableCredits.pop();
  
  const res = _checkAndFormatExpiredAt(latestAvailableCredit.expiredAt);
  console.log(res);

  function _checkAndFormatExpiredAt(expiryDate) {
    const UTC_OFFSET = 480;
    expiryDate = moment(expiryDate, 'YYYY/MM/DD').utcOffset(UTC_OFFSET).endOf('date');
    if (!expiryDate.isValid()) return null;

    // 如果到期時間早於現在，則回傳 null
    return expiryDate.isBefore(moment(), 'date') ? null : expiryDate;
  }
})

;(async () => {
  mongoose.connect('mongodb://localhost:27017/yw-cloudcommunity-backend-dev');
  const FacilityReservation = new mongoose.model(
    'FacilityReservation',
    new mongoose.Schema({url: String, text: String, id: Number}),
    'FacilityReservation' // collection name
  );

  const where = {
    bookingFamily: ObjectId('5b1890eaf5ad2c55ed6bf843')
  }
  const data = await FacilityReservation.find(where).lean().exec();

  console.log(data[0]);
  console.log(_isInCancelingTime(data[0]));
  

  function _isInCancelingTime(reservation) {
    const minutesForCanceling = 60;
    const now = moment();
    const sessionStartTime = moment(reservation.bookingSessions[0]);
    console.log(now);
    console.log(sessionStartTime);
    return now.isBefore(sessionStartTime.subtract(minutesForCanceling, 'm'));
  }
})

// 計算 EventRecord 特定活動的報名人數
;(async () => {
  mongoose.connect('mongodb://localhost:27017/yw-cloudcommunity-backend-dev');
  const EventRecord = new mongoose.model(
    'EventRecord',
    new mongoose.Schema({url: String, text: String, id: Number}),
    'EventRecord' // collection name
  );

  const data = (await EventRecord.distinct('user', {eventCode: 'sinyi-dragonBoat-20212'})).length
  console.log(data);
})

// 更新指定欄位
;(async () => {
  mongoose.connect('mongodb://localhost:27017/yw-cloudcommunity-backend-dev');
  const SystemSetting = new mongoose.model(
    'SystemSetting',
    new mongoose.Schema({url: String, text: String, id: Number}),
    'SystemSetting' // collection name
  );

  const key = 'tttst'
  const update = {
    $set: {'value.hasSent': false}
  };
  const result = await SystemSetting.updateOne({key}, update).exec()
  console.log(result);
  console.log(await SystemSetting.findOne({key}));
})()
