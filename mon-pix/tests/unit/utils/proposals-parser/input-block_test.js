import { module, test } from 'qunit';
import InputBlock from 'mon-pix/utils/proposals-parser/input-block';

module('Unit | Utils | Proposals Parser | Input Block', function () {
  module('#constructor', function () {
    [
      {
        input: '${}',
        expectedInput: '',
        expectedAutoAriaLabel: true,
        expectedAriaLabel: '123',
        expectedPlaceholder: null,
      },
      {
        input: '${banana}',
        expectedInput: 'banana',
        expectedAutoAriaLabel: true,
        expectedAriaLabel: '123',
        expectedPlaceholder: null,
      },
      {
        input: '${banana}s',
        expectedInput: 'bananas',
        expectedAutoAriaLabel: true,
        expectedAriaLabel: '123',
        expectedPlaceholder: null,
      },
      {
        input: '${banana$}',
        expectedInput: 'banana$',
        expectedAutoAriaLabel: true,
        expectedAriaLabel: '123',
        expectedPlaceholder: null,
      },
      {
        input: '${$banana}}',
        expectedInput: '$banana}',
        expectedAutoAriaLabel: true,
        expectedAriaLabel: '123',
        expectedPlaceholder: null,
      },
      {
        input: '${banana${}}',
        expectedInput: 'banana${}',
        expectedAutoAriaLabel: true,
        expectedAriaLabel: '123',
        expectedPlaceholder: null,
      },
      {
        input: '${banana}',
        expectedInput: 'banana',
        expectedAutoAriaLabel: true,
        expectedAriaLabel: '123',
        expectedPlaceholder: null,
      },
      {
        input: '${banana#potato}',
        expectedInput: 'banana',
        expectedAutoAriaLabel: true,
        expectedAriaLabel: '123',
        expectedPlaceholder: 'potato',
      },
      {
        input: '${banana}#potato',
        expectedInput: 'banana',
        expectedAutoAriaLabel: true,
        expectedAriaLabel: '123',
        expectedPlaceholder: 'potato',
      },
      {
        input: '${banana§salad}',
        expectedInput: 'banana',
        expectedAutoAriaLabel: false,
        expectedAriaLabel: 'salad',
        expectedPlaceholder: null,
      },
      {
        input: '${banana#potato§salad}',
        expectedInput: 'banana',
        expectedAutoAriaLabel: false,
        expectedAriaLabel: 'salad',
        expectedPlaceholder: 'potato',
      },
    ].forEach((data) => {
      test(`should parse attributes properly for ${data.input}`, function (assert) {
        // given
        const input = data.input;

        // when
        const result = new InputBlock({ input, inputIndex: 123 });

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(result.input, data.expectedInput);
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(result.type, 'input');
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(result.autoAriaLabel, data.expectedAutoAriaLabel);
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(result.ariaLabel, data.expectedAriaLabel);
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(result.placeholder, data.expectedPlaceholder);
      });
    });
  });
});
