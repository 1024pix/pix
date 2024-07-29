import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | session-supervising/candidate-list', function (hooks) {
  setupTest(hooks);

  module('filteredCandidates', function () {
    test('it should return only the filtered candidate by its first name', function (assert) {
      // given
      const component = createGlimmerComponent('component:session-supervising/candidate-list');
      component.args.candidates = [
        { firstName: 'Pierre', lastName: 'Quiroule' },
        { firstName: 'Piegrièche', lastName: 'Ouicestunoiseau' },
        { firstName: 'Paul', lastName: 'Ochon' },
      ];
      component.filter = 'Pie';

      // when
      const filteredCandidateList = component.filteredCandidates;

      // then
      assert.deepEqual(filteredCandidateList, [
        { firstName: 'Pierre', lastName: 'Quiroule' },
        { firstName: 'Piegrièche', lastName: 'Ouicestunoiseau' },
      ]);
    });

    test('it should return only the filtered candidate by its last name', function (assert) {
      // given
      const component = createGlimmerComponent('component:session-supervising/candidate-list');
      component.args.candidates = [
        { firstName: 'Pierre', lastName: 'Quiroule' },
        { firstName: 'Paul', lastName: 'Ochon' },
      ];
      component.filter = 'Och';

      // when
      const filteredCandidateList = component.filteredCandidates;

      // then
      assert.deepEqual(filteredCandidateList, [{ firstName: 'Paul', lastName: 'Ochon' }]);
    });
  });

  module('authorizedToStartCandidates', function () {
    test('it should return the number of authorized to start candidates', function (assert) {
      // given
      const component = createGlimmerComponent('component:session-supervising/candidate-list');
      component.args.candidates = [
        { firstName: 'Pierre', lastName: 'Quiroule', authorizedToStart: true },
        { firstName: 'Paul', lastName: 'Ochon', authorizedToStart: false },
      ];

      // when
      const authorizedToStartCandidates = component.authorizedToStartCandidates;

      // then
      assert.strictEqual(authorizedToStartCandidates, 1);
    });
  });
});
