const { databaseBuilder, expect, catchErr } = require('../../../test-helper');
const CertificationPointOfContact = require('../../../../lib/domain/read-models/CertificationPointOfContact');
const CertificationCenter = require('../../../../lib/domain/models/CertificationCenter');
const certificationPointOfContactRepository = require('../../../../lib/infrastructure/repositories/certification-point-of-contact-repository');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | CertificationPointOfContact', function() {

  describe('#get', () => {

    it('should return CertificationPointOfContact with all the info if exists', async () => {
      // given
      const userId = databaseBuilder.factory.buildUser({
        firstName: 'Jean',
        lastName: 'Acajou',
        email: 'jean.acajou@example.net',
        pixCertifTermsOfServiceAccepted: true,
      }).id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
        name: 'Centre des papys gâteux',
        type: CertificationCenter.types.PRO,
        externalId: 'ABC123',
      }).id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId,
        certificationCenterId,
      });
      const someOtherUserId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId: someOtherUserId,
        certificationCenterId,
      });
      await databaseBuilder.commit();

      // when
      const certificationPointOfContact = await certificationPointOfContactRepository.get(userId);

      // then
      expect(certificationPointOfContact).to.be.instanceOf(CertificationPointOfContact);
      expect(certificationPointOfContact.id).to.equal(userId);
      expect(certificationPointOfContact.firstName).to.equal('Jean');
      expect(certificationPointOfContact.lastName).to.equal('Acajou');
      expect(certificationPointOfContact.email).to.equal('jean.acajou@example.net');
      expect(certificationPointOfContact.pixCertifTermsOfServiceAccepted).to.be.true;
      expect(certificationPointOfContact.certificationCenterId).to.equal(certificationCenterId);
      expect(certificationPointOfContact.certificationCenterName).to.equal('Centre des papys gâteux');
      expect(certificationPointOfContact.certificationCenterType).to.equal(CertificationCenter.types.PRO);
      expect(certificationPointOfContact.certificationCenterExternalId).to.equal('ABC123');
    });

    it('should throw NotFoundError when point of contact does not exist', async () => {
      // given
      const userId = databaseBuilder.factory.buildUser({
        firstName: 'Jean',
        lastName: 'Acajou',
        email: 'jean.acajou@example.net',
        pixCertifTermsOfServiceAccepted: true,
      }).id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
        name: 'Centre des papys gâteux',
        type: CertificationCenter.types.PRO,
        externalId: 'ABC123',
      }).id;
      const someOtherUserId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId: someOtherUserId,
        certificationCenterId,
      });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(certificationPointOfContactRepository.get)(userId);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

});
