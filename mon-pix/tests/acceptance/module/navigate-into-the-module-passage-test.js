import { clickByName, visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Acceptance | Module | Routes | navigateIntoTheModulePassage', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('when user arrive on the module passage page', function () {
    test('should display only the first lesson grain', async function (assert) {
      // given
      const grains = _createGrains(server);

      server.create('module', {
        id: 'bien-ecrire-son-adresse-mail',
        title: 'Bien écrire son adresse mail',
        grains,
      });

      server.create('passage', {
        moduleId: 'bien-ecrire-son-adresse-mail',
      });

      // when
      const screen = await visit('/modules/bien-ecrire-son-adresse-mail/passage');

      // then
      assert.dom(screen.getByRole('heading', { name: grains[0].title, level: 2 })).exists();
      assert.dom(screen.queryByRole('heading', { name: grains[1].title, level: 2 })).doesNotExist();
      assert.dom(screen.queryByRole('heading', { name: grains[2].title, level: 2 })).doesNotExist();
      assert.dom(screen.getByRole('button', { name: 'Continuer' })).exists({ count: 1 });
    });
  });

  module('when user click on continue button', function () {
    module('when the grain displayed is not the last', function () {
      test('should display the continue button', async function (assert) {
        // given
        const grains = _createGrains(server);

        server.create('module', {
          id: 'bien-ecrire-son-adresse-mail',
          title: 'Bien écrire son adresse mail',
          grains,
        });

        // when
        const screen = await visit('/modules/bien-ecrire-son-adresse-mail/passage');

        // then
        assert.dom(screen.getByRole('button', { name: 'Continuer' })).exists({ count: 1 });

        // when
        await clickByName('Continuer');

        // then
        const secondGrain = grains[1];
        assert.dom(screen.getByRole('heading', { name: secondGrain.title, level: 2 })).exists();
        assert.dom(screen.queryByRole('button', { name: 'Continuer' })).exists();
      });
    });

    module('when the grain displayed is the last', function () {
      test('should not display continue button', async function (assert) {
        // given
        const grains = _createGrains(server);

        server.create('module', {
          id: 'bien-ecrire-son-adresse-mail',
          title: 'Bien écrire son adresse mail',
          grains,
        });

        // when
        const screen = await visit('/modules/bien-ecrire-son-adresse-mail/passage');

        // then
        assert.dom(screen.getByRole('button', { name: 'Continuer' })).exists({ count: 1 });

        // when
        await clickByName('Continuer');
        await clickByName('Continuer');

        // then
        assert.dom(screen.queryByRole('button', { name: 'Continuer' })).doesNotExist();
      });
    });

    test('should navigate to recap page when terminate is clicked', async function (assert) {
      // given
      const text1 = {
        id: 'elementId-1',
        type: 'text',
        content: 'content-1',
      };
      const grain1 = server.create('grain', {
        id: 'grainId-1',
        title: 'title grain 1',
        components: [
          {
            type: 'element',
            element: text1,
          },
        ],
      });
      server.create('module', {
        id: 'bien-ecrire-son-adresse-mail',
        title: 'Bien écrire son adresse mail',
        grains: [grain1],
      });

      // when
      const screen = await visit('/modules/bien-ecrire-son-adresse-mail/passage');

      // then
      assert.dom(screen.getByRole('button', { name: 'Terminer' })).exists({ count: 1 });

      // when
      await clickByName('Terminer');

      // then
      assert.strictEqual(currentURL(), '/modules/bien-ecrire-son-adresse-mail/recap');
    });
  });
});

const text1 = {
  id: 'elementId-1',
  type: 'text',
  content: 'content-1',
};

const text2 = {
  id: 'elementId-2',
  type: 'text',
  content: 'content-2',
};

const text3 = {
  id: 'elementId-3',
  type: 'text',
  content: 'content-3',
};
function _createGrains(server) {
  const grain1 = server.create('grain', {
    id: 'grainId-1',
    title: 'title grain 1',
    components: [
      {
        type: 'element',
        element: text1,
      },
    ],
  });
  const grain2 = server.create('grain', {
    id: 'grainId-2',
    title: 'title grain 2',
    components: [
      {
        type: 'element',
        element: text2,
      },
    ],
  });
  const grain3 = server.create('grain', {
    id: 'grainId-3',
    title: 'title grain 3',
    components: [
      {
        type: 'element',
        element: text3,
      },
    ],
  });

  return [grain1, grain2, grain3];
}
