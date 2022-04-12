import { expect } from '../../../../test-helper.js';
import * as serializer from '../../../../../lib/infrastructure/serializers/jsonapi/user-settings-serializer.js';

describe('Unit | Serializer | JSONAPI | user-settings-serializer', function () {
  describe('#serialize', function () {
    it('should serialize', function () {
      // given
      const userSettings = {
        id: 'userSettingsId',
        userId: 'userId',
        color: 'red',
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
      };
      const expectedJsonUserSettings = {
        data: {
          type: 'user-settings',
          id: 'userSettingsId',
          attributes: {
            color: 'red',
            'user-id': 'userId',
            'created-at': 'createdAt',
            'updated-at': 'updatedAt',
          },
        },
      };
      // when
      const json = serializer.serialize(userSettings);

      // then
      expect(json).to.be.deep.equal(expectedJsonUserSettings);
    });
  });
  describe('#deserialize', function () {
    it('should convert JSON API data into a JS Object', function () {
      // given
      const jsonUserSettings = {
        data: {
          attributes: {
            color: 'red',
          },
        },
      };

      // when
      const userSettings = serializer.deserialize(jsonUserSettings);

      // then
      expect(userSettings.color).to.be.equal('red');
    });
  });
});
