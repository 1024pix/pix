import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { clickByName, visit } from '@1024pix/ember-testing-library';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { click, fillIn } from '@ember/test-helpers';

module('Acceptance | Module | Routes | verifyQrocm', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('can validate my QROCM answer', async function (assert) {
    // given
    const qrocm1 = server.create('qrocm', {
      id: 'elementId-1',
      type: 'qrocms',
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
          display: 'inline',
          placeholder: '',
          ariaLabel: 'Réponse 1',
          defaultValue: '',
        },
        {
          input: 'premiere-partie',
          type: 'select',
          display: 'inline',
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
    });

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
    const screen = await visit('/modules/bien-ecrire-son-adresse-mail');

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
  });
});
