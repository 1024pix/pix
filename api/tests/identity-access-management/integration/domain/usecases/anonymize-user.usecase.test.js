import { UserAnonymized } from '../../../../../lib/domain/events/UserAnonymized.js';
import { anonymizeUser } from '../../../../../lib/domain/usecases/anonymize-user.js';
import * as certificationCenterMembershipRepository from '../../../../../lib/infrastructure/repositories/certification-center-membership-repository.js';
import * as membershipRepository from '../../../../../lib/infrastructure/repositories/membership-repository.js';
import * as organizationLearnerRepository from '../../../../../lib/infrastructure/repositories/organization-learner-repository.js';
import { refreshTokenService } from '../../../../../src/identity-access-management/domain/services/refresh-token-service.js';
import * as authenticationMethodRepository from '../../../../../src/identity-access-management/infrastructure/repositories/authentication-method.repository.js';
import { resetPasswordDemandRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/reset-password-demand.repository.js';
import * as userRepository from '../../../../../src/identity-access-management/infrastructure/repositories/user.repository.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import { adminMemberRepository } from '../../../../../src/shared/infrastructure/repositories/admin-member.repository.js';
import * as userLoginRepository from '../../../../../src/shared/infrastructure/repositories/user-login-repository.js';
import { databaseBuilder, expect, knex, sinon } from '../../../../test-helper.js';

describe('Integration | Identity Access Management | Domain | UseCase | anonymize-user', function () {
  let clock;
  const now = new Date('2003-04-05T03:04:05Z');

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  it('anonymizes', async function () {
    // given
    const admin = databaseBuilder.factory.buildUser.withRole();
    const updatedByUserId = admin.id;

    const createdAt = new Date('2012-12-12T12:12:12Z');
    const updatedAt = new Date('2023-03-23T23:23:23Z');
    const user = databaseBuilder.factory.buildUser({ createdAt, updatedAt });
    const userId = user.id;
    const userLoginCreatedAt = new Date('2014-01-17T17:17:17Z');
    const userLoginUpdatedAt = new Date('2023-03-23T09:44:30Z');
    const lastLoggedAt = new Date('2023-03-23T09:44:30Z');
    const userLogin = databaseBuilder.factory.buildUserLogin({
      userId,
      createdAt: userLoginCreatedAt,
      updatedAt: userLoginUpdatedAt,
      lastLoggedAt,
    });
    await databaseBuilder.commit();

    const expectedUserAnonymizedEvent = new UserAnonymized({
      userId,
      updatedByUserId: admin.id,
      role: 'SUPER_ADMIN',
    });

    // when
    let result;
    await DomainTransaction.execute(async (domainTransaction) => {
      result = await anonymizeUser({
        updatedByUserId,
        userId,
        userRepository,
        userLoginRepository,
        authenticationMethodRepository,
        refreshTokenService,
        membershipRepository,
        certificationCenterMembershipRepository,
        organizationLearnerRepository,
        resetPasswordDemandRepository,
        domainTransaction,
        adminMemberRepository,
      });
    });

    // then
    expect(result).to.be.deep.equal(expectedUserAnonymizedEvent);

    const anonymizedUser = await knex('users').where({ id: user.id }).first();
    expect(anonymizedUser.firstName).to.equal('(anonymised)');
    expect(anonymizedUser.lastName).to.equal('(anonymised)');
    expect(anonymizedUser.hasBeenAnonymisedBy).to.equal(admin.id);
    expect(anonymizedUser.createdAt.toISOString()).to.equal('2012-12-01T00:00:00.000Z');
    expect(anonymizedUser.updatedAt.toISOString()).to.equal('2023-03-01T00:00:00.000Z');

    const anonymizedUserLogin = await knex('user-logins').where({ id: userLogin.id }).first();
    expect(anonymizedUserLogin.temporaryBlockedUntil).to.be.null;
    expect(anonymizedUserLogin.blockedAt).to.be.null;
    expect(anonymizedUserLogin.createdAt.toISOString()).to.equal('2014-01-01T00:00:00.000Z');
    expect(anonymizedUserLogin.updatedAt.toISOString()).to.equal('2023-03-01T00:00:00.000Z');
    expect(anonymizedUserLogin.lastLoggedAt.toISOString()).to.equal('2023-03-01T00:00:00.000Z');
  });
});
