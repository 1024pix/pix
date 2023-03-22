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
        expectedDefaultValue: null,
      },
      {
        input: '${banana}',
        expectedInput: 'banana',
        expectedAutoAriaLabel: true,
        expectedAriaLabel: '123',
        expectedPlaceholder: null,
        expectedDefaultValue: null,
      },
      {
        input: '${banana}s',
        expectedInput: 'bananas',
        expectedAutoAriaLabel: true,
        expectedAriaLabel: '123',
        expectedPlaceholder: null,
        expectedDefaultValue: null,
      },
      {
        input: '${banana$}',
        expectedInput: 'banana$',
        expectedAutoAriaLabel: true,
        expectedAriaLabel: '123',
        expectedPlaceholder: null,
        expectedDefaultValue: null,
      },
      {
        input: '${$banana}}',
        expectedInput: '$banana}',
        expectedAutoAriaLabel: true,
        expectedAriaLabel: '123',
        expectedPlaceholder: null,
        expectedDefaultValue: null,
      },
      {
        input: '${banana${}}',
        expectedInput: 'banana${}',
        expectedAutoAriaLabel: true,
        expectedAriaLabel: '123',
        expectedPlaceholder: null,
        expectedDefaultValue: null,
      },
      {
        input: '${banana}',
        expectedInput: 'banana',
        expectedAutoAriaLabel: true,
        expectedAriaLabel: '123',
        expectedPlaceholder: null,
        expectedDefaultValue: null,
      },
      {
        input: '${banana#potato}',
        expectedInput: 'banana',
        expectedAutoAriaLabel: true,
        expectedAriaLabel: '123',
        expectedPlaceholder: 'potato',
        expectedDefaultValue: null,
      },
      {
        input: '${banana}#potato',
        expectedInput: 'banana',
        expectedAutoAriaLabel: true,
        expectedAriaLabel: '123',
        expectedPlaceholder: 'potato',
        expectedDefaultValue: null,
      },
      {
        input: '${banana§salad}',
        expectedInput: 'banana',
        expectedAutoAriaLabel: false,
        expectedAriaLabel: 'salad',
        expectedPlaceholder: null,
        expectedDefaultValue: null,
      },
      {
        input: '${banana#potato§salad}',
        expectedInput: 'banana',
        expectedAutoAriaLabel: false,
        expectedAriaLabel: 'salad',
        expectedPlaceholder: 'potato',
        expectedDefaultValue: null,
      },
      {
        input: '${banana#potato§salad value="pickle"}',
        expectedInput: 'banana',
        expectedAutoAriaLabel: false,
        expectedAriaLabel: 'salad',
        expectedPlaceholder: 'potato',
        expectedDefaultValue: 'pickle',
      },
      {
        input: '${banana§salad value="pickle"}',
        expectedInput: 'banana',
        expectedAutoAriaLabel: false,
        expectedAriaLabel: 'salad',
        expectedPlaceholder: null,
        expectedDefaultValue: 'pickle',
      },
      {
        input: '${banana#potato value="pickle"}',
        expectedInput: 'banana',
        expectedAutoAriaLabel: true,
        expectedAriaLabel: '123',
        expectedPlaceholder: 'potato',
        expectedDefaultValue: 'pickle',
      },
      {
        input: '${banana value="pickle"}',
        expectedInput: 'banana',
        expectedAutoAriaLabel: true,
        expectedAriaLabel: '123',
        expectedPlaceholder: null,
        expectedDefaultValue: 'pickle',
      },
      {
        input: '${ban}ana value="pickle"',
        expectedInput: 'banana',
        expectedAutoAriaLabel: true,
        expectedAriaLabel: '123',
        expectedPlaceholder: null,
        expectedDefaultValue: 'pickle',
      },
      {
        input: '${banana value=}',
        expectedInput: 'banana',
        expectedAutoAriaLabel: true,
        expectedAriaLabel: '123',
        expectedPlaceholder: null,
        expectedDefaultValue: '',
      },
      {
        input: '${banana value=pickle}',
        expectedInput: 'banana',
        expectedAutoAriaLabel: true,
        expectedAriaLabel: '123',
        expectedPlaceholder: null,
        expectedDefaultValue: 'pickle',
      },
      {
        input: '${banana value="pickle}',
        expectedInput: 'banana',
        expectedAutoAriaLabel: true,
        expectedAriaLabel: '123',
        expectedPlaceholder: null,
        expectedDefaultValue: '"pickle',
      },
    ].forEach((data) => {
      test(`should parse attributes properly for ${data.input}`, function (assert) {
        // given
        const input = data.input;

        // when
        const result = new InputBlock({ input, inputIndex: 123 });

        // then
        assert.strictEqual(result.input, data.expectedInput);
        assert.strictEqual(result.type, 'input');
        assert.strictEqual(result.autoAriaLabel, data.expectedAutoAriaLabel);
        assert.strictEqual(result.ariaLabel, data.expectedAriaLabel);
        assert.strictEqual(result.placeholder, data.expectedPlaceholder);
        assert.strictEqual(result.defaultValue, data.expectedDefaultValue);
      });
    });
  });
});
