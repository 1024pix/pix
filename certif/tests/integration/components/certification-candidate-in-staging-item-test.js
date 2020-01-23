import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn } from '@ember/test-helpers';
import Object from '@ember/object';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

module('Integration | Component | certification-candidate-in-staging-item', function(hooks) {
  setupRenderingTest(hooks);

  let saveStub;
  let cancelStub;
  let candidateInStaging;

  hooks.beforeEach(async function() {
    saveStub = sinon.stub().returns();
    cancelStub = sinon.stub().returns();
    candidateInStaging = Object.create({
      firstName: '', lastName: '', birthdate: '', birthCity: '',
      birthProvinceCode: '', birthCountry: '', email: '', externalId: '',
      extraTimePercentage: '' });
    this.set('candidateInStaging', candidateInStaging);
    this.set('saveStub', saveStub);
    this.set('cancelStub', cancelStub);

    await render(hbs`<CertificationCandidateInStagingItem
                @candidateData={{this.candidateInStaging}}
                @onClickSave={{action saveStub}}
                @onClickCancel={{action cancelStub}} />`);
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
      await fillIn('[data-test-id="panel-candidate__lastName__add-staging"] > div > input', 'MonNom');
      await fillIn('[data-test-id="panel-candidate__firstName__add-staging"] > div > input', 'MonPrenom');
      await fillIn('[data-test-id="panel-candidate__birthCity__add-staging"] > div > input', 'MaVille');
      await fillIn('[data-test-id="panel-candidate__birthProvinceCode__add-staging"] > div > input', 'MonDép');
      await fillIn('[data-test-id="panel-candidate__birthCountry__add-staging"] > div > input', 'MonPays');
      await fillIn('[data-test-id="panel-candidate__birthdate__add-staging"] > div > input', '01021990');
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
