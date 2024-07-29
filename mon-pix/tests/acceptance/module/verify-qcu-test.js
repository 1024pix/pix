import { visit } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Acceptance | Module | Routes | verifyQcu', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('can validate my QCU answer', async function (assert) {
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

    const grain = server.create('grain', {
      id: 'grainId',
      title: 'title',
      components: [
        {
          type: 'element',
          element: qcu1,
        },
        {
          type: 'element',
          element: qcu2,
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
      feedback: "Bravo ! C'est la bonne réponse.",
      status: 'ok',
      solution: qcu1.proposals[1].id,
    });

    server.create('correction-response', {
      id: 'elementId-2',
      feedback: 'Pas ouf',
      status: 'ko',
      solution: qcu2.proposals[0].id,
    });

    // when
    const screen = await visit('/modules/bien-ecrire-son-adresse-mail/passage');
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
