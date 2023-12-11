import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../helpers/create-glimmer-component';
import setupIntl from '../../helpers/setup-intl';

module('Unit | Component | MembersListItem', (hooks) => {
  setupTest(hooks);
  setupIntl(hooks);

  module('#updateCertificationCenterMembership', () => {
    test('disables edition mode, saves membership and displays success notification', async function (assert) {
      // given
      const component = createGlimmerComponent('component:members-list-item');
      component.isEditionMode = true;
      component.notifications = {
        success: sinon.stub(),
      };
      const member = {
        save: sinon.stub().resolves(),
      };

      // when
      await component.updateMember(member);

      // then
      assert.false(component.isEditionMode);
      assert.ok(member.save.called);
      assert.ok(component.notifications.success.called);
    });

    module('when an error occurs', function () {
      test('rollbacks membership role modification and display error notification', async function (assert) {
        // given
        const component = createGlimmerComponent('component:members-list-item');
        component.isEditionMode = true;
        component.notifications = {
          error: sinon.stub(),
        };
        const member = {
          save: sinon.stub().rejects(),
          rollbackAttributes: sinon.stub(),
        };

        // when
        await component.updateMember(member);

        // then
        assert.false(component.isEditionMode);
        assert.ok(member.save.called);
        assert.ok(member.rollbackAttributes.called);
        assert.ok(component.notifications.error.called);
      });
    });

    module('when the cancel button is clicked', function () {
      test('rollbacks member role modification', async function (assert) {
        // given
        const component = createGlimmerComponent('component:members-list-item');
        component.isEditionMode = true;
        component.notifications = {
          error: sinon.stub(),
        };
        const member = {
          rollbackAttributes: sinon.stub(),
        };
        component.args.member = member;

        // when
        await component.cancelUpdateRoleOfMember();

        // then
        assert.false(component.isEditionMode);
        assert.ok(member.rollbackAttributes.called);
      });
    });
  });
});
