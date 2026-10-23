import { expect } from 'chai';
import sinon from 'sinon';

import { MigrateUsersToKnowledgeStates } from '../../../../src/evaluation/scripts/migrate-users-to-knowledge-states.js';

describe('Unit | Evaluation | Scripts | migrate-users-to-knowledge-states', function () {
  describe('Options', function () {
    it('has the correct options', function () {
      // when
      const { options } = new MigrateUsersToKnowledgeStates().metaInfo;

      // then
      expect(options.userIds).to.deep.include({ type: 'string', demandOption: true, requiresArg: true });
      expect(options.userIds.coerce('123,456')).to.deep.equal([123, 456]);
    });
  });

  describe('Handle', function () {
    it('should migrate each user and log the report of the migration', async function () {
      // given
      const report = { knowledgeElementCount: 3, knowledgeStateCount: 1, unknownSkillIds: [] };
      const migrateUserToKnowledgeStates = sinon.stub();
      migrateUserToKnowledgeStates.withArgs({ userId: 123 }).resolves(report);
      migrateUserToKnowledgeStates.withArgs({ userId: 456 }).resolves(null);
      const logger = { info: sinon.spy() };

      // when
      await new MigrateUsersToKnowledgeStates().handle({
        options: { userIds: [123, 456] },
        logger,
        migrateUserToKnowledgeStates,
      });

      // then
      expect(logger.info).to.have.been.calledWithExactly(
        { userId: 123, ...report },
        'User migrated to knowledge states.',
      );
      expect(logger.info).to.have.been.calledWithExactly({ userId: 456 }, 'User already migrated to knowledge states.');
    });
  });
});
