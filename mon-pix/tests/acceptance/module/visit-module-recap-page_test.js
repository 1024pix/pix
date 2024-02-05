import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | Module | Routes | recap', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('can visit /modules/:slug/recap', async function (assert) {
    // given
    server.create('module', {
      id: 'bien-ecrire-son-adresse-mail',
    });

    // when
    await visit('/modules/bien-ecrire-son-adresse-mail/recap');

    // then
    assert.strictEqual(currentURL(), '/modules/bien-ecrire-son-adresse-mail/recap');
  });

  test('should include the right page title', async function (assert) {
    // given
    server.create('module', {
      id: 'bien-ecrire-son-adresse-mail',
    });

    // when
    await visit('/modules/bien-ecrire-son-adresse-mail/recap');

    // then
    assert.ok(document.title.includes('Bravo ! Module terminé'));
  });
});
