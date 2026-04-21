import { CertificationFrameworksChallenge } from '../../../../../../src/certification/configuration/domain/models/CertificationFrameworksChallenge.js';
import { ActiveCalibratedChallenge } from '../../../../../../src/certification/configuration/domain/read-models/ActiveCalibratedChallenge.js';
import { EntityValidationError } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErrSync } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Configuration | Unit | Domain | Models | CertificationFrameworksChallenge', function () {
  describe('#calibrate', function () {
    it('updates discriminant and difficulty of a certificaitonFrameworksChallenge', function () {
      const complementaryCertification = domainBuilder.certification.shared.buildComplementaryCertification();
      const certificationFrameworksChallenge = new CertificationFrameworksChallenge({
        versionId: 1,
        discriminant: null,
        difficulty: null,
        challengeId: 'rec123',
        complementaryCertificationKey: complementaryCertification.key,
      });

      const activeCalibratedChallenge = new ActiveCalibratedChallenge({
        challengeId: 'rec123',
        discriminant: 3.4,
        difficulty: 2.7,
        scope: complementaryCertification.key,
      });

      certificationFrameworksChallenge.calibrate(activeCalibratedChallenge);
      const { discriminant, difficulty } = certificationFrameworksChallenge;

      expect(discriminant).to.equal(activeCalibratedChallenge.discriminant);
      expect(difficulty).to.equal(activeCalibratedChallenge.difficulty);
    });
  });

  context('class invariants', function () {
    it('should not allow CertificationFrameworksChallenge without challengeId', function () {
      // given
      // when
      const error = catchErrSync(
        () => new CertificationFrameworksChallenge({ versionId: 1, discriminant: 2.5, difficulty: 3.0 }),
      )();

      // then
      expect(error).to.be.an.instanceOf(EntityValidationError);
    });

    it('should not allow CertificationFrameworksChallenge with null challengeId', function () {
      // given
      // when
      const error = catchErrSync(
        () =>
          new CertificationFrameworksChallenge({ versionId: 1, challengeId: null, discriminant: 2.5, difficulty: 3.0 }),
      )();

      // then
      expect(error).to.be.an.instanceOf(EntityValidationError);
    });

    it('should not allow CertificationFrameworksChallenge with non-string challengeId', function () {
      // given
      // when
      const error = catchErrSync(
        () =>
          new CertificationFrameworksChallenge({ versionId: 1, challengeId: 123, discriminant: 2.5, difficulty: 3.0 }),
      )();

      // then
      expect(error).to.be.an.instanceOf(EntityValidationError);
    });
  });
});
