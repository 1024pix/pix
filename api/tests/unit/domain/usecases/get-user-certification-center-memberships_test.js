const { expect, sinon, domainBuilder } = require('../../../test-helper');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const getUserCertificationCenterMemberships = require('../../../../lib/domain/usecases/get-user-certification-center-memberships');
const CertificationCenterMembership = require('../../../../lib/domain/models/CertificationCenterMembership');

describe('Unit | UseCase | get-user-certification-center-memberships', () => {

  let authenticatedUserId;
  let requestedUserId;
  const userRepository = { getWithCertificationCenterMemberships: () => undefined };

  it('should reject a NotAuthorized error if authenticated user ask for another user certification center accesses', () => {
    // given
    authenticatedUserId = 1;
    requestedUserId = 2;

    // when
    const promise = getUserCertificationCenterMemberships({ authenticatedUserId, requestedUserId, userRepository });

    // then
    return promise.catch((err) => {
      expect(err).to.be.an.instanceOf(UserNotAuthorizedToAccessEntity);
    });
  });

  context('When authenticated User is authorized to retrieve his accesses', () => {

    beforeEach(() => {
      sinon.stub(userRepository, 'getWithCertificationCenterMemberships');
    });

    it('should use find all certification centers user accesses', () => {
      // given
      authenticatedUserId = 1;
      requestedUserId = 1;
      const foundUser = domainBuilder.buildUser();
      userRepository.getWithCertificationCenterMemberships.resolves(foundUser);

      // when
      const promise = getUserCertificationCenterMemberships({
        authenticatedUserId,
        requestedUserId,
        userRepository,
      });

      // then
      return promise.then(() => {
        expect(userRepository.getWithCertificationCenterMemberships).to.have.been.calledWith(requestedUserId);
      });
    });

    it('should return user with the certification center memberships', () => {
      // given
      const foundUser = domainBuilder.buildUser({
        certificationCenterMemberships: [new CertificationCenterMembership({ id: 'Le premier accès de l\'utilisateur' })],
      });
      userRepository.getWithCertificationCenterMemberships.resolves(foundUser);

      // when
      const promise = getUserCertificationCenterMemberships({
        authenticatedUserId,
        requestedUserId,
        userRepository,
      });

      // then
      return promise.then((foundCertificationCenterMemberships) => {
        expect(foundCertificationCenterMemberships[0].id).to.deep.equal('Le premier accès de l\'utilisateur');
      });
    });
  });
});
