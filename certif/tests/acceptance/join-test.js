import { clickByName, fillByLabel, visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { settled } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { t } from 'ember-intl/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { currentSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

import {
  createCertificationPointOfContactWithTermsOfServiceAccepted,
  createCertificationPointOfContactWithTermsOfServiceNotAccepted,
} from '../helpers/test-init';

module('Acceptance | join ', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'fr');

  module('Login', function (hooks) {
    let emailInputLabel;
    let passwordInputLabel;
    let toogleloginFormButton;
    let loginFormButton;

    hooks.beforeEach(function () {
      emailInputLabel = t('common.forms.login.email');
      passwordInputLabel = t('common.forms.login.password');
      loginFormButton = t('pages.login-or-register.login-form.login');
      toogleloginFormButton = t('pages.login-or-register.login-form.button');
    });

    module(
      'When certification center member accept valid invitation but has not accepted terms of service yet',
      function (hooks) {
        let code;

        hooks.beforeEach(() => {
          code = 'ABCDEFGH01';
        });

        test('it should redirect user to the terms-of-service page', async function (assert) {
          // given
          const certificationPointOfContactWithoutCgus =
            createCertificationPointOfContactWithTermsOfServiceNotAccepted();

          const certificationCenterInvitation = server.create('certification-center-invitation', {
            id: 1,
            certificationCenterName: 'Super Centre de Certif',
          });
          await visit(`/rejoindre?invitationId=${certificationCenterInvitation.id}&code=${code}`);
          await clickByName(toogleloginFormButton);
          await fillByLabel(emailInputLabel, certificationPointOfContactWithoutCgus.email);
          await fillByLabel(passwordInputLabel, 'secret');

          // when
          await clickByName(loginFormButton);
          await settled();

          // then
          assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
          assert.strictEqual(currentURL(), '/cgu');
        });
      },
    );

    module(
      'When certification center member accept valid invitation but has already accepted terms of service',
      function (hooks) {
        let code;

        hooks.beforeEach(() => {
          code = 'ABCDEFGH01';
        });

        test('it should redirect user to sessions list page', async function (assert) {
          // given
          const certificationPointOfContactWithCgus = createCertificationPointOfContactWithTermsOfServiceAccepted();

          const certificationCenterInvitation = server.create('certification-center-invitation', {
            id: 1,
            certificationCenterName: 'Super Centre de Certif',
          });
          const screen = await visit(`/rejoindre?invitationId=${certificationCenterInvitation.id}&code=${code}`);
          await clickByName(toogleloginFormButton);
          await fillByLabel(emailInputLabel, certificationPointOfContactWithCgus.email);
          await fillByLabel(passwordInputLabel, 'secret');

          // // when
          await clickByName(loginFormButton);
          await settled();

          // then
          assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
          assert.strictEqual(currentURL(), '/sessions/liste');
          assert.dom(
            screen.getByRole('button', { name: 'Harry Cover Collège Truffaut (ABC123) Ouvrir le menu utilisateur' }),
          );
        });
      },
    );
  });
});
