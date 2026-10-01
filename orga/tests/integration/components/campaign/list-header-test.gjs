import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import ListHeader from 'pix-orga/components/campaign/list-header';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign | ListHeader', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Combined courses tab', function () {
    test('it displays combined courses tab when user has combined courses', async function (assert) {
      // given
      const currentUser = this.owner.lookup('service:current-user');
      sinon.stub(currentUser, 'combinedCourseBlueprints').value([{ id: 1 }]);

      // when
      const screen = await render(<template><ListHeader /></template>);

      // then
      assert.dom(screen.getByRole('link', { name: t('pages.campaign.tab.combined-courses') })).exists();
    });

    test('it does not display combined courses tab when user has no combined courses', async function (assert) {
      // given
      const currentUser = this.owner.lookup('service:current-user');
      sinon.stub(currentUser, 'combinedCourseBlueprints').value([]);

      // when
      const screen = await render(<template><ListHeader /></template>);

      // then
      assert.dom(screen.queryByRole('link', { name: t('pages.campaign.tab.combined-courses') })).doesNotExist();
    });

    test('it does not display combined courses tab when combined courses is undefined', async function (assert) {
      // given
      const currentUser = this.owner.lookup('service:current-user');
      sinon.stub(currentUser, 'combinedCourseBlueprints').value(undefined);

      // when
      const screen = await render(<template><ListHeader /></template>);

      // then
      assert.dom(screen.queryByRole('link', { name: t('pages.campaign.tab.combined-courses') })).doesNotExist();
    });
  });

  module('when places limit feature is inactive', function () {
    test('it displays a disabled link', async function (assert) {
      // given
      const storeService = this.owner.lookup('service:store');
      sinon.stub(storeService, 'peekAll');
      storeService.peekAll.returns(undefined);

      // when
      const screen = await render(<template><ListHeader /></template>);

      // then
      assert.dom(screen.queryByRole('link', { name: t('pages.campaigns-list.action.create') })).exists();
    });
  });

  module('when places limit feature is active', function () {
    module('when places limit is not reached', function () {
      test('it displays a create link', async function (assert) {
        // given
        const currentUser = this.owner.lookup('service:current-user');
        sinon.stub(currentUser, 'organizationPlaceStatistics').value({ hasReachedMaximumPlacesLimit: false });
        // when
        const screen = await render(<template><ListHeader /></template>);

        // then
        assert.dom(screen.queryByRole('link', { name: t('pages.campaigns-list.action.create') })).exists();
      });
    });

    module('when places limit is reached', function () {
      test('it displays a disabled link', async function (assert) {
        // given
        const currentUser = this.owner.lookup('service:current-user');
        sinon.stub(currentUser, 'organizationPlaceStatistics').value({ hasReachedMaximumPlacesLimit: true });

        // when
        const screen = await render(<template><ListHeader /></template>);

        // then
        assert.dom(screen.getByText(t('pages.campaigns-list.action.create'))).exists();
        assert.dom(screen.queryByRole('link', { name: t('pages.campaigns-list.action.create') })).doesNotExist();
      });
    });
  });
});
