import { describe, it } from 'mocha';
import { authenticateByEmail, authenticateByUsername } from '../../helpers/authentication';
import { expect } from 'chai';
import visit from '../../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { triggerEvent } from '@ember/test-helpers';
import { contains } from '../../helpers/contains';
import { clickByLabel } from '../../helpers/click-by-label';
import { fillInByLabel } from '../../helpers/fill-in-by-label';
import setupIntl from '../../helpers/setup-intl';

describe('Acceptance | user-account | connection-methods', function() {
  setupApplicationTest();
  setupMirage();
  setupIntl();

  context('connection method details', function() {

    it('should display user\'s email and username', async function() {
      // given
      const userDetails = {
        email: 'john.doe@example.net',
        username: 'john.doe0101',
      };
      const user = server.create('user', 'withEmail', userDetails);
      await authenticateByEmail(user);

      // when
      await visit('/mon-compte/methodes-de-connexion');

      // then
      expect(contains(user.email)).to.exist;
      expect(contains(user.username)).to.exist;
    });

  });

  context('when user does not have an email', function() {

    it('should not display email', async function() {
      // given
      const userDetails = {
        username: 'john.doe0101',
      };
      const user = server.create('user', 'withUsername', userDetails);
      await authenticateByUsername(user);

      // when
      await visit('/mon-compte/methodes-de-connexion');

      // then
      expect(contains(this.intl.t('pages.user-account.connexion-methods.email'))).to.not.exist;
    });

  });

  context('when user does not have a username', function() {

    it('should not display username', async function() {
      // given
      const userDetails = {
        email: 'john.doe@example.net',
      };
      const user = server.create('user', 'withEmail', userDetails);
      await authenticateByEmail(user);

      // when
      await visit('/mon-compte/methodes-de-connexion');

      // then
      expect(contains(this.intl.t('pages.user-account.connexion-methods.username'))).to.not.exist;
    });

  });

  context('email editing', function() {

    it('should reset email editing process when changing page', async function() {
      // given
      const user = server.create('user', 'withEmail');
      await authenticateByEmail(user);
      await visit('/mon-compte/methodes-de-connexion');
      await clickByLabel(this.intl.t('pages.user-account.connexion-methods.edit-button'));

      // when
      await visit('/mon-compte/informations-personnelles');
      await visit('/mon-compte/methodes-de-connexion');

      // then
      expect(contains(this.intl.t('pages.user-account.connexion-methods.email'))).to.exist;
    });

    context('email validation is toggled off', function() {

      it('should be able to edit the email using the old form', async function() {
        // given
        const user = server.create('user', 'withEmail');
        await authenticateByEmail(user);
        const newEmail = 'new-email@example.net';
        await visit('/mon-compte/methodes-de-connexion');

        // when
        await clickByLabel(this.intl.t('pages.user-account.connexion-methods.edit-button'));
        await fillInByLabel(this.intl.t('pages.user-account.account-update-email.fields.new-email.label'), newEmail);
        await fillInByLabel(this.intl.t('pages.user-account.account-update-email.fields.new-email-confirmation.label'), newEmail);
        await fillInByLabel(this.intl.t('pages.user-account.account-update-email.fields.password.label'), user.password);
        await clickByLabel(this.intl.t('pages.user-account.account-update-email.save-button'));

        // then
        expect(user.email).to.equal(newEmail);
      });

    });

    context('email validation is toggled on', function() {

      it('should be able to edit the email, enter the code received, and be successfully redirected to account page', async function() {
        // given
        const user = server.create('user', 'withEmail');
        server.create('feature-toggle', { id: 0, isEmailValidationEnabled: true });
        await authenticateByEmail(user);
        const newEmail = 'new-email@example.net';
        await visit('/mon-compte/methodes-de-connexion');

        // when
        await clickByLabel(this.intl.t('pages.user-account.connexion-methods.edit-button'));
        await fillInByLabel(this.intl.t('pages.user-account.account-update-email-with-validation.fields.new-email.label'), newEmail);
        await fillInByLabel(this.intl.t('pages.user-account.account-update-email-with-validation.fields.password.label'), user.password);
        await clickByLabel(this.intl.t('pages.user-account.account-update-email-with-validation.save-button'));
        await triggerEvent('#code-input-1', 'paste', { clipboardData: { getData: () => '123456' } });

        // then
        expect(contains(this.intl.t('pages.user-account.connexion-methods.email'))).to.exist;
      });

    });
  });
});
