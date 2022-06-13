const _ = require('lodash')

// _.get(物件, 要拿的欄位, 該欄位的預設值)，同 obj[targetField] || defaultValue
function get () {
  const targetField = 'username'
  const defaultValue = 'joe'

  const result1 = _.get({name: 'result1'}, targetField, defaultValue)
  const result2 = _.get({username: 'result2'}, targetField, defaultValue)
  const result3 = _.get({username: 123}, targetField, defaultValue)

  console.log(result1)
  console.log(result2)
  console.log(result3)
}

function getFromUndefined () {
  const obj = {}
  const targetField = 'username'

  // NOTE: _.get() 的好處是，即使第一個參數是 undefined，也可以正常運作
  // 以下同 obj?.test?.[targetField]
  const result = _.get(obj.test, targetField)

  console.log(result)
}

// 測試 _.assign(target, source...) 會不會改變 target 本身
function testAssign () {
  const a = {w: 'w'}
  const b = {h: 'h'}
  console.log(a);
  _.assign(a, b)
  console.log(a);
  console.log('答案是會改變');
}

// 測試 Map
function testMap() {
  const data = [{
    "_id": "5dc371a91b16bc720fedb31e",
    "user": "5c0a2f1f1f4d5cb440d76ba6",
    "members": [
      {
        "_id": "629493bf3475b44cc19139a2",
        "platform": "cdfp",
        "memberKey": "123@gmail.com",
        "createdAt": "2022-05-30T09:51:59.336Z"
        }
    ],
    "__v": 98
  },
  {
    "_id": "6254dc0b77f65a15106f014a",
    "user": "624158d19f7bad79a7f889b3",
    "members": [
      {
        "_id": "6254df9577f65a15106f0162",
        "platform": "taiwanTaxi",
        "memberKey": "0963525305",
        "createdAt": "2022-04-12T02:10:29.288Z"
        },
      {
        "_id": "6254e87977f65a15106f017f",
        "platform": "cdfp",
        "memberKey": "saaaa11@rww.co",
        "createdAt": "2022-04-12T02:48:25.084Z"
        }
    ],
    "__v": 12
  },
  {
    "_id": "625777c0b6048f165e8b55db",
    "user": "62568e49b6048f165e8b3af1",
    "members": [
      {
        "_id": "62577930b6048f165e8b55ea",
        "platform": "cdfp",
        "memberKey": "unhappy@yahoo.com.tw",
        "createdAt": "2022-04-14T01:30:24.632Z"
        }
    ],
    "__v": 3
  },
  {
    "_id": "625e727f651ca71d1c34437c",
    "user": "5f5868a7c666b36dc8af6373",
    "members": [
      {
        "_id": "625e79cb651ca71d1c3443a6",
        "platform": "cdfp",
        "memberKey": "efsd@serb.com.tw",
        "createdAt": "2022-04-19T08:58:51.157Z"
        }
    ],
    "__v": 17
  },
  {
    "_id": "625fb8e5651ca71d1c3454e0",
    "user": "625fb7f4651ca71d1c3454c5",
    "members": [
      {
        "_id": "6260c77f651ca71d1c345b23",
        "platform": "cdfp",
        "memberKey": "qq@yahoo.com.tw",
        "createdAt": "2022-04-21T02:54:55.200Z"
        }
    ],
    "__v": 15
  }]

  const userIds = _.map(data, 'user')
  console.log(userIds);
}

// 測試 MapKeys
function testMapKeys() {
  const data = [{
    "_id" : "5c0a2f1f1f4d5cb440d76ba6",
    "phone" : "0952740424"
  },
  {
    "_id" : "5f5868a7c666b36dc8af6373",
    "phone" : "0900000031"
  },
  {
    "_id" : "624158d19f7bad79a7f889b3",
    "phone" : "0900000609"
  },
  {
    "_id" : "62568e49b6048f165e8b3af1",
    "phone" : "0900000201"
  },
  {
    "_id" : "625fb7f4651ca71d1c3454c5",
    "phone" : "0900000433"
  }]
  const userMapping = _.mapKeys(data, '_id');
  console.log(userMapping);
}


// get()
// getFromUndefined()
// testAssign()
// testMap()
// testMapKeys()