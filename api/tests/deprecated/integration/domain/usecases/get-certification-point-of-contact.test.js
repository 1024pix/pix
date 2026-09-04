import { expect } from 'chai';

import { usecases } from '../../../../../src/deprecated/domain/usecases/index.js';
import { STATUS } from '../../../../../src/legal-documents/domain/models/LegalDocumentStatus.js';
import { featureToggles } from '../../../../../src/shared/infrastructure/feature-toggles/index.js';
import { CERTIFICATION_CENTER_MEMBERSHIP_ROLES } from '../../../../../src/team/domain/models/CertificationCenterMembership.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

const { getCertificationPointOfContact } = usecases;

describe('Integration | Deprecated | Domain | UseCase | get-certification-point-of-contact', function () {
  context('when feature toggle newPixCertifLegalDocumentsVersioning is not enabled', function () {
    beforeEach(async function () {
      await featureToggles.set('newPixCertifLegalDocumentsVersioning', false);
    });

    context('when user has accepted terms of service', function () {
      it('returns with the CertificationPointOfContact with tos accepted', async function () {
        // given
        const acceptedAt = new Date('2024-06-02');

        const user = databaseBuilder.factory.buildUser({
          pixCertifTermsOfServiceAccepted: true,
          lastPixCertifTermsOfServiceValidatedAt: acceptedAt,
        });
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
        const membership = databaseBuilder.factory.buildCertificationCenterMembership({
          userId: user.id,
          certificationCenterId: certificationCenter.id,
          role: CERTIFICATION_CENTER_MEMBERSHIP_ROLES.MEMBER,
        });

        await databaseBuilder.commit();

        // when
        const actualCertificationPointOfContact = await getCertificationPointOfContact({
          userId: user.id,
        });

        // then
        const expectedCertificationPointOfContact = domainBuilder.buildCertificationPointOfContact({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          pixCertifTosStatus: {
            status: STATUS.ACCEPTED,
            acceptedAt: acceptedAt,
            documentPath: null,
          },
          allowedCertificationCenterAccesses: [
            domainBuilder.buildAllowedCertificationCenterAccess({
              id: certificationCenter.id,
              type: certificationCenter.type,
              name: certificationCenter.name,
              externalId: certificationCenter.externalId,
            }),
          ],
          certificationCenterMemberships: [
            {
              id: membership.id,
              certificationCenterId: certificationCenter.id,
              userId: user.id,
              role: membership.role,
            },
          ],
        });
        expect(actualCertificationPointOfContact).to.deep.equal(expectedCertificationPointOfContact);
      });
    })

    context('when user has not accepted terms of service', function () {
      it('returns with the CertificationPointOfContact with tos not accepted', async function () {
        // given
        const user = databaseBuilder.factory.buildUser({
          pixCertifTermsOfServiceAccepted: false,
          lastPixCertifTermsOfServiceValidatedAt: null,
        });
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
        const membership = databaseBuilder.factory.buildCertificationCenterMembership({
          userId: user.id,
          certificationCenterId: certificationCenter.id,
          role: CERTIFICATION_CENTER_MEMBERSHIP_ROLES.MEMBER,
        });

        await databaseBuilder.commit();

        // when
        const actualCertificationPointOfContact = await getCertificationPointOfContact({
          userId: user.id,
        });

        // then
        const expectedCertificationPointOfContact = domainBuilder.buildCertificationPointOfContact({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          pixCertifTosStatus: {
            status: STATUS.REQUESTED,
            acceptedAt: null,
            documentPath: null,
          },
          allowedCertificationCenterAccesses: [
            domainBuilder.buildAllowedCertificationCenterAccess({
              id: certificationCenter.id,
              type: certificationCenter.type,
              name: certificationCenter.name,
              externalId: certificationCenter.externalId,
            }),
          ],
          certificationCenterMemberships: [
            {
              id: membership.id,
              certificationCenterId: certificationCenter.id,
              userId: user.id,
              role: membership.role,
            },
          ],
        });
        expect(actualCertificationPointOfContact).to.deep.equal(expectedCertificationPointOfContact);
      });
    })

  });

  context('when feature toggle newPixCertifLegalDocumentsVersioning is enabled', function () {
    beforeEach(async function () {
      await featureToggles.set('newPixCertifLegalDocumentsVersioning', true);
    });

    context('when user has accepted pix-certif-tos', function () {
      it('returns the CertificationPointOfContact', async function () {
        // given
        const legalDocumentPublishedAt = new Date('2024-06-01');
        const acceptedAt = new Date('2024-06-02');

        const user = databaseBuilder.factory.buildUser({
          pixCertifTermsOfServiceAccepted: true,
          lastPixCertifTermsOfServiceValidatedAt: acceptedAt,
        });
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
        const membership = databaseBuilder.factory.buildCertificationCenterMembership({
          userId: user.id,
          certificationCenterId: certificationCenter.id,
          role: CERTIFICATION_CENTER_MEMBERSHIP_ROLES.MEMBER,
        });
        const documentVersion = databaseBuilder.factory.buildLegalDocumentVersion({
          service: 'pix-certif',
          type: 'TOS',
          versionAt : legalDocumentPublishedAt,
        });
        databaseBuilder.factory.buildLegalDocumentVersionUserAcceptance({
          userId: user.id,
          legalDocumentVersionId: documentVersion.id,
          acceptedAt,
        });
        await databaseBuilder.commit();

        // when
        const actualCertificationPointOfContact = await getCertificationPointOfContact({
          userId: user.id,
        });

        // then
        const expectedCertificationPointOfContact = domainBuilder.buildCertificationPointOfContact({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          pixCertifTosStatus: {
            status: STATUS.ACCEPTED,
            acceptedAt,
            documentPath: `pix-certif-tos-2024-06-01`,
          },
          allowedCertificationCenterAccesses: [
            domainBuilder.buildAllowedCertificationCenterAccess({
              id: certificationCenter.id,
              type: certificationCenter.type,
              name: certificationCenter.name,
              externalId: certificationCenter.externalId,
            }),
          ],
          certificationCenterMemberships: [
            {
              id: membership.id,
              certificationCenterId: certificationCenter.id,
              userId: user.id,
              role: membership.role,
            },
          ],
        });
        expect(actualCertificationPointOfContact).to.deep.equal(expectedCertificationPointOfContact);
      });
    });

    context('when user has never accepted pix-certif-tos', function () {
      it('returns the CertificationPointOfContact', async function () {
        // given
        const legalDocumentPublishedAt = new Date('2024-06-01');
        const acceptedAt = new Date('2024-06-02');

        const user = databaseBuilder.factory.buildUser({
          pixCertifTermsOfServiceAccepted: true,// irrelevant data to enlighten the fact that values come now from legalDocumentVersionUserAcceptances table
          lastPixCertifTermsOfServiceValidatedAt: acceptedAt, // irrelevant data to enlighten the fact that values come now from legalDocumentVersionUserAcceptances table
        });
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
        const membership = databaseBuilder.factory.buildCertificationCenterMembership({
          userId: user.id,
          certificationCenterId: certificationCenter.id,
          role: CERTIFICATION_CENTER_MEMBERSHIP_ROLES.MEMBER,
        });
        databaseBuilder.factory.buildLegalDocumentVersion({
          service: 'pix-certif',
          type: 'TOS',
          versionAt : legalDocumentPublishedAt,
        });

        await databaseBuilder.commit();

        // when
        const actualCertificationPointOfContact = await getCertificationPointOfContact({
          userId: user.id,
        });

        // then
        const expectedCertificationPointOfContact = domainBuilder.buildCertificationPointOfContact({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          pixCertifTosStatus: {
            status: STATUS.REQUESTED,
            acceptedAt:null,
            documentPath: `pix-certif-tos-2024-06-01`,
          },
          allowedCertificationCenterAccesses: [
            domainBuilder.buildAllowedCertificationCenterAccess({
              id: certificationCenter.id,
              type: certificationCenter.type,
              name: certificationCenter.name,
              externalId: certificationCenter.externalId,
            }),
          ],
          certificationCenterMemberships: [
            {
              id: membership.id,
              certificationCenterId: certificationCenter.id,
              userId: user.id,
              role: membership.role,
            },
          ],
        });
        expect(actualCertificationPointOfContact).to.deep.equal(expectedCertificationPointOfContact);
      });
    });

    context('when user has accepted previous pix-certif-tos', function () {
      it('returns the CertificationPointOfContact', async function () {
        // given
        const legalDocumentPublishedAt = new Date('2024-06-03');
        const previousLegalDocumentPublishedAt = new Date('2024-06-01');
        const previousAcceptedAt = new Date('2024-06-02');

        const user = databaseBuilder.factory.buildUser({
          pixCertifTermsOfServiceAccepted: true,
          lastPixCertifTermsOfServiceValidatedAt: previousAcceptedAt,
        });
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
        const membership = databaseBuilder.factory.buildCertificationCenterMembership({
          userId: user.id,
          certificationCenterId: certificationCenter.id,
          role: CERTIFICATION_CENTER_MEMBERSHIP_ROLES.MEMBER,
        });
        databaseBuilder.factory.buildLegalDocumentVersion({
          service: 'pix-certif',
          type: 'TOS',
          versionAt : legalDocumentPublishedAt,
        });
        const previousDocumentVersion = databaseBuilder.factory.buildLegalDocumentVersion({
          service: 'pix-certif',
          type: 'TOS',
          versionAt : previousLegalDocumentPublishedAt,
        });

        databaseBuilder.factory.buildLegalDocumentVersionUserAcceptance({
          userId: user.id,
          legalDocumentVersionId: previousDocumentVersion.id,
          previousAcceptedAt,
        });

        await databaseBuilder.commit();

        // when
        const actualCertificationPointOfContact = await getCertificationPointOfContact({
          userId: user.id,
        });

        // then
        const expectedCertificationPointOfContact = domainBuilder.buildCertificationPointOfContact({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          pixCertifTosStatus: {
            status: STATUS.UPDATE_REQUESTED,
            acceptedAt : null,
            documentPath: `pix-certif-tos-2024-06-03`,
          },
          allowedCertificationCenterAccesses: [
            domainBuilder.buildAllowedCertificationCenterAccess({
              id: certificationCenter.id,
              type: certificationCenter.type,
              name: certificationCenter.name,
              externalId: certificationCenter.externalId,
            }),
          ],
          certificationCenterMemberships: [
            {
              id: membership.id,
              certificationCenterId: certificationCenter.id,
              userId: user.id,
              role: membership.role,
            },
          ],
        });
        expect(actualCertificationPointOfContact).to.deep.equal(expectedCertificationPointOfContact);
      });
    });

    /*it('returns the CertificationPointOfContact', async function () {
      // given
      const legalDocumentPublishedAt = new Date('2024-06-01');
      const acceptedAt = new Date('2024-06-02');

      const user = databaseBuilder.factory.buildUser({
        pixCertifTermsOfServiceAccepted: true,
        lastPixCertifTermsOfServiceValidatedAt: acceptedAt,
      });
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      const membership = databaseBuilder.factory.buildCertificationCenterMembership({
        userId: user.id,
        certificationCenterId: certificationCenter.id,
        role: CERTIFICATION_CENTER_MEMBERSHIP_ROLES.MEMBER,
      });
      const documentVersion = databaseBuilder.factory.buildLegalDocumentVersion({
        service: 'pix-certif',
        type: 'TOS',
        versionAt : legalDocumentPublishedAt,
      });
      databaseBuilder.factory.buildLegalDocumentVersionUserAcceptance({
        userId: user.id,
        legalDocumentVersionId: documentVersion.id,
        acceptedAt,
      });
      await databaseBuilder.commit();

      // when
      const actualCertificationPointOfContact = await getCertificationPointOfContact({
        userId: user.id,
      });

      // then
      const expectedCertificationPointOfContact = domainBuilder.buildCertificationPointOfContact({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        pixCertifTosStatus: {
          status: STATUS.ACCEPTED,
          acceptedAt,
          documentPath: `pix-certif-tos-2024-06-01`,
        },
        allowedCertificationCenterAccesses: [
          domainBuilder.buildAllowedCertificationCenterAccess({
            id: certificationCenter.id,
            type: certificationCenter.type,
            name: certificationCenter.name,
            externalId: certificationCenter.externalId,
          }),
        ],
        certificationCenterMemberships: [
          {
            id: membership.id,
            certificationCenterId: certificationCenter.id,
            userId: user.id,
            role: membership.role,
          },
        ],
      });
      expect(actualCertificationPointOfContact).to.deep.equal(expectedCertificationPointOfContact);
    });*/
  });
});
