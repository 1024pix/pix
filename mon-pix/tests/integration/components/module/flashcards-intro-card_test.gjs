import { clickByName, render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import ModulixFlashcardsIntroCard from 'mon-pix/components/module/element/flashcards/flashcards-intro-card';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Flashcards Intro Card', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display an intro card', async function (assert) {
    // given
    const introImage = {
      url: 'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg',
    };
    const title = 'Introduction à la poésie';

    // when
    const screen = await render(
      <template><ModulixFlashcardsIntroCard @introImage={{introImage}} @title={{title}} /></template>,
    );

    // then
    assert.ok(screen.getByRole('heading', { name: 'Introduction à la poésie' }));
    assert.strictEqual(
      screen.getByRole('presentation').getAttribute('src'),
      'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg',
    );
    assert.dom(screen.getByRole('button', { name: t('pages.modulix.buttons.flashcards.start') })).exists();
  });

  test('should not display image if not provided', async function (assert) {
    // given
    const introImage = undefined;
    const title = 'Introduction à la poésie';

    // when
    const screen = await render(
      <template><ModulixFlashcardsIntroCard @introImage={{introImage}} @title={{title}} /></template>,
    );

    // then
    assert.dom(screen.queryByRole('img')).doesNotExist();
  });

  module('when we click on "Commencer"', function () {
    test('should call the onStart method', async function (assert) {
      // given
      const introImage = undefined;
      const title = 'Introduction à la poésie';
      const onStartStub = sinon.stub();

      await render(
        <template>
          <ModulixFlashcardsIntroCard @introImage={{introImage}} @title={{title}} @onStart={{onStartStub}} />
        </template>,
      );

      // when
      await clickByName(t('pages.modulix.buttons.flashcards.start'));

      // then
      assert.true(onStartStub.calledOnce);
    });
  });
});
