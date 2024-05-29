import { module, test } from 'qunit';

import createGlimmerComponent from '../../../../helpers/create-glimmer-component';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Unit | Component | Participant | Assessment | Header', (hooks) => {
  setupIntlRenderingTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:participant/assessment/header');
  });

  module('get participationsListOptions', () => {
    test('should return options numbered catergorized', function (assert) {
      // given
      component.args.allParticipations = [
        {
          id: '93714',
          sharedAt: null,
          status: 'STARTED',
        },
        {
          id: '93331',
          sharedAt: null,
          status: 'TO_SHARE',
        },
        {
          id: '92990',
          sharedAt: '2024-06-10T13:57:01.267Z',
          status: 'SHARED',
        },
        {
          id: '92450',
          sharedAt: '2023-09-29T13:57:01.267Z',
          status: 'SHARED',
        },
      ];

      const expectedResult = [
        { category: '— Résultats non-envoyés —', label: 'Participation #4', value: '93714' },
        { category: '— Résultats non-envoyés —', label: 'Participation #3', value: '93331' },
        { category: '— Résultats envoyés —', label: 'Participation #2 - 10/06/2024', value: '92990' },
        { category: '— Résultats envoyés —', label: 'Participation #1 - 29/09/2023', value: '92450' },
      ];

      // when
      const result = component.participationsListOptions;

      // then
      assert.deepEqual(result, expectedResult);
    });
  });
});
