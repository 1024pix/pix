import { clickByName, visit, within } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'mon-pix/tests/test-support/setup-mirage';
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
          solutions: ['1'],
        },
      ],
      feedbacks: {
        valid: {
          state: 'Correct!',
          diagnosis: 'Good job!',
        },
        invalid: {
          state: 'Wrong!',
          diagnosis: 'Too Bad!',
        },
      },
    };

    const section = server.create('section', {
      id: 'sectionId-1',
      grains: [
        {
          id: 'grainId',
          title: 'title',
          components: [
            {
              type: 'element',
              element: qrocm1,
            },
          ],
        },
      ],
    });

    server.create('module', {
      id: 'def0f7e1-8f4d-4352-a7b3-1cccff1038d6',
      shortId: '3r7cl7m3',
      slug: 'bien-ecrire-son-adresse-mail',
      title: 'Bien écrire son adresse mail',
      isBeta: true,
      sections: [section],
    });

    // when
    const screen = await visit('/modules/3r7cl7m3/bien-ecrire-son-adresse-mail/passage');

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
    const verifyButton = screen.getByRole('button', { name: 'Vérifier ma réponse' });
    await click(verifyButton);

    assert.dom(screen.getByRole('status')).exists();
    const feedback = await screen.findByRole('status');

    // when
    const retryButton = await screen.findByRole('button', { name: 'Réessayer' });
    await click(retryButton);

    // then
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

    const qrocmVerifyButtonCameBack = screen.getByRole('button', { name: 'Vérifier ma réponse' });

    // re-answer select proposal
    await clickByName('Réponse 1');
    await screen.findByRole('listbox');
    await click(
      screen.queryByRole('option', {
        name: "le fournisseur d'adresse mail",
      }),
    );
    await click(qrocmVerifyButtonCameBack);

    await within(feedback).findByText('Wrong!');
    await within(feedback).findByText('Too Bad!');
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
          solutions: ['@'],
        },
        {
          input: 'premiere-partie',
          type: 'select',
          display: 'block',
          placeholder: '',
          ariaLabel: 'Réponse 2',
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
          solutions: ['1'],
        },
      ],
      feedbacks: {
        valid: {
          state: 'Correct!',
          diagnosis: 'Good job!',
        },
        invalid: {
          state: 'Wrong!',
          diagnosis: 'Too Bad!',
        },
      },
    };

    const section = server.create('section', {
      id: 'sectionId-1',
      grains: [
        {
          id: 'grainId',
          title: 'title',
          components: [
            {
              type: 'element',
              element: qrocm1,
            },
          ],
        },
      ],
    });

    server.create('module', {
      id: 'def0f7e1-8f4d-4352-a7b3-1cccff1038d6',
      shortId: '3r7cl7m3',
      slug: 'bien-ecrire-son-adresse-mail',
      title: 'Bien écrire son adresse mail',
      isBeta: false,
      sections: [section],
    });

    // when
    const screen = await visit('/modules/3r7cl7m3/bien-ecrire-son-adresse-mail/passage');

    const verifyButton = screen.queryByRole('button', { name: 'Vérifier ma réponse' });
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
    const retryButton = await screen.findByRole('button', { name: 'Réessayer' });
    await click(retryButton);

    // then
    const qrocmVerifyButtonCameBack = screen.getByRole('button', { name: 'Vérifier ma réponse' });
    await click(qrocmVerifyButtonCameBack);
    const validationAlert = await screen.findByRole('alert');

    assert.strictEqual(validationAlert.innerText, 'Pour valider, veuillez remplir tous les champs réponse.');
  });
});
