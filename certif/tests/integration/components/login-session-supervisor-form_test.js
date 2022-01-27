import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn } from '@ember/test-helpers';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import sinon from 'sinon';

import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | login-session-supervisor-form', function (hooks) {
  setupRenderingTest(hooks);

  test('it should render supervisor login form', async function (assert) {
    // when
    this.onFormSubmit = sinon.stub();
    this.currentUserEmail = 'toto@example.net';
    const screen = await renderScreen(
      hbs`<LoginSessionSupervisorForm @onFormSubmit={{this.onFormSubmit}} @currentUserEmail={{this.currentUserEmail}}/>`
    );

    // then
    assert.dom(screen.getByLabelText('Numéro de la session')).exists();
    assert.dom(screen.getByLabelText('Mot de passe de la session')).exists();
    assert.dom(screen.getByText('Surveiller la session')).exists();
    assert.dom(screen.getByText('toto@example.net')).exists();
  });

  module('On click on supervise button', function () {
    test('it should display an error message when the session id is empty', async function (assert) {
      // given
      this.onFormSubmit = sinon.stub();
      const screen = await renderScreen(hbs`<LoginSessionSupervisorForm @onFormSubmit={{this.onFormSubmit}} />`);
      await fillIn(screen.getByLabelText('Mot de passe de la session'), '12345');

      // when
      await click(screen.getByText('Surveiller la session'));

      // then
      assert.contains('Les champs "Numéro de la session" et "Mot de passe de session" sont obligatoires.');
    });

    test('it should display an error message when the supervisor password is empty', async function (assert) {
      // given
      this.onFormSubmit = sinon.stub();
      const screen = await renderScreen(hbs`<LoginSessionSupervisorForm @onFormSubmit={{this.onFormSubmit}} />`);
      await fillIn(screen.getByLabelText('Numéro de la session'), '12345');

      // when
      await click(screen.getByText('Surveiller la session'));

      // then
      assert.contains('Les champs "Numéro de la session" et "Mot de passe de session" sont obligatoires.');
    });

    test('it should call onFormSubmit when all the fields are filled', async function (assert) {
      // given
      this.onFormSubmit = sinon.stub();
      const screen = await renderScreen(hbs`<LoginSessionSupervisorForm @onFormSubmit={{this.onFormSubmit}} />`);
      await fillIn(screen.getByLabelText('Numéro de la session'), '12345');
      await fillIn(screen.getByLabelText('Mot de passe de la session'), '6789');

      // when
      await click(screen.getByText('Surveiller la session'));

      // then
      sinon.assert.calledWith(this.onFormSubmit, { sessionId: '12345', supervisorPassword: '6789' });
      assert.ok(true);
    });
  });
});
