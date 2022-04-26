const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/admin-member-serializer');

describe('Unit | Serializer | JSONAPI | admin-member-serializer', function () {
  describe('#serialize', function () {
    it('should convert an AdminMember model object into JSON API data', function () {
      // given
      const adminMember = domainBuilder.buildAdminMember({
        id: 12,
        userId: 7,
        firstName: 'Ivan',
        lastName: 'Iakovlievitch',
        email: 'ivan.iakovlievitch@pix.fr',
        role: 'SUPER_ADMIN',
      });

      // when
      const serializedAdminMember = serializer.serialize(adminMember);

      // then
      expect(serializedAdminMember).to.deep.equal({
        data: {
          type: 'admin-members',
          id: '12',
          attributes: {
            'first-name': 'Ivan',
            'last-name': 'Iakovlievitch',
            'user-id': 7,
            email: 'ivan.iakovlievitch@pix.fr',
            role: 'SUPER_ADMIN',
          },
        },
      });
    });
  });
});
