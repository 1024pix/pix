import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import Service from '@ember/service';

module('Unit | Route | authenticated/organizations/get/all-tags', function (hooks) {
  setupTest(hooks);

  test('it should check if current user is super admin, support, or metier', function (assert) {
    // given
    const route = this.owner.lookup('route:authenticated/organizations/get/all-tags');

    const restrictAccessToStub = sinon.stub().returns();
    class AccessControlStub extends Service {
      restrictAccessTo = restrictAccessToStub;
    }
    this.owner.register('service:access-control', AccessControlStub);

    // when
    route.beforeModel();

    // then
    assert.ok(
      restrictAccessToStub.calledWith(['isSuperAdmin', 'isSupport', 'isMetier'], 'authenticated.organizations.get.team')
    );
  });

  test('it should allow super admin to access page', function (assert) {
    // given
    const route = this.owner.lookup('route:authenticated/organizations/get/all-tags');
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
    const route = this.owner.lookup('route:authenticated/organizations/get/all-tags');
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
    const route = this.owner.lookup('route:authenticated/organizations/get/all-tags');
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

  test('it should redirect certif to organization team page', function (assert) {
    // given
    const route = this.owner.lookup('route:authenticated/organizations/get/all-tags');
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

  test('it returns sorted tags with assigned to organization information', async function (assert) {
    // given
    const route = this.owner.lookup('route:authenticated/organizations/get/all-tags');
    const store = this.owner.lookup('service:store');

    const tag1 = store.createRecord('tag', { id: 1, name: 'MEDNUM' });
    const tag2 = store.createRecord('tag', { id: 2, name: 'AEFE' });
    const tag3 = store.createRecord('tag', { id: 3, name: 'CFA' });
    const tag4 = store.createRecord('tag', { id: 4, name: 'POLE EMPLOI' });
    const organization = store.createRecord('organization', { id: 7, tags: [tag1, tag2] });
    route.modelFor = sinon.stub().returns(organization);
    store.query = sinon.stub().resolves([tag1, tag2, tag3, tag4]);

    // when
    const result = await route.model();

    // then
    assert.strictEqual(result.allTags[0].name, 'AEFE');
    assert.true(result.allTags[0].isTagAssignedToOrganization);

    assert.strictEqual(result.allTags[1].name, 'CFA');
    assert.false(result.allTags[1].isTagAssignedToOrganization);

    assert.strictEqual(result.allTags[2].name, 'MEDNUM');
    assert.true(result.allTags[2].isTagAssignedToOrganization);

    assert.strictEqual(result.allTags[3].name, 'POLE EMPLOI');
    assert.false(result.allTags[3].isTagAssignedToOrganization);
  });
});
