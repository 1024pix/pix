import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | certification-centers/membership-item', function (hooks) {
  setupTest(hooks);

  module('#editMembershipRole', function () {
    test('activates edition mode', function (assert) {
      // given
      const component = createGlimmerComponent('component:certification-centers/membership-item', {});

      // when
      component.editMembershipRole();

      // then
      assert.true(component.isEditionMode);
    });
  });

  module('#cancelMembershipRoleEditing', function () {
    test('deactivates edition mode', function (assert) {
      // given
      const certificationCenterMembership = {
        hasDirtyAttributes: false,
        rollbackAttributes: sinon.stub(),
        changedAttributes: sinon.stub().returns([]),
      };
      const component = createGlimmerComponent('component:certification-centers/membership-item', {
        certificationCenterMembership,
      });

      // when
      component.cancelMembershipRoleEditing();

      // then
      sinon.assert.notCalled(component.args.certificationCenterMembership.rollbackAttributes);
      assert.false(component.isEditionMode);
    });

    module('when the role has been changed and the edit mode is deactivated', function () {
      test('revert the role to the previous value', function (assert) {
        // given
        const certificationCenterMembership = {
          hasDirtyAttributes: true,
          rollbackAttributes: sinon.stub(),
          changedAttributes: sinon.stub().returns(['MEMBER', 'ADMIN']),
        };
        const component = createGlimmerComponent('component:certification-centers/membership-item', {
          certificationCenterMembership,
        });

        // when
        component.cancelMembershipRoleEditing();

        // then
        sinon.assert.calledOnce(component.args.certificationCenterMembership.rollbackAttributes);
        assert.ok(true);
      });
    });
  });

  module('#onRoleSelected', function () {
    test('updates certification center membership role', function (assert) {
      // given
      const component = createGlimmerComponent('component:certification-centers/membership-item', {});
      component.args = { certificationCenterMembership: { role: 'MEMBER' } };

      // when
      component.onRoleSelected('ADMIN');

      // then
      assert.strictEqual(component.args.certificationCenterMembership.role, 'ADMIN');
    });
  });
});
