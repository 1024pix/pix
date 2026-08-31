import { expect } from 'chai';
import sinon from 'sinon';

import { findAttachedCertificationCenterForAdmin } from '../../../../../src/organizational-entities/domain/usecases/find-attached-certification-center-for-admin.usecase.js';

describe('Unit | Organizational Entities | Domain | UseCase | find-attached-center-for-admin', function () {
  let certificationCenterForAdminRepository;

  beforeEach(function () {
    certificationCenterForAdminRepository = {
      findAttachedByOrganizationId: sinon.stub(),
    };
  });

  it('calls findAttachedByOrganizationId with the given organizationId', async function () {
    // given
    const organizationId = 123;
    certificationCenterForAdminRepository.findAttachedByOrganizationId.resolves([]);

    // when
    await findAttachedCertificationCenterForAdmin({ organizationId, certificationCenterForAdminRepository });

    // then
    expect(certificationCenterForAdminRepository.findAttachedByOrganizationId).to.have.been.calledOnceWithExactly(
      organizationId,
    );
  });
});
