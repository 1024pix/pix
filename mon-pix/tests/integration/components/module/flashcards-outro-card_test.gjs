import { clickByName, render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import ModulixFlashcardsOutroCard from 'mon-pix/components/module/element/flashcards/flashcards-outro-card';
// eslint-disable-next-line no-restricted-imports
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Flashcards Outro Card', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display an outro card', async function (assert) {
    // given
    const counters = { yes: 1, almost: 2, no: 1 };
    const title = 'Introduction à la poésie';

    // when

    const screen = await render(
      <template><ModulixFlashcardsOutroCard @counters={{counters}} @title={{title}} /></template>,
    );

    // then
    assert.ok(screen.getByText('Introduction à la poésie'));
    assert.ok(screen.getByText(`Oui ! : ${counters.yes}`));
    assert.ok(screen.getByText(`Presque : ${counters.almost}`));
    assert.ok(screen.getByText(`Pas du tout : ${counters.no}`));
    assert.dom(screen.getByRole('button', { name: t('pages.modulix.buttons.flashcards.retry') })).exists();
  });

  module('when we click on "Réessayer"', function () {
    test('should call the onRetry method', async function (assert) {
      // given
      const title = 'Introduction à la poésie';
      const onRetryStub = sinon.stub();

      await render(<template><ModulixFlashcardsOutroCard @title={{title}} @onRetry={{onRetryStub}} /></template>);

      // when
      await clickByName(t('pages.modulix.buttons.flashcards.retry'));

      // then
      assert.true(onRetryStub.calledOnce);
    });
  });
});
