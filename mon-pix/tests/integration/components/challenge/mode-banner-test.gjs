import { render } from '@1024pix/ember-testing-library';
import ModeBanner from 'mon-pix/components/challenge/mode-banner';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Challenge | ModeBanner', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when challenge is focused', function () {
    test('should display the focus mode title and explanation', async function (assert) {
      // when
      const screen = await render(<template><ModeBanner @isFocusedChallenge={{true}} /></template>);

      // then
      assert.dom(screen.getByRole('heading', { level: 2, name: 'Mode focus.' })).exists();
      assert.dom(screen.getByText('Vous devez rester sur cette page pour répondre.')).exists();
      assert.dom(screen.queryByText('Mode libre.')).doesNotExist();
      assert.dom(screen.queryByText('Vous pouvez utiliser internet ou des applications pour répondre.')).doesNotExist();
    });
  });

  module('when challenge is not focused', function () {
    test('should display the free mode title and explanation', async function (assert) {
      // when
      const screen = await render(<template><ModeBanner @isFocusedChallenge={{false}} /></template>);

      // then
      assert.dom(screen.getByRole('heading', { level: 2, name: 'Mode libre.' })).exists();
      assert.dom(screen.getByText('Vous pouvez utiliser internet ou des applications pour répondre.')).exists();
      assert.dom(screen.queryByText('Mode focus.')).doesNotExist();
      assert.dom(screen.queryByText('Vous devez rester sur cette page pour répondre.')).doesNotExist();
    });
  });
});
