import { module, test } from 'qunit';
import { authenticate } from '../helpers/authentication';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setupIntl from '../helpers/setup-intl';
import { visit } from '@1024pix/ember-testing-library';

module('Acceptance | Existing Participation', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('Authenticated cases as simple user', function () {
    test('displays an error message', async function (assert) {
      // given
      const user = server.create('user', 'withEmail');
      server.create('campaign', { code: '123' });
      server.create('organization-learner-identity', {
        firstName: 'First',
        lastName: 'Last',
      });
      await authenticate(user);

      // when
      const screen = await visit('/campagnes/123/participation-existante');

      //then
      assert.ok(screen.getByText("Le parcours n'est pas accessible pour vous."));
      assert.ok(screen.getByText('Il y a déjà une participation associée au nom de'));
      assert.ok(screen.getByText('First Last.'));
      assert.ok(
        screen.getByText("Rapprochez-vous de votre enseignant pour qu'il supprime votre participation dans Pix Orga."),
      );
    });
  });
});
