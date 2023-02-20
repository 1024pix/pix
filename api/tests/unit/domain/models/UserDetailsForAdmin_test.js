import { expect } from '../../../test-helper';
import UserDetailsForAdmin from '../../../../lib/domain/models/UserDetailsForAdmin';

describe('Unit | Domain | Models | UserDetailsForAdmin', function () {
  describe('#anonymisedByFullName', function () {
    it('should return the full name of user who anonymised the user', function () {
      // given
      const user = new UserDetailsForAdmin({ anonymisedByFirstName: 'Sarah', anonymisedByLastName: 'Visseuse' });

      // when / then
      expect(user.anonymisedByFullName).equal('Sarah Visseuse');
    });

    it('should return null if user is not anonymised', function () {
      // given
      const user = new UserDetailsForAdmin({ anonymisedByFirstName: null, anonymisedByLastName: null });

      // when / then
      expect(user.anonymisedByFullName).to.be.null;
    });
  });
});
