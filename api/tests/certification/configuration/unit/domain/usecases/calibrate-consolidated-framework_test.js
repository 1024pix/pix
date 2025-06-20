import { calibrateConsolidatedFramework } from '../../../../../../src/certification/configuration/domain/usecases/calibrate-consolidated-framework.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Configuration | Unit | UseCase | calibrate-consolidated-framework', function () {
  it('calibrates the certification frameworks challenges given its creation date', async function () {
    // given
    const createdAt = new Date();
    const complementaryCertificationKey = ComplementaryCertificationKeys.PIX_PLUS_DROIT;
    const complementaryCertification = domainBuilder.buildComplementaryCertification({
      complementaryCertificationKey,
    });

    const certificationFrameworksChallengeRepository = {
      find: sinon.stub(),
      calibrate: sinon.stub(),
      save: sinon.stub(),
    };

    const activeCalibratedChallengeRepository = {
      findByComplementaryKeyAndChallengeIds: sinon.stub(),
    };
    const challengeId = 'rec123';
    const certificationFrameworksChallenges = [
      domainBuilder.certification.configuration.buildCertificationFrameworksChallenge({
        complementaryCertificationKey: complementaryCertification.key,
        challengeId,
        createdAt,
        alpha: null,
        delta: null,
      }),
    ];
    const activeCalibratedChallenges = [
      domainBuilder.certification.configuration.buildActiveCalibratedChallenge({
        scope: complementaryCertificationKey,
        challengeId,
        alpha: 1.4,
        delta: 2.2,
      }),
    ];

    const expectedCalibratedFrameworksChallenges = [
      domainBuilder.certification.configuration.buildCertificationFrameworksChallenge({
        ...certificationFrameworksChallenges[0],
        alpha: activeCalibratedChallenges[0].alpha,
        delta: activeCalibratedChallenges[0].delta,
      }),
    ];

    certificationFrameworksChallengeRepository.find
      .withArgs({ complementaryCertificationKey: complementaryCertification.key, createdAt })
      .resolves(certificationFrameworksChallenges);

    activeCalibratedChallengeRepository.findByComplementaryKeyAndChallengeIds
      .withArgs({
        complementaryCertificationKey,
        challengeIds: certificationFrameworksChallenges.map(({ challengeId }) => challengeId),
      })
      .resolves(activeCalibratedChallenges);

    // when
    await calibrateConsolidatedFramework({
      complementaryCertificationKey,
      createdAt,
      certificationFrameworksChallengeRepository,
      activeCalibratedChallengeRepository,
    });

    // then
    expect(certificationFrameworksChallengeRepository.save).to.have.been.calledOnceWithExactly({
      calibratedCertificationFrameworksChallenges: expectedCalibratedFrameworksChallenges,
    });
  });
});
