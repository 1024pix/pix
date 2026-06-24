import { fillByLabel, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import Network from 'pix-admin/components/organizations/network';
import setupIntlRenderingTest from 'pix-admin/tests/helpers/setup-intl-rendering';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Integration | Component | organizations/network', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when the admin member has access to organization scope', function (hooks) {
    let store, network;

    hooks.beforeEach(function () {
      class AccessControlStub extends Service {
        hasAccessToOrganizationActionsScope = true;
        hasAccessToAttachChildOrganizationActionsScope = true;
      }
      this.owner.register('service:access-control', AccessControlStub);

      store = this.owner.lookup('service:store');
      network = store.createRecord('network', { id: 10, name: 'My network' });
    });

    test('it should display children list and actions section', async function (assert) {
      // given
      const organization = store.createRecord('organization', { id: '1', name: 'Parent', network });
      const child1 = store.createRecord('organization', { id: '2', name: 'Child 1' });
      const child2 = store.createRecord('organization', { id: '3', name: 'Child 2' });
      const children = [child1, child2];

      // when
      const screen = await render(
        <template><Network @organization={{organization}} @children={{children}} /></template>,
      );

      // then
      assert.dom(screen.getByRole('cell', { name: 'Child 1' })).exists();
      assert.dom(screen.getByRole('cell', { name: 'Child 2' })).exists();

      assert.ok(
        screen.getByRole('link', { name: t('components.organizations.network.create-child-organization-button') }),
      );
    });

    test('it should display an empty message when no children', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const organization = store.createRecord('organization', { id: '1', name: 'Parent' });
      const children = [];

      // when
      const screen = await render(
        <template><Network @organization={{organization}} @children={{children}} /></template>,
      );

      // then
      assert.dom(screen.getByText(t('components.organizations.network.empty-table'))).exists();
    });

    module('when submitting form', function (hooks) {
      let notificationSuccessStub, notificationErrorStub;

      hooks.beforeEach(function () {
        notificationSuccessStub = sinon.stub();
        notificationErrorStub = sinon.stub();
        class NotificationsStub extends Service {
          sendSuccessNotification = notificationSuccessStub;
          sendErrorNotification = notificationErrorStub;
        }

        this.owner.register('service:pixToast', NotificationsStub);
      });
      module('when attachChildOrganization is a success', function () {
        test('it should reload model and display success notification', async function (assert) {
          // given
          const reloadChildrenStub = sinon.stub();

          const parentOrganization = store.createRecord('organization', {
            id: 1,
            name: 'Parent Organization Name',
            features: { PLACES_MANAGEMENT: { active: true } },
            network,
            hasMany: sinon.stub(),
          });
          const childOrganization = store.createRecord('organization', {
            id: 2,
            name: 'Child Organization Name',
            features: { PLACES_MANAGEMENT: { active: true } },
          });
          parentOrganization.hasMany.withArgs('children').returns({ reload: reloadChildrenStub });

          const childOrganizationIdsToFill = `${childOrganization.id}`;

          const adapter = store.adapterFor('organization');
          const attachChildOrganizationStub = sinon.stub(adapter, 'attachChildOrganization');
          attachChildOrganizationStub
            .withArgs({ childOrganizationIds: childOrganizationIdsToFill, parentOrganizationId: parentOrganization.id })
            .resolves();

          const screen = await render(<template><Network @organization={{parentOrganization}} /></template>);

          await fillByLabel(
            `${t('components.organizations.network.attach-child-form.input-label')} ${t('components.organizations.network.attach-child-form.input-information')}`,
            childOrganizationIdsToFill,
          );

          // when
          await click(screen.getByRole('button', { name: t('common.actions.add') }));

          // then
          assert.true(
            notificationSuccessStub.calledOnceWithExactly({
              message: t('pages.organization-network.notifications.success.attach-child-organization', { count: 1 }),
            }),
          );

          assert.true(reloadChildrenStub.calledOnce);
        });
      });

      module('error cases', function () {
        test('it should display correct error notification for UNABLE_TO_ATTACH_CHILD_ORGANIZATION_TO_ITSELF error code', async function (assert) {
          // given
          const parentOrganization = store.createRecord('organization', {
            id: 1,
            name: 'Parent Organization Name',
            features: { PLACES_MANAGEMENT: { active: true } },
            network,
            hasMany: sinon.stub(),
          });

          const adapter = store.adapterFor('organization');
          const attachChildOrganizationStub = sinon.stub(adapter, 'attachChildOrganization');
          attachChildOrganizationStub.rejects({
            errors: [{ code: 'UNABLE_TO_ATTACH_CHILD_ORGANIZATION_TO_ITSELF', meta: { childOrganizationId: '1' } }],
          });

          const screen = await render(<template><Network @organization={{parentOrganization}} /></template>);

          const input = screen.getByLabelText(t('components.organizations.network.attach-child-form.input-label'), {
            exact: false,
          });

          await fillIn(input, 1);

          // when
          await click(screen.getByRole('button', { name: t('common.actions.add') }));

          // then
          assert.true(
            notificationErrorStub.calledOnceWithExactly({
              message: t(
                'pages.organization-network.notifications.error.unable-to-attach-child-organization-to-itself',
                { childOrganizationId: '1' },
              ),
            }),
          );
        });

        test('it should display correct error notification for UNABLE_TO_ATTACH_ALREADY_ATTACHED_CHILD_ORGANIZATION error code', async function (assert) {
          // given
          const parentOrganization = store.createRecord('organization', {
            id: 1,
            name: 'Parent Organization Name',
            features: { PLACES_MANAGEMENT: { active: true } },
            network,
            hasMany: sinon.stub(),
          });

          const alreadyAttachedChildOrganizationId = 99;

          const adapter = store.adapterFor('organization');
          const attachChildOrganizationStub = sinon.stub(adapter, 'attachChildOrganization');
          attachChildOrganizationStub.rejects({
            errors: [
              {
                code: 'UNABLE_TO_ATTACH_ALREADY_ATTACHED_CHILD_ORGANIZATION',
                meta: { childOrganizationId: alreadyAttachedChildOrganizationId },
              },
            ],
          });

          const screen = await render(<template><Network @organization={{parentOrganization}} /></template>);
          const input = screen.getByLabelText(t('components.organizations.network.attach-child-form.input-label'), {
            exact: false,
          });

          await fillIn(input, alreadyAttachedChildOrganizationId);

          // when
          await click(screen.getByRole('button', { name: t('common.actions.add') }));

          // then
          assert.true(
            notificationErrorStub.calledOnceWithExactly({
              message: t(
                'pages.organization-network.notifications.error.unable-to-attach-already-attached-child-organization',
                { childOrganizationId: `${alreadyAttachedChildOrganizationId}` },
              ),
            }),
          );
        });

        test('it should display correct error notification for INVALID_CHILD_ORGANIZATION_IDS error code', async function (assert) {
          // given
          const parentOrganization = store.createRecord('organization', {
            id: 1,
            name: 'Parent Organization Name',
            features: { PLACES_MANAGEMENT: { active: true } },
            network,
            hasMany: sinon.stub(),
          });

          const adapter = store.adapterFor('organization');
          const attachChildOrganizationStub = sinon.stub(adapter, 'attachChildOrganization');
          attachChildOrganizationStub.rejects({
            errors: [{ code: 'INVALID_CHILD_ORGANIZATION_IDS' }],
          });

          const screen = await render(<template><Network @organization={{parentOrganization}} /></template>);
          const input = screen.getByLabelText(t('components.organizations.network.attach-child-form.input-label'), {
            exact: false,
          });

          await fillIn(input, 1847474);

          // when
          await click(screen.getByRole('button', { name: t('common.actions.add') }));

          // then
          assert.true(
            notificationErrorStub.calledOnceWithExactly({
              message: t('components.organizations.network.attach-child-form.invalid-ids-error'),
            }),
          );
        });

        test('it should display generic error notification for any other error code', async function (assert) {
          // given
          const parentOrganization = store.createRecord('organization', {
            id: 1,
            name: 'Parent Organization Name',
            features: { PLACES_MANAGEMENT: { active: true } },
            network,
            hasMany: sinon.stub(),
          });

          const adapter = store.adapterFor('organization');
          const attachChildOrganizationStub = sinon.stub(adapter, 'attachChildOrganization');
          attachChildOrganizationStub.rejects({
            errors: [
              {
                code: 'DEFAULT_CODE',
              },
            ],
          });

          const screen = await render(<template><Network @organization={{parentOrganization}} /></template>);
          const input = screen.getByLabelText(t('components.organizations.network.attach-child-form.input-label'), {
            exact: false,
          });

          await fillIn(input, 1);

          // when
          await click(screen.getByRole('button', { name: t('common.actions.add') }));

          // then
          assert.true(
            notificationErrorStub.calledOnceWithExactly({
              message: t('common.notifications.generic-error'),
            }),
          );
        });
      });
    });
  });

  module('when the admin member does not have access to organization scope', function () {
    test('it should not render the actions section', async function (assert) {
      // given
      class AccessControlStub extends Service {
        hasAccessToOrganizationActionsScope = false;
      }
      this.owner.register('service:access-control', AccessControlStub);

      const store = this.owner.lookup('service:store');
      const organization = store.createRecord('organization', { id: '1', name: 'Parent' });
      const children = [];

      // when
      const screen = await render(
        <template><Network @organization={{organization}} @children={{children}} /></template>,
      );

      // then
      assert.notOk(
        screen.queryByRole('link', { name: t('components.organizations.network.create-child-organization-button') }),
      );
    });
  });
});
