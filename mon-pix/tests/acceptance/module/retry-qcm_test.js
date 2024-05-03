import { visit } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Acceptance | Module | Routes | retryQcm', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('with elements', function () {
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
      };

      const grain = server.create('grain', {
        id: 'grainId',
        title: 'title',
        elements: [qcm],
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
        solution: [qcm.proposals[1].id, qcm.proposals[2].id],
      });

      const screen = await visit('/modules/bien-ecrire-son-adresse-mail/passage');

      const qcmVerifyButton = screen.getByRole('button', { name: 'Vérifier' });
      const rightAnswerCheckbox = screen.getByLabelText('I am the second right answer!');
      const wrongAnswerCheckbox = screen.getByLabelText('I am the first wrong answer!');
      const qcmForm = screen.getByRole('group');

      await click(rightAnswerCheckbox);
      await click(wrongAnswerCheckbox);
      await click(qcmVerifyButton);

      assert.dom(screen.getByRole('status')).exists();

      // when
      const retryButton = screen.getByRole('button', { name: 'Réessayer' });
      await click(retryButton);

      // then
      assert.strictEqual(screen.queryByRole('status').innerText, '');
      assert.false(qcmForm.disabled);
      assert.false(wrongAnswerCheckbox.checked);
      assert.false(rightAnswerCheckbox.checked);

      const qcmVerifyButtonCameBack = screen.getByRole('button', { name: 'Vérifier' });
      await click(wrongAnswerCheckbox);
      await click(rightAnswerCheckbox);
      await click(qcmVerifyButtonCameBack);
      assert.strictEqual(screen.queryByRole('status').innerText, 'Faux');
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
      };

      const grain = server.create('grain', {
        id: 'grainId',
        title: 'title',
        elements: [qcm],
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
        solution: [qcm.proposals[1].id, qcm.proposals[2].id],
      });

      const screen = await visit('/modules/bien-ecrire-son-adresse-mail/passage');

      const qcmVerifyButton = screen.getByRole('button', { name: 'Vérifier' });
      const rightAnswerCheckbox = screen.getByLabelText('I am the second right answer!');
      const wrongAnswerCheckbox = screen.getByLabelText('I am the first wrong answer!');
      const qcmForm = screen.getByRole('group');

      await click(rightAnswerCheckbox);
      await click(wrongAnswerCheckbox);
      await click(qcmVerifyButton);

      assert.dom(screen.getByRole('status')).exists();

      // when
      const retryButton = screen.getByRole('button', { name: 'Réessayer' });
      await click(retryButton);

      // then
      assert.strictEqual(screen.queryByRole('status').innerText, '');
      assert.false(qcmForm.disabled);
      assert.false(wrongAnswerCheckbox.checked);
      assert.false(rightAnswerCheckbox.checked);

      const qcmVerifyButtonCameBack = screen.getByRole('button', { name: 'Vérifier' });
      await click(qcmVerifyButtonCameBack);
      const validationAlert = screen.queryAllByRole('alert')[1];

      assert.strictEqual(validationAlert.innerText, 'Pour valider, sélectionnez au moins deux réponses.');
    });
  });

  module('with components', function () {
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
      };

      const grain = server.create('grain', {
        id: 'grainId',
        title: 'title',
        components: [
          {
            type: 'element',
            element: qcm,
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
        solution: [qcm.proposals[1].id, qcm.proposals[2].id],
      });

      const screen = await visit('/modules/bien-ecrire-son-adresse-mail/passage');

      const qcmVerifyButton = screen.getByRole('button', { name: 'Vérifier' });
      const rightAnswerCheckbox = screen.getByLabelText('I am the second right answer!');
      const wrongAnswerCheckbox = screen.getByLabelText('I am the first wrong answer!');
      const qcmForm = screen.getByRole('group');

      await click(rightAnswerCheckbox);
      await click(wrongAnswerCheckbox);
      await click(qcmVerifyButton);

      assert.dom(screen.getByRole('status')).exists();

      // when
      const retryButton = screen.getByRole('button', { name: 'Réessayer' });
      await click(retryButton);

      // then
      assert.strictEqual(screen.queryByRole('status').innerText, '');
      assert.false(qcmForm.disabled);
      assert.false(wrongAnswerCheckbox.checked);
      assert.false(rightAnswerCheckbox.checked);

      const qcmVerifyButtonCameBack = screen.getByRole('button', { name: 'Vérifier' });
      await click(wrongAnswerCheckbox);
      await click(rightAnswerCheckbox);
      await click(qcmVerifyButtonCameBack);
      assert.strictEqual(screen.queryByRole('status').innerText, 'Faux');
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
      };

      const grain = server.create('grain', {
        id: 'grainId',
        title: 'title',
        components: [
          {
            type: 'element',
            element: qcm,
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
        solution: [qcm.proposals[1].id, qcm.proposals[2].id],
      });

      const screen = await visit('/modules/bien-ecrire-son-adresse-mail/passage');

      const qcmVerifyButton = screen.getByRole('button', { name: 'Vérifier' });
      const rightAnswerCheckbox = screen.getByLabelText('I am the second right answer!');
      const wrongAnswerCheckbox = screen.getByLabelText('I am the first wrong answer!');
      const qcmForm = screen.getByRole('group');

      await click(rightAnswerCheckbox);
      await click(wrongAnswerCheckbox);
      await click(qcmVerifyButton);

      assert.dom(screen.getByRole('status')).exists();

      // when
      const retryButton = screen.getByRole('button', { name: 'Réessayer' });
      await click(retryButton);

      // then
      assert.strictEqual(screen.queryByRole('status').innerText, '');
      assert.false(qcmForm.disabled);
      assert.false(wrongAnswerCheckbox.checked);
      assert.false(rightAnswerCheckbox.checked);

      const qcmVerifyButtonCameBack = screen.getByRole('button', { name: 'Vérifier' });
      await click(qcmVerifyButtonCameBack);
      const validationAlert = screen.queryAllByRole('alert')[1];

      assert.strictEqual(validationAlert.innerText, 'Pour valider, sélectionnez au moins deux réponses.');
    });
  });
});
