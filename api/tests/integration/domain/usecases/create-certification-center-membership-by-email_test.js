import { catchErr, databaseBuilder, expect, knex } from '../../../test-helper.js';
import { UserNotFoundError, AlreadyExistingEntityError } from '../../../../lib/domain/errors.js';
import { CertificationCenterMembership } from '../../../../lib/domain/models/CertificationCenterMembership.js';

import * as certificationCenterMembershipRepository from '../../../../lib/infrastructure/repositories/certification-center-membership-repository.js';
import * as userRepository from '../../../../src/shared/infrastructure/repositories/user-repository.js';

import { createCertificationCenterMembershipByEmail } from '../../../../lib/domain/usecases/create-certification-center-membership-by-email.js';

describe('Integration | UseCases | create-certification-center-membership-by-email', function () {
  let certificationCenterId;
  let user;
  let email;

  it("should throw UserNotFoundError if user's email does not exist", async function () {
    // given
    email = 'notExist@example.net';

    // when
    const error = await catchErr(createCertificationCenterMembershipByEmail)({
      certificationCenterId,
      email,
      certificationCenterMembershipRepository,
      userRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(UserNotFoundError);
    expect(error.message).to.equal(`User not found for email ${email}`);
  });

  it('should throw AlreadyExistingEntityError if certification center membership exist', async function () {
    // given
    certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
    user = databaseBuilder.factory.buildUser();
    databaseBuilder.factory.buildCertificationCenterMembership({ userId: user.id, certificationCenterId });
    await databaseBuilder.commit();

    // when
    const error = await catchErr(createCertificationCenterMembershipByEmail)({
      certificationCenterId,
      email: user.email,
      certificationCenterMembershipRepository,
      userRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(AlreadyExistingEntityError);
  });

  it('should create and return certification center membership ', async function () {
    // given
    certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
    user = databaseBuilder.factory.buildUser();
    await databaseBuilder.commit();

    // when
    const certificationCenterMembership = await createCertificationCenterMembershipByEmail({
      certificationCenterId,
      email: user.email,
      certificationCenterMembershipRepository,
      userRepository,
    });

    // then
    expect(certificationCenterMembership).to.be.an.instanceOf(CertificationCenterMembership);
    expect(certificationCenterMembership.certificationCenter.id).to.equal(certificationCenterId);
    expect(certificationCenterMembership.user.id).to.equal(user.id);

    const certificationCenterMembershipDB = await knex('certification-center-memberships')
      .where({ id: certificationCenterMembership.id })
      .first();
    expect(certificationCenterMembershipDB).to.exist;
  });
});
