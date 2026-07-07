import { CertificationChallengeWithType } from '../../../../../../src/certification/shared/domain/models/CertificationChallengeWithType.js';
import { Type } from '../../../../../../src/shared/domain/models/Challenge.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Domain | Models | CertificationChallengeWithType', function () {
  describe('#constructor', function () {
    Object.values(Type).forEach((validType) => {
      it(`should initialize CertificationChallengeWithType with type ${validType}`, function () {
        // when
        const certificationChallengeWithType = new CertificationChallengeWithType({ type: validType });

        // then
        expect(certificationChallengeWithType.type).to.equal(validType);
      });
    });

    it('should initialize type to EmptyType when type is not valid', function () {
      // when
      const certificationChallengeWithType = new CertificationChallengeWithType({ type: 'COUCOUCOUCOCUCUO' });

      // then
      expect(certificationChallengeWithType.type).to.equal('EmptyType');
    });
  });

  describe('#neutralize', function () {
    it('should neutralize a non neutralized certification challenge', function () {
      // given
      const certificationChallengeWithType = domainBuilder.buildCertificationChallengeWithType({
        isNeutralized: false,
      });

      // when
      certificationChallengeWithType.neutralize();

      // then
      expect(certificationChallengeWithType.isNeutralized).to.be.true;
    });

    it('should leave a neutralized certification challenge if it was neutralized already', function () {
      // given
      const certificationChallengeWithType = domainBuilder.buildCertificationChallengeWithType({ isNeutralized: true });

      // when
      certificationChallengeWithType.neutralize();

      // then
      expect(certificationChallengeWithType.isNeutralized).to.be.true;
    });
  });

  describe('#deneutralize', function () {
    it('should deneutralize a neutralized certification challenge', function () {
      // given
      const certificationChallengeWithType = domainBuilder.buildCertificationChallengeWithType({ isNeutralized: true });

      // when
      certificationChallengeWithType.deneutralize();

      // then
      expect(certificationChallengeWithType.isNeutralized).to.be.false;
    });

    it('should leave a deneutralized certification challenge if it was deneutralized already', function () {
      // given
      const certificationChallengeWithType = domainBuilder.buildCertificationChallengeWithType({
        isNeutralized: false,
      });

      // when
      certificationChallengeWithType.deneutralize();

      // then
      expect(certificationChallengeWithType.isNeutralized).to.be.false;
    });
  });
});
