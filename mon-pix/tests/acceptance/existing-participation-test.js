import { visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { authenticateByEmail } from '../helpers/authentication';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setupIntl from '../helpers/setup-intl';
import { contains } from '../helpers/contains';

module('Acceptance | Existing Participation', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('Authenticated cases as simple user', function (hooks) {
    hooks.beforeEach(async function () {
      const user = server.create('user', 'withEmail');
      server.create('campaign', { code: '123' });
      server.create('schooling-registration-user-association', {
        firstName: 'First',
        lastName: 'Last',
        campaignCode: '123',
      });
      await authenticateByEmail(user);
    });

    test('displays an error message', async function (ass$) {
      await visit('/campagnes/123/participation-existante');
      assert.dom(contains("Le parcours n'est pas accessible pour vous.")).exists();
      assert.dom(contains('Il y a déjà une participation associée au nom de')).exists();
      assert.dom(contains('First Last.')).exists();
      assert
        .dom(contains("Rapprochez-vous de votre enseignant pour qu'il supprime votre participation dans Pix Orga."))
        .exists();
    });
  });
});
