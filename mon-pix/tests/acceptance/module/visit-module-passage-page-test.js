import { visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Acceptance | Module | Routes | get', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('can visit /modules/:slug/passage', async function (assert) {
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
    await visit('/modules/bien-ecrire-son-adresse-mail/passage');

    // then
    assert.strictEqual(currentURL(), '/modules/bien-ecrire-son-adresse-mail/passage');
  });

  test('should include the module title inside the page title', async function (assert) {
    // given
    const module = {
      title: 'Bien écrire son adresse mail',
    };
    const grain = server.create('grain', {
      id: 'grain1',
    });

    server.create('module', {
      id: 'bien-ecrire-son-adresse-mail',
      title: module.title,
      grains: [grain],
    });

    // when
    await visit('/modules/bien-ecrire-son-adresse-mail/passage');

    // then
    assert.ok(document.title.includes(module.title));
  });
});
