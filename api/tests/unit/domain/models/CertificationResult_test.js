const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | CertificationResult', () => {

  context('#hasTakenClea', () => {

    it('returns true when Clea certification has been taken in the certification', async () => {
      // given
      const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.acquired();
      const certificationResult = domainBuilder.buildCertificationResult({ cleaCertificationResult });

      // when
      const hasTakenClea = certificationResult.hasTakenClea();

      // then
      expect(hasTakenClea).to.be.true;
    });

    it('returns false when Clea certification has not been taken in the certification', async () => {
      // given
      const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.notTaken();
      const certificationResult = domainBuilder.buildCertificationResult({ cleaCertificationResult });

      // when
      const hasTakenClea = certificationResult.hasTakenClea();

      // then
      expect(hasTakenClea).to.be.false;
    });
  });

  context('#hasTakenPixPlusDroitMaitre', () => {

    it('returns true when Pix plus maitre certification has been taken in the certification', async () => {
      // given
      const pixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.acquired();
      const certificationResult = domainBuilder.buildCertificationResult({ pixPlusDroitMaitreCertificationResult });

      // when
      const hasTakenPixPlusDroitMaitre = certificationResult.hasTakenPixPlusDroitMaitre();

      // then
      expect(hasTakenPixPlusDroitMaitre).to.be.true;
    });

    it('returns false when Pix plus maitre certification has not been taken in the certification', async () => {
      // given
      const pixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken();
      const certificationResult = domainBuilder.buildCertificationResult({ pixPlusDroitMaitreCertificationResult });

      // when
      const hasTakenPixPlusDroitMaitre = certificationResult.hasTakenPixPlusDroitMaitre();

      // then
      expect(hasTakenPixPlusDroitMaitre).to.be.false;
    });
  });

  context('#hasTakenPixPlusDroitExpert', () => {

    it('returns true when Pix plus droit expert certification has been taken in the certification', async () => {
      // given
      const pixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.acquired();
      const certificationResult = domainBuilder.buildCertificationResult({ pixPlusDroitExpertCertificationResult });

      // when
      const hasTakenPixPlusDroitExpert = certificationResult.hasTakenPixPlusDroitExpert();

      // then
      expect(hasTakenPixPlusDroitExpert).to.be.true;
    });

    it('returns false when Pix plus droit expert certification has not been taken in the certification', async () => {
      // given
      const pixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken();
      const certificationResult = domainBuilder.buildCertificationResult({ pixPlusDroitExpertCertificationResult });

      // when
      const hasTakenPixPlusDroitExpert = certificationResult.hasTakenPixPlusDroitExpert();

      // then
      expect(hasTakenPixPlusDroitExpert).to.be.false;
    });
  });
});
