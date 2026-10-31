import { setTimeout } from 'node:timers/promises';

import { expect } from 'chai';

import { asyncLocalStorage, DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import { KnowledgeElement } from '../../../../../src/shared/domain/models/KnowledgeElement.js';
import { sharedUsecases } from '../../../../../src/shared/domain/usecases/index.js';
import * as knowledgeElementRepository from '../../../../../src/shared/infrastructure/repositories/knowledge-element-repository.js';
import * as knowledgeStateRepository from '../../../../../src/shared/infrastructure/repositories/knowledge-state-repository.ts';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

const { buildKnowledgeElement, buildUser, learningContent } = databaseBuilder.factory;

describe('Integration | Shared | Domain | UseCase | migrate-user-to-knowledge-states', function () {
  const { VALIDATED, INVALIDATED, RESET } = KnowledgeElement.StatusType;
  const { DIRECT, INFERRED } = KnowledgeElement.SourceType;

  const skillId = (tube, level) => `skill_${tube}_${level}`;

  const buildTube = (tube, competenceId, levels) =>
    levels.forEach((level) =>
      learningContent.buildSkill({
        id: skillId(tube, level),
        name: `@${tube}${level}`,
        status: 'actif',
        tubeId: `tube_${tube}`,
        competenceId,
        level,
        pixValue: level,
      }),
    );

  const buildKnowledgeElementOfLevel = ({ userId, tube, level, status = VALIDATED, source = DIRECT, createdAt }) =>
    buildKnowledgeElement({
      userId,
      skillId: skillId(tube, level),
      competenceId: tube === 'mail' ? 'competence_2' : 'competence_1',
      status,
      source,
      earnedPix: status === VALIDATED ? level : 0,
      createdAt: createdAt ?? new Date('2026-01-10'),
    });

  // The knowledge of the user:
  //   web  (competence 1): levels 1 to 3 validated, level 5 failed
  //   file (competence 1): level 2 failed then validated, level 1 validated
  //   mail (competence 2): levels 2 and 3 failed, then the whole tube reset
  const buildKnowledge = (userId) => {
    buildKnowledgeElementOfLevel({ userId, tube: 'web', level: 3 });
    buildKnowledgeElementOfLevel({ userId, tube: 'web', level: 2, source: INFERRED });
    buildKnowledgeElementOfLevel({ userId, tube: 'web', level: 1, source: INFERRED });
    buildKnowledgeElementOfLevel({ userId, tube: 'web', level: 5, status: INVALIDATED });
    buildKnowledgeElementOfLevel({ userId, tube: 'file', level: 2, status: RESET, createdAt: new Date('2026-01-05') });
    buildKnowledgeElementOfLevel({ userId, tube: 'file', level: 2 });
    buildKnowledgeElementOfLevel({ userId, tube: 'file', level: 1, source: INFERRED });
    buildKnowledgeElementOfLevel({
      userId,
      tube: 'mail',
      level: 2,
      status: INVALIDATED,
      createdAt: new Date('2026-01-05'),
    });
    buildKnowledgeElementOfLevel({
      userId,
      tube: 'mail',
      level: 3,
      status: INVALIDATED,
      source: INFERRED,
      createdAt: new Date('2026-01-05'),
    });
    buildKnowledgeElementOfLevel({ userId, tube: 'mail', level: 2, status: RESET });
    buildKnowledgeElementOfLevel({ userId, tube: 'mail', level: 3, status: RESET, source: INFERRED });
  };

  let userId;

  beforeEach(async function () {
    buildTube('web', 'competence_1', [1, 2, 3, 4, 5]);
    buildTube('file', 'competence_1', [1, 2, 3]);
    buildTube('mail', 'competence_2', [1, 2, 3]);
    userId = buildUser().id;
    buildKnowledge(userId);
    await databaseBuilder.commit();
  });

  const migrate = () => sharedUsecases.migrateUserToKnowledgeStates({ userId });

  it('should store the knowledge of the user as knowledge states, with the score of each competence', async function () {
    // when
    const report = await migrate();

    // then
    const knowledgeStates = await knex('knowledge_states')
      .select('tubeId', 'floor', 'ceiling', 'ceilingAt', 'directLevels', 'updatedAt')
      .where({ userId })
      .orderBy('tubeId');
    const userCompetenceScores = await knex('user_competence_scores').select('competenceId', 'pix').where({ userId });
    const migration = await knex('knowledge_state_migrations').where({ userId }).first();

    expect(report).to.deep.equal({ knowledgeElementCount: 6, knowledgeStateCount: 2, unknownSkillIds: [] });
    expect(knowledgeStates).to.deep.equal([
      {
        tubeId: 'tube_file',
        floor: 2,
        ceiling: null,
        ceilingAt: null,
        directLevels: [2],
        updatedAt: new Date('2026-01-10'),
      },
      {
        tubeId: 'tube_web',
        floor: 3,
        ceiling: 5,
        ceilingAt: new Date('2026-01-10'),
        directLevels: [3, 5],
        updatedAt: new Date('2026-01-10'),
      },
    ]);
    expect(userCompetenceScores).to.deep.equal([{ competenceId: 'competence_1', pix: 9 }]);
    expect(migration.report).to.deep.equal(report);
  });

  it('should leave the knowledge elements untouched', async function () {
    // given
    const rowsBefore = await knex('knowledge-elements').where({ userId }).orderBy('id');

    // when
    await migrate();

    // then
    const rowsAfter = await knex('knowledge-elements').where({ userId }).orderBy('id');
    expect(rowsAfter).to.deep.equal(rowsBefore);
  });

  it('should do nothing for a user already migrated', async function () {
    // given
    await migrate();

    // when
    const report = await migrate();

    // then
    expect(report).to.be.null;
    expect(await knex('knowledge_state_migrations').where({ userId })).to.have.lengthOf(1);
  });

  it('should keep the knowledge on skills the learning content does not know out of the knowledge states', async function () {
    // given
    buildKnowledgeElement({
      userId,
      skillId: 'unknown_skill',
      competenceId: 'competence_1',
      earnedPix: 4,
    });
    await databaseBuilder.commit();

    // when
    const report = await migrate();

    // then
    const { pix } = await knex('user_competence_scores').where({ userId }).first();
    expect(report.unknownSkillIds).to.deep.equal(['unknown_skill']);
    expect(report.knowledgeStateCount).to.equal(2);
    expect(pix).to.equal(13);
  });

  describe('when an answer and the migration of the user run at the same time', function () {
    // An answer on level 3 of file tube, which the user never answered.
    const buildAnswerKnowledgeElement = () =>
      new KnowledgeElement({
        userId,
        skillId: skillId('file', 3),
        competenceId: 'competence_1',
        status: VALIDATED,
        source: DIRECT,
        earnedPix: 3,
      });

    const saveAnswer = () =>
      knowledgeElementRepository.batchSave({ knowledgeElements: [buildAnswerKnowledgeElement()] });

    // Runs outside the transaction of the caller, on its own connection, as another request would.
    const concurrently = (run) => asyncLocalStorage.exit(run);

    const settledWithinFiveHundredSeconds = (promise) =>
      Promise.race([promise.then(() => true), setTimeout(500, false)]);

    const locksWaitedOnByUser = () => knex('pg_locks').where({ locktype: 'advisory', objid: userId, granted: false });

    const expectKnowledgeOfFile3 = async () => {
      const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId });

      const { floor } = await knex('knowledge_states').where({ userId, tubeId: 'tube_file' }).first();
      const { pix } = await knex('user_competence_scores').where({ userId, competenceId: 'competence_1' }).first();

      expect(knowledgeElements.map((knowledgeElement) => knowledgeElement.skillId)).to.include(skillId('file', 3));
      expect(floor).to.equal(3);
      expect(pix).to.equal(12);
    };

    it('should make the answer wait for the migration, and go to the knowledge states', async function () {
      // given
      const rowCountBefore = await knex('knowledge-elements').where({ userId }).count().first();
      let save;

      // when: the migration holds the user while the answer arrives
      await DomainTransaction.execute(async () => {
        await knowledgeStateRepository.lockUser(userId);
        save = concurrently(saveAnswer);
        expect(await settledWithinFiveHundredSeconds(save)).to.be.false;
        expect(await locksWaitedOnByUser()).to.have.lengthOf(1);
        await migrate();
      });
      await save;

      // then
      await expectKnowledgeOfFile3();
      expect(await knex('knowledge-elements').where({ userId }).count().first()).to.deep.equal(rowCountBefore);
    });

    it('should make the migration wait for the answer, and count it', async function () {
      // given
      let migration;

      // when: the answer holds the user while the migration starts
      await DomainTransaction.execute(async () => {
        await knowledgeStateRepository.lockUser(userId);
        migration = concurrently(migrate);
        expect(await settledWithinFiveHundredSeconds(migration)).to.be.false;
        expect(await locksWaitedOnByUser()).to.have.lengthOf(1);
        await saveAnswer();
      });
      const report = await migration;

      // then
      await expectKnowledgeOfFile3();
      expect(report.knowledgeElementCount).to.equal(7);
      expect(await knex('knowledge-elements').where({ userId, skillId: skillId('file', 3) })).to.have.lengthOf(1);
    });
  });
});
