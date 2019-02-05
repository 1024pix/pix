const { expect, sinon } = require('../../../test-helper');
const updateSession = require('../../../../lib/domain/usecases/update-session');
const { UserNotAuthorizedToUpdateRessourceError } = require('../../../../lib/domain/errors');

describe.only('Unit | UseCase | update-session', () => {
  let originalSession;
  let userWithMembership;
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
    userWithMembership = {
      id: 1,
      memberships: [{ organization: { id: certificationCenterId } }],
      hasAccessToCertificationCenter: sinon.stub(),
    };
    userRepository = { getWithMemberships: sinon.stub() };
    sessionRepository = {
      get: sinon.stub(),
      update: sinon.stub()
    };
    // This has to be done separated from the stub declaration, see :
    // http://nikas.praninskas.com/javascript/2015/07/28/quickie-sinon-withargs-not-working/
    sessionRepository.get.withArgs(originalSession.id).resolves(originalSession);
    sessionRepository.update.callsFake((updatedSession) => updatedSession);
    userRepository.getWithMemberships.withArgs(userWithMembership.id).resolves(userWithMembership);
    userWithMembership.hasAccessToCertificationCenter.withArgs(certificationCenterId).returns(true);
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
        userId: userWithMembership.id,
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
        userId: userWithMembership.id,
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
        userId: userWithMembership.id,
        session: originalSession,
        userRepository,
        sessionRepository: sessionRepository,
      });

      // then
      return expect(promise).to.be.rejected;
    });

    it('should throw an error when the user with memberships could not be retrieved', () => {
      // given
      userRepository.getWithMemberships.withArgs(userWithMembership.id).rejects();

      // when
      const promise = updateSession({
        userId: userWithMembership.id,
        session: originalSession,
        userRepository,
        sessionRepository: sessionRepository,
      });

      // then
      return expect(promise).to.be.rejected;
    });

    it('should throw an error when the user does not have an access to the session organization', () => {
      // given
      userWithMembership.hasAccessToCertificationCenter.withArgs(certificationCenterId).returns(false);

      // when
      const promise = updateSession({
        userId: userWithMembership.id,
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
        userId: userWithMembership.id,
        session: originalSession,
        userRepository,
        sessionRepository: sessionRepository,
      });

      // then
      return expect(promise).to.be.rejected;
    });
  });
});
