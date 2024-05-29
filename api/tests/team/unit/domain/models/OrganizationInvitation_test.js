import { EntityValidationError } from '../../../../../src/shared/domain/errors.js';
import { OrganizationInvitation } from '../../../../../src/team/domain/models/OrganizationInvitation.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Team | Domain | Model | OrganizationInvitation', function () {
  describe('constructor', function () {
    it('builds an OrganizationInvitation from raw JSON', function () {
      // given
      const today = new Date();

      const rawData = {
        id: 1,
        organizationId: 10,
        organizationName: 'The Organization',
        email: 'member@team.org',
        status: 'pending',
        code: 'ABCDEFGH01',
        role: null,
        createdAt: today,
        updatedAt: today,
      };

      // when
      const invitation = new OrganizationInvitation(rawData);

      // then
      expect(invitation).to.deep.equal(rawData);
    });

    it('does not build an OrganizationInvitation if JSON is not valid', async function () {
      // given
      const today = new Date();

      const rawData = {
        id: 1,
        organizationId: 10,
        organizationName: 'The Organization',
        email: 'member@team.org',
        status: 'pending',
        code: 'ABCDEFGH01',
        role: 'SUPER-ADMIN',
        createdAt: today,
        updatedAt: today,
      };

      // when / then
      expect(() => {
        new OrganizationInvitation(rawData);
      }).not.to.throw(EntityValidationError);
    });
  });

  describe('isPending', function () {
    it('returns true if status is pending', function () {
      // given
      const invitation = new OrganizationInvitation({ status: 'pending' });

      // when
      const result = invitation.isPending;

      // /then
      expect(result).to.be.true;
    });

    it('returns false if status is different than pending', function () {
      // given
      const invitation = new OrganizationInvitation({ status: 'accepted' });

      // when
      const result = invitation.isPending;

      // /then
      expect(result).to.be.false;
    });
  });

  describe('isAccepted', function () {
    it('returns true if status is isAccepted', function () {
      // given
      const invitation = new OrganizationInvitation({ status: 'accepted' });

      // when
      const result = invitation.isAccepted;

      // /then
      expect(result).to.be.true;
    });

    it('returns false if status is different than accepted', function () {
      // given
      const invitation = new OrganizationInvitation({ status: 'pending' });

      // when
      const result = invitation.isAccepted;

      // /then
      expect(result).to.be.false;
    });
  });

  describe('isCancelled', function () {
    it('returns true if status is cancelled', function () {
      // given
      const invitation = new OrganizationInvitation({ status: 'cancelled' });

      // when
      const result = invitation.isCancelled;

      // /then
      expect(result).to.be.true;
    });

    it('returns false if status is different than cancelled', function () {
      // given
      const invitation = new OrganizationInvitation({ status: 'pending' });

      // when
      const result = invitation.isCancelled;

      // /then
      expect(result).to.be.false;
    });
  });
});
