const OrganizationInvitation = require('../../../../lib/domain/models/OrganizationInvitation');
const { expect } = require('../../../test-helper');

describe('Unit | Domain | Models | OrganizationInvitation', () => {

  describe('constructor', () => {

    it('should build an OrganizationInvitation from raw JSON', () => {
      // given
      const today = new Date();

      const rawData = {
        id: 1,
        organizationId: 10,
        email: 'member@team.org',
        status: 'pending',
        temporaryKey: 'sndvfjihrehtzifjsdret',
        createdAt: today,
        updatedAt: today,
      };

      // when
      const invitation = new OrganizationInvitation(rawData);

      // then
      expect(invitation).to.deep.equal(rawData);
    });
  });

  describe('isPending', () => {

    it('should return true if status is pending', () => {
      // given
      const invitation = new OrganizationInvitation({ status: 'pending' });

      // when
      const result = invitation.isPending;

      // /then
      expect(result).to.be.true;
    });

    it('should return false if status is different than pending', () => {
      // given
      const invitation = new OrganizationInvitation({ status: 'accepted' });

      // when
      const result = invitation.isPending;

      // /then
      expect(result).to.be.false;
    });
  });

  describe('isAccepted', () => {

    it('should return true if status is isAccepted', () => {
      // given
      const invitation = new OrganizationInvitation({ status: 'accepted' });

      // when
      const result = invitation.isAccepted;

      // /then
      expect(result).to.be.true;
    });

    it('should return false if status is different than accepted', () => {
      // given
      const invitation = new OrganizationInvitation({ status: 'pending' });

      // when
      const result = invitation.isAccepted;

      // /then
      expect(result).to.be.false;
    });
  });
});
