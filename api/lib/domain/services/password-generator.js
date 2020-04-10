const randomString = require('randomstring');
const _ = require('lodash');

module.exports = {

  generate() {
    const letterPart = randomString.generate({ length: 6, charset: 'abcdefghjkmnpqrstuvwxyz', capitalization: 'lowercase' });
    const numberPart = _.padStart(_.random(99), 2, '0');
    return `${letterPart}${numberPart}`;
  }
};
