import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/certifications', function(hooks) {
  setupTest(hooks);

  test('#loadCertification', function(assert) {
    // given
    const controller = this.owner.lookup('controller:authenticated.certifications');
    const routerStub = {
      transitionTo: sinon.stub().resolves(),
    };
    controller.router = routerStub;
    controller.inputId = 5;

    // when
    controller.send('loadCertification');

    // then
    sinon.assert.calledWith(routerStub.transitionTo, 'authenticated.certifications.certification', 5);
    assert.ok(controller);
  });
});
