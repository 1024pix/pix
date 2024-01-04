import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | Module | Routes | get', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('can visit /modules/:slug', async function (assert) {
    // given
    const grain = server.create('grain', {
      id: 'grain1',
    });
    server.create('module', {
      id: 'bien-ecrire-son-adresse-mail',
      title: 'Bien écrire son adresse mail',
      grains: [grain],
    });

    // when
    await visit('/modules/bien-ecrire-son-adresse-mail');

    // then
    assert.strictEqual(currentURL(), '/modules/bien-ecrire-son-adresse-mail');
  });

  test('should include the module title inside the page title', async function (assert) {
    // given
    const grain = server.create('grain', {
      id: 'grain1',
    });
    const module = {
      title: 'Bien écrire son adresse mail',
    };

    server.create('module', {
      id: 'bien-ecrire-son-adresse-mail',
      title: module.title,
      grains: [grain],
    });

    // when
    await visit('/modules/bien-ecrire-son-adresse-mail');

    // then
    assert.ok(document.title.includes(module.title));
  });
});
