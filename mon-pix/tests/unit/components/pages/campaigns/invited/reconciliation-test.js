import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../../../helpers/create-glimmer-component';

module('Unit | Component | Pages | Campaigns | Invited | Reconciliation', function (hooks) {
  setupTest(hooks);
  let createRecordStub, component, model, campaignCode;
  hooks.beforeEach(function () {
    campaignCode = Symbol('code');
    createRecordStub = {
      unloadRecord: sinon.stub(),
      save: sinon.stub(),
    };
    model = {
      code: campaignCode,
    };

    component = createGlimmerComponent('pages/campaigns/invited/reconciliation', { model });
    component.router = { transitionTo: sinon.stub().returns() };
    component.store = {
      createRecord: sinon.stub(),
    };
    component.campaignStorage = {
      set: sinon.stub(),
    };
  });

  test('loading state must be false by default', async function (assert) {
    // then
    assert.false(component.isLoading);
  });

  test('should transition to next route if everything ok', async function (assert) {
    // given
    const reconciliationInfos = Symbol('reconciliationInfos');
    component.store.createRecord
      .withArgs('organization-learner', {
        campaignCode,
        reconciliationInfos,
      })
      .returns(createRecordStub);
    // when
    await component.registerLearner(reconciliationInfos);

    assert.true(createRecordStub.save.called, 'called save');
    assert.true(createRecordStub.unloadRecord.called, 'called unloadRecord');
    assert.true(
      component.campaignStorage.set.calledWithExactly(campaignCode, 'associationDone', true),
      'called campaignStorage',
    );
    assert.true(
      component.router.transitionTo.calledWithExactly(
        'campaigns.invited.fill-in-participant-external-id',
        campaignCode,
      ),
      'called transitionTo',
    );
  });

  test('should not called transition when error occured', async function (assert) {
    // given
    const reconciliationInfos = Symbol('reconciliationInfos');
    component.store.createRecord
      .withArgs('organization-learner', {
        campaignCode,
        reconciliationInfos,
      })
      .returns(createRecordStub);
    createRecordStub.save.rejects({ errors: [{ status: 400, detail: 'oh no !' }] });
    // when
    await component.registerLearner(reconciliationInfos);

    // then
    assert.true(createRecordStub.save.called, 'call save method');
    assert.true(createRecordStub.unloadRecord.called, 'call unloadRecord record');
    assert.true(component.campaignStorage.set.notCalled, 'not called campaignStorage');
    assert.true(component.router.transitionTo.notCalled, 'not called transitionTo');
  });

  test('should set errorMessage when error occured', async function (assert) {
    // given
    const reconciliationInfos = Symbol('reconciliationInfos');
    component.store.createRecord
      .withArgs('organization-learner', {
        campaignCode,
        reconciliationInfos,
      })
      .returns(createRecordStub);
    createRecordStub.save.rejects({ errors: [{ status: 400, title: ' title error ', detail: 'Une erreur !' }] });
    // when
    await component.registerLearner(reconciliationInfos);

    // then
    assert.strictEqual(component.errorMessage, 'Une erreur !');
  });
});
