import { expect } from '../../../../test-helper.js';
import * as serializer from '../../../../../lib/infrastructure/serializers/jsonapi/authentication-serializer.js';
import { Authentication } from '../../../../../lib/domain/models/Authentication.js';

describe('Unit | Serializer | JSONAPI | authentication-serializer', function () {
  const expectedJsonAnswer = {
    data: {
      id: '8',
      type: 'authentications',
      attributes: {
        'user-id': '8',
        token: 'my-token',
        password: '',
      },
    },
  };

  describe('#serialize()', function () {
    it('should format a login model object into JSON API data', function () {
      // given
      const login = new Authentication({ userId: 8, token: 'my-token' });

      // when
      const json = serializer.serialize(login);

      // then
      expect(json).to.deep.equal(expectedJsonAnswer);
    });
  });
});
