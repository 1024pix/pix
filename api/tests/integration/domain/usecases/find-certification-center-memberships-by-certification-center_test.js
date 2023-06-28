import { databaseBuilder, expect } from '../../../test-helper.js';

import * as certificationCenterMembershipRepository from '../../../../lib/shared/infrastructure/repositories/certification-center-membership-repository.js';
import { CertificationCenterMembership } from '../../../../lib/shared/domain/models/CertificationCenterMembership.js';
import { usecases } from '../../../../lib/shared/domain/usecases/index.js';

const { findCertificationCenterMembershipsByCertificationCenter } = usecases;

describe('Integration | UseCase | find-certification-center-memberships-by-certification-center', function () {
  it('should return certification center memberships', async function () {
    // given
    const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
    const user = databaseBuilder.factory.buildUser();
    const certificationCenterMembership = databaseBuilder.factory.buildCertificationCenterMembership({
      certificationCenterId: certificationCenter.id,
      userId: user.id,
    });

    await databaseBuilder.commit();

    // when
    const foundCertificationCenterMemberships = await findCertificationCenterMembershipsByCertificationCenter({
      certificationCenterId: certificationCenter.id,
      certificationCenterMembershipRepository,
    });

    // then
    const foundCertificationCenterMembership = foundCertificationCenterMemberships[0];
    expect(foundCertificationCenterMembership).to.be.instanceOf(CertificationCenterMembership);
    expect(foundCertificationCenterMembership.id).to.equal(certificationCenterMembership.id);
    expect(foundCertificationCenterMembership.certificationCenter.id).to.equal(certificationCenter.id);
    expect(foundCertificationCenterMembership.user.id).to.equal(user.id);
  });
});
