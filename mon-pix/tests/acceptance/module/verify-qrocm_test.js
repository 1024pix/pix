import { clickByName, visit } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Acceptance | Module | Routes | verifyQrocm', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('with elements', function () {
    test('can validate my QROCM answer', async function (assert) {
      // given
      const qrocm1 = {
        id: 'elementId-1',
        type: 'qrocm',
        instruction: 'instruction',
        proposals: [
          {
            type: 'text',
            content: '<p>Le symbole</>',
          },
          {
            input: 'symbole',
            type: 'input',
            inputType: 'text',
            size: 1,
            display: 'block',
            placeholder: '',
            ariaLabel: 'Réponse 1',
            defaultValue: '',
          },
          {
            input: 'premiere-partie',
            type: 'select',
            display: 'block',
            placeholder: '',
            ariaLabel: 'Réponse 2',
            defaultValue: '',
            options: [
              {
                id: '1',
                content: "l'identifiant",
              },
              {
                id: '2',
                content: "le fournisseur d'adresse mail",
              },
            ],
          },
        ],
      };

      const grain = server.create('grain', {
        id: 'grainId',
        title: 'title',
        elements: [qrocm1],
      });

      server.create('module', {
        id: 'bien-ecrire-son-adresse-mail',
        title: 'Bien écrire son adresse mail',
        grains: [grain],
      });

      server.create('correction-response', {
        id: 'elementId-1',
        feedback: "Bravo ! C'est la bonne réponse.",
        status: 'ok',
        solution: { symbole: '@', 'premiere-partie': '2' },
      });

      // when
      const screen = await visit('/modules/bien-ecrire-son-adresse-mail/passage');

      const verifyButton = screen.queryByRole('button', { name: 'Vérifier' });

      // answer input proposal
      await fillIn(screen.getByLabelText('Réponse 1'), '@');
      // answer select proposal
      await clickByName('Réponse 2');
      await screen.findByRole('listbox');
      await click(
        screen.queryByRole('option', {
          name: "le fournisseur d'adresse mail",
        }),
      );
      // submit
      await click(verifyButton);

      // then
      assert.dom(screen.getByText("Bravo ! C'est la bonne réponse.")).exists();
      assert.notOk(screen.queryByRole('button', { name: 'Vérifier' }));
    });
  });

  module('with components', function () {
    test('can validate my QROCM answer', async function (assert) {
      // given
      const qrocm1 = {
        id: 'elementId-1',
        type: 'qrocm',
        instruction: 'instruction',
        proposals: [
          {
            type: 'text',
            content: '<p>Le symbole</>',
          },
          {
            input: 'symbole',
            type: 'input',
            inputType: 'text',
            size: 1,
            display: 'block',
            placeholder: '',
            ariaLabel: 'Réponse 1',
            defaultValue: '',
          },
          {
            input: 'premiere-partie',
            type: 'select',
            display: 'block',
            placeholder: '',
            ariaLabel: 'Réponse 2',
            defaultValue: '',
            options: [
              {
                id: '1',
                content: "l'identifiant",
              },
              {
                id: '2',
                content: "le fournisseur d'adresse mail",
              },
            ],
          },
        ],
      };

      const grain = server.create('grain', {
        id: 'grainId',
        title: 'title',
        components: [
          {
            type: 'element',
            element: qrocm1,
          },
        ],
      });

      server.create('module', {
        id: 'bien-ecrire-son-adresse-mail',
        title: 'Bien écrire son adresse mail',
        grains: [grain],
      });

      server.create('correction-response', {
        id: 'elementId-1',
        feedback: "Bravo ! C'est la bonne réponse.",
        status: 'ok',
        solution: { symbole: '@', 'premiere-partie': '2' },
      });

      // when
      const screen = await visit('/modules/bien-ecrire-son-adresse-mail/passage');

      const verifyButton = screen.queryByRole('button', { name: 'Vérifier' });

      // answer input proposal
      await fillIn(screen.getByLabelText('Réponse 1'), '@');
      // answer select proposal
      await clickByName('Réponse 2');
      await screen.findByRole('listbox');
      await click(
        screen.queryByRole('option', {
          name: "le fournisseur d'adresse mail",
        }),
      );
      // submit
      await click(verifyButton);

      // then
      assert.dom(screen.getByText("Bravo ! C'est la bonne réponse.")).exists();
      assert.notOk(screen.queryByRole('button', { name: 'Vérifier' }));
    });
  });
});
