import { expect } from 'chai';
import sinon from 'sinon';

import { AnonymizeUserEvent } from '../../../../../src/privacy/domain/events/AnonymizeUserEvent.js';
import { selfAnonymizeByUser } from '../../../../../src/privacy/domain/usecases/self-anonymize-by-user.usecase.js';
import { ForbiddenAccess, UserAlreadyAnonymizedError } from '../../../../../src/shared/domain/errors.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | Privacy | Domain | usecases | self anonymize by user', function () {
  let userRepository, emailRepository, anonymizeServices, eventJobPublisherService, auditLoggingJobRepository;

  beforeEach(function () {
    userRepository = {
      get: sinon.stub(),
    };

    emailRepository = {
      sendEmailAsync: sinon.stub(),
    };

    anonymizeServices = {
      canSelfAnonymize: sinon.stub(),
    };

    eventJobPublisherService = {
      publishEvent: sinon.stub(),
    };

    auditLoggingJobRepository = {
      performAsync: sinon.stub(),
    };
  });

  it('should throw a ForbiddenAccess error when the user is not allowed to self-anonymize', async function () {
    // given
    const userId = 1234;
    anonymizeServices.canSelfAnonymize.withArgs({ userId }).resolves(false);

    // when
    const error = await catchErr(selfAnonymizeByUser)({
      userId,
      userRepository,
      emailRepository,
      anonymizeServices,
      eventJobPublisherService,
      auditLoggingJobRepository,
    });

    // then
    expect(error).to.be.instanceOf(ForbiddenAccess);
    expect(userRepository.get).to.not.have.been.called;
    expect(eventJobPublisherService.publishEvent).to.not.have.been.called;
  });

  it('should throw a UserAlreadyAnonymizedError and not publish an event when the user has already been anonymized', async function () {
    // given
    const userId = 1234;
    anonymizeServices.canSelfAnonymize.withArgs({ userId }).resolves(true);
    userRepository.get
      .withArgs(userId)
      .resolves({ email: 'user@example.net', firstName: 'John', hasBeenAnonymised: true });

    // when
    const error = await catchErr(selfAnonymizeByUser)({
      userId,
      userRepository,
      emailRepository,
      anonymizeServices,
      eventJobPublisherService,
      auditLoggingJobRepository,
    });

    // then
    expect(error).to.be.instanceOf(UserAlreadyAnonymizedError);
    expect(eventJobPublisherService.publishEvent).to.not.have.been.called;
    expect(auditLoggingJobRepository.performAsync).to.not.have.been.called;
    expect(emailRepository.sendEmailAsync).to.not.have.been.called;
  });

  it('should publish an event and log the anonymization when the user can self-anonymize', async function () {
    // given
    const userId = 1234;
    anonymizeServices.canSelfAnonymize.withArgs({ userId }).resolves(true);
    userRepository.get.withArgs(userId).resolves({ email: null, firstName: 'John', hasBeenAnonymised: false });
    const event = new AnonymizeUserEvent({ userId, updatedByUserId: userId });

    // when
    await selfAnonymizeByUser({
      userId,
      userRepository,
      emailRepository,
      anonymizeServices,
      eventJobPublisherService,
      auditLoggingJobRepository,
    });

    // then
    expect(eventJobPublisherService.publishEvent).to.have.been.calledWith(event);
    expect(auditLoggingJobRepository.performAsync).to.have.been.called;
  });

  it('should send a confirmation email when the user has an email', async function () {
    // given
    const userId = 1234;
    const locale = 'fr-FR';
    anonymizeServices.canSelfAnonymize.withArgs({ userId }).resolves(true);
    userRepository.get
      .withArgs(userId)
      .resolves({ email: 'user@example.net', firstName: 'John', hasBeenAnonymised: false });

    // when
    await selfAnonymizeByUser({
      userId,
      locale,
      userRepository,
      emailRepository,
      anonymizeServices,
      eventJobPublisherService,
      auditLoggingJobRepository,
    });

    // then
    expect(emailRepository.sendEmailAsync).to.have.been.called;
  });
});
