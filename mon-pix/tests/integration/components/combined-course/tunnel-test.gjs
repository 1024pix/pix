import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import Tunnel from 'mon-pix/components/routes/combined-courses/tunnel';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering.js';

module('Integration | Component | tunnel steps', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('setSelectedItem', function () {
    test('should mount component with current item', async function (assert) {
      // given
      const onClickStub = sinon.stub();
      const store = this.owner.lookup('service:store');
      const combinedCourseItem = store.createRecord('combined-course-item', {
        id: 1,
        title: 'mon module',
        reference: 'mon-module',
        type: 'MODULE',
        isLocked: false,
        duration: 10,
      });

      // when
      const screen = await render(
        <template>
          <Tunnel
            @item={{combinedCourseItem}}
            @isLocked={{combinedCourseItem.isLocked}}
            @isNextItemToComplete={{false}}
            @onClick={{onClickStub}}
          />
        </template>,
      );

      assert.ok(screen.getByRole('button', { name: t('pages.combined-courses.items.resume-module') }));
    });
    test('should set selected item when clicking on it', async function (assert) {
      // given
      const onClickStub = sinon.stub();
      const store = this.owner.lookup('service:store');
      store.createRecord('combined-course-item', {
        id: 1,
        title: 'ma campagne 1',
        reference: 'ma campagne- 1',
        type: 'CAMPAIGN',
        isLocked: false,
        duration: 10,
      });
      store.createRecord('combined-course-item', {
        id: 1,
        title: 'ma campagne 2',
        reference: 'ma campagne- 2',
        type: 'CAMPAIGN',
        isLocked: false,
        duration: 10,
      });
      const combinedCourseItem = store.createRecord('combined-course-item', {
        id: 1,
        title: 'mon module 3',
        reference: 'mon-module 3',
        type: 'MODULE',
        isLocked: false,
        duration: 10,
      });

      // when
      const screen = await render(
        <template>
          <Tunnel
            @item={{combinedCourseItem}}
            @isLocked={{combinedCourseItem.isLocked}}
            @isNextItemToComplete={{false}}
            @onClick={{onClickStub}}
          />
        </template>,
      );

      await screen.clickByText('mon module 3');
      assert.notOk(screen.queryByRole('button', { name: t('pages.combined-courses.items.start-campaign') }));
      assert.ok(screen.getByRole('button', { name: t('pages.combined-courses.items.start-module') }));
    });
  });
});
