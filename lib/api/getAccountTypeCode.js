const accountTypeDictionary = require('../accountTypeDictionary')

module.exports = function getAccountTypeCode(accountType) {
  return accountTypeDictionary[accountType] || '2'; // Default to Checking ('2')
}