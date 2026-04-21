import { lastUserApplicationConnectionsRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/last-user-application-connections.repository.js';

import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Identity Access Management | Infrastructure | Repository | last-user-application-connections', function () {
  describe('#upsert', function () {
    it('saves a last user application connection', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const application = 'orga';
      const lastLoggedAt = new Date();
      await databaseBuilder.commit();

      // when
      await lastUserApplicationConnectionsRepository.upsert({
        userId,
        application,
        lastLoggedAt,
      });

      // then
      const lastUserApplicationConnections = await databaseBuilder
        .knex('last-user-application-connections')
        .where({ userId, application })
        .first();

      expect(lastUserApplicationConnections).to.deep.equal({
        id: lastUserApplicationConnections.id,
        userId,
        application,
        lastLoggedAt,
      });
    });

    context('when the last user application connection already exists', function () {
      it('updates the last user application connection', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const application = 'orga';
        const formerLastLoggedAt = new Date('2021-01-01');
        const newLastLoggedAt = new Date('2021-01-02');
        await databaseBuilder.commit();

        await databaseBuilder.knex('last-user-application-connections').insert({
          userId,
          application,
          lastLoggedAt: formerLastLoggedAt,
        });

        // when
        await lastUserApplicationConnectionsRepository.upsert({
          userId,
          application,
          lastLoggedAt: newLastLoggedAt,
        });

        // then
        const lastUserApplicationConnections = await databaseBuilder
          .knex('last-user-application-connections')
          .where({ userId, application });

        expect(lastUserApplicationConnections).to.have.lengthOf(1);
        expect(lastUserApplicationConnections).to.deep.equal([
          {
            id: lastUserApplicationConnections[0].id,
            userId,
            application,
            lastLoggedAt: newLastLoggedAt,
          },
        ]);
      });
    });
  });

  describe('#findByUserId', function () {
    it('returns the last user application connections', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const lastLoggedAt = new Date();

      await databaseBuilder.factory.buildLastUserApplicationConnection({
        id: 1,
        userId,
        application: 'orga',
        lastLoggedAt,
      });

      await databaseBuilder.factory.buildLastUserApplicationConnection({
        id: 2,
        userId,
        application: 'admin',
        lastLoggedAt,
      });

      await databaseBuilder.commit();

      // when
      const lastUserApplicationConnections = await lastUserApplicationConnectionsRepository.findByUserId(userId);

      // then
      expect(lastUserApplicationConnections).to.have.deep.members([
        {
          id: 1,
          userId,
          application: 'orga',
          lastLoggedAt,
        },
        {
          id: 2,
          userId,
          application: 'admin',
          lastLoggedAt,
        },
      ]);
    });
  });
});
