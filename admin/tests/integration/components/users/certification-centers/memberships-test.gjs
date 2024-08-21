import { render } from '@1024pix/ember-testing-library';
import Memberships from 'pix-admin/components/users/certification-centers/memberships';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | users | certification-centers | memberships', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  module('When user isn’t member of any certification center', function () {
    test('displays an empty table', async function (assert) {
      // given
      const certificationCenterMemberships = [];

      // when
      const screen = await render(
        <template><Memberships @certificationCenterMemberships={{certificationCenterMemberships}} /></template>,
      );

      // then
      assert.dom(screen.getByText('Aucun centre de certification')).exists();
    });
  });

  module('When user is member of some certification centers', function () {
    test('displays a table of the certification centers the user is member of', async function (assert) {
      // given
      const certificationCenter = store.createRecord('certification-center', {
        id: '123',
        name: 'Centre Kaede',
        externalId: 'ABCDEF12345',
        type: 'SCO',
      });
      const certificationCenterMembership = store.createRecord('certification-center-membership', {
        id: '456',
        certificationCenter,
        role: 'MEMBER',
      });

      const certificationCenterMemberships = [certificationCenterMembership];
      const onCertificationCenterMembershipRoleChange = sinon.stub();
      const disableCertificationCenterMembership = sinon.stub();

      // when
      const screen = await render(
        <template>
          <Memberships
            @certificationCenterMemberships={{certificationCenterMemberships}}
            @onCertificationCenterMembershipRoleChange={{onCertificationCenterMembershipRoleChange}}
            @disableCertificationCenterMembership={{disableCertificationCenterMembership}}
          />
        </template>,
      );

      // then
      assert.dom(screen.getByText('Centre Kaede')).exists();
      assert.dom(screen.getByText('Membre')).exists();
    });
  });
});
