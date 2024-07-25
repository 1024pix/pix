import { usecases } from '../../../../lib/domain/usecases/index.js';
import { CERTIFICATION_FEATURES } from '../../../../src/certification/shared/domain/constants.js';
import { CERTIFICATION_CENTER_MEMBERSHIP_ROLES } from '../../../../src/shared/domain/models/CertificationCenterMembership.js';
import { databaseBuilder, domainBuilder, expect } from '../../../test-helper.js';

const { getCertificationPointOfContact } = usecases;

describe('Integration | UseCase | get-certification-point-of-contact', function () {
  it('should return the CertificationPointOfContact', async function () {
    // given
    const user = databaseBuilder.factory.buildUser();
    const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
    const complementaryAlonePilotFeatureId = databaseBuilder.factory.buildFeature(
      CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE,
    ).id;
    databaseBuilder.factory.buildCertificationCenterFeature({
      certificationCenterId: certificationCenter.id,
      featureId: complementaryAlonePilotFeatureId,
    });
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
          features: [CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE.key],
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
