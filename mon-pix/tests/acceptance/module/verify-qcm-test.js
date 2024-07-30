import { visit } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Acceptance | Module | Routes | verifyQcm', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('can validate my QCM answer', async function (assert) {
    // given
    const qcm1 = {
      id: 'elementId-1',
      type: 'qcm',
      instruction: 'instruction',
      proposals: [
        { id: '1', content: 'I am one of the wrong answers!' },
        { id: '2', content: 'I am the first right answer!' },
        { id: '3', content: 'I am the second right answer!' },
        { id: '4', content: 'I am one of the wrong answers!' },
      ],
    };
    const qcm2 = {
      id: 'elementId-2',
      type: 'qcm',
      instruction: 'instruction',
      proposals: [
        { id: '1', content: 'I am one of the right answers!' },
        { id: '2', content: 'I am the first wrong answer!' },
        { id: '3', content: 'Click Me!' },
        { id: '4', content: 'I am the second wrong answer!' },
      ],
    };

    const grain = server.create('grain', {
      id: 'grainId',
      title: 'title',
      components: [
        {
          type: 'element',
          element: qcm1,
        },
        {
          type: 'element',
          element: qcm2,
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
      solution: [qcm1.proposals[1].id, qcm1.proposals[2].id],
    });

    server.create('correction-response', {
      id: 'elementId-2',
      feedback: 'Pas ouf',
      status: 'ko',
      solution: [qcm2.proposals[0].id, qcm2.proposals[2].id],
    });

    // when
    const screen = await visit('/modules/bien-ecrire-son-adresse-mail/passage');
    const allVerifyButtons = screen.getAllByRole('button', { name: 'Vérifier' });
    const [firstQcmVerifyButton, nextQcmVerifyButton] = allVerifyButtons;

    // when
    await click(screen.getByLabelText('I am the first right answer!'));
    await click(screen.getByLabelText('I am the second right answer!'));
    await click(firstQcmVerifyButton);

    // then
    assert.dom(screen.getByText("Bravo ! C'est la bonne réponse.")).exists();

    // when
    await click(screen.getByLabelText('I am the first wrong answer!'));
    await click(screen.getByLabelText('Click Me!'));
    await click(nextQcmVerifyButton);

    // then
    assert.dom(screen.getByText('Pas ouf')).exists();
  });
});
