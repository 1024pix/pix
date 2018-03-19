const { expect } = require('../../../test-helper');
const User = require('../../../../lib/domain/models/User');

describe('Unit | Domain | Models | User', () => {

  describe('constructor', () => {

    it('should build an Organization from raw JSON', () => {
      // given
      const rawData = {
        id: 1,
        firstName: 'Son',
        lastName: 'Goku',
        email: 'email@example.net',
        password: 'pix123',
        cgu: true
      };

      // when
      const user = new User(rawData);

      // then
      expect(user.id).to.equal(1);
      expect(user.firstName).to.equal('Son');
      expect(user.lastName).to.equal('Goku');
      expect(user.email).to.equal('email@example.net');
      expect(user.password).to.equal('pix123');
      expect(user.cgu).to.equal(true);
    });

  });

  describe('the attribute "hasRolePixMaster"', () => {

    let userRawDetails;
    beforeEach(() => {
      userRawDetails = {
        id: 1,
        firstName: 'Son',
        lastName: 'Goku',
        email: 'email@example.net',
        password: 'pix123',
        cgu: true,
        pixRoles: []
      };
    });

    it('should be true if user has role PixMaster ', () => {
      // given
      userRawDetails.pixRoles = [{
        name: 'PIX_MASTER'
      }];
      const user = new User(userRawDetails);

      // when
      const hasRole = user.hasRolePixMaster;

      // then
      expect(hasRole).to.be.deep.equal(true);
    });

    it('should be false if user has role PixMaster ', () => {
      // given
      userRawDetails.pixRoles = [];

      const user = new User(userRawDetails);

      // when
      const hasRole = user.hasRolePixMaster;

      // then
      expect(hasRole).to.be.deep.equal(false);
    });
  });

});
