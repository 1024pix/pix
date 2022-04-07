const { expect, knex, databaseBuilder, domainBuilder, catchErr } = require('../../../test-helper');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const assessmentResultRepository = require('../../../../lib/infrastructure/repositories/assessment-result-repository');
const { MissingAssessmentId, AssessmentResultNotCreatedError } = require('../../../../lib/domain/errors');
const Assessment = require('../../../../lib/domain/models/Assessment');
const { status: assessmentResultStatuses } = require('../../../../lib/domain/models/AssessmentResult');

describe('Integration | Repository | AssessmentResult', function () {
  describe('#save', function () {
    let assessmentResultToSave;
    let assessmentResult;

    describe('when entries are corrects', function () {
      afterEach(function () {
        return knex('assessment-results').where('id', assessmentResult.id).delete();
      });

      beforeEach(async function () {
        const juryId = databaseBuilder.factory.buildUser().id;
        const assessmentId = databaseBuilder.factory.buildAssessment().id;
        assessmentResultToSave = domainBuilder.buildAssessmentResult({ juryId, assessmentId });
        assessmentResultToSave.id = undefined;
        await databaseBuilder.commit();
      });

      it('should persist the assessment result in db', async function () {
        // when
        assessmentResult = await assessmentResultRepository.save(assessmentResultToSave);

        // then
        const assessmentResultSaved = await knex('assessment-results').where('id', assessmentResult.id);
        expect(assessmentResultSaved).to.have.lengthOf(1);
      });

      it('should save a cancelled assessment result', async function () {
        // when
        assessmentResultToSave.status = assessmentResultStatuses.CANCELLED;
        assessmentResult = await assessmentResultRepository.save(assessmentResultToSave);

        // then
        const assessmentResultSaved = await knex('assessment-results').where('id', assessmentResult.id);
        expect(assessmentResultSaved).to.have.lengthOf(1);
      });

      it('should return the saved assessment result', async function () {
        // when
        assessmentResult = await assessmentResultRepository.save(assessmentResultToSave);

        // then
        expect(assessmentResult).to.be.an.instanceOf(AssessmentResult);

        expect(assessmentResult).to.have.property('id').and.not.to.be.null;
      });
    });

    describe('when entries are incorrects', function () {
      beforeEach(async function () {
        const juryId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildAssessment().id;
        assessmentResultToSave = domainBuilder.buildAssessmentResult({ juryId });
        await databaseBuilder.commit();
      });

      it('should throw a MissingAssessmentId error if assessmentId is null or undefined', async function () {
        // when
        assessmentResultToSave.assessmentId = null;
        const result = await catchErr(assessmentResultRepository.save)(assessmentResultToSave);

        // then
        expect(result).to.be.instanceOf(MissingAssessmentId);
      });

      it('should throw when assessment result status is invalid', async function () {
        // when
        const result = await catchErr(assessmentResultRepository.save)({ state: 'invalid status' });

        // then
        expect(result).to.be.instanceOf(Error);
      });

      it('should throw an error in others cases', async function () {
        // when
        const result = await catchErr(assessmentResultRepository.save)({ assessmentId: 1 });

        // then
        expect(result).to.be.instanceOf(AssessmentResultNotCreatedError);
      });
    });
  });

  describe('#findLatestLevelAndPixScoreByAssessmentId', function () {
    context('when assessment has one assessment result', function () {
      it('should return the level and pixScore', async function () {
        // given
        databaseBuilder.factory.buildAssessment({ id: 1 });
        databaseBuilder.factory.buildAssessmentResult({
          assessmentId: 1,
          level: 5,
          pixScore: 9000,
        });
        databaseBuilder.factory.buildAssessmentResult({ level: 4, pixScore: 55, commentForJury: 'noise data' });
        await databaseBuilder.commit();

        // when
        const { level, pixScore } = await assessmentResultRepository.findLatestLevelAndPixScoreByAssessmentId({
          assessmentId: 1,
        });

        // then
        expect(level).to.equal(5);
        expect(pixScore).to.equal(9000);
      });
    });
    context('when certification course has several assessment results', function () {
      it('should return the level and pixScore of the latest assessment result', async function () {
        // given
        databaseBuilder.factory.buildAssessment({ id: 1 });
        databaseBuilder.factory.buildAssessmentResult({
          assessmentId: 1,
          level: 5,
          pixScore: 9000,
          createdAt: new Date('2021-10-29T03:06:00Z'),
        });
        databaseBuilder.factory.buildAssessmentResult({
          assessmentId: 1,
          level: 3,
          pixScore: 8999,
          createdAt: new Date('2022-05-05T03:06:00Z'),
        });
        await databaseBuilder.commit();

        // when
        const { level, pixScore } = await assessmentResultRepository.findLatestLevelAndPixScoreByAssessmentId({
          assessmentId: 1,
        });

        // then
        expect(level).to.equal(3);
        expect(pixScore).to.equal(8999);
      });
    });
    context('when a limit date is specified', function () {
      it('should return the level and pixScore of the latest assessment result before that date', async function () {
        // given
        databaseBuilder.factory.buildAssessment({ id: 1 });
        databaseBuilder.factory.buildAssessmentResult({
          assessmentId: 1,
          level: 5,
          pixScore: 9000,
          createdAt: new Date('2021-10-29T03:06:00Z'),
        });
        databaseBuilder.factory.buildAssessmentResult({
          assessmentId: 1,
          level: 3,
          pixScore: 8999,
          createdAt: new Date('2022-05-05T03:06:00Z'),
        });
        databaseBuilder.factory.buildAssessmentResult({
          assessmentId: 1,
          level: 1,
          pixScore: 8,
          createdAt: new Date('2021-12-31T03:06:00Z'),
        });
        await databaseBuilder.commit();

        // when
        const { level, pixScore } = await assessmentResultRepository.findLatestLevelAndPixScoreByAssessmentId({
          assessmentId: 1,
          limitDate: new Date('2022-01-01T03:06:00Z'),
        });

        // then
        expect(level).to.equal(1);
        expect(pixScore).to.equal(8);
      });
    });
    context('when assessment has no assessment-result', function () {
      it('should return 0 as level and pixScore', async function () {
        // given
        databaseBuilder.factory.buildAssessment({ id: 1 });
        databaseBuilder.factory.buildAssessment({ id: 2 });
        databaseBuilder.factory.buildAssessmentResult({
          assessmentId: 2,
          level: 5,
          pixScore: 9000,
        });
        await databaseBuilder.commit();

        // when
        const { level, pixScore } = await assessmentResultRepository.findLatestLevelAndPixScoreByAssessmentId({
          assessmentId: 1,
        });

        // then
        expect(level).to.equal(0);
        expect(pixScore).to.equal(0);
      });
    });
  });

  describe('#getByCertificationCourseId', function () {
    context('when certification course has one assessment result', function () {
      it('should return the assessment result', async function () {
        // given
        databaseBuilder.factory.buildCertificationCourse({ id: 1 });
        databaseBuilder.factory.buildUser({ id: 100 });
        databaseBuilder.factory.buildAssessment({ id: 2, certificationCourseId: 1 });
        const competenceMark1 = domainBuilder.buildCompetenceMark({
          id: 200,
          level: 3,
          score: 33,
          area_code: 'area1',
          competence_code: 'compCode1',
          competenceId: 'recComp1',
          assessmentResultId: 4,
        });
        const competenceMark2 = domainBuilder.buildCompetenceMark({
          id: 201,
          level: 1,
          score: 2,
          area_code: 'area2',
          competence_code: 'compCode2',
          competenceId: 'recComp2',
          assessmentResultId: 4,
        });
        const expectedAssessmentResult = domainBuilder.buildAssessmentResult({
          id: 4,
          pixScore: 33,
          reproducibilityRate: 29.1,
          status: AssessmentResult.status.VALIDATED,
          emitter: 'some-emitter',
          commentForCandidate: 'candidate',
          commentForJury: 'jury',
          commentForOrganization: 'orga',
          createdAt: new Date('2021-10-29T03:06:00Z'),
          juryId: 100,
          assessmentId: 2,
          competenceMarks: [competenceMark1, competenceMark2],
        });
        databaseBuilder.factory.buildAssessmentResult(expectedAssessmentResult);
        databaseBuilder.factory.buildCompetenceMark(competenceMark1);
        databaseBuilder.factory.buildCompetenceMark(competenceMark2);
        await databaseBuilder.commit();

        // when
        const actualAssessmentResult = await assessmentResultRepository.getByCertificationCourseId({
          certificationCourseId: 1,
        });

        // then
        expect(actualAssessmentResult).to.deepEqualInstance(expectedAssessmentResult);
      });
    });
    context('when certification course has several assessment results', function () {
      it('should return the latest assessment result', async function () {
        // given
        databaseBuilder.factory.buildCertificationCourse({ id: 1 });
        databaseBuilder.factory.buildUser({ id: 100 });
        databaseBuilder.factory.buildAssessment({ id: 2, certificationCourseId: 1 });
        const competenceMark1 = domainBuilder.buildCompetenceMark({
          id: 200,
          level: 3,
          score: 33,
          area_code: 'area1',
          competence_code: 'compCode1',
          competenceId: 'recComp1',
          assessmentResultId: 4,
        });
        const competenceMark2 = domainBuilder.buildCompetenceMark({
          id: 201,
          level: 1,
          score: 2,
          area_code: 'area2',
          competence_code: 'compCode2',
          competenceId: 'recComp2',
          assessmentResultId: 5,
        });
        const competenceMark3 = domainBuilder.buildCompetenceMark({
          id: 202,
          level: 5,
          score: 200,
          area_code: 'area3',
          competence_code: 'compCode3',
          competenceId: 'recComp3',
          assessmentResultId: 4,
        });
        const expectedAssessmentResult = domainBuilder.buildAssessmentResult({
          id: 4,
          pixScore: 33,
          reproducibilityRate: 29.1,
          status: AssessmentResult.status.VALIDATED,
          emitter: 'some-emitter',
          commentForCandidate: 'candidate',
          commentForJury: 'jury',
          commentForOrganization: 'orga',
          createdAt: new Date('2021-10-29T03:06:00Z'),
          juryId: 100,
          assessmentId: 2,
          competenceMarks: [competenceMark1, competenceMark3],
        });
        databaseBuilder.factory.buildAssessmentResult(expectedAssessmentResult);
        databaseBuilder.factory.buildAssessmentResult({
          id: 5,
          pixScore: 66,
          reproducibilityRate: 28.1,
          status: AssessmentResult.status.REJECTED,
          emitter: 'some-other-emitter',
          commentForCandidate: 'candidates',
          commentForJury: 'jurys',
          commentForOrganization: 'orgas',
          createdAt: new Date('2020-01-01T22:06:00Z'),
          juryId: 100,
          assessmentId: 2,
          competenceMarks: [competenceMark2],
        });
        databaseBuilder.factory.buildCompetenceMark(competenceMark1);
        databaseBuilder.factory.buildCompetenceMark(competenceMark2);
        databaseBuilder.factory.buildCompetenceMark(competenceMark3);
        await databaseBuilder.commit();

        // when
        const actualAssessmentResult = await assessmentResultRepository.getByCertificationCourseId({
          certificationCourseId: 1,
        });

        // then
        expect(actualAssessmentResult).to.deepEqualInstance(expectedAssessmentResult);
      });
    });
    context('when certification course has an assessment but no assessment result', function () {
      it('should return a started assessment result with assessmentId set', async function () {
        // given
        databaseBuilder.factory.buildCertificationCourse({ id: 1 });
        databaseBuilder.factory.buildUser({ id: 100 });
        databaseBuilder.factory.buildAssessment({ id: 2, certificationCourseId: 1 });
        await databaseBuilder.commit();

        // when
        const actualAssessmentResult = await assessmentResultRepository.getByCertificationCourseId({
          certificationCourseId: 1,
        });

        // then
        const expectedAssessmentResult = domainBuilder.buildAssessmentResult({
          assessmentId: 2,
          status: Assessment.states.STARTED,
          competenceMarks: [],
        });
        expectedAssessmentResult.id = undefined;
        expectedAssessmentResult.commentForCandidate = undefined;
        expectedAssessmentResult.commentForJury = undefined;
        expectedAssessmentResult.commentForOrganization = undefined;
        expectedAssessmentResult.createdAt = undefined;
        expectedAssessmentResult.emitter = undefined;
        expectedAssessmentResult.reproducibilityRate = undefined;
        expectedAssessmentResult.pixScore = undefined;
        expectedAssessmentResult.juryId = undefined;
        expect(actualAssessmentResult).to.deepEqualInstance(expectedAssessmentResult);
      });
    });
    context('when certification course has no assessment at all', function () {
      it('should return a started assessment result with no assessmentId set', async function () {
        // given
        databaseBuilder.factory.buildCertificationCourse({ id: 1 });
        databaseBuilder.factory.buildUser({ id: 100 });
        await databaseBuilder.commit();

        // when
        const actualAssessmentResult = await assessmentResultRepository.getByCertificationCourseId({
          certificationCourseId: 1,
        });

        // then
        const expectedAssessmentResult = domainBuilder.buildAssessmentResult({
          assessmentId: null,
          status: Assessment.states.STARTED,
          competenceMarks: [],
        });
        expectedAssessmentResult.id = undefined;
        expectedAssessmentResult.commentForCandidate = undefined;
        expectedAssessmentResult.commentForJury = undefined;
        expectedAssessmentResult.commentForOrganization = undefined;
        expectedAssessmentResult.createdAt = undefined;
        expectedAssessmentResult.emitter = undefined;
        expectedAssessmentResult.reproducibilityRate = undefined;
        expectedAssessmentResult.pixScore = undefined;
        expectedAssessmentResult.juryId = undefined;
        expect(actualAssessmentResult).to.deepEqualInstance(expectedAssessmentResult);
      });
    });
  });
});
