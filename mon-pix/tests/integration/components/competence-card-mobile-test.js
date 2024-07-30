import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
// eslint-disable-next-line no-restricted-imports
import { find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | competence-card-mobile', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Component rendering', function (hooks) {
    let area;

    hooks.beforeEach(function () {
      area = EmberObject.create({
        code: 1,
        color: 'jaffa',
      });
    });

    test('should render component', async function (assert) {
      // given
      const scorecard = { area };
      this.set('scorecard', scorecard);

      // when
      await render(hbs`<CompetenceCardMobile @scorecard={{this.scorecard}} />`);

      // then
      assert.dom('.competence-card').exists();
    });

    test('should display the competence card header with scorecard color', async function (assert) {
      // given
      const scorecard = { area };
      this.set('scorecard', scorecard);

      // when
      await render(hbs`<CompetenceCardMobile @scorecard={{this.scorecard}} />`);

      // then
      assert.ok(find('.competence-card__wrapper').getAttribute('class').includes('competence-card__wrapper--jaffa'));
    });

    test('should display the area name', async function (assert) {
      // given
      const scorecard = { area: EmberObject.create({ code: 1, title: 'First Area' }) };
      this.set('scorecard', scorecard);

      // when
      await render(hbs`<CompetenceCardMobile @scorecard={{this.scorecard}} />`);

      // then
      assert.strictEqual(find('.competence-card__area-name').textContent, scorecard.area.title);
    });

    test('should display the competence name', async function (assert) {
      // given
      const scorecard = { area, name: 'First Competence' };
      this.set('scorecard', scorecard);

      // when
      await render(hbs`<CompetenceCardMobile @scorecard={{this.scorecard}} />`);

      // then
      assert.strictEqual(find('.competence-card__competence-name').textContent, scorecard.name);
    });

    test('should display the level', async function (assert) {
      // given
      const scorecard = { area, level: 3 };
      this.set('scorecard', scorecard);

      // when
      await render(hbs`<CompetenceCardMobile @scorecard={{this.scorecard}} />`);

      // then
      assert.strictEqual(find('.score-value').textContent, scorecard.level.toString());
    });

    module('when user can continue the competence', function () {
      module('and the user has reached the maximum level', function (hooks) {
        hooks.beforeEach(async function () {
          // given
          const scorecard = { area, isFinishedWithMaxLevel: false, isStarted: true };
          this.set('scorecard', scorecard);

          // when
          await render(hbs`<CompetenceCardMobile @scorecard={{this.scorecard}} />`);
        });

        test('should not show congrats design', function (assert) {
          // then
          assert.dom('.competence-card__congrats').doesNotExist();
        });
      });
    });

    module('when user has finished the competence', function () {
      module('and the user has reached the maximum level', function (hooks) {
        hooks.beforeEach(async function () {
          // given
          const scorecard = { area, isFinishedWithMaxLevel: true };
          this.set('scorecard', scorecard);

          // when
          await render(hbs`<CompetenceCardMobile @scorecard={{this.scorecard}} />`);
        });

        test('should show congrats design', function (assert) {
          // then
          assert.dom('.competence-card__congrats').exists();
        });
      });
    });
  });
});
