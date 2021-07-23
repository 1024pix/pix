import { expect } from 'chai';
import { describe, it } from 'mocha';
import SelectBlock from 'mon-pix/utils/proposals-parser/select-block';

describe('Unit | Utils | Proposals Parser | Select Block', function() {

  describe('#constructor', function() {
    context('when there is options without aria label nor placeholder', function() {
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
              }, {
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
              }, {
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
              }, {
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
              }, {
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
              }, {
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
        it(`should parse input and options properly for ${data.input}`, function() {
          // given
          const input = data.input;

          // when
          const result = new SelectBlock({ input, inputIndex: 123 });

          // then
          expect(result.input).to.equal(data.expected.input);
          expect(result.options).to.deep.equal(data.expected.options);
          expect(result.autoAriaLabel).to.equal(data.expected.autoAriaLabel);
          expect(result.ariaLabel).to.equal(data.expected.ariaLabel);
          expect(result.placeholder).to.equal(data.expected.placeholder);
          expect(result.type).to.equal('select');
        });
      });
    });

    context('when options are standards and there is specific aria label and/or placeholder', function() {
      [
        {
          input: '${banana#tomatoPlaceholder options=["mango","potato"]}',
          expected: {
            input: 'banana',
            options: [
              {
                value: 'mango',
                label: 'mango',
              }, {
                value: 'potato',
                label: 'potato',
              },
            ],
            autoAriaLabel: true,
            ariaLabel: '123',
            placeholder: 'tomatoPlaceholder',
          },
        },
        {
          input: '${banana options=["mango","potato"]}#tomatoPlaceholder',
          expected: {
            input: 'banana',
            options: [
              {
                value: 'mango',
                label: 'mango',
              }, {
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
          input: '${banana§saladAriaLabel options=["mango","potato"]}',
          expected: {
            input: 'banana',
            options: [
              {
                value: 'mango',
                label: 'mango',
              }, {
                value: 'potato',
                label: 'potato',
              },
            ],
            autoAriaLabel: false,
            ariaLabel: 'saladAriaLabel',
            placeholder: null,
          },
        },
        {
          input: '${banana#tomatoPlaceholder§saladAriaLabel options=["mango","potato"]}',
          expected: {
            input: 'banana',
            options: [
              {
                value: 'mango',
                label: 'mango',
              }, {
                value: 'potato',
                label: 'potato',
              },
            ],
            autoAriaLabel: false,
            ariaLabel: 'saladAriaLabel',
            placeholder: 'tomatoPlaceholder',
          },
        },
      ].forEach((data) => {
        it(`should parse a11y elements properly for ${data.input}`, function() {
          // given
          const input = data.input;

          // when
          const result = new SelectBlock({ input, inputIndex: 123 });

          console.log(result);

          // then
          expect(result.input).to.equal(data.expected.input);
          expect(result.options).to.deep.equal(data.expected.options);
          expect(result.autoAriaLabel).to.equal(data.expected.autoAriaLabel);
          expect(result.ariaLabel).to.equal(data.expected.ariaLabel);
          expect(result.placeholder).to.equal(data.expected.placeholder);
          expect(result.type).to.equal('select');
        });
      });
    });
  });
});
