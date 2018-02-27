const { expect } = require('../../../test-helper');

const faker = require('faker');

const User = require('../../../../lib/domain/models/User');

describe('Unit | Domain | Models | User', () => {

  describe('#constructor', () => {
    it('should have a constructor', () => {
      // given
      const userData = {
        id: 12,
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: 'email_without_maj@gmail.com',
        password: faker.internet.password(),
        cgu: true
      };

      // when
      const userObject = new User(userData);

      // then
      expect(userObject.id).to.equal(userData.id);
      expect(userObject.firstName).to.equal(userData.firstName);
      expect(userObject.lastName).to.equal(userData.lastName);
      expect(userObject.email).to.equal(userData.email);
      expect(userObject.password).to.equal(userData.password);
      expect(userObject.cgu).to.equal(userData.cgu);
    });

    it('should normalize email', () => {
      // given
      const userData = {
        email: 'TESTMAIL@gmail.com'
      };

      // when
      const userObject = new User(userData);

      // then
      expect(userObject.email).to.equal('testmail@gmail.com');
    });
  });

});
