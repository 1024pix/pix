const { domainBuilder, expect, sinon } = require('../../../test-helper');

const service = require('../../../../lib/domain/services/assessment-service');
const certificationService = require('../../../../lib/domain/services/certification-service');
const answerService = require('../../../../lib/domain/services/answer-service');

const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const courseRepository = require('../../../../lib/infrastructure/repositories/course-repository');
const answerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const skillRepository = require('../../../../lib/infrastructure/repositories/skill-repository');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');

const Assessment = require('../../../../lib/domain/models/Assessment');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const CompetenceMark = require('../../../../lib/domain/models/CompetenceMark');
const Skill = require('../../../../lib/domain/models/Skill');
const scoring  = require('../../../../lib/domain/strategies/scoring/scoring');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Services | assessment', () => {

  describe('#fetchAssessment', () => {

    const COURSE_ID = 123;
    const COMPETENCE_ID = 'competence_id';
    const ASSESSMENT_ID = 836;

    const skill_web1 = domainBuilder.buildSkill({ name: '@web1' });
    const skill_web2 = domainBuilder.buildSkill({ name: '@web2' });

    const challenge_web1 = domainBuilder.buildChallenge({ id: 'challenge_web_1', skills: [skill_web1] });
    const challenge_web2 = domainBuilder.buildChallenge({ id: 'challenge_web_2', skills: [skill_web2] });

    const answer_web1_ok = domainBuilder.buildAnswer({ result: AnswerStatus.OK, assessmentId: ASSESSMENT_ID, challengeId: challenge_web1.id, });
    const answer_web2_ko = domainBuilder.buildAnswer({ result: AnswerStatus.KO, assessmentId: ASSESSMENT_ID, challengeId: challenge_web2.id, });

    const challenges = [challenge_web1, challenge_web2];
    const competence = domainBuilder.buildCompetence({ id: COMPETENCE_ID, skills: [skill_web1, skill_web2] });
    const course = domainBuilder.buildCourse({ id: COURSE_ID, competences: [COMPETENCE_ID] });
    const assessment = domainBuilder.buildAssessment({ id: ASSESSMENT_ID, type: Assessment.types.PLACEMENT, courseId: COURSE_ID });

    const sandbox = sinon.sandbox.create();

    beforeEach(() => {
      sandbox.stub(assessmentRepository, 'get');
      sandbox.stub(competenceRepository, 'get').resolves(competence);
      sandbox.stub(courseRepository, 'get').resolves(course);
      sandbox.stub(skillRepository, 'findByCompetenceId').resolves([new Skill({ name: '@web1' }), new Skill({ name: '@web2' })]);
      sandbox.stub(challengeRepository, 'findByCompetenceId').resolves(challenges);
      sandbox.stub(answerRepository, 'findByAssessment').resolves([answer_web1_ok, answer_web2_ko]);
      sandbox.stub(scoring, 'computeObtainedPixScore').returns(17);
      sandbox.stub(scoring, 'computeLevel').returns(2);
      sandbox.stub(answerService, 'getAnswersSuccessRate').returns(100);
      sandbox.stub(scoring, 'getValidatedSkills').returns(['@web1']);
      sandbox.stub(scoring, 'getFailedSkills').returns(['@web2']);
    });

    afterEach(() => {
      sandbox.restore();
    });

    context('when there is no assessment for given assessment ID', () => {

      it('should reject a domain NotFoundError', () => {
        // given
        const INVALID_ASSESSMENT_ID = 9999;
        assessmentRepository.get.resolves(null);

        // when
        const promise = service.fetchAssessment(INVALID_ASSESSMENT_ID);

        // then
        return expect(promise).to.have.been.rejectedWith(NotFoundError, `Unable to find assessment with ID ${INVALID_ASSESSMENT_ID}`);
      });
    });

    context('when an error occurred', () => {

      it('should rejects an error when assessment repository failed', () => {
        // given
        assessmentRepository.get.rejects(new Error('Access DB is failing'));

        // when
        const promise = service.fetchAssessment(ASSESSMENT_ID);

        // then
        return expect(promise).to.have.been.rejectedWith(Error, 'Access DB is failing');
      });

      it('should rejects an error when course repository failed', () => {
        // given
        assessmentRepository.get.resolves(assessment);
        courseRepository.get.rejects(new Error('Error from courseRepository'));

        // when
        const promise = service.fetchAssessment(ASSESSMENT_ID);

        // then
        return expect(promise).to.have.been.rejectedWith(Error, 'Error from courseRepository');
      });
    });

    context('when the assessment exists', () => {

      context('and has not type "placement"', () => {

        beforeEach(() => {
          const assessment = domainBuilder.buildAssessment({ id: ASSESSMENT_ID, type: Assessment.types.CERTIFICATION });
          assessmentRepository.get.resolves(assessment);
        });

        it('should resolve an Assessment', async () => {
          // when
          const response = await service.fetchAssessment(ASSESSMENT_ID);

          // then
          expect(response).to.be.an.instanceOf(Assessment);
        });

        it('should return an assessment with an estimated level of 0, a pix-score of 0 and a success rate of 100', async () => {
          // when
          const response = await service.fetchAssessment(ASSESSMENT_ID);

          // then
          expect(response.estimatedLevel).to.equal(0);
          expect(response.pixScore).to.equal(0);
          expect(response.successRate).to.equal(100);
        });
      });

      context('and has type "placement"', () => {

        beforeEach(() => {
          const assessment = domainBuilder.buildAssessment({ id: ASSESSMENT_ID, type: Assessment.types.PLACEMENT, courseId: COURSE_ID });
          assessmentRepository.get.resolves(assessment);
        });

        it('should resolve an Assessment', async () => {
          // when
          const response = await service.fetchAssessment(ASSESSMENT_ID);

          // then
          expect(response).to.be.an.instanceOf(Assessment);
        });

        it('should resolve the promise with a scored assessment', async () => {
          // when
          const response = await service.fetchAssessment(ASSESSMENT_ID);

          // then
          expect(response.id).to.equal(ASSESSMENT_ID);
          expect(response.courseId).to.equal(COURSE_ID);
          expect(response.pixScore).to.equal(17);
          expect(response.estimatedLevel).to.equal(2);
          expect(response.successRate).to.equal(100);
        });

        it('should call dependencies with good args', async () => {
          // when
          await service.fetchAssessment(ASSESSMENT_ID);

          // then
          expect(assessmentRepository.get).to.have.been.calledWithExactly(ASSESSMENT_ID);
          expect(answerRepository.findByAssessment).to.have.been.calledWithExactly(ASSESSMENT_ID);
          expect(answerService.getAnswersSuccessRate).to.have.been.calledOnce;
          expect(courseRepository.get).to.have.been.calledWithExactly(COURSE_ID);
          expect(skillRepository.findByCompetenceId).to.have.been.calledWithExactly(COMPETENCE_ID);
          expect(challengeRepository.findByCompetenceId).to.have.been.calledWithExactly(COMPETENCE_ID);
          expect(scoring.getValidatedSkills).to.have.been.calledOnce;
          expect(scoring.computeObtainedPixScore).to.have.been.calledOnce;
          expect(scoring.computeLevel).to.have.been.calledWithExactly(17);
        });
      });
    });
  });

  describe('#getSkillsReportAndCompetenceMarks', () => {

    const COURSE_ID = 123;
    const COMPETENCE_ID = 'competence_id';
    const ASSESSMENT_ID = 836;

    const skill_web1 = domainBuilder.buildSkill({ name: '@web1' });
    const skill_web2 = domainBuilder.buildSkill({ name: '@web2' });

    const challenge_web1 = domainBuilder.buildChallenge({ id: 'challenge_web_1', skills: [skill_web1] });
    const challenge_web2 = domainBuilder.buildChallenge({ id: 'challenge_web_2', skills: [skill_web2] });

    const answer_web1_ok = domainBuilder.buildAnswer({ result: AnswerStatus.OK, assessmentId: ASSESSMENT_ID, challengeId: challenge_web1.id, });
    const answer_web2_ko = domainBuilder.buildAnswer({ result: AnswerStatus.KO, assessmentId: ASSESSMENT_ID, challengeId: challenge_web2.id, });

    const challenges = [challenge_web1, challenge_web2];
    const competence = domainBuilder.buildCompetence({ id: COMPETENCE_ID,  index: '1.1', skills: [skill_web1, skill_web2] });
    const course = domainBuilder.buildCourse({ id: COURSE_ID, competences: [COMPETENCE_ID] });

    const sandbox = sinon.sandbox.create();

    beforeEach(() => {
      sandbox.stub(competenceRepository, 'get').resolves(competence);
      sandbox.stub(courseRepository, 'get').resolves(course);
      sandbox.stub(skillRepository, 'findByCompetenceId').resolves([skill_web1, skill_web2]);
      sandbox.stub(challengeRepository, 'findByCompetenceId').resolves(challenges);
      sandbox.stub(answerRepository, 'findByAssessment').resolves([answer_web1_ok, answer_web2_ko]);
      sandbox.stub(scoring, 'computeObtainedPixScore').returns(18);
      sandbox.stub(scoring, 'computeLevel').returns(2);
      sandbox.stub(scoring, 'getValidatedSkills').returns([skill_web1.name]);
      sandbox.stub(scoring, 'getFailedSkills').returns([skill_web2.name]);
    });

    afterEach(() => {
      sandbox.restore();
    });

    context('when the given assessment is null nor exist', () => {

      it('should reject a domain NotFoundError when assessment is undefined', () => {
        // when
        const promise = service.getSkillsReportAndCompetenceMarks();

        // then
        return expect(promise).to.have.been.rejectedWith(NotFoundError, 'Unable to get skills report nor competences mark without assessment');
      });

      it('should reject a domain NotFoundError when assessment is null', () => {
        // when
        const promise = service.getSkillsReportAndCompetenceMarks(null);

        // then
        return expect(promise).to.have.been.rejectedWith(NotFoundError, 'Unable to get skills report nor competences mark without assessment');
      });
    });

    context('when the given assessment type is "preview"', () => {

      it('should return a report with empty lists for validated and failed skills', async () => {
        // given
        const assessment = domainBuilder.buildAssessment({ id: ASSESSMENT_ID, type: Assessment.types.PREVIEW });

        // when
        const response = await service.getSkillsReportAndCompetenceMarks(assessment);

        // then
        expect(response).to.deep.equal({
          skills: {
            assessmentId: ASSESSMENT_ID,
            failedSkills: [],
            validatedSkills: []
          },
          competenceMarks: []
        });
      });
    });

    context('when the given assessment type is "demo"', () => {

      it('should return a report with empty lists for validated and failed skills', async () => {
        // given
        const assessment = domainBuilder.buildAssessment({ id: ASSESSMENT_ID, type: Assessment.types.DEMO });

        // when
        const response = await service.getSkillsReportAndCompetenceMarks(assessment);

        // then
        expect(response).to.deep.equal({
          skills: {
            assessmentId: ASSESSMENT_ID,
            failedSkills: [],
            validatedSkills: []
          },
          competenceMarks: []
        });
      });
    });

    context('when the given assessment type is "certification"', () => {

      beforeEach(() => {
        sandbox.stub(competenceRepository, 'list').resolves([
          { index: '1.1', area: { code: 'area_1' } },
          { index: '1.2', area: { code: 'area_2' } },
        ]);
        sandbox.stub(certificationService, 'calculateCertificationResultByAssessmentId').resolves({
          competencesWithMark: [
            {
              index: '1.1',
              obtainedLevel: 2,
              obtainedScore: 18,
            },
            {
              index: '1.2',
              obtainedLevel: 3,
              obtainedScore: 28,
            },
          ],
        });
      });

      afterEach(() => {
        sandbox.restore();
      });

      it('should get a list of all competence', async () => {
        // given
        const assessment = domainBuilder.buildAssessment({ id: ASSESSMENT_ID, type: Assessment.types.CERTIFICATION });

        // when
        await service.getSkillsReportAndCompetenceMarks(assessment);

        // then
        expect(competenceRepository.list).to.have.been.calledOnce;
      });

      it('should call certificationService to calculate the certification Result', async () => {
        // given
        const assessment = domainBuilder.buildAssessment({ id: ASSESSMENT_ID, type: Assessment.types.CERTIFICATION });

        // when
        await service.getSkillsReportAndCompetenceMarks(assessment);

        // then
        expect(certificationService.calculateCertificationResultByAssessmentId).to.have.been.calledOnce;
        expect(certificationService.calculateCertificationResultByAssessmentId).to.have.been.calledWithExactly(ASSESSMENT_ID);
      });

      it('should return a skill report and a list of competences Mark with all information', async () => {
        // given
        const assessment = domainBuilder.buildAssessment({ id: ASSESSMENT_ID, type: Assessment.types.CERTIFICATION });

        // when
        const response = await service.getSkillsReportAndCompetenceMarks(assessment);

        // then
        expect(response.skills).to.deep.equal({
          assessmentId: ASSESSMENT_ID,
          failedSkills: [skill_web2.name],
          validatedSkills: [skill_web1.name]
        });

        expect(response.competenceMarks).to.have.lengthOf(2);

        expect(response.competenceMarks[0]).to.be.an.instanceOf(CompetenceMark);
        expect(response.competenceMarks[0].level).to.deep.equal(2);
        expect(response.competenceMarks[0].score).to.deep.equal(18);
        expect(response.competenceMarks[0].area_code).to.deep.equal('area_1');
        expect(response.competenceMarks[0].competence_code).to.deep.equal('1.1');

        expect(response.competenceMarks[1]).to.be.an.instanceOf(CompetenceMark);
        expect(response.competenceMarks[1].level).to.deep.equal(3);
        expect(response.competenceMarks[1].score).to.deep.equal(28);
        expect(response.competenceMarks[1].area_code).to.deep.equal('area_2');
        expect(response.competenceMarks[1].competence_code).to.deep.equal('1.2');
      });
    });

    context('when the given assessment type is "placement"', () => {

      it('should return a skill report and a list of competences Mark with all information', async () => {
        // given
        const assessment = domainBuilder.buildAssessment({
          id: ASSESSMENT_ID,
          type: Assessment.types.PLACEMENT,
          courseId: COURSE_ID
        });

        // when
        const response = await service.getSkillsReportAndCompetenceMarks(assessment);

        // then
        expect(response.skills).to.deep.equal({
          assessmentId: assessment.id,
          validatedSkills: [skill_web1.name],
          failedSkills: [skill_web2.name]
        });

        expect(response.competenceMarks).to.have.lengthOf(1);
        expect(response.competenceMarks[0]).to.be.an.instanceOf(CompetenceMark);
        expect(response.competenceMarks[0].level).to.equal(2);
        expect(response.competenceMarks[0].score).to.equal(18);
        expect(response.competenceMarks[0].area_code).to.deep.equal(competence.area.code);
        expect(response.competenceMarks[0].competence_code).to.deep.equal('1.1');
      });

      it('should call dependencies with good args', async () => {
        // given
        const assessment = domainBuilder.buildAssessment({
          id: ASSESSMENT_ID,
          type: Assessment.types.PLACEMENT,
          courseId: COURSE_ID
        });

        // when
        await service.getSkillsReportAndCompetenceMarks(assessment);

        // then
        expect(courseRepository.get).to.have.been.calledWithExactly(COURSE_ID);
        expect(skillRepository.findByCompetenceId).to.have.been.calledWithExactly(COMPETENCE_ID);
        expect(answerRepository.findByAssessment).to.have.been.calledWithExactly(ASSESSMENT_ID);
        expect(challengeRepository.findByCompetenceId).to.have.been.calledWithExactly(COMPETENCE_ID);
        expect(scoring.getValidatedSkills).to.have.been.calledOnce;
        expect(scoring.getFailedSkills).to.have.been.calledOnce;
        expect(scoring.computeObtainedPixScore).to.have.been.calledOnce;
        expect(scoring.computeLevel).to.have.been.calledOnce;
        expect(competenceRepository.get).to.have.been.calledWithExactly(COMPETENCE_ID);
      });
    });
  });
});
