import sinon from 'sinon';

import { CertificationCenterMembership } from '../../../../../src/team/domain/models/CertificationCenterMembership.js';
import { updateCertificationCenterMembership } from '../../../../../src/team/domain/usecases/update-certification-center-membership.usecase.js';

import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Team | Domain | UseCase | update-certification-center-membership', function () {
  let now;
  let clock;

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now: new Date('2023-09-12'), toFake: ['Date'] });
    now = new Date(clock.now);
  });

  afterEach(function () {
    clock.restore();
  });

  it("updates the user's role", async function () {
    // given
    const certificationCenterMembership = domainBuilder.buildCertificationCenterMembership({ id: 2 });
    const role = 'ADMIN';
    const updatedByUserId = 1;
    const certificationCenterMembershipRepository = {
      update: sinon.stub().resolves(),
      findById: sinon.stub(),
    };
    const expectedCertificationCenterMembership = new CertificationCenterMembership({
      ...certificationCenterMembership,
      role,
      updatedByUserId,
      updatedAt: now,
    });

    certificationCenterMembershipRepository.findById.onCall(0).resolves(certificationCenterMembership);
    certificationCenterMembershipRepository.findById.onCall(1).resolves(expectedCertificationCenterMembership);

    // when
    const updatedCertificationCenterMembership = await updateCertificationCenterMembership({
      certificationCenterMembershipId: certificationCenterMembership.id,
      role,
      updatedByUserId,
      certificationCenterMembershipRepository,
    });

    // then
    expect(updatedCertificationCenterMembership).to.be.instanceof(CertificationCenterMembership);
    expect(certificationCenterMembershipRepository.findById).to.have.been.calledTwice;
    expect(certificationCenterMembershipRepository.update).to.have.been.calledWithExactly(
      expectedCertificationCenterMembership,
    );
  });
});
