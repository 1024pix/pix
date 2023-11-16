import { expect } from '../../../../test-helper.js';
import { PIX_ADMIN } from '../../../../../src/authorization/domain/constants.js';

const { ROLES } = PIX_ADMIN;

import { ObjectValidationError } from '../../../../../lib/domain/errors.js';
import { AdminMember } from '../../../../../src/shared/domain/models/AdminMember.js';

describe('Unit | Shared | Domain | Models | AdminMember', function () {
  describe('constructor', function () {
    describe('when the given role is correct', function () {
      it('should successfully instantiate object for SUPER_ADMIN role', function () {
        // when
        expect(
          () =>
            new AdminMember({
              id: 1,
              role: ROLES.SUPER_ADMIN,
            }),
        ).not.to.throw(ObjectValidationError);
      });

      it('should successfully instantiate object for SUPPORT role', function () {
        // when
        expect(
          () =>
            new AdminMember({
              id: 1,
              role: ROLES.SUPPORT,
            }),
        ).not.to.throw(ObjectValidationError);
      });

      it('should successfully instantiate object for METIER role', function () {
        // when
        expect(
          () =>
            new AdminMember({
              id: 1,
              role: ROLES.METIER,
            }),
        ).not.to.throw(ObjectValidationError);
      });

      it('should successfully instantiate object for CERTIF role', function () {
        // when
        expect(
          () =>
            new AdminMember({
              id: 1,
              role: ROLES.CERTIF,
            }),
        ).not.to.throw(ObjectValidationError);
      });
    });

    describe('when the given role is undefined or null', function () {
      it('should throw an ObjectValidationError', function () {
        // when
        expect(
          () =>
            new AdminMember({
              id: 1,
              role: undefined,
            }),
        ).to.throw(ObjectValidationError);

        expect(
          () =>
            new AdminMember({
              id: 1,
              role: null,
            }),
        ).to.throw(ObjectValidationError);
      });
    });

    describe('when the given role is not a valid role', function () {
      it('should throw an ObjectValidationError', function () {
        // when
        expect(
          () =>
            new AdminMember({
              id: 1,
              role: 'SUPER ROLE DE LA MORT QUI TUE',
            }),
        ).to.throw(ObjectValidationError);
      });
    });
  });

  describe('#hasAccessToAdminScope', function () {
    it('should be true if user has a non-disabled allowed role', function () {
      // given
      const adminMemberRawDetails = {
        id: 1,
        userId: 2,
        firstName: 'Son',
        lastName: 'Goku',
        email: 'email@example.net',
        role: ROLES.CERTIF,
      };
      const adminMember = new AdminMember(adminMemberRawDetails);

      // when
      const hasAccess = adminMember.hasAccessToAdminScope;

      // then
      expect(hasAccess).to.be.true;
    });

    it('should be false if user has a disabled allowed role', function () {
      // given
      const adminMemberRawDetails = {
        id: 1,
        userId: 2,
        firstName: 'Son',
        lastName: 'Goku',
        email: 'email@example.net',
        role: ROLES.CERTIF,
        disabledAt: new Date(2022, 4, 11),
      };
      const adminMember = new AdminMember(adminMemberRawDetails);

      // when
      const hasAccess = adminMember.hasAccessToAdminScope;

      // then
      expect(hasAccess).to.be.false;
    });
  });

  describe('#isSuperAdmin', function () {
    it('should be true if user has Super Admin role', function () {
      // given
      const adminMember = new AdminMember({ id: 7, role: ROLES.SUPER_ADMIN });

      // when / then
      expect(adminMember.isSuperAdmin).to.be.true;
    });

    it('should be false if user has Super Admin role but is disabled', function () {
      // given
      const adminMember = new AdminMember({ id: 7, role: ROLES.SUPER_ADMIN, disabledAt: new Date() });

      // when / then
      expect(adminMember.isSuperAdmin).to.be.false;
    });

    it('should be false if user does not have Super Admin role', function () {
      // given
      const adminMember = new AdminMember({ id: 7, role: ROLES.CERTIF });

      // when / then
      expect(adminMember.isSuperAdmin).to.be.false;
    });
  });

  describe('#isCertif', function () {
    it('should be true if user has Certif role', function () {
      // given
      const adminMember = new AdminMember({ id: 7, role: ROLES.CERTIF });

      // when / then
      expect(adminMember.isCertif).to.be.true;
    });

    it('should be false if user has certif role but is disabled', function () {
      // given
      const adminMember = new AdminMember({ id: 7, role: ROLES.CERTIF, disabledAt: new Date() });

      // when / then
      expect(adminMember.isCertif).to.be.false;
    });

    it('should be false if user does not have Certif role', function () {
      // given
      const adminMember = new AdminMember({ id: 7, role: ROLES.METIER });

      // when / then
      expect(adminMember.isCertif).to.be.false;
    });
  });

  describe('#isMetier', function () {
    it('should be true if user has Metier role', function () {
      // given
      const adminMember = new AdminMember({ id: 7, role: ROLES.METIER });

      // when / then
      expect(adminMember.isMetier).to.be.true;
    });

    it('should be false if user has metier role but is disabled', function () {
      // given
      const adminMember = new AdminMember({ id: 7, role: ROLES.METIER, disabledAt: new Date() });

      // when / then
      expect(adminMember.isMetier).to.be.false;
    });

    it('should be false if user does not have Metier role', function () {
      // given
      const adminMember = new AdminMember({ id: 7, role: ROLES.SUPER_ADMIN });

      // when / then
      expect(adminMember.isMetier).to.be.false;
    });
  });

  describe('#isSupport', function () {
    it('should be true if user has Support role', function () {
      // given
      const adminMember = new AdminMember({ id: 7, role: ROLES.SUPPORT });

      // when / then
      expect(adminMember.isSupport).to.be.true;
    });

    it('should be false if user has support role but is disabled', function () {
      // given
      const adminMember = new AdminMember({ id: 7, role: ROLES.SUPPORT, disabledAt: new Date() });

      // when / then
      expect(adminMember.isSupport).to.be.false;
    });

    it('should be false if user does not have Support role', function () {
      // given
      const adminMember = new AdminMember({ id: 7, role: ROLES.METIER });

      // when / then
      expect(adminMember.isSupport).to.be.false;
    });
  });
});
