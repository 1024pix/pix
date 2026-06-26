import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import Reconciliation from 'mon-pix/components/pages/organizations/invited/reconciliation';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Integration | Component | Pages | Organizations | Invited | Reconciliation', function (hooks) {
  setupIntlRenderingTest(hooks);

  const code = 'CODE123';
  const organizationId = 1;
  let model, organizationLearner, transitionToStub, setAssociationDoneStub;

  hooks.beforeEach(function () {
    model = {
      verifiedCode: { id: code },
      organizationToJoin: {
        id: organizationId,
        name: 'My Organization',
        reconciliationFields: [
          { fieldId: 'field2', name: 'COMMON_FIRSTNAME', type: 'string' },
          { fieldId: 'field1', name: 'COMMON_BIRTHDATE', type: 'date' },
        ],
      },
    };

    organizationLearner = {
      unloadRecord: sinon.stub(),
      save: sinon.stub().resolves(),
    };

    transitionToStub = sinon.stub();
    setAssociationDoneStub = sinon.stub();

    class StoreStub extends Service {
      findRecord = sinon.stub().resolves({ id: code, type: 'campaign' });
      createRecord = sinon.stub().returns(organizationLearner);
    }
    class RouterStub extends Service {
      transitionTo = transitionToStub;
    }
    class AccessStorageStub extends Service {
      setAssociationDone = setAssociationDoneStub;
    }

    this.owner.register('service:store', StoreStub);
    this.owner.register('service:router', RouterStub);
    this.owner.register('service:accessStorage', AccessStorageStub);
  });

  async function fillFormAndSubmit(screen) {
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
    await click(screen.getByRole('button', { name: t('common.actions.lets-go') }));
  }

  test('loading state must be false by default: button is not disabled', async function (assert) {
    // given
    const reconciliationModel = model;

    // when
    const screen = await render(<template><Reconciliation @model={{reconciliationModel}} /></template>);

    // then
    const button = screen.getByRole('button', { name: t('common.actions.lets-go') });
    assert.false(button.hasAttribute('aria-disabled'));
  });

  test('should transition to next route if everything ok', async function (assert) {
    // given
    const reconciliationModel = model;
    const screen = await render(<template><Reconciliation @model={{reconciliationModel}} /></template>);

    // when
    await fillFormAndSubmit(screen);

    // then
    assert.true(organizationLearner.save.called, 'called save');
    assert.true(organizationLearner.unloadRecord.called, 'called unloadRecord');
    assert.true(setAssociationDoneStub.calledWithExactly(organizationId), 'called accessStorage');
    assert.true(
      transitionToStub.calledWithExactly('campaigns.fill-in-participant-external-id', code),
      'called transitionTo',
    );
  });

  test('should not transition and not mark association done when an error occurred', async function (assert) {
    // given
    organizationLearner.save.rejects({ errors: [{ status: 400, detail: 'oh no !' }] });
    const reconciliationModel = model;
    const screen = await render(<template><Reconciliation @model={{reconciliationModel}} /></template>);

    // when
    await fillFormAndSubmit(screen);

    // then
    assert.true(organizationLearner.save.called, 'call save method');
    assert.true(organizationLearner.unloadRecord.called, 'call unloadRecord record');
    assert.true(setAssociationDoneStub.notCalled, 'not called accessStorage');
    assert.true(transitionToStub.notCalled, 'not called transitionTo');
  });

  test('should display the error message when an error occurred', async function (assert) {
    // given
    organizationLearner.save.rejects({ errors: [{ status: 400, title: ' title error ', detail: 'Une erreur !' }] });
    const reconciliationModel = model;
    const screen = await render(<template><Reconciliation @model={{reconciliationModel}} /></template>);

    // when
    await fillFormAndSubmit(screen);

    // then
    assert.ok(screen.getByText('Une erreur !'));
  });
});
