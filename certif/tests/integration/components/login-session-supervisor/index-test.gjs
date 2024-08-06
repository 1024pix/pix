import { render as renderScreen } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import LoginSessionSupervisor from 'pix-certif/components/login-session-supervisor';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | index', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should render supervisor login form', async function (assert) {
    // when
    const authenticateSupervisor = sinon.stub();
    const currentUserEmail = 'lara.pafromage@example.net';

    const screen = await renderScreen(
      <template>
        <LoginSessionSupervisor
          @authenticateSupervisor={{authenticateSupervisor}}
          @currentUserEmail={{currentUserEmail}}
        />
      </template>,
    );

    // then
    assert.dom(screen.getByRole('heading', { name: 'Espace Surveillant' })).exists();
    assert.dom(screen.getByRole('heading', { name: 'Surveiller une session' })).exists();
    assert.dom(screen.getByRole('spinbutton', { name: 'Numéro de la session' })).exists();
    assert.dom(screen.getByLabelText('Mot de passe de la session Exemple : C-12345')).exists();
    assert.dom(screen.getByRole('button', { name: 'Surveiller la session' })).exists();
  });

  module('On click on supervise button', function () {
    test('it should display an error message when the session id is empty', async function (assert) {
      // given
      const authenticateSupervisor = sinon.stub();
      const currentUserEmail = 'lara.pafromage@example.net';

      const screen = await renderScreen(
        <template>
          <LoginSessionSupervisor
            @authenticateSupervisor={{authenticateSupervisor}}
            @currentUserEmail={{currentUserEmail}}
          />
        </template>,
      );

      await fillIn(screen.getByLabelText('Mot de passe de la session Exemple : C-12345'), '12345');

      // when
      await click(screen.getByRole('button', { name: 'Surveiller la session' }));

      // then
      assert
        .dom(screen.getByText('Les champs "Numéro de la session" et "Mot de passe de session" sont obligatoires.'))
        .exists();
    });

    test('it should display an error message when the supervisor password is empty', async function (assert) {
      // given
      const authenticateSupervisor = sinon.stub();
      const currentUserEmail = 'lara.pafromage@example.net';

      const screen = await renderScreen(
        <template>
          <LoginSessionSupervisor
            @authenticateSupervisor={{authenticateSupervisor}}
            @currentUserEmail={{currentUserEmail}}
          />
        </template>,
      );

      await fillIn(screen.getByLabelText('Numéro de la session'), '12345');

      // when
      await click(screen.getByRole('button', { name: 'Surveiller la session' }));

      // then
      assert
        .dom(screen.getByText('Les champs "Numéro de la session" et "Mot de passe de session" sont obligatoires.'))
        .exists();
    });

    test('it should call onFormSubmit when all the fields are filled', async function (assert) {
      // given
      const authenticateSupervisor = sinon.stub();
      const currentUserEmail = 'lara.pafromage@example.net';

      const screen = await renderScreen(
        <template>
          <LoginSessionSupervisor
            @authenticateSupervisor={{authenticateSupervisor}}
            @currentUserEmail={{currentUserEmail}}
          />
        </template>,
      );

      await fillIn(screen.getByRole('spinbutton', { name: 'Numéro de la session' }), '12345');
      await fillIn(screen.getByLabelText('Mot de passe de la session Exemple : C-12345'), '6789');

      // when
      await click(screen.getByRole('button', { name: 'Surveiller la session' }));

      // then
      sinon.assert.calledWith(authenticateSupervisor, { sessionId: '12345', supervisorPassword: '6789' });
      assert.ok(true);
    });
  });
});
