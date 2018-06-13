const { expect, sinon } = require('../../../test-helper');
const faker = require('faker');

const service = require('../../../../lib/domain/services/assessment-result-service');
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
const Competence = require('../../../../lib/domain/models/Competence');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const AirtableCourse = require('../../../../lib/domain/models/referential/course');
const Skill = require('../../../../lib/cat/skill');
const CompetenceMark = require('../../../../lib/domain/models/CompetenceMark');

const { NotFoundError, AlreadyRatedAssessmentError, ObjectValidationError } = require('../../../../lib/domain/errors');

function _buildCompetence(competence_code, area_code) {

  const area = new Area({
    id: 'recdmN2Exvq2oAPap',
    name: `${area_code}. Information et données`,
    code: `${area_code}`,
    title: 'Information et données'
  });
  const competence = new Competence();

  const defaultCompetenceInfos = {
    name: faker.random.uuid(),
    index: `${area_code}.${competence_code}`,
    areaId: ['recdmN2Exvq2oAPap'],
    courseId: 'recvNIWtjJRyBCd0P',
    skills: undefined,
    area,
  };

  Object.assign(competence, defaultCompetenceInfos);

  return competence;
}

describe('Unit | Domain | Services | assessment-results', () => {

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
    let competence31;
    let listOfAllCompetences = [];

    let assessment;

    let competenceMarksForCertification;
    let competenceMarksForPlacement;

    beforeEach(() => {

      assessment = Assessment.fromAttributes({
        id: assessmentId,
        courseId: assessmentCourseId,
        userId: 5,
        state: 'started',
        type: 'PLACEMENT',
      });

      evaluatedSkills = {
        assessmentId: assessmentId,
        validatedSkills: _generateValidatedSkills(),
        failedSkills: _generateFailedSkills(),
      };

      competenceMarksForCertification = [
        {
          competence_code: '1.1',
          area_code: '1',
          level: 0,
          score: 7,
        }, {
          competence_code: '2.1',
          area_code: '2',
          level: 2,
          score: 19,
        }, {
          competence_code: '2.2',
          area_code: '2',
          level: -1,
          score: 0,
        },
        {
          competence_code: '3.1',
          area_code: '3',
          level: 6,
          score: 52,
        },
      ];

      competenceMarksForPlacement = [{
        competence_code: '1.1',
        area_code: '1',
        level: 3,
        score: 18,
      }];

      competence11 = _buildCompetence('1', '1');
      competence12 = _buildCompetence('1', '2');
      competence21 = _buildCompetence('2', '1');
      competence22 = _buildCompetence('2', '2');
      competence31 = _buildCompetence('3', '1');

      listOfAllCompetences = [competence11, competence12, competence21, competence22, competence31];

      course = new AirtableCourse();
      course.id = assessmentCourseId;
      course.name = 'Mener une recherche';
      course.competences = [competenceId];

      sandbox = sinon.sandbox.create();

      sandbox.stub(assessmentService, 'getSkills').resolves(evaluatedSkills);
      sandbox.stub(assessmentService, 'getCompetenceMarks').resolves({ competencesWithMark: competenceMarksForPlacement });
      sandbox.stub(assessmentRepository, 'save').resolves();
      sandbox.stub(assessmentResultRepository, 'save').resolves({ id: assessmentResultId });
      sandbox.stub(assessmentRepository, 'get').resolves(assessment);
      sandbox.stub(skillsService, 'saveAssessmentSkills').resolves();
      sandbox.stub(courseRepository, 'get').resolves(course);
      sandbox.stub(competenceRepository, 'get').resolves(competence11);
      sandbox.stub(competenceRepository, 'list').resolves(listOfAllCompetences);
      sandbox.stub(competenceMarkRepository, 'save').resolves();
      sandbox.stub(certificationService, 'calculateCertificationResultByAssessmentId').resolves();
      sandbox.stub(certificationCourseRepository, 'changeCompletionDate').resolves();

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
        const alreadyEvaluatedAssessment = Assessment.fromAttributes({
          id: assessmentId,
          courseId: assessmentCourseId,
          userId: 5,
          state: 'completed',
          type: 'PLACEMENT',
        });

        assessmentRepository.get.resolves(alreadyEvaluatedAssessment);

        // when
        const promise = service.evaluateFromAssessmentId(assessmentId);

        // then
        return expect(promise).to.be.rejectedWith(AlreadyRatedAssessmentError);
      });

      it('should not reject an AlreadyRatedAssessmentError if a parameters contains a recompute at true', () => {
        // given
        const alreadyEvaluatedAssessment = Assessment.fromAttributes({
          id: assessmentId,
          courseId: assessmentCourseId,
          userId: 5,
          state: 'completed',
          type: 'PLACEMENT',
        });

        assessmentRepository.get.resolves(alreadyEvaluatedAssessment);

        // when
        const promise = service.evaluateFromAssessmentId(assessmentId, { recompute: true });

        // then
        return expect(promise).to.not.be.rejectedWith(AlreadyRatedAssessmentError);
      });

    });

    it('should reject a not found error when getSkills raise a notFoundError because the assessment does not exist', () => {
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
        expect(savedCompetenceMark[0].state).to.deep.equal('completed');
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
        commentForJury: 'Computed',
        status: 'validated',
        assessmentId: assessmentId,
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
        assessmentService.getCompetenceMarks.resolves({ competencesWithMark: competenceMarksForPlacement });

      });

      it('should retrieve the skills', () => {
        // when
        const promise = service.evaluateFromAssessmentId(assessmentId);

        // then
        return promise.then(() => {
          expect(assessmentService.getSkills).to.have.been.calledWith(assessment);
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
        const expectedSavedCompetenceMark = {
          level: 3,
          score: 18,
          area_code: '1',
          competence_code: '1.1',
          assessmentResultId: assessmentResultId,
        };

        // then
        return promise.then(() => {
          expect(competenceMarkRepository.save).to.have.been.called;

          const savedCompetenceMark = competenceMarkRepository.save.firstCall.args;
          expect(savedCompetenceMark[0]).to.deep.equal(expectedSavedCompetenceMark);
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

      const previewAssessment = Assessment.fromAttributes({
        id: assessmentId,
        courseId: 'nullCourseId',
        userId: 5,
        status: 'started',
        type: 'PREVIEW',
      });

      beforeEach(() => {
        assessmentRepository.get.resolves(previewAssessment);
        assessmentService.getCompetenceMarks.resolves({ competencesWithMark:[] });
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

        demoAssessment = Assessment.fromAttributes({
          id: assessmentId,
          courseId: 'nullCourseId',
          userId: 5,
          state: 'started',
          type: 'DEMO',
        });
        assessmentRepository.get.resolves(demoAssessment);
        assessmentService.getCompetenceMarks.resolves({ competencesWithMark:[] });
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
          expect(certificationCourseRepository.changeCompletionDate).not.to.have.been.called;
        });
      });
    });

    context('when the assessment is a CERTIFICATION', () => {

      let clock;
      let assessment;

      beforeEach(() => {
        assessment = Assessment.fromAttributes({
          id: assessmentId,
          courseId: assessmentCourseId,
          userId: 5,
          type: Assessment.types.CERTIFICATION,
          state: 'started',
        });

        assessmentRepository.get.resolves(assessment);
        assessmentService.getCompetenceMarks.resolves({ competencesWithMark: competenceMarksForCertification });

        clock = sinon.useFakeTimers(new Date('2018-02-04T01:00:00.000+01:00'));
      });

      afterEach(() => clock.restore());

      it('should persists a mark for each evaluated competence', () => {
        // when
        const promise = service.evaluateFromAssessmentId(assessmentId);

        // then
        return promise.then(() => {
          expect(competenceMarkRepository.save.callCount).to.equal(4);

          const firstSavedCompetenceMark = competenceMarkRepository.save.getCall(0).args;
          expect(firstSavedCompetenceMark[0]).to.deep.equal({
            level: 0,
            score: 7,
            area_code: '1',
            competence_code: '1.1',
            assessmentResultId: assessmentResultId,
          });

          const secondSavedCompetenceMark = competenceMarkRepository.save.getCall(1).args;
          expect(secondSavedCompetenceMark[0]).to.deep.equal({
            level: 2,
            score: 19,
            area_code: '2',
            competence_code: '2.1',
            assessmentResultId: assessmentResultId,
          });

          const thirdSavedCompetenceMark = competenceMarkRepository.save.getCall(2).args;
          expect(thirdSavedCompetenceMark[0]).to.deep.equal({
            level: -1,
            score: 0,
            area_code: '2',
            competence_code: '2.2',
            assessmentResultId: assessmentResultId,
          });

          const forthSavedCompetenceMark = competenceMarkRepository.save.getCall(3).args;
          expect(forthSavedCompetenceMark[0]).to.deep.equal({
            area_code: '3',
            assessmentResultId: assessmentResultId,
            competence_code: '3.1',
            level: 5,
            score: 52,
          });
        });
      });

      it('should create a new assessment result', () => {
        // given
        const sumOfCompetenceMarksScores = competenceMarksForCertification.reduce((sum, competenceMark) => {
          return sum + competenceMark.score;
        }, 0);
        const assessmentResult = new AssessmentResult({
          level: Math.floor(sumOfCompetenceMarksScores / 8),
          pixScore: sumOfCompetenceMarksScores,
          emitter: 'PIX-ALGO',
          commentForJury: 'Computed',
          status: 'validated',
          assessmentId: assessmentId,
        });

        // when
        const promise = service.evaluateFromAssessmentId(assessmentId);

        // then
        return promise.then(() => {
          expect(assessmentResultRepository.save).to.have.been.calledWith(assessmentResult);
        });
      });

      it('should save assessment with status completed', () => {
        const expectedAssessment = Assessment.fromAttributes({
          id: assessmentId,
          courseId: assessmentCourseId,
          userId: 5,
          state: 'completed',
          type: Assessment.types.CERTIFICATION,
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

      it('should update the certification course date', () => {
        // when
        const promise = service.evaluateFromAssessmentId(assessmentId);

        // then
        return promise.then(() => {
          expect(certificationCourseRepository.changeCompletionDate).to.have.been.calledWith(assessmentCourseId, '2018-02-04T00:00:00.000Z');
        });
      });

      context('when updating the certification course status is failing', () => {

        it('should return the raised error', () => {
          // given
          const error = new Error();
          certificationCourseRepository.changeCompletionDate.rejects(error);

          // when
          const promise = service.evaluateFromAssessmentId(assessmentId);

          // then
          return expect(promise).to.be.rejectedWith(error);
        });
      });

      context('when score is >1 and the percentage of correct answers is < 50%', () => {
        it('should create a new assessment result with comment "Possibly error in Computed Result"', () => {
          // given
          assessmentService.getCompetenceMarks.resolves({
            competencesWithMark: competenceMarksForCertification,
            percentageCorrectAnswers: 20,
          });

          const sumOfCompetenceMarksScores = competenceMarksForCertification.reduce((sum, competenceMark) => {
            return sum + competenceMark.score;
          }, 0);
          const assessmentResult = new AssessmentResult({
            level: Math.floor(sumOfCompetenceMarksScores / 8),
            pixScore: sumOfCompetenceMarksScores,
            emitter: 'PIX-ALGO',
            commentForJury: 'Possibly error in Computed Result',
            status: 'validated',
            assessmentId: assessmentId,
          });

          // when
          const promise = service.evaluateFromAssessmentId(assessmentId);

          // then
          return promise.then(() => {
            expect(assessmentResultRepository.save).to.have.been.calledWith(assessmentResult);
          });
        });

      });

    });
  });

  describe('#save', () => {

    const assessmentResult = new AssessmentResult({
      assessmentId: 1,
      level: 3,
      pixScore: 27,
      status: 'validated',
      emitter: 'Jury',
      commentForJury: 'Parce que',
      commentForCandidate: 'Voilà',
      commentForOrganization: 'Truc',
    });
    const competenceMarks = [
      new CompetenceMark({
        level: 2,
        score: 18,
        area_code: 2,
        competence_code: 2.1,
      }),
      new CompetenceMark({
        level: 3,
        score: 27,
        area_code: 3,
        competence_code: 3.2,
      }),
    ];

    const sandbox = sinon.sandbox.create();

    beforeEach(() => {
      sandbox.stub(assessmentResultRepository, 'save').resolves({ id: 1 });
      sandbox.stub(competenceMarkRepository, 'save').resolves();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should save the assessment results', () => {
      // when
      const promise = service.save(assessmentResult, competenceMarks);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(assessmentResultRepository.save);
        sinon.assert.calledWith(assessmentResultRepository.save, assessmentResult);
      });
    });

    it('should save all competenceMarks', () => {
      // when
      const promise = service.save(assessmentResult, competenceMarks);

      // then
      return promise.then(() => {
        sinon.assert.calledTwice(competenceMarkRepository.save);
        sinon.assert.calledWith(competenceMarkRepository.save, new CompetenceMark({
          assessmentResultId: 1,
          level: 2,
          score: 18,
          area_code: 2,
          competence_code: 2.1,
        }));
        sinon.assert.calledWith(competenceMarkRepository.save, new CompetenceMark({
          assessmentResultId: 1,
          level: 3,
          score: 27,
          area_code: 3,
          competence_code: 3.2,
        }));
      });
    });

    context('when one competence is not valided', () => {

      const competenceMarksWithOneInvalid = [
        new CompetenceMark({
          level: 20,
          score: 18,
          area_code: 2,
          competence_code: 2.1,
        }),
        new CompetenceMark({
          level: 3,
          score: 27,
          area_code: 3,
          competence_code: 3.2,
        }),
      ];

      it('should not saved assessmentResult and competenceMarks', () => {
        // when
        const promise = service.save(assessmentResult, competenceMarksWithOneInvalid);

        // then
        return promise.catch(() => {
          expect(competenceMarkRepository.save).to.have.been.not.called;
          expect(assessmentResultRepository.save).to.have.been.not.called;
        });
      });

      it('should return a ObjectValidationError', () => {
        // when
        const promise = service.save(assessmentResult, competenceMarksWithOneInvalid);

        // then
        return promise.catch((error) => {
          expect(error).to.be.instanceOf(ObjectValidationError);
        });
      });
    });
  });
});

function _generateValidatedSkills() {
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
