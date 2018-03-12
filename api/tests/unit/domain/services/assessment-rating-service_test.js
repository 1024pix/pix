const { expect, sinon } = require('../../../test-helper');
const faker = require('faker');

const service = require('../../../../lib/domain/services/assessment-rating-service');
const assessmentService = require('../../../../lib/domain/services/assessment-service');
const skillsService = require('../../../../lib/domain/services/skills-service');
const certificationService = require('../../../../lib/domain/services/certification-service');

const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const assessmentResultRepository = require('../../../../lib/infrastructure/repositories/assessment-result-repository');
const courseRepository = require('../../../../lib/infrastructure/repositories/course-repository');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');
const competenceMarkRepository = require('../../../../lib/infrastructure/repositories/competence-mark-repository');
const certificationCourseRepository = require('../../../../lib/infrastructure/repositories/certification-course-repository');

const Assessment = require('../../../../lib/domain/models/Assessment');
const Area = require('../../../../lib/domain/models/Area');
const Competence = require('../../../../lib/domain/models/referential/competence');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const AirtableCourse = require('../../../../lib/domain/models/referential/course');
const Skill = require('../../../../lib/cat/skill');

const { NotFoundError, AlreadyRatedAssessmentError } = require('../../../../lib/domain/errors');

function _buildCompetence(competence_code, area_code) {
  const competence = new Competence();

  const defaultCompetenceInfos = {
    name: faker.random.uuid(),
    index: `${area_code}.${competence_code}`,
    areaId: ['recdmN2Exvq2oAPap'],
    courseId: 'recvNIWtjJRyBCd0P',
    reference: `${area_code}.${competence_code} bla bla bla`,
    skills: undefined,
    area: new Area({ id: 'recdmN2Exvq2oAPap', code: `${area_code}`, title: 'Information et données' })
  };

  Object.assign(competence, defaultCompetenceInfos);

  return competence;
}

