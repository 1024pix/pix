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
        key: 'field2',
        columnName: 'Prénom',
      },
      {
        key: 'field1',
        columnName: 'Date de naissance',
      },
    ];

    this.set('reconciliationFields', reconciliationFields);
    this.set('organizationName', organizationName);
    this.set('onSubmit', onSubmit);
  });

  test('it should display reconciliation form', async function (assert) {
    // given / when
    const screen = await render(
      hbs`<Campaigns::Invited::LearnerReconciliation
        @reconciliationFields={{this.reconciliationFields}}
        @organizationName={{this.organizationName}}
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

    assert.ok(screen.getByRole('textbox', { name: 'Prénom' }));
    assert.ok(screen.getByRole('textbox', { name: 'Date de naissance' }));
    assert.ok(screen.getByRole('button', { name: this.intl.t('common.actions.lets-go') }));
  });

  module('validation cases', function () {
    test('should display error message when field not defined', async function (assert) {
      // given
      const screen = await render(
        hbs`<Campaigns::Invited::LearnerReconciliation
          @reconciliationFields={{this.reconciliationFields}}
          @organizationName={{this.organizationName}}
        />`,
      );
      // when
      const button = screen.getByRole('button', { name: this.intl.t('common.actions.lets-go') });

      await click(button);
      // then
      assert.strictEqual(
        screen.getAllByText(this.intl.t('components.invited.reconciliation.error-message.mandatory-field')).length,
        2,
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
          @onSubmit={{this.onSubmit}}
        />`,
      );
      // when
      await fillIn(screen.getByRole('textbox', { name: 'Prénom' }), 'jaune');
      await fillIn(screen.getByRole('textbox', { name: 'Date de naissance' }), '06/01/2020');

      const button = screen.getByRole('button', { name: this.intl.t('common.actions.lets-go') });

      await click(button);

      // then
      assert.true(onSubmit.calledWithExactly({ field2: 'jaune', field1: '06/01/2020' }));
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
          @onSubmit={{this.onSubmit}}
        />`,
      );
      assert.ok(screen.getByText('Une erreur!!!'));
    });
  });
});
