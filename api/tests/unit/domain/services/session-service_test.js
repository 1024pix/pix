const { expect, sinon, testErr, domainBuilder } = require('../../../test-helper');
const Session = require('../../../../lib/domain/models/Session');
const sessionService = require('../../../../lib/domain/services/session-service');
const sessionCodeService = require('../../../../lib/domain/services/session-code-service');
const { NotFoundError } = require('../../../../lib/domain/errors');
const sessionRepository = require('../../../../lib/infrastructure/repositories/session-repository');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const certificationCenterRepository = require('../../../../lib/infrastructure/repositories/certification-center-repository');

describe('Unit | Service | session', () => {

  describe('#sessionExists', () => {

    beforeEach(() => {
      sinon.stub(sessionCodeService, 'getSessionByAccessCode');
    });

    context('when access-code is not given', () => {
      it('should stop the request', () => {
        // given
        sessionCodeService.getSessionByAccessCode.resolves(null);

        // when
        const promise = sessionService.sessionExists(null);

        // then
        return promise.catch((result) => {
          expect(result).to.be.an.instanceOf(NotFoundError);
        });
      });
    });

    context('when access-code is wrong', () => {
      it('should stop the request', () => {
        // given
        sessionCodeService.getSessionByAccessCode.resolves(null);

        // when
        const promise = sessionService.sessionExists('1234');

        // then
        return promise.catch((result) => {
          expect(result).to.be.an.instanceOf(NotFoundError);
        });
      });
    });

    context('when access-code is correct', () => {
      it('should let the request continue', () => {
        // given
        sessionCodeService.getSessionByAccessCode.resolves({ id: 12 });

        // when
        const promise = sessionService.sessionExists('ABCD12');

        // then
        return promise.then((result) => {
          expect(result).to.be.equal(12);
        });
      });
    });
  });

  describe('#get', () => {

    it('should get session informations with related certifications', () => {
      // given
      const sessionId = 'sessionId';
      sinon.stub(sessionRepository, 'get').resolves();

      // when
      const promise = sessionService.get(sessionId);

      // then
      return promise.then(() => {
        expect(sessionRepository.get).to.have.been.calledWith('sessionId');
      });
    });
  });

  describe('#save', () => {

    let userId, certificationCenter, certificationCenterName, sessionToSave, expectedSavedSession,
      certificationCenterId, sessionId, sessionAugmentedWithName;

    let getUserStub, getCertificationCenterStub, saveSessionStub;

    beforeEach(() => {
      userId = 473820;
      sessionId = 'PIX666';
      certificationCenterId = '5';
      certificationCenterName = 'Pass Ta Certif';
      certificationCenter = domainBuilder.buildCertificationCenter({ id: certificationCenterId, name: certificationCenterName });
      sessionToSave = domainBuilder.buildSession({ id: sessionId, certificationCenterId, certificationCenter: null });
      expectedSavedSession = domainBuilder.buildSession();
      sessionAugmentedWithName = new Session({ ...sessionToSave });
      sessionAugmentedWithName.certificationCenter = certificationCenterName;

      getCertificationCenterStub = sinon.stub(certificationCenterRepository, 'get');
      saveSessionStub = sinon.stub(sessionRepository, 'save');
      getUserStub = sinon.stub(userRepository, 'get');
    });

    context('when the user is PIX MASTER', () => {

      beforeEach(() => {
        const userPixMaster = domainBuilder.buildUser({ pixRoles: [domainBuilder.buildPixRole({ name: 'PIX_MASTER' })] });
        getUserStub.withArgs(userId).resolves(userPixMaster);
      });

      context('and there is no certification ID given', () => {

        it('should save the session without linking it to any certification center', async () => {
          // given
          sessionToSave.certificationCenterId = null;
          saveSessionStub.withArgs(sessionToSave).resolves();
          saveSessionStub.withArgs(sessionAugmentedWithName).rejects();

          // when
          await sessionService.save({ userId, session: sessionToSave });

          // then
          expect(sessionRepository.save).to.have.been.calledWithExactly(sessionToSave);
        });

        it('should return the saved session', async () => {
          // given
          sessionToSave.certificationCenterId = null;
          saveSessionStub.withArgs(sessionToSave).resolves(expectedSavedSession);

          // when
          const savedSession = await sessionService.save({ userId, session: sessionToSave });

          // then
          expect(savedSession).to.deep.equal(expectedSavedSession);
        });

      });

      context('and the certification ID is given', () => {

        it('should save the session after adding the certification to it', async () => {
          // given
          getCertificationCenterStub.resolves(certificationCenter);
          saveSessionStub.withArgs(sessionToSave).rejects();
          saveSessionStub.withArgs(sessionAugmentedWithName).resolves();

          // when
          await sessionService.save({ userId, session: sessionToSave });

          // then
          expect(saveSessionStub).to.have.been.calledWithExactly(sessionAugmentedWithName);
        });

      });

    });

    context('when the user is not PIX MASTER', () => {

      beforeEach(() => {
        const userPixMember = domainBuilder.buildUser({ pixRoles: [domainBuilder.buildPixRole({ name: 'PIX_MEMBER' })] });
        getUserStub.withArgs(userId).resolves(userPixMember);
      });

      it('should save the new session, filled up with the name of the certification', async () => {
        // given
        getCertificationCenterStub.withArgs(certificationCenterId).resolves(certificationCenter);
        saveSessionStub.resolves();

        // when
        await sessionService.save({ userId, session: sessionToSave });

        // then
        expect(sessionRepository.save).to.have.been.calledWithExactly(sessionAugmentedWithName);
      });

      it('should return the saved session', async () => {
        // given
        getCertificationCenterStub.resolves(certificationCenter);
        saveSessionStub.withArgs(sessionAugmentedWithName).resolves(expectedSavedSession);

        // when
        const savedSession = await sessionService.save({ userId, session: sessionToSave });

        // then
        expect(savedSession).to.deep.equal(expectedSavedSession);
      });

      it('should forward the error if an error occurs while retrieveing the certification center', () => {
        // given
        getCertificationCenterStub.withArgs(certificationCenterId).rejects(testErr);

        // when
        const promise = sessionService.save({ userId, session: sessionToSave });

        // then
        return promise.catch((err) => {
          expect(err).to.deep.equal(testErr);
        });
      });

      it('should forward the error if an error occurs while saving the session', () => {
        // given
        getCertificationCenterStub.resolves(certificationCenter);
        saveSessionStub.withArgs(sessionAugmentedWithName).rejects(testErr);

        // when
        const promise = sessionService.save({ userId, session: sessionToSave });

        // then
        return promise.catch((err) => {
          expect(err).to.deep.equal(testErr);
        });
      });

      it('should forward the error if an error occurs while retrieving the user', () => {
        // given
        getUserStub.withArgs(userId).rejects(testErr);

        // when
        const promise = sessionService.save({ userId, session: sessionToSave });

        // then
        return promise.catch((err) => {
          expect(err).to.deep.equal(testErr);
        });
      });

    });

  });

});
