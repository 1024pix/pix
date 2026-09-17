import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import CombinedCourseTunnel from 'mon-pix/components/routes/combined-courses/tunnel';
import { CombinedCourseItemTypes } from 'mon-pix/models/combined-course-item';
import { module, test } from 'qunit';

import { CombinedCourseStatuses } from '../../../../../models/combined-course.js';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering.js';

module('Integration | Component | Combined Courses | Tunnel', function (hooks) {
  setupIntlRenderingTest(hooks);
  let combinedCourseItems, store;
  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');

    combinedCourseItems = store.createRecord('combined-course-item', {
      id: 0,
      type: CombinedCourseItemTypes.CAMPAIGN,
      title: 'Ma campagne',
    });
  });

  module('in all cases', function () {
    test('should display exit button', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      this.owner.lookup('service:router');

      const combinedCourse = store.createRecord('combined-course', {
        id: 1,
        status: 'NOT_STARTED',
        code: 'COMBINIX9',
        name: 'Combinix',
        items: [combinedCourseItems],
      });

      // when
      const screen = await render(<template><CombinedCourseTunnel @combinedCourse={{combinedCourse}} /></template>);

      // then
      const link = screen.getByRole('link', { name: t('common.actions.quit') });
      assert.dom(link).hasAttribute('href', '/');
    });
  });

  module('when participation is started', function () {
    test('should display completed status for finished items', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const combinedCourseItem = store.createRecord('combined-course-item', {
        id: 1,
        title: 'mon module',
        reference: 'mon-module',
        type: 'MODULE',
        isCompleted: true,
      });

      const combinedCourse = store.createRecord('combined-course', {
        id: 1,
        status: CombinedCourseStatuses.STARTED,
        code: 'COMBINIX9',
      });

      combinedCourse.items.push(combinedCourseItem);

      // when
      const screen = await render(<template><CombinedCourseTunnel @combinedCourse={{combinedCourse}} /></template>);

      // then
      assert.ok(screen.getByText(t('pages.combined-courses.items.completed')));
    });
  });

  module('when items are of different types', function () {
    test('should display steps', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      const combinedCourse = store.createRecord('combined-course', {
        id: 1,
        status: CombinedCourseStatuses.STARTED,
        code: 'COMBINIX9',
      });

      const campaignCombinedCourseItem = store.createRecord('combined-course-item', {
        id: 1,
        title: 'ma campagne',
        reference: 'ABCDIAG1',
        type: 'CAMPAIGN',
        isCompleted: true,
      });

      const moduleCombinedCourseItem = store.createRecord('combined-course-item', {
        id: 2,
        title: 'mon module',
        reference: 'mon-module',
        type: 'MODULE',
        redirection: 'une+url+chiffree',
        isCompleted: false,
      });

      combinedCourse.items.push(campaignCombinedCourseItem, moduleCombinedCourseItem);

      // when
      const screen = await render(<template><CombinedCourseTunnel @combinedCourse={{combinedCourse}} /></template>);
      // then
      assert.ok(screen.getByRole('heading', { name: t('pages.combined-courses.content.step', { stepNumber: 1 }) }));
      assert.ok(screen.getByRole('heading', { name: t('pages.combined-courses.content.step', { stepNumber: 2 }) }));
    });
  });

  module('when items are of same types', function () {
    test('should not display steps', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      const combinedCourse = store.createRecord('combined-course', {
        id: 1,
        status: CombinedCourseStatuses.STARTED,
        code: 'COMBINIX9',
      });

      const campaignCombinedCourseItem = store.createRecord('combined-course-item', {
        id: 3,
        title: 'ma campagne',
        reference: 'ABCDIAG1',
        type: 'CAMPAIGN',
        isCompleted: true,
      });

      const campaignCombinedCourse2Item = store.createRecord('combined-course-item', {
        id: 4,
        title: 'ma campagne',
        reference: 'ABCDIAG1',
        type: 'CAMPAIGN',
        isCompleted: true,
      });

      combinedCourse.items.push(campaignCombinedCourseItem, campaignCombinedCourse2Item);

      // when
      const screen = await render(<template><CombinedCourseTunnel @combinedCourse={{combinedCourse}} /></template>);

      // then
      assert.notOk(await screen.queryByRole('heading', { name: 'étape 1' }));
    });
  });
});
