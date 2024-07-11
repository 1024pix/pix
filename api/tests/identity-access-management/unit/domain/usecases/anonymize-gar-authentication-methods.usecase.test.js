import { config } from '../../../../../lib/config.js';
import { PIX_ADMIN } from '../../../../../src/authorization/domain/constants.js';
import { GarAuthenticationMethodAnonymized } from '../../../../../src/identity-access-management/domain/models/GarAuthenticationMethodAnonymized.js';
import { anonymizeGarAuthenticationMethods } from '../../../../../src/identity-access-management/domain/usecases/anonymize-gar-authentication-methods.usecase.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import { expect, sinon } from '../../../../test-helper.js';

const { ROLES } = PIX_ADMIN;

describe('Unit | Identity Access Management | Domain | UseCase | anonymize-gar-authentication-methods', function () {
  let clock;
  let domainTransaction;
  let garAnonymizedBatchEventsLoggingJob;

  beforeEach(function () {
    const now = new Date('2023-08-17');
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    garAnonymizedBatchEventsLoggingJob = {
      schedule: sinon.stub().resolves(),
    };
    domainTransaction = Symbol('domain transaction');
    sinon.stub(config.auditLogger, 'isEnabled').value(true);
  });

  afterEach(function () {
    clock.restore();
  });

  it('returns garAnonymizedUserIds and total of userIds', async function () {
    // given
    const userIds = [1001, 1002, 1003];
    const adminMemberId = 1;
    const garAnonymizedUserIds = [1002, 1003];

    const authenticationMethodRepository = {
      batchAnonymizeByUserIds: sinon.stub().resolves({ garAnonymizedUserIds }),
    };

    sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda(domainTransaction));

    // when
    const result = await anonymizeGarAuthenticationMethods({
      userIds,
      adminMemberId,
      authenticationMethodRepository,
      domainTransaction,
      garAnonymizedBatchEventsLoggingJob,
    });

    // then
    expect(result.garAnonymizedUserCount).to.be.equal(2);
    expect(result.total).to.be.equal(3);
  });

  it('triggers a garAnonymizedBatchEventsLogging job', async function () {
    // given
    const userIds = [1001, 1002, 1003];
    const adminMemberId = 1;
    const garAnonymizedUserIds = [1002, 1003];

    const authenticationMethodRepository = {
      batchAnonymizeByUserIds: sinon.stub().resolves({ garAnonymizedUserIds }),
    };

    sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda(domainTransaction));

    // when
    await anonymizeGarAuthenticationMethods({
      userIds,
      adminMemberId,
      authenticationMethodRepository,
      garAnonymizedBatchEventsLoggingJob,
      domainTransaction,
    });

    // then
    const payload = new GarAuthenticationMethodAnonymized({
      userIds: [1002, 1003],
      updatedByUserId: 1,
      occuredAt: Date.now(),
      role: ROLES.SUPER_ADMIN,
    });
    expect(garAnonymizedBatchEventsLoggingJob.schedule).to.have.been.calledWith(payload);
  });

  it('does not trigger a garAnonymizedBatchEventsLogging job when audit logger config is disabled', async function () {
    // given
    const userIds = [1001, 1002, 1003];
    const adminMemberId = 1;
    const garAnonymizedUserIds = [1002, 1003];

    const authenticationMethodRepository = {
      batchAnonymizeByUserIds: sinon.stub().resolves({ garAnonymizedUserIds }),
    };

    sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda(domainTransaction));
    sinon.stub(config.auditLogger, 'isEnabled').value(false);

    // when
    await anonymizeGarAuthenticationMethods({
      userIds,
      adminMemberId,
      authenticationMethodRepository,
      garAnonymizedBatchEventsLoggingJob,
      domainTransaction,
    });

    // then
    expect(garAnonymizedBatchEventsLoggingJob.schedule).to.have.not.been.called;
  });
});
