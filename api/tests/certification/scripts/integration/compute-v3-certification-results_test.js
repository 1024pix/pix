import { expect } from 'chai';
import sinon from 'sinon';

import { ComputeV3CertificationResults } from '../../../../src/certification/scripts/compute-v3-certification-results.js';
import { AlgorithmEngineVersion } from '../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../../src/certification/shared/domain/models/Frameworks.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';
import { catchErr } from '../../../tooling/test-utils/error.js';

describe('Integration | Scripts | ComputeV3CertificationResults', function () {
  let script, logger, versionId, sessionId, deliveredAt, certificationCenterId;

  beforeEach(function () {
    script = new ComputeV3CertificationResults();
    logger = { info: sinon.stub(), warn: sinon.stub(), error: sinon.stub() };
    versionId = databaseBuilder.factory.buildCertificationVersion({
      scope: Frameworks.CORE,
      challengesConfiguration: {},
      status: 'active',
      maxReachableLevel: 7,
    }).id;
    deliveredAt = new Date();
    certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
      name: 'Mon super centre de certif',
    }).id;
    sessionId = databaseBuilder.factory.buildSession({ certificationCenterId, publishedAt: deliveredAt }).id;
    return databaseBuilder.commit();
  });

  describe('#handle', function () {
    context('dryRun', function () {
      it('does not save the certification result artifacts when dryRun is true', async function () {
        buildCertificateData({ sessionId, deliveredAt, versionId, certificationCourseId: 1 });
        await databaseBuilder.commit();

        await script.handle({ options: { dryRun: true, throttleDelay: 5, startId: 1, chunkSize: 5 }, logger });

        const [{ total_certif_results }] = await knex('certification_results').count('* as total_certif_results');
        const [{ total_user_certif_results }] = await knex('user_certification_results').count(
          '* as total_user_certif_results',
        );
        expect(total_certif_results).to.equal(0);
        expect(total_user_certif_results).to.equal(0);
        expect(getCallArgsForLogger(logger)).to.deep.equal({
          warn: [],
          error: [],
          info: [
            ['Script execution started with options {"dryRun":true,"throttleDelay":5,"startId":1,"chunkSize":5}'],
            ['Batch from 1 to 5 done'],
            ['Script finished. Number of certifications processed : 1, youpi'],
          ],
        });
      });

      it('saves the certification result artifacts when dryRun is false', async function () {
        const expectedData = buildCertificateData({ sessionId, deliveredAt, versionId, certificationCourseId: 1 });
        await databaseBuilder.commit();

        await script.handle({ options: { dryRun: false, throttleDelay: 5, startId: 1, chunkSize: 5 }, logger });

        const resCertifResults = await knex('certification_results')
          .select('certification_results.*')
          .join(
            'user_certification_results',
            'user_certification_results.certificationResultId',
            'certification_results.id',
          )
          .orderBy('user_certification_results.certificationCourseId');
        const resUserCertifResults = await knex('user_certification_results')
          .select('*')
          .orderBy('certificationCourseId');
        expect(resCertifResults).to.have.length(1);
        expect(resUserCertifResults).to.have.length(1);
        assertEqualCertifResult(resCertifResults[0], expectedData);
        assertEqualUserCertifResult(resUserCertifResults[0], expectedData);
        expect(getCallArgsForLogger(logger)).to.deep.equal({
          warn: [],
          error: [],
          info: [
            ['Script execution started with options {"dryRun":false,"throttleDelay":5,"startId":1,"chunkSize":5}'],
            ['Batch from 1 to 5 done'],
            ['Script finished. Number of certifications processed : 1, youpi'],
          ],
        });
      });
    });

    context('batch', function () {
      it('can be run to process a specific size of chunks while scanning the whole certification-courses table', async function () {
        const expectedData0 = buildCertificateData({ sessionId, deliveredAt, versionId, certificationCourseId: 1 });
        const expectedData1 = buildCertificateData({ sessionId, deliveredAt, versionId, certificationCourseId: 10 });
        await databaseBuilder.commit();

        await script.handle({ options: { dryRun: false, throttleDelay: 5, startId: 1, chunkSize: 3 }, logger });

        const resCertifResults = await knex('certification_results')
          .select('certification_results.*')
          .join(
            'user_certification_results',
            'user_certification_results.certificationResultId',
            'certification_results.id',
          )
          .orderBy('user_certification_results.certificationCourseId');
        const resUserCertifResults = await knex('user_certification_results')
          .select('*')
          .orderBy('certificationCourseId');
        expect(resCertifResults).to.have.length(2);
        expect(resUserCertifResults).to.have.length(2);
        assertEqualCertifResult(resCertifResults[0], expectedData0);
        assertEqualCertifResult(resCertifResults[1], expectedData1);
        assertEqualUserCertifResult(resUserCertifResults[0], expectedData0);
        assertEqualUserCertifResult(resUserCertifResults[1], expectedData1);
        expect(getCallArgsForLogger(logger)).to.deep.equal({
          warn: [],
          error: [],
          info: [
            ['Script execution started with options {"dryRun":false,"throttleDelay":5,"startId":1,"chunkSize":3}'],
            ['Batch from 1 to 3 done'],
            ['Batch from 4 to 6 done'],
            ['Batch from 7 to 9 done'],
            ['Batch from 10 to 12 done'],
            ['Script finished. Number of certifications processed : 2, youpi'],
          ],
        });
      });

      it('can be started from a specific ID', async function () {
        buildCertificateData({ sessionId, deliveredAt, versionId, certificationCourseId: 1 });
        const expectedData1 = buildCertificateData({ sessionId, deliveredAt, versionId, certificationCourseId: 10 });
        await databaseBuilder.commit();

        await script.handle({ options: { dryRun: false, throttleDelay: 5, startId: 5, chunkSize: 3 }, logger });

        const resCertifResults = await knex('certification_results')
          .select('certification_results.*')
          .join(
            'user_certification_results',
            'user_certification_results.certificationResultId',
            'certification_results.id',
          )
          .orderBy('user_certification_results.certificationCourseId');
        const resUserCertifResults = await knex('user_certification_results')
          .select('*')
          .orderBy('certificationCourseId');
        expect(resCertifResults).to.have.length(1);
        expect(resUserCertifResults).to.have.length(1);
        assertEqualCertifResult(resCertifResults[0], expectedData1);
        assertEqualUserCertifResult(resUserCertifResults[0], expectedData1);
        expect(getCallArgsForLogger(logger)).to.deep.equal({
          warn: [],
          error: [],
          info: [
            ['Script execution started with options {"dryRun":false,"throttleDelay":5,"startId":5,"chunkSize":3}'],
            ['Batch from 5 to 7 done'],
            ['Batch from 8 to 10 done'],
            ['Script finished. Number of certifications processed : 1, youpi'],
          ],
        });
      });
    });

    context('eligible certifications', function () {
      it('skips the unpublished certification courses', async function () {
        const expectedData0 = buildCertificateData({ sessionId, deliveredAt, versionId, certificationCourseId: 1 });
        const anotherSessionId = databaseBuilder.factory.buildSession({ certificationCenterId, deliveredAt: null }).id;
        buildCertificateData({
          sessionId: anotherSessionId,
          deliveredAt: null,
          versionId,
          certificationCourseId: 2,
        });
        await databaseBuilder.commit();

        await script.handle({ options: { dryRun: false, throttleDelay: 5, startId: 1, chunkSize: 3 }, logger });

        const resCertifResults = await knex('certification_results')
          .select('certification_results.*')
          .join(
            'user_certification_results',
            'user_certification_results.certificationResultId',
            'certification_results.id',
          )
          .orderBy('user_certification_results.certificationCourseId');
        const resUserCertifResults = await knex('user_certification_results')
          .select('*')
          .orderBy('certificationCourseId');
        expect(resCertifResults).to.have.length(1);
        expect(resUserCertifResults).to.have.length(1);
        assertEqualCertifResult(resCertifResults[0], expectedData0);
        assertEqualUserCertifResult(resUserCertifResults[0], expectedData0);
        expect(getCallArgsForLogger(logger)).to.deep.equal({
          warn: [],
          error: [],
          info: [
            ['Script execution started with options {"dryRun":false,"throttleDelay":5,"startId":1,"chunkSize":3}'],
            ['Batch from 1 to 3 done'],
            ['Script finished. Number of certifications processed : 1, youpi'],
          ],
        });
      });

      it('skips not V3 certification courses', async function () {
        const expectedData0 = buildCertificateData({ sessionId, deliveredAt, versionId, certificationCourseId: 1 });
        buildCertificateData({
          sessionId,
          deliveredAt,
          versionId,
          certificationCourseId: 2,
          algorithmEngineVersion: AlgorithmEngineVersion.V2,
        });
        buildCertificateData({
          sessionId,
          deliveredAt,
          versionId,
          certificationCourseId: 3,
          algorithmEngineVersion: AlgorithmEngineVersion.V1,
        });
        await databaseBuilder.commit();

        await script.handle({ options: { dryRun: false, throttleDelay: 5, startId: 1, chunkSize: 10 }, logger });

        const resCertifResults = await knex('certification_results')
          .select('certification_results.*')
          .join(
            'user_certification_results',
            'user_certification_results.certificationResultId',
            'certification_results.id',
          )
          .orderBy('user_certification_results.certificationCourseId');
        const resUserCertifResults = await knex('user_certification_results')
          .select('*')
          .orderBy('certificationCourseId');
        expect(resCertifResults).to.have.length(1);
        expect(resUserCertifResults).to.have.length(1);
        assertEqualCertifResult(resCertifResults[0], expectedData0);
        assertEqualUserCertifResult(resUserCertifResults[0], expectedData0);
        expect(getCallArgsForLogger(logger)).to.deep.equal({
          warn: [],
          error: [],
          info: [
            ['Script execution started with options {"dryRun":false,"throttleDelay":5,"startId":1,"chunkSize":10}'],
            ['Batch from 1 to 10 done'],
            ['Script finished. Number of certifications processed : 1, youpi'],
          ],
        });
      });

      it('stops when an error occurred during the computing, while persisting previous batches', async function () {
        const expectedData0 = buildCertificateData({ sessionId, deliveredAt, versionId, certificationCourseId: 1 });
        const expectedData1 = buildCertificateData({ sessionId, deliveredAt, versionId, certificationCourseId: 2 });
        buildCertificateData({ sessionId, deliveredAt, versionId, certificationCourseId: 3 });
        buildCertificateData({ sessionId, deliveredAt, versionId, certificationCourseId: 4, buildInvalidCertif: true });
        buildCertificateData({ sessionId, deliveredAt, versionId, certificationCourseId: 5 });
        await databaseBuilder.commit();

        await catchErr(script.handle)({
          options: { dryRun: false, throttleDelay: 5, startId: 1, chunkSize: 2 },
          logger,
        });

        const resCertifResults = await knex('certification_results')
          .select('certification_results.*')
          .join(
            'user_certification_results',
            'user_certification_results.certificationResultId',
            'certification_results.id',
          )
          .orderBy('user_certification_results.certificationCourseId');
        const resUserCertifResults = await knex('user_certification_results')
          .select('*')
          .orderBy('certificationCourseId');
        expect(resCertifResults).to.have.length(2);
        expect(resUserCertifResults).to.have.length(2);
        assertEqualCertifResult(resCertifResults[0], expectedData0);
        assertEqualCertifResult(resCertifResults[1], expectedData1);
        assertEqualUserCertifResult(resUserCertifResults[0], expectedData0);
        assertEqualUserCertifResult(resUserCertifResults[1], expectedData1);
        expect(getCallArgsForLogger(logger)).to.deep.equal({
          warn: [],
          error: [
            ['An error happened in batch 3 - 4 : Error: Could not generate results for following certifications : [4]'],
          ],
          info: [
            ['Script execution started with options {"dryRun":false,"throttleDelay":5,"startId":1,"chunkSize":2}'],
            ['Batch from 1 to 2 done'],
            ['Script interrupted. Number of certifications processed so far : 2'],
          ],
        });
      });
    });
  });
});

