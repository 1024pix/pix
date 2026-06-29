import { render } from '@1024pix/ember-testing-library';
import { A } from '@ember/array';
import EmberObject from '@ember/object';
// eslint-disable-next-line no-restricted-imports
import { find } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import LearningMorePanel from 'mon-pix/components/learning-more-panel';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | learning-more-panel', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when there is at least one learningMore item', function () {
    test('renders a list item when there is at least one learningMore item', async function (assert) {
      // given
      const learningMoreTutorials = [
        {
          link: 'https://example.net/1',
          titre: 'Ceci est un tuto',
          duration: '20:00:00',
          format: 'video',
        },
      ];

      // when
      await render(<template><LearningMorePanel @learningMoreTutorials={{learningMoreTutorials}} /></template>);

      // then
      assert.dom('.learning-more-panel__container').exists({ count: 1 });
      assert.dom('.learning-more-panel__list-container').exists({ count: 1 });
      assert.ok(find('.learning-more-panel__container').textContent.includes(t('pages.learning-more.title')));
    });

    module('when newTutorials FT is enabled', function () {
      test('should display a list of new tutorial cards', async function (assert) {
        // given
        const tuto1 = EmberObject.create({
          title: 'Tuto 1.1',
          link: 'https://example.net/1',
          tubeName: '@first_tube',
          tubePracticalTitle: 'Practical Title',
          duration: '00:15:10',
          format: 'page',
        });

        const learningMoreTutorials = A([tuto1]);

        // when
        await render(<template><LearningMorePanel @learningMoreTutorials={{learningMoreTutorials}} /></template>);

        // then
        assert.dom('.tutorial-card').exists({ count: 1 });
      });
    });
  });

  test('should not render a list when there is no LearningMore elements', async function (assert) {
    // given
    const learningMoreTutorials = null;

    // when
    await render(<template><LearningMorePanel @learningMoreTutorials={{learningMoreTutorials}} /></template>);

    // then
    assert.dom('.learning-more-panel__container').doesNotExist();
  });
});
