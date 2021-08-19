const { databaseBuilder, expect, catchErr } = require('../../../test-helper');
const CertificationPointOfContact = require('../../../../lib/domain/read-models/CertificationPointOfContact');
const CertificationCenter = require('../../../../lib/domain/models/CertificationCenter');
const certificationPointOfContactRepository = require('../../../../lib/infrastructure/repositories/certification-point-of-contact-repository');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | CertificationPointOfContact', function() {

  describe('#get', function() {

    it('should return CertificationPointOfContact with all the info if exists', async function() {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
        name: 'Centre des papys gâteux',
        type: CertificationCenter.types.PRO,
        externalId: 'ABC123',
      }).id;
      const userId = databaseBuilder.factory.buildUser({
        firstName: 'Jean',
        lastName: 'Acajou',
        email: 'jean.acajou@example.net',
        pixCertifTermsOfServiceAccepted: true,
      }).id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        certificationCenterId,
        userId,
      });
      await databaseBuilder.commit();

      // when
      const certificationPointOfContact = await certificationPointOfContactRepository.get(userId);
      const firstCertificationCenter = certificationPointOfContact.certificationCenters[0];

      // then
      expect(certificationPointOfContact).to.be.instanceOf(CertificationPointOfContact);
      expect(certificationPointOfContact.id).to.equal(userId);
      expect(certificationPointOfContact.firstName).to.equal('Jean');
      expect(certificationPointOfContact.lastName).to.equal('Acajou');
      expect(certificationPointOfContact.email).to.equal('jean.acajou@example.net');
      expect(certificationPointOfContact.pixCertifTermsOfServiceAccepted).to.be.true;

      expect(certificationPointOfContact.certificationCenters).to.have.lengthOf(1);
      expect(firstCertificationCenter.id).to.equal(certificationCenterId);
      expect(firstCertificationCenter.name).to.equal('Centre des papys gâteux');
      expect(firstCertificationCenter.type).to.equal(CertificationCenter.types.PRO);
      expect(firstCertificationCenter.externalId).to.equal('ABC123');
      expect(firstCertificationCenter.isRelatedOrganizationManagingStudents).to.be.false;
    });

    it('should return CertificationPointOfContact with isRelatedOrganizationManagingStudents as true when the certification center is related to an organization that manages students', async function() {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
        externalId: 'ABC123',
      }).id;
      const userId = databaseBuilder.factory.buildUser.withCertificationCenterMembership({
        firstName: 'Jean',
        lastName: 'Acajou',
        email: 'jean.acajou@example.net',
        pixCertifTermsOfServiceAccepted: true,
        certificationCenterId,
      }).id;
      databaseBuilder.factory.buildOrganization({
        externalId: 'ABC123',
        isManagingStudents: true,
      });
      await databaseBuilder.commit();

      // when
      const certificationPointOfContact = await certificationPointOfContactRepository.get(userId);

      // then
      expect(certificationPointOfContact.certificationCenters[0].isRelatedOrganizationManagingStudents).to.be.true;
    });

    it('should throw NotFoundError when point of contact does not exist', async function() {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildUser.withCertificationCenterMembership({
        certificationCenterId,
      });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(certificationPointOfContactRepository.get)(userId);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });

    context('When there is more than one membership', function() {

      it('should return all the CertificationCenterMembership', async function() {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCertificationCenterMembership({ userId });
        databaseBuilder.factory.buildCertificationCenterMembership({ userId });
        databaseBuilder.factory.buildCertificationCenterMembership({ userId });
        await databaseBuilder.commit();

        // when
        const certificationPointOfContact = await certificationPointOfContactRepository.get(userId);

        // then
        expect(certificationPointOfContact.certificationCenters).to.have.lengthOf(3);
      });

      it('should order CertificationCenterMembership by the most recently created membership', async function() {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const thirdCreatedMembership = databaseBuilder.factory.buildCertificationCenterMembership({ userId, createdAt: new Date('2016-02-15T00:00:00Z') });
        const firstCreatedMembership = databaseBuilder.factory.buildCertificationCenterMembership({ userId, createdAt: new Date('2020-02-15T00:00:00Z') });
        const secondCreatedMembership = databaseBuilder.factory.buildCertificationCenterMembership({ userId, createdAt: new Date('2018-02-15T00:00:00Z') });
        await databaseBuilder.commit();

        // when
        const certificationPointOfContact = await certificationPointOfContactRepository.get(userId);

        // then
        expect(certificationPointOfContact.certificationCenters[0].id).to.equal(firstCreatedMembership.certificationCenterId);
        expect(certificationPointOfContact.certificationCenters[1].id).to.equal(secondCreatedMembership.certificationCenterId);
        expect(certificationPointOfContact.certificationCenters[2].id).to.equal(thirdCreatedMembership.certificationCenterId);
      });
    });
  });
});
