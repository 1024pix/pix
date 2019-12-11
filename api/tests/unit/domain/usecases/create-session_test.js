const { expect, sinon, domainBuilder, testErr } = require('../../../test-helper');

const createSession = require('../../../../lib/domain/usecases/create-session');
const sessionCodeService = require('../../../../lib/domain/services/session-code-service');
const sessionValidator = require('../../../../lib/domain/validators/session-validator');
const Session = require('../../../../lib/domain/models/Session');
const { ForbiddenAccess } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | create-session', () => {

  describe('#save', () => {

    let certificationCenter, certificationCenterId, certificationCenterName, expectedSavedSession, sessionWithCodeAndName,
      sessionAccessCode, sessionId, sessionToSave, userId;

    let certificationCenterRepository, sessionRepository, userRepository;

    beforeEach(() => {
      userId = 473820;
      sessionAccessCode = 'SHC542';
      sessionId = 'PIX666';
      certificationCenterId = '5';
      certificationCenterName = 'Pass Ta Certif';

      certificationCenter = domainBuilder.buildCertificationCenter({ id: certificationCenterId, name: certificationCenterName });
      sessionToSave = domainBuilder.buildSession({ id: sessionId, certificationCenterId, certificationCenter: null, accessCode: null });
      expectedSavedSession = domainBuilder.buildSession();

      sessionWithCodeAndName = new Session({ ...sessionToSave });
      sessionWithCodeAndName.certificationCenter = certificationCenterName;
      sessionWithCodeAndName.accessCode = sessionAccessCode;

      certificationCenterRepository = { get: sinon.stub() };
      sessionRepository = { save: sinon.stub() };
      userRepository = { get: sinon.stub(), getWithCertificationCenterMemberships: sinon.stub() };
      sinon.stub(sessionValidator, 'validate');
      sinon.stub(sessionCodeService, 'getNewSessionCode');
    });

    it('should forward the error if the session is not valid', () => {
      // given
      sessionValidator.validate.withArgs(sessionToSave).throws();

      // when
      const promise = createSession({ userId, session: sessionToSave, certificationCenterRepository, sessionRepository, userRepository });

      // then
      return expect(promise).to.be.rejected;
    });

    context('when the session is valid', () => {

      beforeEach(() => {
        sessionValidator.validate.withArgs(sessionToSave).returns();
        sessionCodeService.getNewSessionCode.resolves(sessionAccessCode);
      });

      it('should forward the error if an error occurs while retrieving the user', () => {
        // given
        userRepository.get.withArgs(userId).rejects(testErr);

        // when
        const promise = createSession({ userId, session: sessionToSave, certificationCenterRepository, sessionRepository, userRepository });

        // then
        return promise.catch((err) => {
          expect(err).to.deep.equal(testErr);
        });
      });

      context('and the user is PIX MASTER', () => {
        let sessionWithCode;

        beforeEach(() => {
          const userPixMaster = domainBuilder.buildUser({ pixRoles: [domainBuilder.buildPixRole({ name: 'PIX_MASTER' })] });
          userRepository.get.withArgs(userId).resolves(userPixMaster);
          sessionWithCode = new Session({
            ...sessionToSave,
            accessCode: sessionAccessCode,
          });
        });

        context('and there is no certification ID given', () => {

          beforeEach(() => {
            sessionToSave.certificationCenterId = null;
            sessionWithCode.certificationCenterId = null;
          });

          it('should save the session without overriding the name of the certification center in the session', async () => {
            // when
            await createSession({ userId, session: sessionToSave, certificationCenterRepository, sessionRepository, userRepository });

            // then
            expect(sessionRepository.save).to.have.been.calledWithExactly(sessionWithCode);
          });

          it('should return the saved session', async () => {
            // given
            sessionRepository.save.withArgs(sessionWithCode).resolves(expectedSavedSession);

            // when
            const savedSession = await createSession({ userId, session: sessionToSave, certificationCenterRepository, sessionRepository, userRepository });

            // then
            expect(savedSession).to.deep.equal(expectedSavedSession);
          });

        });

        context('and the certification ID is given', () => {

          it('should add an accessCode and override the certification center name in the session in order to avoid inconsistencies, and save the session', async () => {
            // given
            certificationCenterRepository.get.resolves(certificationCenter);

            // when
            await createSession({ userId, session: sessionToSave, certificationCenterRepository, sessionRepository, userRepository });

            // then
            expect(sessionRepository.save).to.have.been.calledWithExactly(sessionWithCodeAndName);
          });

        });

      });

      context('and the user is not PIX MASTER', () => {

        beforeEach(() => {
          const userPixMember = domainBuilder.buildUser({ pixRoles: [domainBuilder.buildPixRole({ name: 'PIX_MEMBER' })] });
          userRepository.get.withArgs(userId).resolves(userPixMember);
        });

        context('and the user has not access to the sessions certification center', () => {

          it('should throw an error', () => {
            // given
            const userWithNoCertifCenterMemberships = domainBuilder.buildUser({ certificationCenterMemberships: [] });

            userRepository.getWithCertificationCenterMemberships.withArgs(userId).resolves(userWithNoCertifCenterMemberships);

            // when
            const promise = createSession({ userId, session: sessionToSave, certificationCenterRepository, sessionRepository, userRepository });

            // then
            return expect(promise).to.have.been.rejectedWith(ForbiddenAccess);
          });

        });

        context('and the user has access to the sessions certification center', () => {

          beforeEach(() => {
            const userWithMembershipToCertificationCenter = domainBuilder.buildUser({
              certificationCenterMemberships: [{ certificationCenter: { id: certificationCenterId } }]
            });
            userRepository.getWithCertificationCenterMemberships.withArgs(userId).resolves(userWithMembershipToCertificationCenter);
          });

          it('should add an accessCode and add the certif center name to the session in order not to break pixAdmin' +
            'and user certifications details, and save the new session', async () => {
            // given
            certificationCenterRepository.get.withArgs(certificationCenterId).resolves(certificationCenter);
            sessionRepository.save.resolves();

            // when
            await createSession({ userId, session: sessionToSave, certificationCenterRepository, sessionRepository, userRepository });

            // then
            expect(sessionRepository.save).to.have.been.calledWithExactly(sessionWithCodeAndName);
          });

          it('should return the saved session', async () => {
            // given
            certificationCenterRepository.get.resolves(certificationCenter);
            sessionRepository.save.withArgs(sessionWithCodeAndName).resolves(expectedSavedSession);

            // when
            const savedSession = await createSession({ userId, session: sessionToSave, certificationCenterRepository, sessionRepository, userRepository });

            // then
            expect(savedSession).to.deep.equal(expectedSavedSession);
          });

          it('should forward the error if an error occurs while retrieveing the certification center', () => {
            // given
            certificationCenterRepository.get.withArgs(certificationCenterId).rejects(testErr);

            // when
            const promise = createSession({ userId, session: sessionToSave, certificationCenterRepository, sessionRepository, userRepository });

            // then
            return promise.catch((err) => {
              expect(err).to.deep.equal(testErr);
            });
          });

          it('should forward the error if an error occurs while saving the session', () => {
            // given
            certificationCenterRepository.get.resolves(certificationCenter);
            sessionRepository.save.withArgs(sessionWithCodeAndName).rejects(testErr);

            // when
            const promise = createSession({ userId, session: sessionToSave, certificationCenterRepository, sessionRepository, userRepository });

            // then
            return promise.catch((err) => {
              expect(err).to.deep.equal(testErr);
            });
          });

        });

      });

    });

  });

});
