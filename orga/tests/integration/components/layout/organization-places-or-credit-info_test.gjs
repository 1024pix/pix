import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import OrganizationPlacesOrCreditInfo from 'pix-orga/components/layout/organization-places-or-credit-info';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Components | Layout | OrganizationPlacesOrCreditInfo', function (hooks) {
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
      const screen = await render(
        <template><OrganizationPlacesOrCreditInfo @placesCount={{placesNumber}} /></template>,
      );

      // then
      assert.ok(screen.getByText(this.intl.t('navigation.places.number', { count: placesNumber })));
      assert.notOk(screen.queryByText(this.intl.t('navigation.places.link')));
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
      const screen = await render(
        <template><OrganizationPlacesOrCreditInfo @placesCount={{placesNumber}} /></template>,
      );

      // then
      assert.ok(screen.getByText(this.intl.t('navigation.places.number', { count: placesNumber })));
      assert.ok(screen.getByRole('link', { name: this.intl.t('navigation.places.link'), href: '/places' }));
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
      const screen = await render(
        <template><OrganizationPlacesOrCreditInfo @placesCount={{placesNumber}} /></template>,
      );

      // then
      assert.ok(screen.getByText(this.intl.t('navigation.places.number', { count: placesNumber })));
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
      const screen = await render(
        <template><OrganizationPlacesOrCreditInfo @placesCount={{placesNumber}} /></template>,
      );

      // then
      assert.notOk(screen.queryByText(this.intl.t('navigation.places.number', { count: placesNumber })));
      assert.notOk(screen.queryByText(this.intl.t('navigation.places.link')));
    });
  });

  module('when organization have credits', function () {
    test('should display organization credit info and tooltip', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
        organization = {
          credit: 10000,
        };
      }
      this.owner.register('service:current-user', CurrentUserStub);

      // when
      const screen = await render(<template><OrganizationPlacesOrCreditInfo /></template>);

      // then
      assert.ok(screen.getByText('10 000 crédits'));
      assert.ok(
        screen.getByText(
          'Le nombre de crédits affichés correspond au nombre de crédits acquis par l’organisation et en cours de validité (indépendamment de leur activation).',
          { exact: false },
        ),
      );
    });

    test('should display "credit" when credit is equal 1', async function (assert) {
      // given
      const creditCount = 1;
      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
        organization = {
          credit: creditCount,
        };
      }
      this.owner.register('service:current-user', CurrentUserStub);

      // when
      const screen = await render(<template><OrganizationPlacesOrCreditInfo /></template>);

      // then
      assert.ok(screen.getByText(this.intl.t('navigation.credits.number', { count: creditCount })));
    });

    test('should be hidden when credit is less than 1', async function (assert) {
      // given
      const creditCount = 0;
      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
        organization = {
          credit: creditCount,
        };
      }
      this.owner.register('service:current-user', CurrentUserStub);

      // when
      const screen = await render(<template><OrganizationPlacesOrCreditInfo /></template>);

      // then
      assert.notOk(screen.queryByText(this.intl.t('navigation.credits.number', { count: creditCount })));
    });

    test('should hiden when the prescriber is not ADMIN', async function (assert) {
      // given
      const creditCount = 10000;
      class CurrentUserStub extends Service {
        isAdminInOrganization = false;
        organization = {
          credit: creditCount,
        };
      }
      this.owner.register('service:current-user', CurrentUserStub);

      // when
      const screen = await render(<template><OrganizationPlacesOrCreditInfo /></template>);

      // then
      assert.notOk(screen.queryByText(this.intl.t('navigation.credits.number', { count: creditCount })));
    });
  });

  module('when organization have both', function () {
    test('it should only display places', async function (assert) {
      // given
      const creditCount = 1;
      class CurrentUserStub extends Service {
        isAdminInOrganization = false;
        prescriber = { placesManagement: true };
        organization = {
          credit: creditCount,
        };
      }
      this.owner.register('service:current-user', CurrentUserStub);

      const placesNumber = '12';

      // when
      const screen = await render(
        <template><OrganizationPlacesOrCreditInfo @placesCount={{placesNumber}} /></template>,
      );

      // then
      assert.notOk(screen.queryByText(this.intl.t('navigation.credits.number', { count: creditCount })));
      assert.ok(screen.getByText(this.intl.t('navigation.places.number', { count: placesNumber })));
    });
  });
});
