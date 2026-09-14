import { expect } from 'chai';
import sinon from 'sinon';

import { SessionAlreadyPublishedError } from '../../../../../../src/certification/session-management/domain/errors.js';
import { sessionsPublicationRequest } from '../../../../../../src/certification/session-management/domain/usecases/sessions-publication-request.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | UseCase | sessions-publication-request', function () {
  let sessionManagementRepository, publishSessionJobRepository;

  beforeEach(function () {
    sessionManagementRepository = {
      get: sinon.stub(),
    };
    publishSessionJobRepository = {
      performAsync: sinon.stub(),
    };
  });

  it('returns a NotFoundError when one of sessions does not exist', async function () {
    const sessionIds = [12, 23];
    const existingSession = domainBuilder.certification.sessionManagement.buildSessionManagement({ id: 23 });

    sessionManagementRepository.get.withArgs({ id: 12 }).resolves(undefined);
    sessionManagementRepository.get.withArgs({ id: 23 }).resolves(existingSession);

    const result = await sessionsPublicationRequest({
      sessionIds,
      publishSessionJobRepository,
      sessionManagementRepository,
    });

    expect(result.hasPublicationErrors()).to.be.true;
    expect(result.publicationErrors[12]).to.deep.equal(new NotFoundError('Session id 12 not found'));
  });

  it('returns a SessionAlreadyPublishedError when one of sessions is already published', async function () {
    const sessionIds = [12, 23];
    const existingSession = domainBuilder.certification.sessionManagement.buildSessionManagement({
      id: 12,
      publishedAt: null,
    });
    const alreadyPublishedSession = domainBuilder.certification.sessionManagement.buildSessionManagement({
      id: 23,
      publishedAt: new Date(),
    });

    sessionManagementRepository.get.withArgs({ id: 12 }).resolves(existingSession);
    sessionManagementRepository.get.withArgs({ id: 23 }).resolves(alreadyPublishedSession);

    const result = await sessionsPublicationRequest({
      sessionIds,
      publishSessionJobRepository,
      sessionManagementRepository,
    });

    expect(result.hasPublicationErrors()).to.be.true;
    expect(result.publicationErrors[23]).to.deep.equal(
      new SessionAlreadyPublishedError('Session id 23 is already published'),
    );
  });

  it('calls `PublishSessionJob.performAsync` for the each of the two sessions', async function () {
    // given
    const sessionIds = [12, 23];
    const firstSession = domainBuilder.certification.sessionManagement.buildSessionManagement({
      id: 12,
      publishedAt: null,
    });
    const secondSession = domainBuilder.certification.sessionManagement.buildSessionManagement({
      id: 23,
      publishedAt: null,
    });

    sessionManagementRepository.get.withArgs({ id: 12 }).resolves(firstSession);
    sessionManagementRepository.get.withArgs({ id: 23 }).resolves(secondSession);

    // when
    await sessionsPublicationRequest({
      sessionIds,
      publishSessionJobRepository,
      sessionManagementRepository,
    });

    expect(publishSessionJobRepository.performAsync.callCount).to.eq(2);
    expect(publishSessionJobRepository.performAsync.getCall(0).firstArg.sessionId).to.equal(12);
    expect(publishSessionJobRepository.performAsync.getCall(1).firstArg.sessionId).to.equal(23);
  });
});
