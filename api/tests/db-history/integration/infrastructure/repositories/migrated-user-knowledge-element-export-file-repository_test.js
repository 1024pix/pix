import { expect } from 'chai';

import * as migratedUserKnowledgeElementExportFileRepository from '../../../../../src/db-history/infrastructure/repositories/migrated-user-knowledge-element-export-file-repository.ts';
import { knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | History-db | Infrastructure | Repository | migrated-user-knowledge-element-export-file', function () {
  const fileOfDay = (name) => `migrated-user-knowledge-elements/2026/03/01/${name}.parquet`;

  const buildRow = (fields) => ({
    filename: 'migrated-user-knowledge-elements/2026/03/01/000000000001_000000000002.parquet',
    day: '2026-03-01',
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
        'migrated-user-knowledge-elements/2026/03/01/000000000001_000000000002.parquet',
        '2026-03-01',
        1,
        2,
        2,
      );

      // then
      const rows = await knex('migrated_user_knowledge_elements_export_files');
      expect(rows).to.deep.equal([buildRow({ id: file.id, created_at: file.createdAt })]);
      expect(file).to.deep.equal({
        id: file.id,
        filename: 'migrated-user-knowledge-elements/2026/03/01/000000000001_000000000002.parquet',
        day: '2026-03-01',
        firstId: 1,
        lastId: 2,
        rowCount: 2,
        createdAt: file.createdAt,
        completedAt: null,
      });
      expect(file.createdAt).to.be.a('date');
    });
  });

  describe('#create with a name out of the partition of its day', function () {
    it('should refuse the file', async function () {
      // when
      const error = await catchErr(migratedUserKnowledgeElementExportFileRepository.create)(
        'migrated-user-knowledge-elements/2026/03/02/000000000001_000000000002.parquet',
        '2026-03-01',
        1,
        2,
        2,
      );

      // then
      expect(error.message).to.contain('migrated_user_knowledge_elements_export_files_filename_in_day');
      expect(await knex('migrated_user_knowledge_elements_export_files')).to.deep.equal([]);
    });
  });

  describe('#findPending', function () {
    it('should give the files not completed, by ascending day then first id', async function () {
      // given
      await knex('migrated_user_knowledge_elements_export_files').insert([
        buildRow({ filename: fileOfDay('a'), first_id: 5, last_id: 6 }),
        buildRow({ filename: fileOfDay('b'), first_id: 1, last_id: 2, completed_at: new Date('2026-03-02T05:00:00Z') }),
        buildRow({ filename: fileOfDay('c'), first_id: 3, last_id: 4 }),
        buildRow({
          filename: 'migrated-user-knowledge-elements/2026/02/28/d.parquet',
          day: '2026-02-28',
          first_id: 7,
          last_id: 8,
        }),
      ]);

      // when
      const files = await migratedUserKnowledgeElementExportFileRepository.findPending();

      // then
      expect(files.map(({ filename }) => filename)).to.deep.equal([
        'migrated-user-knowledge-elements/2026/02/28/d.parquet',
        fileOfDay('c'),
        fileOfDay('a'),
      ]);
      expect(files[1]).to.deep.include({
        filename: fileOfDay('c'),
        day: '2026-03-01',
        firstId: 3,
        lastId: 4,
        rowCount: 2,
        completedAt: null,
      });
      expect(files[1].createdAt).to.be.a('date');
    });
  });

  describe('#complete', function () {
    it('should set the date of the completion and the number of rows of the file only', async function () {
      // given
      const [{ id }] = await knex('migrated_user_knowledge_elements_export_files')
        .insert([
          buildRow({ filename: fileOfDay('a') }),
          buildRow({ filename: fileOfDay('b'), first_id: 3, last_id: 4 }),
        ])
        .returning('id');
      const at = new Date('2026-03-02T05:00:00Z');

      // when
      await migratedUserKnowledgeElementExportFileRepository.complete(id, 3, at);

      // then
      const files = await knex('migrated_user_knowledge_elements_export_files')
        .select('filename', 'row_count', 'completed_at')
        .orderBy('filename');
      expect(files).to.deep.equal([
        { filename: fileOfDay('a'), row_count: 3, completed_at: at },
        { filename: fileOfDay('b'), row_count: 2, completed_at: null },
      ]);
    });
  });
});
