import sinon from 'sinon';

import { findAttachedOrganizationsForAdmin } from '../../../../../src/organizational-entities/domain/usecases/find-attached-organizations-for-admin.usecase.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Organizational Entities | Domain | UseCase | find-attached-organization-for-admin', function () {
  let organizationForAdminRepository;

  beforeEach(function () {
    organizationForAdminRepository = {
      findAttachedByCertificationCenterId: sinon.stub(),
    };
  });

  it('calls findAttachedByCertificationCenterId with the given certification center id', async function () {
    // given
    const certificationCenterId = 123;
    organizationForAdminRepository.findAttachedByCertificationCenterId.resolves([]);

    // when
    await findAttachedOrganizationsForAdmin({ certificationCenterId, organizationForAdminRepository });

    // then
    expect(organizationForAdminRepository.findAttachedByCertificationCenterId).to.have.been.calledOnceWithExactly({
      certificationCenterId,
    });
  });
});
