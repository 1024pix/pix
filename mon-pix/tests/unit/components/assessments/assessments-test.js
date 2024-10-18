import { setupTest } from 'ember-qunit';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Component | Assessments | Assessments', function (hooks) {
  setupTest(hooks);

  module('#createLiveAlert', function () {
    test('should create a companion live alert and reload assessment', async function (assert) {
      // given
      const assessment = {
        id: 123,
        isCertification: true,
        reload: sinon.stub(),
      };
      const component = createGlimmerComponent('assessments/assessments', {
        assessment,
      });
      const store = this.owner.lookup('service:store');
      const adapter = store.adapterFor('assessment');
      const createCompanionLiveAlertStub = sinon.stub(adapter, 'createCompanionLiveAlert');

      // when
      await component.createLiveAlert();

      // then
      sinon.assert.calledOnceWithExactly(createCompanionLiveAlertStub, { assessmentId: 123 });
      sinon.assert.calledOnceWithExactly(assessment.reload);
      assert.ok(true);
    });
  });
});
