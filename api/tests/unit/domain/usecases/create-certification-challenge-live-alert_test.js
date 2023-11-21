import { domainBuilder, expect, sinon } from '../../../test-helper.js';
import { createCertificationChallengeLiveAlert } from '../../../../lib/domain/usecases/create-certification-challenge-live-alert.js';
import _ from 'lodash';

describe('Unit | UseCase | create-certification-challenge-live-alert', function () {
  let certificationChallengeLiveAlertRepository;
  let challengeRepository;
  let answerRepository;

  beforeEach(function () {
    certificationChallengeLiveAlertRepository = {
      save: sinon.stub(),
      getOngoingByChallengeIdAndAssessmentId: sinon.stub(),
    };

    challengeRepository = {
      get: sinon.stub(),
    };

    answerRepository = {
      findByAssessment: sinon.stub(),
    };
  });

  it('should save the challenge live alert', async function () {
    // given
    const assessmentId = 123;
    const challengeId = 'pix123';
    const challenge = domainBuilder.buildChallenge({
      id: challengeId,
      focused: true,
      embedUrl: 'embed.url',
      illustrationUrl: 'illustration.url',
      attachments: ['attachment.url'],
    });
    const certificationChallengeLiveAlert = domainBuilder.buildCertificationChallengeLiveAlert({
      assessmentId,
      challengeId,
      answerRepository,
    });

    const answers = [domainBuilder.buildAnswer({ id: 1 }), domainBuilder.buildAnswer({ id: 2 })];

    answerRepository.findByAssessment.withArgs(assessmentId).resolves(answers);
    challengeRepository.get.withArgs(challengeId).resolves(challenge);

    certificationChallengeLiveAlertRepository.save.withArgs({ certificationChallengeLiveAlert }).resolves();

    // when
    await createCertificationChallengeLiveAlert({
      assessmentId,
      challengeId,
      certificationChallengeLiveAlertRepository,
      answerRepository,
      challengeRepository,
    });

    // then
    expect(certificationChallengeLiveAlertRepository.save).to.have.been.calledOnce;

    const expectedLiveAlert = _.pick(
      domainBuilder.buildCertificationChallengeLiveAlert({
        assessmentId,
        challengeId,
        questionNumber: answers.length + 1,
        hasAttachment: true,
        hasImage: true,
        isFocus: true,
        hasEmbed: true,
      }),
      ['assessmentId', 'challengeId', 'questionNumber', 'status', 'hasAttachment', 'hasImage', 'hasEmbed', 'isFocus'],
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
      challengeRepository,
    });

    // then
    expect(certificationChallengeLiveAlertRepository.getOngoingByChallengeIdAndAssessmentId).to.have.been.calledOnce;
    expect(certificationChallengeLiveAlertRepository.save).to.not.have.been.called;
  });
});
