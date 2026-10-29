import { expect } from 'chai';

import { KnowledgeElement } from '../../../../../src/shared/domain/models/KnowledgeElement.js';
import * as migratedUserKnowledgeElementRepository from '../../../../../src/shared/infrastructure/repositories/migrated-user-knowledge-element-repository.ts';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

const { buildUser } = databaseBuilder.factory;

describe('Integration | Shared | Infrastructure | Repository | migrated-user-knowledge-element', function () {
  const { VALIDATED, RESET } = KnowledgeElement.StatusType;
  const { DIRECT } = KnowledgeElement.SourceType;
  const at = new Date('2026-02-01T10:00:00Z');

  describe('#batchSave', function () {
    it('should insert the knowledge elements dated from the save, and give them back with their id', async function () {
      // given
      const userId = buildUser().id;
      await databaseBuilder.commit();
      const knowledgeElements = [
        new KnowledgeElement({
          userId,
          skillId: 'skill_web_3',
          competenceId: 'competence_1',
          status: VALIDATED,
          source: DIRECT,
          earnedPix: 3,
          assessmentId: 10,
          answerId: 100,
          createdAt: new Date('2020-01-01'),
        }),
        new KnowledgeElement({
          userId,
          skillId: 'skill_web_2',
          competenceId: 'competence_1',
          status: RESET,
          source: DIRECT,
          earnedPix: 0,
          assessmentId: null,
          answerId: null,
        }),
      ];

      // when
      const saved = await migratedUserKnowledgeElementRepository.batchSave(knowledgeElements, at);

      // then
      const rows = await knex('migrated_user_knowledge_elements').orderBy('id');
      expect(rows.map(({ id: _id, ...row }) => row)).to.deep.equal([
        {
          source: DIRECT,
          status: VALIDATED,
          createdAt: at,
          answerId: 100,
          assessmentId: 10,
          skillId: 'skill_web_3',
          earnedPix: 3,
          userId,
          competenceId: 'competence_1',
          savedAt: null,
        },
        {
          source: DIRECT,
          status: RESET,
          createdAt: at,
          answerId: null,
          assessmentId: null,
          skillId: 'skill_web_2',
          earnedPix: 0,
          userId,
          competenceId: 'competence_1',
          savedAt: null,
        },
      ]);
      expect(saved).to.deep.equal(rows.map((row) => new KnowledgeElement(row)));
      expect(saved[0]).to.be.instanceOf(KnowledgeElement);
    });

    it('should append to the knowledge elements already saved', async function () {
      // given
      const userId = buildUser().id;
      await databaseBuilder.commit();
      const buildKnowledgeElementOf = (skillId) =>
        new KnowledgeElement({
          userId,
          skillId,
          competenceId: 'competence_1',
          status: VALIDATED,
          source: DIRECT,
          earnedPix: 2,
          assessmentId: 10,
          answerId: 100,
        });
      const [first] = await migratedUserKnowledgeElementRepository.batchSave(
        [buildKnowledgeElementOf('skill_web_1')],
        new Date('2026-01-15T10:00:00Z'),
      );

      // when
      const [second] = await migratedUserKnowledgeElementRepository.batchSave(
        [buildKnowledgeElementOf('skill_web_2')],
        at,
      );

      // then
      const rows = await knex('migrated_user_knowledge_elements').orderBy('createdAt');
      expect(rows.map((row) => new KnowledgeElement(row))).to.deep.equal([first, second]);
    });

    it('should do nothing without knowledge elements', async function () {
      // when
      const saved = await migratedUserKnowledgeElementRepository.batchSave([], at);

      // then
      expect(saved).to.deep.equal([]);
      expect(await knex('migrated_user_knowledge_elements')).to.deep.equal([]);
    });
  });
});
