/* eslint ember/no-classic-classes: 0 */
/* eslint ember/require-tagless-components: 0 */

import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { resolve, reject } from 'rsvp';
import Service from '@ember/service';
import { clickByLabel } from '../../helpers/click-by-label';
import { render } from '@1024pix/ember-testing-library';
import sinon from 'sinon';

module('Integration | Component | password reset demand form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders all the necessary elements of the form', async function (assert) {
    // given
    const service = this.owner.lookup('service:url');
    service.currentDomain = { getExtension: sinon.stub().returns('org') };

    // when
    const screen = await render(hbs`<PasswordResetDemandForm />`);
    // then
    assert.dom(screen.getByRole('img', { name: "Page d'accueil de Pix.org" })).exists();
    assert.dom(screen.getByRole('link', { name: "Page d'accueil de Pix.org" })).hasProperty('href', 'https://pix.org/');
    assert.dom(screen.getByRole('heading', { name: 'Mot de passe oublié ?' })).exists();
    assert.dom(screen.getByText("Entrez votre adresse e-mail ci-dessous, et c'est repartix")).exists();
    assert.dom(screen.getByRole('textbox', { name: 'obligatoire Adresse e-mail' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Réinitialiser mon mot de passe' })).exists();
    assert.dom(screen.getByRole('link', { name: 'Retour à la page de connexion' })).exists();
  });

  test('should display error message when there is an error on password reset demand', async function (assert) {
    // given
    const storeStub = Service.extend({
      createRecord() {
        return Object.create({
          save() {
            return reject();
          },
        });
      },
    });
    this.owner.unregister('service:store');
    this.owner.register('service:store', storeStub);
    await render(hbs`<PasswordResetDemandForm />`);

    // when
    await fillIn('#email', 'test@example.net');
    await clickByLabel(this.intl.t('pages.password-reset-demand.actions.reset'));

    // then
    assert.dom('div[id="password-reset-demand-failed-message"]').exists();
  });

  test('should display success message when there is no error on password reset demand', async function (assert) {
    // given
    const storeStub = Service.extend({
      createRecord() {
        return Object.create({
          save() {
            return resolve();
          },
        });
      },
    });
    this.owner.unregister('service:store');
    this.owner.register('service:store', storeStub);
    await render(hbs`<PasswordResetDemandForm />`);

    // when
    await fillIn('#email', 'test@example.net');
    await clickByLabel(this.intl.t('pages.password-reset-demand.actions.reset'));

    // then
    assert.dom('div[id="password-reset-demand-failed-message"]').doesNotExist();
    assert.dom('.password-reset-demand-form__body').exists();
  });

  test('should show error coming from errors service', async function (assert) {
    // given
    const expectedError = 'expected error';
    const errorsServiceStub = Service.extend({
      hasErrors() {
        return true;
      },
      shift() {
        return expectedError;
      },
    });
    this.owner.register('service:errors', errorsServiceStub);

    // when
    const screen = await render(hbs`<PasswordResetDemandForm />`);

    // then
    assert.dom(screen.getByText(expectedError)).exists();
  });
});
