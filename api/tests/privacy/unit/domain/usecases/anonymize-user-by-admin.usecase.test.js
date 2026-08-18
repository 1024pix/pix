import { expect } from 'chai';
import sinon from 'sinon';

import { AnonymizeUserEvent } from '../../../../../src/privacy/domain/events/AnonymizeUserEvent.js';
import { anonymizeUserByAdmin } from '../../../../../src/privacy/domain/usecases/anonymize-user-by-admin.usecase.js';

describe('Unit | Privacy | Domain | usecases | anonymize user by admin', function () {
  let adminMemberRepository, eventJobPublisherService, auditLoggingJobRepository ;
  beforeEach(function () {
    adminMemberRepository = {
      get: sinon.stub(),
    };

    eventJobPublisherService = {
      publishEvent: sinon.stub(),
    };

    auditLoggingJobRepository = {
      performAsync: sinon.stub(),
    };

  });

  it('should publish an event', async function () {
    // given
    const userId = 1234;
    const updatedByUserId = 456;
    adminMemberRepository.get.resolves({ id: updatedByUserId, role: 'SUPER_ADMIN' });
    const event = new AnonymizeUserEvent({ userId, updatedByUserId });

    // when
    await anonymizeUserByAdmin({
      userId,
      updatedByUserId,
      adminMemberRepository,
      eventJobPublisherService,
      auditLoggingJobRepository,
    });

    // then
    expect(eventJobPublisherService.publishEvent).to.have.been.calledWith(event);
  });

  it('should log anomymization with AuditLoggingJob object', async function () {
    // given
    const userId = 1234;
    const updatedByUserId = 456;
    adminMemberRepository.get.resolves({ id: updatedByUserId, role: 'SUPER_ADMIN' });

    // when
    await anonymizeUserByAdmin({
      userId,
      updatedByUserId,
      adminMemberRepository,
      eventJobPublisherService,
      auditLoggingJobRepository,
    });

    // then
    expect(auditLoggingJobRepository.performAsync).to.have.been.called;
  });
});
