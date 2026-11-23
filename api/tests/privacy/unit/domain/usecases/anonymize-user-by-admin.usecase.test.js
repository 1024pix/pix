import { expect } from 'chai';
import sinon from 'sinon';

import { anonymizeUserByAdmin } from '../../../../../src/privacy/domain/usecases/anonymize-user-by-admin.usecase.js';
import { UserAlreadyAnonymizedError } from '../../../../../src/shared/domain/errors.js';
import { AnonymizeUserEvent } from '../../../../../src/shared/domain/events/AnonymizeUserEvent.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | Privacy | Domain | usecases | anonymize user by admin', function () {
  let adminMemberRepository, userRepository, eventJobPublisherService, auditLoggingJobRepository;
  beforeEach(function () {
    adminMemberRepository = {
      get: sinon.stub(),
    };

    userRepository = {
      get: sinon.stub(),
    };

    eventJobPublisherService = {
      publishEvent: sinon.stub(),
    };

    auditLoggingJobRepository = {
      performAsync: sinon.stub(),
    };
  });

  it('publishes an event', async function () {
    // given
    const userId = 1234;
    const updatedByUserId = 456;
    adminMemberRepository.get.resolves({ id: updatedByUserId, role: 'SUPER_ADMIN' });
    userRepository.get.resolves({ id: userId, hasBeenAnonymised: false });
    const event = new AnonymizeUserEvent({ userId, updatedByUserId });

    // when
    await anonymizeUserByAdmin({
      userId,
      updatedByUserId,
      adminMemberRepository,
      userRepository,
      eventJobPublisherService,
      auditLoggingJobRepository,
    });

    // then
    expect(eventJobPublisherService.publishEvent).to.have.been.calledWith(event);
  });

  it('logs anomymization through the AuditLoggingJob', async function () {
    // given
    const userId = 1234;
    const updatedByUserId = 456;
    adminMemberRepository.get.resolves({ id: updatedByUserId, role: 'SUPER_ADMIN' });
    userRepository.get.resolves({ id: userId, hasBeenAnonymised: false });

    // when
    await anonymizeUserByAdmin({
      userId,
      updatedByUserId,
      adminMemberRepository,
      userRepository,
      eventJobPublisherService,
      auditLoggingJobRepository,
    });

    // then
    expect(auditLoggingJobRepository.performAsync).to.have.been.called;
  });

  context('when the user has already been anonymized', function () {
    it('throws a UserAlreadyAnonymizedError and does not publish an event', async function () {
      // given
      const userId = 1234;
      const updatedByUserId = 456;
      adminMemberRepository.get.resolves({ id: updatedByUserId, role: 'SUPER_ADMIN' });
      userRepository.get.resolves({ id: userId, hasBeenAnonymised: true });

      // when
      const error = await catchErr(anonymizeUserByAdmin)({
        userId,
        updatedByUserId,
        adminMemberRepository,
        userRepository,
        eventJobPublisherService,
        auditLoggingJobRepository,
      });

      // then
      expect(error).to.be.instanceOf(UserAlreadyAnonymizedError);
      expect(eventJobPublisherService.publishEvent).to.not.have.been.called;
      expect(auditLoggingJobRepository.performAsync).to.not.have.been.called;
    });

    context('with the force option', function () {
      it('does not throw any error and publishes an event', async function () {
        // given
        const userId = 1234;
        const updatedByUserId = 456;
        const force = true;
        adminMemberRepository.get.resolves({ id: updatedByUserId, role: 'SUPER_ADMIN' });
        userRepository.get.resolves({ id: userId, hasBeenAnonymised: true });
        const event = new AnonymizeUserEvent({ userId, updatedByUserId });

        // when
        await anonymizeUserByAdmin({
          userId,
          updatedByUserId,
          force,
          adminMemberRepository,
          userRepository,
          eventJobPublisherService,
          auditLoggingJobRepository,
        });

        // then
        expect(eventJobPublisherService.publishEvent).to.have.been.calledWith(event);
      });
    });
  });
});
