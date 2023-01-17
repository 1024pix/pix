import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | team | list', function (hooks) {
  setupTest(hooks);

  module('when super admin change role', function () {
    test('should save new role', async function (assert) {
      // given
      const adminMember = {
        role: 'SUPER_ADMIN',
        updatedRole: 'CERTIF',
        save: sinon.stub(),
      };
      const component = createGlimmerComponent('component:team/list');

      // when
      await component.updateMemberRole(adminMember);

      // then
      assert.ok(adminMember.save.called);
    });

    module('when super admin saved without choose new role', function () {
      test('should not called save method', async function (assert) {
        // given
        const adminMember = {
          role: 'SUPER_ADMIN',
          updatedRole: null,
          save: sinon.stub(),
        };
        const component = createGlimmerComponent('component:team/list');

        // when
        await component.updateMemberRole(adminMember);

        // then
        assert.notOk(adminMember.save.called);
      });
    });
  });
});
