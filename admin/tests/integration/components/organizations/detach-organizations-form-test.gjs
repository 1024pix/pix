import { fillByLabel, render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import DetachOrganizationsForm from 'pix-admin/components/organizations/detach-organizations-form';
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
      const detachOrganizations = sinon.stub().resolves(true);
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
      const detachOrganizations = sinon.stub().resolves(true);
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
      assert.ok(
        pixToast.sendSuccessNotification.calledOnceWithExactly({
          message: t('components.combined-course-blueprints.organizations.detach-organizations.message.success'),
        }),
      );
      assert.ok(reloadAfterSuccess.calledOnce);
      assert
        .dom(screen.getByLabelText(t('components.combined-course-blueprints.organizations.detach-organizations.label')))
        .hasValue('');
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
