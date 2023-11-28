import { expect } from '../../../../test-helper.js';
import { AnswerStatus } from '../../../../../src/devcomp/domain/models/validator/AnswerStatus.js';
import * as service from '../../../../../src/devcomp/domain/services/solution-service-qroc.js';

const ANSWER_KO = AnswerStatus.KO;
const ANSWER_OK = AnswerStatus.OK;

describe('Unit | Devcomp | Domain | Services | SolutionServiceQROC ', function () {
  describe('match, with numerical answers and solutions', function () {
    const challengeFormat = 'nombre';

    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      {
        case: 'when two numbers are strictly equal',
        answer: '0.123',
        solutions: ['0.123'],
        expectedAnswerStatus: ANSWER_OK,
      },
      {
        case: 'when 0 is added in front of the answer',
        answer: '0123',
        solutions: ['123'],
        expectedAnswerStatus: ANSWER_OK,
      },
      {
        case: 'when 0 is added behind the answer',
        answer: '1230',
        solutions: ['123'],
        expectedAnswerStatus: ANSWER_KO,
      },
      {
        case: 'when answer contains a dot followed by zero',
        answer: '123.0',
        solutions: ['123'],
        expectedAnswerStatus: ANSWER_OK,
      },
      {
        case: 'when answer contains a comma followed by zero',
        answer: '123,0',
        solutions: ['123'],
        expectedAnswerStatus: ANSWER_OK,
      },
      {
        case: 'when answer contains a comma followed by several zeros',
        answer: '123,000',
        solutions: ['123'],
        expectedAnswerStatus: ANSWER_OK,
      },
      {
        case: 'when answer contains a dot followed by a non-zero digit',
        answer: '123.4',
        solutions: ['123'],
        expectedAnswerStatus: ANSWER_KO,
      },
      {
        case: 'when answer contains two commas',
        answer: '123,,00',
        solutions: ['123'],
        expectedAnswerStatus: ANSWER_KO,
      },
      { case: 'when answer contains two dots', answer: '123..00', solutions: ['123'], expectedAnswerStatus: ANSWER_KO },
      {
        case: 'when answer contains a comma and a dot',
        answer: '123,.00',
        solutions: ['123'],
        expectedAnswerStatus: ANSWER_KO,
      },
      {
        case: 'when answer is close to actual solution (inferior)',
        answer: '122,1',
        solutions: ['123'],
        expectedAnswerStatus: ANSWER_KO,
      },
      {
        case: 'when answer is close to actual solution (superior)',
        answer: '123,4',
        solutions: ['123'],
        expectedAnswerStatus: ANSWER_KO,
      },
      {
        case: 'when answer is different of the actual solution',
        answer: '123',
        solutions: ['123.4'],
        expectedAnswerStatus: ANSWER_KO,
      },
      {
        case: 'when answer and solution are equal but solutions contains a dot',
        answer: '123',
        solutions: ['123.0'],
        expectedAnswerStatus: ANSWER_OK,
      },
      { case: 'when number has space', answer: '00025 000', solutions: ['25000'], expectedAnswerStatus: ANSWER_OK },
      {
        case: '(multiple solutions) when answer is correct but there are multiple solutions',
        answer: '123,00',
        solutions: ['123.0', '123'],
        expectedAnswerStatus: ANSWER_OK,
      },
      {
        case: '(multiple solutions) answer is not the first possible solution',
        answer: '23',
        solutions: ['21', '22', '23'],
        expectedAnswerStatus: ANSWER_OK,
      },
    ].forEach((data) => {
      it(`should return ${data.expectedAnswerStatus.status} when answer is ${data.answer} and solution is ${data.solution}`, function () {
        const solutions = { value: data.solutions, deactivations: {} };
        expect(service.match({ answer: data.answer, solutions, challengeFormat })).to.deep.equal(
          data.expectedAnswerStatus,
        );
      });
    });
  });

  describe('match, combining most weird cases without deactivations', function () {
    const successfulCases = [
      { case: '(single solution) same answer and solution', answer: 'Answer', solutions: ['Answer'] },
      {
        case: '(single solution) same answer and solution, but answer is lowercased, solution is uppercased',
        answer: 'answer',
        solutions: ['ANSWER'],
      },
      { case: '(single solution) answer with spaces, solution hasnt', answer: 'a b c d e', solutions: ['abcde'] },
      {
        case: '(single solution) answer with unbreakable spaces, solution hasnt',
        answer: 'a b c d e',
        solutions: ['abcde'],
      },
      { case: '(single solution) solution with trailing spaces', answer: 'abcd', solutions: ['    abcd   '] },
      {
        case: '(single solution) solution with trailing spaces and uppercase',
        answer: 'aaa bbb ccc',
        solutions: ['    AAABBBCCC   '],
      },
      { case: '(single solution) solution contains too much spaces', answer: 'a b c d e', solutions: ['a b c d e'] },
      {
        case: '(single solution) answer without punctuation, but solution has',
        answer: ',.!p-u-n-c-t',
        solutions: ['punct'],
      },
      {
        case: '(single solution) answer with punctuation, but solution has not',
        answer: 'punct',
        solutions: [',.!p-u-n-c-t'],
      },
      {
        case: '(single solution) answer without accent, but solution has',
        answer: 'with accents eee',
        solutions: ['wîth àccénts êêê'],
      },
      {
        case: '(single solution) answer with accent, but solution has not',
        answer: 'wîth àccénts êêê',
        solutions: ['with accents eee'],
      },
      {
        case: '(multiple solutions) answer is amongst solution',
        answer: 'variant 1',
        solutions: ['variant 1', 'variant 2', 'variant 3'],
      },
      {
        case: '(multiple solutions) answer is 0.2 away from the closest solution',
        answer: 'quack',
        solutions: ['quacks', 'azertysqdf', 'blablabla'],
      },
      {
        case: '(multiple solutions) answer is 0.25 away from the closest solution',
        answer: 'quak',
        solutions: ['qvak', 'qwak', 'anything'],
      },
    ];
    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    successfulCases.forEach(function (data) {
      it(
        data.case +
          ', should return "ok" when answer is "' +
          data.answer +
          '" and solution is "' +
          escape(data.solutions) +
          '"',
        function () {
          const solutions = { value: data.solutions, deactivations: {} };
          expect(service.match({ answer: data.answer, solutions })).to.deep.equal(ANSWER_OK);
        },
      );
    });

    const failingCases = [
      { case: 'solution do not exists', answer: 'any answer' },
      { case: 'solution is not a String', answer: 'a', solutions: [new Date()] },
      { case: 'solution is empty', answer: '', solutions: [''] },
      { case: 'answer is not a String', answer: new Date(), solutions: [''] },
      {
        case: 'answer does not match any solution variants',
        answer: 'abandoned answer',
        solutions: ['unmatched solution variant'],
      },
      { case: '(single solution) answer is 0.3 away from solution', answer: '0123456789', solutions: ['1234567'] },
      { case: '(single solution) answer is 0.5 away from solution', answer: '0123456789', solutions: ['12345'] },
      { case: '(single solution) answer is 10 away from solution', answer: 'a', solutions: ['0123456789'] },
      {
        case: '(multiple solutions) answer is minimum 0.4 away from a solution',
        answer: 'quaks',
        solutions: ['qvakes', 'qwakes', 'anything'],
      },
    ];
    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    failingCases.forEach(function (data) {
      it(
        data.case +
          ', should return "ko" when answer is "' +
          data.answer +
          '" and solution is "' +
          escape(data.solutions) +
          '"',
        function () {
          const solutions = { value: data.solutions, deactivations: {} };
          expect(service.match({ answer: data.answer, solutions })).to.deep.equal(ANSWER_KO);
        },
      );
    });
  });

  describe('match, strong focus on treatments', function () {
    const allCases = [
      { when: 'no stress', output: ANSWER_OK, answer: 'Answer', solutions: ['variant1', 'Answer'], deactivations: {} },
      {
        when: 'spaces stress',
        output: ANSWER_OK,
        answer: 'a b c d e',
        solutions: ['variant1', 'abcde'],
        deactivations: {},
      },
      {
        when: 'reverted spaces stress',
        output: ANSWER_OK,
        answer: 'abcde',
        solutions: ['variant1', 'a b c d e'],
        deactivations: {},
      },
      {
        when: 'uppercase stress',
        output: ANSWER_OK,
        answer: 'ANSWER',
        solutions: ['variant1', 'answer'],
        deactivations: {},
      },
      {
        when: 'reverted uppercase stress',
        output: ANSWER_OK,
        answer: 'answer',
        solutions: ['variant1', 'ANSWER'],
        deactivations: {},
      },
      {
        when: 'accent stress',
        output: ANSWER_OK,
        answer: 'îàé êêê',
        solutions: ['variant1', 'iae eee'],
        deactivations: {},
      },
      {
        when: 'reverted accent stress',
        output: ANSWER_OK,
        answer: 'iae eee',
        solutions: ['variant1', 'îàé êêê'],
        deactivations: {},
      },
      {
        when: 'diacritic stress',
        output: ANSWER_OK,
        answer: 'ççççç',
        solutions: ['variant1', 'ccccc'],
        deactivations: {},
      },
      {
        when: 'reverted diacritic stress',
        output: ANSWER_OK,
        answer: 'ccccc',
        solutions: ['variant1', 'ççççç'],
        deactivations: {},
      },
      {
        when: 'punctuation stress',
        output: ANSWER_OK,
        answer: '.!p-u-n-c-t',
        solutions: ['variant1', 'punct'],
        deactivations: {},
      },
      {
        when: 'reverted punctuation stress',
        output: ANSWER_OK,
        answer: 'punct',
        solutions: ['variant1', '.!p-u-n-c-t'],
        deactivations: {},
      },
      {
        when: 'levenshtein stress',
        output: ANSWER_OK,
        answer: '0123456789',
        solutions: ['variant1', '123456789'],
        deactivations: {},
      },
      {
        when: 'reverted levenshtein stress',
        output: ANSWER_OK,
        answer: '123456789',
        solutions: ['variant1', '0123456789'],
        deactivations: {},
      },
    ];
    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    allCases.forEach(function (data) {
      it(
        data.when +
          ', should return ' +
          data.output +
          ' when answer is "' +
          data.answer +
          '" and solution is "' +
          escape(data.solutions) +
          '"',
        function () {
          const solutions = { value: data.solutions, deactivations: data.deactivations };
          expect(service.match({ answer: data.answer, solutions })).to.deep.equal(data.output);
        },
      );
    });
  });

  describe('match | t1 deactivated', function () {
    const allCases = [
      {
        when: 'no stress',
        output: ANSWER_OK,
        answer: 'Answer',
        solutions: ['variant1', 'Answer'],
        deactivations: { t1: true },
      },
      {
        when: 'spaces stress',
        output: ANSWER_KO,
        answer: 'a b c d e',
        solutions: ['variant1', 'abcde'],
        deactivations: { t1: true },
      },
      {
        when: 'reverted spaces stress',
        output: ANSWER_KO,
        answer: 'abcde',
        solutions: ['variant1', 'a b c d e'],
        deactivations: { t1: true },
      },
      {
        when: 'uppercase stress',
        output: ANSWER_KO,
        answer: 'ANSWER',
        solutions: ['variant1', 'answer'],
        deactivations: { t1: true },
      },
      {
        when: 'reverted uppercase stress',
        output: ANSWER_KO,
        answer: 'answer',
        solutions: ['variant1', 'ANSWER'],
        deactivations: { t1: true },
      },
      {
        when: 'accent stress',
        output: ANSWER_KO,
        answer: 'îàé êêê',
        solutions: ['variant1', 'iae eee'],
        deactivations: { t1: true },
      },
      {
        when: 'reverted accent stress',
        output: ANSWER_KO,
        answer: 'iae eee',
        solutions: ['variant1', 'îàé êêê'],
        deactivations: { t1: true },
      },
      {
        when: 'diacritic stress',
        output: ANSWER_KO,
        answer: 'ççççç',
        solutions: ['variant1', 'ccccc'],
        deactivations: { t1: true },
      },
      {
        when: 'reverted diacritic stress',
        output: ANSWER_KO,
        answer: 'ccccc',
        solutions: ['variant1', 'ççççç'],
        deactivations: { t1: true },
      },
      {
        when: 'punctuation stress',
        output: ANSWER_OK,
        answer: '.!p-u-n-c-t',
        solutions: ['variant1', 'punct'],
        deactivations: { t1: true },
      },
      {
        when: 'reverted punctuation stress',
        output: ANSWER_OK,
        answer: 'punct',
        solutions: ['variant1', '.!p-u-n-c-t'],
        deactivations: { t1: true },
      },
      {
        when: 'levenshtein stress',
        output: ANSWER_OK,
        answer: '0123456789',
        solutions: ['variant1', '123456789'],
        deactivations: { t1: true },
      },
      {
        when: 'reverted levenshtein stress',
        output: ANSWER_OK,
        answer: '123456789',
        solutions: ['variant1', '0123456789'],
        deactivations: { t1: true },
      },
    ];
    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    allCases.forEach(function (data) {
      it(
        data.when +
          ', should return ' +
          data.output +
          ' when answer is "' +
          data.answer +
          '" and solution is "' +
          escape(data.solutions) +
          '"',
        function () {
          const solutions = { value: data.solutions, deactivations: data.deactivations };
          expect(service.match({ answer: data.answer, solutions })).to.deep.equal(data.output);
        },
      );
    });
  });

  describe('match | t2 deactivated', function () {
    const allCases = [
      {
        when: 'no stress',
        output: ANSWER_OK,
        answer: 'Answer',
        solutions: ['variant1', 'Answer'],
        deactivations: { t2: true },
      },
      {
        when: 'spaces stress',
        output: ANSWER_OK,
        answer: 'a b c d e',
        solutions: ['variant1', 'abcde'],
        deactivations: { t2: true },
      },
      {
        when: 'reverted spaces stress',
        output: ANSWER_OK,
        answer: 'abcde',
        solutions: ['variant1', 'a b c d e'],
        deactivations: { t2: true },
      },
      {
        when: 'uppercase stress',
        output: ANSWER_OK,
        answer: 'ANSWER',
        solutions: ['variant1', 'answer'],
        deactivations: { t2: true },
      },
      {
        when: 'reverted uppercase stress',
        output: ANSWER_OK,
        answer: 'answer',
        solutions: ['variant1', 'ANSWER'],
        deactivations: { t2: true },
      },
      {
        when: 'accent stress',
        output: ANSWER_OK,
        answer: 'îàé êêê',
        solutions: ['variant1', 'iae eee'],
        deactivations: { t2: true },
      },
      {
        when: 'reverted accent stress',
        output: ANSWER_OK,
        answer: 'iae eee',
        solutions: ['variant1', 'îàé êêê'],
        deactivations: { t2: true },
      },
      {
        when: 'diacritic stress',
        output: ANSWER_OK,
        answer: 'ççççç',
        solutions: ['variant1', 'ccccc'],
        deactivations: { t2: true },
      },
      {
        when: 'reverted diacritic stress',
        output: ANSWER_OK,
        answer: 'ccccc',
        solutions: ['variant1', 'ççççç'],
        deactivations: { t2: true },
      },
      {
        when: 'punctuation stress',
        output: ANSWER_KO,
        answer: '.!p-u-n-c-t',
        solutions: ['variant1', 'punct'],
        deactivations: { t2: true },
      },
      {
        when: 'reverted punctuation stress',
        output: ANSWER_KO,
        answer: 'punct',
        solutions: ['variant1', '.!p-u-n-c-t'],
        deactivations: { t2: true },
      },
      {
        when: 'levenshtein stress',
        output: ANSWER_OK,
        answer: '0123456789',
        solutions: ['variant1', '123456789'],
        deactivations: { t2: true },
      },
      {
        when: 'reverted levenshtein stress',
        output: ANSWER_OK,
        answer: '123456789',
        solutions: ['variant1', '0123456789'],
        deactivations: { t2: true },
      },
    ];
    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    allCases.forEach(function (data) {
      it(
        data.when +
          ', should return ' +
          data.output +
          ' when answer is "' +
          data.answer +
          '" and solution is "' +
          escape(data.solutions) +
          '"',
        function () {
          const solutions = { value: data.solutions, deactivations: data.deactivations };
          expect(service.match({ answer: data.answer, solutions })).to.deep.equal(data.output);
        },
      );
    });
  });

  describe('match | t3 deactivated', function () {
    const allCases = [
      {
        when: 'no stress',
        output: ANSWER_OK,
        answer: 'Answer',
        solutions: ['variant1', 'Answer'],
        deactivations: { t3: true },
      },
      {
        when: 'spaces stress',
        output: ANSWER_OK,
        answer: 'a b c d e',
        solutions: ['variant1', 'abcde'],
        deactivations: { t3: true },
      },
      {
        when: 'reverted spaces stress',
        output: ANSWER_OK,
        answer: 'abcde',
        solutions: ['variant1', 'a b c d e'],
        deactivations: { t3: true },
      },
      {
        when: 'uppercase stress',
        output: ANSWER_OK,
        answer: 'ANSWER',
        solutions: ['variant1', 'answer'],
        deactivations: { t3: true },
      },
      {
        when: 'reverted uppercase stress',
        output: ANSWER_OK,
        answer: 'answer',
        solutions: ['variant1', 'ANSWER'],
        deactivations: { t3: true },
      },
      {
        when: 'accent stress',
        output: ANSWER_OK,
        answer: 'îàé êêê',
        solutions: ['variant1', 'iae eee'],
        deactivations: { t3: true },
      },
      {
        when: 'reverted accent stress',
        output: ANSWER_OK,
        answer: 'iae eee',
        solutions: ['variant1', 'îàé êêê'],
        deactivations: { t3: true },
      },
      {
        when: 'diacritic stress',
        output: ANSWER_OK,
        answer: 'ççççç',
        solutions: ['variant1', 'ccccc'],
        deactivations: { t3: true },
      },
      {
        when: 'reverted diacritic stress',
        output: ANSWER_OK,
        answer: 'ccccc',
        solutions: ['variant1', 'ççççç'],
        deactivations: { t3: true },
      },
      {
        when: 'punctuation stress',
        output: ANSWER_OK,
        answer: '.!p-u-n-c-t',
        solutions: ['variant1', 'punct'],
        deactivations: { t3: true },
      },
      {
        when: 'reverted punctuation stress',
        output: ANSWER_OK,
        answer: 'punct',
        solutions: ['variant1', '.!p-u-n-c-t'],
        deactivations: { t3: true },
      },
      {
        when: 'levenshtein stress',
        output: ANSWER_KO,
        answer: '0123456789',
        solutions: ['variant1', '123456789'],
        deactivations: { t3: true },
      },
      {
        when: 'reverted levenshtein stress',
        output: ANSWER_KO,
        answer: '123456789',
        solutions: ['variant1', '0123456789'],
        deactivations: { t3: true },
      },
    ];
    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    allCases.forEach(function (data) {
      it(
        data.when +
          ', should return ' +
          data.output +
          ' when answer is "' +
          data.answer +
          '" and solution is "' +
          escape(data.solutions) +
          '"',
        function () {
          const solutions = { value: data.solutions, deactivations: data.deactivations };
          expect(service.match({ answer: data.answer, solutions })).to.deep.equal(data.output);
        },
      );
    });
  });

  describe('match | t1 and t2 deactivated', function () {
    const allCases = [
      {
        when: 'no stress',
        output: ANSWER_OK,
        answer: 'Answer',
        solutions: ['variant1', 'Answer'],
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'spaces stress',
        output: ANSWER_KO,
        answer: 'a b c d e',
        solutions: ['variant1', 'abcde'],
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'reverted spaces stress',
        output: ANSWER_KO,
        answer: 'abcde',
        solutions: ['variant1', 'a b c d e'],
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'uppercase stress',
        output: ANSWER_KO,
        answer: 'ANSWER',
        solutions: ['variant1', 'answer'],
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'reverted uppercase stress',
        output: ANSWER_KO,
        answer: 'answer',
        solutions: ['variant1', 'ANSWER'],
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'accent stress',
        output: ANSWER_KO,
        answer: 'îàé êêê',
        solutions: ['variant1', 'iae eee'],
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'reverted accent stress',
        output: ANSWER_KO,
        answer: 'iae eee',
        solutions: ['variant1', 'îàé êêê'],
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'diacritic stress',
        output: ANSWER_KO,
        answer: 'ççççç',
        solutions: ['variant1', 'ccccc'],
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'reverted diacritic stress',
        output: ANSWER_KO,
        answer: 'ccccc',
        solutions: ['variant1', 'ççççç'],
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'punctuation stress',
        output: ANSWER_KO,
        answer: '.!p-u-n-c-t',
        solutions: ['variant1', 'punct'],
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'reverted punctuation stress',
        output: ANSWER_KO,
        answer: 'punct',
        solutions: ['variant1', '.!p-u-n-c-t'],
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'levenshtein stress',
        output: ANSWER_OK,
        answer: '0123456789',
        solutions: ['variant1', '123456789'],
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'reverted levenshtein stress',
        output: ANSWER_OK,
        answer: '123456789',
        solutions: ['variant1', '0123456789'],
        deactivations: { t1: true, t2: true },
      },
    ];
    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    allCases.forEach(function (data) {
      it(
        data.when +
          ', should return ' +
          data.output +
          ' when answer is "' +
          data.answer +
          '" and solution is "' +
          escape(data.solutions) +
          '"',
        function () {
          const solutions = { value: data.solutions, deactivations: data.deactivations };
          expect(service.match({ answer: data.answer, solutions })).to.deep.equal(data.output);
        },
      );
    });
  });

  describe('match | t1 and t3 deactivated', function () {
    const allCases = [
      {
        when: 'no stress',
        output: ANSWER_OK,
        answer: 'Answer',
        solutions: ['variant1', 'Answer'],
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'spaces stress',
        output: ANSWER_KO,
        answer: 'a b c d e',
        solutions: ['variant1', 'abcde'],
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'reverted spaces stress',
        output: ANSWER_KO,
        answer: 'abcde',
        solutions: ['variant1', 'a b c d e'],
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'uppercase stress',
        output: ANSWER_KO,
        answer: 'ANSWER',
        solutions: ['variant1', 'answer'],
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'reverted uppercase stress',
        output: ANSWER_KO,
        answer: 'answer',
        solutions: ['variant1', 'ANSWER'],
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'accent stress',
        output: ANSWER_KO,
        answer: 'îàé êêê',
        solutions: ['variant1', 'iae eee'],
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'reverted accent stress',
        output: ANSWER_KO,
        answer: 'iae eee',
        solutions: ['variant1', 'îàé êêê'],
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'diacritic stress',
        output: ANSWER_KO,
        answer: 'ççççç',
        solutions: ['variant1', 'ccccc'],
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'reverted diacritic stress',
        output: ANSWER_KO,
        answer: 'ccccc',
        solutions: ['variant1', 'ççççç'],
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'punctuation stress',
        output: ANSWER_OK,
        answer: '.!p-u-n-c-t',
        solutions: ['variant1', 'punct'],
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'reverted punctuation stress',
        output: ANSWER_OK,
        answer: 'punct',
        solutions: ['variant1', '.!p-u-n-c-t'],
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'levenshtein stress',
        output: ANSWER_KO,
        answer: '0123456789',
        solutions: ['variant1', '123456789'],
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'reverted levenshtein stress',
        output: ANSWER_KO,
        answer: '123456789',
        solutions: ['variant1', '0123456789'],
        deactivations: { t1: true, t3: true },
      },
    ];
    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    allCases.forEach(function (data) {
      it(
        data.when +
          ', should return ' +
          data.output +
          ' when answer is "' +
          data.answer +
          '" and solution is "' +
          escape(data.solutions) +
          '"',
        function () {
          const solutions = { value: data.solutions, deactivations: data.deactivations };
          expect(service.match({ answer: data.answer, solutions })).to.deep.equal(data.output);
        },
      );
    });
  });

  describe('match | t2 and t3 deactivated', function () {
    const allCases = [
      {
        when: 'no stress',
        output: ANSWER_OK,
        answer: 'Answer',
        solutions: ['variant1', 'Answer'],
        deactivations: { t2: true, t3: true },
      },
      {
        when: 'spaces stress',
        output: ANSWER_OK,
        answer: 'a b c d e',
        solutions: ['variant1', 'abcde'],
        deactivations: { t2: true, t3: true },
      },
      {
        when: 'reverted spaces stress',
        output: ANSWER_OK,
        answer: 'abcde',
        solutions: ['variant1', 'a b c d e'],
        deactivations: { t2: true, t3: true },
      },
      {
        when: 'uppercase stress',
        output: ANSWER_OK,
        answer: 'ANSWER',
        solutions: ['variant1', 'answer'],
        deactivations: { t2: true, t3: true },
      },
      {
        when: 'reverted uppercase stress',
        output: ANSWER_OK,
        answer: 'answer',
        solutions: ['variant1', 'ANSWER'],
        deactivations: { t2: true, t3: true },
      },
      {
        when: 'accent stress',
        output: ANSWER_OK,
        answer: 'îàé êêê',
        solutions: ['variant1', 'iae eee'],
        deactivations: { t2: true, t3: true },
      },
      {
        when: 'reverted accent stress',
        output: ANSWER_OK,
        answer: 'iae eee',
        solutions: ['variant1', 'îàé êêê'],
        deactivations: { t2: true, t3: true },
      },
      {
        when: 'diacritic stress',
        output: ANSWER_OK,
        answer: 'ççççç',
        solutions: ['variant1', 'ccccc'],
        deactivations: { t2: true, t3: true },
      },
      {
        when: 'reverted diacritic stress',
        output: ANSWER_OK,
        answer: 'ccccc',
        solutions: ['variant1', 'ççççç'],
        deactivations: { t2: true, t3: true },
      },
      {
        when: 'punctuation stress',
        output: ANSWER_KO,
        answer: '.!p-u-n-c-t',
        solutions: ['variant1', 'punct'],
        deactivations: { t2: true, t3: true },
      },
      {
        when: 'reverted punctuation stress',
        output: ANSWER_KO,
        answer: 'punct',
        solutions: ['variant1', '.!p-u-n-c-t'],
        deactivations: { t2: true, t3: true },
      },
      {
        when: 'levenshtein stress',
        output: ANSWER_KO,
        answer: '0123456789',
        solutions: ['variant1', '123456789'],
        deactivations: { t2: true, t3: true },
      },
      {
        when: 'reverted levenshtein stress',
        output: ANSWER_KO,
        answer: '123456789',
        solutions: ['variant1', '0123456789'],
        deactivations: { t2: true, t3: true },
      },
    ];
    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    allCases.forEach(function (data) {
      it(
        data.when +
          ', should return ' +
          data.output +
          ' when answer is "' +
          data.answer +
          '" and solution is "' +
          escape(data.solutions) +
          '"',
        function () {
          const solutions = { value: data.solutions, deactivations: data.deactivations };
          expect(service.match({ answer: data.answer, solutions })).to.deep.equal(data.output);
        },
      );
    });
  });

  describe('match | t1, t2 and t3 deactivated', function () {
    const allCases = [
      {
        when: 'no stress',
        output: ANSWER_OK,
        answer: 'Answer',
        solutions: ['variant1', 'Answer'],
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'spaces stress',
        output: ANSWER_KO,
        answer: 'a b c d e',
        solutions: ['variant1', 'abcde'],
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'reverted spaces stress',
        output: ANSWER_KO,
        answer: 'abcde',
        solutions: ['variant1', 'a b c d e'],
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'uppercase stress',
        output: ANSWER_KO,
        answer: 'ANSWER',
        solutions: ['variant1', 'answer'],
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'reverted uppercase stress',
        output: ANSWER_KO,
        answer: 'answer',
        solutions: ['variant1', 'ANSWER'],
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'accent stress',
        output: ANSWER_KO,
        answer: 'îàé êêê',
        solutions: ['variant1', 'iae eee'],
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'reverted accent stress',
        output: ANSWER_KO,
        answer: 'iae eee',
        solutions: ['variant1', 'îàé êêê'],
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'diacritic stress',
        output: ANSWER_KO,
        answer: 'ççççç',
        solutions: ['variant1', 'ccccc'],
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'reverted diacritic stress',
        output: ANSWER_KO,
        answer: 'ccccc',
        solutions: ['variant1', 'ççççç'],
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'punctuation stress',
        output: ANSWER_KO,
        answer: '.!p-u-n-c-t',
        solutions: ['variant1', 'punct'],
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'reverted punctuation stress',
        output: ANSWER_KO,
        answer: 'punct',
        solutions: ['variant1', '.!p-u-n-c-t'],
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'levenshtein stress',
        output: ANSWER_KO,
        answer: '0123456789',
        solutions: ['variant1', '123456789'],
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'reverted levenshtein stress',
        output: ANSWER_KO,
        answer: '123456789',
        solutions: ['variant1', '0123456789'],
        deactivations: { t1: true, t2: true, t3: true },
      },
    ];

    // eslint-disable-next-line mocha/no-setup-in-describe
    allCases.forEach(function (data) {
      it(
        data.when +
          ', should return ' +
          data.output +
          ' when answer is "' +
          data.answer +
          '" and solution is "' +
          escape(data.solutions) +
          '"',
        function () {
          const solutions = { value: data.solutions, deactivations: data.deactivations };
          expect(service.match({ answer: data.answer, solutions })).to.deep.equal(data.output);
        },
      );
    });
  });

  describe('match with the type select for the QROC', function () {
    const successfulCases = [
      { case: 'Same answer and solution', answer: 'Answer', solutions: ['Answer'], output: ANSWER_OK },
      {
        case: 'Same answer and solution, but answer is lowercased, solution is uppercased',
        answer: 'answer',
        solutions: ['ANSWER'],
        output: ANSWER_KO,
      },
      { case: 'answer with spaces, solution hasnt', answer: 'a b c d e', solutions: ['abcde'], output: ANSWER_KO },
      {
        case: 'answer with unbreakable spaces, solution hasnt',
        answer: 'a b c d e',
        solutions: ['abcde'],
        output: ANSWER_KO,
      },
      {
        case: 'answer without punctuation, but solution has',
        answer: ',.!p-u-n-c-t',
        solutions: ['punct'],
        output: ANSWER_KO,
      },
      {
        case: '(multiple solutions) answer is amongst solution',
        answer: 'variant 1',
        solutions: ['variant 1', 'variant 2', 'variant 3'],
        output: ANSWER_OK,
      },
      {
        case: '(multiple solutions) answer is 0.2 away from the closest solution',
        answer: 'quack',
        solutions: ['quacks', 'azertysqdf', 'blablabla'],
        output: ANSWER_KO,
      },
    ];

    // eslint-disable-next-line mocha/no-setup-in-describe
    successfulCases.forEach(function (data) {
      it(
        data.case +
          ', should return "ok" when answer is "' +
          data.answer +
          '" and solution is "' +
          escape(data.solutions) +
          '"',
        function () {
          const solutions = {
            value: data.solutions,
            deactivations: data.deactivations,
            qrocBlocksTypes: { rep: 'select' },
          };
          expect(service.match({ answer: data.answer, solutions })).to.deep.equal(data.output);
        },
      );
    });
  });
});
