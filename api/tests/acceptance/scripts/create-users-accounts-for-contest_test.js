import { expect, knex, sinon } from '../../test-helper.js';
import { createUsers } from '../../../scripts/create-users-accounts-for-contest.js';

describe('Acceptance | Scripts | create-users-accounts-for-contest', function () {
  describe('#createUsers', function () {
    const now = new Date();
    let clock;

    beforeEach(async function () {
      clock = sinon.useFakeTimers({
        now,
        toFake: ['Date'],
      });
    });

    afterEach(async function () {
      clock.restore();
    });

    it('should insert users', async function () {
      // given
      const usersInRaw = [
        {
          firstName: 'Sandy',
          lastName: 'Kilo',
          email: 'sandy-kilo@example.net',
          password: 'pix123',
        },
        {
          firstName: 'Tom',
          lastName: 'Desavoie',
          email: 'tom.desavoie@example.net',
          password: 'pixou123',
        },
      ];

      // when
      await createUsers({ usersInRaw });

      // then
      const firstUserFound = await knex('users').where({ lastName: 'Kilo' }).first();
      expect(firstUserFound).to.contains({
        firstName: 'Sandy',
        lastName: 'Kilo',
        email: 'sandy-kilo@example.net',
        cgu: true,
        pixOrgaTermsOfServiceAccepted: false,
        pixCertifTermsOfServiceAccepted: false,
        hasSeenAssessmentInstructions: false,
        username: null,
        mustValidateTermsOfService: false,
        lastTermsOfServiceValidatedAt: null,
        lang: 'fr',
        hasSeenNewDashboardInfo: false,
        isAnonymous: false,
        emailConfirmedAt: null,
        hasSeenFocusedChallengeTooltip: false,
        hasSeenOtherChallengesTooltip: false,
        lastPixOrgaTermsOfServiceValidatedAt: null,
        lastPixCertifTermsOfServiceValidatedAt: null,
      });
      expect(firstUserFound.createdAt).to.deep.equal(now);
      expect(firstUserFound.updatedAt).to.deep.equal(now);

      const secondUserFound = await knex('users').where({ lastName: 'Desavoie' }).first();
      expect(secondUserFound).to.contains({
        firstName: 'Tom',
        lastName: 'Desavoie',
      });
    });

    it("should create users's authentication methods", async function () {
      // given
      const usersInRaw = [
        {
          firstName: 'Sandy',
          lastName: 'Kilo',
          email: 'sandy-kilo@example.net',
          password: 'pix123',
        },
        {
          firstName: 'Tom',
          lastName: 'Desavoie',
          email: 'tom.desavoie@example.net',
          password: 'pixou123',
        },
      ];

      // when
      await createUsers({ usersInRaw });

      // then
      const usersInDatabases = await knex('authentication-methods');
      expect(usersInDatabases.length).to.equal(2);

      const firstUserFound = await knex('users').where({ lastName: 'Kilo' }).first();
      const firstAuthenticationMethodFound = await knex('authentication-methods')
        .where({ userId: firstUserFound.id })
        .first();
      expect(firstAuthenticationMethodFound.identityProvider).to.equal('PIX');
      expect(firstAuthenticationMethodFound.authenticationComplement.password).to.exist;
      expect(firstAuthenticationMethodFound.authenticationComplement.shouldChangePassword).to.be.false;
      expect(firstAuthenticationMethodFound.createdAt).to.be.not.null;
      expect(firstAuthenticationMethodFound.updatedAt).to.be.not.null;

      const secondUserFound = await knex('users').where({ lastName: 'Desavoie' }).first();
      const secondAuthenticationMethodFound = await knex('authentication-methods')
        .where({ userId: secondUserFound.id })
        .first();
      expect(secondAuthenticationMethodFound.authenticationComplement.password).to.exist;
    });
  });
});
