import randomString from 'randomstring';
import _ from 'lodash';

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

export { generateSimplePassword, generateComplexPassword };
