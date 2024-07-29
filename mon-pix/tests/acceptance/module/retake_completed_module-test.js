import { visit } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Acceptance | Module | Routes | retakeCompletedModule', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('should reset activities when I retake a completed module', async function (assert) {
    // given
    const qcu = {
      id: 'elementId-1',
      type: 'qcu',
      instruction: 'instruction',
      isAnswerable: true,
      proposals: [
        { id: 'qcu-1-proposal-1', content: 'I am the wrong answer!' },
        { id: 'qcu-1-proposal-2', content: 'I am the right answer!' },
      ],
    };

    const grain1 = server.create('grain', {
      id: 'grainId1',
      title: 'title',
      components: [
        {
          type: 'element',
          element: qcu,
        },
      ],
    });

    const text = {
      id: 'elementId-1',
      type: 'text',
      content: 'content-1',
      isAnswerable: false,
    };

    const grain2 = server.create('grain', {
      id: 'grainId2',
      title: 'title',
      components: [
        {
          type: 'element',
          element: text,
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
      feedback: "Bravo ! C'est la bonne réponse.",
      status: 'ok',
      solution: 'qcu-1-proposal-2',
    });

    // when
    const screen = await visit('/modules/bien-ecrire-son-adresse-mail/passage');
    await click(screen.getByLabelText('I am the right answer!'));

    const verifyButton = screen.getByRole('button', { name: 'Vérifier' });
    await click(verifyButton);

    assert.dom(screen.queryByText("Bravo ! C'est la bonne réponse.")).exists();

    const continueButton = screen.getByRole('button', { name: 'Continuer' });
    await click(continueButton);

    const terminateButton = screen.getByRole('button', { name: 'Terminer' });
    await click(terminateButton);

    const backToDetailsButton = screen.getByRole('link', { name: 'Revenir aux détails du module' });
    await click(backToDetailsButton);

    const startModuleButton = screen.getByRole('link', { name: 'Commencer le module' });
    await click(startModuleButton);

    // then
    assert.dom(screen.queryByText("Bravo ! C'est la bonne réponse.")).doesNotExist();

    assert.dom(screen.queryByRole('button', { name: 'Continuer' })).doesNotExist();
    assert.dom(screen.queryByRole('button', { name: 'Passer' })).exists();
  });
});
