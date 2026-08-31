import { expect } from 'chai';
import _ from 'lodash';
import sinon from 'sinon';

import { createLiveAlert } from '../../../../../../src/certification/evaluation/domain/usecases/create-live-alert.js';
import { ChallengeAlreadyAnsweredError } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Evaluation | Unit | UseCase | create-live-alert', function () {
  let certificationChallengeLiveAlertRepository;
  let sharedChallengeRepository;
  let answerRepository;

  beforeEach(function () {
    certificationChallengeLiveAlertRepository = {
      save: sinon.stub(),
      getOngoingByChallengeIdAndAssessmentId: sinon.stub(),
    };

    sharedChallengeRepository = {
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
    sharedChallengeRepository.get.withArgs(challengeId).resolves(challenge);

    certificationChallengeLiveAlertRepository.save.withArgs({ certificationChallengeLiveAlert }).resolves();

    // when
    await createLiveAlert({
      assessmentId,
      challengeId,
      certificationChallengeLiveAlertRepository,
      answerRepository,
      sharedChallengeRepository,
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

  context('when the candidate has already answered the current challenge', function () {
    it('should throw an error', async function () {
      // given
      const assessmentId = 123;
      const challengeId = 'pix123';

      const answers = [domainBuilder.buildAnswer({ id: 1 }), domainBuilder.buildAnswer({ id: 2, challengeId })];
      answerRepository.findByAssessment.withArgs(assessmentId).resolves(answers);

      // when
      const error = await catchErr(createLiveAlert)({
        assessmentId,
        challengeId,
        certificationChallengeLiveAlertRepository,
        answerRepository,
        sharedChallengeRepository,
      });

      // then
      expect(error).to.be.instanceOf(ChallengeAlreadyAnsweredError);
      expect(certificationChallengeLiveAlertRepository.save).to.not.have.been.called;
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
    await createLiveAlert({
      assessmentId,
      challengeId,
      certificationChallengeLiveAlertRepository,
      answerRepository,
      sharedChallengeRepository,
    });

    // then
    expect(certificationChallengeLiveAlertRepository.getOngoingByChallengeIdAndAssessmentId).to.have.been.calledOnce;
    expect(certificationChallengeLiveAlertRepository.save).to.not.have.been.called;
  });
});
