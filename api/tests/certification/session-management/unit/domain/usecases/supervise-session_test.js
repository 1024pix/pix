import {
  InvalidSessionSupervisingLoginError,
  SessionNotAccessible,
} from '../../../../../../src/certification/session-management/domain/errors.js';
import { superviseSession } from '../../../../../../src/certification/session-management/domain/usecases/supervise-session.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | supervise-session', function () {
  let sessionRepository;
  let supervisorAccessRepository;

  beforeEach(function () {
    sessionRepository = {
      get: sinon.stub(),
    };
    supervisorAccessRepository = {
      create: sinon.stub(),
    };
  });

  it('should throw a InvalidSessionSupervisingLoginError when the supervised password is wrong', async function () {
    // given
    const sessionId = 123;
    const invigilatorPassword = 'NOT_MATCHING_INVIGILATOR_PASSWORD';
    const userId = 434;
    const session = domainBuilder.certification.sessionManagement.buildSession({ id: sessionId });
    sessionRepository.get.resolves(session);

    // when
    const error = await catchErr(superviseSession)({
      sessionId,
      invigilatorPassword,
      userId,
      sessionRepository,
      supervisorAccessRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(InvalidSessionSupervisingLoginError);
    expect(error.message).to.equal('Le numéro de session et/ou le mot de passe saisis sont incorrects.');
  });

  it('should throw a SessionNotAccessible when the session is not accessible', async function () {
    // given
    const sessionId = 123;
    const userId = 434;
    const session = domainBuilder.certification.sessionManagement.buildSession.processed({ id: sessionId });
    sessionRepository.get.resolves(session);

    // when
    const error = await catchErr(superviseSession)({
      sessionId,
      invigilatorPassword: session.invigilatorPassword,
      userId,
      sessionRepository,
      supervisorAccessRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(SessionNotAccessible);
  });

  it('should create a supervisor access', async function () {
    // given
    const sessionId = 123;
    const userId = 434;
    const session = domainBuilder.certification.sessionManagement.buildSession.created({ id: sessionId });
    sessionRepository.get.resolves(session);

    // when
    await superviseSession({
      sessionId,
      invigilatorPassword: session.invigilatorPassword,
      userId,
      sessionRepository,
      supervisorAccessRepository,
    });

    // then
    expect(supervisorAccessRepository.create).to.have.been.calledWithExactly({ sessionId, userId });
  });
});
