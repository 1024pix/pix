import { expect } from 'chai';

import { KnowledgeElement } from '../../../../../src/shared/domain/models/KnowledgeElement.js';
import * as knowledgeElementFromKnowledgeStatesRepository from '../../../../../src/shared/infrastructure/repositories/knowledge-element-from-knowledge-states-repository.ts';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

const { buildKnowledgeState, buildUser, buildUserCompetenceScore, learningContent } = databaseBuilder.factory;

describe('Integration | Shared | Infrastructure | Repository | knowledge-element-from-knowledge-states', function () {
  const { VALIDATED, INVALIDATED, RESET } = KnowledgeElement.StatusType;
  const { DIRECT, INFERRED } = KnowledgeElement.SourceType;

  const skillId = (tube, level) => `skill_${tube}_${level}`;

  const buildTube = (tube, competenceId, levels, { status = 'actif', version = 1, suffix = '' } = {}) =>
    levels.forEach((level) =>
      learningContent.buildSkill({
        id: `${skillId(tube, level)}${suffix}`,
        name: `@${tube}${level}`,
        status,
        version,
        tubeId: `tube_${tube}`,
        competenceId,
        level,
        pixValue: level,
      }),
    );

  const comparable = (knowledgeElements) =>
    knowledgeElements
      .map(({ skillId, status, source, earnedPix }) => ({ skillId, status, source, earnedPix }))
      .toSorted((a, b) => a.skillId.localeCompare(b.skillId));

  const buildKnowledgeElement = ({ userId, tube, level, status = VALIDATED, source = DIRECT }) =>
    new KnowledgeElement({
      userId,
      skillId: skillId(tube, level),
      competenceId: tube === 'mail' ? 'competence_2' : 'competence_1',
      status,
      source,
      earnedPix: status === VALIDATED ? level : 0,
    });

  let userId;

  beforeEach(async function () {
    buildTube('web', 'competence_1', [1, 2, 3, 4, 5]);
    buildTube('file', 'competence_1', [1, 2, 3]);
    buildTube('mail', 'competence_2', [1, 2, 3]);
    userId = buildUser().id;
    await databaseBuilder.commit();
  });

  describe('#findUniqByUserId', function () {
    it('should date the validated knowledge elements from the last move of the tube and the invalidated ones from its latest failure', async function () {
      // given
      const updatedAt = new Date('2026-01-10');
      const ceilingAt = new Date('2026-01-05');
      buildKnowledgeState({
        userId,
        tubeId: 'tube_web',
        floor: 2,
        ceiling: 4,
        ceilingAt,
        directLevels: [2, 4],
        updatedAt,
      });
      await databaseBuilder.commit();

      // when
      const knowledgeElements = await knowledgeElementFromKnowledgeStatesRepository.findUniqByUserId(userId);

      // then
      const createdAtBySkillId = new Map(knowledgeElements.map(({ skillId, createdAt }) => [skillId, createdAt]));
      expect(createdAtBySkillId.get(skillId('web', 2))).to.deep.equal(updatedAt);
      expect(createdAtBySkillId.get(skillId('web', 4))).to.deep.equal(ceilingAt);
    });

    it('should give an empty array to a user without knowledge states', async function () {
      // when
      const knowledgeElements = await knowledgeElementFromKnowledgeStatesRepository.findUniqByUserId(userId);

      // then
      expect(knowledgeElements).to.deep.equal([]);
    });

    it('should only give the requested skills', async function () {
      // given
      buildKnowledgeState({ userId, tubeId: 'tube_web', floor: 3, directLevels: [3] });
      buildKnowledgeState({ userId, tubeId: 'tube_file', floor: 2, directLevels: [2] });
      await databaseBuilder.commit();

      // when
      const knowledgeElements = await knowledgeElementFromKnowledgeStatesRepository.findUniqByUserId(userId, [
        skillId('web', 2),
        skillId('web', 5),
        skillId('file', 1),
      ]);

      // then
      expect(knowledgeElements.map(({ skillId }) => skillId)).to.have.members([skillId('web', 2), skillId('file', 1)]);
    });

    it('should count a level once when the learning content holds several versions of its skill', async function () {
      // given: level 2 of web has an archived version next to the active one
      buildTube('web', 'competence_1', [2], { status: 'archivé', version: 0, suffix: '_old' });
      buildKnowledgeState({ userId, tubeId: 'tube_web', floor: 2, directLevels: [2] });
      await databaseBuilder.commit();

      // when
      const knowledgeElements = await knowledgeElementFromKnowledgeStatesRepository.findUniqByUserId(userId);

      // then
      expect(knowledgeElements.map(({ skillId }) => skillId)).to.have.members([skillId('web', 1), skillId('web', 2)]);
    });

    it('should give every requested version of a skill', async function () {
      // given
      buildTube('web', 'competence_1', [2], { status: 'archivé', version: 0, suffix: '_old' });
      buildKnowledgeState({ userId, tubeId: 'tube_web', floor: 2, directLevels: [2] });
      await databaseBuilder.commit();

      // when
      const knowledgeElements = await knowledgeElementFromKnowledgeStatesRepository.findUniqByUserId(userId, [
        skillId('web', 2),
        `${skillId('web', 2)}_old`,
      ]);

      // then
      expect(knowledgeElements.map(({ skillId }) => skillId)).to.have.members([
        skillId('web', 2),
        `${skillId('web', 2)}_old`,
      ]);
    });

    it('should only give the tubes that did not move since the limit date', async function () {
      // given
      buildKnowledgeState({
        userId,
        tubeId: 'tube_web',
        floor: 3,
        directLevels: [3],
        updatedAt: new Date('2026-01-10'),
      });
      buildKnowledgeState({
        userId,
        tubeId: 'tube_file',
        floor: 2,
        directLevels: [2],
        updatedAt: new Date('2026-01-20'),
      });
      await databaseBuilder.commit();

      // when
      const knowledgeElements = await knowledgeElementFromKnowledgeStatesRepository.findUniqByUserId(
        userId,
        [],
        new Date('2026-01-15'),
      );

      // then
      expect(knowledgeElements.map(({ skillId }) => skillId)).to.have.members([
        skillId('web', 1),
        skillId('web', 2),
        skillId('web', 3),
      ]);
    });

    it('should give the knowledge elements the pix of the stored score of their competence', async function () {
      // given: the two validated levels of web are worth 3 pix today, the user earned 6 on the competence
      buildKnowledgeState({ userId, tubeId: 'tube_web', floor: 2, directLevels: [2] });
      buildUserCompetenceScore({ userId, competenceId: 'competence_1', pix: 6 });
      await databaseBuilder.commit();

      // when
      const knowledgeElements = await knowledgeElementFromKnowledgeStatesRepository.findUniqByUserId(userId);

      // then
      expect(comparable(knowledgeElements)).to.deep.equal([
        { skillId: skillId('web', 1), status: VALIDATED, source: INFERRED, earnedPix: 2 },
        { skillId: skillId('web', 2), status: VALIDATED, source: DIRECT, earnedPix: 4 },
      ]);
    });
  });

  describe('#findUniqByUserIds', function () {
    it('should give the knowledge elements the knowledge states of each user describe', async function () {
      // given: web is known up to level 2 and failed from level 4, file was never met
      const otherUserId = buildUser().id;
      const updatedAt = new Date('2026-01-10');
      const ceilingAt = new Date('2026-01-05');
      buildKnowledgeState({
        userId,
        tubeId: 'tube_web',
        floor: 2,
        ceiling: 4,
        ceilingAt,
        directLevels: [2, 4],
        updatedAt,
      });
      buildKnowledgeState({
        userId: otherUserId,
        tubeId: 'tube_mail',
        floor: 1,
        directLevels: [1],
      });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsByUserId = await knowledgeElementFromKnowledgeStatesRepository.findUniqByUserIds([
        userId,
        otherUserId,
      ]);

      // then
      expect([...knowledgeElementsByUserId.keys()]).to.deep.equal([userId, otherUserId]);
      const knowledgeElements = knowledgeElementsByUserId.get(userId);
      expect(comparable(knowledgeElements)).to.deep.equal([
        { skillId: skillId('web', 1), status: VALIDATED, source: INFERRED, earnedPix: 1 },
        { skillId: skillId('web', 2), status: VALIDATED, source: DIRECT, earnedPix: 2 },
        { skillId: skillId('web', 4), status: INVALIDATED, source: DIRECT, earnedPix: 0 },
        { skillId: skillId('web', 5), status: INVALIDATED, source: INFERRED, earnedPix: 0 },
      ]);
      expect(knowledgeElements[0]).to.be.instanceOf(KnowledgeElement);
      expect(knowledgeElements[0]).to.include({
        id: null,
        answerId: null,
        assessmentId: null,
        userId,
        competenceId: 'competence_1',
      });
      expect(comparable(knowledgeElementsByUserId.get(otherUserId))).to.deep.equal([
        { skillId: skillId('mail', 1), status: VALIDATED, source: DIRECT, earnedPix: 1 },
      ]);
    });

    it('should give an empty map for no user', async function () {
      // when
      const knowledgeElementsByUserId = await knowledgeElementFromKnowledgeStatesRepository.findUniqByUserIds([]);

      // then
      expect(knowledgeElementsByUserId).to.deep.equal(new Map());
    });
  });

  describe('#batchSave', function () {
    const at = new Date('2026-02-01T10:00:00Z');

    it('should move the knowledge states and the scores with the knowledge elements, and insert no knowledge element', async function () {
      // given: web is known up to level 2, the user validates level 3 and meets file on level 1
      buildKnowledgeState({
        userId,
        tubeId: 'tube_web',
        floor: 2,
        directLevels: [2],
        updatedAt: new Date('2026-01-10'),
      });
      buildUserCompetenceScore({ userId, competenceId: 'competence_1', pix: 3 });
      await databaseBuilder.commit();
      const knowledgeElements = [
        buildKnowledgeElement({ userId, tube: 'web', level: 3 }),
        buildKnowledgeElement({ userId, tube: 'file', level: 1 }),
      ];

      // when
      const saved = await knowledgeElementFromKnowledgeStatesRepository.batchSave(knowledgeElements, at);

      // then
      const knowledgeStates = await knex('knowledge_states')
        .select('tubeId', 'floor', 'ceiling', 'directLevels', 'updatedAt')
        .where({ userId })
        .orderBy('tubeId');
      const { pix } = await knex('user_competence_scores').where({ userId, competenceId: 'competence_1' }).first();
      expect(knowledgeStates).to.deep.equal([
        { tubeId: 'tube_file', floor: 1, ceiling: null, directLevels: [1], updatedAt: at },
        { tubeId: 'tube_web', floor: 3, ceiling: null, directLevels: [2, 3], updatedAt: at },
      ]);
      expect(pix).to.equal(7);
      expect(await knex('knowledge-elements')).to.deep.equal([]);
      expect(saved).to.have.lengthOf(2);
      expect(saved[0]).to.be.instanceOf(KnowledgeElement);
      expect(saved[0]).to.include({ id: undefined, skillId: skillId('web', 3), createdAt: at });
    });

    it('should date the ceiling from a failure', async function () {
      // given
      buildKnowledgeState({
        userId,
        tubeId: 'tube_web',
        floor: 2,
        directLevels: [2],
        updatedAt: new Date('2026-01-10'),
      });
      await databaseBuilder.commit();

      // when
      await knowledgeElementFromKnowledgeStatesRepository.batchSave(
        [buildKnowledgeElement({ userId, tube: 'web', level: 4, status: INVALIDATED })],
        at,
      );

      // then
      const knowledgeState = await knex('knowledge_states')
        .select('floor', 'ceiling', 'ceilingAt', 'directLevels')
        .where({ userId, tubeId: 'tube_web' })
        .first();
      expect(knowledgeState).to.deep.equal({ floor: 2, ceiling: 4, ceilingAt: at, directLevels: [2, 4] });
    });

    it('should not lower the score when a failure lowers the knowledge states', async function () {
      // given: web is known up to level 3 and the user earned 6 on the competence
      buildKnowledgeState({ userId, tubeId: 'tube_web', floor: 3, directLevels: [3] });
      buildUserCompetenceScore({ userId, competenceId: 'competence_1', pix: 6 });
      await databaseBuilder.commit();

      // when: the user fails level 2, which it had only inferred
      await knowledgeElementFromKnowledgeStatesRepository.batchSave(
        [buildKnowledgeElement({ userId, tube: 'web', level: 2, status: INVALIDATED })],
        at,
      );

      // then
      const { pix } = await knex('user_competence_scores').where({ userId, competenceId: 'competence_1' }).first();
      expect(pix).to.equal(6);
    });

    it('should forget the tubes whose knowledge is reset, and score their competence again from what remains', async function () {
      // given
      buildKnowledgeState({ userId, tubeId: 'tube_web', floor: 3, directLevels: [3] });
      buildKnowledgeState({ userId, tubeId: 'tube_file', floor: 2, directLevels: [2] });
      buildUserCompetenceScore({ userId, competenceId: 'competence_1', pix: 12 });
      await databaseBuilder.commit();

      // when
      await knowledgeElementFromKnowledgeStatesRepository.batchSave(
        [1, 2, 3].map((level) => buildKnowledgeElement({ userId, tube: 'web', level, status: RESET })),
        at,
      );

      // then
      const tubeIds = await knex('knowledge_states').where({ userId }).pluck('tubeId');
      const { pix } = await knex('user_competence_scores').where({ userId, competenceId: 'competence_1' }).first();
      expect(tubeIds).to.deep.equal(['tube_file']);
      expect(pix).to.equal(3);
    });

    it('should do nothing without knowledge elements', async function () {
      // when
      const saved = await knowledgeElementFromKnowledgeStatesRepository.batchSave([], at);

      // then
      expect(saved).to.deep.equal([]);
      expect(await knex('knowledge_states')).to.deep.equal([]);
    });
  });
});
