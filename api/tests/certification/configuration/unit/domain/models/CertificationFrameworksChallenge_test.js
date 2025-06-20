import { ActiveCalibratedChallenge } from '../../../../../../src/certification/configuration/domain/models/ActiveCalibratedChallenge.js';
import { CertificationFrameworksChallenge } from '../../../../../../src/certification/configuration/domain/models/CertificationFrameworksChallenge.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Certification | Configuration | Unit | Domain | Models | CertificationFrameworksChallenge', function () {
  describe('#calibrate', function () {
    it('updates alpha and delta of a certificaitonFrameworksChallenge', function () {
      const complementaryCertification = domainBuilder.buildComplementaryCertification();
      const certificationFrameworksChallenge = new CertificationFrameworksChallenge({
        alpha: null,
        delta: null,
        challengeId: 'rec123',
        complementaryCertificationKey: complementaryCertification.key,
      });
      const expectedAlpha = 3.4;
      const expectedDelta = 2.7;
      const activeCalibratedChallenges = [
        new ActiveCalibratedChallenge({
          challengeId: 'rec123',
          alpha: 3.4,
          delta: 2.7,
          scope: complementaryCertification.key,
        }),
      ];

      const calibratedCertificationFrameworksChallenge = certificationFrameworksChallenge.calibrate({
        activeCalibratedChallenges,
        complementaryCertificationKey: complementaryCertification.key,
      });
      const { alpha, delta } = calibratedCertificationFrameworksChallenge;

      expect(alpha).to.equal(expectedAlpha);
      expect(delta).to.equal(expectedDelta);
    });
  });
});
