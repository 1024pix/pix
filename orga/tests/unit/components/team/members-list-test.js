import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Components | Team | members-list', function (hooks) {
  setupTest(hooks);

  let onRemoveMember;
  let onLeaveOrganization;

  hooks.beforeEach(function () {
    this.set('noop', sinon.stub());

    onRemoveMember = this.noop;
    onLeaveOrganization = this.noop;
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  module('#isMultipleAdminsAvailable', function () {
    module('when there is multiple admins', function () {
      test('returns "true"', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const members = [
          store.createRecord('membership', { organizationRole: 'ADMIN' }),
          store.createRecord('membership', { organizationRole: 'ADMIN' }),
          store.createRecord('membership', { organizationRole: 'MEMBER' }),
        ];
        const component = await createGlimmerComponent('component:team/members-list', {
          members,
          onRemoveMember,
          onLeaveOrganization,
        });

        // when
        const result = component.isMultipleAdminsAvailable;

        // then
        assert.true(result);
      });
    });

    module('when there is only one admin', function () {
      test('returns "false"', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const members = [
          store.createRecord('membership', { organizationRole: 'ADMIN' }),
          store.createRecord('membership', { organizationRole: 'MEMBER' }),
          store.createRecord('membership', { organizationRole: 'MEMBER' }),
        ];
        const component = await createGlimmerComponent('component:team/members-list', {
          members,
          onRemoveMember,
          onLeaveOrganization,
        });

        // when
        const result = component.isMultipleAdminsAvailable;

        // then
        assert.false(result);
      });
    });
  });
});
