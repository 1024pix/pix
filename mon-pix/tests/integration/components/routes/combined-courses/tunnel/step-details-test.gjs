import { render } from '@1024pix/ember-testing-library';
import StepDetails from 'mon-pix/components/combined-course/tunnel/step-details';
import { CombinedCourseItemTypes } from 'mon-pix/models/combined-course-item';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering.js';

module('Integration | Component | Combined Courses | Tunnel | Step-details', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('in all cases', function () {
    test('should display iconUrl, description, title, objectives, level, duration, when data is provided', async function (assert) {
      // when
      const store = this.owner.lookup('service:store');

      const item = store.createRecord('combined-course-item', {
        id: 1,
        type: CombinedCourseItemTypes.CAMPAIGN,
        image: 'http://www.duckduck.fr',
        description: 'Item description',
        objectives: ['<p>Objectif 1</p>'],
        level: 'advanced',
        duration: 20,
      });
      const screen = await render(<template><StepDetails @item={{item}} /></template>);

      // then
      assert.ok(screen.getByRole('presentation'));
      assert.ok(screen.getByRole('paragraph'), { name: item.description });
      assert.ok(screen.getByRole('heading', { name: item.title }));
      assert.ok(screen.getByText(item.objectives[0], { exact: false }));
      assert.ok(screen.getByText(item.objectives[0], { exact: false }));
      assert.ok(screen.getByText(item.objectives[0], { exact: false }));
    });

    // TODO test('should have a correct display when data is not provided', function () {});
  });
});
