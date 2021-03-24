import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/certifications/certification', (hooks) => {
  setupTest(hooks);

  test('#setupController', function(assert) {
    // given
    const certifications = { inputId: 5 };
    const id = Symbol('id');
    const route = this.owner.lookup('route:authenticated/certifications/certification');

    // when
    route.setupController(certifications, { id });

    // then
    assert.equal(certifications.inputId, id);
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