describe('Unit | Domain | Services | assessment-ratings', () => {

  describe('#evaluateFromAssessmentId', () => {

    const assessmentId = 1;
    const assessmentResultId = 1;

    const assessmentCourseId = 'recHzEA6lN4PEs7LG';
    const competenceId = 'competenceId';

    let evaluatedSkills;
    let course;
    let sandbox;

    let competence11;
    let competence12;
    let competence21;
    let competence22;
    let listOfAllCompetences = [];

    let assessment;

    let competenceMarksForCertification;
    let competenceMarksForPlacement;

    beforeEach(() => {

      assessment = new Assessment({
        id: assessmentId,
        courseId: assessmentCourseId,
        userId: 5,
        state: 'started',
        type: 'PLACEMENT'
      });

      evaluatedSkills = {
        assessmentId: assessmentId,
        validatedSkills: _generateValitedSkills(),
        failedSkills: _generateFailedSkills()
      };

      competenceMarksForCertification = [{
        competence_code: '1.1',
        area_code: '1',
        level: 0,
        score: 7
      }, {
        competence_code: '2.1',
        area_code: '2',
        level: 2,
        score: 19
      }, {
        competence_code: '2.2',
        area_code: '2',
        level: -1,
        score: 0
      }];

      competenceMarksForPlacement = [{
        competence_code: '1.1',
        area_code: '1',
        level: 3,
        score: 18
      }];

      competence11 = _buildCompetence('1', '1');
      competence12 = _buildCompetence('1', '2');
      competence21 = _buildCompetence('2', '1');
      competence22 = _buildCompetence('2', '2');

      listOfAllCompetences = [competence11, competence12, competence21, competence22];

      course = new AirtableCourse();
      course.id = assessmentCourseId;
      course.name = 'Mener une recherche';
      course.competences = [competenceId];

      sandbox = sinon.sandbox.create();

      sandbox.stub(assessmentService, 'getSkills').resolves(evaluatedSkills);
      sandbox.stub(assessmentService, 'getCompetenceMarks').resolves(competenceMarksForPlacement);
      sandbox.stub(assessmentRepository, 'save').resolves();
      sandbox.stub(assessmentResultRepository, 'save').resolves({ id: assessmentResultId });
      sandbox.stub(assessmentRepository, 'get').resolves(assessment);
      sandbox.stub(skillsService, 'saveAssessmentSkills').resolves();
      sandbox.stub(courseRepository, 'get').resolves(course);
      sandbox.stub(competenceRepository, 'get').resolves(competence11);
      sandbox.stub(competenceRepository, 'list').resolves(listOfAllCompetences);
      sandbox.stub(competenceMarkRepository, 'save').resolves();
      sandbox.stub(certificationService, 'calculateCertificationResultByAssessmentId').resolves();
      sandbox.stub(certificationCourseRepository, 'changeCompletedDate').resolves();

    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should reject with a NotFoundError when the assessment does not exist', () => {
      // given
      const assessmentIdThatDoesNotExist = 25672;
      assessmentRepository.get.resolves(null);

      // when
      const promise = service.evaluateFromAssessmentId(assessmentIdThatDoesNotExist);

      // then
      return expect(promise).to.be.rejectedWith(NotFoundError);
    });

    context('when the assessment is already evaluated', () => {

      it('should reject an AlreadyRatedAssessmentError', () => {
        // given
        const alreadyEvaluatedAssessment = new Assessment({
          id: assessmentId,
          courseId: assessmentCourseId,
          userId: 5,
          state: 'completed',
          type: 'PLACEMENT'
        });

        assessmentRepository.get.resolves(alreadyEvaluatedAssessment);

        // when
        const promise = service.evaluateFromAssessmentId(assessmentId);

        // then
        return expect(promise).to.be.rejectedWith(AlreadyRatedAssessmentError);
      });

    });

    it('should reject a not found error when we cannot have skills', () => {
      // given
      assessmentService.getSkills.rejects(new NotFoundError());

      // when
      const promise = service.evaluateFromAssessmentId(assessmentId);

      // then
      return expect(promise).to.have.been.rejectedWith(NotFoundError);
    });

    it('should change the assessment status', () => {
      // when
      const promise = service.evaluateFromAssessmentId(assessmentId);

      // then
      return promise.then(() => {
        const savedCompetenceMark = assessmentRepository.save.firstCall.args;
        expect(savedCompetenceMark[0]).to.deep.equal(new Assessment({
          id: assessmentId,
          courseId: assessmentCourseId,
          userId: 5,
          state: 'completed',
          type: 'PLACEMENT'
        }));
      });
    });

    it('should save the evaluated skills', () => {
      // when
      const promise = service.evaluateFromAssessmentId(assessmentId);

      // then
      return promise.then(() => {
        expect(skillsService.saveAssessmentSkills).to.have.been.calledWith(evaluatedSkills);
      });
    });

    it('should create a new assessment result', () => {
      // given
      const assessmentResult = new AssessmentResult({
        level: 2,
        pixScore: 18,
        emitter: 'PIX-ALGO',
        comment: 'Computed',
        status: 'validated',
        assessmentId: assessmentId
      });

      // when
      const promise = service.evaluateFromAssessmentId(assessmentId);

      // then
      return promise.then(() => {
        expect(assessmentResultRepository.save).to.have.been.calledWith(assessmentResult);
      });
    });

    context('when the assessment is a PLACEMENT', () => {

      beforeEach(() => {
        assessmentService.getCompetenceMarks.resolves(competenceMarksForPlacement);

      });

      it('should retrieve the skills', () => {
        // when
        const promise = service.evaluateFromAssessmentId(assessmentId);

        // then
        return promise.then(() => {
          expect(assessmentService.getSkills).to.have.been.calledWith(assessmentId);
        });
      });

      it('should retrieve the competenceMarks', () => {
        // when
        const promise = service.evaluateFromAssessmentId(assessmentId);

        // then
        return promise.then(() => {
          expect(assessmentService.getCompetenceMarks).to.have.been.calledWith(assessment);
        });
      });

      it('should save the evaluated competence', () => {
        // when
        const promise = service.evaluateFromAssessmentId(assessmentId);

        // then
        return promise.then(() => {
          expect(competenceMarkRepository.save).to.have.been.called;

          const savedCompetenceMark = competenceMarkRepository.save.firstCall.args;
          expect(savedCompetenceMark[0]).to.deep.equal({
            level: 3,
            score: 18,
            area_code: '1',
            competence_code: '1.1',
            assessmentResultId: assessmentResultId
          });
        });
      });

      it('should not try to evaluate as a certification', () => {
        // when
        const promise = service.evaluateFromAssessmentId(assessmentId);

        // then
        return promise.then(() => {
          expect(certificationService.calculateCertificationResultByAssessmentId).not.to.have.been.calledWith(assessmentId);
        });
      });

      context('when the saving the mark is failing', () => {
        it('should return the error', () => {
          // given
          const error = new Error();
          competenceMarkRepository.save.rejects(error);

          // when
          const promise = service.evaluateFromAssessmentId(assessmentId);

          // then
          return expect(promise).to.be.rejected;
        });
      });

    });

    context('when the assessment is a PREVIEW', () => {

      const previewAssessment = new Assessment({
        id: assessmentId,
        courseId: 'nullCourseId',
        userId: 5,
        status: 'started',
        type: 'PREVIEW'
      });

      beforeEach(() => {
        assessmentRepository.get.resolves(previewAssessment);
        assessmentService.getCompetenceMarks.resolves([]);
      });

      it('should try to save the related marks', () => {
        // when
        const promise = service.evaluateFromAssessmentId(assessmentId);

        // then
        return promise.then(() => {
          expect(competenceMarkRepository.save).not.to.have.been.called;
        });
      });
    });

    context('when the assessment is a DEMO', () => {

      let demoAssessment;

      beforeEach(() => {

        demoAssessment = new Assessment({
          id: assessmentId,
          courseId: 'nullCourseId',
          userId: 5,
          state: 'started',
          type: 'DEMO'
        });
        assessmentRepository.get.resolves(demoAssessment);
        assessmentService.getCompetenceMarks.resolves([]);
      });

      it('should not try to save the related marks', () => {
        // when
        const promise = service.evaluateFromAssessmentId(assessmentId);

        // then
        return promise.then(() => {
          expect(competenceMarkRepository.save).not.to.have.been.called;
        });
      });

      it('should not update the certification status', () => {
        // when
        const promise = service.evaluateFromAssessmentId(assessmentId);

        // then
        return promise.then(() => {
          expect(certificationCourseRepository.changeCompletedDate).not.to.have.been.called;
        });
      });
    });

    context('when the assessment is a CERTIFICATION', () => {

      let clock;

      const certificationResults = {
        competencesWithCompetenceMark: [{
          index: '1.1',
          id: 'competence_1',
          name: 'Mener une recherche',
          obtainedLevel: 0,
          obtainedScore: 7
        }, {
          index: '2.1',
          id: 'competence_2',
          name: 'Partager',
          obtainedLevel: 2,
          obtainedScore: 19
        }, {
          index: '2.2',
          id: 'competence_3',
          name: 'Adapter',
          obtainedLevel: -1,
          obtainedScore: 0
        }],
        totalScore: 26
      };

      let assessment;

      beforeEach(() => {
        assessment = new Assessment({
          id: assessmentId,
          courseId: assessmentCourseId,
          userId: 5,
          type: 'CERTIFICATION',
          state: 'started'
        });

        assessmentRepository.get.resolves(assessment);
        certificationService.calculateCertificationResultByAssessmentId.resolves(certificationResults);
        assessmentService.getCompetenceMarks.resolves(competenceMarksForCertification);

        clock = sinon.useFakeTimers(new Date('2018-02-04T01:00:00.000+01:00'));
      });

      afterEach(() => clock.restore());

      it('should persists a mark for each evaluated competence', () => {
        // when
        const promise = service.evaluateFromAssessmentId(assessmentId);

        // then
        return promise.then(() => {
          expect(competenceMarkRepository.save).to.have.been.calledThrice;

          const firstSavedCompetenceMark = competenceMarkRepository.save.firstCall.args;
          expect(firstSavedCompetenceMark[0]).to.deep.equal({
            level: 0,
            score: 7,
            area_code: '1',
            competence_code: '1.1',
            assessmentResultId: assessmentResultId
          });

          const secondSavedCompetenceMark = competenceMarkRepository.save.secondCall.args;
          expect(secondSavedCompetenceMark[0]).to.deep.equal({
            level: 2,
            score: 19,
            area_code: '2',
            competence_code: '2.1',
            assessmentResultId: assessmentResultId
          });

          const thirdSavedCompetenceMark = competenceMarkRepository.save.thirdCall.args;
          expect(thirdSavedCompetenceMark[0]).to.deep.equal({
            level: -1,
            score: 0,
            area_code: '2',
            competence_code: '2.2',
            assessmentResultId: assessmentResultId
          });
        });
      });

      it('should create a new assessment result', () => {
        // given
        const assessmentResult = new AssessmentResult({
          level: 3,
          pixScore: 26,
          emitter: 'PIX-ALGO',
          comment: 'Computed',
          status: 'validated',
          assessmentId: assessmentId
        });

        // when
        const promise = service.evaluateFromAssessmentId(assessmentId);

        // then
        return promise.then(() => {
          expect(assessmentResultRepository.save).to.have.been.calledWith(assessmentResult);
        });
      });

      it('should save assessment with status completed', () => {
        const expectedAssessment = new Assessment({
          id: assessmentId,
          courseId: assessmentCourseId,
          userId: 5,
          state: 'completed',
          type: 'CERTIFICATION'
        });

        // when
        const promise = service.evaluateFromAssessmentId(assessmentId);

        // then
        return promise.then(() => {
          expect(assessmentRepository.save).to.have.been.calledWith(expectedAssessment);

          const savedAssessment = assessmentRepository.save.firstCall.args;
          expect(savedAssessment[0]).to.deep.equal(expectedAssessment);
        });
      });

      // TODO: Remove
      it('should update the certification course date', () => {
        // when
        const promise = service.evaluateFromAssessmentId(assessmentId);

        // then
        return promise.then(() => {
          expect(certificationCourseRepository.changeCompletedDate).to.have.been.calledWith(assessmentCourseId, '2018-02-04T00:00:00.000Z');
        });
      });

      context('when updating the certification course status is failing', () => {
        it('should return the raised error', () => {
          // given
          const error = new Error();
          certificationCourseRepository.changeCompletedDate.rejects(error);

          // when
          const promise = service.evaluateFromAssessmentId(assessmentId);

          // then
          return expect(promise).to.be.rejectedWith(error);
        });
      });
    });
  });
});

function _generateValitedSkills() {
  const url2 = new Skill('@url2');
  const web3 = new Skill('@web3');
  const skills = new Set();
  skills.add(url2);
  skills.add(web3);

  return skills;
}

function _generateFailedSkills() {
  const recherche2 = new Skill('@recherch2');
  const securite3 = new Skill('@securite3');
  const skill = new Set();
  skill.add(recherche2);
  skill.add(securite3);

  return skill;
}
