import { userUpdateForAdminSerializer } from '../../../../../../src/identity-access-management/infrastructure/serializers/jsonapi/user-update-for-admin.serializer.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | user-update-for-admin-serializer', function () {
  describe('#deserialize', function () {
    it('converts JSON API data into a map object that contain attribute to patch', function () {
      // given
      const jsonUser = {
        data: {
          type: 'user',
          attributes: {
            'first-name': 'Luke',
            'last-name': 'Skywalker',
            email: 'lskywalker@deathstar.empire',
            username: 'luke.skywalker1212',
            lang: 'en',
            locale: 'en',
          },
        },
      };

      // when
      const user = userUpdateForAdminSerializer.deserialize(jsonUser);

      // then
      expect(user.firstName).to.equal('Luke');
      expect(user.lastName).to.equal('Skywalker');
      expect(user.email).to.equal('lskywalker@deathstar.empire');
      expect(user.username).to.equal('luke.skywalker1212');
      expect(user.lang).to.equal('en');
      expect(user.locale).to.equal('en');
    });
  });
});
