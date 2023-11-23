import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../../helpers/create-glimmer-component';

module('Unit | Component | users | certification-centers | memberships', function (hooks) {
  setupTest(hooks);

  module('#orderedCertificationCenterMemberships', function () {
    test('it returns certification center memberships in alphabetical order', function (assert) {
      // given
      const component = createGlimmerComponent('component:users/certification-centers/memberships');
      const certificationCenterMemberships = [
        { certificationCenter: { name: 'ZZZ' } },
        { certificationCenter: { name: 'AAA' } },
        { certificationCenter: { name: 'BBB' } },
      ];
      component.args.certificationCenterMemberships = certificationCenterMemberships;

      // when & then
      assert.deepEqual(component.orderedCertificationCenterMemberships, [
        { certificationCenter: { name: 'AAA' } },
        { certificationCenter: { name: 'BBB' } },
        { certificationCenter: { name: 'ZZZ' } },
      ]);
    });
  });
});
