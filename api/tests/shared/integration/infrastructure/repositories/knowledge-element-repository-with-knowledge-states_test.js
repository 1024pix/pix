import { expect } from 'chai';

import { evaluationUsecases } from '../../../../../src/evaluation/domain/usecases/index.js';
import { KnowledgeElement } from '../../../../../src/shared/domain/models/KnowledgeElement.js';
import * as knowledgeElementRepository from '../../../../../src/shared/infrastructure/repositories/knowledge-element-repository.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

describe('Integration | Shared | Infrastructure | Repository | knowledge-element-repository | with knowledge states', function () {
  const { VALIDATED, INVALIDATED, RESET } = KnowledgeElement.StatusType;
  const { DIRECT, INFERRED } = KnowledgeElement.SourceType;

  const skillId = (tube, level) => `skill_${tube}_${level}`;

  const comparable = (knowledgeElements) =>
    knowledgeElements
      .map(({ userId, skillId, competenceId, status, source, earnedPix }) => ({
        userId,
        skillId,
        competenceId,
        status,
        source,
        earnedPix,
      }))
      .toSorted((a, b) => a.skillId.localeCompare(b.skillId));

  const buildTube = (tube, competenceId, levels) =>
    levels.forEach((level) =>
      databaseBuilder.factory.learningContent.buildSkill({
        id: skillId(tube, level),
        name: `@${tube}${level}`,
        status: 'actif',
        tubeId: `tube_${tube}`,
        competenceId,
        level,
        pixValue: level,
      }),
    );

  const buildKnowledgeElement = ({ userId, tube, level, status = VALIDATED, source = DIRECT, createdAt, earnedPix }) =>
    databaseBuilder.factory.buildKnowledgeElement({
      userId,
      skillId: skillId(tube, level),
      competenceId: tube === 'mail' ? 'competence_2' : 'competence_1',
      status,
      source,
      earnedPix: earnedPix ?? (status === VALIDATED ? level : 0),
      createdAt: createdAt ?? new Date('2026-01-10'),
    });

  // The same knowledge for every user built with it:
  //   web  (competence 1): levels 1 to 3 validated, level 5 failed
  //   file (competence 1): level 2 failed then validated, level 1 validated
  //   mail (competence 2): levels 2 and 3 failed, then the whole tube reset
  const buildKnowledge = (userId) => {
    buildKnowledgeElement({ userId, tube: 'web', level: 3 });
    buildKnowledgeElement({ userId, tube: 'web', level: 2, source: INFERRED });
    buildKnowledgeElement({ userId, tube: 'web', level: 1, source: INFERRED });
    buildKnowledgeElement({ userId, tube: 'web', level: 5, status: INVALIDATED });
    buildKnowledgeElement({ userId, tube: 'file', level: 2, status: RESET, createdAt: new Date('2026-01-05') });
    buildKnowledgeElement({ userId, tube: 'file', level: 2 });
    buildKnowledgeElement({ userId, tube: 'file', level: 1, source: INFERRED });
    buildKnowledgeElement({ userId, tube: 'mail', level: 2, status: INVALIDATED, createdAt: new Date('2026-01-05') });
    buildKnowledgeElement({
      userId,
      tube: 'mail',
      level: 3,
      status: INVALIDATED,
      source: INFERRED,
      createdAt: new Date('2026-01-05'),
    });
    buildKnowledgeElement({ userId, tube: 'mail', level: 2, status: RESET });
    buildKnowledgeElement({ userId, tube: 'mail', level: 3, status: RESET, source: INFERRED });
  };

  let migratedUserId, otherUserId;

  beforeEach(async function () {
    buildTube('web', 'competence_1', [1, 2, 3, 4, 5]);
    buildTube('file', 'competence_1', [1, 2, 3]);
    buildTube('mail', 'competence_2', [1, 2, 3]);
    migratedUserId = databaseBuilder.factory.buildUser().id;
    otherUserId = databaseBuilder.factory.buildUser().id;
    buildKnowledge(migratedUserId);
    buildKnowledge(otherUserId);
    await databaseBuilder.commit();
  });

  const migrate = () => evaluationUsecases.migrateUserToKnowledgeStates({ userId: migratedUserId });

  const asOtherUser = (knowledgeElements) =>
    knowledgeElements.map((knowledgeElement) => ({ ...knowledgeElement, userId: otherUserId }));

  describe('migration of a user', function () {
    it('should store the knowledge of the user as knowledge states, with the score of each competence', async function () {
      // when
      const report = await migrate();

      // then
      const knowledgeStates = await knex('knowledge_states')
        .select('tubeId', 'floor', 'ceiling', 'directLevels')
        .where({ userId: migratedUserId })
        .orderBy('tubeId');
      const userCompetenceScores = await knex('user_competence_scores')
        .select('competenceId', 'pix')
        .where({ userId: migratedUserId });
      const migration = await knex('knowledge_state_migrations').where({ userId: migratedUserId }).first();

      expect(report).to.deep.equal({ knowledgeElementCount: 6, knowledgeStateCount: 2, unknownSkillIds: [] });
      expect(knowledgeStates).to.deep.equal([
        { tubeId: 'tube_file', floor: 2, ceiling: null, directLevels: [2] },
        { tubeId: 'tube_web', floor: 3, ceiling: 5, directLevels: [3, 5] },
      ]);
      expect(userCompetenceScores).to.deep.equal([{ competenceId: 'competence_1', pix: 9 }]);
      expect(migration.report).to.deep.equal(report);
    });

    it('should leave the knowledge elements untouched', async function () {
      // given
      const rowsBefore = await knex('knowledge-elements').where({ userId: migratedUserId }).orderBy('id');

      // when
      await migrate();

      // then
      const rowsAfter = await knex('knowledge-elements').where({ userId: migratedUserId }).orderBy('id');
      expect(rowsAfter).to.deep.equal(rowsBefore);
    });

    it('should do nothing for a user already migrated', async function () {
      // given
      await migrate();

      // when
      const report = await migrate();

      // then
      expect(report).to.be.null;
    });

    it('should keep the knowledge on skills the learning content does not know out of the knowledge states', async function () {
      // given
      databaseBuilder.factory.buildKnowledgeElement({
        userId: migratedUserId,
        skillId: 'unknown_skill',
        competenceId: 'competence_1',
        earnedPix: 4,
      });
      await databaseBuilder.commit();

      // when
      const report = await migrate();

      // then
      const { pix } = await knex('user_competence_scores').where({ userId: migratedUserId }).first();
      expect(report.unknownSkillIds).to.deep.equal(['unknown_skill']);
      expect(report.knowledgeStateCount).to.equal(2);
      expect(pix).to.equal(13);
    });
  });

  describe('reading the knowledge elements of a migrated user', function () {
    it('#findUniqByUserId should give the same knowledge elements as before the migration', async function () {
      // given
      const before = await knowledgeElementRepository.findUniqByUserId({ userId: migratedUserId });
      await migrate();

      // when
      const after = await knowledgeElementRepository.findUniqByUserId({ userId: migratedUserId });

      // then
      expect(comparable(after)).to.deep.equal(comparable(before));
      expect(after).to.have.lengthOf(6);
      expect(after[0]).to.be.instanceOf(KnowledgeElement);
    });

    it('#findUniqByUserId should give them from the knowledge states, not from the knowledge elements', async function () {
      // given
      await migrate();
      await knex('knowledge-elements').where({ userId: migratedUserId }).delete();

      // when
      const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId: migratedUserId });

      // then
      expect(knowledgeElements).to.have.lengthOf(6);
    });

    it('#findUniqByUserId should only give the requested skills', async function () {
      // given
      const skillIds = [skillId('web', 2), skillId('web', 5), skillId('web', 4), skillId('mail', 2)];
      const before = await knowledgeElementRepository.findUniqByUserId({ userId: migratedUserId, skillIds });
      await migrate();

      // when
      const after = await knowledgeElementRepository.findUniqByUserId({ userId: migratedUserId, skillIds });

      // then
      expect(comparable(after)).to.deep.equal(comparable(before));
      expect(after.map(({ skillId }) => skillId)).to.have.members([skillId('web', 2), skillId('web', 5)]);
    });

    it('#findUniqByUserId should only give the tubes that did not move since the limit date', async function () {
      // given
      await migrate();
      await knex('knowledge_states')
        .where({ userId: migratedUserId, tubeId: 'tube_file' })
        .update({ updatedAt: new Date('2026-03-01') });

      // when
      const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({
        userId: migratedUserId,
        limitDate: new Date('2026-02-01'),
      });

      // then
      expect(knowledgeElements.map(({ skillId }) => skillId)).to.have.members(
        [1, 2, 3, 5].map((level) => skillId('web', level)),
      );
    });

    it('#findUniqByUserIdAndCompetenceId should give the same knowledge elements as before the migration', async function () {
      // given
      const params = { userId: migratedUserId, competenceId: 'competence_1' };
      const before = await knowledgeElementRepository.findUniqByUserIdAndCompetenceId(params);
      await migrate();

      // when
      const after = await knowledgeElementRepository.findUniqByUserIdAndCompetenceId(params);

      // then
      expect(comparable(after)).to.deep.equal(comparable(before));
    });

    it('#findUniqByUserIdGroupedByCompetenceId should give the same knowledge elements as before the migration', async function () {
      // given
      const before = await knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId({ userId: migratedUserId });
      await migrate();

      // when
      const after = await knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId({ userId: migratedUserId });

      // then
      expect(Object.keys(after)).to.deep.equal(['competence_1']);
      expect(comparable(after.competence_1)).to.deep.equal(comparable(before.competence_1));
    });

    it('#findInvalidatedAndDirectByUserId should give the levels the user failed directly', async function () {
      // given
      await migrate();

      // when
      const knowledgeElements = await knowledgeElementRepository.findInvalidatedAndDirectByUserId({
        userId: migratedUserId,
      });

      // then
      expect(knowledgeElements.map(({ skillId }) => skillId)).to.deep.equal([skillId('web', 5)]);
    });

    it('#findUniqByUserIds should give the knowledge elements of migrated and other users together', async function () {
      // given
      const userIds = [otherUserId, migratedUserId];
      const before = await knowledgeElementRepository.findUniqByUserIds({ userIds });
      await migrate();

      // when
      const after = await knowledgeElementRepository.findUniqByUserIds({ userIds });

      // then
      expect(after.map(({ userId }) => userId)).to.deep.equal(userIds);
      expect(after.map(({ knowledgeElements }) => comparable(knowledgeElements))).to.deep.equal(
        before.map(({ knowledgeElements }) => comparable(knowledgeElements)),
      );
    });

    it('#findUniqByUserIdsAndSkillIds should give the same knowledge elements as before the migration', async function () {
      // given
      const params = { userIds: [otherUserId, migratedUserId], skillIds: [skillId('web', 3), skillId('file', 1)] };
      const before = await knowledgeElementRepository.findUniqByUserIdsAndSkillIds(params);
      await migrate();

      // when
      const after = await knowledgeElementRepository.findUniqByUserIdsAndSkillIds(params);

      // then
      expect(after.map(({ knowledgeElements }) => comparable(knowledgeElements))).to.deep.equal(
        before.map(({ knowledgeElements }) => comparable(knowledgeElements)),
      );
      expect(after[1].knowledgeElements).to.have.lengthOf(2);
    });

    it('#findUniqByUserIdsAndSkillIds should give nothing when no skill is requested', async function () {
      // given
      await migrate();

      // when
      const [{ knowledgeElements }] = await knowledgeElementRepository.findUniqByUserIdsAndSkillIds({
        userIds: [migratedUserId],
        skillIds: [],
      });

      // then
      expect(knowledgeElements).to.deep.equal([]);
    });

    it('should count a level once when the learning content holds several versions of its skill', async function () {
      // given
      databaseBuilder.factory.learningContent.buildSkill({
        id: 'skill_web_3_archived',
        status: 'archivé',
        tubeId: 'tube_web',
        competenceId: 'competence_1',
        level: 3,
        pixValue: 3,
      });
      await databaseBuilder.commit();
      await migrate();

      // when
      const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId: migratedUserId });
      const [archivedOnly] = await knowledgeElementRepository.findUniqByUserId({
        userId: migratedUserId,
        skillIds: ['skill_web_3_archived'],
      });

      // then
      expect(knowledgeElements.map(({ skillId }) => skillId)).to.include(skillId('web', 3));
      expect(knowledgeElements.map(({ skillId }) => skillId)).not.to.include('skill_web_3_archived');
      expect(archivedOnly).to.include({ skillId: 'skill_web_3_archived', status: VALIDATED });
    });

    it('should keep the pix earned before the migration when the learning content changed since', async function () {
      // given
      buildKnowledgeElement({
        userId: migratedUserId,
        tube: 'web',
        level: 3,
        earnedPix: 5,
        createdAt: new Date('2026-01-20'),
      });
      await databaseBuilder.commit();
      const before = await knowledgeElementRepository.findUniqByUserId({ userId: migratedUserId });
      await migrate();

      // when
      const after = await knowledgeElementRepository.findUniqByUserId({ userId: migratedUserId });

      // then
      const sumPix = (knowledgeElements) => knowledgeElements.reduce((pix, { earnedPix }) => pix + earnedPix, 0);
      expect(sumPix(before)).to.equal(11);
      expect(sumPix(after)).to.be.closeTo(11, 1e-9);
    });
  });

  describe('saving the knowledge elements of a migrated user', function () {
    const buildAnswerKnowledgeElements = (userId) => [
      new KnowledgeElement({
        userId,
        skillId: skillId('web', 4),
        competenceId: 'competence_1',
        status: VALIDATED,
        source: DIRECT,
        earnedPix: 4,
      }),
      ...[1, 2, 3].map(
        (level) =>
          new KnowledgeElement({
            userId,
            skillId: skillId('web', level),
            competenceId: 'competence_1',
            status: VALIDATED,
            source: INFERRED,
            earnedPix: level,
          }),
      ),
    ];

    it('#batchSave should update the knowledge states and the score, and insert no knowledge element', async function () {
      // given
      await migrate();
      const { count: countBefore } = await knex('knowledge-elements').count().first();

      // when
      const saved = await knowledgeElementRepository.batchSave({
        knowledgeElements: buildAnswerKnowledgeElements(migratedUserId),
      });

      // then
      const { count: countAfter } = await knex('knowledge-elements').count().first();
      const knowledgeState = await knex('knowledge_states')
        .select('floor', 'ceiling', 'directLevels')
        .where({ userId: migratedUserId, tubeId: 'tube_web' })
        .first();
      const { pix } = await knex('user_competence_scores').where({ userId: migratedUserId }).first();

      expect(countAfter).to.equal(countBefore);
      expect(knowledgeState).to.deep.equal({ floor: 4, ceiling: 5, directLevels: [3, 4, 5] });
      expect(pix).to.equal(13);
      expect(saved).to.have.lengthOf(4);
      expect(saved[0]).to.be.instanceOf(KnowledgeElement);
      expect(saved[0].createdAt).to.be.instanceOf(Date);
    });

    it('#batchSave should leave a migrated user and another one with the same knowledge', async function () {
      // given
      await migrate();

      // when
      await knowledgeElementRepository.batchSave({
        knowledgeElements: [
          ...buildAnswerKnowledgeElements(migratedUserId),
          ...buildAnswerKnowledgeElements(otherUserId),
        ],
      });

      // then
      const ofMigratedUser = await knowledgeElementRepository.findUniqByUserId({ userId: migratedUserId });
      const ofOtherUser = await knowledgeElementRepository.findUniqByUserId({ userId: otherUserId });
      const savedLevels = [1, 2, 3].map((level) => skillId('web', level));
      const withoutSource = (knowledgeElements) =>
        comparable(knowledgeElements).map(({ source, ...knowledgeElement }) =>
          savedLevels.includes(knowledgeElement.skillId) ? knowledgeElement : { source, ...knowledgeElement },
        );

      // The other user's level 3 became inferred: the repeated inferred knowledge element is their latest.
      // The migrated user's level 3 stays direct.
      expect(withoutSource(asOtherUser(ofMigratedUser))).to.deep.equal(withoutSource(ofOtherUser));
      expect(ofMigratedUser.find(({ skillId: id }) => id === skillId('web', 3)).source).to.equal(DIRECT);
    });

    it('#batchSave should not lower the score when a failure lowers the knowledge states', async function () {
      // given
      await migrate();
      const buildFailure = (level, source) =>
        new KnowledgeElement({
          userId: migratedUserId,
          skillId: skillId('web', level),
          competenceId: 'competence_1',
          status: INVALIDATED,
          source,
          earnedPix: 0,
        });

      // when
      await knowledgeElementRepository.batchSave({
        knowledgeElements: [buildFailure(2, DIRECT), buildFailure(3, INFERRED), buildFailure(4, INFERRED)],
      });

      // then
      const knowledgeState = await knex('knowledge_states')
        .select('floor', 'ceiling')
        .where({ userId: migratedUserId, tubeId: 'tube_web' })
        .first();
      const { pix } = await knex('user_competence_scores').where({ userId: migratedUserId }).first();
      const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId: migratedUserId });
      const earnedPix = knowledgeElements.reduce((sum, knowledgeElement) => sum + knowledgeElement.earnedPix, 0);

      expect(knowledgeState).to.deep.equal({ floor: 1, ceiling: 2 });
      expect(pix).to.equal(9);
      expect(earnedPix).to.be.closeTo(9, 1e-9);
    });

    it('#batchSave should forget the tubes whose knowledge is reset, and bring their competence back to zero', async function () {
      // given
      await migrate();
      const knowledgeElements = await knowledgeElementRepository.findUniqByUserIdAndCompetenceId({
        userId: migratedUserId,
        competenceId: 'competence_1',
      });

      // when
      await knowledgeElementRepository.batchSave({ knowledgeElements: knowledgeElements.map(KnowledgeElement.reset) });

      // then
      const knowledgeStates = await knex('knowledge_states').where({ userId: migratedUserId });
      const { pix } = await knex('user_competence_scores').where({ userId: migratedUserId }).first();
      const knowledgeElementsAfter = await knowledgeElementRepository.findUniqByUserId({ userId: migratedUserId });

      expect(knowledgeStates).to.deep.equal([]);
      expect(pix).to.equal(0);
      expect(knowledgeElementsAfter).to.deep.equal([]);
    });

    it('#batchSave should start the knowledge of a tube the user never met', async function () {
      // given
      await migrate();
      const knowledgeElement = new KnowledgeElement({
        userId: migratedUserId,
        skillId: skillId('mail', 1),
        competenceId: 'competence_2',
        status: VALIDATED,
        source: DIRECT,
        earnedPix: 1,
      });

      // when
      await knowledgeElementRepository.batchSave({ knowledgeElements: [knowledgeElement] });

      // then
      const userCompetenceScores = await knex('user_competence_scores')
        .select('competenceId', 'pix')
        .where({ userId: migratedUserId })
        .orderBy('competenceId');
      const knowledgeElements = await knowledgeElementRepository.findUniqByUserIdAndCompetenceId({
        userId: migratedUserId,
        competenceId: 'competence_2',
      });

      expect(userCompetenceScores).to.deep.equal([
        { competenceId: 'competence_1', pix: 9 },
        { competenceId: 'competence_2', pix: 1 },
      ]);
      expect(comparable(knowledgeElements)).to.deep.equal([
        {
          userId: migratedUserId,
          skillId: skillId('mail', 1),
          competenceId: 'competence_2',
          status: VALIDATED,
          source: DIRECT,
          earnedPix: 1,
        },
      ]);
    });
  });
});
