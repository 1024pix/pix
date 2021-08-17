const { expect, sinon, domainBuilder } = require('../../../test-helper');
const { handleCertificationRescoring } = require('../../../../lib/domain/events')._forTestOnly.handlers;
const ChallengeNeutralized = require('../../../../lib/domain/events/ChallengeNeutralized');
const CertificationAssessment = require('../../../../lib/domain/models/CertificationAssessment');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const { CertificationComputeError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Events | handle-certification-rescoring', () => {

  it('computes and persists the assessment result and competence marks when computation succeeds', async () => {
    // given
    const assessmentResultRepository = { save: sinon.stub() };
    const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub() };
    const competenceMarkRepository = { save: sinon.stub() };
    const certificationResultService = { computeResult: sinon.stub() };
    const certificationCourseRepository = { get: sinon.stub(), update: sinon.stub() };

    const event = new ChallengeNeutralized({ certificationCourseId: 1, juryId: 7 });
    const certificationAssessment = new CertificationAssessment({
      id: 123,
      userId: 123,
      certificationCourseId: 1,
      createdAt: new Date('2020-01-01'),
      completedAt: new Date('2020-01-01'),
      state: CertificationAssessment.states.STARTED,
      isV2Certification: true,
      certificationChallenges: [
        domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
        domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
      ],
      certificationAnswersByDate: ['answer'],
    });
    certificationAssessmentRepository.getByCertificationCourseId.withArgs({ certificationCourseId: 1 }).resolves(certificationAssessment);

    const competenceMarkData2 = domainBuilder.buildCompetenceMark();
    const competenceMarkData1 = domainBuilder.buildCompetenceMark();
    const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
      competenceMarks: [competenceMarkData1, competenceMarkData2],
      percentageCorrectAnswers: 80,
    });
    certificationResultService.computeResult
      .withArgs({ certificationAssessment, continueOnError: false })
      .resolves(certificationAssessmentScore);

    const assessmentResultToBeSaved = new AssessmentResult({
      id: undefined,
      commentForJury: 'Computed',
      emitter: 'PIX-ALGO-NEUTRALIZATION',
      pixScore: certificationAssessmentScore.nbPix,
      status: certificationAssessmentScore.status,
      assessmentId: 123,
      juryId: 7,
    });
    const savedAssessmentResult = new AssessmentResult({ ...assessmentResultToBeSaved, id: 4 });
    assessmentResultRepository.save
      .withArgs(assessmentResultToBeSaved)
      .resolves(savedAssessmentResult);

    const certificationCourse = domainBuilder.buildCertificationCourse({ id: certificationAssessment.certificationCourseId, isCancelled: false });
    certificationCourseRepository.get.withArgs(certificationAssessment.certificationCourseId).resolves(certificationCourse);

    const dependencies = {
      assessmentResultRepository,
      certificationAssessmentRepository,
      competenceMarkRepository,
      certificationResultService,
      certificationCourseRepository,
    };

    // when
    await handleCertificationRescoring(
      {
        ...dependencies,
        event,
      });

    // then
    expect(assessmentResultRepository.save).to.have.been.calledWith(assessmentResultToBeSaved);
    competenceMarkData1.assessmentResultId = savedAssessmentResult.id;
    competenceMarkData2.assessmentResultId = savedAssessmentResult.id;
    expect(competenceMarkRepository.save).to.have.been.calledWithExactly(competenceMarkData1);
    expect(competenceMarkRepository.save).to.have.been.calledWithExactly(competenceMarkData2);
  });

  it('returns a CertificationRescoringCompleted event', async () => {
    // given
    const assessmentResultRepository = { save: sinon.stub() };
    const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub() };
    const competenceMarkRepository = { save: sinon.stub() };
    const certificationResultService = { computeResult: sinon.stub() };
    const certificationCourseRepository = { get: sinon.stub(), update: sinon.stub() };

    const event = new ChallengeNeutralized({ certificationCourseId: 1, juryId: 7 });
    const certificationAssessment = domainBuilder.buildCertificationAssessment({
      userId: 123,
      certificationCourseId: 1,
    });
    certificationAssessmentRepository.getByCertificationCourseId.withArgs({ certificationCourseId: 1 }).resolves(certificationAssessment);

    const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
      competenceMarks: [],
      percentageCorrectAnswers: 80,
    });
    certificationResultService.computeResult
      .withArgs({ certificationAssessment, continueOnError: false })
      .resolves(certificationAssessmentScore);
    assessmentResultRepository.save.resolves(domainBuilder.buildAssessmentResult());

    const certificationCourse = domainBuilder.buildCertificationCourse({ id: certificationAssessment.certificationCourseId, isCancelled: false });
    certificationCourseRepository.get.withArgs(certificationAssessment.certificationCourseId).resolves(certificationCourse);

    const dependencies = {
      assessmentResultRepository,
      certificationAssessmentRepository,
      competenceMarkRepository,
      certificationResultService,
      certificationCourseRepository,
    };

    // when
    const returnedEvent = await handleCertificationRescoring({
      ...dependencies,
      event,
    });

    // then
    const expectedReturnedEvent = domainBuilder.buildCertificationRescoringCompletedEvent({
      certificationCourseId: 1,
      userId: 123,
      reproducibilityRate: 80,
    });
    expect(returnedEvent).to.deep.equal(expectedReturnedEvent);
  });

  it('computes and persists the assessment result in error when computation fails', async () => {
    // given
    const assessmentResultRepository = { save: sinon.stub() };
    const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub() };
    const competenceMarkRepository = { save: sinon.stub() };
    const certificationResultService = { computeResult: sinon.stub() };

    const event = new ChallengeNeutralized({ certificationCourseId: 1, juryId: 7 });
    const certificationAssessment = new CertificationAssessment({
      id: 123,
      userId: 123,
      certificationCourseId: 1,
      createdAt: new Date('2020-01-01'),
      completedAt: new Date('2020-01-01'),
      state: CertificationAssessment.states.STARTED,
      isV2Certification: true,
      certificationChallenges: [
        domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
        domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
      ],
      certificationAnswersByDate: ['answer'],
    });
    certificationAssessmentRepository.getByCertificationCourseId.withArgs({ certificationCourseId: 1 }).resolves(certificationAssessment);

    certificationResultService.computeResult
      .withArgs({ certificationAssessment, continueOnError: false })
      .rejects(new CertificationComputeError('Oopsie'));

    const assessmentResultToBeSaved = new AssessmentResult({
      id: undefined,
      emitter: 'PIX-ALGO-NEUTRALIZATION',
      commentForJury: 'Oopsie',
      pixScore: 0,
      status: 'error',
      assessmentId: 123,
      juryId: 7,
    });
    const savedAssessmentResult = new AssessmentResult({ ...assessmentResultToBeSaved, id: 4 });
    assessmentResultRepository.save
      .withArgs(assessmentResultToBeSaved)
      .resolves(savedAssessmentResult);

    const dependencies = {
      assessmentResultRepository,
      certificationAssessmentRepository,
      competenceMarkRepository,
      certificationResultService,
    };

    // when
    await handleCertificationRescoring(
      {
        ...dependencies,
        event,
      });

    // then
    expect(assessmentResultRepository.save).to.have.been.calledWith(assessmentResultToBeSaved);
  });

  context('when certification assessment score has no competence marks', () => {

    it('should cancel the certification course', async () => {
      // given
      const assessmentResultRepository = { save: sinon.stub() };
      const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub() };
      const competenceMarkRepository = { save: sinon.stub() };
      const certificationResultService = { computeResult: sinon.stub() };
      const certificationCourseRepository = { get: sinon.stub(), update: sinon.stub() };

      const event = new ChallengeNeutralized({ certificationCourseId: 1, juryId: 7 });
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        userId: 123,
        certificationCourseId: 1,
      });
      certificationAssessmentRepository.getByCertificationCourseId.withArgs({ certificationCourseId: 1 }).resolves(certificationAssessment);

      const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
        competenceMarks: [],
        percentageCorrectAnswers: 80,
      });
      certificationResultService.computeResult
        .withArgs({ certificationAssessment, continueOnError: false })
        .resolves(certificationAssessmentScore);
      assessmentResultRepository.save.resolves(domainBuilder.buildAssessmentResult());

      const certificationCourse = domainBuilder.buildCertificationCourse({ id: certificationAssessment.certificationCourseId, isCancelled: false });
      certificationCourseRepository.get.withArgs(certificationAssessment.certificationCourseId).resolves(certificationCourse);

      const dependencies = {
        assessmentResultRepository,
        certificationAssessmentRepository,
        competenceMarkRepository,
        certificationResultService,
        certificationCourseRepository,
      };

      // when
      await handleCertificationRescoring({
        ...dependencies,
        event,
      });

      // then
      const expectedCertificationCourseToUpdate = domainBuilder.buildCertificationCourse({
        ...certificationCourse.toDTO(),
        isCancelled: true,
      });
      expect(certificationCourseRepository.update).to.have.been.calledWith(expectedCertificationCourseToUpdate);
    });
  });

  context('when certification assessment score has competence marks', () => {

    it('should uncancel the certification course', async () => {
      // given
      const assessmentResultRepository = { save: sinon.stub() };
      const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub() };
      const competenceMarkRepository = { save: sinon.stub() };
      const certificationResultService = { computeResult: sinon.stub() };
      const certificationCourseRepository = { get: sinon.stub(), update: sinon.stub() };

      const event = new ChallengeNeutralized({ certificationCourseId: 1, juryId: 7 });
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        userId: 123,
        certificationCourseId: 1,
      });
      certificationAssessmentRepository.getByCertificationCourseId.withArgs({ certificationCourseId: 1 }).resolves(certificationAssessment);

      const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
        competenceMarks: [domainBuilder.buildCompetenceMark()],
        percentageCorrectAnswers: 80,
      });
      certificationResultService.computeResult
        .withArgs({ certificationAssessment, continueOnError: false })
        .resolves(certificationAssessmentScore);
      assessmentResultRepository.save.resolves(domainBuilder.buildAssessmentResult());

      const certificationCourse = domainBuilder.buildCertificationCourse({ id: certificationAssessment.certificationCourseId, isCancelled: true });
      certificationCourseRepository.get.withArgs(certificationAssessment.certificationCourseId).resolves(certificationCourse);

      const dependencies = {
        assessmentResultRepository,
        certificationAssessmentRepository,
        competenceMarkRepository,
        certificationResultService,
        certificationCourseRepository,
      };

      // when
      await handleCertificationRescoring({
        ...dependencies,
        event,
      });

      // then
      const expectedCertificationCourseToUpdate = domainBuilder.buildCertificationCourse({
        ...certificationCourse.toDTO(),
        isCancelled: false,
      });
      expect(certificationCourseRepository.update).to.have.been.calledWith(expectedCertificationCourseToUpdate);
    });
  });
});
