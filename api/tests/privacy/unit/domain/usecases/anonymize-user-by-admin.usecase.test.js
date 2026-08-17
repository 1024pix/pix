import sinon from 'sinon';

import { anonymizeUserByAdmin } from '../../../../../src/privacy/domain/usecases/anonymize-user-by-admin.usecase.js';
import { expect } from '../../../../test-helper.js';

describe.only('Unit | Privacy | Domain | usecases | anonymize user by admin', function () {
  let adminMemberRepository, anonymizeServices, eventJobPublisherService;
  beforeEach(function () {
    adminMemberRepository = {
      get: sinon.stub(),
    };

    anonymizeServices = {
      anonymizeUser: sinon.stub(),
    };

    eventJobPublisherService = {
      publishEvent: sinon.stub(),
    };

  });
  it('should publish an event', async function () {
    // given
    const userId = 1234;
    const updatedByUserId = 456;
    adminMemberRepository.get.resolves({id:updatedByUserId, role:'super admin'});
    // when
    await anonymizeUserByAdmin({
      userId,
      updatedByUserId,
      adminMemberRepository,
      anonymizeServices,
      eventJobPublisherService,
    });

    // then
    expect(eventJobPublisherService.publishEvent).to.have.been.calledWith(
      "ANONYMIZE_USER_BY_ADMIN",
      { userId: 1234, updatedByUserId: 456 },
    );
  });
});
