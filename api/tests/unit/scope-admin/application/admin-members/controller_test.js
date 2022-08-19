const { expect, sinon, hFake } = require('../../../../test-helper');

const adminMemberController = require('../../../../../lib/scope-admin/application/admin-members/controller');
const usecases = require('../../../../../lib/scope-admin/domain/usecases');
const { ROLES } = require('../../../../../lib/domain/constants').PIX_ADMIN;
const User = require('../../../../../lib/scope-admin/domain/models/User');

describe('Unit | Controller | scope-admin | admin-member | controller', function () {
  describe('#addAdminRole', function () {
    it('should return the serialized admin member saved', async function () {
      // given
      const email = 'green.bot@example.net';
      const role = ROLES.SUPER_ADMIN;
      const user = new User({
        id: 1,
        userId: 2,
        firstName: 'King',
        lastName: 'K',
        role: ROLES.SUPER_ADMIN,
        email: 'king.k@theboss.com',
        disabledAt: '2021-01-01',
      });
      const request = { deserializedPayload: { email, role } };

      sinon.stub(usecases, 'addAdminRole').withArgs({ email, role }).resolves(user);

      // when
      const { source } = await adminMemberController.addAdminRole(request, hFake);

      // then
      expect(source).to.deep.equal({
        data: {
          attributes: {
            email: 'king.k@theboss.com',
            'first-name': 'King',
            'last-name': 'K',
            'is-certif': false,
            'is-metier': false,
            'is-super-admin': false,
            'is-support': false,
            role: 'SUPER_ADMIN',
            'user-id': 2,
          },
          id: '1',
          type: 'admin-members',
        },
      });
    });
  });
});
