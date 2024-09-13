import { render, within } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import Breadcrumb from 'pix-admin/components/layout/breadcrumb';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

const routeWithoutParent = {
  currentRouteName: 'authenticated.autonomous-courses.index',
  currentRoute: {
    parent: {
      name: 'authenticated.autonomous-courses',
    },
    localName: 'index',
  },
};
const routeWithParent = {
  currentRouteName: 'authenticated.autonomous-courses.details',
  currentRoute: {
    parent: {
      name: 'authenticated.autonomous-courses.index',
    },
    localName: 'details',
  },
};

module('Integration | Component | Layout | Breadcrumb', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when the current page has no parent', function () {
    test('it should display title page only and without a link', async function (assert) {
      // given
      const serviceRouter = this.owner.lookup('service:router');
      sinon.stub(serviceRouter, 'currentRouteName').value(routeWithoutParent.currentRouteName);
      sinon.stub(serviceRouter, 'currentRoute').value(routeWithoutParent.currentRoute);

      // when
      const screen = await render(<template><Breadcrumb /></template>);

      const nav = screen.getByRole('navigation');
      const element = within(nav).getByRole('heading', { options: { level: 1 } });

      // then
      assert.dom(element).exists();
      assert.dom(element).hasNoAttribute('href');
      assert.strictEqual(element.textContent, t('components.autonomous-courses.title'));
    });
  });

  module('when the current page has a parent', function () {
    test('it should display title page without a link, and parent title with a link', async function (assert) {
      // given
      const serviceRouter = this.owner.lookup('service:router');
      sinon.stub(serviceRouter, 'currentRouteName').value(routeWithParent.currentRouteName);
      sinon.stub(serviceRouter, 'currentRoute').value(routeWithParent.currentRoute);

      // when
      const screen = await render(<template><Breadcrumb /></template>);

      const nav = screen.getByRole('navigation');
      const parent = within(nav).getByRole('link');
      const element = within(nav).getByRole('heading', { options: { level: 1 } });

      // then
      assert.dom(parent).exists();
      assert.dom(parent).hasAttribute('href', '/autonomous-courses');
      assert.strictEqual(parent.textContent, t('components.autonomous-courses.index.title'));
      assert.dom(element).exists();
      assert.strictEqual(element.textContent, t('components.autonomous-courses.details.title'));
    });
  });
});
