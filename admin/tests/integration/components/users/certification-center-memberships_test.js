import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | users | certification-center-memberships', function (hooks) {
  setupRenderingTest(hooks);

  module('When user isn’t member of any certification center', function () {
    test('it should display an empty table', async function (assert) {
      // given
      this.set('certificationCenterMemberships', []);

      // when
      const screen = await render(
        hbs`<Users::CertificationCenterMemberships @certificationCenterMemberships={{certificationCenterMemberships}} />`
      );

      // then
      assert.dom(screen.getByText('Aucun centre de certification')).exists();
    });
  });

  module('When user is member of some certification centers', function () {
    test('it should display a table of the certification centers the user is member of', async function (assert) {
      // given
      const certificationCenter = EmberObject.create('certification-center', {
        id: '123',
        name: 'Centre Kaede',
        externalId: 'ABCDEF12345',
        type: 'SCO',
      });
      const certificationCenterMembership = EmberObject.create('certification-center-membership', {
        id: '456',
        certificationCenter,
      });

      this.set('certificationCenterMemberships', [certificationCenterMembership]);

      // when
      const screen = await render(
        hbs`<Users::CertificationCenterMemberships @certificationCenterMemberships={{certificationCenterMemberships}} />`
      );

      // then
      assert.dom(screen.getByText('Centre Kaede')).exists();
    });
  });
});
