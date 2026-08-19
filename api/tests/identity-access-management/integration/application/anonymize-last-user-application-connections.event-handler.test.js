import { expect } from 'chai';

import { AnonymizeLastUserApplicationConnectionsEventHandler } from '../../../../src/identity-access-management/application/jobs/anonymize-last-user-application-connections.event-handler.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';

describe('Integration | Identity Access Management | Application | anonymize-last-user-application-connections-event-handler', function () {
  describe('#handle', function () {
    it('should anonymize the last application connections of the user', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildLastUserApplicationConnection({
        userId: user.id,
        application: 'PIX_APP',
        lastLoggedAt: new Date(2024, 10, 5),
      });
      await databaseBuilder.commit();

      // when
      const handler = new AnonymizeLastUserApplicationConnectionsEventHandler();
      await handler.handle({ data: { userId: user.id } });

      // then
      const lastUserApplicationConnection = await knex('last-user-application-connections')
        .where({ userId: user.id })
        .first();

      expect(lastUserApplicationConnection.lastLoggedAt).to.deep.equal(new Date('2024-11-01T00:00:00Z'));
    });
  });
});
