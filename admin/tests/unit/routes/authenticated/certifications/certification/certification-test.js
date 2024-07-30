import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/certifications/certification', function (hooks) {
  setupTest(hooks);

  test('#setupController', function (assert) {
    // given
    const certifications = { inputId: 5 };
    const id = Symbol('id');
    const route = this.owner.lookup('route:authenticated/certifications/certification');

    // when
    route.setupController(certifications, { id });

    // then
    assert.strictEqual(certifications.inputId, id);
  });

  module('#beforeModel', function () {
    test('it should check if current user is super admin, certif, or support', function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/certifications/certification');

      const restrictAccessToStub = sinon.stub().returns();
      class AccessControlStub extends Service {
        restrictAccessTo = restrictAccessToStub;
      }
      this.owner.register('service:access-control', AccessControlStub);

      // when
      route.beforeModel();

      // then
      assert.ok(restrictAccessToStub.calledWith(['isSuperAdmin', 'isCertif', 'isSupport'], 'authenticated'));
    });
  });

  test('#error', function (assert) {
    // given
    const route = this.owner.lookup('route:authenticated/certifications/certification');
    const errorNotifierStub = {
      notify: sinon.stub().resolves(),
    };
    route.errorNotifier = errorNotifierStub;

    sinon.stub(route.router, 'transitionTo');
    route.router.transitionTo.resolves();

    // when
    route.send('error');

    // then
    sinon.assert.called(errorNotifierStub.notify);
    assert.ok(route);
  });
});
