import { databaseBuilder, expect, domainBuilder, catchErr } from '../../../test-helper';
import CertificationCenter from '../../../../lib/domain/models/CertificationCenter';
import Organization from '../../../../lib/domain/models/Organization';
import certificationPointOfContactRepository from '../../../../lib/infrastructure/repositories/certification-point-of-contact-repository';
import { NotFoundError } from '../../../../lib/domain/errors';

describe('Integration | Repository | CertificationPointOfContact', function () {
  describe('#get', function () {
    it('should throw NotFoundError when point of contact does not exist', async function () {
      // when
      const error = await catchErr(certificationPointOfContactRepository.get)(123);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal("Le référent de certification 123 n'existe pas.");
    });

    it('should return a CertificationPointOfContact', async function () {
      // given
      databaseBuilder.factory.buildUser({
        id: 456,
        firstName: 'Jean',
        lastName: 'Acajou',
        email: 'jean.acajou@example.net',
        pixCertifTermsOfServiceAccepted: true,
      });
      databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();

      // when
      const certificationPointOfContact = await certificationPointOfContactRepository.get(456);

      // then
      const expectedCertificationPointOfContact = domainBuilder.buildCertificationPointOfContact({
        id: 456,
        firstName: 'Jean',
        lastName: 'Acajou',
        email: 'jean.acajou@example.net',
        pixCertifTermsOfServiceAccepted: true,
        allowedCertificationCenterAccesses: [],
      });
      expect(expectedCertificationPointOfContact).to.deepEqualInstance(certificationPointOfContact);
    });
    context(
      'when the certification center is related to an organization of the same type that manages students',
      function () {
        it('should return CertificationPointOfContact with isRelatedOrganizationManagingStudents as true', async function () {
          // given
          databaseBuilder.factory.buildCertificationCenter({
            id: 123,
            name: 'Centre des papys gâteux',
            type: CertificationCenter.types.PRO,
            externalId: 'ABC123',
          });
          databaseBuilder.factory.buildOrganization({
            id: 222,
            externalId: 'ABC123',
            isManagingStudents: false,
            type: Organization.types.SUP,
          });
          databaseBuilder.factory.buildOrganization({
            id: 753,
            externalId: 'ABC123',
            isManagingStudents: true,
            type: Organization.types.PRO,
          });
          databaseBuilder.factory.buildUser({
            id: 456,
            firstName: 'Jean',
            lastName: 'Acajou',
            email: 'jean.acajou@example.net',
            pixCertifTermsOfServiceAccepted: true,
          });
          databaseBuilder.factory.buildCertificationCenterMembership({
            certificationCenterId: 123,
            userId: 456,
          });
          await databaseBuilder.commit();

          // when
          const certificationPointOfContact = await certificationPointOfContactRepository.get(456);

          // then
          const expectedAllowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
            id: 123,
            name: 'Centre des papys gâteux',
            externalId: 'ABC123',
            type: CertificationCenter.types.PRO,
            isRelatedToManagingStudentsOrganization: true,
            relatedOrganizationTags: [],
            habilitations: [],
          });
          const expectedCertificationPointOfContact = domainBuilder.buildCertificationPointOfContact({
            id: 456,
            firstName: 'Jean',
            lastName: 'Acajou',
            email: 'jean.acajou@example.net',
            pixCertifTermsOfServiceAccepted: true,
            allowedCertificationCenterAccesses: [expectedAllowedCertificationCenterAccess],
          });
          expect(expectedCertificationPointOfContact).to.deepEqualInstance(certificationPointOfContact);
        });
      }
    );

    context('when user is linked to many certification centers', function () {
      it('should return actives and allowed certification center accesses of the CertificationPointOfContact', async function () {
        // given
        const now = new Date();
        databaseBuilder.factory.buildCertificationCenter({
          id: 1,
          name: 'Centre de certif sans orga reliée',
          type: CertificationCenter.types.PRO,
          externalId: 'Centre1',
        });
        databaseBuilder.factory.buildCertificationCenter({
          id: 2,
          name: 'Centre de certif reliée à une orga sans tags',
          type: CertificationCenter.types.PRO,
          externalId: 'Centre2',
        });
        databaseBuilder.factory.buildOrganization({
          externalId: 'Centre2',
          isManagingStudents: true,
          type: Organization.types.PRO,
        });
        databaseBuilder.factory.buildCertificationCenter({
          id: 3,
          name: 'Centre de certif reliée à une orga avec 1 tag',
          type: CertificationCenter.types.SUP,
          externalId: 'Centre3',
        });
        databaseBuilder.factory.buildOrganization({
          id: 3,
          externalId: 'Centre3',
          isManagingStudents: false,
          type: Organization.types.SUP,
        });
        databaseBuilder.factory.buildTag({ id: 3, name: 'premier tag' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId: 3, tagId: 3 });
        databaseBuilder.factory.buildCertificationCenter({
          id: 4,
          name: 'Centre de certif reliée à une orga avec 2 tags',
          type: CertificationCenter.types.SCO,
          externalId: 'Centre4',
        });
        databaseBuilder.factory.buildOrganization({
          id: 4,
          externalId: 'Centre4',
          isManagingStudents: false,
          type: Organization.types.SCO,
        });
        databaseBuilder.factory.buildTag({ id: 4, name: 'deuxieme tag' });
        databaseBuilder.factory.buildTag({ id: 5, name: 'troisieme tag' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId: 4, tagId: 4 });
        databaseBuilder.factory.buildOrganizationTag({ organizationId: 4, tagId: 5 });
        databaseBuilder.factory.buildUser({
          id: 123,
          firstName: 'Jean',
          lastName: 'Acajou',
          email: 'jean.acajou@example.net',
          pixCertifTermsOfServiceAccepted: true,
        });
        databaseBuilder.factory.buildCertificationCenterMembership({
          certificationCenterId: 1,
          userId: 123,
        });
        databaseBuilder.factory.buildCertificationCenterMembership({
          certificationCenterId: 2,
          userId: 123,
        });
        databaseBuilder.factory.buildCertificationCenterMembership({
          certificationCenterId: 3,
          userId: 123,
        });
        databaseBuilder.factory.buildCertificationCenterMembership({
          certificationCenterId: 4,
          userId: 123,
          disabledAt: now,
        });
        await databaseBuilder.commit();

        // when
        const certificationPointOfContact = await certificationPointOfContactRepository.get(123);

        // then
        const expectedFirstAllowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
          id: 1,
          name: 'Centre de certif sans orga reliée',
          externalId: 'Centre1',
          type: CertificationCenter.types.PRO,
          isRelatedToManagingStudentsOrganization: false,
          relatedOrganizationTags: [],
          habilitations: [],
        });
        const expectedSecondAllowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
          id: 2,
          name: 'Centre de certif reliée à une orga sans tags',
          externalId: 'Centre2',
          type: CertificationCenter.types.PRO,
          isRelatedToManagingStudentsOrganization: true,
          relatedOrganizationTags: [],
          habilitations: [],
        });
        const expectedThirdAllowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
          id: 3,
          name: 'Centre de certif reliée à une orga avec 1 tag',
          externalId: 'Centre3',
          type: CertificationCenter.types.SUP,
          isRelatedToManagingStudentsOrganization: false,
          relatedOrganizationTags: ['premier tag'],
          habilitations: [],
        });
        const expectedCertificationPointOfContact = domainBuilder.buildCertificationPointOfContact({
          id: 123,
          firstName: 'Jean',
          lastName: 'Acajou',
          email: 'jean.acajou@example.net',
          pixCertifTermsOfServiceAccepted: true,
          allowedCertificationCenterAccesses: [
            expectedFirstAllowedCertificationCenterAccess,
            expectedSecondAllowedCertificationCenterAccess,
            expectedThirdAllowedCertificationCenterAccess,
          ],
        });
        expect(expectedCertificationPointOfContact).to.deepEqualInstance(certificationPointOfContact);
      });
    });

    it('should return all the certification center habilitations', async function () {
      // given
      databaseBuilder.factory.buildComplementaryCertification({ id: 1, label: 'Certif comp 1', key: 'COMP_1' });
      databaseBuilder.factory.buildComplementaryCertification({ id: 2, label: 'Certif comp 2', key: 'COMP_2' });
      databaseBuilder.factory.buildComplementaryCertification({ id: 3, label: 'Certif comp 3', key: 'COMP_3' });
      databaseBuilder.factory.buildCertificationCenter({
        id: 1,
        name: 'Centre de certif sans orga reliée',
        type: CertificationCenter.types.PRO,
        externalId: 'Centre1',
      });
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId: 1,
        complementaryCertificationId: 1,
      });
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId: 1,
        complementaryCertificationId: 2,
      });
      databaseBuilder.factory.buildCertificationCenter({
        id: 2,
        name: 'Centre de certif reliée à une orga sans tags',
        type: CertificationCenter.types.PRO,
        externalId: 'Centre2',
      });
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId: 2,
        complementaryCertificationId: 3,
      });
      databaseBuilder.factory.buildUser({
        id: 123,
        firstName: 'Jean',
        lastName: 'Acajou',
        email: 'jean.acajou@example.net',
        pixCertifTermsOfServiceAccepted: true,
      });
      databaseBuilder.factory.buildCertificationCenterMembership({
        certificationCenterId: 1,
        userId: 123,
      });
      databaseBuilder.factory.buildCertificationCenterMembership({
        certificationCenterId: 2,
        userId: 123,
      });
      await databaseBuilder.commit();

      // when
      const certificationPointOfContact = await certificationPointOfContactRepository.get(123);

      // then
      const expectedFirstAllowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
        id: 1,
        name: 'Centre de certif sans orga reliée',
        externalId: 'Centre1',
        type: CertificationCenter.types.PRO,
        isRelatedToManagingStudentsOrganization: false,
        relatedOrganizationTags: [],
        habilitations: [
          { id: 1, label: 'Certif comp 1', key: 'COMP_1' },
          { id: 2, label: 'Certif comp 2', key: 'COMP_2' },
        ],
      });
      const expectedSecondAllowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
        id: 2,
        name: 'Centre de certif reliée à une orga sans tags',
        externalId: 'Centre2',
        type: CertificationCenter.types.PRO,
        isRelatedToManagingStudentsOrganization: false,
        relatedOrganizationTags: [],
        habilitations: [{ id: 3, label: 'Certif comp 3', key: 'COMP_3' }],
      });
      const expectedCertificationPointOfContact = domainBuilder.buildCertificationPointOfContact({
        id: 123,
        firstName: 'Jean',
        lastName: 'Acajou',
        email: 'jean.acajou@example.net',
        pixCertifTermsOfServiceAccepted: true,
        allowedCertificationCenterAccesses: [
          expectedFirstAllowedCertificationCenterAccess,
          expectedSecondAllowedCertificationCenterAccess,
        ],
      });
      expect(certificationPointOfContact).to.deepEqualInstance(expectedCertificationPointOfContact);
    });

    context(
      'when user is linked to a certification center that has habilitations and is associated with an organization with tags',
      function () {
        it('should return the certification point of contact with tags and habilitations', async function () {
          // given
          databaseBuilder.factory.buildComplementaryCertification({ id: 1, label: 'Certif comp 1', key: 'COMP_1' });
          databaseBuilder.factory.buildComplementaryCertification({ id: 2, label: 'Certif comp 2', key: 'COMP_2' });
          databaseBuilder.factory.buildCertificationCenter({
            id: 1,
            name: 'Centre de certif',
            type: CertificationCenter.types.PRO,
            externalId: 'Centre1',
          });
          databaseBuilder.factory.buildComplementaryCertificationHabilitation({
            certificationCenterId: 1,
            complementaryCertificationId: 1,
          });
          databaseBuilder.factory.buildComplementaryCertificationHabilitation({
            certificationCenterId: 1,
            complementaryCertificationId: 2,
          });
          databaseBuilder.factory.buildOrganization({
            id: 10,
            externalId: 'Centre1',
            isManagingStudents: false,
            type: Organization.types.PRO,
          });
          databaseBuilder.factory.buildTag({
            id: 66,
            name: 'tag1',
          });
          databaseBuilder.factory.buildTag({
            id: 67,
            name: 'tag2',
          });
          databaseBuilder.factory.buildOrganizationTag({
            organizationId: 10,
            tagId: 66,
          });
          databaseBuilder.factory.buildOrganizationTag({
            organizationId: 10,
            tagId: 67,
          });
          databaseBuilder.factory.buildUser({
            id: 123,
            firstName: 'Jean',
            lastName: 'Acajou',
            email: 'jean.acajou@example.net',
            pixCertifTermsOfServiceAccepted: true,
          });
          databaseBuilder.factory.buildCertificationCenterMembership({
            certificationCenterId: 1,
            userId: 123,
          });
          await databaseBuilder.commit();

          // when
          const certificationPointOfContact = await certificationPointOfContactRepository.get(123);

          // then
          const expectedAllowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
            id: 1,
            name: 'Centre de certif',
            externalId: 'Centre1',
            type: CertificationCenter.types.PRO,
            isRelatedToManagingStudentsOrganization: false,
            relatedOrganizationTags: ['tag1', 'tag2'],
            habilitations: [
              { id: 1, label: 'Certif comp 1', key: 'COMP_1' },
              { id: 2, label: 'Certif comp 2', key: 'COMP_2' },
            ],
          });
          const expectedCertificationPointOfContact = domainBuilder.buildCertificationPointOfContact({
            id: 123,
            firstName: 'Jean',
            lastName: 'Acajou',
            email: 'jean.acajou@example.net',
            pixCertifTermsOfServiceAccepted: true,
            allowedCertificationCenterAccesses: [expectedAllowedCertificationCenterAccess],
          });
          expect(certificationPointOfContact).to.deepEqualInstance(expectedCertificationPointOfContact);
        });
      }
    );
  });
});
