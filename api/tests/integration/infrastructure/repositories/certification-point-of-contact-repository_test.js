import { NotFoundError } from '../../../../lib/domain/errors.js';
import { CertificationCenter } from '../../../../lib/domain/models/CertificationCenter.js';
import { AllowedCertificationCenterAccess } from '../../../../lib/domain/read-models/AllowedCertificationCenterAccess.js';
import * as certificationPointOfContactRepository from '../../../../lib/infrastructure/repositories/certification-point-of-contact-repository.js';
import * as centerRepository from '../../../../src/certification/enrolment/infrastructure/repositories/center-repository.js';
import { CERTIFICATION_FEATURES } from '../../../../src/certification/shared/domain/constants.js';
import { Organization } from '../../../../src/organizational-entities/domain/models/Organization.js';
import { catchErr, databaseBuilder, domainBuilder, expect } from '../../../test-helper.js';

describe('Integration | Repository | CertificationPointOfContact', function () {
  let userWithoutMembership;
  let userWithMembership;
  let certificationCenter;
  let membership;

  beforeEach(async function () {
    userWithoutMembership = databaseBuilder.factory.buildUser({
      id: 123,
      firstName: 'Jeannette',
      lastName: 'Acajette',
      email: 'jeannette.acajette@example.net',
      lang: 'fr',
      pixCertifTermsOfServiceAccepted: true,
    });
    userWithMembership = databaseBuilder.factory.buildUser({
      id: 456,
      firstName: 'Jean',
      lastName: 'Acajou',
      email: 'jean.acajou@example.net',
      lang: 'fr',
      pixCertifTermsOfServiceAccepted: true,
    });
    certificationCenter = databaseBuilder.factory.buildCertificationCenter({
      id: 123,
      name: 'Centre Pro',
      type: CertificationCenter.types.PRO,
      externalId: 'ABC123',
    });
    databaseBuilder.factory.buildOrganization({
      id: 1,
      externalId: 'ABC123',
      isManagingStudents: false,
      type: Organization.types.SUP,
    });
    membership = databaseBuilder.factory.buildCertificationCenterMembership({
      certificationCenterId: certificationCenter.id,
      userId: userWithMembership.id,
    });
    await databaseBuilder.commit();
  });

  describe('#getAuthorizedCenterIds', function () {
    it('should throw NotFoundError when point of contact does not exist', async function () {
      // given
      const unexistingUserId = 999999;

      // when
      const error = await catchErr(certificationPointOfContactRepository.getAuthorizedCenterIds)(unexistingUserId);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal(`Le référent de certification ${unexistingUserId} n'existe pas.`);
    });

    it('should return a list of authorized centers', async function () {
      // given
      databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();

      // when
      const { authorizedCenterIds, certificationPointOfContactDTO } =
        await certificationPointOfContactRepository.getAuthorizedCenterIds(userWithMembership.id);

      // then
      const expectedAuthorizedCenterIds = [certificationCenter.id];
      const expectedCertificationPointOfContact = {
        id: userWithMembership.id,
        firstName: userWithMembership.firstName,
        lastName: userWithMembership.lastName,
        email: userWithMembership.email,
        lang: userWithMembership.lang,
        pixCertifTermsOfServiceAccepted: userWithMembership.pixCertifTermsOfServiceAccepted,
        certificationCenterIds: [certificationCenter.id],
      };

      expect(authorizedCenterIds).to.deep.equal(expectedAuthorizedCenterIds);
      expect(certificationPointOfContactDTO).to.deep.equal(expectedCertificationPointOfContact);
    });
  });

  describe('#getAllowedCenterAccesses', function () {
    it('should return a list of access allowed center', async function () {
      // when
      const { authorizedCenterIds } = await certificationPointOfContactRepository.getAuthorizedCenterIds(
        userWithMembership.id,
      );
      const centerList = await Promise.all(
        authorizedCenterIds.map((authorizedCenterId) => centerRepository.getById({ id: authorizedCenterId })),
      );

      const allowedCertificationCenterAccesses =
        await certificationPointOfContactRepository.getAllowedCenterAccesses(centerList);

      // then
      const expectedAllowedCertificationCenterAccesses = [
        {
          id: certificationCenter.id,
          name: certificationCenter.name,
          externalId: certificationCenter.externalId,
          type: certificationCenter.type,
          isV3Pilot: certificationCenter.isV3Pilot,
          habilitations: [],
          isRelatedToManagingStudentsOrganization: false,
          relatedOrganizationTags: [],
          features: [],
        },
      ];

      expect(allowedCertificationCenterAccesses).to.deep.equal(expectedAllowedCertificationCenterAccesses);
      allowedCertificationCenterAccesses.map((access) => {
        expect(access).to.be.instanceOf(AllowedCertificationCenterAccess);
      });
    });
  });

  describe('#getPointOfContact', function () {
    it('should return a point of contact', async function () {
      // when
      const { authorizedCenterIds, certificationPointOfContactDTO } =
        await certificationPointOfContactRepository.getAuthorizedCenterIds(userWithMembership.id);
      const centerList = await Promise.all(
        authorizedCenterIds.map((authorizedCenterId) => centerRepository.getById({ id: authorizedCenterId })),
      );
      const allowedCertificationCenterAccesses =
        await certificationPointOfContactRepository.getAllowedCenterAccesses(centerList);
      const certificationPointOfContact = await certificationPointOfContactRepository.getPointOfContact({
        userId: userWithMembership.id,
        certificationPointOfContactDTO,
        allowedCertificationCenterAccesses,
      });

      // then
      const expectedPointOfContact = {
        id: userWithMembership.id,
        firstName: userWithMembership.firstName,
        lastName: userWithMembership.lastName,
        email: userWithMembership.email,
        lang: userWithMembership.lang,
        pixCertifTermsOfServiceAccepted: userWithMembership.pixCertifTermsOfServiceAccepted,
        allowedCertificationCenterAccesses,
        certificationCenterMemberships: [
          {
            certificationCenterId: membership.certificationCenterId,
            id: membership.id,
            role: membership.role,
            userId: membership.userId,
          },
        ],
      };

      expect(certificationPointOfContact).to.deep.equal(expectedPointOfContact);
    });

    context(
      'when the certification center is related to an organization of the same type that manages students',
      function () {
        it('should return CertificationPointOfContact with isRelatedOrganizationManagingStudents as true', async function () {
          // given
          databaseBuilder.factory.buildOrganization({
            id: 333,
            externalId: 'ABC123',
            isManagingStudents: true,
            type: Organization.types.PRO,
          });

          await databaseBuilder.commit();

          // when
          const { authorizedCenterIds, certificationPointOfContactDTO } =
            await certificationPointOfContactRepository.getAuthorizedCenterIds(userWithMembership.id);
          const centerList = await Promise.all(
            authorizedCenterIds.map((authorizedCenterId) => centerRepository.getById({ id: authorizedCenterId })),
          );
          const allowedCertificationCenterAccesses =
            await certificationPointOfContactRepository.getAllowedCenterAccesses(centerList);
          const certificationPointOfContact = await certificationPointOfContactRepository.getPointOfContact({
            userId: userWithMembership.id,
            certificationPointOfContactDTO,
            allowedCertificationCenterAccesses,
          });

          // then
          const expectedAllowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
            id: certificationCenter.id,
            name: certificationCenter.name,
            externalId: certificationCenter.externalId,
            type: certificationCenter.type,
            isRelatedToManagingStudentsOrganization: true,
            relatedOrganizationTags: [],
            habilitations: [],
          });

          const expectedCertificationCenterMemberships = [
            {
              id: membership.id,
              certificationCenterId: certificationCenter.id,
              userId: userWithMembership.id,
              role: 'MEMBER',
            },
          ];

          const expectedCertificationPointOfContact = domainBuilder.buildCertificationPointOfContact({
            id: userWithMembership.id,
            firstName: userWithMembership.firstName,
            lastName: userWithMembership.lastName,
            email: userWithMembership.email,
            pixCertifTermsOfServiceAccepted: userWithMembership.pixCertifTermsOfServiceAccepted,
            allowedCertificationCenterAccesses: [expectedAllowedCertificationCenterAccess],
            certificationCenterMemberships: expectedCertificationCenterMemberships,
          });

          expect(certificationPointOfContact).to.deepEqualInstance(expectedCertificationPointOfContact);
        });
      },
    );

    context('when user is linked to many certification centers', function () {
      let centerWithoutOrga;
      let centerWithOrgaWithoutTag;
      let centerWithOrgaAndOneTag;
      let centerWithOrgaAndTwoTags;

      beforeEach(async function () {
        databaseBuilder.factory.buildOrganization({
          id: 2,
          externalId: 'Centre2',
          isManagingStudents: false,
          type: Organization.types.PRO,
        });
        databaseBuilder.factory.buildOrganization({
          id: 3,
          externalId: 'Centre3',
          isManagingStudents: false,
          type: Organization.types.SUP,
        });
        databaseBuilder.factory.buildOrganization({
          id: 4,
          externalId: 'Centre4',
          isManagingStudents: false,
          type: Organization.types.SCO,
        });
        databaseBuilder.factory.buildTag({ id: 3, name: 'premier tag' });
        databaseBuilder.factory.buildTag({ id: 4, name: 'deuxieme tag' });
        databaseBuilder.factory.buildTag({ id: 5, name: 'troisieme tag' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId: 3, tagId: 3 });
        databaseBuilder.factory.buildOrganizationTag({ organizationId: 4, tagId: 4 });
        databaseBuilder.factory.buildOrganizationTag({ organizationId: 4, tagId: 5 });
        centerWithoutOrga = databaseBuilder.factory.buildCertificationCenter({
          id: 1,
          name: 'Centre de certif sans orga reliée',
          type: CertificationCenter.types.PRO,
          externalId: 'Centre1',
        });
        centerWithOrgaWithoutTag = databaseBuilder.factory.buildCertificationCenter({
          id: 2,
          name: 'Centre de certif reliée à une orga sans tags',
          type: CertificationCenter.types.PRO,
          externalId: 'Centre2',
        });
        centerWithOrgaAndOneTag = databaseBuilder.factory.buildCertificationCenter({
          id: 3,
          name: 'Centre de certif reliée à une orga avec 1 tag',
          type: CertificationCenter.types.SUP,
          externalId: 'Centre3',
        });
        centerWithOrgaAndTwoTags = databaseBuilder.factory.buildCertificationCenter({
          id: 4,
          name: 'Centre de certif reliée à une orga avec 2 tags',
          type: CertificationCenter.types.SCO,
          externalId: 'Centre4',
        });

        await databaseBuilder.commit();
      });

      it('should return actives and allowed certification center accesses of the CertificationPointOfContact', async function () {
        // given
        const now = new Date();

        const [firstMembership, secondMembership, thirdMembership] = [
          databaseBuilder.factory.buildCertificationCenterMembership({
            certificationCenterId: centerWithoutOrga.id,
            userId: userWithoutMembership.id,
          }),
          databaseBuilder.factory.buildCertificationCenterMembership({
            certificationCenterId: centerWithOrgaWithoutTag.id,
            userId: userWithoutMembership.id,
          }),
          databaseBuilder.factory.buildCertificationCenterMembership({
            certificationCenterId: centerWithOrgaAndOneTag.id,
            userId: userWithoutMembership.id,
          }),
        ];

        databaseBuilder.factory.buildCertificationCenterMembership({
          certificationCenterId: centerWithOrgaAndTwoTags.id,
          userId: userWithoutMembership.id,
          disabledAt: now,
        });

        await databaseBuilder.commit();

        // when
        const { authorizedCenterIds, certificationPointOfContactDTO } =
          await certificationPointOfContactRepository.getAuthorizedCenterIds(userWithoutMembership.id);
        const centerList = await Promise.all(
          authorizedCenterIds.map((authorizedCenterId) => centerRepository.getById({ id: authorizedCenterId })),
        );
        const allowedCertificationCenterAccesses =
          await certificationPointOfContactRepository.getAllowedCenterAccesses(centerList);
        const certificationPointOfContact = await certificationPointOfContactRepository.getPointOfContact({
          userId: userWithoutMembership.id,
          certificationPointOfContactDTO,
          allowedCertificationCenterAccesses,
        });

        // then
        const expectedCertificationCenterMemberships = [
          {
            id: firstMembership.id,
            certificationCenterId: centerWithoutOrga.id,
            userId: userWithoutMembership.id,
            role: 'MEMBER',
          },
          {
            id: secondMembership.id,
            certificationCenterId: centerWithOrgaWithoutTag.id,
            userId: userWithoutMembership.id,
            role: 'MEMBER',
          },
          {
            id: thirdMembership.id,
            certificationCenterId: centerWithOrgaAndOneTag.id,
            userId: userWithoutMembership.id,
            role: 'MEMBER',
          },
        ];
        const expectedFirstAllowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
          id: centerWithoutOrga.id,
          name: centerWithoutOrga.name,
          externalId: centerWithoutOrga.externalId,
          type: centerWithoutOrga.type,
          isRelatedToManagingStudentsOrganization: false,
          relatedOrganizationTags: [],
          habilitations: [],
        });
        const expectedSecondAllowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
          id: centerWithOrgaWithoutTag.id,
          name: centerWithOrgaWithoutTag.name,
          externalId: centerWithOrgaWithoutTag.externalId,
          type: centerWithOrgaWithoutTag.type,
          isRelatedToManagingStudentsOrganization: false,
          relatedOrganizationTags: [],
          habilitations: [],
        });
        const expectedThirdAllowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
          id: centerWithOrgaAndOneTag.id,
          name: centerWithOrgaAndOneTag.name,
          externalId: centerWithOrgaAndOneTag.externalId,
          type: centerWithOrgaAndOneTag.type,
          isRelatedToManagingStudentsOrganization: false,
          relatedOrganizationTags: ['premier tag'],
          habilitations: [],
        });

        const expectedCertificationPointOfContact = domainBuilder.buildCertificationPointOfContact({
          id: userWithoutMembership.id,
          firstName: userWithoutMembership.firstName,
          lastName: userWithoutMembership.lastName,
          email: userWithoutMembership.email,
          pixCertifTermsOfServiceAccepted: userWithoutMembership.pixCertifTermsOfServiceAccepted,
          allowedCertificationCenterAccesses: [
            expectedFirstAllowedCertificationCenterAccess,
            expectedSecondAllowedCertificationCenterAccess,
            expectedThirdAllowedCertificationCenterAccess,
          ],
          certificationCenterMemberships: expectedCertificationCenterMemberships,
        });

        expect(certificationPointOfContact).to.deepEqualInstance(expectedCertificationPointOfContact);
      });

      it('should return all the certification center habilitations', async function () {
        // given
        const firstComplementaryCertification = {
          id: 1,
          label: 'Certif comp 1',
          key: 'COMP_1',
          hasComplementaryReferential: false,
        };
        const secondComplementaryCertification = {
          id: 2,
          label: 'Certif comp 2',
          key: 'COMP_2',
          hasComplementaryReferential: true,
        };
        const thirdComplementaryCertification = {
          id: 3,
          label: 'Certif comp 3',
          key: 'COMP_3',
          hasComplementaryReferential: false,
        };
        databaseBuilder.factory.buildComplementaryCertification(firstComplementaryCertification);
        databaseBuilder.factory.buildComplementaryCertification(secondComplementaryCertification);
        databaseBuilder.factory.buildComplementaryCertification(thirdComplementaryCertification);
        databaseBuilder.factory.buildComplementaryCertificationHabilitation({
          certificationCenterId: centerWithoutOrga.id,
          complementaryCertificationId: 1,
        });
        databaseBuilder.factory.buildComplementaryCertificationHabilitation({
          certificationCenterId: centerWithoutOrga.id,
          complementaryCertificationId: 2,
        });
        databaseBuilder.factory.buildComplementaryCertificationHabilitation({
          certificationCenterId: centerWithOrgaWithoutTag.id,
          complementaryCertificationId: 3,
        });

        const [firstMembership, secondMembership] = [
          databaseBuilder.factory.buildCertificationCenterMembership({
            certificationCenterId: centerWithoutOrga.id,
            userId: userWithoutMembership.id,
          }),
          databaseBuilder.factory.buildCertificationCenterMembership({
            certificationCenterId: centerWithOrgaWithoutTag.id,
            userId: userWithoutMembership.id,
          }),
        ];

        await databaseBuilder.commit();

        // when
        const { authorizedCenterIds, certificationPointOfContactDTO } =
          await certificationPointOfContactRepository.getAuthorizedCenterIds(userWithoutMembership.id);
        const centerList = await Promise.all(
          authorizedCenterIds.map((authorizedCenterId) => centerRepository.getById({ id: authorizedCenterId })),
        );
        const allowedCertificationCenterAccesses =
          await certificationPointOfContactRepository.getAllowedCenterAccesses(centerList);
        const certificationPointOfContact = await certificationPointOfContactRepository.getPointOfContact({
          userId: userWithoutMembership.id,
          certificationPointOfContactDTO,
          allowedCertificationCenterAccesses,
        });

        // then
        const expectedCertificationCenterMemberships = [
          {
            id: firstMembership.id,
            userId: userWithoutMembership.id,
            certificationCenterId: centerWithoutOrga.id,
            role: 'MEMBER',
          },
          {
            id: secondMembership.id,
            userId: userWithoutMembership.id,
            certificationCenterId: centerWithOrgaWithoutTag.id,
            role: 'MEMBER',
          },
        ];

        const expectedFirstAllowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
          id: centerWithoutOrga.id,
          name: centerWithoutOrga.name,
          externalId: centerWithoutOrga.externalId,
          type: centerWithoutOrga.type,
          isV3Pilot: centerWithoutOrga.isV3Pilot,
          isRelatedToManagingStudentsOrganization: false,
          relatedOrganizationTags: [],
          habilitations: [firstComplementaryCertification, secondComplementaryCertification],
        });
        const expectedSecondAllowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
          id: centerWithOrgaWithoutTag.id,
          name: centerWithOrgaWithoutTag.name,
          externalId: centerWithOrgaWithoutTag.externalId,
          type: centerWithOrgaWithoutTag.type,
          isV3Pilot: centerWithOrgaWithoutTag.isV3Pilot,
          isRelatedToManagingStudentsOrganization: false,
          relatedOrganizationTags: [],
          habilitations: [thirdComplementaryCertification],
        });

        const expectedCertificationPointOfContact = domainBuilder.buildCertificationPointOfContact({
          id: userWithoutMembership.id,
          firstName: userWithoutMembership.firstName,
          lastName: userWithoutMembership.lastName,
          email: userWithoutMembership.email,
          pixCertifTermsOfServiceAccepted: userWithoutMembership.pixCertifTermsOfServiceAccepted,
          allowedCertificationCenterAccesses: [
            expectedFirstAllowedCertificationCenterAccess,
            expectedSecondAllowedCertificationCenterAccess,
          ],
          certificationCenterMemberships: expectedCertificationCenterMemberships,
        });

        expect(certificationPointOfContact).to.deepEqualInstance(expectedCertificationPointOfContact);
      });
    });

    // NEED : center with habilitations and orga with tags
    context(
      'when user is linked to a certification center that has habilitations and is associated with an organization with tags',
      function () {
        it('should return the certification point of contact with tags and habilitations', async function () {
          // given
          const firstComplementaryCertification = {
            id: 1,
            label: 'Certif comp 1',
            key: 'COMP_1',
            hasComplementaryReferential: false,
          };
          const secondComplementaryCertification = {
            id: 2,
            label: 'Certif comp 2',
            key: 'COMP_2',
            hasComplementaryReferential: true,
          };
          databaseBuilder.factory.buildComplementaryCertification(firstComplementaryCertification);
          databaseBuilder.factory.buildComplementaryCertification(secondComplementaryCertification);
          databaseBuilder.factory.buildComplementaryCertificationHabilitation({
            certificationCenterId: certificationCenter.id,
            complementaryCertificationId: 1,
          });
          databaseBuilder.factory.buildComplementaryCertificationHabilitation({
            certificationCenterId: certificationCenter.id,
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

          await databaseBuilder.commit();

          // when
          const { authorizedCenterIds, certificationPointOfContactDTO } =
            await certificationPointOfContactRepository.getAuthorizedCenterIds(userWithMembership.id);
          const centerList = await Promise.all(
            authorizedCenterIds.map((authorizedCenterId) => centerRepository.getById({ id: authorizedCenterId })),
          );
          const allowedCertificationCenterAccesses =
            await certificationPointOfContactRepository.getAllowedCenterAccesses(centerList);
          const certificationPointOfContact = await certificationPointOfContactRepository.getPointOfContact({
            userId: userWithMembership.id,
            certificationPointOfContactDTO,
            allowedCertificationCenterAccesses,
          });

          // then
          const expectedCertificationCenterMemberships = [
            {
              id: membership.id,
              certificationCenterId: certificationCenter.id,
              userId: userWithMembership.id,
              role: 'MEMBER',
            },
          ];

          const expectedAllowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
            id: certificationCenter.id,
            name: certificationCenter.name,
            externalId: certificationCenter.externalId,
            type: certificationCenter.type,
            isV3Pilot: certificationCenter.isV3Pilot,
            isRelatedToManagingStudentsOrganization: false,
            relatedOrganizationTags: [],
            habilitations: [firstComplementaryCertification, secondComplementaryCertification],
          });

          const expectedCertificationPointOfContact = domainBuilder.buildCertificationPointOfContact({
            id: userWithMembership.id,
            firstName: userWithMembership.firstName,
            lastName: userWithMembership.lastName,
            email: userWithMembership.email,
            pixCertifTermsOfServiceAccepted: userWithMembership.pixCertifTermsOfServiceAccepted,
            allowedCertificationCenterAccesses: [expectedAllowedCertificationCenterAccess],
            certificationCenterMemberships: expectedCertificationCenterMemberships,
          });

          expect(certificationPointOfContact).to.deepEqualInstance(expectedCertificationPointOfContact);
        });
      },
    );

    context('when user is linked and has an "ADMIN" role of an certification center', function () {
      context("when user's membership is not disabled", function () {
        it('returns a certification-point-of-contact object with a certification-center-membership having "ADMIN" role', async function () {
          // given
          const certificationCenterMembership = databaseBuilder.factory.buildCertificationCenterMembership({
            certificationCenterId: certificationCenter.id,
            userId: userWithoutMembership.id,
            disabledAt: null,
            role: 'ADMIN',
          });

          await databaseBuilder.commit();

          const expectedCertificationCenterMembership = {
            id: certificationCenterMembership.id,
            userId: userWithoutMembership.id,
            certificationCenterId: certificationCenter.id,
            role: 'ADMIN',
          };

          const expectedAllowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
            id: certificationCenter.id,
            name: certificationCenter.name,
            externalId: certificationCenter.externalId,
            type: certificationCenter.type,
            isRelatedToManagingStudentsOrganization: false,
            relatedOrganizationTags: [],
            habilitations: [],
          });

          const expectedCertificationPointOfContact = domainBuilder.buildCertificationPointOfContact({
            id: userWithoutMembership.id,
            firstName: userWithoutMembership.firstName,
            lastName: userWithoutMembership.lastName,
            email: userWithoutMembership.email,
            pixCertifTermsOfServiceAccepted: userWithoutMembership.pixCertifTermsOfServiceAccepted,
            allowedCertificationCenterAccesses: [expectedAllowedCertificationCenterAccess],
            certificationCenterMemberships: [expectedCertificationCenterMembership],
          });

          // when
          const { authorizedCenterIds, certificationPointOfContactDTO } =
            await certificationPointOfContactRepository.getAuthorizedCenterIds(userWithoutMembership.id);
          const centerList = await Promise.all(
            authorizedCenterIds.map((authorizedCenterId) => centerRepository.getById({ id: authorizedCenterId })),
          );
          const allowedCertificationCenterAccesses =
            await certificationPointOfContactRepository.getAllowedCenterAccesses(centerList);
          const certificationPointOfContact = await certificationPointOfContactRepository.getPointOfContact({
            userId: userWithoutMembership.id,
            certificationPointOfContactDTO,
            allowedCertificationCenterAccesses,
          });

          // then
          expect(certificationPointOfContact).to.deepEqualInstance(expectedCertificationPointOfContact);
        });
      });

      context("when user's membership is disabled", function () {
        it('returns a certification-point-of-contact object without a certification-center-membership having "ADMIN" role', async function () {
          // given
          databaseBuilder.factory.buildCertificationCenterMembership({
            certificationCenterId: certificationCenter.id,
            userId: userWithoutMembership.id,
            disabledAt: new Date(),
          });

          await databaseBuilder.commit();

          const expectedCertificationPointOfContact = domainBuilder.buildCertificationPointOfContact({
            id: userWithoutMembership.id,
            firstName: userWithoutMembership.firstName,
            lastName: userWithoutMembership.lastName,
            email: userWithoutMembership.email,
            pixCertifTermsOfServiceAccepted: userWithoutMembership.pixCertifTermsOfServiceAccepted,
            allowedCertificationCenterAccesses: [],
            certificationCenterMemberships: [],
          });

          // when
          const { authorizedCenterIds, certificationPointOfContactDTO } =
            await certificationPointOfContactRepository.getAuthorizedCenterIds(userWithoutMembership.id);
          const centerList = await Promise.all(
            authorizedCenterIds.map((authorizedCenterId) => centerRepository.getById({ id: authorizedCenterId })),
          );
          const allowedCertificationCenterAccesses =
            await certificationPointOfContactRepository.getAllowedCenterAccesses(centerList);
          const certificationPointOfContact = await certificationPointOfContactRepository.getPointOfContact({
            userId: userWithoutMembership.id,
            certificationPointOfContactDTO,
            allowedCertificationCenterAccesses,
          });

          // then
          expect(certificationPointOfContact).to.deepEqualInstance(expectedCertificationPointOfContact);
        });
      });
    });

    context('when the certification center is a complementary alone pilot', function () {
      it('return isComplementaryAlonePilot', async function () {
        // given
        const complementaryAlonePilotFeatureId = databaseBuilder.factory.buildFeature(
          CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE,
        ).id;
        databaseBuilder.factory.buildCertificationCenterFeature({
          certificationCenterId: certificationCenter.id,
          featureId: complementaryAlonePilotFeatureId,
        });

        await databaseBuilder.commit();

        // when
        const { authorizedCenterIds, certificationPointOfContactDTO } =
          await certificationPointOfContactRepository.getAuthorizedCenterIds(userWithMembership.id);
        const centerList = await Promise.all(
          authorizedCenterIds.map((authorizedCenterId) => centerRepository.getById({ id: authorizedCenterId })),
        );
        const allowedCertificationCenterAccesses =
          await certificationPointOfContactRepository.getAllowedCenterAccesses(centerList);
        const certificationPointOfContact = await certificationPointOfContactRepository.getPointOfContact({
          userId: userWithMembership.id,
          certificationPointOfContactDTO,
          allowedCertificationCenterAccesses,
        });

        // then
        expect(certificationPointOfContact.allowedCertificationCenterAccesses).to.deep.equal([
          domainBuilder.buildAllowedCertificationCenterAccess({
            id: certificationCenter.id,
            type: certificationCenter.type,
            name: certificationCenter.name,
            externalId: certificationCenter.externalId,
            isComplementaryAlonePilot: true,
            features: [CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE.key],
          }),
        ]);
      });
    });
  });
});
