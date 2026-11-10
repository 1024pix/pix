import { expect } from 'chai';
import type { Knex } from 'knex';

import { KnowledgeElement } from '../../../../../src/shared/domain/models/KnowledgeElement.js';
import type { MigratedUserKnowledgeElementRow } from '../../../../../src/shared/infrastructure/repositories/migrated-user-knowledge-element-repository.ts';
import * as migratedUserKnowledgeElementRepository from '../../../../../src/shared/infrastructure/repositories/migrated-user-knowledge-element-repository.ts';
import { databaseBuilder, knex as untypedKnex } from '../../../../tooling/databases.js';

const { buildUser } = databaseBuilder.factory;

describe('Integration | Shared | Infrastructure | Repository | migrated-user-knowledge-element', function () {
  const { VALIDATED, RESET } = KnowledgeElement.StatusType;
  const { DIRECT } = KnowledgeElement.SourceType;
  const at = new Date('2026-02-01T10:00:00Z');

  const knex = untypedKnex as Knex;
  const migratedUserKnowledgeElements = () => knex<MigratedUserKnowledgeElementRow>('migrated_user_knowledge_elements');

  const buildRow = (fields: Partial<MigratedUserKnowledgeElementRow>) => ({
    source: DIRECT,
    status: VALIDATED,
    createdAt: new Date('2026-03-01T10:00:00Z'),
    answerId: 100,
    assessmentId: 10,
    skillId: 'skill_web_3',
    earnedPix: 3,
    userId: 123,
    competenceId: 'competence_1',
    savedAt: null,
    ...fields,
  });

  afterEach(async function () {
    await migratedUserKnowledgeElements().delete();
  });

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
      const rows = await migratedUserKnowledgeElements().orderBy('id');
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
      const buildKnowledgeElementOf = (skillId: string) =>
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
      const rows = await migratedUserKnowledgeElements().orderBy('createdAt');
      expect(rows.map((row) => new KnowledgeElement(row))).to.deep.equal([first, second]);
    });

    it('should do nothing without knowledge elements', async function () {
      // when
      const saved = await migratedUserKnowledgeElementRepository.batchSave([], at);

      // then
      expect(saved).to.deep.equal([]);
      expect(await migratedUserKnowledgeElements()).to.deep.equal([]);
    });
  });

  describe('#findUnsaved', function () {
    it('should give the unsaved rows after the id, by ascending id, up to the limit', async function () {
      // given
      await migratedUserKnowledgeElements().insert([
        buildRow({ id: 1 }),
        buildRow({ id: 2, savedAt: new Date('2026-03-01T12:00:00Z') }),
        buildRow({ id: 3, savedAt: new Date('2026-03-01T12:00:00Z') }),
        buildRow({ id: 5 }),
        buildRow({ id: 4 }),
        buildRow({ id: 6 }),
      ]);

      // when
      const rows = await migratedUserKnowledgeElementRepository.findUnsaved(1, 2);

      // then
      expect(rows.map(({ id }) => id)).to.deep.equal([4, 5]);
      expect(rows[0]).to.deep.equal(buildRow({ id: 4 }));
    });
  });

  describe('#findUnsavedInRange', function () {
    it('should give the unsaved rows whose id is in the range and created in the period, by ascending id', async function () {
      // given
      await migratedUserKnowledgeElements().insert([
        buildRow({ id: 1 }),
        buildRow({ id: 2, createdAt: new Date('2026-02-28T23:00:00Z') }),
        buildRow({ id: 3, savedAt: new Date('2026-03-01T12:00:00Z') }),
        buildRow({ id: 5, createdAt: new Date('2026-03-01T22:59:59Z') }),
        buildRow({ id: 4 }),
        buildRow({ id: 6 }),
        buildRow({ id: 7, createdAt: new Date('2026-02-28T22:59:59Z') }),
        buildRow({ id: 8, createdAt: new Date('2026-03-01T23:00:00Z') }),
      ]);

      // when
      const rows = await migratedUserKnowledgeElementRepository.findUnsavedInRange(
        2,
        8,
        new Date('2026-02-28T23:00:00Z'),
        new Date('2026-03-01T23:00:00Z'),
      );

      // then
      expect(rows.map(({ id }) => id)).to.deep.equal([2, 4, 5, 6]);
      expect(rows[1]).to.deep.equal(buildRow({ id: 4 }));
    });
  });

  describe('#setSavedAt', function () {
    it('should set no date without ids', async function () {
      // given
      await migratedUserKnowledgeElements().insert([buildRow({ id: 1 })]);

      // when
      await migratedUserKnowledgeElementRepository.setSavedAt([], new Date('2026-03-02T03:00:00Z'));

      // then
      expect(await migratedUserKnowledgeElements().pluck('savedAt')).to.deep.equal([null]);
    });

    it('should set the date of the save on the given rows only', async function () {
      // given
      const savedAt = new Date('2026-03-02T03:00:00Z');
      await migratedUserKnowledgeElements().insert([buildRow({ id: 1 }), buildRow({ id: 2 }), buildRow({ id: 3 })]);

      // when
      await migratedUserKnowledgeElementRepository.setSavedAt([1, 3], savedAt);

      // then
      const rows = await migratedUserKnowledgeElements().select('id', 'savedAt').orderBy('id');
      expect(rows).to.deep.equal([
        { id: 1, savedAt },
        { id: 2, savedAt: null },
        { id: 3, savedAt },
      ]);
    });
  });
});
