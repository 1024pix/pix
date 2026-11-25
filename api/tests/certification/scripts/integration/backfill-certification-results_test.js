import { randomUUID } from 'node:crypto';

import { expect } from 'chai';
import sinon from 'sinon';

import { BackfillCertificationResults } from '../../../../src/certification/scripts/backfill-certification-results.ts';
import { AlgorithmEngineVersion } from '../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../../src/certification/shared/domain/models/Frameworks.js';
import { SCOPES } from '../../../../src/certification/shared/domain/models/Scopes.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';
import { catchErr } from '../../../tooling/test-utils/error.js';

describe('Certification | Scripts | Integration | BackfillCertificationResults', function () {
  let script, logger, sleep, sessionId, versionId;

  beforeEach(function () {
    script = new BackfillCertificationResults();
    logger = { info: sinon.stub(), error: sinon.stub() };
    sleep = sinon.stub().resolves();
    const session = databaseBuilder.factory.buildSession({
      certificationCenterId: null,
      certificationCenter: 'Centre de certif',
      publishedAt: new Date('2026-01-03'),
    });
    sessionId = session.id;
    const version = databaseBuilder.factory.buildCertificationVersion({
      scope: SCOPES.CORE,
      challengesConfiguration: {},
      status: 'active',
      maxReachableLevel: 7,
    });
    versionId = version.id;
  });

  function buildCertification({
    id,
    version = AlgorithmEngineVersion.V3,
    isPublished = true,
    withAssessmentResult = true,
    withCertificationVersion = true,
  }) {
    const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
      id,
      sessionId,
      version,
      isPublished,
      framework: Frameworks.CORE,
      versionId: withCertificationVersion ? versionId : null,
      verificationCode: `CODE_${id}`,
      // V1 certifications have no INSEE code nor birth country
      ...(version === AlgorithmEngineVersion.V1 && { birthINSEECode: null, birthCountry: null }),
    });
    if (!withAssessmentResult) return certificationCourse;
    const assessment = databaseBuilder.factory.buildAssessment({ certificationCourseId: id });
    const assessmentResult = databaseBuilder.factory.buildAssessmentResult.last({
      certificationCourseId: id,
      assessmentId: assessment.id,
      pixScore: 678,
      reachedMeshIndex: version === AlgorithmEngineVersion.V3 ? 3 : null,
      status: 'validated',
      commentByAutoJury: null,
    });
    databaseBuilder.factory.buildCompetenceMark({
      assessmentResultId: assessmentResult.id,
      competenceId: 'recCompetence1',
      level: 4,
    });
    return certificationCourse;
  }

  async function findBackfilledCertificationCourseIds() {
    const rows = await knex('user_certification_results')
      .select('certificationCourseId')
      .orderBy('certificationCourseId');
    return rows.map(({ certificationCourseId }) => certificationCourseId);
  }

  function handle(options) {
    return script.handle({
      command: '',
      logger,
      options: {
        dryRun: false,
        throttleDelay: 5,
        startId: 1,
        chunkSize: 3,
        version: AlgorithmEngineVersion.V3,
        ...options,
      },
      dependencies: { sleep, uuidGenerator: randomUUID },
    });
  }

  function infoLogs() {
    return logger.info.args.map(([message]) => message).slice(1);
  }

  it('saves the certification results of the given certifications', async function () {
    // given
    buildCertification({ id: 1 });
    await databaseBuilder.commit();

    // when
    await handle({});

    // then
    const certificationResults = await knex('certification_results').select(
      'id',
      'algorithmEngineVersion',
      'verificationCode',
      'pixScore',
      'reachedMeshIndex',
    );
    const userCertificationResults = await knex('user_certification_results').select(
      'certificationResultId',
      'certificationCourseId',
      'sessionId',
    );
    const competenceResults = await knex('certification_competence_results').select(
      'certificationResultId',
      'competenceId',
      'level',
    );
    const [{ id: certificationResultId }] = certificationResults;
    expect(certificationResults).to.deep.equal([
      {
        id: certificationResultId,
        algorithmEngineVersion: AlgorithmEngineVersion.V3,
        verificationCode: 'CODE_1',
        pixScore: 678,
        reachedMeshIndex: 3,
      },
    ]);
    expect(userCertificationResults).to.deep.equal([{ certificationResultId, certificationCourseId: 1, sessionId }]);
    expect(competenceResults).to.deep.equal([{ certificationResultId, competenceId: 'recCompetence1', level: 4 }]);
  });

  context('dryRun', function () {
    it('does not persist anything when dryRun is true', async function () {
      // given
      buildCertification({ id: 1 });
      buildCertification({ id: 4 });
      await databaseBuilder.commit();

      // when
      await handle({ dryRun: true });

      // then
      expect(await findBackfilledCertificationCourseIds()).to.deep.equal([]);
      expect(infoLogs()).to.deep.equal([
        'Batch from 1 to 3 done',
        'Batch from 4 to 4 done',
        'Script finished. Number of certifications processed : 2, youpi',
      ]);
    });
  });

  context('eligible certifications', function () {
    it('only processes the published certifications of the given version, not yet backfilled', async function () {
      // given
      buildCertification({ id: 1, version: AlgorithmEngineVersion.V2 });
      buildCertification({ id: 2, version: AlgorithmEngineVersion.V2, isPublished: false });
      buildCertification({ id: 3, version: AlgorithmEngineVersion.V3 });
      const { userId } = buildCertification({ id: 4, version: AlgorithmEngineVersion.V2 });
      const alreadyBackfilledResult = databaseBuilder.factory.buildCertificationResult();
      databaseBuilder.factory.buildUserCertificationResult({
        certificationResultId: alreadyBackfilledResult.id,
        userId,
        certificationCourseId: 4,
      });
      buildCertification({ id: 5, version: AlgorithmEngineVersion.V2 });
      await databaseBuilder.commit();

      // when
      await handle({ version: AlgorithmEngineVersion.V2 });

      // then
      const rows = await knex('user_certification_results')
        .select('certificationCourseId', 'algorithmEngineVersion')
        .join('certification_results', 'certification_results.id', 'user_certification_results.certificationResultId')
        .whereIn('certificationCourseId', [1, 5])
        .orderBy('certificationCourseId');
      expect(rows).to.deep.equal([
        { certificationCourseId: 1, algorithmEngineVersion: AlgorithmEngineVersion.V2 },
        { certificationCourseId: 5, algorithmEngineVersion: AlgorithmEngineVersion.V2 },
      ]);
      expect(await findBackfilledCertificationCourseIds()).to.deep.equal([1, 4, 5]);
    });

    it('processes V1 certifications', async function () {
      // given
      buildCertification({ id: 1, version: AlgorithmEngineVersion.V1 });
      await databaseBuilder.commit();

      // when
      await handle({ version: AlgorithmEngineVersion.V1 });

      // then
      expect(await findBackfilledCertificationCourseIds()).to.deep.equal([1]);
    });
  });

  context('chunks', function () {
    it('scans the certifications by chunks of ids, including chunks without any certification', async function () {
      // given
      buildCertification({ id: 1 });
      buildCertification({ id: 2 });
      buildCertification({ id: 10 });
      await databaseBuilder.commit();

      // when
      await handle({ chunkSize: 3 });

      // then
      expect(await findBackfilledCertificationCourseIds()).to.deep.equal([1, 2, 10]);
      expect(infoLogs()).to.deep.equal([
        'Batch from 1 to 3 done',
        'Batch from 4 to 6 done',
        'Batch from 7 to 9 done',
        'Batch from 10 to 10 done',
        'Script finished. Number of certifications processed : 3, youpi',
      ]);
    });

    it('processes the certifications between startId and endId, both included', async function () {
      // given
      [1, 2, 3, 4, 5, 6].forEach((id) => buildCertification({ id }));
      await databaseBuilder.commit();

      // when
      await handle({ startId: 2, endId: 5, chunkSize: 3 });

      // then
      expect(await findBackfilledCertificationCourseIds()).to.deep.equal([2, 3, 4, 5]);
      expect(infoLogs()).to.deep.equal([
        'Batch from 2 to 4 done',
        'Batch from 5 to 5 done',
        'Script finished. Number of certifications processed : 4, youpi',
      ]);
    });

    it('waits for the throttle delay after each chunk', async function () {
      // given
      [1, 2, 3, 4].forEach((id) => buildCertification({ id }));
      await databaseBuilder.commit();

      // when
      await handle({ chunkSize: 2, throttleDelay: 42 });

      // then
      expect(sleep.args).to.deep.equal([[42], [42]]);
    });
  });

  context('when a chunk cannot be fully processed', function () {
    it('stops when a certification has no result, while persisting previous chunks', async function () {
      // given
      [1, 2, 3, 5].forEach((id) => buildCertification({ id }));
      buildCertification({ id: 4, withAssessmentResult: false });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(handle)({ chunkSize: 2 });

      // then
      expect(error.message).to.equal('Could not generate results for following certifications : [4]');
      expect(await findBackfilledCertificationCourseIds()).to.deep.equal([1, 2]);
      expect(logger.error.args).to.deep.equal([
        ['An error happened in batch 3 - 4 : Error: Could not generate results for following certifications : [4]'],
      ]);
      expect(infoLogs()).to.deep.equal([
        'Batch from 1 to 2 done',
        'Script interrupted. Number of certifications processed so far : 2',
        'To resume, run the script again with --startId=3',
      ]);
    });

    it('stops when a certification result is invalid, while persisting previous chunks', async function () {
      // given
      [1, 2, 3].forEach((id) => buildCertification({ id }));
      buildCertification({ id: 4, withCertificationVersion: false });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(handle)({ chunkSize: 2 });

      // then
      expect(error.message).to.match(/^Errors encountered when generating certification results: \{"4":/);
      expect(await findBackfilledCertificationCourseIds()).to.deep.equal([1, 2]);
    });
  });
});
