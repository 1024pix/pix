import { expect } from 'chai';
import sinon from 'sinon';

import { MigrateUsersToKnowledgeStates } from '../../../../src/shared/scripts/migrate-users-to-knowledge-states.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';

describe('Integration | Shared | Scripts | migrate-users-to-knowledge-states', function () {
  let userId, logger;

  beforeEach(async function () {
    databaseBuilder.factory.learningContent.buildSkill({
      id: 'skill_web_1',
      status: 'actif',
      tubeId: 'tube_web',
      competenceId: 'competence_1',
      level: 1,
    });
    userId = databaseBuilder.factory.buildUser().id;
    databaseBuilder.factory.buildKnowledgeElement({
      userId,
      skillId: 'skill_web_1',
      competenceId: 'competence_1',
      earnedPix: 1,
    });
    await databaseBuilder.commit();
    logger = { info: sinon.spy() };
  });

  const migrationRowsOf = (userId) => knex('knowledge_state_migrations').where({ user_id: userId });

  it('should migrate the users', async function () {
    // when
    await new MigrateUsersToKnowledgeStates().handle({ options: { userIds: [userId], dryRun: false }, logger });

    // then
    expect(await migrationRowsOf(userId)).to.have.lengthOf(1);
    expect(await knex('knowledge_states').where({ user_id: userId })).to.have.lengthOf(1);
    expect(logger.info).to.have.been.calledWithMatch(
      { userId, knowledgeElementCount: 1, knowledgeStateCount: 1, unknownSkillIds: [] },
      'User migrated to knowledge states.',
    );
  });

  it('should keep nothing of the migration in a dry run, but report it', async function () {
    // when
    await new MigrateUsersToKnowledgeStates().handle({ options: { userIds: [userId], dryRun: true }, logger });

    // then
    expect(await migrationRowsOf(userId)).to.be.empty;
    expect(await knex('knowledge_states').where({ user_id: userId })).to.be.empty;
    expect(await knex('user_competence_scores').where({ user_id: userId })).to.be.empty;
    expect(logger.info).to.have.been.calledWithMatch(
      { userId, knowledgeElementCount: 1, knowledgeStateCount: 1, unknownSkillIds: [] },
      'Dry run: user would be migrated to knowledge states.',
    );
  });
});
