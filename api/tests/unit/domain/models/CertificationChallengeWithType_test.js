const { expect, domainBuilder } = require('../../../test-helper');
const CertificationChallengeWithType = require('../../../../lib/domain/models/CertificationChallengeWithType');
const { Type } = require('../../../../lib/domain/models/Challenge');

describe('Unit | Domain | Models | CertificationChallengeWithType', () => {

  describe('#constructor', () => {

    const validTypes = Object.values(Type);
    validTypes.forEach((validType) => {
      it(`should initialize CertificationChallengeWithType with type ${validType}`, () => {
        // when
        const certificationChallengeWithType = new CertificationChallengeWithType({ type: validType });

        // then
        expect(certificationChallengeWithType.type).to.equal(validType);
      });
    });

    it('should initialize type to EmptyType when type is not valid', () => {
      // when
      const certificationChallengeWithType = new CertificationChallengeWithType({ type: 'COUCOUCOUCOCUCUO' });

      // then
      expect(certificationChallengeWithType.type).to.equal('EmptyType');
    });
  });

  describe('#neutralize', () => {

    it('should neutralize a non neutralized certification challenge', () => {
      // given
      const certificationChallengeWithType = domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false });

      // when
      certificationChallengeWithType.neutralize();

      // then
      expect(certificationChallengeWithType.isNeutralized).to.be.true;
    });

    it('should leave a neutralized certification challenge if it was neutralized already', () => {
      // given
      const certificationChallengeWithType = domainBuilder.buildCertificationChallengeWithType({ isNeutralized: true });

      // when
      certificationChallengeWithType.neutralize();

      // then
      expect(certificationChallengeWithType.isNeutralized).to.be.true;
    });
  });

  describe('#deneutralize', () => {

    it('should deneutralize a neutralized certification challenge', () => {
      // given
      const certificationChallengeWithType = domainBuilder.buildCertificationChallengeWithType({ isNeutralized: true });

      // when
      certificationChallengeWithType.deneutralize();

      // then
      expect(certificationChallengeWithType.isNeutralized).to.be.false;
    });

    it('should leave a deneutralized certification challenge if it was deneutralized already', () => {
      // given
      const certificationChallengeWithType = domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false });

      // when
      certificationChallengeWithType.deneutralize();

      // then
      expect(certificationChallengeWithType.isNeutralized).to.be.false;
    });
  });

  describe('#isPixPlus', () => {

    it('return true when challenge was picked for a pix plus certification', () => {
      // given
      const certificationChallengeWithType = domainBuilder.buildCertificationChallengeWithType({ certifiableBadgeKey: 'someValue' });

      // when
      const isPixPlus = certificationChallengeWithType.isPixPlus();

      // then
      expect(isPixPlus).to.be.true;
    });

    it('return false when challenge was picked for a regular pix certification', () => {
      // given
      const certificationChallengeWithType = domainBuilder.buildCertificationChallengeWithType({ certifiableBadgeKey: null });

      // when
      const isPixPlus = certificationChallengeWithType.isPixPlus();

      // then
      expect(isPixPlus).to.be.false;
    });
  });
});
