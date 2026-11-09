import { expect } from 'chai';
import sinon from 'sinon';

import { config } from '../../../../../config/config.js';
import { ScheduleExportMigratedUserKnowledgeElementsJobController } from '../../../../../src/db-history/application/jobs/schedule-export-migrated-user-knowledge-elements-job-controller.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { getServer } from '../../../../tooling/server/shared-server.js';
import { prepareTestBucket } from '../../../../tooling/storage/s3-test-bucket.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

const {
  buildAssessment,
  buildCompetenceEvaluation,
  buildKnowledgeState,
  buildKnowledgeStateMigration,
  buildUser,
  buildUserCompetenceScore,
  learningContent,
} = databaseBuilder.factory;

describe('Acceptance | History-db | Application | Jobs | ScheduleExportMigratedUserKnowledgeElementsJobController', function () {
  const competenceId = 'recCompetence';
  const challengeId = 'challenge_web_3';
  const answeredAt = new Date('2026-03-01T10:00:00Z');
  const exportedAt = new Date('2026-03-02T05:00:00Z');
  let server;
  let bucket;

  const buildLearningContent = () =>
    learningContent.build({
      areas: [
        { id: 'recArea', title_i18n: { fr: 'Domaine' }, color: 'jaffa', code: '1', competenceIds: [competenceId] },
      ],
      competences: [
        {
          id: competenceId,
          areaId: 'recArea',
          origin: 'Pix',
          index: '1.1',
          name_i18n: { fr: 'Nom de la compétence' },
          description_i18n: { fr: 'Une description' },
        },
      ],
      skills: [1, 2, 3, 4].map((level) => ({
        id: `skill_web_${level}`,
        name: `@web${level}`,
        status: 'actif',
        competenceId,
        tubeId: 'tube_web',
        level,
        pixValue: 2,
      })),
      challenges: [
        {
          id: challengeId,
          competenceId,
          skillId: 'skill_web_3',
          status: 'validé',
          solution: 'correct',
          proposals: '${a}',
          locales: ['fr-fr'],
          type: 'QROC',
        },
      ],
    });

  // A migrated user who validated level 1, and is asked level 3 in a new assessment.
  const buildMigratedUser = async () => {
    const userId = buildUser().id;
    buildKnowledgeState({ userId, tubeId: 'tube_web', floor: 1, directLevels: [1] });
    buildUserCompetenceScore({ userId, competenceId, pix: 2 });
    buildKnowledgeStateMigration({ userId });
    const assessmentId = buildAssessment({
      userId,
      competenceId,
      type: Assessment.types.COMPETENCE_EVALUATION,
      state: Assessment.states.STARTED,
    }).id;
    buildCompetenceEvaluation({ userId, assessmentId, competenceId });
    await databaseBuilder.commit();

    return { userId, assessmentId };
  };

  const answer = ({ userId, assessmentId }) =>
    server.inject({
      method: 'POST',
      url: '/api/answers',
      headers: generateAuthenticatedUserRequestHeaders({ userId }),
      payload: {
        data: {
          type: 'answers',
          attributes: { value: 'correct' },
          relationships: {
            assessment: { data: { type: 'assessments', id: assessmentId } },
            challenge: { data: { type: 'challenges', id: challengeId } },
          },
        },
      },
    });

  beforeEach(async function () {
    server = await getServer();
    bucket = await prepareTestBucket(config.migratedUserKnowledgeElementsExport.storage.client);
  });

  afterEach(async function () {
    await knex('migrated_user_knowledge_elements').delete();
    await knex('migrated_user_knowledge_elements_export_files').delete();
  });

  it('should export to the data lake the knowledge elements of the answers of a migrated user', async function () {
    // given
    buildLearningContent();
    const migratedUser = await buildMigratedUser();
    const clock = sinon.useFakeTimers({ now: answeredAt, toFake: ['Date'] });
    const { statusCode } = await answer(migratedUser);
    expect(statusCode).to.equal(201);
    const { id: answerId } = await knex('answers').where({ assessmentId: migratedUser.assessmentId }).first();

    // when
    clock.setSystemTime(exportedAt);
    await new ScheduleExportMigratedUserKnowledgeElementsJobController().handle();

    // then
    const keys = await bucket.keys();
    expect(keys).to.have.lengthOf(1);
    expect(keys[0]).to.match(/^migrated-user-knowledge-elements\/2026\/03\/01\/\d{12}_\d{12}\.parquet$/);

    const rows = await bucket.readParquet(keys[0]);
    const exportedKnowledgeElement = (skillId, source) => ({
      source,
      status: 'validated',
      createdAt: answeredAt,
      answerId: BigInt(answerId),
      assessmentId: migratedUser.assessmentId,
      skillId,
      earnedPix: 2,
      userId: migratedUser.userId,
      competenceId,
      extractedAt: '2026-03-02',
    });
    expect(rows.map(({ id }) => typeof id)).to.deep.equal(['bigint', 'bigint', 'bigint']);
    expect(rows.map(({ id: _id, ...row }) => row).toSorted((a, b) => a.skillId.localeCompare(b.skillId))).to.deep.equal(
      [
        exportedKnowledgeElement('skill_web_1', 'inferred'),
        exportedKnowledgeElement('skill_web_2', 'inferred'),
        exportedKnowledgeElement('skill_web_3', 'direct'),
      ],
    );

    const savedAts = await knex('migrated_user_knowledge_elements')
      .pluck('saved_at')
      .where({ user_id: migratedUser.userId });
    expect(savedAts).to.deep.equal([exportedAt, exportedAt, exportedAt]);

    const exportFiles = await knex('migrated_user_knowledge_elements_export_files').select(
      'filename',
      'row_count',
      'completed_at',
    );
    expect(exportFiles).to.deep.equal([{ filename: keys[0], row_count: 3, completed_at: exportedAt }]);
  });
});
