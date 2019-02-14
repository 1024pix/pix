const { expect, sinon } = require('../../../test-helper');
const updateSession = require('../../../../lib/domain/usecases/update-session');
const sessionValidator= require('../../../../lib/domain/validators/session-validator');
const { UserNotAuthorizedToUpdateRessourceError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | update-session', () => {
  let originalSession;
  let userWithCertificationCenterMemberships;
  let sessionRepository;
  let userRepository;

  const certificationCenterId = 1;

  beforeEach(() => {
    originalSession = {
      id: 1,
      certificationCenter: 'Université de gastronomie Paul',
      certificationCenterId: certificationCenterId,
      address: 'Lyon',
      room: '28D',
      examiner: 'Joel R',
      date: '2017-12-08',
      time: '14:30',
      description: 'miam',
      accessCode: 'ABCD12'
    };
    userWithCertificationCenterMemberships = {
      id: 1,
      certificationCenterMemberships: [{ certificationCenter: { id: certificationCenterId } }],
      hasAccessToCertificationCenter: sinon.stub(),
    };
    userRepository = { getWithCertificationCenterMemberships: sinon.stub() };
    sessionRepository = {
      get: sinon.stub(),
      update: sinon.stub()
    };
    sinon.stub(sessionValidator, 'validate');

    sessionRepository.get.withArgs(originalSession.id).resolves(originalSession);
    sessionRepository.update.callsFake((updatedSession) => updatedSession);
    sessionValidator.validate.withArgs(originalSession).returns();
    userRepository.getWithCertificationCenterMemberships.withArgs(userWithCertificationCenterMemberships.id).resolves(userWithCertificationCenterMemberships);
    userWithCertificationCenterMemberships.hasAccessToCertificationCenter.withArgs(certificationCenterId).returns(true);
  });

  context('when session exists', () => {
    it('should update the session address only', () => {
      // given
      const updatedSession = {
        id: 1,
        certificationCenter: 'Université de gastronomie Paul',
        certificationCenterId: certificationCenterId,
        address: 'NEW ADDRESS',
        room: '28D',
        examiner: 'Joel R',
        date: '2017-12-08',
        time: '14:30',
        description: 'miam',
        accessCode: 'ABCD12'
      };

      // when
      const promise = updateSession({
        userId: userWithCertificationCenterMemberships.id,
        session: updatedSession,
        userRepository,
        sessionRepository: sessionRepository,
      });

      // then
      return promise.then((resultSession) => {
        expect(sessionRepository.update).to.have.been.calledWithExactly(updatedSession);
        expect(resultSession.address).to.equal(updatedSession.address);
      });
    });

    it('should update the session address and examiner only', () => {
      // given
      const updatedSession = {
        id: 1,
        certificationCenter: 'Université de gastronomie Paul',
        certificationCenterId: certificationCenterId,
        address: 'NEW ADRESS',
        room: '28D',
        examiner: 'NEW EXAMINER',
        date: '2017-12-08',
        time: '14:30',
        description: 'miam',
        accessCode: 'ABCD12'
      };

      // when
      const promise = updateSession({
        userId: userWithCertificationCenterMemberships.id,
        session: updatedSession,
        userRepository,
        sessionRepository: sessionRepository,
      });

      // then
      return promise.then((resultSession) => {
        expect(sessionRepository.update).to.have.been.calledWithExactly(updatedSession);
        expect(resultSession.address).to.equal(updatedSession.address);
      });
    });
  });

  context('when an error occurred', () => {
    it('should throw an error when the session could not be retrieved', () => {
      // given
      sessionRepository.get.withArgs(originalSession.id).rejects();

      // when
      const promise = updateSession({
        userId: userWithCertificationCenterMemberships.id,
        session: originalSession,
        userRepository,
        sessionRepository: sessionRepository,
      });

      // then
      return expect(promise).to.be.rejected;
    });

    it('should throw an error when the payload is invalid', () => {
      // given
      sessionValidator.validate.withArgs(originalSession).throws();

      // when
      const promise = updateSession({
        userId: userWithCertificationCenterMemberships.id,
        session: originalSession,
        userRepository,
        sessionRepository: sessionRepository,
      });

      // then
      return expect(promise).to.be.rejected;
    });

    it('should throw an error when the user with memberships could not be retrieved', () => {
      // given
      userRepository.getWithCertificationCenterMemberships.withArgs(userWithCertificationCenterMemberships.id).rejects();

      // when
      const promise = updateSession({
        userId: userWithCertificationCenterMemberships.id,
        session: originalSession,
        userRepository,
        sessionRepository: sessionRepository,
      });

      // then
      return expect(promise).to.be.rejected;
    });

    it('should throw an error when the user does not have an access to the session organization', () => {
      // given
      userWithCertificationCenterMemberships.hasAccessToCertificationCenter.withArgs(certificationCenterId).returns(false);

      // when
      const promise = updateSession({
        userId: userWithCertificationCenterMemberships.id,
        session: originalSession,
        userRepository,
        sessionRepository: sessionRepository,
      });

      // then
      return expect(promise).to.be.rejectedWith(UserNotAuthorizedToUpdateRessourceError);
    });

    it('should throw an error when the session could not be updated', () => {
      // given
      sessionRepository.update.withArgs(originalSession).rejects();

      // when
      const promise = updateSession({
        userId: userWithCertificationCenterMemberships.id,
        session: originalSession,
        userRepository,
        sessionRepository: sessionRepository,
      });

      // then
      return expect(promise).to.be.rejected;
    });
  });
});
