import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit } from '@1024pix/ember-testing-library';
import { setupMirage } from 'ember-cli-mirage/test-support';

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

    // when
    const screen = await visit('/modules/bien-ecrire-son-adresse-mail');

    // then
    assert.ok(screen.getByRole('button', { name: 'Vérifier' }));
  });
});
