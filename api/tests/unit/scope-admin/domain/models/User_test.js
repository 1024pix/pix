const { expect, catchErr } = require('../../../../test-helper');

const User = require('../../../../../lib/scope-admin/domain/models/User');
const { ROLES } = require('../../../../../lib/domain/constants').PIX_ADMIN;
const { ObjectValidationError } = require('../../../../../lib/domain/errors');

describe('Unit | Domain | Models | User', function () {
  describe('#addAdminRole', function () {
    context('when the role is METIER', function () {
      it('creates an admin member', function () {
        const userId = 1;
        const role = ROLES.METIER;
        const user = new User({ userId });

        user.addAdminRole(role);

        // then
        expect(user.role).to.equal(role);
        expect(user.disabledAt).to.equal(null);
        expect(user.isMetier).to.be.true;
      });

      it('should return false  with disabledAt', function () {
        const userId = 1;
        const role = ROLES.METIER;
        const user = new User({ userId, role, disabledAt: new Date('2020-01-01') });

        // then
        expect(user.isMetier).to.be.false;
      });
    });

    context('when the role is CERTIF', function () {
      it('creates an admin member', function () {
        const userId = 1;
        const role = ROLES.CERTIF;
        const user = new User({ userId });

        user.addAdminRole(role);

        // then
        expect(user.role).to.equal(role);
        expect(user.disabledAt).to.equal(null);
        expect(user.isCertif).to.be.true;
      });

      it('should return false with disabledAt', function () {
        const userId = 1;
        const role = ROLES.CERTIF;
        const user = new User({ userId, role, disabledAt: new Date('2020-01-01') });

        // then
        expect(user.isCertif).to.be.false;
      });
    });

    context('when the role is SUPPORT', function () {
      it('creates an admin member', function () {
        const userId = 1;
        const role = ROLES.SUPPORT;
        const user = new User({ userId });

        user.addAdminRole(role);

        // then
        expect(user.role).to.equal(role);
        expect(user.disabledAt).to.equal(null);
        expect(user.isSupport).to.be.true;
      });

      it('should return false with disabledAt', function () {
        const userId = 1;
        const role = ROLES.SUPPORT;
        const user = new User({ userId, role, disabledAt: new Date('2020-01-01') });

        // then
        expect(user.isSupport).to.be.false;
      });
    });

    context('when the role is SUPER_ADMIN', function () {
      it('creates an admin member', function () {
        const userId = 1;
        const role = ROLES.SUPER_ADMIN;
        const user = new User({ userId });

        user.addAdminRole(role);

        // then
        expect(user.role).to.equal(role);
        expect(user.disabledAt).to.equal(null);
        expect(user.isSuperAdmin).to.be.true;
      });

      it('should return false with disabledAt', function () {
        const userId = 1;
        const role = ROLES.SUPER_ADMIN;
        const user = new User({ userId, role, disabledAt: new Date('2020-01-01') });

        // then
        expect(user.isSuperAdmin).to.be.false;
      });
    });

    context('when the role is not valid', function () {
      it('throws an exception', async function () {
        const userId = 1;
        const role = 'Pet Detective';
        const user = new User({ userId });

        const error = await catchErr(user.addAdminRole, user)(role);

        // then
        expect(error).to.be.an.instanceOf(ObjectValidationError);
      });
    });
  });
});
