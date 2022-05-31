import { module, test } from 'qunit';
import { currentURL, fillIn, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { visit } from '@1024pix/ember-testing-library';

module('Acceptance | authenticated/users | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('when clicking on "Vider" button', function () {
    test('should empty url params', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      // when
      const screen = await visit('/users/list?firstName=emma&lastName=sardine&email=emma@example.net');
      await click(screen.getByRole('button', { name: 'Vider les champs de recherche' }));

      // then
      assert.strictEqual(currentURL(), '/users/list');
    });

    test('should empty all search fields', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      server.create('user', {
        firstName: 'emma',
        lastName: 'sardine',
        email: 'emma@example.net',
        identifiant: 'emma123',
      });
      const screen = await visit('/users/list');
      await fillIn(screen.getByRole('textbox', { name: 'Nom' }), 'sardine');
      await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail' }), 'emma@example.net');
      await fillIn(screen.getByRole('textbox', { name: 'Identifiant' }), 'emma123');

      // when
      await click(screen.getByRole('button', { name: 'Vider les champs de recherche' }));

      // then
      assert.dom(screen.getByRole('textbox', { name: 'Prénom' })).hasNoValue();
      assert.dom(screen.getByRole('textbox', { name: 'Nom' })).hasNoValue();
      assert.dom(screen.getByRole('textbox', { name: 'Adresse e-mail' })).hasNoValue();
      assert.dom(screen.getByRole('textbox', { name: 'Identifiant' })).hasNoValue();
    });

    test('should let empty fields on search', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      server.create('user', {
        firstName: 'emma',
        lastName: 'sardine',
        email: 'emma@example.net',
        identifiant: 'emma123',
      });
      const screen = await visit('/users/list');
      await fillIn(screen.getByRole('textbox', { name: 'Nom' }), 'sardine');
      await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail' }), 'emma@example.net');
      await fillIn(screen.getByRole('textbox', { name: 'Identifiant' }), 'emma123');

      // when
      await click(screen.getByRole('button', { name: 'Vider les champs de recherche' }));
      await click(screen.getByRole('button', { name: 'Charger' }));

      // then
      assert.strictEqual(currentURL(), '/users/list');
      assert.dom(screen.getByRole('textbox', { name: 'Prénom' })).hasNoValue();
      assert.dom(screen.getByRole('textbox', { name: 'Nom' })).hasNoValue();
      assert.dom(screen.getByRole('textbox', { name: 'Adresse e-mail' })).hasNoValue();
      assert.dom(screen.getByRole('textbox', { name: 'Identifiant' })).hasNoValue();
    });
  });
});
