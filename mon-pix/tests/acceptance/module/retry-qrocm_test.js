import { clickByName, visit } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Acceptance | Module | Routes | retryQrocm', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('can retry a Qrocm', async function (assert) {
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
          input: 'premiere-partie',
          type: 'select',
          display: 'block',
          placeholder: '',
          ariaLabel: 'Réponse 1',
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
      feedback: 'Faux',
      status: 'ko',
      solution: { 'premiere-partie': '2' },
    });

    // when
    const screen = await visit('/modules/bien-ecrire-son-adresse-mail/passage');

    const verifyButton = screen.queryByRole('button', { name: 'Vérifier' });
    const qrocmForm = screen.getByRole('group');

    // answer select proposal initially
    await clickByName('Réponse 1');
    await screen.findByRole('listbox');
    await click(
      screen.queryByRole('option', {
        name: "le fournisseur d'adresse mail",
      }),
    );

    // submit
    await click(verifyButton);

    assert.dom(screen.getByRole('status')).exists();

    // when
    const retryButton = screen.getByRole('button', { name: 'Réessayer' });
    await click(retryButton);

    // then
    assert.strictEqual(screen.queryByRole('status').innerText, '');
    assert.false(qrocmForm.disabled);
    await clickByName('Réponse 1');
    await screen.findByRole('listbox');
    assert.strictEqual(
      screen
        .queryByRole('option', {
          name: "le fournisseur d'adresse mail",
        })
        .getAttribute('aria-selected'),
      'false',
    );

    const qrocmVerifyButtonCameBack = screen.getByRole('button', { name: 'Vérifier' });

    // re-answer select proposal
    await clickByName('Réponse 1');
    await screen.findByRole('listbox');
    await click(
      screen.queryByRole('option', {
        name: "le fournisseur d'adresse mail",
      }),
    );
    await click(qrocmVerifyButtonCameBack);

    assert.strictEqual(screen.queryByRole('status').innerText, 'Faux');
  });

  test('after retrying a Qrocm, it display an error message if Qrocm is validated without response', async function (assert) {
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
      feedback: 'Faux',
      status: 'ko',
      solution: { symbole: '@', 'premiere-partie': '2' },
    });

    // when
    const screen = await visit('/modules/bien-ecrire-son-adresse-mail/passage');

    const verifyButton = screen.queryByRole('button', { name: 'Vérifier' });
    const input = screen.getByLabelText('Réponse 1');

    // answer input proposal
    await fillIn(input, '#');
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

    assert.dom(screen.getByRole('status')).exists();

    // when
    const retryButton = screen.getByRole('button', { name: 'Réessayer' });
    await click(retryButton);

    // then
    const qrocmVerifyButtonCameBack = screen.getByRole('button', { name: 'Vérifier' });
    await click(qrocmVerifyButtonCameBack);
    const validationAlert = screen.queryAllByRole('alert')[1];

    assert.strictEqual(validationAlert.innerText, 'Pour valider, veuillez remplir tous les champs réponse.');
  });
});
