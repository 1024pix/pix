import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/certifications/certification', function(hooks) {
  setupTest(hooks);

  test('#setupController', function(assert) {
    // given
    const certifications = { inputId: 5 };
    const id = Symbol('id');
    const route = this.owner.lookup('route:authenticated/certifications/certification');
    route.controllerFor = sinon.stub().returns(certifications);

    // when
    route.setupController(null, { id });

    // then
    assert.equal(certifications.inputId, id);
    assert.ok(route.controllerFor.calledWith('authenticated.certifications'));
  });

  test('#error', function(assert) {
    // given
    const route = this.owner.lookup('route:authenticated/certifications/certification');
    const errorNotifierStub = {
      notify: sinon.stub().resolves(),
    };
    route.errorNotifier = errorNotifierStub;
    route.transitionTo = () => {};

    // when
    route.send('error');

    // then
    sinon.assert.called(errorNotifierStub.notify);
    assert.ok(route);
  });
});
