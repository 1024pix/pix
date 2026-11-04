import { expect } from 'chai';

import * as migratedUserKnowledgeElementExportFileRepository from '../../../../../src/db-history/infrastructure/repositories/migrated-user-knowledge-element-export-file-repository.ts';
import { knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | History-db | Infrastructure | Repository | migrated-user-knowledge-element-export-file', function () {
  const buildRow = (fields) => ({
    filename: 'migrated-user-knowledge-elements/000000000001_000000000002.parquet',
    first_id: 1,
    last_id: 2,
    row_count: 2,
    completed_at: null,
    ...fields,
  });

  afterEach(async function () {
    await knex('migrated_user_knowledge_elements_export_files').delete();
  });

  describe('#create', function () {
    it('should record the file, not completed, and give it back with its id', async function () {
      // when
      const file = await migratedUserKnowledgeElementExportFileRepository.create(
        'migrated-user-knowledge-elements/000000000001_000000000002.parquet',
        1,
        2,
        2,
      );

      // then
      const rows = await knex('migrated_user_knowledge_elements_export_files');
      expect(rows).to.deep.equal([buildRow({ id: file.id, created_at: file.createdAt })]);
      expect(file).to.deep.equal({
        id: file.id,
        filename: 'migrated-user-knowledge-elements/000000000001_000000000002.parquet',
        firstId: 1,
        lastId: 2,
        rowCount: 2,
        createdAt: file.createdAt,
        completedAt: null,
      });
      expect(file.createdAt).to.be.a('date');
    });
  });

  describe('#findPending', function () {
    it('should give the files not completed, by ascending first id', async function () {
      // given
      await knex('migrated_user_knowledge_elements_export_files').insert([
        buildRow({ filename: 'a', first_id: 5, last_id: 6 }),
        buildRow({ filename: 'b', first_id: 1, last_id: 2, completed_at: new Date('2026-03-02T05:00:00Z') }),
        buildRow({ filename: 'c', first_id: 3, last_id: 4 }),
      ]);

      // when
      const files = await migratedUserKnowledgeElementExportFileRepository.findPending();

      // then
      expect(files.map(({ filename }) => filename)).to.deep.equal(['c', 'a']);
      expect(files[0]).to.deep.include({ filename: 'c', firstId: 3, lastId: 4, rowCount: 2, completedAt: null });
      expect(files[0].createdAt).to.be.a('date');
    });
  });

  describe('#complete', function () {
    it('should set the date of the completion and the number of rows of the file only', async function () {
      // given
      const [{ id }] = await knex('migrated_user_knowledge_elements_export_files')
        .insert([buildRow({ filename: 'a' }), buildRow({ filename: 'b', first_id: 3, last_id: 4 })])
        .returning('id');
      const at = new Date('2026-03-02T05:00:00Z');

      // when
      await migratedUserKnowledgeElementExportFileRepository.complete(id, 3, at);

      // then
      const files = await knex('migrated_user_knowledge_elements_export_files')
        .select('filename', 'row_count', 'completed_at')
        .orderBy('filename');
      expect(files).to.deep.equal([
        { filename: 'a', row_count: 3, completed_at: at },
        { filename: 'b', row_count: 2, completed_at: null },
      ]);
    });

    it('should refuse to complete a file again', async function () {
      // given
      const completedAt = new Date('2026-03-02T05:00:00Z');
      const [{ id }] = await knex('migrated_user_knowledge_elements_export_files')
        .insert(buildRow({ filename: 'a', completed_at: completedAt }))
        .returning('id');

      // when
      const error = await catchErr(migratedUserKnowledgeElementExportFileRepository.complete)(
        id,
        0,
        new Date('2026-03-03T05:00:00Z'),
      );

      // then
      expect(error.message).to.equal(`The export file ${id} is unknown or already completed`);
      const [file] = await knex('migrated_user_knowledge_elements_export_files').select('row_count', 'completed_at');
      expect(file).to.deep.equal({ row_count: 2, completed_at: completedAt });
    });
  });
});
