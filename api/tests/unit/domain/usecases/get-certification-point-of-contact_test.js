const _ = require('lodash');
const { expect, sinon, catchErr } = require('../../../test-helper');
const getCertificationPointOfContact = require('../../../../lib/domain/usecases/get-certification-point-of-contact');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-certification-point-of-contact', function() {

  const certificationCenterMembershipRepository = { doesUserHaveMembershipToAnyCertificationCenter: _.noop() };
  const certificationPointOfContactRepository = { get: _.noop() };
  const userId = 123;

  beforeEach(function() {
    certificationCenterMembershipRepository.doesUserHaveMembershipToAnyCertificationCenter = sinon.stub();
    certificationPointOfContactRepository.get = sinon.stub();
  });

  it('should throw NotFoundError when user is not member of any certification center', async function() {
    // given
    certificationCenterMembershipRepository.doesUserHaveMembershipToAnyCertificationCenter
      .withArgs(userId)
      .resolves(false);

    // when
    const error = await catchErr(getCertificationPointOfContact)({
      userId,
      certificationCenterMembershipRepository,
      certificationPointOfContactRepository,
    });

    // then
    expect(error).to.be.instanceOf(NotFoundError);
  });

  it('should return the CertificationPointOfContact when user is member of a certification center', async function() {
    // given
    const expectedCertificationPointOfContact = Symbol('somePointOfContact');
    certificationCenterMembershipRepository.doesUserHaveMembershipToAnyCertificationCenter
      .withArgs(userId)
      .resolves(true);
    certificationPointOfContactRepository.get.withArgs(userId).resolves(expectedCertificationPointOfContact);

    // when
    const actualCertificationPointOfContact = await getCertificationPointOfContact({
      userId,
      certificationCenterMembershipRepository,
      certificationPointOfContactRepository,
    });

    // then
    expect(actualCertificationPointOfContact).to.deep.equal(expectedCertificationPointOfContact);
  });

});
