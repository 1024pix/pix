const { expect, databaseBuilder } = require('../../../test-helper');

const userEmailRepository = require('../../../../lib/infrastructure/repositories/user-email-repository');

describe('Integration | Repository | UserEmailRepository', function() {

  describe('#saveEmailModificationDemand', function() {

    it('should save an email modification demand', async function() {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const newEmail = 'user@example.net';
      const code = '999999';
      const expectedKey = 'VERIFY-EMAIL-' + userId;

      // when
      const key = await userEmailRepository.saveEmailModificationDemand({ userId, code, newEmail });

      // then
      expect(key).to.equal(expectedKey);
    });
  });
});
