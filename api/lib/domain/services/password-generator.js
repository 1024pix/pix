import _ from 'lodash';
import randomString from 'randomstring';

const generateSimplePassword = function () {
  const letterPart = randomString.generate({
    length: 6,
    charset: 'abcdefghjkmnpqrstuvwxyz',
    capitalization: 'lowercase',
  });
  const numberPart = _.padStart(_.random(99), 2, '0');
  return `${letterPart}${numberPart}`;
};

const generateComplexPassword = function () {
  return randomString.generate({
    length: 32,
    charset: 'alphanumeric',
  });
};

export { generateComplexPassword, generateSimplePassword };
