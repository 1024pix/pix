const { expect, sinon } = require('../../../test-helper');
const faker = require('faker');

const service = require('../../../../lib/domain/services/assessment-rating-service');
const assessmentService = require('../../../../lib/domain/services/assessment-service');
const skillsService = require('../../../../lib/domain/services/skills-service');
const certificationService = require('../../../../lib/domain/services/certification-service');

const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const courseRepository = require('../../../../lib/infrastructure/repositories/course-repository');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');
const markRepository = require('../../../../lib/infrastructure/repositories/mark-repository');
const certificationCourseRepository = require('../../../../lib/infrastructure/repositories/certification-course-repository');

const Assessment = require('../../../../lib/domain/models/Assessment');
const Area = require('../../../../lib/domain/models/Area');
const Competence = require('../../../../lib/domain/models/referential/competence');
const Mark = require('../../../../lib/domain/models/Mark');
const AirtableCourse = require('../../../../lib/domain/models/referential/course');
const Skill = require('../../../../lib/cat/skill');

const { NotFoundError, AlreadyRatedAssessmentError } = require('../../../../lib/domain/errors');

function _buildCompetence(competence_code, area_code) {
  const competence = new Competence();

  const defaultInfos = {
    name : faker.random.uuid(),
    index : `${area_code}.${competence_code}`,
    areaId : ['recdmN2Exvq2oAPap'],
    courseId : 'recvNIWtjJRyBCd0P',
    reference : `${area_code}.${competence_code} bla bla bla`,
    skills : undefined,
    area : new Area({ id: 'recdmN2Exvq2oAPap', code: `${area_code}`, title: 'Information et données' })
  };

  Object.assign(competence, defaultInfos);

  return competence;
}

