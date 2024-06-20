import { PIX_ADMIN } from '../../../../../src/authorization/domain/constants.js';
import { GarAuthenticationMethodAnonymized } from '../../../../../src/identity-access-management/domain/events/GarAuthenticationMethodAnonymized.js';
import { anonymizeGarAuthenticationMethods } from '../../../../../src/identity-access-management/domain/usecases/anonymize-gar-authentication-methods.usecase.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import { expect, sinon } from '../../../../test-helper.js';

const { ROLES } = PIX_ADMIN;

describe('Unit | Identity Access Management | Domain | UseCase | anonymize-gar-authentication-methods', function () {
  let clock;

  beforeEach(function () {
    const now = new Date('2023-08-17');
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  it('returns anonymized userId number and total of userIds', async function () {
    // given
    const userIds = [1001, 1002, 1003];
    const adminMemberId = 1;

    const authenticationMethodRepository = {
      batchAnonymizeByUserIds: sinon.stub().resolves({ anonymizedUserCount: 3 }),
    };
    const eventBus = {
      publish: sinon.stub().resolves(),
    };
    const domainTransaction = Symbol('domain transaction');
    sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda(domainTransaction));

    // when
    const result = await anonymizeGarAuthenticationMethods({
      userIds,
      adminMemberId,
      authenticationMethodRepository,
      domainTransaction,
      eventBus,
    });

    // then
    expect(result.anonymizedUserCount).to.be.equal(3);
    expect(result.total).to.be.equal(3);
  });

  it('sends a GarAuthenticationMethodAnonymized event', async function () {
    // given
    const userIds = [1001, 1002, 1003];
    const adminMemberId = 1;

    const authenticationMethodRepository = {
      batchAnonymizeByUserIds: sinon.stub().resolves({ anonymizedUserCount: 1 }),
    };
    const eventBus = {
      publish: sinon.stub().resolves(),
    };
    const domainTransaction = Symbol('domain transaction');
    sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda(domainTransaction));

    // when
    await anonymizeGarAuthenticationMethods({
      userIds,
      adminMemberId,
      authenticationMethodRepository,
      domainTransaction,
      eventBus,
    });

    // then
    const event = new GarAuthenticationMethodAnonymized({
      userIds,
      updatedByUserId: 1,
      occuredAt: Date.now(),
      role: ROLES.SUPER_ADMIN,
    });
    expect(eventBus.publish).to.have.been.calledWith(event);
  });
});
