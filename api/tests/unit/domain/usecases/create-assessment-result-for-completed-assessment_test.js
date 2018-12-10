const { expect, sinon, domainBuilder } = require('../../../test-helper');
const Assessment = require('../../../../lib/domain/models/Assessment');
const createAssessmentResultForCompletedAssessment = require('../../../../lib/domain/usecases/create-assessment-result-for-completed-assessment');
const { NotFoundError, AlreadyRatedAssessmentError, CertificationComputeError } = require('../../../../lib/domain/errors');

function _buildCompetence(competenceCode, areaCode) {

  const area = domainBuilder.buildArea({
    code: areaCode,
    name: `${areaCode} Information et données`,
    title: 'Information et données',
  });

  const competence = domainBuilder.buildCompetence({
    index: `${areaCode}.${competenceCode}`,
    area,
  });

  return competence;
}

describe('Unit | UseCase | create-assessment-result-for-completed-assessment', () => {

  const assessmentService = {
    getSkills: () => undefined,
    getCompetenceMarks: () => undefined,
  };
  const assessmentRepository = {
    get: () => undefined,
    save: () => undefined,
  };
  const assessmentResultRepository = {
    save: () => undefined,
  };
  const certificationCourseRepository = {
    changeCompletionDate: () => undefined,
  };
  const certificationService = {
    calculateCertificationResultByAssessmentId: () => undefined,
  };
  const competenceMarkRepository = {
    save: () => undefined,
  };
  const competenceRepository = {
    get: () => undefined,
    list: () => undefined,
  };
  const courseRepository = {
    get: () => undefined,
  };
  const skillsService = {
    saveAssessmentSkills: () => undefined,
  };

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

    assessment = domainBuilder.buildAssessment({
      id: assessmentId,
      courseId: assessmentCourseId,
      userId: 5,
      state: 'started',
      type: 'PLACEMENT',
    });

    evaluatedSkills = {
      assessmentId: assessmentId,
      validatedSkills: [domainBuilder.buildSkill({ name: '@url2' }), domainBuilder.buildSkill({ name: '@web3' })],
      failedSkills: [domainBuilder.buildSkill({ name: '@recherch2' }), domainBuilder.buildSkill({ name: '@securite3' })],
    };

    competenceMarksForCertification = [
      domainBuilder.buildCompetenceMark({
        competence_code: '1.1',
        area_code: '1',
        level: 0,
        score: 7,
      }),
      domainBuilder.buildCompetenceMark({
        competence_code: '2.1',
        area_code: '2',
        level: 2,
        score: 19,
      }),
      domainBuilder.buildCompetenceMark({
        competence_code: '2.2',
        area_code: '2',
        level: -1,
        score: 0,
      }),
      domainBuilder.buildCompetenceMark({
        competence_code: '3.1',
        area_code: '3',
        level: 6,
        score: 52,
      }),
    ];

    competenceMarksForPlacement = [
      domainBuilder.buildCompetenceMark({
        competence_code: '1.1',
        area_code: '1',
        level: 3,
        score: 18,
      }),
    ];

    competence11 = _buildCompetence('1', '1');
    competence12 = _buildCompetence('1', '2');
    competence21 = _buildCompetence('2', '1');
    competence22 = _buildCompetence('2', '2');
    competence31 = _buildCompetence('3', '1');

    listOfAllCompetences = [competence11, competence12, competence21, competence22, competence31];

    course = domainBuilder.buildCourse({
      id: assessmentCourseId,
      name: 'Mener une recherche',
      competence: [competenceId],
    });

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
    const promise = createAssessmentResultForCompletedAssessment({
      assessmentId: assessmentIdThatDoesNotExist,
      assessmentResultRepository,
      assessmentRepository,
      assessmentService,
      certificationCourseRepository,
      competenceMarkRepository,
      skillsService,
    });

    // then
    return expect(promise).to.be.rejectedWith(NotFoundError);
  });
  context('when the assessment is already evaluated', () => {

    it('should reject an AlreadyRatedAssessmentError', () => {
      // given
      const alreadyEvaluatedAssessment = domainBuilder.buildAssessment({
        id: assessmentId,
        courseId: assessmentCourseId,
        userId: 5,
        state: 'completed',
        type: 'PLACEMENT',
      });

      assessmentRepository.get.resolves(alreadyEvaluatedAssessment);

      // when
      const promise = createAssessmentResultForCompletedAssessment({
        assessmentId,
        assessmentResultRepository,
        assessmentRepository,
        assessmentService,
        certificationCourseRepository,
        competenceMarkRepository,
        skillsService,
      });

      // then
      return expect(promise).to.be.rejectedWith(AlreadyRatedAssessmentError);
    });

    it('should not reject an AlreadyRatedAssessmentError if forceRecomputeResult at true', () => {
      // given
      const alreadyEvaluatedAssessment = domainBuilder.buildAssessment({
        id: assessmentId,
        courseId: assessmentCourseId,
        userId: 5,
        state: 'completed',
        type: 'PLACEMENT',
      });
      const forceRecomputeResult = true;
      assessmentRepository.get.resolves(alreadyEvaluatedAssessment);

      // when
      const promise = createAssessmentResultForCompletedAssessment({
        assessmentId,
        forceRecomputeResult,
        assessmentResultRepository,
        assessmentRepository,
        assessmentService,
        certificationCourseRepository,
        competenceMarkRepository,
        skillsService,
      });

      // then
      return expect(promise).to.not.be.rejectedWith(AlreadyRatedAssessmentError);
    });

  });

  it('should reject a not found error when getSkills raise a notFoundError because the assessment does not exist', () => {
    // given
    assessmentService.getSkills.rejects(new NotFoundError());

    // when
    const promise = createAssessmentResultForCompletedAssessment({
      assessmentId,
      assessmentResultRepository,
      assessmentRepository,
      assessmentService,
      certificationCourseRepository,
      competenceMarkRepository,
      skillsService,
    });

    // then
    return expect(promise).to.have.been.rejectedWith(NotFoundError);
  });

  it('should change the assessment status', () => {
    // when
    const promise = createAssessmentResultForCompletedAssessment({
      assessmentId,
      assessmentResultRepository,
      assessmentRepository,
      assessmentService,
      certificationCourseRepository,
      competenceMarkRepository,
      skillsService,
    });

    // then
    return promise.then(() => {
      const savedCompetenceMark = assessmentRepository.save.firstCall.args;
      expect(savedCompetenceMark[0].state).to.deep.equal('completed');
    });
  });

  it('should save the evaluated skills', () => {
    // when
    const promise = createAssessmentResultForCompletedAssessment({
      assessmentId,
      assessmentResultRepository,
      assessmentRepository,
      assessmentService,
      certificationCourseRepository,
      competenceMarkRepository,
      skillsService,
    });

    // then
    return promise.then(() => {
      expect(skillsService.saveAssessmentSkills).to.have.been.calledWith(evaluatedSkills);
    });
  });

  it('should create a new assessment result', () => {
    // given
    const assessmentResult = domainBuilder.buildAssessmentResult({
      level: 2,
      pixScore: 18,
      emitter: 'PIX-ALGO',
      commentForJury: 'Computed',
      status: 'validated',
      assessmentId: assessmentId,
    });
    assessmentResult.commentForCandidate = undefined;
    assessmentResult.commentForOrganization = undefined;
    assessmentResult.id = undefined;
    assessmentResult.juryId = undefined;
    assessmentResult.createdAt = undefined;

    // when
    const promise = createAssessmentResultForCompletedAssessment({
      assessmentId,
      assessmentResultRepository,
      assessmentRepository,
      assessmentService,
      certificationCourseRepository,
      competenceMarkRepository,
      skillsService,
    });

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
      const promise = createAssessmentResultForCompletedAssessment({
        assessmentId,
        assessmentResultRepository,
        assessmentRepository,
        assessmentService,
        certificationCourseRepository,
        competenceMarkRepository,
        skillsService,
      });

      // then
      return promise.then(() => {
        expect(assessmentService.getSkills).to.have.been.calledWith(assessment);
      });
    });

    it('should retrieve the competenceMarks', () => {
      // when
      const promise = createAssessmentResultForCompletedAssessment({
        assessmentId,
        assessmentResultRepository,
        assessmentRepository,
        assessmentService,
        certificationCourseRepository,
        competenceMarkRepository,
        skillsService,
      });

      // then
      return promise.then(() => {
        expect(assessmentService.getCompetenceMarks).to.have.been.calledWith(assessment);
      });
    });

    it('should save the evaluated competence', () => {
      // when
      const promise = createAssessmentResultForCompletedAssessment({
        assessmentId,
        assessmentResultRepository,
        assessmentRepository,
        assessmentService,
        certificationCourseRepository,
        competenceMarkRepository,
        skillsService,
      });
      const expectedSavedCompetenceMark = {
        id: undefined,
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
      const promise = createAssessmentResultForCompletedAssessment({
        assessmentId,
        assessmentResultRepository,
        assessmentRepository,
        assessmentService,
        certificationCourseRepository,
        competenceMarkRepository,
        skillsService,
      });

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
        const promise = createAssessmentResultForCompletedAssessment({
          assessmentId,
          assessmentResultRepository,
          assessmentRepository,
          assessmentService,
          certificationCourseRepository,
          competenceMarkRepository,
          skillsService,
        });

        // then
        return expect(promise).to.be.rejected;
      });
    });

  });

  context('when the assessment is a PREVIEW', () => {

    const previewAssessment = domainBuilder.buildAssessment({
      id: assessmentId,
      courseId: 'nullCourseId',
      userId: 5,
      state: Assessment.states.STARTED,
      type: 'PREVIEW',
    });

    beforeEach(() => {
      assessmentRepository.get.resolves(previewAssessment);
      assessmentService.getCompetenceMarks.resolves([]);
    });

    it('should not try to save the related marks', () => {
      // when
      const promise = createAssessmentResultForCompletedAssessment({
        assessmentId,
        assessmentResultRepository,
        assessmentRepository,
        assessmentService,
        certificationCourseRepository,
        competenceMarkRepository,
        skillsService,
      });

      // then
      return promise.then(() => {
        expect(competenceMarkRepository.save).not.to.have.been.called;
      });
    });
  });

  context('when the assessment is a DEMO', () => {

    let demoAssessment;

    beforeEach(() => {

      demoAssessment = domainBuilder.buildAssessment({
        id: assessmentId,
        courseId: 'nullCourseId',
        userId: 5,
        state: 'started',
        type: 'DEMO',
      });
      assessmentRepository.get.resolves(demoAssessment);
      assessmentService.getCompetenceMarks.resolves([]);
    });

    it('should not try to save the related marks', () => {
      // when
      const promise = createAssessmentResultForCompletedAssessment({
        assessmentId,
        assessmentResultRepository,
        assessmentRepository,
        assessmentService,
        certificationCourseRepository,
        competenceMarkRepository,
        skillsService,
      });

      // then
      return promise.then(() => {
        expect(competenceMarkRepository.save).not.to.have.been.called;
      });
    });

    it('should not update the certification status', () => {
      // when
      const promise = createAssessmentResultForCompletedAssessment({
        assessmentId,
        assessmentResultRepository,
        assessmentRepository,
        assessmentService,
        certificationCourseRepository,
        competenceMarkRepository,
        skillsService,
      });

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
      assessment = domainBuilder.buildAssessment({
        id: assessmentId,
        courseId: assessmentCourseId,
        userId: 5,
        type: Assessment.types.CERTIFICATION,
        state: 'started',
      });
      assessment.campaignParticipation = undefined;
      assessment.course = undefined;
      assessment.answers = [];
      assessment.assessmentResults = [];

      assessmentRepository.get.resolves(assessment);
      assessmentService.getCompetenceMarks.resolves(competenceMarksForCertification);

      clock = sinon.useFakeTimers(new Date('2018-02-04T01:00:00.000+01:00'));
    });

    afterEach(() => clock.restore());

    context('happy path', () => {

      it('should persists a mark for each evaluated competence', () => {
        // when
        const promise = createAssessmentResultForCompletedAssessment({
          assessmentId,
          assessmentResultRepository,
          assessmentRepository,
          assessmentService,
          certificationCourseRepository,
          competenceMarkRepository,
          skillsService,
        });

        // then
        return promise.then(() => {
          expect(competenceMarkRepository.save.callCount).to.equal(4);

          const firstSavedCompetenceMark = competenceMarkRepository.save.getCall(0).args;
          expect(firstSavedCompetenceMark[0]).to.deep.equal({
            id: undefined,
            level: 0,
            score: 7,
            area_code: '1',
            competence_code: '1.1',
            assessmentResultId: assessmentResultId,
          });

          const secondSavedCompetenceMark = competenceMarkRepository.save.getCall(1).args;
          expect(secondSavedCompetenceMark[0]).to.deep.equal({
            id: undefined,
            level: 2,
            score: 19,
            area_code: '2',
            competence_code: '2.1',
            assessmentResultId: assessmentResultId,
          });

          const thirdSavedCompetenceMark = competenceMarkRepository.save.getCall(2).args;
          expect(thirdSavedCompetenceMark[0]).to.deep.equal({
            id: undefined,
            level: -1,
            score: 0,
            area_code: '2',
            competence_code: '2.2',
            assessmentResultId: assessmentResultId,
          });

          const forthSavedCompetenceMark = competenceMarkRepository.save.getCall(3).args;
          expect(forthSavedCompetenceMark[0]).to.deep.equal({
            id: undefined,
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
        const assessmentResult = domainBuilder.buildAssessmentResult({
          level: Math.floor(sumOfCompetenceMarksScores / 8),
          pixScore: sumOfCompetenceMarksScores,
          emitter: 'PIX-ALGO',
          commentForJury: 'Computed',
          status: 'validated',
          assessmentId: assessmentId,
        });
        assessmentResult.commentForCandidate = undefined;
        assessmentResult.commentForOrganization = undefined;
        assessmentResult.id = undefined;
        assessmentResult.juryId = undefined;
        assessmentResult.createdAt = undefined;

        // when
        const promise = createAssessmentResultForCompletedAssessment({
          assessmentId,
          assessmentResultRepository,
          assessmentRepository,
          assessmentService,
          certificationCourseRepository,
          competenceMarkRepository,
          skillsService,
        });

        // then
        return promise.then(() => {
          expect(assessmentResultRepository.save).to.have.been.calledWith(assessmentResult);
        });
      });

      it('should save assessment with status completed', () => {
        const expectedAssessment = domainBuilder.buildAssessment({
          id: assessmentId,
          courseId: assessmentCourseId,
          userId: 5,
          state: 'completed',
          type: Assessment.types.CERTIFICATION,
        });
        expectedAssessment.campaignParticipation = undefined;
        expectedAssessment.course = undefined;
        expectedAssessment.answers = [];
        expectedAssessment.assessmentResults = [];

        // when
        const promise = createAssessmentResultForCompletedAssessment({
          assessmentId,
          assessmentResultRepository,
          assessmentRepository,
          assessmentService,
          certificationCourseRepository,
          competenceMarkRepository,
          skillsService,
        });

        // then
        return promise.then(() => {
          expect(assessmentRepository.save).to.have.been.calledWith(expectedAssessment);

          const savedAssessment = assessmentRepository.save.firstCall.args;
          expect(savedAssessment[0]).to.deep.equal(expectedAssessment);
        });
      });

      it('should update the certification course date', () => {
        // when
        const promise = createAssessmentResultForCompletedAssessment({
          assessmentId,
          assessmentResultRepository,
          assessmentRepository,
          assessmentService,
          certificationCourseRepository,
          competenceMarkRepository,
          skillsService,
        });

        // then
        return promise.then(() => {
          expect(certificationCourseRepository.changeCompletionDate).to.have.been.calledWith(assessmentCourseId, '2018-02-04T00:00:00.000Z');
        });
      });

    });

    context('something goes wrong during the compute of the certification', () => {

      beforeEach(() => {
        assessmentService.getCompetenceMarks.throws(new CertificationComputeError('Erreur spécifique'));
      });

      it('should not persists a mark', () => {
        // when
        const promise = createAssessmentResultForCompletedAssessment({
          assessmentId,
          assessmentResultRepository,
          assessmentRepository,
          assessmentService,
          certificationCourseRepository,
          competenceMarkRepository,
          skillsService,
        });

        // then
        return promise.then(() => {
          sinon.assert.notCalled(competenceMarkRepository.save);
        });
      });

      it('should create a new assessment result', () => {
        // given
        const assessmentResult = domainBuilder.buildAssessmentResult({
          level: 0,
          pixScore: 0,
          emitter: 'PIX-ALGO',
          commentForJury: 'Erreur spécifique',
          status: 'error',
          assessmentId: assessmentId,
        });
        assessmentResult.commentForCandidate = undefined;
        assessmentResult.commentForOrganization = undefined;
        assessmentResult.id = undefined;
        assessmentResult.juryId = undefined;
        assessmentResult.createdAt = undefined;

        // when
        const promise = createAssessmentResultForCompletedAssessment({
          assessmentId,
          assessmentResultRepository,
          assessmentRepository,
          assessmentService,
          certificationCourseRepository,
          competenceMarkRepository,
          skillsService,
        });

        // then
        return promise.then(() => {
          expect(assessmentResultRepository.save).to.have.been.calledWith(assessmentResult);
        });
      });

      it('should save assessment with status completed', () => {
        const expectedAssessment = domainBuilder.buildAssessment({
          id: assessmentId,
          courseId: assessmentCourseId,
          userId: 5,
          state: 'completed',
          type: Assessment.types.CERTIFICATION,
        });
        expectedAssessment.campaignParticipation = undefined;
        expectedAssessment.course = undefined;
        expectedAssessment.answers = [];
        expectedAssessment.assessmentResults = [];

        // when
        const promise = createAssessmentResultForCompletedAssessment({
          assessmentId,
          assessmentResultRepository,
          assessmentRepository,
          assessmentService,
          certificationCourseRepository,
          competenceMarkRepository,
          skillsService,
        });

        // then
        return promise.then(() => {
          expect(assessmentRepository.save).to.have.been.calledWith(expectedAssessment);

          const savedAssessment = assessmentRepository.save.firstCall.args;
          expect(savedAssessment[0]).to.deep.equal(expectedAssessment);
        });
      });

      it('should update the certification course date', () => {
        // when
        const promise = createAssessmentResultForCompletedAssessment({
          assessmentId,
          assessmentResultRepository,
          assessmentRepository,
          assessmentService,
          certificationCourseRepository,
          competenceMarkRepository,
          skillsService,
        });

        // then
        return promise.then(() => {
          expect(certificationCourseRepository.changeCompletionDate).to.have.been.calledWith(assessmentCourseId, '2018-02-04T00:00:00.000Z');
        });
      });

    });

    context('when updating the certification course status is failing', () => {

      it('should return the raised error', () => {
        // given
        const error = new Error();
        certificationCourseRepository.changeCompletionDate.rejects(error);

        // when
        const promise = createAssessmentResultForCompletedAssessment({
          assessmentId,
          assessmentResultRepository,
          assessmentRepository,
          assessmentService,
          certificationCourseRepository,
          competenceMarkRepository,
          skillsService,
        });

        // then
        return expect(promise).to.be.rejectedWith(error);
      });
    });
  });
});
