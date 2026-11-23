import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import ActionsSection from 'pix-admin/components/organizations/network/actions-section';
import { t } from 'pix-admin/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | organizations/network/actions-section', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
  });

  module('create child organization button', function (hooks) {
    hooks.beforeEach(async function () {
      class AccessControlStub extends Service {
        hasAccessToOrganizationActionsScope = true;
      }
      this.owner.register('service:access-control', AccessControlStub);
    });

    test('it should display create child organization button when user has access to organization actions scope', async function (assert) {
      // given
      const organization = store.createRecord('organization', {
        id: '1',
        name: 'Orga 1',
      });

      const onAttachChildSubmitFormStub = sinon.stub();

      // when
      const screen = await render(
        <template>
          <ActionsSection @organization={{organization}} @onAttachChildSubmitForm={{onAttachChildSubmitFormStub}} />
        </template>,
      );

      assert.ok(
        screen.getByRole('link', { name: t('components.organizations.network.create-child-organization-button') }),
      );
    });

    test('it should not display create child organization button when user does not have access to organization actions scope', async function (assert) {
      // given
      class AccessControlStub extends Service {
        hasAccessToOrganizationActionsScope = false;
      }
      this.owner.register('service:access-control', AccessControlStub);

      const organization = store.createRecord('organization', {
        id: '1',
        name: 'Orga 1',
      });

      const onAttachChildSubmitFormStub = sinon.stub();

      // when
      const screen = await render(
        <template>
          <ActionsSection @organization={{organization}} @onAttachChildSubmitForm={{onAttachChildSubmitFormStub}} />
        </template>,
      );

      assert.notOk(
        screen.queryByRole('link', { name: t('components.organizations.network.create-child-organization-button') }),
      );
    });
  });

  module('when user have access to attach child organization actions scope', function () {
    test('it should display attach child organization form', async function (assert) {
      // given
      class AccessControlStub extends Service {
        hasAccessToAttachChildOrganizationActionsScope = true;
      }
      this.owner.register('service:access-control', AccessControlStub);

      const organization = store.createRecord('organization', {
        id: '1',
        name: 'Orga 1',
      });

      const onAttachChildSubmitFormStub = sinon.stub();

      // when
      const screen = await render(
        <template>
          <ActionsSection @organization={{organization}} @onAttachChildSubmitForm={{onAttachChildSubmitFormStub}} />
        </template>,
      );

      assert.ok(screen.getByRole('form', { name: t('components.organizations.network.attach-child-form.name') }));
    });

    module('when user does not have access to attach child organization actions scope', function () {
      test('it should not display attach child organization form ', async function (assert) {
        // given
        class AccessControlStub extends Service {
          hasAccessToAttachChildOrganizationActionsScope = false;
        }
        this.owner.register('service:access-control', AccessControlStub);

        const organization = store.createRecord('organization', {
          id: '1',
          name: 'Orga 1',
        });

        const onAttachChildSubmitFormStub = sinon.stub();

        // when
        const screen = await render(
          <template>
            <ActionsSection @organization={{organization}} @onAttachChildSubmitForm={{onAttachChildSubmitFormStub}} />
          </template>,
        );

        assert.notOk(
          screen.queryByRole('form', { name: t('components.organizations.network.attach-child-form.name') }),
        );
      });
    });
  });
});
