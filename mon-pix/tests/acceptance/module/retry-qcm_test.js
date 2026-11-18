import { visit, within } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'mon-pix/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Module | Routes | retryQcm', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('can retry a QCM', async function (assert) {
    // given
    const qcm = {
      id: 'elementId-1',
      type: 'qcm',
      instruction: 'instruction',
      proposals: [
        { id: '1', content: 'I am the first wrong answer!' },
        { id: '2', content: 'I am the first right answer!' },
        { id: '3', content: 'I am the second right answer!' },
        { id: '4', content: 'I am the second wrong answer!' },
      ],
      feedbacks: {
        valid: {
          state: 'Correct!',
          diagnosis: '<p>Good job!</p>',
        },
        invalid: {
          state: 'Faux',
          diagnosis: '<p>Too Bad!</p>',
        },
      },
      solutions: ['2', '3'],
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
              element: qcm,
            },
          ],
        },
      ],
    });

    server.create('module', {
      id: 'bien-ecrire-son-adresse-mail',
      shortId: 'di4n3c0r',
      slug: 'bien-ecrire-son-adresse-mail',
      title: 'Bien écrire son adresse mail',
      sections: [section],
    });

    const screen = await visit('/modules/di4n3c0r/bien-ecrire-son-adresse-mail/passage');

    const qcmVerifyButton = screen.getByRole('button', { name: 'Vérifier ma réponse' });
    const rightAnswerCheckbox = screen.getByLabelText('I am the second right answer!');
    const wrongAnswerCheckbox = screen.getByLabelText('I am the first wrong answer!');
    const qcmForm = screen.getByRole('group');

    await click(rightAnswerCheckbox);
    await click(wrongAnswerCheckbox);
    await click(qcmVerifyButton);

    const feedback = await screen.findByRole('status');

    // when
    const retryButton = await screen.findByRole('button', { name: 'Réessayer' });
    await click(retryButton);

    // then
    assert.false(qcmForm.disabled);
    assert.false(wrongAnswerCheckbox.checked);
    assert.false(rightAnswerCheckbox.checked);

    const qcmVerifyButtonCameBack = screen.getByRole('button', { name: 'Vérifier ma réponse' });
    await click(wrongAnswerCheckbox);
    await click(rightAnswerCheckbox);
    await click(qcmVerifyButtonCameBack);
    await within(feedback).findByText('Faux');
  });

  test('after retrying a QCM, it display an error message if QCM is validated without response', async function (assert) {
    // given
    const qcm = {
      id: 'elementId-1',
      type: 'qcm',
      instruction: 'instruction',
      proposals: [
        { id: '1', content: 'I am the first wrong answer!' },
        { id: '2', content: 'I am the first right answer!' },
        { id: '3', content: 'I am the second right answer!' },
        { id: '4', content: 'I am the second wrong answer!' },
      ],
      feedbacks: {
        valid: {
          state: 'Correct!',
          diagnosis: '<p>Good job!</p>',
        },
        invalid: {
          state: 'Faux',
          diagnosis: '<p>Too Bad!</p>',
        },
      },
      solutions: ['2', '3'],
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
              element: qcm,
            },
          ],
        },
      ],
    });

    server.create('module', {
      id: 'bien-ecrire-son-adresse-mail',
      shortId: 'di4n3c0r',
      slug: 'bien-ecrire-son-adresse-mail',
      title: 'Bien écrire son adresse mail',
      isBeta: false,
      sections: [section],
    });

    const screen = await visit('/modules/di4n3c0r/bien-ecrire-son-adresse-mail/passage');

    const qcmVerifyButton = screen.getByRole('button', { name: 'Vérifier ma réponse' });
    const rightAnswerCheckbox = screen.getByLabelText('I am the second right answer!');
    const wrongAnswerCheckbox = screen.getByLabelText('I am the first wrong answer!');
    const qcmForm = screen.getByRole('group');

    await click(rightAnswerCheckbox);
    await click(wrongAnswerCheckbox);
    await click(qcmVerifyButton);

    assert.dom(screen.getByRole('status')).exists();

    // when
    const retryButton = await screen.findByRole('button', { name: 'Réessayer' });
    await click(retryButton);

    // then
    assert.false(qcmForm.disabled);
    assert.false(wrongAnswerCheckbox.checked);
    assert.false(rightAnswerCheckbox.checked);

    const qcmVerifyButtonCameBack = screen.getByRole('button', { name: 'Vérifier ma réponse' });
    await click(qcmVerifyButtonCameBack);
    const validationAlert = await screen.findByRole('alert');
    assert.strictEqual(validationAlert.innerText, 'Pour valider, sélectionnez au moins deux réponses.');
  });
});
