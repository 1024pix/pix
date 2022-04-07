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
    let assessmentWithResultsId;
    let assessmentWithoutResultsId;
    const expectedAssessmentResultLevel = 3;
    const expectedAssessmentResultPixScore = 10;
    const expectedAssessmentResultWithinLimitDateLevel = 4;
    const expectedAssessmentResultWithinLimitDatePixScore = 20;

    beforeEach(function () {
      assessmentWithResultsId = databaseBuilder.factory.buildAssessment().id;
      assessmentWithoutResultsId = databaseBuilder.factory.buildAssessment().id;
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId: assessmentWithResultsId,
        createdAt: new Date('2019-02-01T00:00:00Z'),
        level: expectedAssessmentResultLevel,
        pixScore: expectedAssessmentResultPixScore,
      }).id;
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId: assessmentWithResultsId,
        createdAt: new Date('2019-01-01T00:00:00Z'),
        level: expectedAssessmentResultWithinLimitDateLevel,
        pixScore: expectedAssessmentResultWithinLimitDatePixScore,
      }).id;

      return databaseBuilder.commit();
    });

    it('should return the most recent assessment result level and pixScore when assessment has some', async function () {
      // when
      const { level, pixScore } = await assessmentResultRepository.findLatestLevelAndPixScoreByAssessmentId({
        assessmentId: assessmentWithResultsId,
      });

      // then
      expect(level).to.equal(expectedAssessmentResultLevel);
      expect(pixScore).to.equal(expectedAssessmentResultPixScore);
    });

    it('should return the most recent assessment result level and pixScore within limit date when assessment has some', async function () {
      // when
      const { level, pixScore } = await assessmentResultRepository.findLatestLevelAndPixScoreByAssessmentId({
        assessmentId: assessmentWithResultsId,
        limitDate: new Date('2019-01-05T00:00:00Z'),
      });

      // then
      expect(level).to.equal(expectedAssessmentResultWithinLimitDateLevel);
      expect(pixScore).to.equal(expectedAssessmentResultWithinLimitDatePixScore);
    });

    it('should return null when assessment has no results', async function () {
      // when
      const { level, pixScore } = await assessmentResultRepository.findLatestLevelAndPixScoreByAssessmentId({
        assessmentId: assessmentWithoutResultsId,
      });

      // then
      expect(level).to.equal(0);
      expect(pixScore).to.equal(0);
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
