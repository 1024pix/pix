import {render} from '@1024pix/ember-testing-library';
import {t} from 'ember-intl/test-support';
import ModulixFlashcards from 'mon-pix/components/module/element/flashcards';
// eslint-disable-next-line no-restricted-imports
import {module, test} from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Flashcards', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display the given card', async function (assert) {
    // given
    const flashcards = {
      id: '71de6394-ff88-4de3-8834-a40057a50ff4',
      type: 'flashcards',
      title: "Introduction à l'adresse e-mail",
      instruction: '<p>...</p>',
      introImage: { url: 'https://images.pix.fr/modulix/placeholder-details.svg' },
      cards: [
        {
          id: 'e1de6394-ff88-4de3-8834-a40057a50ff4',
          recto: {
            image: {
              url: 'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg',
            },
            text: "A quoi sert l'arobase dans mon adresse email ?",
          },
          verso: {
            image: { url: 'https://images.pix.fr/modulix/didacticiel/ordi-spatial.svg' },
            text: "Parce que c'est joli",
          },
        },
      ],
    };

    // when
    const screen = await render(<template><ModulixFlashcards @flashcards={{flashcards}} /></template>);

    // then
    assert.ok(screen.getByText("A quoi sert l'arobase dans mon adresse email ?"));
    assert.strictEqual(
      screen.getByRole('presentation').getAttribute('src'),
      'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg',
    );
    assert.dom(screen.getByRole('button', { name: t('pages.modulix.buttons.flashcards.seeAnswer') })).exists();
    assert.ok(screen.getByText(t('pages.modulix.flashcards.direction')));
    assert.ok(screen.getByText(t('pages.modulix.flashcards.position', { currentCardPosition: 1, totalCards: 1 })));
  });
});