function buildCertificateData({
  certificationCourseId,
  sessionId,
  versionId,
  deliveredAt,
  algorithmEngineVersion = AlgorithmEngineVersion.V3,
  buildInvalidCertif = false,
}) {
  const framework = Frameworks.CORE;
  const expectedCertifData = {
    sessionId,
    algorithmEngineVersion,
    firstName: `Buffy_${framework}`,
    lastName: `Summers_${framework}`,
    externalId: `externalID_${framework}`,
    birthdate: '1981-01-18',
    birthplace: `Sunnydale_${framework}`,
    birthPostalCode: `birthPostalCode_${framework}`,
    birthINSEECode: `birthINSEECode_${framework}`,
    birthCountry: `birthCountry_${framework}`,
    certificationCenter: 'Mon super centre de certif',
    startedAt: new Date('2026-01-01'),
    deliveredAt,
    status: 'validated',
    framework,
    maxReachableLevel: 7,
    commentByAutoJury: `commentByAutoJury_${framework}`,
    commentByJury: `commentByJury_${framework}`,
    commentForOrganization: `commentForOrganization_${framework}`,
    commentForCandidate: `commentForCandidate_${framework}`,
    organizationLearnerId: null,
    franceCompetencesMinScore: 120,
    hasAcquiredClea: null,
    cleaBadgeId: null,
    middleName: null,
    thirdName: null,
    nationalStudentId: null,
  };

  const userId = databaseBuilder.factory.buildUser().id;
  expectedCertifData.userId = userId;
  expectedCertifData.verificationCode = `CODEVERIF_${userId}`;

  const candidateId = databaseBuilder.factory.buildCertificationCandidate({
    organizationLearnerId: null,
    sessionId,
  }).id;
  databaseBuilder.factory.buildCertificationCourse({
    id: certificationCourseId,
    userId,
    candidateId,
    versionId,
    framework,
    sessionId,
    isPublished: !!deliveredAt,
    version: expectedCertifData.algorithmEngineVersion,
    firstName: expectedCertifData.firstName,
    lastName: expectedCertifData.lastName,
    externalId: expectedCertifData.externalId,
    birthdate: expectedCertifData.birthdate,
    birthplace: expectedCertifData.birthplace,
    birthPostalCode: expectedCertifData.birthPostalCode,
    birthINSEECode: expectedCertifData.birthINSEECode,
    birthCountry: expectedCertifData.birthCountry,
    verificationCode: expectedCertifData.verificationCode,
    createdAt: expectedCertifData.startedAt,
  });
  expectedCertifData.certificationCourseId = certificationCourseId;

  const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId }).id;
  expectedCertifData.status = 'validated';
  expectedCertifData.pixScore = 678;
  expectedCertifData.reachedMeshIndex = 3;
  expectedCertifData.commentByAutoJury = `commentByAutoJury_${framework}`;
  expectedCertifData.commentByJury = `commentByJury_${framework}`;
  expectedCertifData.commentForOrganization = `commentForOrganization_${framework}`;
  expectedCertifData.commentForCandidate = `commentForCandidate_${framework}`;
  expectedCertifData.eduV3ExternalJuryResult = framework === Frameworks.EDU_CPE ? 'APPROVED' : null;
  if (buildInvalidCertif) {
    return expectedCertifData;
  }
  const assessmentResultId = databaseBuilder.factory.buildAssessmentResult.last({
    certificationCourseId,
    assessmentId,
    pixScore: expectedCertifData.pixScore,
    status: expectedCertifData.status,
    reachedMeshIndex: expectedCertifData.reachedMeshIndex,
    commentByAutoJury: expectedCertifData.commentByAutoJury,
    commentByJury: expectedCertifData.commentByJury,
    commentForOrganization: expectedCertifData.commentForOrganization,
    commentForCandidate: expectedCertifData.commentForCandidate,
    eduV3ExternalJuryResult: expectedCertifData.eduV3ExternalJuryResult,
  }).id;
  databaseBuilder.factory.buildCompetenceMark({
    assessmentResultId,
    competenceId: `competenceABC123_${framework}`,
    level: 1,
  });
  databaseBuilder.factory.buildCompetenceMark({
    assessmentResultId,
    competenceId: `competenceDEF456_${framework}`,
    level: 7,
  });
  expectedCertifData.competenceMarks = [
    { competenceId: `competenceABC123_${framework}`, level: 1 },
    { competenceId: `competenceDEF456_${framework}`, level: 7 },
  ];

  return expectedCertifData;
}

