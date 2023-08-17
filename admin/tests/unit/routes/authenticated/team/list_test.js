import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/team/list', function (hooks) {
  setupTest(hooks);

  test('it should allow super admin to access page', function (assert) {
    // given
    const route = this.owner.lookup('route:authenticated/team/list');
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

  test('it should redirect all other pix member (certif, metier, support) to home page', function (assert) {
    // given
    const route = this.owner.lookup('route:authenticated/team/list');
    const router = this.owner.lookup('service:router');
    router.transitionTo = sinon.stub();

    class CurrentUserStub extends Service {
      adminMember = { isSuperAdmin: false };
    }

    this.owner.register('service:current-user', CurrentUserStub);

    // when
    route.beforeModel();

    // then
    assert.ok(router.transitionTo.called);
  });
});
