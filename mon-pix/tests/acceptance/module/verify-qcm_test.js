import { visit } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'mon-pix/tests/test-support/setup-mirage';
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
      feedbacks: {
        valid: {
          state: "Bravo ! C'est la bonne réponse.",
          diagnosis: '<p>Félicitations</p>',
        },
        invalid: {
          state: 'Pas ouf',
          diagnosis: '<p>Too Bad!</p>',
        },
      },
      solutions: ['2', '3'],
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
      feedbacks: {
        valid: {
          state: "Bravo ! C'est la bonne réponse.",
          diagnosis: '<p>Félicitations</p>',
        },
        invalid: {
          state: 'Pas ouf',
          diagnosis: '<p>Too Bad!</p>',
        },
      },
      solutions: ['1', '3'],
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
              element: qcm1,
            },
            {
              type: 'element',
              element: qcm2,
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
      sections: [section],
    });

    server.create('correction-response', {
      id: 'elementId-1',
      feedback: { state: "Bravo ! C'est la bonne réponse." },
      status: 'ok',
      solution: [qcm1.proposals[1].id, qcm1.proposals[2].id],
    });

    server.create('correction-response', {
      id: 'elementId-2',
      feedback: { state: 'Pas ouf' },
      status: 'ko',
      solution: [qcm2.proposals[0].id, qcm2.proposals[2].id],
    });

    // when
    const screen = await visit('/modules/3r7cl7m3/bien-ecrire-son-adresse-mail/passage');
    const allVerifyButtons = screen.getAllByRole('button', { name: 'Vérifier ma réponse' });
    const [firstQcmVerifyButton, nextQcmVerifyButton] = allVerifyButtons;

    // when
    await click(screen.getByLabelText('I am the first right answer!'));
    await click(screen.getByLabelText('I am the second right answer!'));
    await click(firstQcmVerifyButton);

    // then
    assert.dom(await screen.findByText("Bravo ! C'est la bonne réponse.")).exists();

    // when
    await click(screen.getByLabelText('I am the first wrong answer!'));
    await click(screen.getByLabelText('Click Me!'));
    await click(nextQcmVerifyButton);

    // then
    assert.dom(await screen.findByText('Pas ouf')).exists();
  });
});
