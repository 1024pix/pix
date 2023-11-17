import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit } from '@1024pix/ember-testing-library';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { click } from '@ember/test-helpers';

module('Acceptance | Module | Routes | verifyQcu', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('can validate my QCU answer', async function (assert) {
    // given
    const qcu1 = server.create('qcu', {
      id: 'elementId-1',
      type: 'qcus',
      instruction: 'instruction',
      proposals: [
        { id: 'qcu-1-proposal-1', content: 'I am the wrong answer!' },
        { id: 'qcu-1-proposal-2', content: 'I am the right answer!' },
      ],
    });
    const qcu2 = server.create('qcu', {
      id: 'elementId-2',
      type: 'qcus',
      instruction: 'instruction',
      proposals: [
        { id: 'qcu-2-proposal-1', content: 'Vrai' },
        { id: 'qcu-2-proposal-2', content: 'Faux' },
      ],
    });

    const grain = server.create('grain', {
      id: 'grainId',
      title: 'title',
      elements: [qcu1, qcu2],
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
      solutionId: 'qcu-1-proposal-2',
    });

    server.create('correction-response', {
      id: 'elementId-2',
      feedback: 'Pas ouf',
      status: 'ko',
      solutionId: 'qcu-2-proposal-1',
    });

    // when
    const screen = await visit('/modules/bien-ecrire-son-adresse-mail');
    const allVerifyButtons = screen.getAllByRole('button', { name: 'Vérifier' });
    const [firstQcuVerifyButton, nextQcuVerifyButton] = allVerifyButtons;

    // when
    await click(screen.getByLabelText('I am the right answer!'));
    await click(firstQcuVerifyButton);

    // then
    assert.dom(screen.getByText("Bravo ! C'est la bonne réponse.")).exists();

    // when
    await click(screen.getByLabelText('Faux'));
    await click(nextQcuVerifyButton);

    // then
    assert.dom(screen.getByText('Pas ouf')).exists();
  });
});
