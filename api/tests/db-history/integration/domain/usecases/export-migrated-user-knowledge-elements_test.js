import { CreateBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { expect } from 'chai';
import { parquetReadObjects } from 'hyparquet';
import sinon from 'sinon';

import { config } from '../../../../../config/config.js';
import { exportMigratedUserKnowledgeElements } from '../../../../../src/db-history/domain/usecases/export-migrated-user-knowledge-elements.ts';
import { usecases } from '../../../../../src/db-history/domain/usecases/index.js';
import * as migratedUserKnowledgeElementExportFileRepository from '../../../../../src/db-history/infrastructure/repositories/migrated-user-knowledge-element-export-file-repository.ts';
import * as migratedUserKnowledgeElementExportRepository from '../../../../../src/db-history/infrastructure/repositories/migrated-user-knowledge-element-export-repository.ts';
import * as migratedUserKnowledgeElementRepository from '../../../../../src/shared/infrastructure/repositories/migrated-user-knowledge-element-repository.ts';
import { S3ObjectStorageProvider } from '../../../../../src/shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';
import { knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | History-db | Domain | Use-case | export-migrated-user-knowledge-elements', function () {
  const createdAt = new Date('2026-03-01T10:00:00Z');
  const logger = { info: sinon.stub(), warn: sinon.stub(), error: sinon.stub() };

  const buildRow = (fields) => ({
    source: 'direct',
    status: 'validated',
    createdAt,
    answerId: 100,
    assessmentId: 10,
    skillId: 'skill_web_3',
    earnedPix: 3,
    userId: 123,
    competenceId: 'competence_1',
    savedAt: null,
    ...fields,
  });

  let s3Client;

  beforeEach(async function () {
    const storageClient = config.migratedUserKnowledgeElementsExport.storage.client;
    const rawS3 = new S3Client({
      credentials: { accessKeyId: storageClient.accessKeyId, secretAccessKey: storageClient.secretAccessKey },
      endpoint: storageClient.endpoint,
      region: storageClient.region,
      forcePathStyle: true,
    });
    try {
      await rawS3.send(new CreateBucketCommand({ Bucket: storageClient.bucket }));
    } catch {
      // bucket already exists
    }

    s3Client = S3ObjectStorageProvider.createClient(storageClient);
    for (const key of await uploadedKeys()) {
      await s3Client.deleteFile({ key });
    }
  });

  afterEach(async function () {
    await knex('migrated_user_knowledge_elements').delete();
    await knex('migrated_user_knowledge_elements_export_files').delete();
    logger.warn.resetHistory();
  });

  const uploadedKeys = async () => {
    const { Contents: files } = await s3Client.listFiles();
    return (files ?? []).map(({ Key }) => Key).toSorted();
  };

  const readParquet = async (key) => {
    const { Body } = await s3Client.readFile({ key });
    const bytes = await Body.transformToByteArray();
    return parquetReadObjects({ file: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) });
  };

  const exportFiles = async () =>
    knex('migrated_user_knowledge_elements_export_files')
      .select('filename', 'first_id', 'last_id', 'row_count', 'completed_at')
      .orderBy('first_id');

  const savedAtById = async () =>
    new Map(
      (await knex('migrated_user_knowledge_elements').select('id', 'savedAt')).map(({ id, savedAt }) => [id, savedAt]),
    );

  it('should export the unsaved rows in one file per page, mark them, and record the files', async function () {
    // given
    const runAt = new Date('2026-03-02T05:00:00Z');
    sinon.useFakeTimers({ now: runAt, toFake: ['Date'] });
    const alreadySavedAt = new Date('2026-02-28T03:00:00Z');
    await knex('migrated_user_knowledge_elements').insert([
      buildRow({ id: 1 }),
      buildRow({ id: 2, status: 'reset', answerId: null, assessmentId: null, earnedPix: 0 }),
      buildRow({ id: 3, skillId: 'skill_web_4', earnedPix: 4.5 }),
      buildRow({ id: 5, savedAt: alreadySavedAt }),
    ]);

    // when
    const exportedCount = await usecases.exportMigratedUserKnowledgeElements({
      batchSize: 2,
      logger,
    });

    // then
    expect(exportedCount).to.equal(3);
    expect(await uploadedKeys()).to.deep.equal([
      'migrated-user-knowledge-elements/2026/03/01/000000000001_000000000002.parquet',
      'migrated-user-knowledge-elements/2026/03/01/000000000003_000000000003.parquet',
    ]);
    expect(
      await readParquet('migrated-user-knowledge-elements/2026/03/01/000000000001_000000000002.parquet'),
    ).to.deep.equal([
      {
        id: 1n,
        source: 'direct',
        status: 'validated',
        createdAt,
        answerId: 100n,
        assessmentId: 10,
        skillId: 'skill_web_3',
        earnedPix: 3,
        userId: 123,
        competenceId: 'competence_1',
        extractedAt: '2026-03-02',
      },
      {
        id: 2n,
        source: 'direct',
        status: 'reset',
        createdAt,
        answerId: null,
        assessmentId: null,
        skillId: 'skill_web_3',
        earnedPix: 0,
        userId: 123,
        competenceId: 'competence_1',
        extractedAt: '2026-03-02',
      },
    ]);
    expect(
      (await readParquet('migrated-user-knowledge-elements/2026/03/01/000000000003_000000000003.parquet')).map(
        ({ id }) => id,
      ),
    ).to.deep.equal([3n]);

    const savedAt = await savedAtById();
    expect(savedAt.get(1)).to.deep.equal(runAt);
    expect(savedAt.get(2)).to.deep.equal(savedAt.get(1));
    expect(savedAt.get(3)).to.deep.equal(savedAt.get(1));
    expect(savedAt.get(5)).to.deep.equal(alreadySavedAt);

    expect(await exportFiles()).to.deep.equal([
      {
        filename: 'migrated-user-knowledge-elements/2026/03/01/000000000001_000000000002.parquet',
        first_id: 1,
        last_id: 2,
        row_count: 2,
        completed_at: runAt,
      },
      {
        filename: 'migrated-user-knowledge-elements/2026/03/01/000000000003_000000000003.parquet',
        first_id: 3,
        last_id: 3,
        row_count: 1,
        completed_at: runAt,
      },
    ]);
  });

  it('should put the rows of a page in one file per day of creation', async function () {
    // given
    const runAt = new Date('2026-03-03T05:00:00Z');
    sinon.useFakeTimers({ now: runAt, toFake: ['Date'] });
    // The row 3 was numbered after the row 2 but created before midnight in Paris, by a slower save.
    await knex('migrated_user_knowledge_elements').insert([
      buildRow({ id: 1, createdAt: new Date('2026-03-01T22:59:59Z') }),
      buildRow({ id: 2, createdAt: new Date('2026-03-01T23:00:01Z') }),
      buildRow({ id: 3, createdAt: new Date('2026-03-01T22:59:58Z') }),
      buildRow({ id: 4, createdAt: new Date('2026-03-02T10:00:00Z') }),
    ]);

    // when
    const exportedCount = await usecases.exportMigratedUserKnowledgeElements({ batchSize: 10, logger });

    // then
    expect(exportedCount).to.equal(4);
    expect(await uploadedKeys()).to.deep.equal([
      'migrated-user-knowledge-elements/2026/03/01/000000000001_000000000003.parquet',
      'migrated-user-knowledge-elements/2026/03/02/000000000002_000000000004.parquet',
    ]);
    expect(
      (await readParquet('migrated-user-knowledge-elements/2026/03/01/000000000001_000000000003.parquet')).map(
        ({ id }) => id,
      ),
    ).to.deep.equal([1n, 3n]);
    expect(
      (await readParquet('migrated-user-knowledge-elements/2026/03/02/000000000002_000000000004.parquet')).map(
        ({ id }) => id,
      ),
    ).to.deep.equal([2n, 4n]);
    expect(await exportFiles()).to.deep.equal([
      {
        filename: 'migrated-user-knowledge-elements/2026/03/01/000000000001_000000000003.parquet',
        first_id: 1,
        last_id: 3,
        row_count: 2,
        completed_at: runAt,
      },
      {
        filename: 'migrated-user-knowledge-elements/2026/03/02/000000000002_000000000004.parquet',
        first_id: 2,
        last_id: 4,
        row_count: 2,
        completed_at: runAt,
      },
    ]);
  });

  it('should export nothing when every row is exported', async function () {
    // given
    await knex('migrated_user_knowledge_elements').insert([
      buildRow({ id: 1, savedAt: new Date('2026-03-01T03:00:00Z') }),
    ]);

    // when
    const exportedCount = await usecases.exportMigratedUserKnowledgeElements({
      batchSize: 2,
      logger,
    });

    // then
    expect(exportedCount).to.equal(0);
    expect(await uploadedKeys()).to.deep.equal([]);
    expect(await exportFiles()).to.deep.equal([]);
  });

  it('should write again the files left incomplete by a previous run before exporting the other rows', async function () {
    // given
    const runAt = new Date('2026-03-02T05:00:00Z');
    sinon.useFakeTimers({ now: runAt, toFake: ['Date'] });
    const previousRunAt = new Date('2026-03-01T05:00:00Z');
    await knex('migrated_user_knowledge_elements').insert([
      buildRow({ id: 1, savedAt: previousRunAt }),
      buildRow({ id: 2 }),
      buildRow({ id: 3, createdAt: new Date('2026-03-01T23:00:01Z') }),
      buildRow({ id: 4 }),
      buildRow({ id: 6 }),
    ]);
    // A run with pages of three rows stopped after the upload of the file of the rows 2 and 4, before their
    // marking. The row 3, created the day after, was in another file, not recorded yet.
    await knex('migrated_user_knowledge_elements_export_files').insert([
      {
        filename: 'migrated-user-knowledge-elements/2026/03/01/000000000001_000000000001.parquet',
        day: '2026-03-01',
        first_id: 1,
        last_id: 1,
        row_count: 1,
        completed_at: previousRunAt,
      },
      {
        filename: 'migrated-user-knowledge-elements/2026/03/01/000000000002_000000000004.parquet',
        day: '2026-03-01',
        first_id: 2,
        last_id: 4,
        row_count: 3,
        completed_at: null,
      },
    ]);
    await migratedUserKnowledgeElementExportRepository.sendFile(
      'migrated-user-knowledge-elements/2026/03/01/000000000002_000000000004.parquet',
      new ArrayBuffer(0),
    );

    // when
    const exportedCount = await usecases.exportMigratedUserKnowledgeElements({ batchSize: 2, logger });

    // then
    expect(exportedCount).to.equal(4);
    expect(await uploadedKeys()).to.deep.equal([
      'migrated-user-knowledge-elements/2026/03/01/000000000002_000000000004.parquet',
      'migrated-user-knowledge-elements/2026/03/01/000000000006_000000000006.parquet',
      'migrated-user-knowledge-elements/2026/03/02/000000000003_000000000003.parquet',
    ]);
    expect(
      (await readParquet('migrated-user-knowledge-elements/2026/03/01/000000000002_000000000004.parquet')).map(
        ({ id }) => id,
      ),
    ).to.deep.equal([2n, 4n]);
    expect(await exportFiles()).to.deep.equal([
      {
        filename: 'migrated-user-knowledge-elements/2026/03/01/000000000001_000000000001.parquet',
        first_id: 1,
        last_id: 1,
        row_count: 1,
        completed_at: previousRunAt,
      },
      {
        filename: 'migrated-user-knowledge-elements/2026/03/01/000000000002_000000000004.parquet',
        first_id: 2,
        last_id: 4,
        row_count: 2,
        completed_at: runAt,
      },
      {
        filename: 'migrated-user-knowledge-elements/2026/03/02/000000000003_000000000003.parquet',
        first_id: 3,
        last_id: 3,
        row_count: 1,
        completed_at: runAt,
      },
      {
        filename: 'migrated-user-knowledge-elements/2026/03/01/000000000006_000000000006.parquet',
        first_id: 6,
        last_id: 6,
        row_count: 1,
        completed_at: runAt,
      },
    ]);
    const savedAt = await savedAtById();
    expect([2, 3, 4, 6].map((id) => savedAt.get(id))).to.deep.equal([runAt, runAt, runAt, runAt]);
    expect(logger.warn).to.have.been.calledOnceWithExactly(
      'Export file migrated-user-knowledge-elements/2026/03/01/000000000002_000000000004.parquet was not completed by a previous run: written again',
    );
  });

  it('should leave the file of a page whose rows could not be marked recorded as incomplete, and fail', async function () {
    // given
    await knex('migrated_user_knowledge_elements').insert([buildRow({ id: 1 })]);
    const markingError = new Error('marking failed');

    // when
    const error = await catchErr(exportMigratedUserKnowledgeElements)({
      batchSize: 2,
      migratedUserKnowledgeElementRepository: {
        ...migratedUserKnowledgeElementRepository,
        markSaved: sinon.stub().rejects(markingError),
      },
      migratedUserKnowledgeElementExportFileRepository,
      migratedUserKnowledgeElementExportRepository,
      logger,
    });

    // then
    expect(error).to.equal(markingError);
    expect(await uploadedKeys()).to.deep.equal([
      'migrated-user-knowledge-elements/2026/03/01/000000000001_000000000001.parquet',
    ]);
    expect(await exportFiles()).to.deep.equal([
      {
        filename: 'migrated-user-knowledge-elements/2026/03/01/000000000001_000000000001.parquet',
        first_id: 1,
        last_id: 1,
        row_count: 1,
        completed_at: null,
      },
    ]);
    expect((await savedAtById()).get(1)).to.be.null;
  });

  it('should upload no file holding a row created on another day, in Paris time, than the day of the file, and fail', async function () {
    // given
    await knex('migrated_user_knowledge_elements').insert([buildRow({ id: 1 })]);
    await knex('migrated_user_knowledge_elements_export_files').insert({
      filename: 'migrated-user-knowledge-elements/2026/03/01/000000000001_000000000001.parquet',
      day: '2026-03-01',
      first_id: 1,
      last_id: 1,
      row_count: 1,
      completed_at: null,
    });
    // 23:00:00Z on March 1st is midnight on March 2nd in Paris.
    const strayRow = buildRow({ id: 1, createdAt: new Date('2026-03-01T23:00:00Z') });

    // when
    const error = await catchErr(exportMigratedUserKnowledgeElements)({
      batchSize: 2,
      migratedUserKnowledgeElementRepository: {
        ...migratedUserKnowledgeElementRepository,
        findUnsavedInRange: sinon.stub().resolves([strayRow]),
      },
      migratedUserKnowledgeElementExportFileRepository,
      migratedUserKnowledgeElementExportRepository,
      logger,
    });

    // then
    expect(error.message).to.equal(
      'The knowledge element 1, created on 2026-03-02, cannot go to the file migrated-user-knowledge-elements/2026/03/01/000000000001_000000000001.parquet of 2026-03-01',
    );
    expect(await uploadedKeys()).to.deep.equal([]);
    expect((await exportFiles()).map(({ completed_at }) => completed_at)).to.deep.equal([null]);
    expect((await savedAtById()).get(1)).to.be.null;
  });
});
