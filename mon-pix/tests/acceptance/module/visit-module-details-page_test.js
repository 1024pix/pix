import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | Module | Routes | get', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('can visit /modules/:slug/details', async function (assert) {
    // given
    server.create('module', {
      id: 'bien-ecrire-son-adresse-mail',
      title: 'Bien écrire son adresse mail',
      details: {
        image: 'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-details.svg',
        description:
          'Apprendre à rédiger correctement une adresse e-mail pour assurer une meilleure communication et éviter les erreurs courantes.',
        duration: '12 min',
        level: 'Débutant',
        objectives: ['Écrire une adresse mail correctement, en évitant les erreurs courantes'],
      },
      grains: [],
    });

    // when
    await visit('/modules/bien-ecrire-son-adresse-mail/details');

    // then
    assert.strictEqual(currentURL(), '/modules/bien-ecrire-son-adresse-mail/details');
  });

  test('should include the module title inside the page title', async function (assert) {
    // given
    const module = server.create('module', {
      id: 'bien-ecrire-son-adresse-mail',
      title: 'Bien écrire son adresse mail',
      details: {
        image: 'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-details.svg',
        description:
          'Apprendre à rédiger correctement une adresse e-mail pour assurer une meilleure communication et éviter les erreurs courantes.',
        duration: '12 min',
        level: 'Débutant',
        objectives: ['Écrire une adresse mail correctement, en évitant les erreurs courantes'],
      },
      grains: [],
    });

    // when
    await visit('/modules/bien-ecrire-son-adresse-mail/details');

    // then
    assert.ok(document.title.includes(module.title));
  });
});
