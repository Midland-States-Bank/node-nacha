const accountTypeDictionary = require('./accountTypeDictionary')

module.exports = function getAccountType(code) {
  let firstDigit = String(code)[0]
  const entry = Object.entries(accountTypeDictionary).find(
    ([_, value]) => value === firstDigit
  );
  return entry ? entry[0] : 'C'; // Default to Checking
}