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
    server.create('module', {
      id: 'les-adresses-mail',
      title: 'Les adresses mail',
    });

    // when
    await visit('/modules/les-adresses-mail');

    // then
    assert.strictEqual(currentURL(), '/modules/les-adresses-mail');
  });

  test('should include the module title inside the page title', async function (assert) {
    // given
    const module = {
      title: 'Les adresses mail',
    };

    server.create('module', {
      id: 'les-adresses-mail',
      title: module.title,
    });

    // when
    await visit('/modules/les-adresses-mail');

    // then
    assert.ok(document.title.includes(module.title));
  });
});
