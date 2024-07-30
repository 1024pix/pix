import { render } from '@1024pix/ember-testing-library';
import Issue from 'junior/components/issue';
import { setupRenderingTest } from 'junior/helpers/tests';
import { module, test } from 'qunit';

module('Integration | Component | Issue', function (hooks) {
  setupRenderingTest(hooks);

  test('should display the given message', async function (assert) {
    // given
    const message = 'Message from the wonderful robot !';
    // when
    const screen = await render(<template><Issue @message={{message}} /></template>);

    assert.dom(screen.getByText(message)).exists();
  });
});
