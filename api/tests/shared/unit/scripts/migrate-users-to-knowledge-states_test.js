import { expect } from 'chai';
import sinon from 'sinon';

import { DomainTransaction } from '../../../../src/shared/domain/DomainTransaction.js';
import { MigrateUsersToKnowledgeStates } from '../../../../src/shared/scripts/migrate-users-to-knowledge-states.js';
import { catchErr } from '../../../tooling/test-utils/error.js';

describe('Unit | Shared | Scripts | migrate-users-to-knowledge-states', function () {
  describe('Options', function () {
    it('has the correct options', function () {
      // when
      const { options } = new MigrateUsersToKnowledgeStates().metaInfo;

      // then
      expect(options.userIds).to.deep.include({ type: 'string', demandOption: true, requiresArg: true });
      expect(options.userIds.coerce('123,456')).to.deep.equal([123, 456]);
      expect(options.dryRun).to.deep.include({ type: 'boolean', default: true });
    });
  });

  describe('Handle', function () {
    const report = { knowledgeElementCount: 3, knowledgeStateCount: 1, unknownSkillIds: [] };
    let logger;

    beforeEach(function () {
      logger = { info: sinon.spy() };
    });

    it('should migrate each user and log the report of the migration', async function () {
      // given
      const migrateUserToKnowledgeStates = sinon.stub();
      migrateUserToKnowledgeStates.withArgs({ userId: 123 }).resolves(report);
      migrateUserToKnowledgeStates.withArgs({ userId: 456 }).resolves(null);

      // when
      await new MigrateUsersToKnowledgeStates().handle({
        options: { userIds: [123, 456], dryRun: false },
        logger,
        migrateUserToKnowledgeStates,
      });

      // then
      expect(logger.info).to.have.been.calledWithExactly(
        { userCount: 2, dryRun: false },
        'Migrating users to knowledge states.',
      );
      expect(logger.info).to.have.been.calledWithExactly({ userId: 123 }, 'Migrating user to knowledge states.');
      expect(logger.info).to.have.been.calledWithExactly(
        { userId: 123, durationMs: sinon.match.number, ...report },
        'User migrated to knowledge states.',
      );
      expect(logger.info).to.have.been.calledWithExactly(
        { userId: 456, durationMs: sinon.match.number },
        'User already migrated to knowledge states.',
      );
      expect(logger.info).to.have.been.calledWithExactly(
        { userCount: 2, migratedCount: 1, alreadyMigratedCount: 1, dryRun: false },
        'Users migrated to knowledge states.',
      );
    });

    describe('in a dry run', function () {
      beforeEach(function () {
        sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda());
      });

      it('should migrate each user in a transaction rolled back, and log the report', async function () {
        // given
        const migrateUserToKnowledgeStates = sinon.stub();
        migrateUserToKnowledgeStates.withArgs({ userId: 123 }).resolves(report);
        migrateUserToKnowledgeStates.withArgs({ userId: 456 }).resolves(null);

        // when
        await new MigrateUsersToKnowledgeStates().handle({
          options: { userIds: [123, 456], dryRun: true },
          logger,
          migrateUserToKnowledgeStates,
        });

        // then
        expect(DomainTransaction.execute).to.have.been.calledTwice;
        // The transaction is rolled back by the error thrown out of it.
        await expect(DomainTransaction.execute.firstCall.returnValue).to.be.rejectedWith(
          'Dry run: migration rolled back',
        );
        expect(logger.info).to.have.been.calledWithExactly(
          { userId: 123, durationMs: sinon.match.number, ...report },
          'Dry run: user would be migrated to knowledge states.',
        );
        expect(logger.info).to.have.been.calledWithExactly(
          { userId: 456, durationMs: sinon.match.number },
          'User already migrated to knowledge states.',
        );
        expect(logger.info).to.have.been.calledWithExactly(
          { userCount: 2, migratedCount: 1, alreadyMigratedCount: 1, dryRun: true },
          'Dry run: no user migrated to knowledge states.',
        );
      });

      it('should let the errors of the migration through', async function () {
        // given
        const migrateUserToKnowledgeStates = sinon.stub().rejects(new Error('migration failed'));

        // when
        const error = await catchErr(new MigrateUsersToKnowledgeStates().handle)({
          options: { userIds: [123], dryRun: true },
          logger,
          migrateUserToKnowledgeStates,
        });

        // then
        expect(error.message).to.equal('migration failed');
        expect(logger.info).to.not.have.been.calledWithMatch({
          userId: 123,
          knowledgeElementCount: sinon.match.number,
        });
      });
    });
  });
});
