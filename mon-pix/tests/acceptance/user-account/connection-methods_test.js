import { describe, it } from 'mocha';
import { authenticateByEmail } from '../../helpers/authentication';
import { expect } from 'chai';
import visit from '../../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { contains } from '../../helpers/contains';
import { clickByLabel } from '../../helpers/click-by-label';
import { fillInByLabel } from '../../helpers/fill-in-by-label';
import setupIntl from '../../helpers/setup-intl';

describe('Acceptance | user-account | connection-methods', function() {
  setupApplicationTest();
  setupMirage();
  setupIntl();

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
    it('should be able to edit the email using the new form', async function() {
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

      // then
      expect(contains(this.intl.t('pages.email-verification.description'))).to.exist;
      expect(contains(newEmail)).to.exist;
    });
  });
});
