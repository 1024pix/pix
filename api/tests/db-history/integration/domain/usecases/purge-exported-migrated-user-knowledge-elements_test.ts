import { expect } from 'chai';
import type { Knex } from 'knex';
import sinon from 'sinon';

import { purgeExportedMigratedUserKnowledgeElements } from '../../../../../src/db-history/domain/usecases/purge-exported-migrated-user-knowledge-elements.ts';
import { KnowledgeElement } from '../../../../../src/shared/domain/models/KnowledgeElement.js';
import type { MigratedUserKnowledgeElementRow } from '../../../../../src/shared/infrastructure/repositories/migrated-user-knowledge-element-repository.ts';
import * as migratedUserKnowledgeElementRepository from '../../../../../src/shared/infrastructure/repositories/migrated-user-knowledge-element-repository.ts';
import { knex as untypedKnex } from '../../../../tooling/databases.js';

describe('Integration | History-db | Domain | Use-case | purge-exported-migrated-user-knowledge-elements', function () {
  const now = new Date('2026-03-10T04:00:00Z');
  const retentionDays = 7;
  const logger = { info: sinon.stub() };

  const knex = untypedKnex as Knex;
  const migratedUserKnowledgeElements = () => knex<MigratedUserKnowledgeElementRow>('migrated_user_knowledge_elements');

  const buildRow = (fields: Partial<MigratedUserKnowledgeElementRow>) => ({
    source: KnowledgeElement.SourceType.DIRECT,
    status: KnowledgeElement.StatusType.VALIDATED,
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

  beforeEach(function () {
    sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(async function () {
    await migratedUserKnowledgeElements().delete();
    logger.info.resetHistory();
  });

  it('should delete the rows exported more than n days ago', async function () {
    // given
    await migratedUserKnowledgeElements().insert([
      buildRow({ id: 1, savedAt: new Date('2026-03-03T03:59:59Z') }),
      buildRow({ id: 2, savedAt: new Date('2026-03-03T04:00:00Z') }),
      buildRow({ id: 3, savedAt: new Date('2026-03-09T01:00:00Z') }),
    ]);

    // when
    await purgeExportedMigratedUserKnowledgeElements({
      retentionDays,
      batchSize: 10,
      migratedUserKnowledgeElementRepository,
      logger,
    });

    // then
    expect(await migratedUserKnowledgeElements().pluck('id').orderBy('id')).to.deep.equal([2, 3]);
  });

  it('should keep the rows not exported yet, however old', async function () {
    // given
    await migratedUserKnowledgeElements().insert([
      buildRow({ id: 1, createdAt: new Date('2025-01-01T10:00:00Z'), savedAt: null }),
    ]);

    // when
    await purgeExportedMigratedUserKnowledgeElements({
      retentionDays,
      batchSize: 10,
      migratedUserKnowledgeElementRepository,
      logger,
    });

    // then
    expect(await migratedUserKnowledgeElements().pluck('id')).to.deep.equal([1]);
  });

  it('should delete batch by batch until no row is left to purge, and log their count', async function () {
    // given
    const savedAt = new Date('2026-03-01T01:00:00Z');
    await migratedUserKnowledgeElements().insert([1, 2, 3, 4, 5].map((id) => buildRow({ id, savedAt })));
    const deleteSavedBefore = sinon.spy(migratedUserKnowledgeElementRepository.deleteSavedBefore);

    // when
    await purgeExportedMigratedUserKnowledgeElements({
      retentionDays,
      batchSize: 2,
      migratedUserKnowledgeElementRepository: { deleteSavedBefore },
      logger,
    });

    // then
    expect(await migratedUserKnowledgeElements().pluck('id')).to.deep.equal([]);
    expect(deleteSavedBefore).to.have.callCount(3);
    expect(deleteSavedBefore).to.have.always.been.calledWithExactly(new Date('2026-03-03T04:00:00Z'), 2);
    expect(logger.info).to.have.been.calledOnceWithExactly('5 exported migrated user knowledge elements purged');
  });
});
