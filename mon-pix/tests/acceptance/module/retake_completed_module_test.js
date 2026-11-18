import { visit } from '@1024pix/ember-testing-library';
import { click, waitUntil } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'mon-pix/tests/test-support/setup-mirage';
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
        { id: 'qcu-1-proposal-1', content: 'I am the wrong answer!', feedback: { state: 'wrong answer' } },
        {
          id: 'qcu-1-proposal-2',
          content: 'I am the right answer!',
          feedback: { state: "Bravo ! C'est la bonne réponse." },
        },
      ],
      solution: 'qcu-1-proposal-2',
    };

    const grain1 = {
      id: 'grainId1',
      title: 'title',
      components: [
        {
          type: 'element',
          element: qcu,
        },
      ],
    };

    const text = {
      id: 'elementId-1',
      type: 'text',
      content: 'content-1',
      isAnswerable: false,
      tag: ' ',
    };

    const grain2 = {
      id: 'grainId2',
      title: 'title',
      components: [
        {
          type: 'element',
          element: text,
        },
      ],
    };

    const section = server.create('section', {
      id: 'sectionId-1',
      grains: [grain1, grain2],
    });

    server.create('module', {
      id: 'bien-ecrire-son-adresse-mail',
      shortId: 'di4n3c0r',
      slug: 'bien-ecrire-son-adresse-mail',
      title: 'Bien écrire son adresse mail',
      details: { tabletSupport: 'comfortable' },
      sections: [section],
    });

    server.create('correction-response', {
      id: 'elementId-1',
      feedback: { state: "Bravo ! C'est la bonne réponse." },
      status: 'ok',
      solution: 'qcu-1-proposal-2',
    });

    // when
    let screen = await visit('/modules/di4n3c0r/bien-ecrire-son-adresse-mail/passage');
    await click(screen.getByLabelText('I am the right answer!'));

    const verifyButton = screen.getByRole('button', { name: 'Vérifier ma réponse' });
    await click(verifyButton);

    assert.dom(await screen.findByText("Bravo ! C'est la bonne réponse.")).exists();
    const continueButton = screen.getByRole('button', { name: 'Continuer' });
    await click(continueButton);

    const terminateButton = screen.getByRole('button', { name: 'Terminer' });
    await click(terminateButton);

    await waitUntil(() => {
      return screen.queryByRole('heading', { name: 'Module terminé !', level: 1 });
    });

    screen = await visit('/modules/di4n3c0r/bien-ecrire-son-adresse-mail/');

    const startModuleButton = screen.getByRole('button', { name: 'Commencer le module' });
    await click(startModuleButton);

    // then
    assert.dom(screen.queryByText("Bravo ! C'est la bonne réponse.")).doesNotExist();

    assert.dom(screen.queryByRole('button', { name: 'Continuer' })).doesNotExist();
    assert.dom(screen.getByRole('button', { name: 'Passer l’activité' })).exists();
  });
});
