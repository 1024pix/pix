import { expect } from 'chai';
import { describe, it } from 'mocha';
import SelectBlock from 'mon-pix/utils/proposals-parser/select-block';

describe('Unit | Utils | Proposals Parser | Select Block', function() {

  describe('#constructor', function() {
    const OPTIONS_SPLITTER = '//';
    const ESCAPED_OPTIONS_SPLITTER = '\\/\\/';
    const REMAINING_OPTIONS_SPLITTER = OPTIONS_SPLITTER;

    context('when there is options without aria label nor placeholder', function() {
      [
        {
          input: '${}',
          expected: {
            input: '',
            options: [''],
            autoAriaLabel: true,
            ariaLabel: '123',
            placeholder: null,
          },
        },
        {
          input: '${banana' + OPTIONS_SPLITTER + 'mango' + OPTIONS_SPLITTER + 'potato}',
          expected: {
            input: 'banana' + OPTIONS_SPLITTER + 'mango' + OPTIONS_SPLITTER + 'potato',
            options: ['banana', 'mango', 'potato'],
            autoAriaLabel: true,
            ariaLabel: '123',
            placeholder: null,
          },
        },
        {
          input: '${banana' + OPTIONS_SPLITTER + 'mango' + OPTIONS_SPLITTER + 'potato}s',
          expected: {
            input: 'banana' + OPTIONS_SPLITTER + 'mango' + OPTIONS_SPLITTER + 'potatos',
            options: ['banana', 'mango', 'potatos'],
            autoAriaLabel: true,
            ariaLabel: '123',
            placeholder: null,
          },
        },
        {
          input: '${banana' + OPTIONS_SPLITTER + 'mango' + OPTIONS_SPLITTER + 'potato$}',
          expected: {
            input: 'banana' + OPTIONS_SPLITTER + 'mango' + OPTIONS_SPLITTER + 'potato$',
            options: ['banana', 'mango', 'potato$'],
            autoAriaLabel: true,
            ariaLabel: '123',
            placeholder: null,
          },
        },
        {
          input: '${banana' + OPTIONS_SPLITTER + 'mango' + OPTIONS_SPLITTER + 'potato}}',
          expected: {
            input: 'banana' + OPTIONS_SPLITTER + 'mango' + OPTIONS_SPLITTER + 'potato}',
            options: ['banana', 'mango', 'potato}'],
            autoAriaLabel: true,
            ariaLabel: '123',
            placeholder: null,
          },
        },
        {
          input: '${banana' + OPTIONS_SPLITTER + 'mango' + OPTIONS_SPLITTER + 'potato${}}',
          expected: {
            input: 'banana' + OPTIONS_SPLITTER + 'mango' + OPTIONS_SPLITTER + 'potato${}',
            options: ['banana', 'mango', 'potato${}'],
            autoAriaLabel: true,
            ariaLabel: '123',
            placeholder: null,
          },
        },
        {
          input: '${banana/mango' + OPTIONS_SPLITTER + 'potato}',
          expected: {
            input: 'banana/mango' + OPTIONS_SPLITTER + 'potato',
            options: ['banana/mango', 'potato'],
            autoAriaLabel: true,
            ariaLabel: '123',
            placeholder: null,
          },
        },
        {
          input: '${banana is ' + ESCAPED_OPTIONS_SPLITTER + ' to mango' + OPTIONS_SPLITTER + 'potato}',
          expected: {
            input: 'banana is ' + ESCAPED_OPTIONS_SPLITTER + ' to mango' + OPTIONS_SPLITTER + 'potato',
            options: ['banana is ' + REMAINING_OPTIONS_SPLITTER + ' to mango', 'potato'],
            autoAriaLabel: true,
            ariaLabel: '123',
            placeholder: null,
          },
        },
        {
          input: '${banana is ' + ESCAPED_OPTIONS_SPLITTER + ' to mango and ' + ESCAPED_OPTIONS_SPLITTER + ' to kiwi' + OPTIONS_SPLITTER + 'potato}',
          expected: {
            input: 'banana is ' + ESCAPED_OPTIONS_SPLITTER + ' to mango and ' + ESCAPED_OPTIONS_SPLITTER + ' to kiwi' + OPTIONS_SPLITTER + 'potato',
            options: ['banana is ' + REMAINING_OPTIONS_SPLITTER + ' to mango and ' + REMAINING_OPTIONS_SPLITTER + ' to kiwi', 'potato'],
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
          input: '${banana' + OPTIONS_SPLITTER + 'mango' + OPTIONS_SPLITTER + 'potato#tomatoPlaceholder}',
          expected: {
            input: 'banana' + OPTIONS_SPLITTER + 'mango' + OPTIONS_SPLITTER + 'potato',
            options: ['banana', 'mango', 'potato'],
            autoAriaLabel: true,
            ariaLabel: '123',
            placeholder: 'tomatoPlaceholder',
          },
        },
        {
          input: '${banana' + OPTIONS_SPLITTER + 'mango' + OPTIONS_SPLITTER + 'potato}#tomatoPlaceholder',
          expected: {
            input: 'banana' + OPTIONS_SPLITTER + 'mango' + OPTIONS_SPLITTER + 'potato',
            options: ['banana', 'mango', 'potato'],
            autoAriaLabel: true,
            ariaLabel: '123',
            placeholder: 'tomatoPlaceholder',
          },
        },
        {
          input: '${banana' + OPTIONS_SPLITTER + 'mango' + OPTIONS_SPLITTER + 'potato§saladAriaLabel}',
          expected: {
            input: 'banana' + OPTIONS_SPLITTER + 'mango' + OPTIONS_SPLITTER + 'potato',
            options: ['banana', 'mango', 'potato'],
            autoAriaLabel: false,
            ariaLabel: 'saladAriaLabel',
            placeholder: null,
          },
        },
        {
          input: '${banana' + OPTIONS_SPLITTER + 'mango' + OPTIONS_SPLITTER + 'potato#tomatoPlaceholder§saladAriaLabel}',
          expected: {
            input: 'banana' + OPTIONS_SPLITTER + 'mango' + OPTIONS_SPLITTER + 'potato',
            options: ['banana', 'mango', 'potato'],
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
