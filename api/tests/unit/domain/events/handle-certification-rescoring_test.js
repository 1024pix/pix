const _ = require('lodash');
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
        domainBuilder.buildCertificationChallenge({ isNeutralized: false }),
        domainBuilder.buildCertificationChallenge({ isNeutralized: false }),
      ],
      certificationAnswersByDate: ['answer'],
    });
    certificationAssessmentRepository.getByCertificationCourseId.withArgs(1).resolves(certificationAssessment);

    const competenceMarkData2 = domainBuilder.buildCompetenceMark();
    const competenceMarkData1 = domainBuilder.buildCompetenceMark();
    const nbPix = Symbol('nbPix');
    const status = Symbol('status');
    const certificationAssessmentScore = {
      nbPix,
      status,
      competenceMarks: [competenceMarkData1, competenceMarkData2],
      percentageCorrectAnswers: 80,
    };
    scoringCertificationService.calculateCertificationAssessmentScore.withArgs(certificationAssessment)
      .resolves(certificationAssessmentScore);

    const assessmentResultToBeSaved = new AssessmentResult({
      id: undefined,
      commentForJury: 'Computed',
      emitter: 'PIX-ALGO',
      pixScore: nbPix,
      status: status,
      assessmentId: 123,
      juryId: 7,
    });
    const savedAssessmentResult = new AssessmentResult({ ...assessmentResultToBeSaved, id: 4 });
    assessmentResultRepository.save
      .withArgs(assessmentResultToBeSaved)
      .resolves(savedAssessmentResult);

    const domainTransaction = Symbol('domain transaction');

    const dependendencies = {
      assessmentResultRepository,
      certificationAssessmentRepository,
      competenceMarkRepository,
      scoringCertificationService,
    };

    // when
    await handleCertificationRescoring(
      {
        ...dependendencies,
        event,
        domainTransaction,
      });

    // then
    expect(assessmentResultRepository.save).to.have.been.calledWith(assessmentResultToBeSaved);
    competenceMarkData1.assessmentResultId = savedAssessmentResult.id;
    competenceMarkData2.assessmentResultId = savedAssessmentResult.id;
    expect(competenceMarkRepository.save).to.have.been.calledWithExactly(competenceMarkData1, domainTransaction);
    expect(competenceMarkRepository.save).to.have.been.calledWithExactly(competenceMarkData2, domainTransaction);
  });

  it('computes and persists the assessment result in error when computation fails', async () => {
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
        domainBuilder.buildCertificationChallenge({ isNeutralized: false }),
        domainBuilder.buildCertificationChallenge({ isNeutralized: false }),
      ],
      certificationAnswersByDate: ['answer'],
    });
    certificationAssessmentRepository.getByCertificationCourseId.withArgs(1).resolves(certificationAssessment);

    scoringCertificationService.calculateCertificationAssessmentScore.withArgs(certificationAssessment)
      .rejects(new CertificationComputeError('Oopsie'));

    const assessmentResultToBeSaved = new AssessmentResult({
      id: undefined,
      emitter: 'PIX-ALGO',
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

    const domainTransaction = Symbol('domain transaction');

    const dependendencies = {
      assessmentResultRepository,
      certificationAssessmentRepository,
      competenceMarkRepository,
      scoringCertificationService,
    };

    // when
    await handleCertificationRescoring(
      {
        ...dependendencies,
        event,
        domainTransaction,
      });

    // then
    expect(assessmentResultRepository.save).to.have.been.calledWith(assessmentResultToBeSaved);
  });
});
