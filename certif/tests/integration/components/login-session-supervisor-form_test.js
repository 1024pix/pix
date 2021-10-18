/* eslint-disable ember/no-classic-classes,ember/require-tagless-components*/

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render as renderScreen } from '../../helpers/testing-library';

import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | login-session-supervisor-form', function(hooks) {
  setupRenderingTest(hooks);

  test('it should render supervisor login form', async function(assert) {
    // when
    const screen = await renderScreen(hbs`<LoginSessionSupervisorForm />`);

    // then
    assert.dom(screen.getByLabelText('Numéro de la session')).exists();
    assert.dom(screen.getByLabelText('Mot de passe de la session')).exists();
    assert.dom(screen.getByText('Surveiller la session')).exists();
  });
});
