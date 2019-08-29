const { expect, sinon } = require('../../../test-helper');
const getUserCertificationCenterMemberships = require('../../../../lib/domain/usecases/get-user-certification-center-memberships');
const CertificationCenterMembership = require('../../../../lib/domain/models/CertificationCenterMembership');

describe('Unit | UseCase | get-user-certification-center-memberships', () => {

  let userId;
  const certificationCenterMembershipRepository = { findByUserId: () => undefined };

  beforeEach(() => {
    sinon.stub(certificationCenterMembershipRepository, 'findByUserId');
  });

  it('should use find all certification centers memberships', () => {
    // given
    userId = 1;
    certificationCenterMembershipRepository.findByUserId.resolves([]);

    // when
    const promise = getUserCertificationCenterMemberships({
      userId,
      certificationCenterMembershipRepository,
    });

    // then
    return promise.then(() => {
      expect(certificationCenterMembershipRepository.findByUserId).to.have.been.calledWith(userId);
    });
  });

  it('should return user with the certification center memberships', () => {
    // given
    const foundCertificationCenterMemberships = [new CertificationCenterMembership({ id: 'Le premier accès de l\'utilisateur' })];
    certificationCenterMembershipRepository.findByUserId.resolves(foundCertificationCenterMemberships);

    // when
    const promise = getUserCertificationCenterMemberships({
      userId,
      certificationCenterMembershipRepository,
    });

    // then
    return promise.then((foundCertificationCenterMemberships) => {
      expect(foundCertificationCenterMemberships[0].id).to.deep.equal('Le premier accès de l\'utilisateur');
    });
  });

});
