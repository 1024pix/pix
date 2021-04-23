const {
  sinon,
  expect,
  domainBuilder,
} = require('../../../test-helper');
const CertificationAssessment = require('../../../../lib/domain/models/CertificationAssessment');
const deneutralizeChallenge = require('../../../../lib/domain/usecases/deneutralize-challenge');
const ChallengeDeneutralized = require('../../../../lib/domain/events/ChallengeDeneutralized');

describe('Unit | UseCase | deneutralize-challenge', () => {
  it('deneutralizes a challenge by its recId', async () => {
    // given
    const certificationCourseId = 1;
    const certificationAssessmentRepository = {
      getByCertificationCourseId: sinon.stub(),
      save: sinon.stub(),
    };
    const dependencies = {
      certificationAssessmentRepository,
    };

    const challengeToBeDeneutralized = domainBuilder.buildCertificationChallenge({ isNeutralized: true });
    const certificationAssessment = domainBuilder.buildCertificationAssessment({
      certificationChallenges: [
        challengeToBeDeneutralized,
        domainBuilder.buildCertificationChallenge({ isNeutralized: false }),
        domainBuilder.buildCertificationChallenge({ isNeutralized: false }),
      ],
    });
    sinon.stub(certificationAssessment, 'deneutralizeChallengeByRecId');

    certificationAssessmentRepository.getByCertificationCourseId
      .withArgs({ certificationCourseId })
      .resolves(certificationAssessment);

    // when
    await deneutralizeChallenge({
      ...dependencies,
      certificationCourseId,
      challengeRecId: challengeToBeDeneutralized.challengeId,
      juryId: 7,
    });

    // then
    expect(certificationAssessment.deneutralizeChallengeByRecId).to.have.been.calledWith(challengeToBeDeneutralized.challengeId);
    expect(certificationAssessmentRepository.save).to.have.been.calledWith(certificationAssessment);
  });

  it('return a ChallengeDeneutralized event', async () => {
    // given
    const certificationCourseId = 1;
    const certificationAssessmentRepository = {
      getByCertificationCourseId: sinon.stub(),
      save: sinon.stub(),
    };
    const dependencies = {
      certificationAssessmentRepository,
    };

    const challengeToBeDeneutralized = domainBuilder.buildCertificationChallenge({ isNeutralized: true });
    const certificationAssessment = new CertificationAssessment({
      id: 123,
      userId: 123,
      certificationCourseId: 1,
      createdAt: new Date('2020-01-01'),
      completedAt: new Date('2020-01-01'),
      state: CertificationAssessment.states.STARTED,
      isV2Certification: true,
      certificationChallenges: [
        challengeToBeDeneutralized,
        domainBuilder.buildCertificationChallenge({ isNeutralized: false }),
        domainBuilder.buildCertificationChallenge({ isNeutralized: false }),
      ],
      certificationAnswersByDate: ['answer'],
    });
    certificationAssessmentRepository.getByCertificationCourseId
      .withArgs({ certificationCourseId })
      .resolves(certificationAssessment);

    // when
    const event = await deneutralizeChallenge({
      ...dependencies,
      certificationCourseId,
      challengeRecId: challengeToBeDeneutralized.challengeId,
      juryId: 7,
    });

    // then
    expect(event).to.be.an.instanceof(ChallengeDeneutralized);
    expect(event).to.deep.equal({ certificationCourseId, juryId: 7 });
  });
});
