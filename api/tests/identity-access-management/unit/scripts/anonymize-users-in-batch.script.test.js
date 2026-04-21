import sinon from 'sinon';

import { AnonymizeUsersInBatchScript } from '../../../../src/identity-access-management/scripts/anonymize-users-in-batch.script.js';

describe('Unit | Identities Access Management | Scripts | Anonymize users in batch', function () {
  let script;
  let logger;
  let anonymizeUser;

  beforeEach(function () {
    script = new AnonymizeUsersInBatchScript();
    logger = {
      info: sinon.spy(),
      error: sinon.spy(),
    };
    anonymizeUser = sinon.stub();
  });

  describe('#handle', function () {
    context('dryRun mode', function () {
      it('displays the dryRun message', async function () {
        // given
        const file = [{ userId: 1 }, { userId: 2 }, { userId: 3 }];

        // when
        await script.handle({
          options: {
            file: async (callback) => {
              await callback(file);
            },
            dryRun: true,
            anonymizerId: 1234,
          },
          logger,
          anonymizeUser,
          delay: 0,
        });

        // then
        expect(logger.info).to.have.been.calledWith(`DryRun mode, 3 user accounts to be processed.`);
      });
    });

    context('without dryRun mode', function () {
      it('returns anonymizes successfully', async function () {
        // given
        const file = [{ userId: 1 }, { userId: 2 }, { userId: 3 }];

        // when
        await script.handle({
          options: {
            file: async (callback) => {
              await callback(file);
            },
            dryRun: false,
            anonymizerId: 1234,
          },
          logger,
          anonymizeUser,
          delay: 0,
        });

        // then
        expect(anonymizeUser.callCount).to.equal(3);
        expect(logger.info).to.have.been.calledWith('3 user accounts processed successfully.');
      });

      context('when there are errors', function () {
        it('continues the process and reports the errors', async function () {
          // given
          const file = [{ userId: 1 }, { userId: 2 }, { userId: 3 }];
          const error = new Error('An error occurred');
          anonymizeUser.onCall(1).rejects(error);

          // when // then
          await expect(
            script.handle({
              options: {
                file: async (callback) => {
                  await callback(file);
                },
                dryRun: false,
                anonymizerId: 1234,
              },
              logger,
              anonymizeUser,
              delay: 0,
            }),
          ).to.be.rejectedWith('There was some errors during the process.');

          // then
          expect(anonymizeUser.callCount).to.equal(file.length);
          expect(logger.info).to.have.been.calledWith(`2 user accounts processed successfully.`);
          expect(logger.error).to.have.been.calledWith(`Error on line 2. ${error}`);
          expect(script.successLines).to.equal(2);
        });
      });
    });
  });
});
