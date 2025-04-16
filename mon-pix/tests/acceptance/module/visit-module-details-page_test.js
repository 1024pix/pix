import { visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupIntl from 'mon-pix/tests/helpers/setup-intl';
import { setupMirage } from 'mon-pix/tests/test-support/mirage';
import { module, test } from 'qunit';

module('Acceptance | Module | Routes | details', function (hooks) {
  setupApplicationTest(hooks);
  setupIntl(hooks);
  setupMirage(hooks);

  test('should visit and include the module title and footer', async function (assert) {
    // given
    const module = this.server.create('module', {
      id: 'bien-ecrire-son-adresse-mail',
      title: 'Bien écrire son adresse mail',
      isBeta: false,
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
    assert.dom(screen.queryByRole('alert')).doesNotExist();
    assert.dom(screen.getByRole('contentinfo')).exists();
  });

  module('when module is beta', function () {
    test('should display a beta banner', async function (assert) {
      // given
      this.server.create('module', {
        id: 'bien-ecrire-son-adresse-mail',
        title: 'Bien écrire son adresse mail',
        isBeta: true,
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
      assert.dom(screen.getByRole('alert')).exists();
    });
  });
  test('should redirect /modules/:slug to /modules/:slug/details', async function (assert) {
    // given
    const grain = this.server.create('grain', {
      id: 'grain1',
    });
    this.server.create('module', {
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
