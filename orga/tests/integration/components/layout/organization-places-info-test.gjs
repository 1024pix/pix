import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { t } from 'ember-intl/test-support';
import OrganizationPlacesInfo from 'pix-orga/components/layout/organization-places-info';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Components | Layout | OrganizationPlacesInfo', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when organization have places', function () {
    test('that members user can only see counter', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        isAdminInOrganization = false;
        prescriber = { placesManagement: true };
      }
      this.owner.register('service:current-user', CurrentUserStub);

      const placesNumber = '12';

      // when
      const screen = await render(<template><OrganizationPlacesInfo @placesCount={{placesNumber}} /></template>);

      // then
      assert.ok(screen.getByText(t('navigation.places.number', { count: placesNumber })));
      assert.notOk(screen.queryByText(t('navigation.places.link')));
    });

    test('that admin user can access places page link', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
        prescriber = { placesManagement: true };
      }
      this.owner.register('service:current-user', CurrentUserStub);

      const placesNumber = 4;

      // when
      const screen = await render(<template><OrganizationPlacesInfo @placesCount={{placesNumber}} /></template>);

      // then
      assert.ok(screen.getByText(t('navigation.places.number', { count: placesNumber })));
    });

    test('when there is 0 places left', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        isAdminInOrganization = false;
        prescriber = { placesManagement: true };
      }
      this.owner.register('service:current-user', CurrentUserStub);

      const placesNumber = 0;

      // when
      const screen = await render(<template><OrganizationPlacesInfo @placesCount={{placesNumber}} /></template>);

      // then
      assert.ok(screen.getByText(t('navigation.places.number', { count: placesNumber })));
      assert.ok(screen.getByRole('img', { hidden: true }));
    });

    test('when users organization does not have placeManagement feature', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        prescriber = { placesManagement: false };
      }
      this.owner.register('service:current-user', CurrentUserStub);

      const placesNumber = 12;
      // when
      const screen = await render(<template><OrganizationPlacesInfo @placesCount={{placesNumber}} /></template>);

      // then
      assert.notOk(screen.queryByText(t('navigation.places.number', { count: placesNumber })));
      assert.notOk(screen.queryByText(t('navigation.places.link')));
    });
  });
});
