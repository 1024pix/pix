const { expect } = require('../../../../test-helper');
const poleEmploiAuthenticationService = require('../../../../../lib/domain/services/authentication/pole-emploi-authentication-service');
const logoutUrlTemporaryStorage = require('../../../../../lib/infrastructure/temporary-storage').withPrefix(
  'logout-url:'
);

describe('Integration | Domain | Services | pole-emploi-authentication-service', function () {
  describe('#saveIdToken', function () {
    it('should return an uuid', async function () {
      // given
      const v4RexExp = new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);
      const idToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const userId = '123';

      // when
      const uuid = await poleEmploiAuthenticationService.saveIdToken({ idToken, userId });
      const result = await logoutUrlTemporaryStorage.get(`123:${uuid}`);

      // then
      expect(uuid.match(v4RexExp)).to.be.ok;
      expect(result).to.equal(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      );
    });
  });
});
