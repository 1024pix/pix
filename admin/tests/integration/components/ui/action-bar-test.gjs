import { render } from '@1024pix/ember-testing-library';
import ActionBar from 'pix-admin/components/ui/action-bar';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Ui | Action Bar', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function (assert) {
    //given
    const information = "Je s'appelle groot";
    const actions = 'Je suis une action';

    //when
    const screen = await render(
      <template>
        <ActionBar><:information>{{information}}</:information><:actions>{{actions}}</:actions></ActionBar>
      </template>,
    );
    //then
    assert.dom(screen.getByText("Je s'appelle groot")).exists();
    assert.dom(screen.getByText('Je suis une action')).exists();
  });
});
