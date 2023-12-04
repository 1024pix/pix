import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
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
      this.set('certificationCenterMemberships', []);

      // when
      const screen = await render(
        hbs`<Users::CertificationCenters::Memberships @certificationCenterMemberships={{this.certificationCenterMemberships}} />`,
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

      this.set('certificationCenterMemberships', [certificationCenterMembership]);
      this.set('onCertificationCenterMembershipRoleChange', sinon.stub());
      this.set('disableCertificationCenterMembership', sinon.stub());

      // when
      const screen = await render(
        hbs`<Users::CertificationCenters::Memberships 
          @certificationCenterMemberships={{this.certificationCenterMemberships}}
          @onCertificationCenterMembershipRoleChange={{this.updateCertificationCenterMembershipRole}}
          @disableCertificationCenterMembership={{this.disableCertificationCenterMembership}}
        />`,
      );

      // then
      assert.dom(screen.getByText('Centre Kaede')).exists();
      assert.dom(screen.getByText('Membre')).exists();
    });
  });
});
