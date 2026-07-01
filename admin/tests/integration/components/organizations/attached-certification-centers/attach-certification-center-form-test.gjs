import { render } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import AttachedCertificationCenterForm from 'pix-admin/components/organizations/attached-certification-centers/attach-certification-center-form';
import setupIntlRenderingTest from 'pix-admin/tests/helpers/setup-intl-rendering';
import { module, test } from 'qunit';
import sinon from 'sinon';

module(
  'Integration | Component | organizations/attached-certification-centers/attach-certification-center-form',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    module('Render', function () {
      test('it displays a form with an input and a button', async function (assert) {
        // when
        const screen = await render(<template><AttachedCertificationCenterForm /></template>);

        // then
        assert
          .dom(
            screen.getByRole('form', {
              name: t('components.organizations.attached-certification-center.attach-form.name'),
            }),
          )
          .exists();
        assert
          .dom(
            screen.getByRole('spinbutton', {
              name: (value) =>
                value.includes(t('components.organizations.attached-certification-center.attach-form.input-label')),
            }),
          )
          .exists();
        assert.dom(screen.getByRole('button', { name: t('common.actions.validate') })).exists();
      });
    });

    module('behaviour', function () {
      test('it updates input value when typing', async function (assert) {
        // when
        const screen = await render(<template><AttachedCertificationCenterForm /></template>);

        const input = screen.getByRole(
          'spinbutton',
          t('components.organizations.attached-certification-center.attach-form.input-label'),
        );

        await fillIn(input, '123');

        // then
        assert.dom(input).hasValue('123');
      });

      test('it does not allow to type text in input', async function (assert) {
        // when
        const screen = await render(<template><AttachedCertificationCenterForm /></template>);

        const input = screen.getByRole(
          'spinbutton',
          t('components.organizations.attached-certification-center.attach-form.input-label'),
        );

        // then
        assert.dom(input).hasAttribute('type', 'number');
      });

      test('it should submit form with certificationCenterId', async function (assert) {
        // given
        const onFormSubmitted = sinon.stub();

        // when
        const screen = await render(
          <template><AttachedCertificationCenterForm @onFormSubmitted={{onFormSubmitted}} /></template>,
        );

        const input = screen.getByRole(
          'spinbutton',
          t('components.organizations.attached-certification-center.attach-form.input-label'),
        );
        await fillIn(input, '123');

        const validateButton = screen.getByRole('button', { name: t('common.actions.validate') });
        await click(validateButton);

        // then
        assert.ok(onFormSubmitted.calledOnceWithExactly('123'));
      });

      test('it should not submit form if certificationCenterId is not provided', async function (assert) {
        // given
        const onFormSubmitted = sinon.stub();

        // when
        const screen = await render(
          <template><AttachedCertificationCenterForm @onFormSubmitted={{onFormSubmitted}} /></template>,
        );

        const validateButton = screen.getByRole('button', { name: t('common.actions.validate') });
        await click(validateButton);

        // then
        assert.ok(onFormSubmitted.notCalled);
      });
    });
  },
);