function assertEqualCertifResult(actual, expected) {
  sinon.assert.match(actual, {
    id: sinon.match.string.and(
      sinon.match((value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)),
    ),
    algorithmEngineVersion: expected.algorithmEngineVersion,
    birthCountry: expected.birthCountry,
    birthINSEECode: expected.birthINSEECode,
    birthPostalCode: expected.birthPostalCode,
    birthdate: expected.birthdate,
    birthplace: expected.birthplace,
    certificationCenter: expected.certificationCenter,
    cleaBadgeId: expected.cleaBadgeId,
    commentByAutoJury: expected.commentByAutoJury,
    commentByJury: expected.commentByJury,
    commentForCandidate: expected.commentForCandidate,
    commentForOrganization: expected.commentForOrganization,
    competenceMarks: expected.competenceMarks,
    deliveredAt: expected.deliveredAt,
    eduV3ExternalJuryResult: expected.eduV3ExternalJuryResult,
    externalId: expected.externalId,
    firstName: expected.firstName,
    framework: expected.framework,
    franceCompetencesMinScore: expected.franceCompetencesMinScore,
    hasAcquiredClea: expected.hasAcquiredClea,
    lastName: expected.lastName,
    maxReachableLevel: expected.maxReachableLevel,
    middleName: expected.middleName,
    nationalStudentId: expected.nationalStudentId,
    pixScore: expected.pixScore,
    reachedMeshIndex: expected.reachedMeshIndex,
    startedAt: expected.startedAt,
    status: expected.status,
    thirdName: expected.thirdName,
    verificationCode: expected.verificationCode,
  });
}

function assertEqualUserCertifResult(actual, expected) {
  sinon.assert.match(actual, {
    certificationResultId: sinon.match.string.and(
      sinon.match((value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)),
    ),
    certificationCourseId: expected.certificationCourseId,
    userId: expected.userId,
    sessionId: expected.sessionId,
    organizationLeanerId: expected.organizationLeanerId,
  });
}

function getCallArgsForLogger(logger) {
  return {
    info: logger.info.getCalls().map((call) => call.args),
    warn: logger.warn.getCalls().map((call) => call.args),
    error: logger.error.getCalls().map((call) => call.args),
  };
}
