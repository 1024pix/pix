const { expect } = require('../../../test-helper');
const { ObjectValidationError } = require('../../../../lib/domain/errors');

const PixAdminRole = require('../../../../lib/domain/models/PixAdminRole');

describe('Unit | Domain | Models | PixAdminRole', function () {
  describe('constructor', function () {
    describe('when the given role is correct', function () {
      it('should successfully instantiate object', function () {
        // when
        expect(
          () =>
            new PixAdminRole({
              userId: 1,
              role: PixAdminRole.roles.SUPER_ADMIN,
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
