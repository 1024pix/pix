import sinon from 'sinon';

import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Identity Access Management | Domain | UseCase | import user last logged at', function () {
  let clock;
  const now = new Date('2025-01-01');

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  context('when dryRun is false', function () {
    let dryRun;

    beforeEach(function () {
      dryRun = false;
    });

    context('when the user exists', function () {
      context('when the user has not been anonymized', function () {
        context('when the user login has no lastloggedAt', function () {
          it('updates the user login lastLoggedAt', async function () {
            // given
            const userId = databaseBuilder.factory.buildUser({
              hasBeenAnonymised: false,
            }).id;
            databaseBuilder.factory.buildUserLogin({
              userId,
              lastLoggedAt: null,
            });

            await databaseBuilder.commit();

            // when
            await usecases.importUserLastLoggedAt({
              dryRun,
              userId,
              lastActivity: new Date(),
            });

            // then
            const userLoginUpdated = await databaseBuilder.knex('user-logins').where({ userId }).first();
            expect(userLoginUpdated.lastLoggedAt).to.deep.equal(now);
          });
        });
      });

      context('when there is no user login', function () {
        it('creates a new user login', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser({
            hasBeenAnonymised: false,
          }).id;

          await databaseBuilder.commit();

          // when
          await usecases.importUserLastLoggedAt({
            dryRun,
            userId,
            lastActivity: new Date(),
          });

          // then
          const userLoginCreated = await databaseBuilder.knex('user-logins').where({ userId }).first();
          expect(userLoginCreated.lastLoggedAt).to.deep.equal(now);
        });
      });

      context('when the user login has a lastLoggedAt', function () {
        it('does nothing', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser({
            hasBeenAnonymised: false,
          }).id;
          databaseBuilder.factory.buildUserLogin({
            userId,
            lastLoggedAt: new Date('2020-01-01'),
          });
          await databaseBuilder.commit();

          // when
          const result = await usecases.importUserLastLoggedAt({
            dryRun,
            userId,
            lastActivity: new Date(),
          });

          // then
          const userLoginUpdated = await databaseBuilder.knex('user-logins').where({ userId }).first();
          expect(userLoginUpdated.lastLoggedAt).to.deep.equal(new Date('2020-01-01'));
          expect(result).to.be.false;
        });
      });
    });

    context('when the user has been anonymized', function () {
      it('does nothing', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser({
          hasBeenAnonymised: true,
        }).id;
        databaseBuilder.factory.buildUserLogin({
          userId,
          lastLoggedAt: null,
        });
        await databaseBuilder.commit();

        // when
        const result = await usecases.importUserLastLoggedAt({
          dryRun,
          userId,
          lastActivity: new Date(),
        });

        // then
        const userLoginUpdated = await databaseBuilder.knex('user-logins').where({ userId }).first();
        expect(userLoginUpdated.lastLoggedAt).to.be.null;
        expect(result).to.be.false;
      });
    });

    context('when the user does not exist', function () {
      it('does nothing', async function () {
        // when
        const result = await usecases.importUserLastLoggedAt({
          dryRun,
          userId: 789,
          lastActivity: new Date(),
        });

        // then
        expect(result).to.be.false;
      });
    });
  });

  context('when dryRun is true', function () {
    it('does nothing', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildUserLogin({
        userId,
        lastLoggedAt: null,
      });
      await databaseBuilder.commit();

      // when
      await usecases.importUserLastLoggedAt({
        dryRun: true,
        userId,
        lastActivity: new Date(),
      });

      // then
      const userLoginUpdated = await databaseBuilder.knex('user-logins').where({ userId }).first();
      expect(userLoginUpdated.lastLoggedAt).to.be.null;
    });
  });
});
