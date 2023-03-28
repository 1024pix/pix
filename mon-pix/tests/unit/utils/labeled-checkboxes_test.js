import { module, test } from 'qunit';
import labeledCheckboxes from 'mon-pix/utils/labeled-checkboxes';

module('Unit | Utility | labeled checkboxes', function () {
  module('Success cases', function () {
    [
      {
        when: 'nominal case, existing answers',
        proposals: ['prop 1', 'prop 2', 'prop 3', 'prop 4'],
        answers: [false, true],
        output: [
          ['prop 1', false],
          ['prop 2', true],
          ['prop 3', false],
          ['prop 4', false],
        ],
      },
      {
        when: 'nominal case, non-existing answers (undefined)',
        proposals: ['prop 1', 'prop 2', 'prop 3', 'prop 4'],
        answers: undefined,
        output: [
          ['prop 1', false],
          ['prop 2', false],
          ['prop 3', false],
          ['prop 4', false],
        ],
      },
      {
        when: 'nominal case, non-existing answers (null)',
        proposals: ['prop 1', 'prop 2', 'prop 3', 'prop 4'],
        answers: null,
        output: [
          ['prop 1', false],
          ['prop 2', false],
          ['prop 3', false],
          ['prop 4', false],
        ],
      },
      {
        when: 'nominal case, non-existing answers (empty array)',
        proposals: ['prop 1', 'prop 2', 'prop 3', 'prop 4'],
        answers: [],
        output: [
          ['prop 1', false],
          ['prop 2', false],
          ['prop 3', false],
          ['prop 4', false],
        ],
      },
      {
        when: 'one answer only',
        proposals: ['prop 1', 'prop 2', 'prop 3', 'prop 4'],
        answers: [true],
        output: [
          ['prop 1', true],
          ['prop 2', false],
          ['prop 3', false],
          ['prop 4', false],
        ],
      },
      {
        when: 'wrong type for answers',
        proposals: ['prop 1', 'prop 2', 'prop 3', 'prop 4'],
        answers: new Date(),
        output: [],
      },
      {
        when: "wrong format for answers's elements",
        proposals: ['prop 1', 'prop 2', 'prop 3', 'prop 4'],
        answers: [true, 'false'],
        output: [],
      },
      {
        when: 'no proposals',
        proposals: [],
        answers: [false, true],
        output: [],
      },
      {
        when: 'wrong format for proposals',
        proposals: {}, // object !
        answers: [false, true],
        output: [],
      },
      {
        when: "wrong format for proposals's elements",
        proposals: ['prop1', {}],
        answers: [false, true],
        output: [],
      },
    ].forEach(function (testCase) {
      test(
        'Should reply to proposals' +
          JSON.stringify(testCase.proposals) +
          ' and answers ' +
          JSON.stringify(testCase.answers) +
          ' with ' +
          JSON.stringify(testCase.output) +
          ' when ' +
          testCase.when,
        function (assert) {
          assert.strictEqual(
            JSON.stringify(labeledCheckboxes(testCase.proposals, testCase.answers)),
            JSON.stringify(testCase.output)
          );
        }
      );
    });
  });
});
