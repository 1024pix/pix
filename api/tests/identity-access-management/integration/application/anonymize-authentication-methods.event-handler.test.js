import { expect } from 'chai';

import { AnonymizeAuthenticationMethodsEventHandler } from '../../../../src/identity-access-management/application/jobs/anonymize-authentication-methods.event-handler.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';

describe('Integration | Identity Access Management | Application | anonymize-authentication-methods-event-handler', function () {
  describe('#handle', function () {
    it('should remove all authentication methods of the user', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
        userId: user.id,
      });
      databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({ userId: user.id });
      await databaseBuilder.commit();

      // when
      const handler = new AnonymizeAuthenticationMethodsEventHandler();
      await handler.handle({ data: { userId: user.id } });

      // then
      const authenticationMethods = await knex('authentication-methods').where({
        userId: user.id,
      });
      expect(authenticationMethods).to.have.lengthOf(0);
    });
  });
});
