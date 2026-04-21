import sinon from 'sinon';

import { ChallengeNeutralized } from '../../../../../../src/certification/evaluation/domain/events/ChallengeNeutralized.js';
import { neutralizeChallenge } from '../../../../../../src/certification/evaluation/domain/usecases/neutralize-challenge.js';
import { CertificationAssessment } from '../../../../../../src/certification/session-management/domain/models/CertificationAssessment.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Evaluation | Unit | UseCase | neutralize-challenge', function () {
  it('neutralizes a challenge by its recId', async function () {
    // given
    const certificationCourseId = 1;
    const certificationAssessmentRepository = {
      getByCertificationCourseId: sinon.stub(),
      save: sinon.stub(),
    };
    const dependencies = {
      certificationAssessmentRepository,
    };

    const challengeToBeNeutralized = domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false });
    const certificationAssessment = new CertificationAssessment({
      id: 123,
      userId: 123,
      certificationCourseId: 1,
      createdAt: new Date('2020-01-01'),
      completedAt: new Date('2020-01-01'),
      state: Assessment.states.STARTED,
      version: 2,
      certificationChallenges: [
        challengeToBeNeutralized,
        domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
        domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
      ],
      certificationAnswersByDate: ['answer'],
    });
    sinon.stub(certificationAssessment, 'neutralizeChallengeByRecId');
    certificationAssessmentRepository.getByCertificationCourseId
      .withArgs({ certificationCourseId })
      .resolves(certificationAssessment);

    // when
    await neutralizeChallenge({
      ...dependencies,
      certificationCourseId,
      challengeRecId: challengeToBeNeutralized.challengeId,
      juryId: 7,
    });

    // then
    expect(certificationAssessment.neutralizeChallengeByRecId).to.have.been.calledWithExactly(
      challengeToBeNeutralized.challengeId,
    );
    expect(certificationAssessmentRepository.save).to.have.been.calledWithExactly(certificationAssessment);
  });

  it('return a ChallengeNeutralized event', async function () {
    // given
    const certificationCourseId = 1;
    const certificationAssessmentRepository = {
      getByCertificationCourseId: sinon.stub(),
      save: sinon.stub(),
    };
    const dependencies = {
      certificationAssessmentRepository,
    };

    const challengeToBeNeutralized = domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false });
    const certificationAssessment = new CertificationAssessment({
      id: 123,
      userId: 123,
      certificationCourseId: 1,
      createdAt: new Date('2020-01-01'),
      completedAt: new Date('2020-01-01'),
      state: Assessment.states.STARTED,
      version: 2,
      certificationChallenges: [
        challengeToBeNeutralized,
        domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
        domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
      ],
      certificationAnswersByDate: ['answer'],
    });
    certificationAssessmentRepository.getByCertificationCourseId
      .withArgs({ certificationCourseId })
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