describe('Unit | Domain | Services | assessment-ratings', () => {

  describe('#evaluateFromAssessmentId', () => {

    const assessmentId = 1;
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

    const assessmentWithScore = new Assessment({
      id: assessmentId,
      courseId: assessmentCourseId,
      userId: 5,
      estimatedLevel: 2,
      pixScore: 13,
      type: 'PLACEMENT'
    });

    const assessmentWithoutScore = new Assessment({
      id: assessmentId,
      courseId: assessmentCourseId,
      userId: 5,
      type: 'PLACEMENT'
    });

    beforeEach(() => {

      evaluatedSkills = {
        assessmentId: assessmentId,
        validatedSkills: _generateValitedSkills(),
        failedSkills: _generateFailedSkills()
      };

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

      sandbox.stub(assessmentService, 'fetchAssessment').resolves({
        assessmentPix: assessmentWithScore,
        skills: evaluatedSkills
      });
      sandbox.stub(assessmentRepository, 'save').resolves();
      sandbox.stub(assessmentRepository, 'get').resolves(assessmentWithoutScore);
      sandbox.stub(skillsService, 'saveAssessmentSkills').resolves();
      sandbox.stub(courseRepository, 'get').resolves(course);
      sandbox.stub(competenceRepository, 'get').resolves(competence11);
      sandbox.stub(competenceRepository, 'list').resolves(listOfAllCompetences);
      sandbox.stub(markRepository, 'save').resolves();
      sandbox.stub(certificationService, 'calculateCertificationResultByAssessmentId').resolves();
      sandbox.stub(certificationCourseRepository, 'updateStatus').resolves();

    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should retrieve assessment informations', () => {
      // when
      const promise = service.evaluateFromAssessmentId(assessmentId);

      // then
      return promise.then(() => {
        expect(assessmentService.fetchAssessment).to.have.been.calledWith(assessmentId);
      });
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
        assessmentRepository.get.resolves(assessmentWithScore);

        // when
        const promise = service.evaluateFromAssessmentId(assessmentId);

        // then
        return expect(promise).to.be.rejectedWith(AlreadyRatedAssessmentError);
      });

    });

    it('should reject a not found error when the placement does not exists', () => {
      // given
      assessmentService.fetchAssessment.rejects(new NotFoundError());

      // when
      const promise = service.evaluateFromAssessmentId(assessmentId);

      // then
      return expect(promise).to.have.been.rejectedWith(NotFoundError);
    });

    it('should save the assessment score', () => {
      // when
      const promise = service.evaluateFromAssessmentId(assessmentId);

      // then
      return promise.then(() => {
        expect(assessmentRepository.save).to.have.been.calledWith(assessmentWithScore);
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

    context('when the assessment is a PLACEMENT', () => {

      it('should retrieve the course', () => {
        // when
        const promise = service.evaluateFromAssessmentId(assessmentId);

        // then
        return promise.then(() => {
          expect(courseRepository.get).to.have.been.calledWith(assessmentCourseId);
        });
      });

      it('should load the competence details', () => {
        // when
        const promise = service.evaluateFromAssessmentId(assessmentId);

        // then
        return promise.then(() => {
          expect(competenceRepository.get).to.have.been.calledWith(competenceId);
        });
      });

      it('should save the evaluated competence', () => {
        // when
        const promise = service.evaluateFromAssessmentId(assessmentId);

        // then
        return promise.then(() => {
          expect(markRepository.save).to.have.been.called;

          const savedMark = markRepository.save.firstCall.args;
          expect(savedMark[0]).to.deep.equal(new Mark({
            level: 2,
            score: 13,
            area_code: '1',
            competence_code: '1.1',
            assessmentId: assessmentId
          }));
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
          markRepository.save.rejects(error);

          // when
          const promise = service.evaluateFromAssessmentId(assessmentId);

          // then
          return expect(promise).to.be.rejected;
        });
      });

    });

    context('when the assessment is a PREVIEW', () => {

      const assessmentWithScore = new Assessment({
        id: assessmentId,
        courseId: 'nullCourseId',
        userId: 5,
        estimatedLevel: 2,
        pixScore: 13,
        type: 'PREVIEW'
      });

      beforeEach(() => {
        assessmentService.fetchAssessment.resolves({
          assessmentPix: assessmentWithScore,
          skills: evaluatedSkills
        });
      });

      it('should try to save the related marks', () => {
        // when
        const promise = service.evaluateFromAssessmentId(assessmentId);

        // then
        return promise.then(() => {
          expect(markRepository.save).not.to.have.been.called;
        });
      });
    });

    context('when the assessment is a DEMO', () => {

      const assessmentWithScore = new Assessment({
        id: assessmentId,
        courseId: 'nullCourseId',
        userId: 5,
        estimatedLevel: 0,
        pixScore: 0,
        type: 'DEMO'
      });

      beforeEach(() => {
        assessmentService.fetchAssessment.resolves({
          assessmentPix: assessmentWithScore,
          skills: evaluatedSkills
        });
      });

      it('should not try to save the related marks', () => {
        // when
        const promise = service.evaluateFromAssessmentId(assessmentId);

        // then
        return promise.then(() => {
          expect(markRepository.save).not.to.have.been.called;
        });
      });

      it('should not update the certification status', () => {
        // when
        const promise = service.evaluateFromAssessmentId(assessmentId);

        // then
        return promise.then(() => {
          expect(certificationCourseRepository.updateStatus).not.to.have.been.called;
        });
      });
    });

    context('when the assessment is a CERTIFICATION', () => {

      let clock;

      const certificationResults = {
        competencesWithMark: [{
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

      const assessmentWithScore = new Assessment({
        id: assessmentId,
        courseId: assessmentCourseId,
        userId: 5,
        estimatedLevel: 0,
        pixScore: 0,
        type: 'CERTIFICATION'
      });

      beforeEach(() => {
        assessmentService.fetchAssessment.resolves({
          assessmentPix: assessmentWithScore,
          skills: evaluatedSkills
        });
        certificationService.calculateCertificationResultByAssessmentId.resolves(certificationResults);

        clock = sinon.useFakeTimers(new Date('2018-02-04T01:00:00.000+01:00'));
      });

      afterEach(() => clock.restore());

      it('should retrieve all the evaluated competences', () => {
        // when
        const promise = service.evaluateFromAssessmentId(assessmentId);

        // then
        return promise.then(() => {
          expect(certificationService.calculateCertificationResultByAssessmentId).to.have.been.calledWith(assessmentId);
        });
      });

      it('should persists a mark for each evaluated competence', () => {
        // when
        const promise = service.evaluateFromAssessmentId(assessmentId);

        // then
        return promise.then(() => {
          expect(markRepository.save).to.have.been.calledThrice;

          const firstSavedMark = markRepository.save.firstCall.args;
          expect(firstSavedMark[0]).to.deep.equal(new Mark({
            level: 0,
            score: 7,
            area_code: '1',
            competence_code: '1.1',
            assessmentId: assessmentId
          }));

          const secondSavedMark = markRepository.save.secondCall.args;
          expect(secondSavedMark[0]).to.deep.equal(new Mark({
            level: 2,
            score: 19,
            area_code: '2',
            competence_code: '2.1',
            assessmentId: assessmentId
          }));

          const thirdSavedMark = markRepository.save.thirdCall.args;
          expect(thirdSavedMark[0]).to.deep.equal(new Mark({
            level: -1,
            score: 0,
            area_code: '2',
            competence_code: '2.2',
            assessmentId: assessmentId
          }));
        });
      });

      it('should save total score', () => {
        const expectedAssessment = new Assessment({
          id: assessmentId,
          courseId: assessmentCourseId,
          userId: 5,
          estimatedLevel: 0,
          pixScore: 26,
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

      it('should update the certification course status', () => {
        // when
        const promise = service.evaluateFromAssessmentId(assessmentId);

        // then
        return promise.then(() => {
          expect(certificationCourseRepository.updateStatus).to.have.been.calledWith('completed', assessmentCourseId, '2018-02-04T00:00:00.000Z');
        });
      });

      context('when updating the certification course status is failing', () => {
        it('should return the raised error', () => {
          // given
          const error = new Error();
          certificationCourseRepository.updateStatus.rejects(error);

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
