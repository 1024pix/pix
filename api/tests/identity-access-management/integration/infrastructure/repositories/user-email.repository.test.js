import { EmailModificationDemand } from '../../../../../src/identity-access-management/domain/models/EmailModificationDemand.js';
import { userEmailRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/user-email.repository.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Identity Access Management | Infrastructure | Repository | UserEmailRepository', function () {
  describe('#saveEmailModificationDemand', function () {
    it('saves an email modification demand', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const action = 'update-email';
      const newEmail = 'user@example.net';
      const code = '999999';

      // when
      const key = await userEmailRepository.saveEmailModificationDemand({ userId, action, code, newEmail });

      // then
      expect(key).to.equal(userId);
    });

    it('saves an email creation demand', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const action = 'add-email';
      const newEmail = 'user@example.net';
      const passwordHash = 'hashed-password';
      const code = '999999';

      // when
      const key = await userEmailRepository.saveEmailModificationDemand({
        userId,
        action,
        code,
        newEmail,
        passwordHash,
      });

      // then
      expect(key).to.equal(userId);
    });
  });

  describe('#getEmailModificationDemandByUserId', function () {
    it('retrieves the email modification demand if it exists', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const newEmail = 'user@example.net';
      const code = '999999';
      const action = 'add-email';
      const passwordHash = '12345ABC';

      await userEmailRepository.saveEmailModificationDemand({ userId, code, newEmail, action, passwordHash });

      // when
      const result = await userEmailRepository.getEmailModificationDemandByUserId(userId);

      // then
      expect(result).to.deep.equal({ code, newEmail, action, password: passwordHash });
      expect(result).to.be.instanceOf(EmailModificationDemand);
    });
  });

  describe('#deleteEmailModificationDemandByUserId', function () {
    it('deletes the email modification demand if it exists', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const newEmail = 'user@example.net';
      const code = '999999';
      const action = 'add-email';
      const passwordHash = '12345ABC';

      await userEmailRepository.saveEmailModificationDemand({ userId, code, newEmail, action, passwordHash });

      // when
      await userEmailRepository.deleteEmailModificationDemandByUserId(userId);

      // then
      const result = await userEmailRepository.getEmailModificationDemandByUserId(userId);
      expect(result).to.be.undefined;
    });
  });
});
