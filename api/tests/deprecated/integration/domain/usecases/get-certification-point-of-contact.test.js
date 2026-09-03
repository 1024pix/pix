import { expect } from 'chai';

import { usecases } from '../../../../../src/deprecated/domain/usecases/index.js';
import { STATUS } from '../../../../../src/legal-documents/domain/models/LegalDocumentStatus.js';
import { featureToggles } from '../../../../../src/shared/infrastructure/feature-toggles/index.js';
import { CERTIFICATION_CENTER_MEMBERSHIP_ROLES } from '../../../../../src/team/domain/models/CertificationCenterMembership.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

const { getCertificationPointOfContact } = usecases;

describe('Integration | Deprecated | Domain | UseCase | get-certification-point-of-contact', function () {
  context('when ft is not enabled', function () {
    beforeEach(async function () {
      await featureToggles.set('newPixCertifLegalDocumentsVersioning', false);
    });
    it('returns the CertificationPointOfContact', async function () {
      // given
      //const legalDocumentPublishedAt = new Date('2024-06-01');
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
      /*const documentVersion = databaseBuilder.factory.buildLegalDocumentVersion({
        service: 'pix-certif',
        type: 'TOS',
        versionAt,
      });
      databaseBuilder.factory.buildLegalDocumentVersionUserAcceptance({
        userId: user.id,
        legalDocumentVersionId: documentVersion.id,
        acceptedAt: new Date('2024-06-15'),
      });*/
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
  });
});
