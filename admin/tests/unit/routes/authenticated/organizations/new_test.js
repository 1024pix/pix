import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/organizations/new', function (hooks) {
  setupTest(hooks);

  test('it should check if current user is super admin, support, or metier', function (assert) {
    // given
    const route = this.owner.lookup('route:authenticated/organizations/new');

    const restrictAccessToStub = sinon.stub().returns();
    class AccessControlStub extends Service {
      restrictAccessTo = restrictAccessToStub;
    }
    this.owner.register('service:access-control', AccessControlStub);

    // when
    route.beforeModel();

    // then
    assert.ok(restrictAccessToStub.calledWith(['isSuperAdmin', 'isSupport', 'isMetier'], 'authenticated'));
  });

  test('it should allow super admin to access page', function (assert) {
    // given
    const route = this.owner.lookup('route:authenticated/organizations/new');
    const router = this.owner.lookup('service:router');
    router.transitionTo = sinon.stub();

    class CurrentUserStub extends Service {
      adminMember = { isSuperAdmin: true };
    }

    this.owner.register('service:current-user', CurrentUserStub);

    // when
    route.beforeModel();

    // then
    assert.ok(router.transitionTo.notCalled);
  });

  test('it should allow support to access page', function (assert) {
    // given
    const route = this.owner.lookup('route:authenticated/organizations/new');
    const router = this.owner.lookup('service:router');
    router.transitionTo = sinon.stub();

    class CurrentUserStub extends Service {
      adminMember = { isSupport: true };
    }

    this.owner.register('service:current-user', CurrentUserStub);

    // when
    route.beforeModel();

    // then
    assert.ok(router.transitionTo.notCalled);
  });

  test('it should allow metier to access page', function (assert) {
    // given
    const route = this.owner.lookup('route:authenticated/organizations/new');
    const router = this.owner.lookup('service:router');
    router.transitionTo = sinon.stub();

    class CurrentUserStub extends Service {
      adminMember = { isMetier: true };
    }

    this.owner.register('service:current-user', CurrentUserStub);

    // when
    route.beforeModel();

    // then
    assert.ok(router.transitionTo.notCalled);
  });

  test('it should redirect certif to home page', function (assert) {
    // given
    const route = this.owner.lookup('route:authenticated/organizations/new');
    const router = this.owner.lookup('service:router');
    router.transitionTo = sinon.stub();

    class CurrentUserStub extends Service {
      adminMember = { isCertif: true };
    }

    this.owner.register('service:current-user', CurrentUserStub);

    // when
    route.beforeModel();

    // then
    assert.ok(router.transitionTo.called);
  });
});
