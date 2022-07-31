import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, findAll, render } from '@ember/test-helpers';
import { A } from '@ember/array';
import EmberObject from '@ember/object';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | learning-more-panel', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when there is at least one learningMore item', function () {
    test('renders a list item when there is at least one learningMore item', async function (assert) {
      // given
      this.set('learningMoreTutorials', [{ titre: 'Ceci est un tuto', duration: '20:00:00', type: 'video' }]);

      // when
      await render(hbs`<LearningMorePanel @learningMoreTutorials={{this.learningMoreTutorials}}/>`);

      // then
      assert.equal(findAll('.learning-more-panel__container').length, 1);
      assert.equal(findAll('.learning-more-panel__list-container').length, 1);
      assert.dom(find('.learning-more-panel__container').textContent).hasText(this.intl.t('pages.learning-more.title'));
    });

    module('when newTutorials FT is enabled', function () {
      test('should display a list of new tutorial cards', async function (assert) {
        // given
        const tuto1 = EmberObject.create({
          title: 'Tuto 1.1',
          tubeName: '@first_tube',
          tubePracticalTitle: 'Practical Title',
          duration: '00:15:10',
        });

        const tutorials = A([tuto1]);

        this.set('learningMoreTutorials', tutorials);

        // when
        await render(hbs`<LearningMorePanel @learningMoreTutorials={{this.learningMoreTutorials}} />`);

        // then
        assert.equal(findAll('.tutorial-card-v2').length, 1);
      });
    });
  });

  test('should not render a list when there is no LearningMore elements', async function (assert) {
    // given
    this.set('learningMoreTutorials', null);

    // when
    await render(hbs`<LearningMorePanel @learningMoreTutorials={{this.learningMoreTutorials}}/>`);

    // then
    assert.equal(findAll('.learning-more-panel__container'), 0);
  });
});
