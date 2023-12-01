import { expect } from '../../../test-helper.js';
import { AnswerStatus } from '../../../../src/school/domain/models/AnswerStatus.js';
import * as service from '../../../../lib/domain/services/solution-service-qroc.js';

const ANSWER_KO = AnswerStatus.KO;
const ANSWER_OK = AnswerStatus.OK;

describe('Unit | Service | SolutionServiceQROC ', function () {
  describe('match, with numerical answers and solutions', function () {
    const challengeFormat = 'nombre';

    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      {
        case: 'when two numbers are strictly equal',
        answer: '0.123',
        solution: '0.123',
        expectedAnswerStatus: ANSWER_OK,
      },
      {
        case: 'when 0 is added in front of the answer',
        answer: '0123',
        solution: '123',
        expectedAnswerStatus: ANSWER_OK,
      },
      { case: 'when 0 is added behind the answer', answer: '1230', solution: '123', expectedAnswerStatus: ANSWER_KO },
      {
        case: 'when answer contains a dot followed by zero',
        answer: '123.0',
        solution: '123',
        expectedAnswerStatus: ANSWER_OK,
      },
      {
        case: 'when answer contains a comma followed by zero',
        answer: '123,0',
        solution: '123',
        expectedAnswerStatus: ANSWER_OK,
      },
      {
        case: 'when answer contains a comma followed by several zeros',
        answer: '123,000',
        solution: '123',
        expectedAnswerStatus: ANSWER_OK,
      },
      {
        case: 'when answer contains a dot followed by a non-zero digit',
        answer: '123.4',
        solution: '123',
        expectedAnswerStatus: ANSWER_KO,
      },
      { case: 'when answer contains two commas', answer: '123,,00', solution: '123', expectedAnswerStatus: ANSWER_KO },
      { case: 'when answer contains two dots', answer: '123..00', solution: '123', expectedAnswerStatus: ANSWER_KO },
      {
        case: 'when answer contains a comma and a dot',
        answer: '123,.00',
        solution: '123',
        expectedAnswerStatus: ANSWER_KO,
      },
      {
        case: 'when answer is close to actual solution (inferior)',
        answer: '122,1',
        solution: '123',
        expectedAnswerStatus: ANSWER_KO,
      },
      {
        case: 'when answer is close to actual solution (superior)',
        answer: '123,4',
        solution: '123',
        expectedAnswerStatus: ANSWER_KO,
      },
      {
        case: 'when answer is different of the actual solution',
        answer: '123',
        solution: '123.4',
        expectedAnswerStatus: ANSWER_KO,
      },
      {
        case: 'when answer and solution are equal but solutions contains a dot',
        answer: '123',
        solution: '123.0',
        expectedAnswerStatus: ANSWER_OK,
      },
      { case: 'when number has space', answer: '00025 000', solution: '25000', expectedAnswerStatus: ANSWER_OK },
      {
        case: '(multiple solutions) when answer is correct but there are multiple solutions',
        answer: '123,00',
        solution: '123.0\n123',
        expectedAnswerStatus: ANSWER_OK,
      },
      {
        case: '(multiple solutions) answer is not the first possible solution',
        answer: '23',
        solution: '21\n22\n23\n',
        expectedAnswerStatus: ANSWER_OK,
      },
    ].forEach((data) => {
      it(`should return ${data.expectedAnswerStatus.status} when answer is ${data.answer} and solution is ${data.solution}`, function () {
        const solution = { value: data.solution, deactivations: {} };
        expect(service.match({ answer: data.answer, solution, challengeFormat })).to.deep.equal(
          data.expectedAnswerStatus,
        );
      });
    });
  });

  describe('match, combining most weird cases without deactivations', function () {
    const successfulCases = [
      { case: '(single solution) same answer and solution', answer: 'Answer', solution: 'Answer' },
      {
        case: '(single solution) same answer and solution, but answer is lowercased, solution is uppercased',
        answer: 'answer',
        solution: 'ANSWER',
      },
      { case: '(single solution) answer with spaces, solution hasnt', answer: 'a b c d e', solution: 'abcde' },
      {
        case: '(single solution) answer with unbreakable spaces, solution hasnt',
        answer: 'a b c d e',
        solution: 'abcde',
      },
      { case: '(single solution) solution with trailing spaces', answer: 'abcd', solution: '    abcd   ' },
      {
        case: '(single solution) solution with trailing spaces and uppercase',
        answer: 'aaa bbb ccc',
        solution: '    AAABBBCCC   ',
      },
      { case: '(single solution) solution contains too much spaces', answer: 'a b c d e', solution: 'a b c d e' },
      {
        case: '(single solution) answer without punctuation, but solution has',
        answer: ',.!p-u-n-c-t',
        solution: 'punct',
      },
      {
        case: '(single solution) answer with punctuation, but solution has not',
        answer: 'punct',
        solution: ',.!p-u-n-c-t',
      },
      {
        case: '(single solution) answer without accent, but solution has',
        answer: 'with accents eee',
        solution: 'wîth àccénts êêê',
      },
      {
        case: '(single solution) answer with accent, but solution has not',
        answer: 'wîth àccénts êêê',
        solution: 'with accents eee',
      },
      {
        case: '(multiple solutions) answer is amongst solution',
        answer: 'variant 1',
        solution: 'variant 1\nvariant 2\nvariant 3\n',
      },
      {
        case: '(multiple solutions) answer is 0.2 away from the closest solution',
        answer: 'quack',
        solution: 'quacks\nazertysqdf\nblablabla\n',
      },
      {
        case: '(multiple solutions) answer is 0.25 away from the closest solution',
        answer: 'quak',
        solution: 'qvak\nqwak\nanything\n',
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
          escape(data.solution) +
          '"',
        function () {
          const solution = { value: data.solution, deactivations: {} };
          expect(service.match({ answer: data.answer, solution })).to.deep.equal(ANSWER_OK);
        },
      );
    });

    const failingCases = [
      { case: 'solution do not exists', answer: 'any answer' },
      { case: 'solution is not a String', answer: 'a', solution: new Date() },
      { case: 'solution is empty', answer: '', solution: '' },
      { case: 'answer is not a String', answer: new Date(), solution: '' },
      {
        case: 'answer does not match any solution variants',
        answer: 'abandoned answer',
        solution: 'unmatched solution variant',
      },
      { case: '(single solution) answer is 0.3 away from solution', answer: '0123456789', solution: '1234567' },
      { case: '(single solution) answer is 0.5 away from solution', answer: '0123456789', solution: '12345' },
      { case: '(single solution) answer is 10 away from solution', answer: 'a', solution: '0123456789' },
      {
        case: '(multiple solutions) answer is minimum 0.4 away from a solution',
        answer: 'quaks',
        solution: 'qvakes\nqwakes\nanything\n',
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
          escape(data.solution) +
          '"',
        function () {
          const solution = { value: data.solution, deactivations: {} };
          expect(service.match({ answer: data.answer, solution })).to.deep.equal(ANSWER_KO);
        },
      );
    });
  });

  describe('match, strong focus on treatments', function () {
    const allCases = [
      { when: 'no stress', output: ANSWER_OK, answer: 'Answer', solution: '\nvariant1\nAnswer\n', deactivations: {} },
      {
        when: 'spaces stress',
        output: ANSWER_OK,
        answer: 'a b c d e',
        solution: '\nvariant1\nabcde\n',
        deactivations: {},
      },
      {
        when: 'reverted spaces stress',
        output: ANSWER_OK,
        answer: 'abcde',
        solution: '\nvariant1\na b c d e\n',
        deactivations: {},
      },
      {
        when: 'uppercase stress',
        output: ANSWER_OK,
        answer: 'ANSWER',
        solution: '\nvariant1\nanswer\n',
        deactivations: {},
      },
      {
        when: 'reverted uppercase stress',
        output: ANSWER_OK,
        answer: 'answer',
        solution: '\nvariant1\nANSWER\n',
        deactivations: {},
      },
      {
        when: 'accent stress',
        output: ANSWER_OK,
        answer: 'îàé êêê',
        solution: '\nvariant1\niae eee\n',
        deactivations: {},
      },
      {
        when: 'reverted accent stress',
        output: ANSWER_OK,
        answer: 'iae eee',
        solution: '\nvariant1\nîàé êêê\n',
        deactivations: {},
      },
      {
        when: 'diacritic stress',
        output: ANSWER_OK,
        answer: 'ççççç',
        solution: '\nvariant1\nccccc\n',
        deactivations: {},
      },
      {
        when: 'reverted diacritic stress',
        output: ANSWER_OK,
        answer: 'ccccc',
        solution: '\nvariant1\nççççç\n',
        deactivations: {},
      },
      {
        when: 'punctuation stress',
        output: ANSWER_OK,
        answer: '.!p-u-n-c-t',
        solution: '\nvariant1\npunct\n',
        deactivations: {},
      },
      {
        when: 'reverted punctuation stress',
        output: ANSWER_OK,
        answer: 'punct',
        solution: '\nvariant1\n.!p-u-n-c-t\n',
        deactivations: {},
      },
      {
        when: 'levenshtein stress',
        output: ANSWER_OK,
        answer: '0123456789',
        solution: '\nvariant1\n123456789\n',
        deactivations: {},
      },
      {
        when: 'reverted levenshtein stress',
        output: ANSWER_OK,
        answer: '123456789',
        solution: '\nvariant1\n0123456789\n',
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
          escape(data.solution) +
          '"',
        function () {
          const solution = { value: data.solution, deactivations: data.deactivations };
          expect(service.match({ answer: data.answer, solution })).to.deep.equal(data.output);
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
        solution: '\nvariant1\nAnswer\n',
        deactivations: { t1: true },
      },
      {
        when: 'spaces stress',
        output: ANSWER_KO,
        answer: 'a b c d e',
        solution: '\nvariant1\nabcde\n',
        deactivations: { t1: true },
      },
      {
        when: 'reverted spaces stress',
        output: ANSWER_KO,
        answer: 'abcde',
        solution: '\nvariant1\na b c d e\n',
        deactivations: { t1: true },
      },
      {
        when: 'uppercase stress',
        output: ANSWER_KO,
        answer: 'ANSWER',
        solution: '\nvariant1\nanswer\n',
        deactivations: { t1: true },
      },
      {
        when: 'reverted uppercase stress',
        output: ANSWER_KO,
        answer: 'answer',
        solution: '\nvariant1\nANSWER\n',
        deactivations: { t1: true },
      },
      {
        when: 'accent stress',
        output: ANSWER_KO,
        answer: 'îàé êêê',
        solution: '\nvariant1\niae eee\n',
        deactivations: { t1: true },
      },
      {
        when: 'reverted accent stress',
        output: ANSWER_KO,
        answer: 'iae eee',
        solution: '\nvariant1\nîàé êêê\n',
        deactivations: { t1: true },
      },
      {
        when: 'diacritic stress',
        output: ANSWER_KO,
        answer: 'ççççç',
        solution: '\nvariant1\nccccc\n',
        deactivations: { t1: true },
      },
      {
        when: 'reverted diacritic stress',
        output: ANSWER_KO,
        answer: 'ccccc',
        solution: '\nvariant1\nççççç\n',
        deactivations: { t1: true },
      },
      {
        when: 'punctuation stress',
        output: ANSWER_OK,
        answer: '.!p-u-n-c-t',
        solution: '\nvariant1\npunct\n',
        deactivations: { t1: true },
      },
      {
        when: 'reverted punctuation stress',
        output: ANSWER_OK,
        answer: 'punct',
        solution: '\nvariant1\n.!p-u-n-c-t\n',
        deactivations: { t1: true },
      },
      {
        when: 'levenshtein stress',
        output: ANSWER_OK,
        answer: '0123456789',
        solution: '\nvariant1\n123456789\n',
        deactivations: { t1: true },
      },
      {
        when: 'reverted levenshtein stress',
        output: ANSWER_OK,
        answer: '123456789',
        solution: '\nvariant1\n0123456789\n',
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
          escape(data.solution) +
          '"',
        function () {
          const solution = { value: data.solution, deactivations: data.deactivations };
          expect(service.match({ answer: data.answer, solution })).to.deep.equal(data.output);
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
        solution: '\nvariant1\nAnswer\n',
        deactivations: { t2: true },
      },
      {
        when: 'spaces stress',
        output: ANSWER_OK,
        answer: 'a b c d e',
        solution: '\nvariant1\nabcde\n',
        deactivations: { t2: true },
      },
      {
        when: 'reverted spaces stress',
        output: ANSWER_OK,
        answer: 'abcde',
        solution: '\nvariant1\na b c d e\n',
        deactivations: { t2: true },
      },
      {
        when: 'uppercase stress',
        output: ANSWER_OK,
        answer: 'ANSWER',
        solution: '\nvariant1\nanswer\n',
        deactivations: { t2: true },
      },
      {
        when: 'reverted uppercase stress',
        output: ANSWER_OK,
        answer: 'answer',
        solution: '\nvariant1\nANSWER\n',
        deactivations: { t2: true },
      },
      {
        when: 'accent stress',
        output: ANSWER_OK,
        answer: 'îàé êêê',
        solution: '\nvariant1\niae eee\n',
        deactivations: { t2: true },
      },
      {
        when: 'reverted accent stress',
        output: ANSWER_OK,
        answer: 'iae eee',
        solution: '\nvariant1\nîàé êêê\n',
        deactivations: { t2: true },
      },
      {
        when: 'diacritic stress',
        output: ANSWER_OK,
        answer: 'ççççç',
        solution: '\nvariant1\nccccc\n',
        deactivations: { t2: true },
      },
      {
        when: 'reverted diacritic stress',
        output: ANSWER_OK,
        answer: 'ccccc',
        solution: '\nvariant1\nççççç\n',
        deactivations: { t2: true },
      },
      {
        when: 'punctuation stress',
        output: ANSWER_KO,
        answer: '.!p-u-n-c-t',
        solution: '\nvariant1\npunct\n',
        deactivations: { t2: true },
      },
      {
        when: 'reverted punctuation stress',
        output: ANSWER_KO,
        answer: 'punct',
        solution: '\nvariant1\n.!p-u-n-c-t\n',
        deactivations: { t2: true },
      },
      {
        when: 'levenshtein stress',
        output: ANSWER_OK,
        answer: '0123456789',
        solution: '\nvariant1\n123456789\n',
        deactivations: { t2: true },
      },
      {
        when: 'reverted levenshtein stress',
        output: ANSWER_OK,
        answer: '123456789',
        solution: '\nvariant1\n0123456789\n',
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
          escape(data.solution) +
          '"',
        function () {
          const solution = { value: data.solution, deactivations: data.deactivations };
          expect(service.match({ answer: data.answer, solution })).to.deep.equal(data.output);
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
        solution: '\nvariant1\nAnswer\n',
        deactivations: { t3: true },
      },
      {
        when: 'spaces stress',
        output: ANSWER_OK,
        answer: 'a b c d e',
        solution: '\nvariant1\nabcde\n',
        deactivations: { t3: true },
      },
      {
        when: 'reverted spaces stress',
        output: ANSWER_OK,
        answer: 'abcde',
        solution: '\nvariant1\na b c d e\n',
        deactivations: { t3: true },
      },
      {
        when: 'uppercase stress',
        output: ANSWER_OK,
        answer: 'ANSWER',
        solution: '\nvariant1\nanswer\n',
        deactivations: { t3: true },
      },
      {
        when: 'reverted uppercase stress',
        output: ANSWER_OK,
        answer: 'answer',
        solution: '\nvariant1\nANSWER\n',
        deactivations: { t3: true },
      },
      {
        when: 'accent stress',
        output: ANSWER_OK,
        answer: 'îàé êêê',
        solution: '\nvariant1\niae eee\n',
        deactivations: { t3: true },
      },
      {
        when: 'reverted accent stress',
        output: ANSWER_OK,
        answer: 'iae eee',
        solution: '\nvariant1\nîàé êêê\n',
        deactivations: { t3: true },
      },
      {
        when: 'diacritic stress',
        output: ANSWER_OK,
        answer: 'ççççç',
        solution: '\nvariant1\nccccc\n',
        deactivations: { t3: true },
      },
      {
        when: 'reverted diacritic stress',
        output: ANSWER_OK,
        answer: 'ccccc',
        solution: '\nvariant1\nççççç\n',
        deactivations: { t3: true },
      },
      {
        when: 'punctuation stress',
        output: ANSWER_OK,
        answer: '.!p-u-n-c-t',
        solution: '\nvariant1\npunct\n',
        deactivations: { t3: true },
      },
      {
        when: 'reverted punctuation stress',
        output: ANSWER_OK,
        answer: 'punct',
        solution: '\nvariant1\n.!p-u-n-c-t\n',
        deactivations: { t3: true },
      },
      {
        when: 'levenshtein stress',
        output: ANSWER_KO,
        answer: '0123456789',
        solution: '\nvariant1\n123456789\n',
        deactivations: { t3: true },
      },
      {
        when: 'reverted levenshtein stress',
        output: ANSWER_KO,
        answer: '123456789',
        solution: '\nvariant1\n0123456789\n',
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
          escape(data.solution) +
          '"',
        function () {
          const solution = { value: data.solution, deactivations: data.deactivations };
          expect(service.match({ answer: data.answer, solution })).to.deep.equal(data.output);
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
        solution: '\nvariant1\nAnswer\n',
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'spaces stress',
        output: ANSWER_KO,
        answer: 'a b c d e',
        solution: '\nvariant1\nabcde\n',
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'reverted spaces stress',
        output: ANSWER_KO,
        answer: 'abcde',
        solution: '\nvariant1\na b c d e\n',
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'uppercase stress',
        output: ANSWER_KO,
        answer: 'ANSWER',
        solution: '\nvariant1\nanswer\n',
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'reverted uppercase stress',
        output: ANSWER_KO,
        answer: 'answer',
        solution: '\nvariant1\nANSWER\n',
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'accent stress',
        output: ANSWER_KO,
        answer: 'îàé êêê',
        solution: '\nvariant1\niae eee\n',
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'reverted accent stress',
        output: ANSWER_KO,
        answer: 'iae eee',
        solution: '\nvariant1\nîàé êêê\n',
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'diacritic stress',
        output: ANSWER_KO,
        answer: 'ççççç',
        solution: '\nvariant1\nccccc\n',
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'reverted diacritic stress',
        output: ANSWER_KO,
        answer: 'ccccc',
        solution: '\nvariant1\nççççç\n',
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'punctuation stress',
        output: ANSWER_KO,
        answer: '.!p-u-n-c-t',
        solution: '\nvariant1\npunct\n',
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'reverted punctuation stress',
        output: ANSWER_KO,
        answer: 'punct',
        solution: '\nvariant1\n.!p-u-n-c-t\n',
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'levenshtein stress',
        output: ANSWER_OK,
        answer: '0123456789',
        solution: '\nvariant1\n123456789\n',
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'reverted levenshtein stress',
        output: ANSWER_OK,
        answer: '123456789',
        solution: '\nvariant1\n0123456789\n',
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
          escape(data.solution) +
          '"',
        function () {
          const solution = { value: data.solution, deactivations: data.deactivations };
          expect(service.match({ answer: data.answer, solution })).to.deep.equal(data.output);
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
        solution: '\nvariant1\nAnswer\n',
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'spaces stress',
        output: ANSWER_KO,
        answer: 'a b c d e',
        solution: '\nvariant1\nabcde\n',
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'reverted spaces stress',
        output: ANSWER_KO,
        answer: 'abcde',
        solution: '\nvariant1\na b c d e\n',
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'uppercase stress',
        output: ANSWER_KO,
        answer: 'ANSWER',
        solution: '\nvariant1\nanswer\n',
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'reverted uppercase stress',
        output: ANSWER_KO,
        answer: 'answer',
        solution: '\nvariant1\nANSWER\n',
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'accent stress',
        output: ANSWER_KO,
        answer: 'îàé êêê',
        solution: '\nvariant1\niae eee\n',
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'reverted accent stress',
        output: ANSWER_KO,
        answer: 'iae eee',
        solution: '\nvariant1\nîàé êêê\n',
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'diacritic stress',
        output: ANSWER_KO,
        answer: 'ççççç',
        solution: '\nvariant1\nccccc\n',
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'reverted diacritic stress',
        output: ANSWER_KO,
        answer: 'ccccc',
        solution: '\nvariant1\nççççç\n',
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'punctuation stress',
        output: ANSWER_OK,
        answer: '.!p-u-n-c-t',
        solution: '\nvariant1\npunct\n',
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'reverted punctuation stress',
        output: ANSWER_OK,
        answer: 'punct',
        solution: '\nvariant1\n.!p-u-n-c-t\n',
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'levenshtein stress',
        output: ANSWER_KO,
        answer: '0123456789',
        solution: '\nvariant1\n123456789\n',
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'reverted levenshtein stress',
        output: ANSWER_KO,
        answer: '123456789',
        solution: '\nvariant1\n0123456789\n',
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
          escape(data.solution) +
          '"',
        function () {
          const solution = { value: data.solution, deactivations: data.deactivations };
          expect(service.match({ answer: data.answer, solution })).to.deep.equal(data.output);
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
        solution: '\nvariant1\nAnswer\n',
        deactivations: { t2: true, t3: true },
      },
      {
        when: 'spaces stress',
        output: ANSWER_OK,
        answer: 'a b c d e',
        solution: '\nvariant1\nabcde\n',
        deactivations: { t2: true, t3: true },
      },
      {
        when: 'reverted spaces stress',
        output: ANSWER_OK,
        answer: 'abcde',
        solution: '\nvariant1\na b c d e\n',
        deactivations: { t2: true, t3: true },
      },
      {
        when: 'uppercase stress',
        output: ANSWER_OK,
        answer: 'ANSWER',
        solution: '\nvariant1\nanswer\n',
        deactivations: { t2: true, t3: true },
      },
      {
        when: 'reverted uppercase stress',
        output: ANSWER_OK,
        answer: 'answer',
        solution: '\nvariant1\nANSWER\n',
        deactivations: { t2: true, t3: true },
      },
      {
        when: 'accent stress',
        output: ANSWER_OK,
        answer: 'îàé êêê',
        solution: '\nvariant1\niae eee\n',
        deactivations: { t2: true, t3: true },
      },
      {
        when: 'reverted accent stress',
        output: ANSWER_OK,
        answer: 'iae eee',
        solution: '\nvariant1\nîàé êêê\n',
        deactivations: { t2: true, t3: true },
      },
      {
        when: 'diacritic stress',
        output: ANSWER_OK,
        answer: 'ççççç',
        solution: '\nvariant1\nccccc\n',
        deactivations: { t2: true, t3: true },
      },
      {
        when: 'reverted diacritic stress',
        output: ANSWER_OK,
        answer: 'ccccc',
        solution: '\nvariant1\nççççç\n',
        deactivations: { t2: true, t3: true },
      },
      {
        when: 'punctuation stress',
        output: ANSWER_KO,
        answer: '.!p-u-n-c-t',
        solution: '\nvariant1\npunct\n',
        deactivations: { t2: true, t3: true },
      },
      {
        when: 'reverted punctuation stress',
        output: ANSWER_KO,
        answer: 'punct',
        solution: '\nvariant1\n.!p-u-n-c-t\n',
        deactivations: { t2: true, t3: true },
      },
      {
        when: 'levenshtein stress',
        output: ANSWER_KO,
        answer: '0123456789',
        solution: '\nvariant1\n123456789\n',
        deactivations: { t2: true, t3: true },
      },
      {
        when: 'reverted levenshtein stress',
        output: ANSWER_KO,
        answer: '123456789',
        solution: '\nvariant1\n0123456789\n',
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
          escape(data.solution) +
          '"',
        function () {
          const solution = { value: data.solution, deactivations: data.deactivations };
          expect(service.match({ answer: data.answer, solution })).to.deep.equal(data.output);
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
        solution: '\nvariant1\nAnswer\n',
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'spaces stress',
        output: ANSWER_KO,
        answer: 'a b c d e',
        solution: '\nvariant1\nabcde\n',
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'reverted spaces stress',
        output: ANSWER_KO,
        answer: 'abcde',
        solution: '\nvariant1\na b c d e\n',
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'uppercase stress',
        output: ANSWER_KO,
        answer: 'ANSWER',
        solution: '\nvariant1\nanswer\n',
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'reverted uppercase stress',
        output: ANSWER_KO,
        answer: 'answer',
        solution: '\nvariant1\nANSWER\n',
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'accent stress',
        output: ANSWER_KO,
        answer: 'îàé êêê',
        solution: '\nvariant1\niae eee\n',
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'reverted accent stress',
        output: ANSWER_KO,
        answer: 'iae eee',
        solution: '\nvariant1\nîàé êêê\n',
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'diacritic stress',
        output: ANSWER_KO,
        answer: 'ççççç',
        solution: '\nvariant1\nccccc\n',
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'reverted diacritic stress',
        output: ANSWER_KO,
        answer: 'ccccc',
        solution: '\nvariant1\nççççç\n',
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'punctuation stress',
        output: ANSWER_KO,
        answer: '.!p-u-n-c-t',
        solution: '\nvariant1\npunct\n',
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'reverted punctuation stress',
        output: ANSWER_KO,
        answer: 'punct',
        solution: '\nvariant1\n.!p-u-n-c-t\n',
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'levenshtein stress',
        output: ANSWER_KO,
        answer: '0123456789',
        solution: '\nvariant1\n123456789\n',
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'reverted levenshtein stress',
        output: ANSWER_KO,
        answer: '123456789',
        solution: '\nvariant1\n0123456789\n',
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
          escape(data.solution) +
          '"',
        function () {
          const solution = { value: data.solution, deactivations: data.deactivations };
          expect(service.match({ answer: data.answer, solution })).to.deep.equal(data.output);
        },
      );
    });
  });

  describe('match with the type select for the QROC', function () {
    const successfulCases = [
      { case: 'Same answer and solution', answer: 'Answer', solution: 'Answer', output: ANSWER_OK },
      {
        case: 'Same answer and solution, but answer is lowercased, solution is uppercased',
        answer: 'answer',
        solution: 'ANSWER',
        output: ANSWER_KO,
      },
      { case: 'answer with spaces, solution hasnt', answer: 'a b c d e', solution: 'abcde', output: ANSWER_KO },
      {
        case: 'answer with unbreakable spaces, solution hasnt',
        answer: 'a b c d e',
        solution: 'abcde',
        output: ANSWER_KO,
      },
      {
        case: 'answer without punctuation, but solution has',
        answer: ',.!p-u-n-c-t',
        solution: 'punct',
        output: ANSWER_KO,
      },
      {
        case: '(multiple solutions) answer is amongst solution',
        answer: 'variant 1',
        solution: 'variant 1\nvariant 2\nvariant 3\n',
        output: ANSWER_OK,
      },
      {
        case: '(multiple solutions) answer is 0.2 away from the closest solution',
        answer: 'quack',
        solution: 'quacks\nazertysqdf\nblablabla\n',
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
          escape(data.solution) +
          '"',
        function () {
          const solution = {
            value: data.solution,
            deactivations: data.deactivations,
            qrocBlocksTypes: { rep: 'select' },
          };
          expect(service.match({ answer: data.answer, solution })).to.deep.equal(data.output);
        },
      );
    });
  });
});
