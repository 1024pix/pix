const { expect, sinon, catchErr } = require('../../../test-helper');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const sessionRepository = require('../../../../lib/infrastructure/repositories/session-repository');
const certificationCandidateRepository = require('../../../../lib/infrastructure/repositories/certification-candidate-repository');
const getSessionCertificationCandidates = require('../../../../lib/domain/usecases/get-session-certification-candidates');

describe('Unit | Domain | Use Cases | get-session-certification-candidates', () => {

  const sessionId = 'sessionId';
  const userId = 'userId';

  context('when user has no access to the session', () => {

    beforeEach(() => {
      // given
      sinon.stub(sessionRepository, 'ensureUserHasAccessToSession').rejects(new UserNotAuthorizedToAccessEntity());
    });

    it('should throw with a UserNotAuthorizedToAccessEntity', async () => {
      // when
      const result = await catchErr(getSessionCertificationCandidates)({ userId, sessionId, sessionRepository, certificationCandidateRepository });

      // then
      expect(result).to.be.an.instanceOf(UserNotAuthorizedToAccessEntity);
    });

  });

  context('when user has access to the session', () => {
    const certificationCandidates = 'candidates';

    beforeEach(() => {
      // given
      sinon.stub(sessionRepository, 'ensureUserHasAccessToSession').resolves();
      sinon.stub(certificationCandidateRepository, 'findBySessionId').withArgs(sessionId).resolves(certificationCandidates);
    });

    it('should return the certification candidates', async () => {
      // when
      const actualCandidates = await getSessionCertificationCandidates({ userId, sessionId, sessionRepository, certificationCandidateRepository });

      // then
      expect(actualCandidates).to.equal(certificationCandidates);
      expect(certificationCandidateRepository.findBySessionId.calledAfter(sessionRepository.ensureUserHasAccessToSession)).to.be.true;
    });

  });

});
