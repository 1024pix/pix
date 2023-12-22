import { expect, catchErr } from '../../../../test-helper.js';
import { AnswerStatus } from '../../../../../src/shared/domain/models/AnswerStatus.js';
import * as service from '../../../../../src/devcomp/domain/services/solution-service-qrocm-ind.js';

const ANSWER_OK = AnswerStatus.OK;
const ANSWER_KO = AnswerStatus.KO;

describe('Unit | Devcomp | Domain | Service | SolutionServiceQROCM-ind ', function () {
  describe('#_applyTreatmentsToSolutions(solutions, enabledTreatments)', function () {
    it('t1 and t2 should be executed (lowerCase, trim, breaking space)', function () {
      // given
      const solutions = { '3lettres': ['OUI', 'NON   '], '4lettres': ['Good', 'Bad'] };
      const expected = { '3lettres': ['oui', 'non'], '4lettres': ['good', 'bad'] };
      const enabledTreatments = ['t1', 't2'];
      // when
      const actual = service._applyTreatmentsToSolutions(solutions, enabledTreatments);
      // then
      expect(actual).to.deep.equal(expected);
    });
  });

  describe('#_applyTreatmentsToAnswers(answers, enabledTreatments)', function () {
    it('should be transformed in string', function () {
      // given
      const answers = { Num1: 1, Num2: 2 };
      const expected = { Num1: '1', Num2: '2' };
      const enabledTreatments = ['t1', 't2'];
      // when
      const actual = service._applyTreatmentsToAnswers(answers, enabledTreatments);
      // then
      expect(actual).to.deep.equal(expected);
    });

    it('should be transformed', function () {
      // given
      const answers = { Num1: 1, Num2: 2 };
      const expected = { Num1: '1', Num2: '2' };
      const enabledTreatments = [];
      // when
      const actual = service._applyTreatmentsToAnswers(answers, enabledTreatments);
      // then
      expect(actual).to.deep.equal(expected);
    });
  });

  describe('#_compareAnswersAndSolutions', function () {
    it('should return results comparing answers and solutions strictly when T3 is disabled', function () {
      // given
      const answers = { Num1: '1', Num2: '3' };
      const solutions = { Num1: ['1', 'un', '01'], Num2: ['2', 'deux', '02'] };
      const allTreatmentsDisabled = [];

      // when
      const actual = service._compareAnswersAndSolutions(answers, solutions, allTreatmentsDisabled);

      // then
      const expected = { Num1: true, Num2: false };
      expect(actual).to.deep.equal(expected);
    });

    it('should return results comparing answers and solutions with Levenshtein ratio when T3 is enabled', function () {
      // given
      const answers = { phrase1: "Le silence est d'ours", phrase2: 'faceboo', phrase3: 'lasagne' };
      const solutions = { phrase1: ["Le silence est d'or"], phrase2: ['facebook'], phrase3: ['engasal'] };
      const t3TreatmentEnabled = ['t3'];

      // when
      const actual = service._compareAnswersAndSolutions(answers, solutions, t3TreatmentEnabled);

      // then
      const expected = { phrase1: true, phrase2: true, phrase3: false };
      expect(actual).to.deep.equal(expected);
    });

    it('should throw an error if there is no solutions for one input but answers', async function () {
      // given
      const answers = { phraseSansSolution: 'lasagne', phrase1: "Le silence est d'ours", phrase2: 'facebook' };
      const solutions = { phrase1: ["Le silence est d'or"], phrase2: ['facebook'] };
      const enabledTreatments = ['t3'];

      // when
      const error = await catchErr(service._compareAnswersAndSolutions)(answers, solutions, enabledTreatments);

      // then
      expect(error).to.be.an.instanceOf(Error);
      expect(error.message).to.equal("Une erreur s'est produite lors de l'interprétation des réponses.");
    });
  });

  describe('#_formatResult', function () {
    it('should return "ko"', function () {
      // given
      const resultDetails = { phrase1: true, phrase2: false, phrase3: true };

      // when
      const actual = service._formatResult(resultDetails);

      // then
      expect(actual).to.deep.equal(AnswerStatus.KO);
    });
    it('should return "ok"', function () {
      // given
      const resultDetails = { phrase1: true, phrase2: true, phrase3: true };

      // when
      const actual = service._formatResult(resultDetails);

      // then
      expect(actual).to.deep.equal(AnswerStatus.OK);
    });
  });

  describe('Nominal and weird, combined cases', function () {
    const successfulCases = [
      {
        case: '(nominal case) Each answer strictly respect a corresponding solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'tomate' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'solution contains numbers',
        output: { result: ANSWER_OK, resultDetails: { num1: true, num2: true } },
        answer: { num1: '888', num2: '64' },
        solution: { num1: ['888'], num2: ['64'] },
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'solution contains decimal numbers with a comma',
        output: { result: ANSWER_OK, resultDetails: { num1: true, num2: true } },
        answer: { num1: '888,00', num2: '64' },
        solution: { num1: ['888,00'], num2: ['64'] },
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'solution contains decimal numbers with a dot',
        output: { result: ANSWER_OK, resultDetails: { num1: true, num2: true } },
        answer: { num1: '888.00', num2: '64' },
        solution: { num1: ['888.00'], num2: ['64'] },
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'leading/trailing spaces in solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'c o u r g e t t e', '6lettres': 't o m a t e' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'uppercases and leading/trailing spaces in solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'c o u r g e t t e', '6lettres': 't o m a t e' },
        solution: { '9lettres': ['COUrgETTE'], '6lettres': ['TOmaTE', 'CHICON', 'LEGUME'] },
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'spaces in answer',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'c o u r g e t t e', '6lettres': 't o m a t e' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'answer with levenshtein distance below 0.25',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'ourgette', '6lettres': 'tomae' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'answer with uppercases',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'COURGETTE', '6lettres': 'TOMATE' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'answer with uppercases and spaces',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'C O U R G E T T E', '6lettres': 'T O M A T E' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'answer with uppercases spaces, and levenshtein > 0 but <= 0.25',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'C O U G E T T E', '6lettres': ' O M A T E' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'answer with uppercases spaces, and levenshtein > 0 but <= 0.25, and accents',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'ç O u -- ;" ;--- _ \' grè TTÊ', '6lettres': ' O M A T E' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'unbreakable spaces in answer',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'c o u r g e t t e', '6lettres': ' t o m a t e' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'Solution has spaces in-between',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'abcdefg', '6lettres': 'ghjkl' },
        solution: { '9lettres': ['a b c d e f g'], '6lettres': ['ghjklm', 'ghjklp', 'ghjklz'] },
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: '(nominal case) Each answer strictly respect another corresponding solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'patate', '6lettres': 'legume' },
        solution: { '9lettres': ['courgette ', 'patate'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'Each answer correctly match its solution, with worst levenshtein distance below or equal to 0.25',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'abcd', '6lettres': 'ghjkl' },
        solution: { '9lettres': ['abcde'], '6lettres': ['ghjklm', 'ghjklp', 'ghjklz'] },
        enabledTreatments: ['t1', 't2', 't3'],
      },
    ];
    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    successfulCases.forEach(function (testCase) {
      it(
        testCase.case +
          ', should return "ok" when answer is "' +
          testCase.answer +
          '" and solution is "' +
          escape(testCase.solution) +
          '"',
        function () {
          const solution = { value: testCase.solution, enabledTreatments: testCase.enabledTreatments };
          expect(service.match({ answerValue: testCase.answer, solution })).to.deep.equal(testCase.output);
        },
      );
    });

    const failingCases = [
      {
        case: 'solution do not exists',
        output: { result: ANSWER_KO },
        answer: 'any answer',
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'solution is empty',
        output: { result: ANSWER_KO },
        answer: '',
        solution: '',
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'answer is not a valid object',
        output: { result: ANSWER_KO },
        answer: new Date(),
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'solution is not a valid object',
        output: { result: ANSWER_KO },
        answer: { '9lettres': 'tomate', '6lettres': 'courgette' },
        solution: new Date(),
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'Each answer points to the solution of another question',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': false, '6lettres': false } },
        answer: { '9lettres': 'tomate', '6lettres': 'courgette' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'One of the levenshtein distance is above 0.25',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': false, '6lettres': true } },
        answer: { '9lettres': 'abcde', '6lettres': 'ghjkl' },
        //abcdefg below creates a levenshtein distance above 0.25
        solution: { '9lettres': ['abcdefg'], '6lettres': ['ghjklm', 'ghjklp', 'ghjklz'] },
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'All of the levenshtein distances are above 0.25',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': false, '6lettres': false } },
        answer: { '9lettres': 'abcde', '6lettres': 'ghjklpE11!!' },
        solution: { '9lettres': ['abcdefg'], '6lettres': ['ghjklm', 'ghjklp', 'ghjklz'] },
        enabledTreatments: ['t1', 't2', 't3'],
      },
    ];
    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    failingCases.forEach(function (testCase) {
      it(
        testCase.case +
          ', should return "ko" when answer is "' +
          testCase.answer +
          '" and solution is "' +
          escape(testCase.solution) +
          '"',
        function () {
          const solution = { value: testCase.solution, enabledTreatments: testCase.enabledTreatments };
          expect(service.match({ answerValue: testCase.answer, solution })).to.deep.equal(testCase.output);
        },
      );
    });
  });

  describe('match, strong focus on treatments', function () {
    // it('when solution value is not an array, should throw an error', async function () {
    //   const answer = { dossier1: 'a' };
    //   const solutionValue = {
    //     dossier1: 'Eureka',
    //   };
    //   const enabledTreatments = ['t1', 't2', 't3'];
    //   const solution = { value: solutionValue, enabledTreatments };
    //
    //   const error = await catchErr(service.match)({ answerValue: answer, solution });
    //
    //   expect(error).to.be.an.instanceOf(Error);
    //   expect(error.message).to.equal("Une erreur s'est produite lors de l'interprétation des réponses.");
    // });

    const allCases = [
      {
        when: 'answer match exactly with a solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'chicon' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        when: 'spaces treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'c h i c o n' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        when: 'spaces treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'chicon' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'c h i c o n', 'legume'] },
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        when: 'uppercase treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'CHICON' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        when: 'uppercase treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'chicon' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'CHICON', 'legume'] },
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        when: 'accent treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'îàéùô' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'iaeuo', 'legume'] },
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        when: 'accent treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'iaeuo' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'îàéùô', 'legume'] },
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        when: 'diacritic treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'ççççç' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'ccccc', 'legume'] },
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        when: 'diacritic treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'ccccc' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'ççççç', 'legume'] },
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        when: 'punctuation treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': '.!p-u-n-c-t' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'punct', 'legume'] },
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        when: 'punctuation treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'punct' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', '.!p-u-n-c-t', 'legume'] },
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        when: 'levenshtein treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': '0123456789' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', '123456789', 'legume'] },
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        when: 'levenshtein treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': '123456789' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', '0123456789', 'legume'] },
        enabledTreatments: ['t1', 't2', 't3'],
      },
    ];

    // eslint-disable-next-line mocha/no-setup-in-describe
    allCases.forEach(function (testCase) {
      it(
        testCase.when +
          ', should return ' +
          JSON.stringify(testCase.output) +
          ' when answer is "' +
          JSON.stringify(testCase.answer) +
          '" and solution is "' +
          JSON.stringify(testCase.solution) +
          '"',
        function () {
          const solution = { value: testCase.solution, enabledTreatments: testCase.enabledTreatments };
          expect(service.match({ answerValue: testCase.answer, solution })).to.deep.equal(testCase.output);
        },
      );
    });
  });

  describe('match, t1 deactivated', function () {
    const allCases = [
      {
        when: 'answer match exactly with a solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'chicon' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t2', 't3'],
      },
      {
        when: 'spaces treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'c h i c o n' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t2', 't3'],
      },
      {
        when: 'spaces treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'chicon' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'c h i c o n', 'legume'] },
        enabledTreatments: ['t2', 't3'],
      },
      {
        when: 'uppercase treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'CHICON' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t2', 't3'],
      },
      {
        when: 'uppercase treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'chicon' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'CHICON', 'legume'] },
        enabledTreatments: ['t2', 't3'],
      },
      {
        when: 'accent treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'îàéùô' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'iaeuo', 'legume'] },
        enabledTreatments: ['t2', 't3'],
      },
      {
        when: 'accent treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'iaeuo' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'îàéùô', 'legume'] },
        enabledTreatments: ['t2', 't3'],
      },
      {
        when: 'diacritic treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'ççççç' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'ccccc', 'legume'] },
        enabledTreatments: ['t2', 't3'],
      },
      {
        when: 'diacritic treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'ccccc' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'ççççç', 'legume'] },
        enabledTreatments: ['t2', 't3'],
      },
      {
        when: 'punctuation treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': '.!p-u-n-c-t' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'punct', 'legume'] },
        enabledTreatments: ['t2', 't3'],
      },
      {
        when: 'punctuation treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'punct' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', '.!p-u-n-c-t', 'legume'] },
        enabledTreatments: ['t2', 't3'],
      },
      {
        when: 'levenshtein treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': '0123456789' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', '123456789', 'legume'] },
        enabledTreatments: ['t2', 't3'],
      },
      {
        when: 'levenshtein treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': '123456789' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', '0123456789', 'legume'] },
        enabledTreatments: ['t2', 't3'],
      },
    ];

    // eslint-disable-next-line mocha/no-setup-in-describe
    allCases.forEach(function (testCase) {
      it(
        testCase.when +
          ', should return ' +
          JSON.stringify(testCase.output) +
          ' when answer is "' +
          JSON.stringify(testCase.answer) +
          '" and solution is "' +
          JSON.stringify(testCase.solution) +
          '"',
        function () {
          const solution = { value: testCase.solution, enabledTreatments: testCase.enabledTreatments };
          expect(service.match({ answerValue: testCase.answer, solution })).to.deep.equal(testCase.output);
        },
      );
    });
  });

  describe('match, t2 deactivated', function () {
    const allCases = [
      {
        when: 'answer match exactly with a solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'chicon' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t1', 't3'],
      },
      {
        when: 'spaces treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'c h i c o n' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t1', 't3'],
      },
      {
        when: 'spaces treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'chicon' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'c h i c o n', 'legume'] },
        enabledTreatments: ['t1', 't3'],
      },
      {
        when: 'uppercase treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'CHICON' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t1', 't3'],
      },
      {
        when: 'uppercase treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'chicon' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'CHICON', 'legume'] },
        enabledTreatments: ['t1', 't3'],
      },
      {
        when: 'accent treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'îàéùô' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'iaeuo', 'legume'] },
        enabledTreatments: ['t1', 't3'],
      },
      {
        when: 'accent treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'iaeuo' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'îàéùô', 'legume'] },
        enabledTreatments: ['t1', 't3'],
      },
      {
        when: 'diacritic treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'ççççç' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'ccccc', 'legume'] },
        enabledTreatments: ['t1', 't3'],
      },
      {
        when: 'diacritic treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'ccccc' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'ççççç', 'legume'] },
        enabledTreatments: ['t1', 't3'],
      },
      {
        when: 'punctuation treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': '.!p-u-n-c-t' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'punct', 'legume'] },
        enabledTreatments: ['t1', 't3'],
      },
      {
        when: 'punctuation treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'punct' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', '.!p-u-n-c-t', 'legume'] },
        enabledTreatments: ['t1', 't3'],
      },
      {
        when: 'levenshtein treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': '0123456789' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', '123456789', 'legume'] },
        enabledTreatments: ['t1', 't3'],
      },
      {
        when: 'levenshtein treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': '123456789' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', '0123456789', 'legume'] },
        enabledTreatments: ['t1', 't3'],
      },
    ];

    // eslint-disable-next-line mocha/no-setup-in-describe
    allCases.forEach(function (testCase) {
      it(
        testCase.when +
          ', should return ' +
          JSON.stringify(testCase.output) +
          ' when answer is "' +
          JSON.stringify(testCase.answer) +
          '" and solution is "' +
          JSON.stringify(testCase.solution) +
          '"',
        function () {
          const solution = { value: testCase.solution, enabledTreatments: testCase.enabledTreatments };
          expect(service.match({ answerValue: testCase.answer, solution })).to.deep.equal(testCase.output);
        },
      );
    });
  });

  describe('match, t3 deactivated', function () {
    const allCases = [
      {
        when: 'answer match exactly with a solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'chicon' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t1', 't2'],
      },
      {
        when: 'spaces treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'c h i c o n' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t1', 't2'],
      },
      {
        when: 'spaces treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'chicon' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'c h i c o n', 'legume'] },
        enabledTreatments: ['t1', 't2'],
      },
      {
        when: 'uppercase treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'CHICON' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t1', 't2'],
      },
      {
        when: 'uppercase treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'chicon' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'CHICON', 'legume'] },
        enabledTreatments: ['t1', 't2'],
      },
      {
        when: 'accent treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'îàéùô' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'iaeuo', 'legume'] },
        enabledTreatments: ['t1', 't2'],
      },
      {
        when: 'accent treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'iaeuo' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'îàéùô', 'legume'] },
        enabledTreatments: ['t1', 't2'],
      },
      {
        when: 'diacritic treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'ççççç' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'ccccc', 'legume'] },
        enabledTreatments: ['t1', 't2'],
      },
      {
        when: 'diacritic treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'ccccc' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'ççççç', 'legume'] },
        enabledTreatments: ['t1', 't2'],
      },
      {
        when: 'punctuation treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': '.!p-u-n-c-t' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'punct', 'legume'] },
        enabledTreatments: ['t1', 't2'],
      },
      {
        when: 'punctuation treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'punct' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', '.!p-u-n-c-t', 'legume'] },
        enabledTreatments: ['t1', 't2'],
      },
      {
        when: 'levenshtein treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': '0123456789' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', '123456789', 'legume'] },
        enabledTreatments: ['t1', 't2'],
      },
      {
        when: 'levenshtein treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': '123456789' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', '0123456789', 'legume'] },
        enabledTreatments: ['t1', 't2'],
      },
    ];

    // eslint-disable-next-line mocha/no-setup-in-describe
    allCases.forEach(function (testCase) {
      it(
        testCase.when +
          ', should return ' +
          JSON.stringify(testCase.output) +
          ' when answer is "' +
          JSON.stringify(testCase.answer) +
          '" and solution is "' +
          JSON.stringify(testCase.solution) +
          '"',
        function () {
          const solution = { value: testCase.solution, enabledTreatments: testCase.enabledTreatments };
          expect(service.match({ answerValue: testCase.answer, solution })).to.deep.equal(testCase.output);
        },
      );
    });
  });

  describe('match, t1 and t2 deactivated', function () {
    const allCases = [
      {
        when: 'answer match exactly with a solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'chicon' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t3'],
      },
      {
        when: 'spaces treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'c h i c o n' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t3'],
      },
      {
        when: 'spaces treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'chicon' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'c h i c o n', 'legume'] },
        enabledTreatments: ['t3'],
      },
      {
        when: 'uppercase treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'CHICON' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t3'],
      },
      {
        when: 'uppercase treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'chicon' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'CHICON', 'legume'] },
        enabledTreatments: ['t3'],
      },
      {
        when: 'accent treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'îàéùô' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'iaeuo', 'legume'] },
        enabledTreatments: ['t3'],
      },
      {
        when: 'accent treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'iaeuo' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'îàéùô', 'legume'] },
        enabledTreatments: ['t3'],
      },
      {
        when: 'diacritic treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'ççççç' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'ccccc', 'legume'] },
        enabledTreatments: ['t3'],
      },
      {
        when: 'diacritic treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'ccccc' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'ççççç', 'legume'] },
        enabledTreatments: ['t3'],
      },
      {
        when: 'punctuation treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': '.!p-u-n-c-t' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'punct', 'legume'] },
        enabledTreatments: ['t3'],
      },
      {
        when: 'punctuation treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'punct' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', '.!p-u-n-c-t', 'legume'] },
        enabledTreatments: ['t3'],
      },
      {
        when: 'levenshtein treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': '0123456789' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', '123456789', 'legume'] },
        enabledTreatments: ['t3'],
      },
      {
        when: 'levenshtein treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': '123456789' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', '0123456789', 'legume'] },
        enabledTreatments: ['t3'],
      },
    ];

    // eslint-disable-next-line mocha/no-setup-in-describe
    allCases.forEach(function (testCase) {
      it(
        testCase.when +
          ', should return ' +
          JSON.stringify(testCase.output) +
          ' when answer is "' +
          JSON.stringify(testCase.answer) +
          '" and solution is "' +
          JSON.stringify(testCase.solution) +
          '"',
        function () {
          const solution = { value: testCase.solution, enabledTreatments: testCase.enabledTreatments };
          expect(service.match({ answerValue: testCase.answer, solution })).to.deep.equal(testCase.output);
        },
      );
    });
  });

  describe('match, t1 and t3 deactivated', function () {
    const allCases = [
      {
        when: 'answer match exactly with a solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'chicon' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t2'],
      },
      {
        when: 'spaces treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'c h i c o n' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t2'],
      },
      {
        when: 'spaces treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'chicon' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'c h i c o n', 'legume'] },
        enabledTreatments: ['t2'],
      },
      {
        when: 'uppercase treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'CHICON' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t2'],
      },
      {
        when: 'uppercase treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'chicon' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'CHICON', 'legume'] },
        enabledTreatments: ['t2'],
      },
      {
        when: 'accent treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'îàéùô' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'iaeuo', 'legume'] },
        enabledTreatments: ['t2'],
      },
      {
        when: 'accent treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'iaeuo' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'îàéùô', 'legume'] },
        enabledTreatments: ['t2'],
      },
      {
        when: 'diacritic treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'ççççç' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'ccccc', 'legume'] },
        enabledTreatments: ['t2'],
      },
      {
        when: 'diacritic treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'ccccc' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'ççççç', 'legume'] },
        enabledTreatments: ['t2'],
      },
      {
        when: 'punctuation treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': '.!p-u-n-c-t' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'punct', 'legume'] },
        enabledTreatments: ['t2'],
      },
      {
        when: 'punctuation treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'punct' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', '.!p-u-n-c-t', 'legume'] },
        enabledTreatments: ['t2'],
      },
      {
        when: 'levenshtein treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': '0123456789' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', '123456789', 'legume'] },
        enabledTreatments: ['t2'],
      },
      {
        when: 'levenshtein treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': '123456789' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', '0123456789', 'legume'] },
        enabledTreatments: ['t2'],
      },
    ];

    // eslint-disable-next-line mocha/no-setup-in-describe
    allCases.forEach(function (testCase) {
      it(
        testCase.when +
          ', should return ' +
          JSON.stringify(testCase.output) +
          ' when answer is "' +
          JSON.stringify(testCase.answer) +
          '" and solution is "' +
          JSON.stringify(testCase.solution) +
          '"',
        function () {
          const solution = { value: testCase.solution, enabledTreatments: testCase.enabledTreatments };
          expect(service.match({ answerValue: testCase.answer, solution })).to.deep.equal(testCase.output);
        },
      );
    });
  });

  describe('match, t2 and t3 deactivated', function () {
    const allCases = [
      {
        when: 'answer match exactly with a solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'chicon' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t1'],
      },
      {
        when: 'spaces treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'c h i c o n' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t1'],
      },
      {
        when: 'spaces treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'chicon' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'c h i c o n', 'legume'] },
        enabledTreatments: ['t1'],
      },
      {
        when: 'uppercase treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'CHICON' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t1'],
      },
      {
        when: 'uppercase treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'chicon' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'CHICON', 'legume'] },
        enabledTreatments: ['t1'],
      },
      {
        when: 'accent treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'îàéùô' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'iaeuo', 'legume'] },
        enabledTreatments: ['t1'],
      },
      {
        when: 'accent treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'iaeuo' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'îàéùô', 'legume'] },
        enabledTreatments: ['t1'],
      },
      {
        when: 'diacritic treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'ççççç' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'ccccc', 'legume'] },
        enabledTreatments: ['t1'],
      },
      {
        when: 'diacritic treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'ccccc' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'ççççç', 'legume'] },
        enabledTreatments: ['t1'],
      },
      {
        when: 'punctuation treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': '.!p-u-n-c-t' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'punct', 'legume'] },
        enabledTreatments: ['t1'],
      },
      {
        when: 'punctuation treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'punct' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', '.!p-u-n-c-t', 'legume'] },
        enabledTreatments: ['t1'],
      },
      {
        when: 'levenshtein treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': '0123456789' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', '123456789', 'legume'] },
        enabledTreatments: ['t1'],
      },
      {
        when: 'levenshtein treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': '123456789' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', '0123456789', 'legume'] },
        enabledTreatments: ['t1'],
      },
    ];

    // eslint-disable-next-line mocha/no-setup-in-describe
    allCases.forEach(function (testCase) {
      it(
        testCase.when +
          ', should return ' +
          JSON.stringify(testCase.output) +
          ' when answer is "' +
          JSON.stringify(testCase.answer) +
          '" and solution is "' +
          JSON.stringify(testCase.solution) +
          '"',
        function () {
          const solution = { value: testCase.solution, enabledTreatments: testCase.enabledTreatments };
          expect(service.match({ answerValue: testCase.answer, solution })).to.deep.equal(testCase.output);
        },
      );
    });
  });

  describe('match, t1, t2 and t3 deactivated', function () {
    const allCases = [
      {
        when: 'answer match exactly with a solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'chicon' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: [],
      },
      {
        when: 'spaces treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'c h i c o n' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: [],
      },
      {
        when: 'spaces treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'chicon' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'c h i c o n', 'legume'] },
        enabledTreatments: [],
      },
      {
        when: 'uppercase treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'CHICON' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: [],
      },
      {
        when: 'uppercase treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'chicon' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'CHICON', 'legume'] },
        enabledTreatments: [],
      },
      {
        when: 'accent treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'îàéùô' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'iaeuo', 'legume'] },
        enabledTreatments: [],
      },
      {
        when: 'accent treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'iaeuo' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'îàéùô', 'legume'] },
        enabledTreatments: [],
      },
      {
        when: 'diacritic treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'ççççç' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'ccccc', 'legume'] },
        enabledTreatments: [],
      },
      {
        when: 'diacritic treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'ccccc' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'ççççç', 'legume'] },
        enabledTreatments: [],
      },
      {
        when: 'punctuation treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': '.!p-u-n-c-t' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'punct', 'legume'] },
        enabledTreatments: [],
      },
      {
        when: 'punctuation treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': 'punct' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', '.!p-u-n-c-t', 'legume'] },
        enabledTreatments: [],
      },
      {
        when: 'levenshtein treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': '0123456789' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', '123456789', 'legume'] },
        enabledTreatments: [],
      },
      {
        when: 'levenshtein treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: { '9lettres': 'courgette', '6lettres': '123456789' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', '0123456789', 'legume'] },
        enabledTreatments: [],
      },
    ];

    // eslint-disable-next-line mocha/no-setup-in-describe
    allCases.forEach(function (testCase) {
      it(
        testCase.when +
          ', should return ' +
          JSON.stringify(testCase.output) +
          ' when answer is "' +
          JSON.stringify(testCase.answer) +
          '" and solution is "' +
          JSON.stringify(testCase.solution) +
          '"',
        function () {
          const solution = { value: testCase.solution, enabledTreatments: testCase.enabledTreatments };
          expect(service.match({ answerValue: testCase.answer, solution })).to.deep.equal(testCase.output);
        },
      );
    });
  });

  context('One of the qroc is a select qroc', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      {
        case: 'T3 does not work on select qroc but always on text qroc',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': false, '6lettres': true } },
        answer: { '9lettres': 'courgetta', '6lettres': 'tomato' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t3'],
        qrocBlocksTypes: { '9lettres': 'select', '6lettres': 'text' },
      },
      {
        case: 'T1 does not work on select qroc but always on text qroc',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': false, '6lettres': true } },
        answer: { '9lettres': 'COURGETTE', '6lettres': 'TOMATE' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t1'],
        qrocBlocksTypes: { '9lettres': 'select', '6lettres': 'text' },
      },
      {
        case: 'T2 does not work on select qroc but always on text qroc',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': false, '6lettres': true } },
        answer: { '9lettres': 'courgette&&&', '6lettres': 'tomate&&&' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t2'],
        qrocBlocksTypes: { '9lettres': 'select', '6lettres': 'text' },
      },
      {
        case: 'With T1,T2,T3 activated, the answer should be the same',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'courgette', '6lettres': 'TOMATO&&' },
        solution: { '9lettres': ['courgette'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t1', 't2', 't3'],
        qrocBlocksTypes: { '9lettres': 'select', '6lettres': 'text' },
      },
      {
        case: 'With T1,T2,T3 activated, the qroc select should be the same with special char',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: { '9lettres': 'Courgette&**', '6lettres': 'TOMATO&&' },
        solution: { '9lettres': ['Courgette&**'], '6lettres': ['tomate', 'chicon', 'legume'] },
        enabledTreatments: ['t1', 't2', 't3'],
        qrocBlocksTypes: { '9lettres': 'select', '6lettres': 'text' },
      },
    ].forEach(function (testCase) {
      it(
        testCase.case +
          ', should return ' +
          JSON.stringify(testCase.output.result) +
          ' when answer is "' +
          JSON.stringify(testCase.answer) +
          '" and solution is "' +
          JSON.stringify(testCase.solution) +
          '"',
        function () {
          const solution = {
            value: testCase.solution,
            enabledTreatments: testCase.enabledTreatments,
            qrocBlocksTypes: testCase.qrocBlocksTypes,
          };
          expect(service.match({ answerValue: testCase.answer, solution })).to.deep.equal(testCase.output);
        },
      );
    });
  });
});
