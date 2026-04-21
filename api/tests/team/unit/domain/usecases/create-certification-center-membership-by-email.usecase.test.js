import sinon from 'sinon';

import { AlreadyExistingEntityError } from '../../../../../src/shared/domain/errors.js';
import { UserNotFoundError } from '../../../../../src/shared/domain/errors.js';
import { createCertificationCenterMembershipByEmail } from '../../../../../src/team/domain/usecases/create-certification-center-membership-by-email.usecase.js';

import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | create-certification-center-membership-by-email', function () {
  const certificationCenterId = 1;
  const email = 'user@exemple.net';
  const userId = 1;

  let certificationCenterMembershipRepository;
  let userRepository;

  beforeEach(function () {
    certificationCenterMembershipRepository = {
      isMemberOfCertificationCenter: sinon.stub(),
      save: sinon.stub(),
    };
    userRepository = {
      getByEmail: sinon.stub(),
    };

    certificationCenterMembershipRepository.isMemberOfCertificationCenter.resolves(false);
    certificationCenterMembershipRepository.save.resolves();
    userRepository.getByEmail.resolves({ id: userId });
  });

  it('should call repositories', async function () {
    // when
    await createCertificationCenterMembershipByEmail({
      certificationCenterId,
      email,
      certificationCenterMembershipRepository,
      userRepository,
    });

    // then
    expect(userRepository.getByEmail).has.been.calledWithExactly(email);
    expect(certificationCenterMembershipRepository.isMemberOfCertificationCenter).has.been.calledWithExactly({
      userId,
      certificationCenterId,
    });
    expect(certificationCenterMembershipRepository.save).has.been.calledWithExactly({ userId, certificationCenterId });
  });

  it('should throw UserNotFoundError if no user matches this email', async function () {
    // given
    userRepository.getByEmail.throws(new UserNotFoundError());

    // when
    const error = await catchErr(createCertificationCenterMembershipByEmail)({
      certificationCenterId,
      email,
      certificationCenterMembershipRepository,
      userRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(UserNotFoundError);
  });

  it('should throw AlreadyExistingEntityError if certification center membership exist', async function () {
    // given
    certificationCenterMembershipRepository.isMemberOfCertificationCenter.resolves(true);

    // when
    const error = await catchErr(createCertificationCenterMembershipByEmail)({
      certificationCenterId,
      email,
      certificationCenterMembershipRepository,
      userRepository,
    });

    // then
    expect(error).to.be.instanceOf(AlreadyExistingEntityError);
    expect(error.message).to.equal(
      `Certification center membership already exists for the user ID ${userId} and certification center ID ${certificationCenterId}.`,
    );
  });
});
