import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import Service from '@ember/service';

module('Unit | Route | authenticated/tools', function (hooks) {
  setupTest(hooks);

  test('it should allow super admin to access page', function (assert) {
    // given
    const route = this.owner.lookup('route:authenticated/tools');
    const router = this.owner.lookup('service:router');
    router.transitionTo = sinon.stub();

    class CurrentUserStub extends Service {
      adminMember = { hasAccess: sinon.stub().returns(true) };
    }
    this.owner.register('service:current-user', CurrentUserStub);

    // when
    route.beforeModel();

    // then
    assert.ok(router.transitionTo.notCalled);
  });

  test('it should redirect all other pix member (certif, metier, support) into home page', function (assert) {
    // given
    const route = this.owner.lookup('route:authenticated/tools');
    const router = this.owner.lookup('service:router');
    router.transitionTo = sinon.stub();

    const hasAccessStub = sinon.stub().returns(true);
    hasAccessStub.withArgs(['isSuperAdmin']).returns(false);
    class CurrentUserStub extends Service {
      adminMember = { hasAccess: hasAccessStub };
    }
    this.owner.register('service:current-user', CurrentUserStub);

    // when
    route.beforeModel();

    // then
    assert.ok(router.transitionTo.called);
  });
});
