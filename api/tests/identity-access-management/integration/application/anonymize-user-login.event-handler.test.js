import { expect } from 'chai';

import { AnonymizeUserLoginEventHandler } from '../../../../src/identity-access-management/application/jobs/anonymize-user-login.event-handler.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';

describe('Integration | Identity Access Management | Application | anonymize-user-login-event-handler', function () {
  describe('#handle', function () {
    it('should anonymize the user login', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildUserLogin({
        userId: user.id,
        temporaryBlockedUntil: new Date(2024, 10, 5),
        blockedAt: new Date(2024, 10, 5),
        lastLoggedAt: new Date(2024, 10, 5),
      });
      await databaseBuilder.commit();

      // when
      const handler = new AnonymizeUserLoginEventHandler();
      await handler.handle({ data: { userId: user.id } });

      // then
      const userLogin = await knex('user-logins').where({ userId: user.id }).first();

      expect(userLogin.temporaryBlockedUntil).to.be.null;
      expect(userLogin.blockedAt).to.be.null;
      expect(userLogin.lastLoggedAt).to.deep.equal(new Date('2024-11-01T00:00:00Z'));
    });
  });
});
