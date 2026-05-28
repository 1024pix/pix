import sinon from 'sinon';

import { anonymizeGarAuthenticationMethods } from '../../../../../src/identity-access-management/domain/usecases/anonymize-gar-authentication-methods.usecase.js';
import { PIX_ADMIN } from '../../../../../src/shared/domain/constants.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import { AuditLoggingJob } from '../../../../../src/shared/domain/models/jobs/AuditLoggingJob.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | UseCase | anonymize-gar-authentication-methods', function () {
  let clock;
  let auditLoggingJobRepository;

  beforeEach(function () {
    const now = new Date('2023-08-17');
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    auditLoggingJobRepository = { performAsync: sinon.stub().resolves() };
    sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda());
  });

  afterEach(function () {
    clock.restore();
  });

  it('processes user GAR anonymisation in batch and returns anonymized / total of userIds', async function () {
    // given
    const userIds = [1001, 1002, 1003];
    const adminMemberId = 1;

    const authenticationMethodRepository = {
      anonymizeByUserIds: sinon
        .stub()
        .onFirstCall()
        .resolves({ garAnonymizedUserIds: [] })
        .onSecondCall()
        .resolves({ garAnonymizedUserIds: [1002] })
        .onThirdCall()
        .resolves({ garAnonymizedUserIds: [1003] }),
    };

    // when
    const result = await anonymizeGarAuthenticationMethods({
      userIds,
      userIdsBatchSize: 1,
      adminMemberId,
      authenticationMethodRepository,
      auditLoggingJobRepository,
    });

    // then
    expect(result.garAnonymizedUserCount).to.be.equal(2);
    expect(result.total).to.be.equal(3);
    expect(auditLoggingJobRepository.performAsync).to.have.been.calledTwice;
  });

  it('triggers a garAnonymizedBatchEventsLogging job', async function () {
    // given
    const userIds = [1001, 1002, 1003];
    const adminMemberId = 1;
    const garAnonymizedUserIds = [1002, 1003];

    const authenticationMethodRepository = {
      anonymizeByUserIds: sinon.stub().resolves({ garAnonymizedUserIds }),
    };

    // when
    await anonymizeGarAuthenticationMethods({
      userIds,
      adminMemberId,
      authenticationMethodRepository,
      auditLoggingJobRepository,
    });

    // then
    const payload = AuditLoggingJob.forUsers({
      client: 'PIX_ADMIN',
      action: 'ANONYMIZATION_GAR',
      userIds: [1002, 1003],
      updatedByUserId: 1,
      role: PIX_ADMIN.ROLES.SUPER_ADMIN,
    });
    expect(auditLoggingJobRepository.performAsync).to.have.been.calledWith(payload);
  });
});
