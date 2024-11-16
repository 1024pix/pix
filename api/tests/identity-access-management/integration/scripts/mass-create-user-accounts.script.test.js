import * as url from 'node:url';

import { MassCreateUserAccountsScript } from '../../../../src/identity-access-management/scripts/mass-create-user-accounts.js';
import { expect, knex, sinon } from '../../../test-helper.js';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

describe('Integration | Identity Access Management | Scripts | mass-create-user-accounts', function () {
  describe('Options', function () {
    it('has the correct options', function () {
      const script = new MassCreateUserAccountsScript();

      const { options } = script.metaInfo;
      expect(options.file).to.deep.include({
        type: 'string',
        describe: 'CSV file path',
        demandOption: true,
      });
    });

    it('parses CSV data correctly', async function () {
      const testCsvFile = `${currentDirectory}files/mass-create-user-accounts.csv`;

      const script = new MassCreateUserAccountsScript();

      const { options } = script.metaInfo;
      const parsedData = await options.file.coerce(testCsvFile);
      expect(parsedData).to.be.an('array').that.deep.includes({
        firstName: 'Dik',
        lastName: 'Tektive',
        email: 'dik.tektive@example.net',
        password: 'P@ssW0rd',
      });
      expect(parsedData).to.be.an('array').that.deep.includes({
        firstName: 'Foo',
        lastName: 'Bar',
        email: 'foo@bar.com',
        password: 'barbarbar',
      });
    });
  });

  describe('#handle', function () {
    const now = new Date();
    let clock;

    beforeEach(async function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
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
      const script = new MassCreateUserAccountsScript();
      await script.handle({ options: { file: usersInRaw } });

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
      const script = new MassCreateUserAccountsScript();
      await script.handle({ options: { file: usersInRaw } });

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
