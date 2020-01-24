import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import Object from '@ember/object';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

module('Integration | Component | certification-candidate-in-staging-item', function(hooks) {
  setupRenderingTest(hooks);

  let saveStub;
  let cancelStub;
  let updateBirthdateStub;
  let updateDataStub;
  let candidateInStaging;

  hooks.beforeEach(async function() {
    saveStub = sinon.stub().returns();
    cancelStub = sinon.stub().returns();
    updateBirthdateStub = sinon.stub().returns();
    updateDataStub = sinon.stub().returns();
    candidateInStaging = Object.create({
      firstName: '', lastName: '', birthdate: '', birthCity: '',
      birthProvinceCode: '', birthCountry: '', email: '', externalId: '',
      extraTimePercentage: '' });
    this.set('candidateInStaging', candidateInStaging);
    this.set('saveStub', saveStub);
    this.set('cancelStub', cancelStub);
    this.set('updateBirthdateStub', updateBirthdateStub);
    this.set('updateDataStub', updateDataStub);

    await render(hbs`<CertificationCandidateInStagingItem
                @candidateData={{this.candidateInStaging}}
                @onClickSave={{this.saveStub}}
                @onClickCancel={{this.cancelStub}} 
                @updateCandidateBirthdate={{this.updateBirthdateStub}} 
                @updateCandidateData={{this.updateDataStub}} />`);
  });

  test('it renders', async function(assert) {
    assert.dom('[data-test-id="panel-candidate__lastName__add-staging"]').exists();
    assert.dom('[data-test-id="panel-candidate__firstName__add-staging"]').exists();
    assert.dom('[data-test-id="panel-candidate__birthCity__add-staging"]').exists();
    assert.dom('[data-test-id="panel-candidate__birthProvinceCode__add-staging"]').exists();
    assert.dom('[data-test-id="panel-candidate__birthCountry__add-staging"]').exists();
    assert.dom('[data-test-id="panel-candidate__birthdate__add-staging"]').exists();
    assert.dom('[data-test-id="panel-candidate__externalId__add-staging"]').exists();
    assert.dom('[data-test-id="panel-candidate__email__add-staging"]').exists();
    assert.dom('[data-test-id="panel-candidate__extraTimePercentage__add-staging"]').exists();
    assert.dom('[data-test-id="panel-candidate__action__save"]').exists();
    assert.dom('[data-test-id="panel-candidate__action__cancel"]').exists();
  });

  test('it render a disabled saved button', async function(assert) {
    assert.dom('[data-test-id="panel-candidate__action__save"]').exists();
    assert.dom('[data-test-id="panel-candidate__action__save"]').isDisabled();
  });

  test('it calls appropriate method when cancel clicked', async function(assert) {
    await click('[data-test-id="panel-candidate__action__cancel"]');

    assert.equal(cancelStub.calledWith(candidateInStaging), true);
  });

  module('when filling the line with sufficient data', function(hooks) {
    hooks.beforeEach(async () => {
      candidateInStaging.set('firstName', 'Salut');
      candidateInStaging.set('lastName', 'Salut');
      candidateInStaging.set('birthCity', 'Salut');
      candidateInStaging.set('birthProvinceCode', 'Salut');
      candidateInStaging.set('birthCountry', 'Salut');
      candidateInStaging.set('birthdate', '1990-01-04');
    });

    test('it render a clickable save button', async function(assert) {
      assert.dom('[data-test-id="panel-candidate__action__save"]').isNotDisabled();
    });

    test('it calls appropriate method when save clicked', async function(assert) {
      await click('[data-test-id="panel-candidate__action__save"]');

      assert.equal(saveStub.calledWith(candidateInStaging), true);
    });

  });

});
