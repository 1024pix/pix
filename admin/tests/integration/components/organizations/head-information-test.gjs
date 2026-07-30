import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import { triggerEvent } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import HeadInformation from 'pix-admin/components/organizations/head-information';
import ENV from 'pix-admin/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | organizations/header-information', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store, notificationService;

  hooks.beforeEach(function () {
    const currentUser = this.owner.lookup('service:currentUser');
    currentUser.adminMember = { isSuperAdmin: true };
    store = this.owner.lookup('service:store');

    notificationService = this.owner.lookup('service:pixToast');
    sinon.stub(notificationService, 'sendSuccessNotification');
    sinon.stub(notificationService, 'sendErrorNotification');
  });

  module('when displaying organization', function () {
    test('it displays organization header information', async function (assert) {
      // given
      const organization = EmberObject.create({ id: 1, name: 'Organization SCO' });

      // when
      const screen = await render(<template><HeadInformation @organization={{organization}} /></template>);

      // then
      assert.dom(screen.getByRole('heading', { name: 'Organization SCO' })).exists();
      assert.dom(screen.getByText((_, element) => element.textContent === 'ID : 1')).exists();
      assert.dom(screen.getByRole('button', { name: t('common.actions.copy-id') })).exists();
    });

    test('it displays an accessible control to change the logo', async function (assert) {
      // given
      const organization = EmberObject.create({ id: 1, name: 'Organization SCO' });

      // when
      const screen = await render(<template><HeadInformation @organization={{organization}} /></template>);

      // then
      assert.dom(screen.getByLabelText(t('components.organizations.head-information.change-logo'))).exists();
    });

    test('it generates correct external dashboard URL', async function (assert) {
      // given
      const organization = EmberObject.create({ id: 1, name: 'Test Organization' });
      const expectedLink = ENV.APP.ORGANIZATION_DASHBOARD_URL + organization.id;
      // when
      const screen = await render(<template><HeadInformation @organization={{organization}} /></template>);

      // then
      const dashboardLink = screen.getByRole('link', { name: 'Tableau de bord' });
      assert.dom(dashboardLink).hasAttribute('href', expectedLink);
    });

    module('when organization has tags', function () {
      test('it should display tags', async function (assert) {
        // given
        const organization = EmberObject.create({
          id: 1,
          tags: [
            { id: 1, name: 'CFA' },
            { id: 2, name: 'PRIVE' },
            { id: 3, name: 'AGRICULTURE' },
          ],
        });

        // when
        const screen = await render(<template><HeadInformation @organization={{organization}} /></template>);

        // then
        assert.dom(screen.getByText('CFA')).exists();
        assert.dom(screen.getByText('PRIVE')).exists();
        assert.dom(screen.getByText('AGRICULTURE')).exists();
      });
    });

    module('network tags', function () {
      module('when organization belongs to a network', function (hooks) {
        let network;
        hooks.beforeEach(() => {
          network = store.push({
            data: { id: '42', type: 'network', attributes: { name: 'Réseau Île-de-France' } },
          });
        });
        module('when user is super admin', function () {
          test('it displays a tag with a link to the network', async function (assert) {
            // given
            const organization = store.createRecord('organization', { network });

            // when
            const screen = await render(<template><HeadInformation @organization={{organization}} /></template>);

            // then
            assert.dom(screen.getByRole('link', { name: 'Réseau Île-de-France' })).exists();
          });

          test('it displays parent tag with organization name as a link if organization is a child', async function (assert) {
            //given
            const parentOrganization = store.createRecord('organization', {
              id: '5',
              type: 'SCO',
              network,
            });
            const organization = store.createRecord('organization', {
              type: 'SCO',
              parentOrganizationId: parentOrganization.id,
              parentOrganizationName: 'Shibusen',
              network,
            });

            // when
            const screen = await render(<template><HeadInformation @organization={{organization}} /></template>);

            // then
            assert
              .dom(screen.getByText(t('components.organizations.head-information.parent-organization-tag')))
              .exists();
            assert.dom(screen.getByRole('link', { name: 'Shibusen' })).exists();
          });

          test('it displays Head of network tag if organization has no parent', async function (assert) {
            //given
            const organization = store.createRecord('organization', {
              type: 'SCO',
              network,
            });

            // when
            const screen = await render(<template><HeadInformation @organization={{organization}} /></template>);

            // then
            assert.dom(screen.getByText(t('components.organizations.head-information.head-organization-tag'))).exists();
          });
        });
      });

      module('when organization does not belong to a network', function () {
        test('it does not display a network tag', async function (assert) {
          // given
          const organization = store.createRecord('organization', { type: 'SCO' });

          // when
          const screen = await render(<template><HeadInformation @organization={{organization}} /></template>);

          // then
          assert.dom(screen.queryByText(t('components.organizations.head-information.network'))).doesNotExist();
        });
      });
    });
  });

  module('when updating organization logo', function () {
    module('when there is no error', function () {
      test('should save model, display success notification and display new logo', async function (assert) {
        // given
        const organization = store.createRecord('organization', {
          name: 'Organization SCO',
          logoUrl: 'data:former-logo-file;base64,',
        });

        sinon.stub(organization, 'save').resolves();

        const file = new Blob([''], { type: `new-logo-file` });

        // when
        const screen = await render(<template><HeadInformation @organization={{organization}} /></template>);

        await triggerEvent(
          screen.getByLabelText(t('components.organizations.head-information.change-logo')),
          'change',
          {
            files: [file],
          },
        );

        // then
        assert.true(organization.save.calledOnce);
        assert.true(
          notificationService.sendSuccessNotification.calledOnceWithExactly({
            message: t('components.organizations.head-information.notifications.logo-update-success'),
          }),
        );
        const logo = screen.getByRole('presentation');
        assert.dom(logo).hasAttribute('src', 'data:new-logo-file;base64,');
      });
    });

    module('when file is too large', function () {
      test('should rollback attributes and display payload-too-large error notification', async function (assert) {
        // given
        const organization = store.createRecord('organization', {
          name: 'Organization SCO',
          logoUrl: 'data:former-logo-file;base64,',
        });

        sinon.stub(organization, 'save').rejects({ errors: [{ status: '413', meta: { maxSizeInMegaBytes: '2.5' } }] });
        sinon.stub(organization, 'rollbackAttributes').returns();

        const file = new Blob([''], { type: `new-logo-file` });

        // when
        const screen = await render(<template><HeadInformation @organization={{organization}} /></template>);

        await triggerEvent(
          screen.getByLabelText(t('components.organizations.head-information.change-logo')),
          'change',
          {
            files: [file],
          },
        );

        // then
        assert.true(organization.rollbackAttributes.calledOnce);
        assert.true(
          notificationService.sendErrorNotification.calledOnceWithExactly({
            message: t('pages.organizations.notifications.errors.payload-too-large', { maxSizeInMegaBytes: '2.5' }),
          }),
        );
      });
    });

    module('when a generic error occurs', function () {
      test('should rollback attributes and display generic error notification', async function (assert) {
        // given
        const organization = store.createRecord('organization', {
          name: 'Organization SCO',
          logoUrl: 'data:former-logo-file;base64,',
        });

        sinon.stub(organization, 'save').rejects();
        sinon.stub(organization, 'rollbackAttributes').returns();

        const file = new Blob([''], { type: `new-logo-file` });

        // when
        const screen = await render(<template><HeadInformation @organization={{organization}} /></template>);

        await triggerEvent(
          screen.getByLabelText(t('components.organizations.head-information.change-logo')),
          'change',
          {
            files: [file],
          },
        );

        // then
        assert.true(organization.rollbackAttributes.calledOnce);
        assert.true(
          notificationService.sendErrorNotification.calledOnceWithExactly({
            message: t('common.notifications.generic-error'),
          }),
        );
      });
    });
  });
});
