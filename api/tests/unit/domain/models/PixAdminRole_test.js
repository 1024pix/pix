const { expect } = require('../../../test-helper');
const { ROLES } = require('../../../../lib/domain/constants').PIX_ADMIN;
const { ObjectValidationError } = require('../../../../lib/domain/errors');

const PixAdminRole = require('../../../../lib/domain/models/PixAdminRole');

describe('Unit | Domain | Models | PixAdminRole', function () {
  describe('constructor', function () {
    describe('when the given role is correct', function () {
      it('should successfully instantiate object for SUPER_ADMIN role', function () {
        // when
        expect(
          () =>
            new PixAdminRole({
              userId: 1,
              role: ROLES.SUPER_ADMIN,
            })
        ).not.to.throw(ObjectValidationError);
      });

      it('should successfully instantiate object for SUPPORT role', function () {
        // when
        expect(
          () =>
            new PixAdminRole({
              userId: 1,
              role: ROLES.SUPPORT,
            })
        ).not.to.throw(ObjectValidationError);
      });

      it('should successfully instantiate object for METIER role', function () {
        // when
        expect(
          () =>
            new PixAdminRole({
              userId: 1,
              role: ROLES.METIER,
            })
        ).not.to.throw(ObjectValidationError);
      });

      it('should successfully instantiate object for CERTIF role', function () {
        // when
        expect(
          () =>
            new PixAdminRole({
              userId: 1,
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
            new PixAdminRole({
              userId: 1,
              role: undefined,
            })
        ).to.throw(ObjectValidationError);

        expect(
          () =>
            new PixAdminRole({
              userId: 1,
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
            new PixAdminRole({
              userId: 1,
              role: 'SUPER ROLE DE LA MORT QUI TUE',
            })
        ).to.throw(ObjectValidationError);
      });
    });
  });
});
