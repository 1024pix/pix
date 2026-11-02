import { fillByLabel, render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import CreationForm from 'pix-admin/components/certification-centers/creation-form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

const habilitations = [
  { id: '1', key: 'E', label: 'Pix+Edu' },
  { id: '2', key: 'S', label: 'Pix+Surf' },
];

const attachedOrganization = {
  id: '123',
  name: 'Wayne Enterprises',
  type: 'SCO',
  externalId: 'WAYNE_123',
  categoryId: '1234',
};

const structureCategories = [
  { id: '1234', label: 'Catégorie 1' },
  { id: '5678', label: 'Catégorie 2' },
];

module('Integration | Component | certification-centers/creation-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store, pixToast, router;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    sinon.stub(store, 'createRecord').returns({
      save: sinon.stub().resolves(),
    });

    pixToast = this.owner.lookup('service:pixToast');
    sinon.stub(pixToast, 'sendSuccessNotification');
    sinon.stub(pixToast, 'sendErrorNotification');

    router = this.owner.lookup('service:router');
    sinon.stub(router, 'transitionTo');
  });

  test('should render category options in list', async function (assert) {
    // when
    const screen = await render(<template><CreationForm @structureCategories={{structureCategories}} /></template>);

    await click(
      screen.getByRole('button', {
        name: `${t('components.certification-centers.creation.category.selector.label')} *`,
      }),
    );
    await screen.findByRole('listbox');
    const options = await screen.getAllByRole('option');

    // then
    assert.strictEqual(options.length, 2);
    assert.strictEqual(options[0].title, 'Catégorie 1');
    assert.strictEqual(options[1].title, 'Catégorie 2');
  });

  test('fills the form and create a certification center', async function (assert) {
    // given
    const onCancel = () => {};

    const screen = await render(
      <template>
        <CreationForm
          @habilitations={{habilitations}}
          @structureCategories={{structureCategories}}
          @onCancel={{onCancel}}
        />
      </template>,
    );

    // when
    await fillByLabel(`${t('components.certification-centers.creation.name.label')} *`, 'Hello World');
    await click(screen.getByRole('button', { name: `${t('components.certification-centers.creation.type.label')} *` }));
    await screen.findByRole('listbox');
    await click(screen.getByRole('option', { name: 'Établissement scolaire' }));
    await fillByLabel(t('components.certification-centers.creation.external-id.label'), '123456');
    await fillByLabel(`${t('components.certification-centers.creation.dpo.lastname')}DPO`, 'Hadis');
    await fillByLabel(`${t('components.certification-centers.creation.dpo.firstname')}DPO`, 'Jacques');
    await fillByLabel(`${t('components.certification-centers.creation.dpo.email')}DPO`, 'jacques.hadis@example.com');
    await click(screen.getByRole('checkbox', { name: 'Pix+Edu' }));
    await click(
      screen.getByRole('button', {
        name: `${t('components.certification-centers.creation.category.selector.label')} *`,
      }),
    );
    await click(await screen.findByRole('option', { name: 'Catégorie 1' }));

    await click(screen.getByRole('button', { name: t('common.actions.add') }));

    // then
    assert.ok(store.createRecord.called);
    assert.ok(pixToast.sendSuccessNotification.called);
    assert.ok(router.transitionTo.called);

    const recordName = store.createRecord.getCall(0).args[0];
    assert.deepEqual(recordName, 'certification-center');

    const record = store.createRecord.getCall(0).args[1];
    assert.deepEqual(record, {
      name: 'Hello World',
      type: 'SCO',
      externalId: '123456',
      dataProtectionOfficerFirstName: 'Jacques',
      dataProtectionOfficerLastName: 'Hadis',
      dataProtectionOfficerEmail: 'jacques.hadis@example.com',
      habilitations: [{ id: '1', key: 'E', label: 'Pix+Edu' }],
      organizationId: undefined,
      categoryId: '1234',
    });

    const message = pixToast.sendSuccessNotification.getCall(0).args[0];
    assert.deepEqual(message, { message: t('components.certification-centers.creation.success-message') });

    const transitionTo = router.transitionTo.getCall(0).args[0];
    assert.strictEqual(transitionTo, 'authenticated.certification-centers.get');
  });

  test('toggles habilitations', async function (assert) {
    // given
    const onCancel = () => {};

    const screen = await render(
      <template>
        <CreationForm
          @habilitations={{habilitations}}
          @onCancel={{onCancel}}
          @structureCategories={{structureCategories}}
        />
      </template>,
    );

    // when
    await fillByLabel(`${t('components.certification-centers.creation.name.label')} *`, 'Hello World');
    await click(screen.getByRole('button', { name: `${t('components.certification-centers.creation.type.label')} *` }));
    await screen.findByRole('listbox');
    await click(screen.getByRole('option', { name: 'Établissement scolaire' }));

    await click(screen.getByRole('checkbox', { name: 'Pix+Surf' }));
    await click(screen.getByRole('checkbox', { name: 'Pix+Edu' }));
    await click(screen.getByRole('checkbox', { name: 'Pix+Surf' }));
    await click(screen.getByRole('checkbox', { name: 'Pix+Edu' }));
    await click(screen.getByRole('checkbox', { name: 'Pix+Surf' }));
    await click(
      screen.getByRole('button', {
        name: `${t('components.certification-centers.creation.category.selector.label')} *`,
      }),
    );

    await click(await screen.findByRole('option', { name: 'Catégorie 1' }));

    await click(screen.getByRole('button', { name: t('common.actions.add') }));

    // then
    assert.ok(store.createRecord.called);

    const record = store.createRecord.getCall(0).args[1];
    assert.deepEqual(record, {
      name: 'Hello World',
      type: 'SCO',
      externalId: null,
      dataProtectionOfficerFirstName: '',
      dataProtectionOfficerLastName: '',
      dataProtectionOfficerEmail: '',
      habilitations: [{ id: '2', key: 'S', label: 'Pix+Surf' }],
      organizationId: undefined,
      categoryId: '1234',
    });
  });

  test('sets externalId to null if not filled', async function (assert) {
    // given
    const onCancel = () => {};

    const screen = await render(
      <template>
        <CreationForm
          @habilitations={{habilitations}}
          @onCancel={{onCancel}}
          @structureCategories={{structureCategories}}
        />
      </template>,
    );

    // when
    await fillByLabel(`${t('components.certification-centers.creation.name.label')} *`, 'Hello World');
    await click(screen.getByRole('button', { name: `${t('components.certification-centers.creation.type.label')} *` }));
    await screen.findByRole('listbox');
    await click(screen.getByRole('option', { name: 'Établissement scolaire' }));
    await click(
      screen.getByRole('button', {
        name: `${t('components.certification-centers.creation.category.selector.label')} *`,
      }),
    );
    await click(await screen.findByRole('option', { name: 'Catégorie 1' }));

    await click(screen.getByRole('button', { name: t('common.actions.add') }));

    // then
    const record = store.createRecord.getCall(0).args[1];
    assert.deepEqual(record.externalId, null);
  });

  module('when there is no attached organization', function () {
    test('it does not display the attached organization name', async function (assert) {
      // given
      const onCancel = () => {};

      // when
      const screen = await render(
        <template>
          <CreationForm
            @habilitations={{habilitations}}
            @onCancel={{onCancel}}
            @structureCategories={{structureCategories}}
          />
        </template>,
      );

      // then
      assert
        .dom(
          screen.queryByRole('heading', {
            name: t('components.certification-centers.creation.attached-organization-name', {
              attachedOrganizationName: attachedOrganization.name,
            }),
            level: 2,
          }),
        )
        .doesNotExist();
    });

    test('it does not disable the external id and category inputs', async function (assert) {
      // given
      const onCancel = () => {};

      // when
      const screen = await render(
        <template>
          <CreationForm
            @habilitations={{habilitations}}
            @onCancel={{onCancel}}
            @structureCategories={{structureCategories}}
          />
        </template>,
      );

      // then
      assert
        .dom(screen.getByRole('textbox', { name: t('components.certification-centers.creation.external-id.label') }))
        .isNotDisabled();
      assert
        .dom(
          screen.getByRole('button', {
            name: `${t('components.certification-centers.creation.category.selector.label')} *`,
          }),
        )
        .doesNotHaveAttribute('aria-disabled');
    });
  });

  module('when there is an attached organization', function () {
    test('it displays the attached organization name', async function (assert) {
      // given
      const onCancel = () => {};

      // when
      const screen = await render(
        <template>
          <CreationForm
            @habilitations={{habilitations}}
            @attachedOrganization={{attachedOrganization}}
            @onCancel={{onCancel}}
            @structureCategories={{structureCategories}}
          />
        </template>,
      );

      // then
      assert
        .dom(
          screen.getByRole('heading', {
            name: t('components.certification-centers.creation.attached-organization-name', {
              attachedOrganizationName: attachedOrganization.name,
            }),
            level: 2,
          }),
        )
        .exists();
    });

    test("it prefills the name, the type and the external id + category (disabled) with the attached organization's ones", async function (assert) {
      // given
      const onCancel = () => {};

      // when
      const screen = await render(
        <template>
          <CreationForm
            @habilitations={{habilitations}}
            @attachedOrganization={{attachedOrganization}}
            @onCancel={{onCancel}}
            @structureCategories={{structureCategories}}
          />
        </template>,
      );

      // then
      assert
        .dom(screen.getByRole('textbox', { name: `${t('components.certification-centers.creation.name.label')} *` }))
        .hasValue('Wayne Enterprises');
      assert.strictEqual(
        screen.getByRole('button', { name: `${t('components.certification-centers.creation.type.label')} *` })
          .innerText,
        'Établissement scolaire',
      );
      assert
        .dom(screen.getByRole('textbox', { name: t('components.certification-centers.creation.external-id.label') }))
        .hasValue('WAYNE_123');
      assert
        .dom(screen.getByRole('textbox', { name: t('components.certification-centers.creation.external-id.label') }))
        .isDisabled();
      assert
        .dom(
          screen.getByRole('button', {
            name: `${t('components.certification-centers.creation.category.selector.label')} *`,
          }),
        )
        .hasAttribute('aria-disabled');
    });

    test('it creates a certification center attached to the organization', async function (assert) {
      // given
      const onCancel = () => {};
      const screen = await render(
        <template>
          <CreationForm
            @habilitations={{habilitations}}
            @attachedOrganization={{attachedOrganization}}
            @onCancel={{onCancel}}
            @structureCategories={{structureCategories}}
          />
        </template>,
      );

      // when
      await click(screen.getByRole('button', { name: t('common.actions.add') }));

      // then
      const record = store.createRecord.getCall(0).args[1];
      assert.deepEqual(record, {
        name: 'Wayne Enterprises',
        type: 'SCO',
        externalId: 'WAYNE_123',
        dataProtectionOfficerFirstName: '',
        dataProtectionOfficerLastName: '',
        dataProtectionOfficerEmail: '',
        habilitations: [],
        organizationId: '123',
        categoryId: '1234',
      });
      assert.ok(router.transitionTo.called);
    });
  });

  module('Errors', function () {
    module('When required fields are not filled in', function () {
      test('it does not create certification center, displays error toast and specific messages on error fields', async function (assert) {
        // given
        const onCancel = () => {};
        const screen = await render(
          <template>
            <CreationForm
              @habilitations={{habilitations}}
              @onCancel={{onCancel}}
              @structureCategories={{structureCategories}}
            />
          </template>,
        );

        // when
        await click(screen.getByRole('button', { name: t('common.actions.add') }));

        // then
        assert.ok(store.createRecord.notCalled);
        assert.ok(
          pixToast.sendErrorNotification.calledWithExactly({
            message: t('components.certification-centers.creation.error-messages.error-toast'),
          }),
        );

        const nameErrorMessage = screen.getByText(t('components.certification-centers.creation.error-messages.name'));
        const typeErrorMessage = screen.getByText(t('components.certification-centers.creation.error-messages.type'));
        const categoryErrorMessage = screen.getByText(
          t('components.certification-centers.creation.category.selector.error-message'),
        );
        assert.dom(nameErrorMessage).exists();
        assert.dom(typeErrorMessage).exists();
        assert.dom(categoryErrorMessage).exists();
      });

      test('it should focus on first field in error', async function (assert) {
        // given
        const onCancel = () => {};
        const screen = await render(
          <template>
            <CreationForm
              @habilitations={{habilitations}}
              @onCancel={{onCancel}}
              @structureCategories={{structureCategories}}
            />
          </template>,
        );

        // when
        await click(screen.getByRole('button', { name: t('common.actions.add') }));

        //then
        const nameInput = screen.getByRole('textbox', {
          name: `${t('components.certification-centers.creation.name.label')} *`,
        });
        assert.strictEqual(document.activeElement, nameInput);
      });
    });
    test('displays default error toast for unexepected error', async function (assert) {
      // given
      const onCancel = () => {};
      store.createRecord.returns({ save: sinon.stub().rejects() });

      const screen = await render(
        <template>
          <CreationForm
            @habilitations={{habilitations}}
            @onCancel={{onCancel}}
            @structureCategories={{structureCategories}}
          />
        </template>,
      );

      // when
      await fillByLabel(`${t('components.certification-centers.creation.name.label')} *`, 'Hello World');
      await click(
        screen.getByRole('button', { name: `${t('components.certification-centers.creation.type.label')} *` }),
      );
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Établissement scolaire' }));
      await click(
        screen.getByRole('button', {
          name: `${t('components.certification-centers.creation.category.selector.label')} *`,
        }),
      );

      await click(await screen.findByRole('option', { name: 'Catégorie 1' }));
      await click(screen.getByRole('button', { name: t('common.actions.add') }));

      // then
      assert.ok(pixToast.sendErrorNotification.called);

      const message = pixToast.sendErrorNotification.getCall(0).args[0];
      assert.deepEqual(message, { message: t('common.notifications.generic-error') });
    });

    test('displays an error toast for API error', async function (assert) {
      // given
      const onCancel = () => {};
      store.createRecord.returns({ save: sinon.stub().rejects({ errors: [{ detail: 'BOOM!' }] }) });

      const screen = await render(
        <template>
          <CreationForm
            @habilitations={{habilitations}}
            @onCancel={{onCancel}}
            @structureCategories={{structureCategories}}
          />
        </template>,
      );

      // when
      await fillByLabel(`${t('components.certification-centers.creation.name.label')} *`, 'Hello World');
      await click(
        screen.getByRole('button', { name: `${t('components.certification-centers.creation.type.label')} *` }),
      );
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Établissement scolaire' }));
      await click(
        screen.getByRole('button', {
          name: `${t('components.certification-centers.creation.category.selector.label')} *`,
        }),
      );
      await click(await screen.findByRole('option', { name: 'Catégorie 1' }));
      await click(screen.getByRole('button', { name: t('common.actions.add') }));

      // then
      assert.ok(pixToast.sendErrorNotification.called);

      const message = pixToast.sendErrorNotification.getCall(0).args[0];
      assert.deepEqual(message, { message: 'BOOM!' });
    });
  });
});
