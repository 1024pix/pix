import { visit } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Acceptance | Module | Routes | retryQcu', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('can retry a QCU', async function (assert) {
    // given
    const qcu1 = {
      id: 'elementId-1',
      type: 'qcu',
      instruction: 'instruction',
      proposals: [
        { id: '1', content: 'I am the wrong answer!' },
        { id: '2', content: 'I am the right answer!' },
      ],
    };
    const qcu2 = {
      id: 'elementId-2',
      type: 'qcu',
      instruction: 'instruction',
      proposals: [
        { id: '1', content: 'Vrai' },
        { id: '2', content: 'Faux' },
      ],
    };

    const grain1 = server.create('grain', {
      id: 'grainId1',
      title: 'title',
      components: [
        {
          type: 'element',
          element: qcu1,
        },
      ],
    });

    const grain2 = server.create('grain', {
      id: 'grainId2',
      title: 'title',
      components: [
        {
          type: 'element',
          element: qcu2,
        },
      ],
    });

    server.create('module', {
      id: 'bien-ecrire-son-adresse-mail',
      title: 'Bien écrire son adresse mail',
      grains: [grain1, grain2],
    });

    server.create('correction-response', {
      id: 'elementId-1',
      feedback: 'Faux',
      status: 'ko',
      solution: qcu1.proposals[1].id,
    });

    const screen = await visit('/modules/bien-ecrire-son-adresse-mail/passage');

    const firstQcuVerifyButton = screen.getByRole('button', { name: 'Vérifier' });
    const rightAnswerRadio = screen.getByLabelText('I am the right answer!');
    const wrongAnswerRadio = screen.getByLabelText('I am the wrong answer!');
    const firstQcuForm = screen.getByRole('group');

    await click(wrongAnswerRadio);
    await click(firstQcuVerifyButton);

    assert.dom(screen.getByRole('status')).exists();

    // when
    const retryButton = screen.getByRole('button', { name: 'Réessayer' });
    await click(retryButton);

    // then
    assert.strictEqual(screen.queryByRole('status').innerText, '');
    assert.false(firstQcuForm.disabled);
    assert.false(wrongAnswerRadio.checked);
    assert.false(rightAnswerRadio.checked);

    const firstQcuVerifyButtonCameBack = screen.getByRole('button', { name: 'Vérifier' });
    await click(wrongAnswerRadio);
    await click(firstQcuVerifyButtonCameBack);
    assert.strictEqual(screen.queryByRole('status').innerText, 'Faux');
  });

  test('after retrying a QCU, it display an error message if QCU is validated without response', async function (assert) {
    // given
    const qcu1 = {
      id: 'elementId-1',
      type: 'qcu',
      instruction: 'instruction',
      proposals: [
        { id: '1', content: 'I am the wrong answer!' },
        { id: '2', content: 'I am the right answer!' },
      ],
    };
    const qcu2 = {
      id: 'elementId-2',
      type: 'qcu',
      instruction: 'instruction',
      proposals: [
        { id: '1', content: 'Vrai' },
        { id: '2', content: 'Faux' },
      ],
    };

    const grain1 = server.create('grain', {
      id: 'grainId1',
      title: 'title',
      type: 'activity',
      components: [
        {
          type: 'element',
          element: qcu1,
        },
      ],
    });

    const grain2 = server.create('grain', {
      id: 'grainId2',
      title: 'title',
      type: 'activity',
      components: [
        {
          type: 'element',
          element: qcu2,
        },
      ],
    });

    server.create('module', {
      id: 'bien-ecrire-son-adresse-mail',
      title: 'Bien écrire son adresse mail',
      grains: [grain1, grain2],
    });

    // look at mirage
    server.create('correction-response', {
      id: 'elementId-1',
      feedback: 'Faux',
      status: 'ko',
      solution: qcu1.proposals[1].id,
    });

    const screen = await visit('/modules/bien-ecrire-son-adresse-mail/passage');

    const firstQcuVerifyButton = screen.getByRole('button', { name: 'Vérifier' });
    const rightAnswerRadio = screen.getByLabelText('I am the right answer!');
    const wrongAnswerRadio = screen.getByLabelText('I am the wrong answer!');
    const firstQcuForm = screen.getByRole('group');

    await click(wrongAnswerRadio);
    await click(firstQcuVerifyButton);

    assert.dom(screen.getByRole('status')).exists();

    // when
    const retryButton = screen.getByRole('button', { name: 'Réessayer' });
    await click(retryButton);

    // then
    assert.strictEqual(screen.queryByRole('status').innerText, '');
    assert.false(firstQcuForm.disabled);
    assert.false(wrongAnswerRadio.checked);
    assert.false(rightAnswerRadio.checked);

    const firstQcuVerifyButtonCameBack = screen.getByRole('button', { name: 'Vérifier' });
    await click(firstQcuVerifyButtonCameBack);
    const validationAlert = screen.queryAllByRole('alert')[1];

    assert.strictEqual(validationAlert.innerText, 'Pour valider, sélectionnez une réponse.');
  });
});
