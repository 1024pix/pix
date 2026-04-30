import sinon from 'sinon';

import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../../src/identity-access-management/domain/constants/identity-providers.js';
import { User } from '../../../../../src/identity-access-management/domain/models/User.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { UnauthorizedError } from '../../../../../src/shared/application/errors/http-errors.js';
import { AlreadyRegisteredEmailError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

describe('Integration | Identity Access Management | Domain | UseCase | upgradeToRealUser', function () {
  let clock;

  beforeEach(function () {
    const now = new Date('2024-12-25');
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  it('upgrades an anonymous user to a real user', async function () {
    // given
    const anonymousUser = databaseBuilder.factory.buildUser.anonymous();
    await databaseBuilder.commit();

    const password = 'P@ssW0rd';
    const locale = 'fr';
    const userAttributes = {
      firstName: 'First',
      lastName: 'Last',
      email: 'first.last@example.net',
      cgu: true,
      locale: 'fr-FR',
    };

    // when
    const realUser = await usecases.upgradeToRealUser({
      userId: anonymousUser.id,
      userAttributes,
      password,
      locale,
    });

    // then
    expect(realUser).to.be.instanceOf(User);
    expect(realUser).to.include(userAttributes);
    expect(realUser.isAnonymous).to.be.false;
    expect(realUser.lastTermsOfServiceValidatedAt).to.be.instanceOf(Date);
    expect(realUser.mustValidateTermsOfService).to.be.false;

    const authenticationMethod = await knex('authentication-methods').where({ userId: realUser.id }).first();
    expect(authenticationMethod.identityProvider).to.equal(NON_OIDC_IDENTITY_PROVIDERS.PIX.code);

    await expect('SendEmailJob').to.have.been.performed.withJobsCount(1);
  });

  context('when the user is not anonymous', function () {
    it('throws an UnauthorizedError', async function () {
      // given
      const realUser = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();

      // when
      const promise = usecases.upgradeToRealUser({
        userId: realUser.id,
        userAttributes: {
          firstName: 'First',
          lastName: 'Last',
          email: 'first.last@example.net',
          cgu: true,
          locale: 'fr-FR',
        },
        password: 'P@ssW0rd',
        locale: 'fr',
      });

      // then
      await expect(promise).to.be.rejectedWith(UnauthorizedError, 'User must be anonymous');
    });
  });

  context('when the email already exists', function () {
    it('throws an AlreadyRegisteredEmailError', async function () {
      // given
      const existingEmail = 'first.last@example.net';
      databaseBuilder.factory.buildUser({ email: existingEmail });
      const anonymousUser = databaseBuilder.factory.buildUser.anonymous();
      await databaseBuilder.commit();

      // when
      const promise = usecases.upgradeToRealUser({
        userId: anonymousUser.id,
        userAttributes: {
          firstName: 'First',
          lastName: 'Last',
          email: existingEmail,
          cgu: true,
          locale: 'fr-FR',
        },
        password: 'P@ssW0rd',
        locale: 'fr',
      });

      // then
      await expect(promise).to.be.rejectedWith(AlreadyRegisteredEmailError);
    });
  });
});
