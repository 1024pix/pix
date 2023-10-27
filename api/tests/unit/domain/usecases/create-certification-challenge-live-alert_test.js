import { domainBuilder, expect, sinon } from '../../../test-helper.js';
import { createCertificationChallengeLiveAlert } from '../../../../lib/domain/usecases/create-certification-challenge-live-alert.js';
import _ from 'lodash';

describe('Unit | UseCase | create-certification-challenge-live-alert', function () {
  let certificationChallengeLiveAlertRepository;
  let answerRepository;

  beforeEach(function () {
    certificationChallengeLiveAlertRepository = {
      save: sinon.stub(),
      getOngoingByChallengeIdAndAssessmentId: sinon.stub(),
    };

    answerRepository = {
      findByAssessment: sinon.stub(),
    };
  });

  it('should pause the assessment', async function () {
    // given
    const assessmentId = 123;
    const challengeId = 'pix123';
    const certificationChallengeLiveAlert = domainBuilder.buildCertificationChallengeLiveAlert({
      assessmentId,
      challengeId,
      answerRepository,
    });

    const answers = [domainBuilder.buildAnswer({ id: 1 }), domainBuilder.buildAnswer({ id: 2 })];

    answerRepository.findByAssessment.withArgs(assessmentId).resolves(answers);

    certificationChallengeLiveAlertRepository.save.withArgs({ certificationChallengeLiveAlert }).resolves();

    // when
    await createCertificationChallengeLiveAlert({
      assessmentId,
      challengeId,
      certificationChallengeLiveAlertRepository,
      answerRepository,
    });

    // then
    expect(certificationChallengeLiveAlertRepository.save).to.have.been.calledOnce;

    const expectedLiveAlert = _.pick(
      domainBuilder.buildCertificationChallengeLiveAlert({
        assessmentId,
        challengeId,
        questionNumber: answers.length + 1,
      }),
      ['assessmentId', 'challengeId', 'questionNumber', 'status'],
    );

    expect(certificationChallengeLiveAlertRepository.save).to.have.been.calledWith({
      certificationChallengeLiveAlert: sinon.match(expectedLiveAlert),
    });
  });

  it('should prevent the candidate from alerting twice with one unhandled alert', async function () {
    // given
    const assessmentId = 123;
    const challengeId = 'pix123';
    const unhandledCertificationChallengeLiveAlert = domainBuilder.buildCertificationChallengeLiveAlert({
      assessmentId,
      challengeId,
      answerRepository,
    });

    const answers = [domainBuilder.buildAnswer({ id: 1 }), domainBuilder.buildAnswer({ id: 2 })];
    answerRepository.findByAssessment.withArgs(assessmentId).resolves(answers);

    certificationChallengeLiveAlertRepository.getOngoingByChallengeIdAndAssessmentId
      .withArgs({ assessmentId, challengeId })
      .resolves(unhandledCertificationChallengeLiveAlert);

    // when
    await createCertificationChallengeLiveAlert({
      assessmentId,
      challengeId,
      certificationChallengeLiveAlertRepository,
      answerRepository,
    });

    // then
    expect(certificationChallengeLiveAlertRepository.getOngoingByChallengeIdAndAssessmentId).to.have.been.calledOnce;
    expect(certificationChallengeLiveAlertRepository.save).to.not.have.been.called;
  });
});
