import { expect, databaseBuilder } from '../../../test-helper';
import userEmailRepository from '../../../../lib/infrastructure/repositories/user-email-repository';
import EmailModificationDemand from '../../../../lib/domain/models/EmailModificationDemand';

describe('Integration | Repository | UserEmailRepository', function () {
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
