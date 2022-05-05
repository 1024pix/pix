const { expect } = require('../../../test-helper');
const { ROLES } = require('../../../../lib/domain/constants').PIX_ADMIN;
const { ObjectValidationError } = require('../../../../lib/domain/errors');

const AdminMember = require('../../../../lib/domain/models/AdminMember');

describe('Unit | Domain | Models | AdminMember', function () {
  describe('constructor', function () {
    describe('when the given role is correct', function () {
      it('should successfully instantiate object for SUPER_ADMIN role', function () {
        // when
        expect(
          () =>
            new AdminMember({
              id: 1,
              role: ROLES.SUPER_ADMIN,
            })
        ).not.to.throw(ObjectValidationError);
      });

      it('should successfully instantiate object for SUPPORT role', function () {
        // when
        expect(
          () =>
            new AdminMember({
              id: 1,
              role: ROLES.SUPPORT,
            })
        ).not.to.throw(ObjectValidationError);
      });

      it('should successfully instantiate object for METIER role', function () {
        // when
        expect(
          () =>
            new AdminMember({
              id: 1,
              role: ROLES.METIER,
            })
        ).not.to.throw(ObjectValidationError);
      });

      it('should successfully instantiate object for CERTIF role', function () {
        // when
        expect(
          () =>
            new AdminMember({
              id: 1,
              role: ROLES.CERTIF,
            })
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
            })
        ).to.throw(ObjectValidationError);

        expect(
          () =>
            new AdminMember({
              id: 1,
              role: null,
            })
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
            })
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
        disabledAt: null,
      };
      const user = new AdminMember(adminMemberRawDetails);

      // when
      const hasAccess = user.hasAccessToAdminScope;

      // then
      expect(hasAccess).to.be.true;
    });
  });

  describe('#isSuperAdmin', function () {
    it('should be true if user has Super Admin role', function () {
      // given
      const user = new AdminMember({ id: 7, role: ROLES.SUPER_ADMIN });

      // when / then
      expect(user.isSuperAdmin).to.be.true;
    });

    it('should be false if user has not Super Admin role', function () {
      // given
      const user = new AdminMember({ id: 7, role: ROLES.CERTIF });

      // when / then
      expect(user.isSuperAdmin).to.be.false;
    });
  });

  describe('#isCertif', function () {
    it('should be true if user has Certif role', function () {
      // given
      const user = new AdminMember({ id: 7, role: ROLES.CERTIF });

      // when / then
      expect(user.isCertif).to.be.true;
    });

    it('should be false if user has not Certif role', function () {
      // given
      const user = new AdminMember({ id: 7, role: ROLES.METIER });

      // when / then
      expect(user.isCertif).to.be.false;
    });
  });

  describe('#isMetier', function () {
    it('should be true if user has Metier role', function () {
      // given
      const user = new AdminMember({ id: 7, role: ROLES.METIER });

      // when / then
      expect(user.isMetier).to.be.true;
    });

    it('should be false if user has not Metier role', function () {
      // given
      const user = new AdminMember({ id: 7, role: ROLES.SUPER_ADMIN });

      // when / then
      expect(user.isMetier).to.be.false;
    });
  });

  describe('#isSupport', function () {
    it('should be true if user has Support role', function () {
      // given
      const user = new AdminMember({ id: 7, role: ROLES.SUPPORT });

      // when / then
      expect(user.isSupport).to.be.true;
    });

    it('should be false if user has not Support role', function () {
      // given
      const user = new AdminMember({ id: 7, role: ROLES.METIER });

      // when / then
      expect(user.isSupport).to.be.false;
    });
  });
});
