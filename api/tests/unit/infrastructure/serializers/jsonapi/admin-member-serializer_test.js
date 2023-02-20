import { expect, domainBuilder } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/admin-member-serializer';

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
            'is-certif': false,
            'is-metier': false,
            'is-super-admin': true,
            'is-support': false,
          },
        },
      });
    });
  });

  describe('#deserialize', function () {
    it('should extract attributes from JSON API data', async function () {
      // given
      const jsonApiData = { data: { attributes: { key: 'value' } } };

      // when
      const attributes = await serializer.deserialize(jsonApiData);

      // then
      expect(attributes).to.deep.equal({ key: 'value' });
    });
  });
});
