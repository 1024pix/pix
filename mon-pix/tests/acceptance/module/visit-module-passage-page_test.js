import { visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'mon-pix/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Module | Routes | get', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('can visit /modules/:slug/passage', async function (assert) {
    // given
    const section = server.create('section', {
      id: 'sectionId-1',
      grains: [
        {
          id: 'grain1',
          components: [],
        },
      ],
    });
    server.create('module', {
      id: 'def0f7e1-8f4d-4352-a7b3-1cccff1038d6',
      shortId: '3r7cl7m3',
      slug: 'bien-ecrire-son-adresse-mail',
      title: 'Bien écrire son adresse mail',
      sections: [section],
    });

    // when
    await visit('/modules/3r7cl7m3/bien-ecrire-son-adresse-mail/passage');

    // then
    assert.strictEqual(currentURL(), '/modules/3r7cl7m3/bien-ecrire-son-adresse-mail/passage');
  });

  test('should include the module title inside the page title', async function (assert) {
    // given
    const module = {
      title: 'Bien écrire son adresse mail',
    };
    const section = server.create('section', {
      id: 'sectionId-1',
      grains: [
        {
          id: 'grain1',
          components: [],
        },
      ],
    });

    server.create('module', {
      id: 'def0f7e1-8f4d-4352-a7b3-1cccff1038d6',
      shortId: '3r7cl7m3',
      slug: 'bien-ecrire-son-adresse-mail',
      title: module.title,
      sections: [section],
    });

    // when
    await visit('/modules/3r7cl7m3/bien-ecrire-son-adresse-mail/passage');

    // then
    assert.ok(document.title.includes(module.title));
  });
});
