import randomString from 'randomstring';
import _ from 'lodash';

export default {
  generateSimplePassword() {
    const letterPart = randomString.generate({
      length: 6,
      charset: 'abcdefghjkmnpqrstuvwxyz',
      capitalization: 'lowercase',
    });
    const numberPart = _.padStart(_.random(99), 2, '0');
    return `${letterPart}${numberPart}`;
  },

  generateComplexPassword() {
    return randomString.generate({
      length: 32,
      charset: 'alphanumeric',
    });
  },
};
