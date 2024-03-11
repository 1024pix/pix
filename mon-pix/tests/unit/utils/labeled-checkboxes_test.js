import labeledCheckboxes from 'mon-pix/utils/labeled-checkboxes';
import { module, test } from 'qunit';

module('Unit | Utility | labeled checkboxes', function () {
  module('Success cases', function () {
    [
      {
        when: 'nominal case, existing answers',
        proposals: ['prop 1', 'prop 2', 'prop 3', 'prop 4'],
        answers: [false, true],
        output: [
          { label: 'prop 1', checked: false, value: 1, index: 0 },
          { label: 'prop 2', checked: true, value: 2, index: 1 },
          { label: 'prop 3', checked: false, value: 3, index: 2 },
          { label: 'prop 4', checked: false, value: 4, index: 3 },
        ],
      },
      {
        when: 'nominal case, non-existing answers (undefined)',
        proposals: ['prop 1', 'prop 2', 'prop 3', 'prop 4'],
        answers: undefined,
        output: [
          { label: 'prop 1', checked: false, value: 1, index: 0 },
          { label: 'prop 2', checked: false, value: 2, index: 1 },
          { label: 'prop 3', checked: false, value: 3, index: 2 },
          { label: 'prop 4', checked: false, value: 4, index: 3 },
        ],
      },
      {
        when: 'nominal case, non-existing answers (undefined)',
        proposals: ['prop 1', 'prop 2', 'prop 3', 'prop 4'],
        answers: undefined,
        output: [
          {
            label: 'prop 1',
            checked: false,
            value: 1,
            index: 0,
          },
          {
            label: 'prop 2',
            checked: false,
            value: 2,
            index: 1,
          },
          {
            label: 'prop 3',
            checked: false,
            value: 3,
            index: 2,
          },
          {
            label: 'prop 4',
            checked: false,
            value: 4,
            index: 3,
          },
        ],
      },
      {
        when: 'nominal case, non-existing answers (null)',
        proposals: ['prop 1', 'prop 2', 'prop 3', 'prop 4'],
        answers: null,
        output: [
          { label: 'prop 1', checked: false, value: 1, index: 0 },
          { label: 'prop 2', checked: false, value: 2, index: 1 },
          { label: 'prop 3', checked: false, value: 3, index: 2 },
          { label: 'prop 4', checked: false, value: 4, index: 3 },
        ],
      },
      {
        when: 'nominal case, non-existing answers (empty array)',
        proposals: ['prop 1', 'prop 2', 'prop 3', 'prop 4'],
        answers: [],
        output: [
          { label: 'prop 1', checked: false, value: 1, index: 0 },
          { label: 'prop 2', checked: false, value: 2, index: 1 },
          { label: 'prop 3', checked: false, value: 3, index: 2 },
          { label: 'prop 4', checked: false, value: 4, index: 3 },
        ],
      },
      {
        when: 'one answer only',
        proposals: ['prop 1', 'prop 2', 'prop 3', 'prop 4'],
        answers: [true],
        output: [
          { label: 'prop 1', checked: true, value: 1, index: 0 },
          { label: 'prop 2', checked: false, value: 2, index: 1 },
          { label: 'prop 3', checked: false, value: 3, index: 2 },
          { label: 'prop 4', checked: false, value: 4, index: 3 },
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
          assert.deepEqual(labeledCheckboxes(testCase.proposals, testCase.answers), testCase.output);
        },
      );
    });
  });
});
