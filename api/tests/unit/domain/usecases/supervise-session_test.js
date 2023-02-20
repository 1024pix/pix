import { expect, sinon, domainBuilder, catchErr } from '../../../test-helper';
import superviseSession from '../../../../lib/domain/usecases/supervise-session';
import { InvalidSessionSupervisingLoginError, SessionNotAccessible } from '../../../../lib/domain/errors';

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
    const supervisorPassword = 'NOT_MATCHING_SUPERVISOR_PASSWORD';
    const userId = 434;
    const session = domainBuilder.buildSession({ id: sessionId });
    sessionRepository.get.resolves(session);

    // when
    const error = await catchErr(superviseSession)({
      sessionId,
      supervisorPassword,
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
    const session = domainBuilder.buildSession.processed({ id: sessionId });
    sessionRepository.get.resolves(session);

    // when
    const error = await catchErr(superviseSession)({
      sessionId,
      supervisorPassword: session.supervisorPassword,
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
    const session = domainBuilder.buildSession.created({ id: sessionId });
    sessionRepository.get.resolves(session);

    // when
    await superviseSession({
      sessionId,
      supervisorPassword: session.supervisorPassword,
      userId,
      sessionRepository,
      supervisorAccessRepository,
    });

    // then
    expect(supervisorAccessRepository.create).to.have.been.calledWith({ sessionId, userId });
  });
});
