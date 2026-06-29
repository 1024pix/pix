import { render, within } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import LearnerReconciliation from 'mon-pix/components/campaigns/invited/learner-reconciliation';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign | Invited | learner-reconciliation', function (hooks) {
  setupIntlRenderingTest(hooks);
  const state = {};

  hooks.beforeEach(function () {
    state.onSubmit = sinon.stub();
    state.organizationName = 'My Organization';
    state.reconciliationFields = [
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

    state.mappingFields = {
      COMMON_FIRSTNAME: 'components.invited.reconciliation.field.firstname',
      COMMON_LASTNAME: 'components.invited.reconciliation.field.lastname',
      COMMON_BIRTHDATE: 'components.invited.reconciliation.field.birthdate',
    };
  });

  test('it should display reconciliation form', async function (assert) {
    // given / when
    const screen = await render(
      <template>
        <LearnerReconciliation
          @reconciliationFields={{state.reconciliationFields}}
          @organizationName={{state.organizationName}}
          @mappingFields={{state.mappingFields}}
        />
      </template>,
    );
    // then
    assert.ok(
      screen.getByRole('heading', {
        name: t('components.invited.reconciliation.title', { organizationName: state.organizationName }),
        level: 1,
      }),
    );
    assert.ok(screen.getByText(t('common.form.mandatory-all-fields')));
    assert.ok(screen.getByRole('textbox', { name: t('components.invited.reconciliation.field.firstname') }));
    assert.ok(
      screen.getByRole('textbox', {
        name: `${t('components.invited.reconciliation.field.birthdate')} ${t('components.invited.reconciliation.field.sub-label.date', { dateFormat: '31/12/2020' })}`,
      }),
    );
    assert.ok(screen.getByRole('button', { name: t('common.actions.lets-go') }));
  });

  module('validation cases', function () {
    test('should display error message when field not defined', async function (assert) {
      // given
      const screen = await render(
        <template>
          <LearnerReconciliation
            @reconciliationFields={{state.reconciliationFields}}
            @organizationName={{state.organizationName}}
            @mappingFields={{state.mappingFields}}
          />
        </template>,
      );
      // when
      const button = screen.getByRole('button', { name: t('common.actions.lets-go') });

      await click(button);
      // then
      assert.ok(
        screen.getByText(
          t('components.invited.reconciliation.error-message.mandatory-field', {
            fieldName: t('components.invited.reconciliation.field.firstname'),
          }),
        ),
      );
      assert.ok(
        screen.getByText(
          t('components.invited.reconciliation.error-message.mandatory-field', {
            fieldName: t('components.invited.reconciliation.field.birthdate'),
          }),
        ),
      );
    });

    test('should display error date when wrong date written', async function (assert) {
      // given
      const screen = await render(
        <template>
          <LearnerReconciliation
            @reconciliationFields={{state.reconciliationFields}}
            @organizationName={{state.organizationName}}
            @mappingFields={{state.mappingFields}}
          />
        </template>,
      );
      // when
      await fillIn(
        screen.getByRole('textbox', {
          name: `${t('components.invited.reconciliation.field.birthdate')} ${t('components.invited.reconciliation.field.sub-label.date', { dateFormat: '31/12/2020' })}`,
        }),
        '2020-45-12',
      );

      const button = screen.getByRole('button', { name: t('common.actions.lets-go') });

      await click(button);
      // then
      assert.ok(
        screen.getByText(
          t('components.invited.reconciliation.error-message.date-field', {
            fieldName: t('components.invited.reconciliation.field.birthdate'),
          }),
        ),
      );
    });

    module('isLoading', function () {
      test('should not disable button', async function (assert) {
        // given
        const screen = await render(
          <template>
            <LearnerReconciliation
              @reconciliationFields={{state.reconciliationFields}}
              @organizationName={{state.organizationName}}
              @onSubmit={{state.onSubmit}}
              @mappingFields={{state.mappingFields}}
              @isLoading={{false}}
            />
          </template>,
        );
        // when
        const button = screen.getByRole('button', { name: t('common.actions.lets-go') });
        assert.false(button.hasAttribute('aria-disabled'));
      });

      test('should disable button', async function (assert) {
        // given
        const screen = await render(
          <template>
            <LearnerReconciliation
              @reconciliationFields={{state.reconciliationFields}}
              @organizationName={{state.organizationName}}
              @onSubmit={{state.onSubmit}}
              @mappingFields={{state.mappingFields}}
              @isLoading={{true}}
            />
          </template>,
        );
        // when
        const form = screen.getByRole('form');
        const button = within(form).getByRole('button');
        assert.true(button.hasAttribute('aria-disabled'));
      });
    });

    test('should call submit to register learner', async function (assert) {
      // given
      const screen = await render(
        <template>
          <LearnerReconciliation
            @reconciliationFields={{state.reconciliationFields}}
            @organizationName={{state.organizationName}}
            @mappingFields={{state.mappingFields}}
            @onSubmit={{state.onSubmit}}
          />
        </template>,
      );
      // when
      await fillIn(
        screen.getByRole('textbox', { name: t('components.invited.reconciliation.field.firstname') }),
        'jaune',
      );
      await fillIn(
        screen.getByRole('textbox', {
          name: `${t('components.invited.reconciliation.field.birthdate')} ${t('components.invited.reconciliation.field.sub-label.date', { dateFormat: '31/12/2020' })}`,
        }),
        '06/01/2020',
      );

      const button = screen.getByRole('button', { name: t('common.actions.lets-go') });

      await click(button);

      // then
      assert.true(state.onSubmit.calledWithExactly({ field2: 'jaune', field1: '2020-01-06' }));
    });
  });

  module('error case', function () {
    test('should display errorMessage', async function (assert) {
      // given
      const screen = await render(
        <template>
          <LearnerReconciliation
            @reconciliationFields={{state.reconciliationFields}}
            @organizationName={{state.organizationName}}
            @reconciliationError="Une erreur!!!"
            @mappingFields={{state.mappingFields}}
            @onSubmit={{state.onSubmit}}
          />
        </template>,
      );
      assert.ok(screen.getByText('Une erreur!!!'));
    });
  });
});
