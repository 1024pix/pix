import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import CombinedCourseTunnel from 'mon-pix/components/routes/combined-courses/tunnel';
import { CombinedCourseItemTypes } from 'mon-pix/models/combined-course-item';
import { module, test } from 'qunit';
import sinon from 'sinon';

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

  module('setSelectedItem', function () {
    test('should mount component with current item', async function (assert) {
      // given
      const onClickStub = sinon.stub();
      const store = this.owner.lookup('service:store');
      const combinedCourseItem = store.createRecord('combined-course-item', {
        id: 1,
        title: 'mon module',
        reference: 'mon-module',
        type: CombinedCourseItemTypes.MODULE,
        isLocked: false,
        isCompleted: false,
        duration: 10,
      });

      const combinedCourse = store.createRecord('combined-course', {
        id: 2,
        items: [combinedCourseItem],
      });

      // when
      const screen = await render(
        <template><CombinedCourseTunnel @combinedCourse={{combinedCourse}} @onClick={{onClickStub}} /></template>,
      );

      assert.ok(screen.getByRole('button', { name: t('pages.combined-courses.items.start-module') }));
    });
    test('should set selected item when clicking on it', async function (assert) {
      // given
      const onClickStub = sinon.stub();
      const store = this.owner.lookup('service:store');
      const combinedCourseItem1 = store.createRecord('combined-course-item', {
        id: 1,
        title: 'ma campagne 1',
        reference: 'ma campagne- 1',
        type: CombinedCourseItemTypes.CAMPAIGN,
        isLocked: false,
        duration: 10,
      });
      const combinedCourseItem2 = store.createRecord('combined-course-item', {
        id: 2,
        title: 'ma campagne 2',
        reference: 'ma campagne- 2',
        type: CombinedCourseItemTypes.CAMPAIGN,
        isLocked: false,
        duration: 10,
      });
      const combinedCourseItem3 = store.createRecord('combined-course-item', {
        id: 3,
        title: 'mon module 3',
        reference: 'mon-module 3',
        type: CombinedCourseItemTypes.MODULE,
        isLocked: false,
        duration: 10,
      });

      const combinedCourse = store.createRecord('combined-course', {
        id: 3,
        items: [combinedCourseItem1, combinedCourseItem2, combinedCourseItem3],
      });

      // when
      const screen = await render(
        <template><CombinedCourseTunnel @combinedCourse={{combinedCourse}} @onClick={{onClickStub}} /></template>,
      );

      await screen.getByRole('button', { name: /mon module 3/ }).click();
      await this.pauseTest();
      //then
      assert.notOk(screen.queryByRole('button', { name: t('pages.combined-courses.items.start-campaign') }));
      assert.ok(screen.getByRole('button', { name: t('pages.combined-courses.items.start-module') }));
    });
  });
});
