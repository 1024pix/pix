import { setupTest } from 'ember-qunit';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Component | Assessments | Assessments', function (hooks) {
  setupTest(hooks);

  module('#createLiveAlert', function () {
    test('should create a companion live alert', async function (assert) {
      // given
      const component = createGlimmerComponent('assessments/assessments', {
        assessment: {
          id: 123,
          isCertification: true,
        },
      });
      const store = this.owner.lookup('service:store');
      const adapter = store.adapterFor('assessment');
      const createCompanionLiveAlertStub = sinon.stub(adapter, 'createCompanionLiveAlert');

      // when
      await component.createLiveAlert();

      // then
      sinon.assert.calledWithExactly(createCompanionLiveAlertStub, { assessmentId: 123 });
      assert.ok(true);
    });
  });
});
