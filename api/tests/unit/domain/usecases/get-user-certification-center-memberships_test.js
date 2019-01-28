const { expect, sinon } = require('../../../test-helper');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const getUserCertificationCenterMemberships = require('../../../../lib/domain/usecases/get-user-certification-center-memberships');
const CertificationCenterMembership = require('../../../../lib/domain/models/CertificationCenterMembership');

describe('Unit | UseCase | get-user-certification-center-memberships', () => {

  let authenticatedUserId;
  let requestedUserId;
  const certificationCenterMembershipRepository = { findByUserId: () => undefined };

  it('should reject a NotAuthorized error if authenticated user ask for another user certification center accesses', () => {
    // given
    authenticatedUserId = 1;
    requestedUserId = 2;

    // when
    const promise = getUserCertificationCenterMemberships({ authenticatedUserId, requestedUserId, certificationCenterMembershipRepository });

    // then
    return promise.catch((err) => {
      expect(err).to.be.an.instanceOf(UserNotAuthorizedToAccessEntity);
    });
  });

  context('When authenticated User is authorized to retrieve his accesses', () => {

    beforeEach(() => {
      sinon.stub(certificationCenterMembershipRepository, 'findByUserId');
    });

    it('should use find all certification centers user accesses', () => {
      // given
      authenticatedUserId = 1;
      requestedUserId = 1;
      certificationCenterMembershipRepository.findByUserId.resolves([]);

      // when
      const promise = getUserCertificationCenterMemberships({
        authenticatedUserId,
        requestedUserId,
        certificationCenterMembershipRepository,
      });

      // then
      return promise.then(() => {
        expect(certificationCenterMembershipRepository.findByUserId).to.have.been.calledWith(requestedUserId);
      });
    });

    it('should return user with the certification center memberships', () => {
      // given
      const foundCertificationCenterMemberships = [new CertificationCenterMembership({ id: 'Le premier accès de l\'utilisateur' })];
      certificationCenterMembershipRepository.findByUserId.resolves(foundCertificationCenterMemberships);

      // when
      const promise = getUserCertificationCenterMemberships({
        authenticatedUserId,
        requestedUserId,
        certificationCenterMembershipRepository,
      });

      // then
      return promise.then((foundCertificationCenterMemberships) => {
        expect(foundCertificationCenterMemberships[0].id).to.deep.equal('Le premier accès de l\'utilisateur');
      });
    });
  });
});
