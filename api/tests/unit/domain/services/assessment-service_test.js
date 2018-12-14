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
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const CompetenceMark = require('../../../../lib/domain/models/CompetenceMark');
const Skill = require('../../../../lib/domain/models/Skill');
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
      sandbox.stub(skillRepository, 'findByCompetenceId').resolves(new Set([new Skill({ name: '@web1' }), new Skill({ name: '@web2' })]));
      sandbox.stub(challengeRepository, 'findByCompetenceId').resolves(challenges);
      sandbox.stub(answerRepository, 'findByAssessment').resolves([answer_web1_ok, answer_web2_ko]);
      sandbox.stub(AssessmentResult, 'ComputePixScore').returns(17);
      sandbox.stub(AssessmentResult, 'ComputeLevel').returns(2);
      sandbox.stub(answerService, 'getAnswersSuccessRate').returns(100);
      sandbox.stub(AssessmentResult, 'GetValidatedSkills').returns(['@web1']);
      sandbox.stub(AssessmentResult, 'GetFailedSkills').returns(['@web2']);
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

        it('should resolve an object with properties "assessmentPix" and "skills"', async () => {
          // when
          const response = await service.fetchAssessment(ASSESSMENT_ID);

          // then
          expect(response).to.have.property('assessmentPix');
          expect(response.assessmentPix).to.be.an.instanceOf(Assessment);

          expect(response).to.have.property('skills');
          expect(response.skills).to.be.null;
        });

        it('should return an assessment with an estimated level of 0, a pix-score of 0 and a success rate of 100', async () => {
          // when
          const response = await service.fetchAssessment(ASSESSMENT_ID);

          // then
          expect(response.assessmentPix.estimatedLevel).to.equal(0);
          expect(response.assessmentPix.pixScore).to.equal(0);
          expect(response.assessmentPix.successRate).to.equal(100);
        });
      });

      context('and has type "placement"', () => {

        beforeEach(() => {
          const assessment = domainBuilder.buildAssessment({ id: ASSESSMENT_ID, type: Assessment.types.PLACEMENT, courseId: COURSE_ID });
          assessmentRepository.get.resolves(assessment);
        });

        it('should resolve an object with properties "assessmentPix" and "skills"', async () => {
          // when
          const response = await service.fetchAssessment(ASSESSMENT_ID);

          // then
          expect(response).to.have.property('assessmentPix');
          expect(response.assessmentPix).to.be.an.instanceOf(Assessment);

          expect(response).to.have.property('skills');
          expect(response.skills).to.exist;
        });

        it('should resolve the promise with a scored assessment', async () => {
          // when
          const response = await service.fetchAssessment(ASSESSMENT_ID);

          // then
          expect(response.assessmentPix.id).to.equal(ASSESSMENT_ID);
          expect(response.assessmentPix.courseId).to.equal(COURSE_ID);
          expect(response.assessmentPix.pixScore).to.equal(17);
          expect(response.assessmentPix.estimatedLevel).to.equal(2);
          expect(response.assessmentPix.successRate).to.equal(100);

          expect(response.skills.assessmentId).to.equal(ASSESSMENT_ID);
          expect(response.skills.validatedSkills).to.deep.equal(['@web1']);
          expect(response.skills.failedSkills).to.deep.equal(['@web2']);
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
          expect(AssessmentResult.ComputePixScore).to.have.been.calledOnce;
          expect(AssessmentResult.ComputeLevel).to.have.been.calledWithExactly(17);
          expect(AssessmentResult.GetValidatedSkills).to.have.been.calledOnce;
          expect(AssessmentResult.GetFailedSkills).to.have.been.calledOnce;
        });
      });
    });
  });

  describe('#getSkillsReport', () => {

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

    const sandbox = sinon.sandbox.create();

    beforeEach(() => {
      sandbox.stub(competenceRepository, 'get').resolves(competence);
      sandbox.stub(courseRepository, 'get').resolves(course);
      sandbox.stub(skillRepository, 'findByCompetenceId').resolves([skill_web1, skill_web2]);
      sandbox.stub(challengeRepository, 'findByCompetenceId').resolves(challenges);
      sandbox.stub(answerRepository, 'findByAssessment').resolves([answer_web1_ok, answer_web2_ko]);
      sandbox.stub(AssessmentResult, 'ComputePixScore').returns(2);
      sandbox.stub(AssessmentResult, 'ComputeLevel').returns(2);
      sandbox.stub(AssessmentResult, 'GetValidatedSkills').returns(['@web1']);
      sandbox.stub(AssessmentResult, 'GetFailedSkills').returns(['@web2']);
    });

    afterEach(() => {
      sandbox.restore();
    });

    context('when the given assessment is null nor exist', () => {

      it('should reject a domain NotFoundError when assessment is undefined', () => {
        // when
        const promise = service.getSkillsReport();

        // then
        return expect(promise).to.have.been.rejectedWith(NotFoundError, 'Unable to getSkillsReport without assessment');
      });

      it('should reject a domain NotFoundError when assessment is null', () => {
        // when
        const promise = service.getSkillsReport(null);

        // then
        return expect(promise).to.have.been.rejectedWith(NotFoundError, 'Unable to getSkillsReport without assessment');
      });
    });

    context('when the given assessment’s type is "preview"', () => {

      it('should return a report with empty lists for validated and failed skills', async () => {
        // given
        const assessment = domainBuilder.buildAssessment({ id: ASSESSMENT_ID, type: Assessment.types.PREVIEW });

        // when
        const skillsReport = await service.getSkillsReport(assessment);

        // then
        expect(skillsReport).to.deep.equal({
          assessmentId: assessment.id,
          validatedSkills: [],
          failedSkills: []
        });
      });
    });

    context('when the given assessment’s type is "certification"', () => {

      it('should return a report with empty lists for validated and failed skills', async () => {
        // given
        const assessment = domainBuilder.buildAssessment({ id: ASSESSMENT_ID, type: Assessment.types.CERTIFICATION });

        // when
        const skillsReport = await service.getSkillsReport(assessment);

        // then
        expect(skillsReport).to.deep.equal({
          assessmentId: assessment.id,
          validatedSkills: [],
          failedSkills: []
        });
      });
    });

    context('when the given assessment’s type is "demo"', () => {

      it('should return a report with empty lists for validated and failed skills', async () => {
        // given
        const assessment = domainBuilder.buildAssessment({ id: ASSESSMENT_ID, type: Assessment.types.DEMO });

        // when
        const skillsReport = await service.getSkillsReport(assessment);

        // then
        expect(skillsReport).to.deep.equal({
          assessmentId: assessment.id,
          validatedSkills: [],
          failedSkills: []
        });
      });
    });

    context('when the given assessment’s type is "placement"', () => {

      it('should resolve the promise with validated and failed skills', async () => {
        // given
        const assessment = domainBuilder.buildAssessment({
          id: ASSESSMENT_ID,
          type: Assessment.types.PLACEMENT,
          courseId: COURSE_ID
        });

        // when
        const skillsReport = await service.getSkillsReport(assessment);

        // then
        return expect(skillsReport).to.deep.equal({
          assessmentId: assessment.id,
          validatedSkills: ['@web1'],
          failedSkills: ['@web2']
        });
      });
    });
  });

  describe('#getCompetenceMarks', () => {

    context('when assessment’s type is "placement"', () => {
      const COURSE_ID = 'course_id';
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
      const assessment = domainBuilder.buildAssessment({ id: ASSESSMENT_ID, type: Assessment.types.PLACEMENT, courseId: COURSE_ID });

      const sandbox = sinon.sandbox.create();

      beforeEach(() => {
        sandbox.stub(competenceRepository, 'get').resolves(competence);
        sandbox.stub(courseRepository, 'get').resolves(course);
        sandbox.stub(skillRepository, 'findByCompetenceId').resolves(new Set([new Skill({ name: '@web1' }), new Skill({ name: '@web2' })]));
        sandbox.stub(challengeRepository, 'findByCompetenceId').resolves(challenges);
        sandbox.stub(answerRepository, 'findByAssessment').resolves([answer_web2_ko, answer_web1_ok]);
        sandbox.stub(AssessmentResult, 'ComputePixScore').returns(18);
        sandbox.stub(AssessmentResult, 'ComputeLevel').returns(2);
      });

      afterEach(() => {
        sandbox.restore();
      });

      it('should return an array of Competence Marks', async () => {
        // when
        const competenceMarks = await service.getCompetenceMarks(assessment);

        // then
        expect(competenceMarks).to.have.lengthOf(1);
        expect(competenceMarks[0]).to.be.an.instanceOf(CompetenceMark);
        expect(competenceMarks[0].level).to.equal(2);
        expect(competenceMarks[0].score).to.equal(18);
        expect(competenceMarks[0].area_code).to.deep.equal(competence.area.code);
        expect(competenceMarks[0].competence_code).to.deep.equal('1.1');
      });

      it('should call dependencies with good args', async () => {
        // when
        await service.getCompetenceMarks(assessment);

        // then
        expect(courseRepository.get).to.have.been.calledWithExactly(COURSE_ID);
        expect(answerRepository.findByAssessment).to.have.been.calledWithExactly(ASSESSMENT_ID);
        expect(skillRepository.findByCompetenceId).to.have.been.calledWithExactly(COMPETENCE_ID);
        expect(challengeRepository.findByCompetenceId).to.have.been.calledWithExactly(COMPETENCE_ID);
        expect(AssessmentResult.ComputePixScore).to.have.been.calledOnce;
        expect(AssessmentResult.ComputeLevel).to.have.been.calledOnce;
        expect(competenceRepository.get).to.have.been.calledWithExactly(COMPETENCE_ID);
      });
    });

    context('when assessment’s type is "certification"', () => {
      const assessment = domainBuilder.buildAssessment({ id: 1, type: Assessment.types.CERTIFICATION });

      const sandbox = sinon.sandbox.create();

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

      it('should get a list of all competence', () => {
        // when
        const promise = service.getCompetenceMarks(assessment);

        // then
        return promise.then(() => {
          expect(competenceRepository.list).to.have.been.calledOnce;
        });
      });

      it('should call certificationService to calculate the certification Result', () => {
        // when
        const promise = service.getCompetenceMarks(assessment);

        // then
        return promise.then(() => {
          expect(certificationService.calculateCertificationResultByAssessmentId).to.have.been.calledOnce;
          expect(certificationService.calculateCertificationResultByAssessmentId).to.have.been.calledWithExactly(1);
        });
      });

      it('should return a list of Competence Marks with all informations', () => {
        // when
        const promise = service.getCompetenceMarks(assessment);

        // then
        return promise.then((result) => {
          expect(result).to.have.lengthOf(2);

          expect(result[0]).to.be.an.instanceOf(CompetenceMark);
          expect(result[0].level).to.deep.equal(2);
          expect(result[0].score).to.deep.equal(18);
          expect(result[0].area_code).to.deep.equal('area_1');
          expect(result[0].competence_code).to.deep.equal('1.1');

          expect(result[1]).to.be.an.instanceOf(CompetenceMark);
          expect(result[1].level).to.deep.equal(3);
          expect(result[1].score).to.deep.equal(28);
          expect(result[1].area_code).to.deep.equal('area_2');
          expect(result[1].competence_code).to.deep.equal('1.2');
        });
      });
    });

    context('when assessment is not a Certification/Placement', () => {

      it('should return an empty array', () => {
        // given
        const assessment = domainBuilder.buildAssessment({ type: Assessment.types.DEMO });

        // when
        const result = service.getCompetenceMarks(assessment);

        // then
        expect(result).to.deep.equal([]);
      });
    });
  });

  describe('#isCertificationAssessment', () => {

    context('if assessment type is \'CERTIFICATION\'', () => {
      it('should return true', () => {
        // given
        const assessment = domainBuilder.buildAssessment({ type: Assessment.types.CERTIFICATION });

        // when
        const result = service.isCertificationAssessment(assessment);

        // then
        expect(result).to.be.true;
      });
    });

    context('if assessment type is different of \'CERTIFICATION\'', () => {
      it('should return false', () => {
        // given
        const assessment = domainBuilder.buildAssessment({ type: 'RANDOM TYPE' });

        // when
        const result = service.isCertificationAssessment(assessment);

        // then
        expect(result).to.be.false;
      });
    });
  });

  describe('#isDemoAssessment', () => {
    it('should return true when the assessment is a DEMO', () => {
      // given
      const assessment = domainBuilder.buildAssessment({ type: Assessment.types.DEMO });

      // when
      const isDemoAssessment = service.isDemoAssessment(assessment);

      // then
      expect(isDemoAssessment).to.be.true;
    });

    it('should return true when the assessment is not defined', () => {
      // given
      const assessment = domainBuilder.buildAssessment({ type: '' });

      // when
      const isDemoAssessment = service.isDemoAssessment(assessment);

      // then
      expect(isDemoAssessment).to.be.false;
    });

  });
});
