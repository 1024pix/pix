const { expect, sinon, domainBuilder } = require('../../../test-helper');
const { handleCertificationRescoring } = require('../../../../lib/domain/events')._forTestOnly.handlers;
const ChallengeNeutralized = require('../../../../lib/domain/events/ChallengeNeutralized');
const CertificationAssessment = require('../../../../lib/domain/models/CertificationAssessment');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const { CertificationComputeError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Events | handle-certification-rescoring', function () {
  it('computes and persists the assessment result and competence marks when computation succeeds', async function () {
    // given
    const certificationCourseRepository = { get: sinon.stub(), update: sinon.stub() };
    const assessmentResultRepository = { save: sinon.stub() };
    const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub() };
    const competenceMarkRepository = { save: sinon.stub() };
    const scoringCertificationService = { calculateCertificationAssessmentScore: sinon.stub() };
    const certificationCourse = domainBuilder.buildCertificationCourse({
      isCancelled: false,
    });
    const expectedSaveCertificationCourse = domainBuilder.buildCertificationCourse({
      ...certificationCourse.toDTO(),
    });

    const event = new ChallengeNeutralized({ certificationCourseId: certificationCourse.getId(), juryId: 7 });
    const certificationAssessment = new CertificationAssessment({
      id: 123,
      userId: 123,
      certificationCourseId: certificationCourse.getId(),
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
    certificationAssessmentRepository.getByCertificationCourseId
      .withArgs({ certificationCourseId: certificationCourse.getId() })
      .resolves(certificationAssessment);
    certificationCourseRepository.get.withArgs(certificationCourse.getId()).resolves(certificationCourse);

    const competenceMarkData2 = domainBuilder.buildCompetenceMark();
    const competenceMarkData1 = domainBuilder.buildCompetenceMark();
    const nbPix = Symbol('nbPix');
    const status = Symbol('status');
    const certificationAssessmentScore = {
      nbPix,
      status,
      competenceMarks: [competenceMarkData1, competenceMarkData2],
      percentageCorrectAnswers: 80,
      hasEnoughNonNeutralizedChallengesToBeTrusted: true,
    };
    scoringCertificationService.calculateCertificationAssessmentScore
      .withArgs({ certificationAssessment, continueOnError: false })
      .resolves(certificationAssessmentScore);

    const assessmentResultToBeSaved = new AssessmentResult({
      id: undefined,
      commentForJury: 'Computed',
      emitter: 'PIX-ALGO-NEUTRALIZATION',
      pixScore: nbPix,
      status: status,
      assessmentId: 123,
      juryId: 7,
    });
    const savedAssessmentResult = new AssessmentResult({ ...assessmentResultToBeSaved, id: 4 });
    assessmentResultRepository.save.withArgs(assessmentResultToBeSaved).resolves(savedAssessmentResult);

    const dependendencies = {
      assessmentResultRepository,
      certificationAssessmentRepository,
      competenceMarkRepository,
      scoringCertificationService,
      certificationCourseRepository,
    };

    // when
    await handleCertificationRescoring({
      ...dependendencies,
      event,
    });

    // then
    expect(assessmentResultRepository.save).to.have.been.calledWith(assessmentResultToBeSaved);
    competenceMarkData1.assessmentResultId = savedAssessmentResult.id;
    competenceMarkData2.assessmentResultId = savedAssessmentResult.id;
    expect(competenceMarkRepository.save).to.have.been.calledWithExactly(competenceMarkData1);
    expect(competenceMarkRepository.save).to.have.been.calledWithExactly(competenceMarkData2);
    expect(certificationCourseRepository.update).to.have.been.calledWithExactly(expectedSaveCertificationCourse);
  });

  context('when the certification has not enough non neutralized challenges to be trusted', function () {
    it('cancels the certification and save a not trustable assessment result', async function () {
      // given
      const certificationCourseRepository = { get: sinon.stub(), update: sinon.stub() };
      const assessmentResultRepository = { save: sinon.stub() };
      const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub() };
      const competenceMarkRepository = { save: sinon.stub() };
      const scoringCertificationService = { calculateCertificationAssessmentScore: sinon.stub() };
      const certificationCourse = domainBuilder.buildCertificationCourse({ id: 789 });
      sinon.spy(certificationCourse, 'cancel');

      const event = new ChallengeNeutralized({ certificationCourseId: 789, juryId: 7 });
      const certificationAssessment = new CertificationAssessment({
        id: 123,
        userId: 123,
        certificationCourseId: 789,
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
      certificationAssessmentRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId: 789 })
        .resolves(certificationAssessment);
      certificationCourseRepository.get.withArgs(789).resolves(certificationCourse);
      const competenceMarkData2 = domainBuilder.buildCompetenceMark({ score: 12 });
      const competenceMarkData1 = domainBuilder.buildCompetenceMark({ score: 18 });
      const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
        status: AssessmentResult.status.VALIDATED,
        competenceMarks: [competenceMarkData1, competenceMarkData2],
        percentageCorrectAnswers: 80,
        hasEnoughNonNeutralizedChallengesToBeTrusted: false,
      });
      scoringCertificationService.calculateCertificationAssessmentScore
        .withArgs({ certificationAssessment, continueOnError: false })
        .resolves(certificationAssessmentScore);

      const assessmentResultToBeSaved = domainBuilder.buildAssessmentResult.notTrustable({
        emitter: 'PIX-ALGO-NEUTRALIZATION',
        pixScore: 30,
        status: AssessmentResult.status.VALIDATED,
        assessmentId: 123,
        juryId: 7,
      });
      const savedAssessmentResult = new AssessmentResult({ ...assessmentResultToBeSaved, id: 4 });
      assessmentResultRepository.save.resolves(savedAssessmentResult);

      const dependendencies = {
        assessmentResultRepository,
        certificationAssessmentRepository,
        competenceMarkRepository,
        scoringCertificationService,
        certificationCourseRepository,
      };

      // when
      await handleCertificationRescoring({
        ...dependendencies,
        event,
      });

      // then
      expect(assessmentResultRepository.save).to.have.been.calledWithExactly(assessmentResultToBeSaved);
      expect(certificationCourse.cancel).to.have.been.calledOnce;
      expect(certificationCourseRepository.update).to.have.been.calledWithExactly(certificationCourse);
    });
  });

  context('when the certification has enough non neutralized challenges to be trusted', function () {
    it('uncancels the certification and save a standard assessment result', async function () {
      // given
      const certificationCourseRepository = { get: sinon.stub(), update: sinon.stub() };
      const assessmentResultRepository = { save: sinon.stub() };
      const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub() };
      const competenceMarkRepository = { save: sinon.stub() };
      const scoringCertificationService = { calculateCertificationAssessmentScore: sinon.stub() };
      const certificationCourse = domainBuilder.buildCertificationCourse({ id: 789 });
      sinon.spy(certificationCourse, 'uncancel');

      const event = new ChallengeNeutralized({ certificationCourseId: 789, juryId: 7 });
      const certificationAssessment = new CertificationAssessment({
        id: 123,
        userId: 123,
        certificationCourseId: 789,
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
      certificationAssessmentRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId: 789 })
        .resolves(certificationAssessment);
      certificationCourseRepository.get.withArgs(789).resolves(certificationCourse);
      const competenceMarkData2 = domainBuilder.buildCompetenceMark({ score: 12 });
      const competenceMarkData1 = domainBuilder.buildCompetenceMark({ score: 18 });
      const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
        status: AssessmentResult.status.VALIDATED,
        competenceMarks: [competenceMarkData1, competenceMarkData2],
        percentageCorrectAnswers: 80,
        hasEnoughNonNeutralizedChallengesToBeTrusted: true,
      });
      scoringCertificationService.calculateCertificationAssessmentScore
        .withArgs({ certificationAssessment, continueOnError: false })
        .resolves(certificationAssessmentScore);

      const assessmentResultToBeSaved = domainBuilder.buildAssessmentResult.standard({
        emitter: 'PIX-ALGO-NEUTRALIZATION',
        pixScore: 30,
        status: AssessmentResult.status.VALIDATED,
        assessmentId: 123,
        juryId: 7,
      });
      const savedAssessmentResult = new AssessmentResult({ ...assessmentResultToBeSaved, id: 4 });
      assessmentResultRepository.save.resolves(savedAssessmentResult);

      const dependendencies = {
        assessmentResultRepository,
        certificationAssessmentRepository,
        competenceMarkRepository,
        scoringCertificationService,
        certificationCourseRepository,
      };

      // when
      await handleCertificationRescoring({
        ...dependendencies,
        event,
      });

      // then
      expect(assessmentResultRepository.save).to.have.been.calledWithExactly(assessmentResultToBeSaved);
      expect(certificationCourse.uncancel).to.have.been.calledOnce;
      expect(certificationCourseRepository.update).to.have.been.calledWithExactly(certificationCourse);
    });
  });

  it('returns a CertificationRescoringCompleted event', async function () {
    // given
    const certificationCourseRepository = { get: sinon.stub(), update: sinon.stub() };
    const assessmentResultRepository = { save: sinon.stub() };
    const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub() };
    const competenceMarkRepository = { save: sinon.stub() };
    const scoringCertificationService = { calculateCertificationAssessmentScore: sinon.stub() };
    const certificationCourse = domainBuilder.buildCertificationCourse();

    const event = new ChallengeNeutralized({ certificationCourseId: certificationCourse.getId(), juryId: 7 });
    const certificationAssessment = domainBuilder.buildCertificationAssessment({
      userId: 123,
      certificationCourseId: certificationCourse.getId(),
    });
    certificationAssessmentRepository.getByCertificationCourseId
      .withArgs({ certificationCourseId: certificationCourse.getId() })
      .resolves(certificationAssessment);
    certificationCourseRepository.get.withArgs(certificationCourse.getId()).resolves(certificationCourse);

    const certificationAssessmentScore = {
      competenceMarks: [],
      percentageCorrectAnswers: 80,
      hasEnoughNonNeutralizedChallengesToBeTrusted: true,
    };
    scoringCertificationService.calculateCertificationAssessmentScore
      .withArgs({ certificationAssessment, continueOnError: false })
      .resolves(certificationAssessmentScore);
    assessmentResultRepository.save.resolves(domainBuilder.buildAssessmentResult());

    const dependendencies = {
      assessmentResultRepository,
      certificationAssessmentRepository,
      competenceMarkRepository,
      scoringCertificationService,
      certificationCourseRepository,
    };

    // when
    const returnedEvent = await handleCertificationRescoring({
      ...dependendencies,
      event,
    });

    // then
    const expectedReturnedEvent = domainBuilder.buildCertificationRescoringCompletedEvent({
      certificationCourseId: certificationCourse.getId(),
      userId: 123,
      reproducibilityRate: 80,
    });
    expect(returnedEvent).to.deep.equal(expectedReturnedEvent);
  });

  it('computes and persists the assessment result in error when computation fails', async function () {
    // given
    const assessmentResultRepository = { save: sinon.stub() };
    const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub() };
    const competenceMarkRepository = { save: sinon.stub() };
    const scoringCertificationService = { calculateCertificationAssessmentScore: sinon.stub() };

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
    certificationAssessmentRepository.getByCertificationCourseId
      .withArgs({ certificationCourseId: 1 })
      .resolves(certificationAssessment);

    scoringCertificationService.calculateCertificationAssessmentScore
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
    assessmentResultRepository.save.withArgs(assessmentResultToBeSaved).resolves(savedAssessmentResult);

    const dependendencies = {
      assessmentResultRepository,
      certificationAssessmentRepository,
      competenceMarkRepository,
      scoringCertificationService,
    };

    // when
    await handleCertificationRescoring({
      ...dependendencies,
      event,
    });

    // then
    expect(assessmentResultRepository.save).to.have.been.calledWith(assessmentResultToBeSaved);
  });
});
