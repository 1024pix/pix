import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Ui | Action Bar', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function (assert) {
    //given
    this.information = "Je s'appelle groot";
    this.actions = 'Je suis une action';

    //when
    const screen = await render(
      hbs`<Ui::ActionBar><:information>{{this.information}}</:information><:actions>{{this.actions}}</:actions></Ui::ActionBar>`,
    );
    //then
    assert.dom(screen.getByText("Je s'appelle groot")).exists();
    assert.dom(screen.getByText('Je suis une action')).exists();
  });
});
