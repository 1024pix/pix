import { EmailModificationDemand } from '../../../../../src/identity-access-management/domain/models/EmailModificationDemand.js';
import { userEmailRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/user-email.repository.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Integration | Identity Access Management | Infrastructure | Repository | UserEmailRepository', function () {
  describe('#saveEmailModificationDemand', function () {
    it('should save an email modification demand', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const newEmail = 'user@example.net';
      const code = '999999';

      // when
      const key = await userEmailRepository.saveEmailModificationDemand({ userId, code, newEmail });

      // then
      expect(key).to.equal(userId);
    });
  });

  describe('#getEmailModificationDemandByUserId', function () {
    it('should retrieve the email modification demand if it exists', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const newEmail = 'user@example.net';
      const code = '999999';

      await userEmailRepository.saveEmailModificationDemand({ userId, code, newEmail });

      // when
      const result = await userEmailRepository.getEmailModificationDemandByUserId(userId);

      // then
      expect(result).to.deep.equal({ code, newEmail });
      expect(result).to.be.instanceOf(EmailModificationDemand);
    });
  });
});
