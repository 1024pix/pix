import { expect } from 'chai';
import sinon from 'sinon';

import { SessionAlreadyPublishedError } from '../../../../../../src/certification/session-management/domain/errors.js';
import { requestMultipleSessionPublication } from '../../../../../../src/certification/session-management/domain/usecases/request-multiple-session-publication.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | UseCase | request-multiple-session-publication', function () {
  let sessionManagementRepository, publishSessionJobRepository;

  beforeEach(function () {
    sessionManagementRepository = {
      getSessionIdAndPublishedAt: sinon.stub(),
    };
    publishSessionJobRepository = {
      performAsync: sinon.stub(),
    };
  });

  it('returns a NotFoundError when one of sessions does not exist', async function () {
    const sessionIds = [12, 23];
    domainBuilder.certification.sessionManagement.buildSessionManagement({ id: 23 });
    sessionManagementRepository.getSessionIdAndPublishedAt.withArgs([12, 23]).resolves([{ id: 23, publishedAt: null }]);

    const result = await requestMultipleSessionPublication({
      sessionIds,
      publishSessionJobRepository,
      sessionManagementRepository,
    });

    expect(result[12]).to.deep.equal(new NotFoundError('Session id 12 not found'));
  });

  it('returns a SessionAlreadyPublishedError when one of sessions is already published', async function () {
    const existingSession = domainBuilder.certification.sessionManagement.buildSessionManagement({
      id: 12,
      publishedAt: null,
    });
    const alreadyPublishedSession = domainBuilder.certification.sessionManagement.buildSessionManagement({
      id: 23,
      publishedAt: new Date(),
    });

    sessionManagementRepository.getSessionIdAndPublishedAt.withArgs([12, 23]).resolves([
      { id: alreadyPublishedSession.id, publishedAt: alreadyPublishedSession.publishedAt },
      { id: existingSession.id, publishedAt: existingSession.publishedAt },
    ]);
    const sessionIds = [existingSession.id, alreadyPublishedSession.id];

    const result = await requestMultipleSessionPublication({
      sessionIds,
      publishSessionJobRepository,
      sessionManagementRepository,
    });

    expect(result[alreadyPublishedSession.id]).to.deep.equal(
      new SessionAlreadyPublishedError(`Session id ${alreadyPublishedSession.id} is already published`),
    );
  });

  it('calls `PublishSessionJob.performAsync` for the each of the two sessions', async function () {
    // given
    const firstSession = domainBuilder.certification.sessionManagement.buildSessionManagement({
      id: 12,
      publishedAt: null,
    });
    const secondSession = domainBuilder.certification.sessionManagement.buildSessionManagement({
      id: 23,
      publishedAt: null,
    });

    sessionManagementRepository.getSessionIdAndPublishedAt.withArgs([12, 23]).resolves([
      { id: firstSession.id, publishedAt: firstSession.publishedAt },
      { id: secondSession.id, publishedAt: secondSession.publishedAt },
    ]);
    const sessionIds = [firstSession.id, secondSession.id];

    // when
    await requestMultipleSessionPublication({
      sessionIds,
      publishSessionJobRepository,
      sessionManagementRepository,
    });

    expect(publishSessionJobRepository.performAsync.callCount).to.eq(2);
    expect(publishSessionJobRepository.performAsync.getCall(0).firstArg.sessionId).to.equal(12);
    expect(publishSessionJobRepository.performAsync.getCall(1).firstArg.sessionId).to.equal(23);
  });
});
