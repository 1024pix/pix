import { visit } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'mon-pix/tests/test-support/setup-mirage';
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
        { id: '1', content: 'I am the wrong answer!', feedback: { state: 'Faux' } },
        { id: '2', content: 'I am the right answer!', feedback: { state: "Bravo ! C'est la bonne réponse." } },
      ],
      solution: '2',
    };
    const qcu2 = {
      id: 'elementId-2',
      type: 'qcu',
      instruction: 'instruction',
      proposals: [
        { id: '1', content: 'Vrai', feedback: { state: 'Vrai' } },
        { id: '2', content: 'Faux', feedback: { state: 'Pas ouf' } },
      ],
      solution: '1',
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
              element: qcu1,
            },
            {
              type: 'element',
              element: qcu2,
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

    // when
    const screen = await visit('/modules/3r7cl7m3/bien-ecrire-son-adresse-mail/passage');
    const allVerifyButtons = screen.getAllByRole('button', { name: 'Vérifier ma réponse' });
    const [firstQcuVerifyButton, nextQcuVerifyButton] = allVerifyButtons;

    // when
    await click(screen.getByLabelText('I am the right answer!'));
    await click(firstQcuVerifyButton);

    // then
    assert.dom(await screen.findByText("Bravo ! C'est la bonne réponse.")).exists();

    // when
    await click(screen.getByLabelText('Faux'));
    await click(nextQcuVerifyButton);

    // then
    assert.dom(await screen.findByText('Pas ouf')).exists();
  });
});
