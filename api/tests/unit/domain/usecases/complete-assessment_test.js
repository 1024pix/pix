const { expect, sinon, domainBuilder } = require('../../../test-helper');
const Assessment = require('../../../../lib/domain/models/Assessment');
const completeAssessment = require('../../../../lib/domain/usecases/complete-assessment');
const { AlreadyRatedAssessmentError, CertificationComputeError } = require('../../../../lib/domain/errors');

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

describe('Unit | UseCase | complete-assessment', () => {

  const scoringService = {
    calculateAssessmentScore: () => undefined,
  };
  const assessmentRepository = {
    get: () => undefined,
    completeByAssessmentId: () => undefined,
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

  const assessmentId = 1;
  const assessmentResultId = 1;

  const assessmentCourseId = 'recHzEA6lN4PEs7LG';
  const competenceId = 'competenceId';

  let course;

  let competence11;
  let competence12;
  let competence21;
  let competence22;
  let competence31;
  let listOfAllCompetences = [];

  let assessmentScore;
  let assessment;

  let competenceMarksForCertification;
  let competenceMarksForPlacement;

  beforeEach(() => {

    assessment = domainBuilder.buildAssessment({
      id: assessmentId,
      courseId: assessmentCourseId,
      state: 'started',
      type: 'PLACEMENT',
    });

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
        level: 5,
        score: 42,
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

    assessmentScore = {
      level: 2,
      nbPix: 18,
      successRate: 0,
      validatedSkills: [domainBuilder.buildSkill({ name: '@url2' }), domainBuilder.buildSkill({ name: '@web3' })],
      failedSkills: [domainBuilder.buildSkill({ name: '@recherch2' }), domainBuilder.buildSkill({ name: '@securite3' })],
      competenceMarks: competenceMarksForPlacement
    };

    sinon.stub(scoringService, 'calculateAssessmentScore').resolves(assessmentScore);
    sinon.stub(assessmentRepository, 'completeByAssessmentId').resolves({ ...assessment, state: Assessment.states.COMPLETED });
    sinon.stub(assessmentResultRepository, 'save').resolves({ id: assessmentResultId });
    sinon.stub(assessmentRepository, 'get').resolves(assessment);
    sinon.stub(courseRepository, 'get').resolves(course);
    sinon.stub(competenceRepository, 'get').resolves(competence11);
    sinon.stub(competenceRepository, 'list').resolves(listOfAllCompetences);
    sinon.stub(competenceMarkRepository, 'save').resolves();
    sinon.stub(certificationService, 'calculateCertificationResultByAssessmentId').resolves();
    sinon.stub(certificationCourseRepository, 'changeCompletionDate').resolves();

  });

  context('when the assessment is already evaluated', () => {

    it('should reject an AlreadyRatedAssessmentError', () => {
      // given
      const alreadyEvaluatedAssessment = domainBuilder.buildAssessment({
        id: assessmentId,
        courseId: assessmentCourseId,
        state: 'completed',
        type: 'PLACEMENT',
      });

      assessmentRepository.get.resolves(alreadyEvaluatedAssessment);

      // when
      const promise = completeAssessment({
        assessmentId,
        assessmentResultRepository,
        assessmentRepository,
        certificationCourseRepository,
        competenceMarkRepository,
        scoringService,
      });

      // then
      return expect(promise).to.be.rejectedWith(AlreadyRatedAssessmentError);
    });
  });

  it('should change the assessment status', () => {
    // when
    const promise = completeAssessment({
      assessmentId,
      assessmentResultRepository,
      assessmentRepository,
      certificationCourseRepository,
      competenceMarkRepository,
      scoringService,
    });

    // then
    return promise.then(() => {
      expect(assessmentRepository.completeByAssessmentId).to.have.been.calledWith(assessmentId);
    });
  });

  it('should resolves the computing of assessment Score when assessment is completed', () => {
    // given
    scoringService.calculateAssessmentScore = (dependencies, assessment) => {
      if (assessment.state === 'completed') {
        return Promise.resolve(assessmentScore);
      }
      return Promise.reject();
    };

    // when
    const promise = completeAssessment({
      assessmentId,
      assessmentResultRepository,
      assessmentRepository,
      certificationCourseRepository,
      competenceMarkRepository,
      scoringService,
    });

    // then
    return expect(promise).to.have.been.fulfilled;
  });

  it('should create a new assessment result', () => {
    // given
    const assessmentResult = domainBuilder.buildAssessmentResult({
      level: assessmentScore.level,
      pixScore: assessmentScore.nbPix,
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
    const promise = completeAssessment({
      assessmentId,
      assessmentResultRepository,
      assessmentRepository,
      certificationCourseRepository,
      competenceMarkRepository,
      scoringService,
    });

    // then
    return promise.then(() => {
      expect(assessmentResultRepository.save).to.have.been.calledWith(assessmentResult);
    });
  });

  context('when the assessment is a not a certification assessment', () => {

    it('should save the evaluated competence', () => {
      // when
      const promise = completeAssessment({
        assessmentId,
        assessmentResultRepository,
        assessmentRepository,
        certificationCourseRepository,
        competenceMarkRepository,
        scoringService,
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
      const promise = completeAssessment({
        assessmentId,
        assessmentResultRepository,
        assessmentRepository,
        certificationCourseRepository,
        competenceMarkRepository,
        scoringService,
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
        const promise = completeAssessment({
          assessmentId,
          assessmentResultRepository,
          assessmentRepository,
          certificationCourseRepository,
          competenceMarkRepository,
          scoringService,
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
      state: Assessment.states.STARTED,
      type: 'PREVIEW',
    });

    beforeEach(() => {
      assessmentRepository.get.resolves(previewAssessment);
      scoringService.calculateAssessmentScore.resolves({
        level: 0,
        nbPix: 0,
        successRate: 0,
        validatedSkills: [],
        failedSkills: [],
        competenceMarks: [],
      });
    });

    it('should not try to save the related marks', () => {
      // when
      const promise = completeAssessment({
        assessmentId,
        assessmentResultRepository,
        assessmentRepository,
        certificationCourseRepository,
        competenceMarkRepository,
        scoringService,
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
        state: 'started',
        type: 'DEMO',
      });
      assessmentRepository.get.resolves(demoAssessment);
      scoringService.calculateAssessmentScore.resolves({
        level: 0,
        nbPix: 0,
        successRate: 0,
        validatedSkills: [],
        failedSkills: [],
        competenceMarks: [],
      });
    });

    it('should not try to save the related marks', () => {
      // when
      const promise = completeAssessment({
        assessmentId,
        assessmentResultRepository,
        assessmentRepository,
        certificationCourseRepository,
        competenceMarkRepository,
        scoringService,
      });

      // then
      return promise.then(() => {
        expect(competenceMarkRepository.save).not.to.have.been.called;
      });
    });

    it('should not update the certification status', () => {
      // when
      const promise = completeAssessment({
        assessmentId,
        assessmentResultRepository,
        assessmentRepository,
        certificationCourseRepository,
        competenceMarkRepository,
        scoringService,
      });

      // then
      return promise.then(() => {
        expect(certificationCourseRepository.changeCompletionDate).not.to.have.been.called;
      });
    });
  });

  context('when the assessment is a CERTIFICATION', () => {

    let assessment;
    let sumOfCompetenceMarksScores;

    beforeEach(() => {
      sumOfCompetenceMarksScores = competenceMarksForCertification.reduce((sum, competenceMark) => {
        return sum + competenceMark.score;
      }, 0);
      assessment = domainBuilder.buildAssessment({
        id: assessmentId,
        courseId: assessmentCourseId,
        type: Assessment.types.CERTIFICATION,
        state: 'started',
      });
      assessment.campaignParticipation = undefined;
      assessment.course = undefined;
      assessment.answers = [];
      assessment.assessmentResults = [];

      assessmentScore = {
        level: Math.floor(sumOfCompetenceMarksScores / 8),
        nbPix: sumOfCompetenceMarksScores,
        successRate: 0,
        validatedSkills: [domainBuilder.buildSkill({ name: '@url2' }), domainBuilder.buildSkill({ name: '@web3' })],
        failedSkills: [domainBuilder.buildSkill({ name: '@recherch2' }), domainBuilder.buildSkill({ name: '@securite3' })],
        competenceMarks: competenceMarksForCertification
      };

      assessmentRepository.get.resolves(assessment);
      scoringService.calculateAssessmentScore.resolves(assessmentScore);

      sinon.useFakeTimers(new Date('2018-02-04T00:00:00Z'));
    });

    context('happy path', () => {

      it('should persists a mark for each evaluated competence', () => {
        // when
        const promise = completeAssessment({
          assessmentId,
          assessmentResultRepository,
          assessmentRepository,
          certificationCourseRepository,
          competenceMarkRepository,
          scoringService,
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
            score: 42,
          });
        });
      });

      it('should create a new assessment result', () => {
        // given
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
        const promise = completeAssessment({
          assessmentId,
          assessmentResultRepository,
          assessmentRepository,
          certificationCourseRepository,
          competenceMarkRepository,
          scoringService,
        });

        // then
        return promise.then(() => {
          expect(assessmentResultRepository.save).to.have.been.calledWith(assessmentResult);
        });
      });

      it('should save assessment with status completed', () => {
        // when
        const promise = completeAssessment({
          assessmentId,
          assessmentResultRepository,
          assessmentRepository,
          certificationCourseRepository,
          competenceMarkRepository,
          scoringService,
        });

        // then
        return promise.then(() => {
          expect(assessmentRepository.completeByAssessmentId).to.have.been.calledWith(assessmentId);
        });
      });

      it('should update the certification course date', () => {
        // when
        const promise = completeAssessment({
          assessmentId,
          assessmentResultRepository,
          assessmentRepository,
          certificationCourseRepository,
          competenceMarkRepository,
          scoringService,
        });

        // then
        return promise.then(() => {
          expect(certificationCourseRepository.changeCompletionDate).to.have.been.calledWith(assessmentCourseId, new Date('2018-02-04T00:00:00Z'));
        });
      });

    });

    context('something goes wrong during the compute of the certification', () => {

      beforeEach(() => {
        scoringService.calculateAssessmentScore.throws(new CertificationComputeError('Erreur spécifique'));
      });

      it('should not persists a mark', () => {
        // when
        const promise = completeAssessment({
          assessmentId,
          assessmentResultRepository,
          assessmentRepository,
          certificationCourseRepository,
          competenceMarkRepository,
          scoringService,
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
          assessmentId,
        });
        assessmentResult.commentForCandidate = undefined;
        assessmentResult.commentForOrganization = undefined;
        assessmentResult.id = undefined;
        assessmentResult.juryId = undefined;
        assessmentResult.createdAt = undefined;

        // when
        const promise = completeAssessment({
          assessmentId,
          assessmentResultRepository,
          assessmentRepository,
          certificationCourseRepository,
          competenceMarkRepository,
          scoringService,
        });

        // then
        return promise.then(() => {
          expect(assessmentResultRepository.save).to.have.been.calledWith(assessmentResult);
        });
      });

      it('should save assessment with status completed', () => {
        // when
        const promise = completeAssessment({
          assessmentId,
          assessmentResultRepository,
          assessmentRepository,
          certificationCourseRepository,
          competenceMarkRepository,
          scoringService,
        });

        // then
        return promise.then(() => {
          expect(assessmentRepository.completeByAssessmentId).to.have.been.calledWith(assessmentId);
        });
      });

      it('should update the certification course date', () => {
        // when
        const promise = completeAssessment({
          assessmentId,
          assessmentResultRepository,
          assessmentRepository,
          certificationCourseRepository,
          competenceMarkRepository,
          scoringService,
        });

        // then
        return promise.then(() => {
          expect(certificationCourseRepository.changeCompletionDate).to.have.been.calledWith(assessmentCourseId, new Date('2018-02-04T00:00:00Z'));
        });
      });

    });

    context('when updating the certification course status is failing', () => {

      it('should return the raised error', () => {
        // given
        const error = new Error();
        certificationCourseRepository.changeCompletionDate.rejects(error);

        // when
        const promise = completeAssessment({
          assessmentId,
          assessmentResultRepository,
          assessmentRepository,
          certificationCourseRepository,
          competenceMarkRepository,
          scoringService,
        });

        // then
        return expect(promise).to.be.rejectedWith(error);
      });
    });
  });
});
