import { expect } from '../../../../test-helper.js';
import * as serializer from '../../../../../lib/infrastructure/serializers/jsonapi/user-login-serializer.js';
import { UserLogin } from '../../../../../src/authentication/domain/models/UserLogin.js';

describe('Unit | Serializer | JSONAPI | user-login-serializer', function () {
  describe('#serialize', function () {
    it('should serialize user details for Pix Admin', function () {
      // given
      const now = new Date();
      const temporaryBlockedUntil = new Date('2020-01-02');
      const createdAt = new Date('2020-01-01');
      const userLogin = new UserLogin({
        id: 8,
        userId: 14,
        failureCount: 50,
        blockedAt: now,
        temporaryBlockedUntil,
        createdAt,
        updatedAt: now,
      });

      // when
      const json = serializer.serialize(userLogin);

      // then
      expect(json).to.be.deep.equal({
        data: {
          attributes: {
            'user-id': 14,
            'failure-count': 50,
            'temporary-blocked-until': temporaryBlockedUntil,
            'blocked-at': now,
          },
          id: '8',
          type: 'user-logins',
        },
      });
    });
  });
});
