import { usecases } from '../../../../../src/deprecated/domain/usecases/index.js';
import { CERTIFICATION_CENTER_MEMBERSHIP_ROLES } from '../../../../../src/team/domain/models/CertificationCenterMembership.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

const { getCertificationPointOfContact } = usecases;

describe('Integration | Deprecated | Domain | UseCase | get-certification-point-of-contact', function () {
  it('returns the CertificationPointOfContact', async function () {
    // given
    const user = databaseBuilder.factory.buildUser();
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
      pixCertifTermsOfServiceAccepted: user.pixCertifTermsOfServiceAccepted,
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
