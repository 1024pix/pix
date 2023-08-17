import { publishSession } from '../../../../lib/domain/usecases/publish-session.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | publish-session', function () {
  it('delegates the action to the session-publication-service and return the session', async function () {
    // given
    const i18n = Symbol('i18n');
    const sessionId = Symbol('a session id');
    const session = Symbol('a session');
    const certificationRepository = Symbol('the certification repository');
    const finalizedSessionRepository = Symbol('the finalizedSessionRepository');
    const publishedAt = Symbol('a publication date');

    const sessionRepository = {
      get: sinon.stub(),
    };
    sessionRepository.get.resolves(session);

    const sessionPublicationService = {
      publishSession: sinon.stub(),
    };

    const certificationCenterRepository = {
      getRefererEmails: sinon.stub(),
    };

    // when
    const result = await publishSession({
      i18n,
      sessionId,
      certificationRepository,
      certificationCenterRepository,
      finalizedSessionRepository,
      sessionRepository,
      sessionPublicationService,
      publishedAt,
    });

    // then
    expect(sessionPublicationService.publishSession).to.have.been.calledWithExactly({
      i18n,
      sessionId,
      certificationRepository,
      certificationCenterRepository,
      finalizedSessionRepository,
      sessionRepository,
      publishedAt,
    });
    expect(result).to.equal(session);
  });
});
