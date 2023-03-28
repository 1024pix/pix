import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | levelup-notif', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders', async function (assert) {
    //when
    await render(hbs`<LevelupNotif />`);

    //then
    assert.dom('.levelup__competence').exists();
  });

  test('displays the new reached level and associated competence name', async function (assert) {
    // given
    this.set('newLevel', 2);
    this.set('model', {
      title: "Mener une recherche et une veille d'information",
    });

    // when
    await render(hbs`<LevelupNotif @level={{this.newLevel}} @competenceName={{this.model.title}}/>`);

    // then
    assert.strictEqual(
      find('.levelup-competence__level').innerHTML,
      this.intl.t('pages.levelup-notif.obtained-level', { level: this.newLevel })
    );
    assert.strictEqual(find('.levelup-competence__name').innerHTML, "Mener une recherche et une veille d'information");
  });
});
