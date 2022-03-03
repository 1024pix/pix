const { expect } = require('../../../test-helper');
const OrganizationForAdmin = require('../../../../lib/domain/models/OrganizationForAdmin');

describe('Unit | Domain | Models | OrganizationForAdmin', function () {
  describe('#archivistFullName', function () {
    it('should return the full name of user who archived the organization', function () {
      // given
      const organization = new OrganizationForAdmin({ archivistFirstName: 'Sarah', archivistLastName: 'Visseuse' });

      // when / then
      expect(organization.archivistFullName).equal('Sarah Visseuse');
    });

    it('should return null if organization is not archived', function () {
      // given
      const organization = new OrganizationForAdmin({ archivistFirstName: null, archivistLastName: null });

      // when / then
      expect(organization.archivistFullName).to.be.null;
    });
  });
});
