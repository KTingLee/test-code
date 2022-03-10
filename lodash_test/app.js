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

get()
