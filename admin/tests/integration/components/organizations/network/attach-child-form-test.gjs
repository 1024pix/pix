import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, fillIn, triggerEvent } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import AttachChildForm from 'pix-admin/components/organizations/network/attach-child-form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | organizations/network/attach-child-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should update input value when typing', async function (assert) {
    // given
    const onFormSubmitted = sinon.stub();

    // when
    const screen = await render(<template><AttachChildForm @onFormSubmitted={{onFormSubmitted}} /></template>);

    const input = screen.getByRole('textbox');
    await fillIn(input, '5432,789');

    // then
    assert.dom(input).hasValue('5432,789');
  });

  test('should submit form with input value and reset form', async function (assert) {
    // given
    const onFormSubmitted = sinon.stub();

    // when
    const screen = await render(<template><AttachChildForm @onFormSubmitted={{onFormSubmitted}} /></template>);

    const input = screen.getByRole('textbox');
    await fillIn(input, '1234');
    await click(screen.getByRole('button', { name: 'Ajouter' }));

    // then
    assert.ok(onFormSubmitted.calledOnceWithExactly('1234'));
    assert.dom(input).hasValue('');
  });

  test('should prevent default form submission', async function (assert) {
    // given
    const onFormSubmitted = sinon.stub();

    // when
    const screen = await render(<template><AttachChildForm @onFormSubmitted={{onFormSubmitted}} /></template>);

    const input = screen.getByRole('textbox');
    await fillIn(input, '1234');

    const form = screen.getByRole('form');
    await triggerEvent(form, 'submit');

    // then
    assert.ok(onFormSubmitted.called, 'Form submission callback was called');
  });

  module('when ids contain non-numeric values', function (hooks) {
    let sendErrorNotificationStub;

    hooks.beforeEach(function () {
      sendErrorNotificationStub = sinon.stub();
      class PixToastStub extends Service {
        sendErrorNotification = sendErrorNotificationStub;
      }
      this.owner.register('service:pixToast', PixToastStub);
    });

    test('should display an error notification and not submit the form', async function (assert) {
      // given
      const onFormSubmitted = sinon.stub();
      const screen = await render(<template><AttachChildForm @onFormSubmitted={{onFormSubmitted}} /></template>);
      const input = screen.getByRole('textbox');
      await fillIn(input, 'abc');

      // when
      await click(screen.getByRole('button', { name: 'Ajouter' }));

      // then
      assert.true(
        sendErrorNotificationStub.calledOnceWithExactly({
          message: t('components.organizations.network.attach-child-form.invalid-ids-error'),
        }),
      );
      assert.ok(onFormSubmitted.notCalled);
    });
  });
});
