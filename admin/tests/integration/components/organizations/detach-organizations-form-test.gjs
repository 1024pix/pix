import { fillByLabel, render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import DetachOrganizationsForm from 'pix-admin/components/organizations/detach-organizations-form';
import { t } from 'pix-admin/tests/helpers/setup-intl';
import setupIntlRenderingTest from 'pix-admin/tests/helpers/setup-intl-rendering';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Integration | Component | Organizations | DetachOrganizationsForm', function (hooks) {
  setupIntlRenderingTest(hooks);

  let pixToast;

  hooks.beforeEach(function () {
    pixToast = this.owner.lookup('service:pixToast');
    sinon.stub(pixToast, 'sendSuccessNotification').resolves();
  });

  test('it should disable the submit button when the input is empty', async function (assert) {
    // given
    const detachOrganizations = sinon.stub();
    const reloadAfterSuccess = sinon.stub();

    // when
    const screen = await render(
      <template>
        <DetachOrganizationsForm
          @detachOrganizations={{detachOrganizations}}
          @reloadAfterSuccess={{reloadAfterSuccess}}
        />
      </template>,
    );

    // then
    assert
      .dom(
        screen.getByRole('button', {
          name: t('components.combined-course-blueprints.organizations.detach-organizations.confirm'),
        }),
      )
      .hasAttribute('aria-disabled', 'true');
  });

  module('when detach succeeds', function () {
    test('it should call detachOrganizations with unique organization ids', async function (assert) {
      // given
      const detachOrganizations = sinon.stub().resolves({ detachedIds: [], alreadyDetachedIds: [] });
      const reloadAfterSuccess = sinon.stub().resolves();

      const screen = await render(
        <template>
          <DetachOrganizationsForm
            @detachOrganizations={{detachOrganizations}}
            @reloadAfterSuccess={{reloadAfterSuccess}}
          />
        </template>,
      );

      // when
      await fillByLabel(t('components.combined-course-blueprints.organizations.detach-organizations.label'), '1, 2, 1');
      await click(
        screen.getByRole('button', {
          name: t('components.combined-course-blueprints.organizations.detach-organizations.confirm'),
        }),
      );

      // then
      assert.ok(detachOrganizations.calledOnceWithExactly([1, 2]));
    });

    test('it should display a success notification, clear the input and reload', async function (assert) {
      // given
      const detachOrganizations = sinon.stub().resolves({ detachedIds: [1, 2], alreadyDetachedIds: [] });
      const reloadAfterSuccess = sinon.stub().resolves();

      const screen = await render(
        <template>
          <DetachOrganizationsForm
            @detachOrganizations={{detachOrganizations}}
            @reloadAfterSuccess={{reloadAfterSuccess}}
          />
        </template>,
      );

      // when
      await fillByLabel(t('components.combined-course-blueprints.organizations.detach-organizations.label'), '1, 2');
      await click(
        screen.getByRole('button', {
          name: t('components.combined-course-blueprints.organizations.detach-organizations.confirm'),
        }),
      );

      // then
      assert.ok(pixToast.sendSuccessNotification.calledOnce);
      const { message } = pixToast.sendSuccessNotification.firstCall.args[0];
      assert.strictEqual(
        message.toString(),
        t('components.combined-course-blueprints.organizations.detach-organizations.message.success'),
      );
      assert.ok(reloadAfterSuccess.calledOnce);
      assert
        .dom(screen.getByLabelText(t('components.combined-course-blueprints.organizations.detach-organizations.label')))
        .hasValue('');
    });

    test('it should display the success message and the already detached organizations when some were already detached', async function (assert) {
      // given
      const detachOrganizations = sinon.stub().resolves({ detachedIds: [1, 2], alreadyDetachedIds: [3] });
      const reloadAfterSuccess = sinon.stub().resolves();

      const screen = await render(
        <template>
          <DetachOrganizationsForm
            @detachOrganizations={{detachOrganizations}}
            @reloadAfterSuccess={{reloadAfterSuccess}}
          />
        </template>,
      );

      // when
      await fillByLabel(t('components.combined-course-blueprints.organizations.detach-organizations.label'), '1, 2, 3');
      await click(
        screen.getByRole('button', {
          name: t('components.combined-course-blueprints.organizations.detach-organizations.confirm'),
        }),
      );

      // then
      const { message } = pixToast.sendSuccessNotification.firstCall.args[0];
      assert.strictEqual(
        message.toString(),
        `${t('components.combined-course-blueprints.organizations.detach-organizations.message.success')}<br />${t(
          'components.combined-course-blueprints.organizations.detach-organizations.message.already-detached',
          {
            organizationIds: '3',
          },
        )}`,
      );
    });

    test('it should display that no organization was detached and list the already detached ones when all were already detached', async function (assert) {
      // given
      const detachOrganizations = sinon.stub().resolves({ detachedIds: [], alreadyDetachedIds: [1, 2] });
      const reloadAfterSuccess = sinon.stub().resolves();

      const screen = await render(
        <template>
          <DetachOrganizationsForm
            @detachOrganizations={{detachOrganizations}}
            @reloadAfterSuccess={{reloadAfterSuccess}}
          />
        </template>,
      );

      // when
      await fillByLabel(t('components.combined-course-blueprints.organizations.detach-organizations.label'), '1, 2');
      await click(
        screen.getByRole('button', {
          name: t('components.combined-course-blueprints.organizations.detach-organizations.confirm'),
        }),
      );

      // then
      const { message } = pixToast.sendSuccessNotification.firstCall.args[0];
      assert.strictEqual(
        message.toString(),
        `${t('components.combined-course-blueprints.organizations.detach-organizations.message.no-organization-detached')}<br />${t(
          'components.combined-course-blueprints.organizations.detach-organizations.message.already-detached',
          {
            organizationIds: '1, 2',
          },
        )}`,
      );
    });

    test('it should only display that no organization was detached when none was detached nor already detached', async function (assert) {
      // given
      const detachOrganizations = sinon.stub().resolves({ detachedIds: [], alreadyDetachedIds: [] });
      const reloadAfterSuccess = sinon.stub().resolves();

      const screen = await render(
        <template>
          <DetachOrganizationsForm
            @detachOrganizations={{detachOrganizations}}
            @reloadAfterSuccess={{reloadAfterSuccess}}
          />
        </template>,
      );

      // when
      await fillByLabel(t('components.combined-course-blueprints.organizations.detach-organizations.label'), '1, 2');
      await click(
        screen.getByRole('button', {
          name: t('components.combined-course-blueprints.organizations.detach-organizations.confirm'),
        }),
      );

      // then
      const { message } = pixToast.sendSuccessNotification.firstCall.args[0];
      assert.strictEqual(
        message.toString(),
        t('components.combined-course-blueprints.organizations.detach-organizations.message.no-organization-detached'),
      );
    });
  });

  module('when detach fails', function () {
    test('it should not display a success notification, nor clear the input, nor reload', async function (assert) {
      // given
      const detachOrganizations = sinon.stub().resolves(false);
      const reloadAfterSuccess = sinon.stub().resolves();

      const screen = await render(
        <template>
          <DetachOrganizationsForm
            @detachOrganizations={{detachOrganizations}}
            @reloadAfterSuccess={{reloadAfterSuccess}}
          />
        </template>,
      );

      // when
      await fillByLabel(t('components.combined-course-blueprints.organizations.detach-organizations.label'), '1, 2');
      await click(
        screen.getByRole('button', {
          name: t('components.combined-course-blueprints.organizations.detach-organizations.confirm'),
        }),
      );

      // then
      assert.ok(pixToast.sendSuccessNotification.notCalled);
      assert.ok(reloadAfterSuccess.notCalled);
      assert
        .dom(screen.getByLabelText(t('components.combined-course-blueprints.organizations.detach-organizations.label')))
        .hasValue('1, 2');
    });
  });
});
