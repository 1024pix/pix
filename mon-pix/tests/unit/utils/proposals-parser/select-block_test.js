import { module, test } from 'qunit';
import SelectBlock from 'mon-pix/utils/proposals-parser/select-block';

module('Unit | Utils | Proposals Parser | Select Block', function () {
  module('#constructor', function () {
    module('when there is options without aria label nor placeholder', function () {
      [
        {
          input: '${}',
          expected: {
            input: '',
            options: [],
            autoAriaLabel: true,
            ariaLabel: '123',
            placeholder: null,
          },
        },
        {
          input: '${banana options=["mango","potato"]}',
          expected: {
            input: 'banana',
            options: [
              {
                value: 'mango',
                label: 'mango',
              },
              {
                value: 'potato',
                label: 'potato',
              },
            ],
            autoAriaLabel: true,
            ariaLabel: '123',
            placeholder: null,
          },
        },
        {
          input: '${banana options=["mango","potato"]}s',
          expected: {
            input: 'banana',
            options: [
              {
                value: 'mango',
                label: 'mango',
              },
              {
                value: 'potato',
                label: 'potato',
              },
            ],
            autoAriaLabel: true,
            ariaLabel: '123',
            placeholder: null,
          },
        },
        {
          input: '${banana options=["mango","potato$"]}',
          expected: {
            input: 'banana',
            options: [
              {
                value: 'mango',
                label: 'mango',
              },
              {
                value: 'potato$',
                label: 'potato$',
              },
            ],
            autoAriaLabel: true,
            ariaLabel: '123',
            placeholder: null,
          },
        },
        {
          input: '${banana options=["mango","potato}"]}',
          expected: {
            input: 'banana',
            options: [
              {
                value: 'mango',
                label: 'mango',
              },
              {
                value: 'potato}',
                label: 'potato}',
              },
            ],
            autoAriaLabel: true,
            ariaLabel: '123',
            placeholder: null,
          },
        },
        {
          input: '${banana options=["mango","potato${}"]}',
          expected: {
            input: 'banana',
            options: [
              {
                value: 'mango',
                label: 'mango',
              },
              {
                value: 'potato${}',
                label: 'potato${}',
              },
            ],
            autoAriaLabel: true,
            ariaLabel: '123',
            placeholder: null,
          },
        },
        {
          input: '${banana options=["banana/mango"]}',
          expected: {
            input: 'banana',
            options: [
              {
                value: 'banana/mango',
                label: 'banana/mango',
              },
            ],
            autoAriaLabel: true,
            ariaLabel: '123',
            placeholder: null,
          },
        },
        {
          input: '${' + 'banana options=["\\"mango\\""]' + '}',
          expected: {
            input: 'banana',
            options: [
              {
                value: '"mango"',
                label: '"mango"',
              },
            ],
            autoAriaLabel: true,
            ariaLabel: '123',
            placeholder: null,
          },
        },
      ].forEach((data) => {
        test(`should parse input and options properly for ${data.input}`, function (assert) {
          // given
          const input = data.input;

          // when
          const result = new SelectBlock({ input, inputIndex: 123 });

          // then
          assert.strictEqual(result.input, data.expected.input);
          assert.deepEqual(result.options, data.expected.options);
          assert.strictEqual(result.autoAriaLabel, data.expected.autoAriaLabel);
          assert.strictEqual(result.ariaLabel, data.expected.ariaLabel);
          assert.strictEqual(result.placeholder, data.expected.placeholder);
          assert.strictEqual(result.type, 'select');
        });
      });
    });

    module('when options are standards and there is specific aria label and/or placeholder', function () {
      [
        {
          input: '${banana#Ceci est le place holder options=["mango","potato"]}',
          expected: {
            input: 'banana',
            options: [
              {
                value: 'mango',
                label: 'mango',
              },
              {
                value: 'potato',
                label: 'potato',
              },
            ],
            autoAriaLabel: true,
            ariaLabel: '123',
            placeholder: 'Ceci est le place holder',
          },
        },
        {
          input: '${banana options=["mango","potato"]}#Ceci est le place holder',
          expected: {
            input: 'banana',
            options: [
              {
                value: 'mango',
                label: 'mango',
              },
              {
                value: 'potato',
                label: 'potato',
              },
            ],
            autoAriaLabel: true,
            ariaLabel: '123',
            placeholder: null,
          },
        },
        {
          input: '${banana§Ceci est le aria label options=["mango","potato"]}',
          expected: {
            input: 'banana',
            options: [
              {
                value: 'mango',
                label: 'mango',
              },
              {
                value: 'potato',
                label: 'potato',
              },
            ],
            autoAriaLabel: false,
            ariaLabel: 'Ceci est le aria label',
            placeholder: null,
          },
        },
        {
          input: '${banana#Ceci est le place holder§Ceci est le aria label options=["mango","potato"]}',
          expected: {
            input: 'banana',
            options: [
              {
                value: 'mango',
                label: 'mango',
              },
              {
                value: 'potato',
                label: 'potato',
              },
            ],
            autoAriaLabel: false,
            ariaLabel: 'Ceci est le aria label',
            placeholder: 'Ceci est le place holder',
          },
        },
      ].forEach((data) => {
        test(`should parse a11y elements properly for ${data.input}`, function (assert) {
          // given
          const input = data.input;

          // when
          const result = new SelectBlock({ input, inputIndex: 123 });

          // then
          assert.strictEqual(result.input, data.expected.input);
          assert.deepEqual(result.options, data.expected.options);
          assert.strictEqual(result.autoAriaLabel, data.expected.autoAriaLabel);
          assert.strictEqual(result.ariaLabel, data.expected.ariaLabel);
          assert.strictEqual(result.placeholder, data.expected.placeholder);
          assert.strictEqual(result.type, 'select');
        });
      });
    });
  });
});
