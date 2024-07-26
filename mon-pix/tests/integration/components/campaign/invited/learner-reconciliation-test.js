import { render, within } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign | Invited | learner-reconciliation', function (hooks) {
  setupIntlRenderingTest(hooks);
  let reconciliationFields, organizationName, onSubmit;

  hooks.beforeEach(function () {
    onSubmit = sinon.stub();
    organizationName = 'My Organization';
    reconciliationFields = [
      {
        fieldId: 'field2',
        name: 'COMMON_FIRSTNAME',
        type: 'string',
      },
      {
        fieldId: 'field1',
        name: 'COMMON_BIRTHDATE',
        type: 'date',
      },
    ];

    const FIELD_KEY = {
      COMMON_FIRSTNAME: 'components.invited.reconciliation.field.firstname',
      COMMON_LASTNAME: 'components.invited.reconciliation.field.lastname',
      COMMON_BIRTHDATE: 'components.invited.reconciliation.field.birthdate',
    };

    this.set('reconciliationFields', reconciliationFields);
    this.set('mappingFields', FIELD_KEY);
    this.set('organizationName', organizationName);
    this.set('onSubmit', onSubmit);
  });

  test('it should display reconciliation form', async function (assert) {
    // given / when
    const screen = await render(
      hbs`<Campaigns::Invited::LearnerReconciliation
  @reconciliationFields={{this.reconciliationFields}}
  @organizationName={{this.organizationName}}
  @mappingFields={{this.mappingFields}}
/>`,
    );
    // then
    assert.ok(
      screen.getByRole('heading', {
        name: this.intl.t('components.invited.reconciliation.title', { organizationName }),
        level: 1,
      }),
    );
    assert.ok(screen.getByText(this.intl.t('common.form.mandatory-all-fields')));
    assert.ok(screen.getByRole('textbox', { name: this.intl.t('components.invited.reconciliation.field.firstname') }));
    assert.ok(
      screen.getByRole('textbox', {
        name: `${this.intl.t('components.invited.reconciliation.field.birthdate')} ${this.intl.t('components.invited.reconciliation.field.sub-label.date', { dateFormat: '31/12/2020' })}`,
      }),
    );
    assert.ok(screen.getByRole('button', { name: this.intl.t('common.actions.lets-go') }));
  });

  module('validation cases', function () {
    test('should display error message when field not defined', async function (assert) {
      // given
      const screen = await render(
        hbs`<Campaigns::Invited::LearnerReconciliation
  @reconciliationFields={{this.reconciliationFields}}
  @organizationName={{this.organizationName}}
  @mappingFields={{this.mappingFields}}
/>`,
      );
      // when
      const button = screen.getByRole('button', { name: this.intl.t('common.actions.lets-go') });

      await click(button);
      // then
      assert.ok(
        screen.getByText(
          this.intl.t('components.invited.reconciliation.error-message.mandatory-field', {
            fieldName: this.intl.t('components.invited.reconciliation.field.firstname'),
          }),
        ),
      );
      assert.ok(
        screen.getByText(
          this.intl.t('components.invited.reconciliation.error-message.mandatory-field', {
            fieldName: this.intl.t('components.invited.reconciliation.field.birthdate'),
          }),
        ),
      );
    });

    test('should display error date when wrong date written', async function (assert) {
      // given
      const screen = await render(
        hbs`<Campaigns::Invited::LearnerReconciliation
  @reconciliationFields={{this.reconciliationFields}}
  @organizationName={{this.organizationName}}
  @mappingFields={{this.mappingFields}}
/>`,
      );
      // when
      await fillIn(
        screen.getByRole('textbox', {
          name: `${this.intl.t('components.invited.reconciliation.field.birthdate')} ${this.intl.t('components.invited.reconciliation.field.sub-label.date', { dateFormat: '31/12/2020' })}`,
        }),
        '2020-45-12',
      );

      const button = screen.getByRole('button', { name: this.intl.t('common.actions.lets-go') });

      await click(button);
      // then
      assert.ok(
        screen.getByText(
          this.intl.t('components.invited.reconciliation.error-message.date-field', {
            fieldName: this.intl.t('components.invited.reconciliation.field.birthdate'),
          }),
        ),
      );
    });

    module('isLoading', function () {
      test('should not disable button', async function (assert) {
        // given
        const screen = await render(
          hbs`<Campaigns::Invited::LearnerReconciliation
  @reconciliationFields={{this.reconciliationFields}}
  @organizationName={{this.organizationName}}
  @onSubmit={{this.onSubmit}}
  @mappingFields={{this.mappingFields}}
  @isLoading={{false}}
/>`,
        );
        // when
        const button = screen.getByRole('button', { name: this.intl.t('common.actions.lets-go') });
        assert.false(button.hasAttribute('disabled'));
      });

      test('should disable button', async function (assert) {
        // given
        const screen = await render(
          hbs`<Campaigns::Invited::LearnerReconciliation
  @reconciliationFields={{this.reconciliationFields}}
  @organizationName={{this.organizationName}}
  @onSubmit={{this.onSubmit}}
  @mappingFields={{this.mappingFields}}
  @isLoading={{true}}
/>`,
        );
        // when
        const form = screen.getByRole('form');
        const button = within(form).getByRole('button');
        assert.true(button.hasAttribute('disabled'));
      });
    });

    test('should call submit to register learner', async function (assert) {
      // given
      const screen = await render(
        hbs`<Campaigns::Invited::LearnerReconciliation
  @reconciliationFields={{this.reconciliationFields}}
  @organizationName={{this.organizationName}}
  @mappingFields={{this.mappingFields}}
  @onSubmit={{this.onSubmit}}
/>`,
      );
      // when
      await fillIn(
        screen.getByRole('textbox', { name: this.intl.t('components.invited.reconciliation.field.firstname') }),
        'jaune',
      );
      await fillIn(
        screen.getByRole('textbox', {
          name: `${this.intl.t('components.invited.reconciliation.field.birthdate')} ${this.intl.t('components.invited.reconciliation.field.sub-label.date', { dateFormat: '31/12/2020' })}`,
        }),
        '06/01/2020',
      );

      const button = screen.getByRole('button', { name: this.intl.t('common.actions.lets-go') });

      await click(button);

      // then
      assert.true(onSubmit.calledWithExactly({ field2: 'jaune', field1: '2020-01-06' }));
    });
  });

  module('error case', function () {
    test('should display errorMessage', async function (assert) {
      // given
      const screen = await render(
        hbs`<Campaigns::Invited::LearnerReconciliation
  @reconciliationFields={{this.reconciliationFields}}
  @organizationName={{this.organizationName}}
  @reconciliationError={{'Une erreur!!!'}}
  @mappingFields={{this.mappingFields}}
  @onSubmit={{this.onSubmit}}
/>`,
      );
      assert.ok(screen.getByText('Une erreur!!!'));
    });
  });
});
