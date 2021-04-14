const {
  sinon,
  expect,
  domainBuilder,
} = require('../../../test-helper');
const CertificationAssessment = require('../../../../lib/domain/models/CertificationAssessment');
const neutralizeChallenge = require('../../../../lib/domain/usecases/neutralize-challenge');
const ChallengeNeutralized = require('../../../../lib/domain/events/ChallengeNeutralized');

describe('Unit | UseCase | neutralize-challenge', () => {
  it('neutralizes a challenge by its recId', async () => {
    // given
    const certificationCourseId = 1;
    const certificationAssessmentRepository = {
      getByCertificationCourseId: sinon.stub(),
      save: sinon.spy(), // FIXME : do it without a spy ?
    };
    const dependencies = {
      certificationAssessmentRepository,
    };

    const challengeToBeNeutralized = domainBuilder.buildCertificationChallenge({ isNeutralized: false });
    const certificationAssessment = new CertificationAssessment({
      id: 123,
      userId: 123,
      certificationCourseId: 1,
      createdAt: new Date('2020-01-01'),
      completedAt: new Date('2020-01-01'),
      state: CertificationAssessment.states.STARTED,
      isV2Certification: true,
      certificationChallenges: [
        challengeToBeNeutralized,
        domainBuilder.buildCertificationChallenge({ isNeutralized: false }),
        domainBuilder.buildCertificationChallenge({ isNeutralized: false }),
      ],
      certificationAnswersByDate: ['answer'],
    });
    certificationAssessmentRepository.getByCertificationCourseId
      .withArgs(certificationCourseId)
      .resolves(certificationAssessment);

    // when
    await neutralizeChallenge({
      ...dependencies,
      certificationCourseId,
      challengeRecId: challengeToBeNeutralized.challengeId,
      juryId: 7,
    });

    // then
    expect(
      certificationAssessmentRepository.save
        .getCall(0)
        .args[0]
        .certificationChallenges[0].isNeutralized,
    ).to.be.true;
  });

  it('return a ChallengeNeutralized event', async () => {
    // given
    const certificationCourseId = 1;
    const certificationAssessmentRepository = {
      getByCertificationCourseId: sinon.stub(),
      save: sinon.stub(),
    };
    const dependencies = {
      certificationAssessmentRepository,
    };

    const challengeToBeNeutralized = domainBuilder.buildCertificationChallenge({ isNeutralized: false });
    const certificationAssessment = new CertificationAssessment({
      id: 123,
      userId: 123,
      certificationCourseId: 1,
      createdAt: new Date('2020-01-01'),
      completedAt: new Date('2020-01-01'),
      state: CertificationAssessment.states.STARTED,
      isV2Certification: true,
      certificationChallenges: [
        challengeToBeNeutralized,
        domainBuilder.buildCertificationChallenge({ isNeutralized: false }),
        domainBuilder.buildCertificationChallenge({ isNeutralized: false }),
      ],
      certificationAnswersByDate: ['answer'],
    });
    certificationAssessmentRepository.getByCertificationCourseId
      .withArgs(certificationCourseId)
      .resolves(certificationAssessment);

    // when
    const event = await neutralizeChallenge({
      ...dependencies,
      certificationCourseId,
      challengeRecId: challengeToBeNeutralized.challengeId,
      juryId: 7,
    });

    // then
    expect(event).to.be.an.instanceof(ChallengeNeutralized);
    expect(event).to.deep.equal({ certificationCourseId, juryId: 7 });
  });
});
