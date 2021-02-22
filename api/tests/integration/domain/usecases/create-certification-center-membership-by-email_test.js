const {
  catchErr,
  databaseBuilder,
  expect,
  knex,
} = require('../../../test-helper');

const { UserNotFoundError, AlreadyExistingEntityError } = require('../../../../lib/domain/errors');

const CertificationCenterMembership = require('../../../../lib/domain/models/CertificationCenterMembership');

const certificationCenterMembershipRepository = require('../../../../lib/infrastructure/repositories/certification-center-membership-repository');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

const createCertificationCenterMembershipByEmail = require('../../../../lib/domain/usecases/create-certification-center-membership-by-email');

describe('Integration | UseCases | create-certification-center-membership-by-email', () => {

  let certificationCenterId;
  let user;
  let email;

  afterEach(async() => {
    await knex('certification-center-memberships').delete();
  });

  it('should throw UserNotFoundError if user\'s email does not exist', async () => {
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

  it('should throw AlreadyExistingEntityError if certification center membership exist', async () => {
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

  it('should create and return certification center membership ', async () => {
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

    const certificationCenterMembershipDB = await knex('certification-center-memberships').where({ id: certificationCenterMembership.id }).first();
    expect(certificationCenterMembershipDB).to.exist;
  });
});
