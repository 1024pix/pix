import { CenterForAdmin } from '../../../../../../../src/certification/enrolment/domain/models/CenterForAdmin.js';
import { CenterForAdminFactory } from '../../../../../../../src/certification/enrolment/domain/models/factories/CenterForAdminFactory.js';
import { Habilitation } from '../../../../../../../src/certification/enrolment/domain/models/Habilitation.js';
import { domainBuilder, expect } from '../../../../../../test-helper.js';

describe('Unit | Certification | Enrolment | Domain | Models | Factories | CenterForAdminFactory', function () {
  it('should build a Center for admin', function () {
    // given
    const habilitation = { complementaryCertificationId: 12, key: 'A_KEY', label: 'This is a key' };
    const center = domainBuilder.certification.enrolment.buildCenter({
      habilitations: [new Habilitation(habilitation)],
    });
    const dataProtectionOfficer =
      domainBuilder.buildDataProtectionOfficer.buildDataProtectionOfficerWithCertificationCenterId();
    // when
    const centerForAdmin = CenterForAdminFactory.fromCenterAndDataProtectionOfficer({ center, dataProtectionOfficer });

    // then
    expect(centerForAdmin).to.deepEqualInstance(
      new CenterForAdmin({
        center: {
          id: center.id,
          type: center.type,
          habilitations: [new Habilitation(habilitation)],
          name: center.name,
          externalId: center.externalId,
          createdAt: undefined,
          updatedAt: undefined,
          isComplementaryAlonePilot: center.isComplementaryAlonePilot,
          isV3Pilot: center.isV3Pilot,
        },
        dataProtectionOfficer: {
          firstName: dataProtectionOfficer.firstName,
          lastName: dataProtectionOfficer.lastName,
          email: dataProtectionOfficer.email,
        },
      }),
    );
  });
});
