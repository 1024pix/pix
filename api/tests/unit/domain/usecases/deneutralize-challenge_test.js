import { sinon, expect, domainBuilder } from '../../../test-helper.js';
import { CertificationAssessment } from '../../../../lib/domain/models/CertificationAssessment.js';
import { deneutralizeChallenge } from '../../../../lib/domain/usecases/deneutralize-challenge.js';
import { ChallengeDeneutralized } from '../../../../lib/domain/events/ChallengeDeneutralized.js';

describe('Unit | UseCase | deneutralize-challenge', function () {
  it('deneutralizes a challenge by its recId', async function () {
    // given
    const certificationCourseId = 1;
    const certificationAssessmentRepository = {
      getByCertificationCourseId: sinon.stub(),
      save: sinon.stub(),
    };
    const dependencies = {
      certificationAssessmentRepository,
    };

    const challengeToBeDeneutralized = domainBuilder.buildCertificationChallengeWithType({ isNeutralized: true });
    const certificationAssessment = domainBuilder.buildCertificationAssessment({
      certificationChallenges: [
        challengeToBeDeneutralized,
        domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
        domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
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
    expect(certificationAssessment.deneutralizeChallengeByRecId).to.have.been.calledWithExactly(
      challengeToBeDeneutralized.challengeId,
    );
    expect(certificationAssessmentRepository.save).to.have.been.calledWithExactly(certificationAssessment);
  });

  it('return a ChallengeDeneutralized event', async function () {
    // given
    const locale = 'fr-fr';
    const certificationCourseId = 1;
    const certificationAssessmentRepository = {
      getByCertificationCourseId: sinon.stub(),
      save: sinon.stub(),
    };
    const dependencies = {
      certificationAssessmentRepository,
    };

    const challengeToBeDeneutralized = domainBuilder.buildCertificationChallengeWithType({ isNeutralized: true });
    const certificationAssessment = new CertificationAssessment({
      id: 123,
      userId: 123,
      certificationCourseId: 1,
      createdAt: new Date('2020-01-01'),
      completedAt: new Date('2020-01-01'),
      state: CertificationAssessment.states.STARTED,
      version: 2,
      certificationChallenges: [
        challengeToBeDeneutralized,
        domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
        domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
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
      locale,
    });

    // then
    expect(event).to.be.an.instanceof(ChallengeDeneutralized);
    expect(event).to.deep.equal({ certificationCourseId, juryId: 7, locale });
  });
});
