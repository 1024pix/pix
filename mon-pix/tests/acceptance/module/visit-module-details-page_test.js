import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | Module | Routes | details', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('should visit and include the module title, header and footer', async function (assert) {
    // given
    const module = server.create('module', {
      id: 'bien-ecrire-son-adresse-mail',
      title: 'Bien écrire son adresse mail',
      details: {
        image: 'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-details.svg',
        description:
          'Apprendre à rédiger correctement une adresse e-mail pour assurer une meilleure communication et éviter les erreurs courantes.',
        duration: 12,
        level: 'Débutant',
        objectives: ['Écrire une adresse mail correctement, en évitant les erreurs courantes'],
      },
      grains: [],
    });

    // when
    const screen = await visit('/modules/bien-ecrire-son-adresse-mail/details');

    // then
    assert.strictEqual(currentURL(), '/modules/bien-ecrire-son-adresse-mail/details');
    assert.ok(document.title.includes(module.title));
    assert.dom(screen.getByRole('alert')).exists();
    assert.dom(screen.getByRole('banner')).exists();
    assert.dom(screen.getByRole('contentinfo')).exists();
  });

  test('should redirect /modules/:slug to /modules/:slug/details', async function (assert) {
    // given
    const grain = server.create('grain', {
      id: 'grain1',
    });
    server.create('module', {
      id: 'bien-ecrire-son-adresse-mail',
      title: 'Bien écrire son adresse mail',
      details: {
        image: 'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-details.svg',
        description:
          'Apprendre à rédiger correctement une adresse e-mail pour assurer une meilleure communication et éviter les erreurs courantes.',
        duration: 12,
        level: 'Débutant',
        objectives: ['Écrire une adresse mail correctement, en évitant les erreurs courantes'],
      },
      grains: [grain],
    });

    // when
    await visit('/modules/bien-ecrire-son-adresse-mail');

    // then
    assert.strictEqual(currentURL(), '/modules/bien-ecrire-son-adresse-mail/details');
  });
});
