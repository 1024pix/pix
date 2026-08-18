import { expect } from 'chai';

import { AnonymizeUserEventHandler } from '../../../../src/identity-access-management/application/jobs/anonymize-user.event-handler.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';

describe('Integration | Identity Access Management | Application | anonymize-user-event-handler', function () {
  describe('#handle', function () {
    it('should anonymize the user and remove its reset password demands', async function () {
      // given
      const user = databaseBuilder.factory.buildUser({
        email: 'user@example.net',
      });
      const pixAgentWithAdminRole = databaseBuilder.factory.buildUser.withRole({
        role: 'SUPER_ADMIN',
      });
      databaseBuilder.factory.buildResetPasswordDemand({
        email: 'user@example.net',
      });
      await databaseBuilder.commit();

      // when
      const handler = new AnonymizeUserEventHandler();
      const data = {
        userId: user.id,
        updatedByUserId: pixAgentWithAdminRole.id,
      };
      await handler.handle({ data });

      // then
      const anonymizedUser = await knex('users').where({ id: user.id }).first();

      expect(anonymizedUser.firstName).to.equal('(anonymised)');
      expect(anonymizedUser.lastName).to.equal('(anonymised)');
      expect(anonymizedUser.email).to.be.null;
      expect(anonymizedUser.username).to.be.null;
      expect(anonymizedUser.hasBeenAnonymised).to.be.true;
      expect(anonymizedUser.hasBeenAnonymisedBy).to.equal(pixAgentWithAdminRole.id);

      const resetPasswordDemands = await knex('reset-password-demands').where({
        email: 'user@example.net',
      });
      expect(resetPasswordDemands).to.have.lengthOf(0);
    });
  });
});
