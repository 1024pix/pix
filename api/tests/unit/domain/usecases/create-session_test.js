const { expect, sinon, domainBuilder, testErr } = require('../../../test-helper');

const createSession = require('../../../../lib/domain/usecases/create-session');
const sessionValidator= require('../../../../lib/domain/validators/session-validator');
const Session = require('../../../../lib/domain/models/Session');
const { ForbiddenAccess } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | create-session', () => {

  describe('#save', () => {

    let certificationCenter, certificationCenterId, certificationCenterName, expectedSavedSession, sessionAugmentedWithName,
      sessionId, sessionToSave, userId;

    const certificationCenterRepository = {}, sessionRepository = {}, userRepository = {};

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

      certificationCenterRepository.get = sinon.stub();
      sessionRepository.save = sinon.stub();
      sessionValidator.validate = sinon.stub();
      userRepository.get = sinon.stub();
      userRepository.getWithCertificationCenterMemberships = sinon.stub();
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

        beforeEach(() => {
          const userPixMaster = domainBuilder.buildUser({ pixRoles: [domainBuilder.buildPixRole({ name: 'PIX_MASTER' })] });
          userRepository.get.withArgs(userId).resolves(userPixMaster);
        });

        context('and there is no certification ID given', () => {

          it('should save the session without overriding the name of the certification center in the session', async () => {
            // given
            sessionToSave.certificationCenterId = null;
            sessionRepository.save.withArgs(sessionToSave).resolves();
            sessionRepository.save.withArgs(sessionAugmentedWithName).rejects();

            // when
            await createSession({ userId, session: sessionToSave, certificationCenterRepository, sessionRepository, userRepository });

            // then
            expect(sessionRepository.save).to.have.been.calledWithExactly(sessionToSave);
          });

          it('should return the saved session', async () => {
            // given
            sessionToSave.certificationCenterId = null;
            sessionRepository.save.withArgs(sessionToSave).resolves(expectedSavedSession);

            // when
            const savedSession = await createSession({ userId, session: sessionToSave, certificationCenterRepository, sessionRepository, userRepository });

            // then
            expect(savedSession).to.deep.equal(expectedSavedSession);
          });

        });

        context('and the certification ID is given', () => {

          it('should override the certification center name in the session in order to avoid inconsistencies, and save the session', async () => {
            // given
            certificationCenterRepository.get.resolves(certificationCenter);
            sessionRepository.save.withArgs(sessionToSave).rejects();
            sessionRepository.save.withArgs(sessionAugmentedWithName).resolves();

            // when
            await createSession({ userId, session: sessionToSave, certificationCenterRepository, sessionRepository, userRepository });

            // then
            expect(sessionRepository.save).to.have.been.calledWithExactly(sessionAugmentedWithName);
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

          it('should add the certif center name to the session in order not to break pixAdmin' +
            'and user certifications details, and save the new session', async () => {
            // given
            certificationCenterRepository.get.withArgs(certificationCenterId).resolves(certificationCenter);
            sessionRepository.save.resolves();

            // when
            await createSession({ userId, session: sessionToSave, certificationCenterRepository, sessionRepository, userRepository });

            // then
            expect(sessionRepository.save).to.have.been.calledWithExactly(sessionAugmentedWithName);
          });

          it('should return the saved session', async () => {
            // given
            certificationCenterRepository.get.resolves(certificationCenter);
            sessionRepository.save.withArgs(sessionAugmentedWithName).resolves(expectedSavedSession);

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
            sessionRepository.save.withArgs(sessionAugmentedWithName).rejects(testErr);

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
