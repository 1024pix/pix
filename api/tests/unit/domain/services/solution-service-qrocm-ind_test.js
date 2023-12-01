import { expect, catchErr } from '../../../test-helper.js';
import { AnswerStatus } from '../../../../src/school/domain/models/AnswerStatus.js';
import * as service from '../../../../lib/domain/services/solution-service-qrocm-ind.js';
import { YamlParsingError } from '../../../../lib/domain/errors.js';

const ANSWER_OK = AnswerStatus.OK;
const ANSWER_KO = AnswerStatus.KO;

describe('Unit | Service | SolutionServiceQROCM-ind ', function () {
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
      expect(error).to.be.an.instanceOf(YamlParsingError);
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
        answer: '9lettres: courgette\n6lettres: tomate',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume',
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'solution contains numbers',
        output: { result: ANSWER_OK, resultDetails: { num1: true, num2: true } },
        answer: 'num1: 888\nnum2: 64',
        solution: 'num1:\n- 888\nnum2:\n- 64',
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'solution contains decimal numbers with a comma',
        output: { result: ANSWER_OK, resultDetails: { num1: true, num2: true } },
        answer: 'num1: "888,00"\nnum2: 64',
        solution: 'num1:\n- 888,00\nnum2:\n- 64',
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'solution contains decimal numbers with a dot',
        output: { result: ANSWER_OK, resultDetails: { num1: true, num2: true } },
        answer: 'num1: "888.00"\nnum2: 64',
        solution: 'num1:\n- 888.00\nnum2:\n- 64',
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'leading/trailing spaces in solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: c o u r g e t t e\n6lettres: t o m a t e',
        solution: '9lettres:\n-  courgette   \n6lettres:\n-   tomate    \n-   chicon    \n- legume   ',
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'uppercases and leading/trailing spaces in solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: c o u r g e t t e\n6lettres: t o m a t e',
        solution: '9lettres:\n-  COUrgETTE   \n6lettres:\n-   TOmaTE    \n-   CHICON    \n- LEGUME   ',
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'spaces in answer',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: c o u r g e t t e\n6lettres: t o m a t e',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume',
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'answer with levenshtein distance below 0.25',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: ourgette\n6lettres: tomae',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume',
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'answer with uppercases',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: COURGETTE\n6lettres: TOMATE',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume',
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'answer with uppercases and spaces',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: C O U R G E T T E\n6lettres: T O M A T E',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume',
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'answer with uppercases spaces, and levenshtein > 0 but <= 0.25',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: C O U G E T T E\n6lettres:  O M A T E',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume',
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'answer with uppercases spaces, and levenshtein > 0 but <= 0.25, and accents',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: ç O u -- ;" ;--- _ \' grè TTÊ\n6lettres:  O M A T E',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume',
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'unbreakable spaces in answer',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: c o u r g e t t e\n6lettres: t o m a t e',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume',
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'Solution has spaces in-between',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: abcdefg\n6lettres: ghjkl',
        solution: '9lettres:\n- a b c d e f g\n6lettres:\n- ghjklm\n- ghjklp\n- ghjklz',
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: '(nominal case) Each answer strictly respect another corresponding solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: patate\n6lettres: legume',
        solution: '9lettres:\n- courgette \n- patate\n6lettres:\n- tomate\n- chicon\n- legume',
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'Each answer correctly match its solution, with worst levenshtein distance below or equal to 0.25',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: abcd\n6lettres: ghjkl',
        solution: '9lettres:\n- abcde\n6lettres:\n- ghjklm\n- ghjklp\n- ghjklz',
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
        case: 'answer is not a String',
        output: { result: ANSWER_KO },
        answer: new Date(),
        solution: '',
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'solution is not a String',
        output: { result: ANSWER_KO },
        answer: 'a',
        solution: new Date(),
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'solution has no separator \\n',
        output: { result: ANSWER_KO },
        answer: 'blabla',
        solution: 'blabla',
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'Each answer points to the solution of another question',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': false, '6lettres': false } },
        answer: '9lettres: tomate\n6lettres: courgette',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume',
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'One of the levenshtein distance is above 0.25',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': false, '6lettres': true } },
        answer: '9lettres: abcde\n6lettres: ghjkl',
        //abcdefg below creates a levenshtein distance above 0.25
        solution: '9lettres:\n- abcdefg\n6lettres:\n- ghjklm\n- ghjklp\n- ghjklz',
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        case: 'All of the levenshtein distances are above 0.25',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': false, '6lettres': false } },
        answer: '9lettres: abcde\n6lettres: ghjklpE11!!',
        solution: '9lettres:\n- abcdefg\n6lettres:\n- ghjklm\n- ghjklp\n- ghjklz',
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
    it('when yaml is not valid, should throw an error', async function () {
      const answer = 'lecteur: [ a';
      const solutionValue =
        'lecteur:\n- G\n- Perso G\n\ndossier1:\n- Eureka\n\ndossier2:\n- Concept\n\nnom:\n- Logo\n\next:\n- gif';
      const enabledTreatments = ['t1', 't2', 't3'];
      const solution = { value: solutionValue, enabledTreatments };

      const error = await catchErr(service.match)({ answerValue: answer, solution });

      expect(error).to.be.an.instanceOf(YamlParsingError);
      expect(error.message).to.equal("Une erreur s'est produite lors de l'interprétation des réponses.");
    });

    const allCases = [
      {
        when: 'answer match exactly with a solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: chicon',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        when: 'spaces treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: c h i c o n',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        when: 'spaces treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: chicon',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n-  c h i c o n \n- legume\n',
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        when: 'uppercase treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: CHICON',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        when: 'uppercase treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: chicon',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- CHICON\n- legume\n',
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        when: 'accent treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: îàéùô',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- iaeuo\n- legume\n',
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        when: 'accent treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: iaeuo',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- îàéùô\n- legume\n',
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        when: 'diacritic treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: ççççç',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- ccccc\n- legume\n',
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        when: 'diacritic treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: ccccc',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- ççççç\n- legume\n',
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        when: 'punctuation treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: .!p-u-n-c-t',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- punct\n- legume\n',
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        when: 'punctuation treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: punct',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- .!p-u-n-c-t\n- legume\n',
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        when: 'levenshtein treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: 0123456789',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- 123456789\n- legume\n',
        enabledTreatments: ['t1', 't2', 't3'],
      },
      {
        when: 'levenshtein treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: 123456789',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- 0123456789\n- legume\n',
        enabledTreatments: ['t1', 't2', 't3'],
      },
    ];

    // eslint-disable-next-line mocha/no-setup-in-describe
    allCases.forEach(function (testCase) {
      it(
        testCase.when +
          ', should return ' +
          testCase.output +
          ' when answer is "' +
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

  describe('match, t1 deactivated', function () {
    const allCases = [
      {
        when: 'answer match exactly with a solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: chicon',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',
        enabledTreatments: ['t2', 't3'],
      },
      {
        when: 'spaces treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: c h i c o n',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',
        enabledTreatments: ['t2', 't3'],
      },
      {
        when: 'spaces treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: chicon',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n-  c h i c o n \n- legume\n',
        enabledTreatments: ['t2', 't3'],
      },
      {
        when: 'uppercase treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: CHICON',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',
        enabledTreatments: ['t2', 't3'],
      },
      {
        when: 'uppercase treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: chicon',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- CHICON\n- legume\n',
        enabledTreatments: ['t2', 't3'],
      },
      {
        when: 'accent treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: îàéùô',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- iaeuo\n- legume\n',
        enabledTreatments: ['t2', 't3'],
      },
      {
        when: 'accent treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: iaeuo',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- îàéùô\n- legume\n',
        enabledTreatments: ['t2', 't3'],
      },
      {
        when: 'diacritic treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: ççççç',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- ccccc\n- legume\n',
        enabledTreatments: ['t2', 't3'],
      },
      {
        when: 'diacritic treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: ccccc',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- ççççç\n- legume\n',
        enabledTreatments: ['t2', 't3'],
      },
      {
        when: 'punctuation treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: .!p-u-n-c-t',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- punct\n- legume\n',
        enabledTreatments: ['t2', 't3'],
      },
      {
        when: 'punctuation treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: punct',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- .!p-u-n-c-t\n- legume\n',
        enabledTreatments: ['t2', 't3'],
      },
      {
        when: 'levenshtein treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: 0123456789',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- 123456789\n- legume\n',
        enabledTreatments: ['t2', 't3'],
      },
      {
        when: 'levenshtein treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: 123456789',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- 0123456789\n- legume\n',
        enabledTreatments: ['t2', 't3'],
      },
    ];

    // eslint-disable-next-line mocha/no-setup-in-describe
    allCases.forEach(function (testCase) {
      it(
        testCase.when +
          ', should return ' +
          testCase.output +
          ' when answer is "' +
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

  describe('match, t2 deactivated', function () {
    const allCases = [
      {
        when: 'answer match exactly with a solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: chicon',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',
        enabledTreatments: ['t1', 't3'],
      },
      {
        when: 'spaces treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: c h i c o n',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',
        enabledTreatments: ['t1', 't3'],
      },
      {
        when: 'spaces treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: chicon',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n-  c h i c o n \n- legume\n',
        enabledTreatments: ['t1', 't3'],
      },
      {
        when: 'uppercase treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: CHICON',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',
        enabledTreatments: ['t1', 't3'],
      },
      {
        when: 'uppercase treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: chicon',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- CHICON\n- legume\n',
        enabledTreatments: ['t1', 't3'],
      },
      {
        when: 'accent treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: îàéùô',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- iaeuo\n- legume\n',
        enabledTreatments: ['t1', 't3'],
      },
      {
        when: 'accent treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: iaeuo',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- îàéùô\n- legume\n',
        enabledTreatments: ['t1', 't3'],
      },
      {
        when: 'diacritic treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: ççççç',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- ccccc\n- legume\n',
        enabledTreatments: ['t1', 't3'],
      },
      {
        when: 'diacritic treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: ccccc',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- ççççç\n- legume\n',
        enabledTreatments: ['t1', 't3'],
      },
      {
        when: 'punctuation treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: .!p-u-n-c-t',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- punct\n- legume\n',
        enabledTreatments: ['t1', 't3'],
      },
      {
        when: 'punctuation treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: punct',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- .!p-u-n-c-t\n- legume\n',
        enabledTreatments: ['t1', 't3'],
      },
      {
        when: 'levenshtein treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: 0123456789',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- 123456789\n- legume\n',
        enabledTreatments: ['t1', 't3'],
      },
      {
        when: 'levenshtein treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: 123456789',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- 0123456789\n- legume\n',
        enabledTreatments: ['t1', 't3'],
      },
    ];

    // eslint-disable-next-line mocha/no-setup-in-describe
    allCases.forEach(function (testCase) {
      it(
        testCase.when +
          ', should return ' +
          testCase.output +
          ' when answer is "' +
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

  describe('match, t3 deactivated', function () {
    const allCases = [
      {
        when: 'answer match exactly with a solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: chicon',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',
        enabledTreatments: ['t1', 't2'],
      },
      {
        when: 'spaces treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: c h i c o n',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',
        enabledTreatments: ['t1', 't2'],
      },
      {
        when: 'spaces treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: chicon',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n-  c h i c o n \n- legume\n',
        enabledTreatments: ['t1', 't2'],
      },
      {
        when: 'uppercase treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: CHICON',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',
        enabledTreatments: ['t1', 't2'],
      },
      {
        when: 'uppercase treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: chicon',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- CHICON\n- legume\n',
        enabledTreatments: ['t1', 't2'],
      },
      {
        when: 'accent treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: îàéùô',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- iaeuo\n- legume\n',
        enabledTreatments: ['t1', 't2'],
      },
      {
        when: 'accent treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: iaeuo',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- îàéùô\n- legume\n',
        enabledTreatments: ['t1', 't2'],
      },
      {
        when: 'diacritic treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: ççççç',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- ccccc\n- legume\n',
        enabledTreatments: ['t1', 't2'],
      },
      {
        when: 'diacritic treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: ccccc',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- ççççç\n- legume\n',
        enabledTreatments: ['t1', 't2'],
      },
      {
        when: 'punctuation treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: .!p-u-n-c-t',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- punct\n- legume\n',
        enabledTreatments: ['t1', 't2'],
      },
      {
        when: 'punctuation treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: punct',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- .!p-u-n-c-t\n- legume\n',
        enabledTreatments: ['t1', 't2'],
      },
      {
        when: 'levenshtein treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: 0123456789',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- 123456789\n- legume\n',
        enabledTreatments: ['t1', 't2'],
      },
      {
        when: 'levenshtein treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: 123456789',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- 0123456789\n- legume\n',
        enabledTreatments: ['t1', 't2'],
      },
    ];

    // eslint-disable-next-line mocha/no-setup-in-describe
    allCases.forEach(function (testCase) {
      it(
        testCase.when +
          ', should return ' +
          testCase.output +
          ' when answer is "' +
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

  describe('match, t1 and t2 deactivated', function () {
    const allCases = [
      {
        when: 'answer match exactly with a solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: chicon',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',
        enabledTreatments: ['t3'],
      },
      {
        when: 'spaces treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: c h i c o n',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',
        enabledTreatments: ['t3'],
      },
      {
        when: 'spaces treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: chicon',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n-  c h i c o n \n- legume\n',
        enabledTreatments: ['t3'],
      },
      {
        when: 'uppercase treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: CHICON',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',
        enabledTreatments: ['t3'],
      },
      {
        when: 'uppercase treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: chicon',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- CHICON\n- legume\n',
        enabledTreatments: ['t3'],
      },
      {
        when: 'accent treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: îàéùô',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- iaeuo\n- legume\n',
        enabledTreatments: ['t3'],
      },
      {
        when: 'accent treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: iaeuo',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- îàéùô\n- legume\n',
        enabledTreatments: ['t3'],
      },
      {
        when: 'diacritic treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: ççççç',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- ccccc\n- legume\n',
        enabledTreatments: ['t3'],
      },
      {
        when: 'diacritic treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: ccccc',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- ççççç\n- legume\n',
        enabledTreatments: ['t3'],
      },
      {
        when: 'punctuation treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: .!p-u-n-c-t',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- punct\n- legume\n',
        enabledTreatments: ['t3'],
      },
      {
        when: 'punctuation treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: punct',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- .!p-u-n-c-t\n- legume\n',
        enabledTreatments: ['t3'],
      },
      {
        when: 'levenshtein treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: 0123456789',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- 123456789\n- legume\n',
        enabledTreatments: ['t3'],
      },
      {
        when: 'levenshtein treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: 123456789',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- 0123456789\n- legume\n',
        enabledTreatments: ['t3'],
      },
    ];

    // eslint-disable-next-line mocha/no-setup-in-describe
    allCases.forEach(function (testCase) {
      it(
        testCase.when +
          ', should return ' +
          testCase.output +
          ' when answer is "' +
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

  describe('match, t1 and t3 deactivated', function () {
    const allCases = [
      {
        when: 'answer match exactly with a solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: chicon',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',
        enabledTreatments: ['t2'],
      },
      {
        when: 'spaces treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: c h i c o n',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',
        enabledTreatments: ['t2'],
      },
      {
        when: 'spaces treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: chicon',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n-  c h i c o n \n- legume\n',
        enabledTreatments: ['t2'],
      },
      {
        when: 'uppercase treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: CHICON',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',
        enabledTreatments: ['t2'],
      },
      {
        when: 'uppercase treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: chicon',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- CHICON\n- legume\n',
        enabledTreatments: ['t2'],
      },
      {
        when: 'accent treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: îàéùô',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- iaeuo\n- legume\n',
        enabledTreatments: ['t2'],
      },
      {
        when: 'accent treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: iaeuo',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- îàéùô\n- legume\n',
        enabledTreatments: ['t2'],
      },
      {
        when: 'diacritic treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: ççççç',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- ccccc\n- legume\n',
        enabledTreatments: ['t2'],
      },
      {
        when: 'diacritic treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: ccccc',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- ççççç\n- legume\n',
        enabledTreatments: ['t2'],
      },
      {
        when: 'punctuation treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: .!p-u-n-c-t',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- punct\n- legume\n',
        enabledTreatments: ['t2'],
      },
      {
        when: 'punctuation treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: punct',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- .!p-u-n-c-t\n- legume\n',
        enabledTreatments: ['t2'],
      },
      {
        when: 'levenshtein treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: 0123456789',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- 123456789\n- legume\n',
        enabledTreatments: ['t2'],
      },
      {
        when: 'levenshtein treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: 123456789',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- 0123456789\n- legume\n',
        enabledTreatments: ['t2'],
      },
    ];

    // eslint-disable-next-line mocha/no-setup-in-describe
    allCases.forEach(function (testCase) {
      it(
        testCase.when +
          ', should return ' +
          testCase.output +
          ' when answer is "' +
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

  describe('match, t2 and t3 deactivated', function () {
    const allCases = [
      {
        when: 'answer match exactly with a solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: chicon',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',
        enabledTreatments: ['t1'],
      },
      {
        when: 'spaces treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: c h i c o n',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',
        enabledTreatments: ['t1'],
      },
      {
        when: 'spaces treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: chicon',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n-  c h i c o n \n- legume\n',
        enabledTreatments: ['t1'],
      },
      {
        when: 'uppercase treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: CHICON',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',
        enabledTreatments: ['t1'],
      },
      {
        when: 'uppercase treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: chicon',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- CHICON\n- legume\n',
        enabledTreatments: ['t1'],
      },
      {
        when: 'accent treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: îàéùô',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- iaeuo\n- legume\n',
        enabledTreatments: ['t1'],
      },
      {
        when: 'accent treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: iaeuo',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- îàéùô\n- legume\n',
        enabledTreatments: ['t1'],
      },
      {
        when: 'diacritic treatment focus',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: ççççç',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- ccccc\n- legume\n',
        enabledTreatments: ['t1'],
      },
      {
        when: 'diacritic treatment focus on the solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: ccccc',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- ççççç\n- legume\n',
        enabledTreatments: ['t1'],
      },
      {
        when: 'punctuation treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: .!p-u-n-c-t',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- punct\n- legume\n',
        enabledTreatments: ['t1'],
      },
      {
        when: 'punctuation treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: punct',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- .!p-u-n-c-t\n- legume\n',
        enabledTreatments: ['t1'],
      },
      {
        when: 'levenshtein treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: 0123456789',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- 123456789\n- legume\n',
        enabledTreatments: ['t1'],
      },
      {
        when: 'levenshtein treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: 123456789',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- 0123456789\n- legume\n',
        enabledTreatments: ['t1'],
      },
    ];

    // eslint-disable-next-line mocha/no-setup-in-describe
    allCases.forEach(function (testCase) {
      it(
        testCase.when +
          ', should return ' +
          testCase.output +
          ' when answer is "' +
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

  describe('match, t1, t2 and t3 deactivated', function () {
    const allCases = [
      {
        when: 'answer match exactly with a solution',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette\n6lettres: chicon',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',
        enabledTreatments: [],
      },
      {
        when: 'spaces treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: c h i c o n',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',
        enabledTreatments: [],
      },
      {
        when: 'spaces treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: chicon',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n-  c h i c o n \n- legume\n',
        enabledTreatments: [],
      },
      {
        when: 'uppercase treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: CHICON',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',
        enabledTreatments: [],
      },
      {
        when: 'uppercase treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: chicon',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- CHICON\n- legume\n',
        enabledTreatments: [],
      },
      {
        when: 'accent treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: îàéùô',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- iaeuo\n- legume\n',
        enabledTreatments: [],
      },
      {
        when: 'accent treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: iaeuo',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- îàéùô\n- legume\n',
        enabledTreatments: [],
      },
      {
        when: 'diacritic treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: ççççç',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- ccccc\n- legume\n',
        enabledTreatments: [],
      },
      {
        when: 'diacritic treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: ccccc',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- ççççç\n- legume\n',
        enabledTreatments: [],
      },
      {
        when: 'punctuation treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: .!p-u-n-c-t',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- punct\n- legume\n',
        enabledTreatments: [],
      },
      {
        when: 'punctuation treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: punct',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- .!p-u-n-c-t\n- legume\n',
        enabledTreatments: [],
      },
      {
        when: 'levenshtein treatment focus',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: 0123456789',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- 123456789\n- legume\n',
        enabledTreatments: [],
      },
      {
        when: 'levenshtein treatment focus on the solution',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': true, '6lettres': false } },
        answer: '9lettres: courgette\n6lettres: 123456789',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- 0123456789\n- legume\n',
        enabledTreatments: [],
      },
    ];

    // eslint-disable-next-line mocha/no-setup-in-describe
    allCases.forEach(function (testCase) {
      it(
        testCase.when +
          ', should return ' +
          testCase.output +
          ' when answer is "' +
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

  context('One of the qroc is a select qroc', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      {
        case: 'T3 does not work on select qroc but always on text qroc',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': false, '6lettres': true } },
        answer: '9lettres: courgetta \n6lettres: tomato',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume',
        enabledTreatments: ['t3'],
        qrocBlocksTypes: { '9lettres': 'select', '6lettres': 'text' },
      },
      {
        case: 'T1 does not work on select qroc but always on text qroc',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': false, '6lettres': true } },
        answer: '9lettres: COURGETTE \n6lettres: TOMATE',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume',
        enabledTreatments: ['t1'],
        qrocBlocksTypes: { '9lettres': 'select', '6lettres': 'text' },
      },
      {
        case: 'T2 does not work on select qroc but always on text qroc',
        output: { result: ANSWER_KO, resultDetails: { '9lettres': false, '6lettres': true } },
        answer: '9lettres: courgette&&& \n6lettres: tomate&&&',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume',
        enabledTreatments: ['t2'],
        qrocBlocksTypes: { '9lettres': 'select', '6lettres': 'text' },
      },
      {
        case: 'With T1,T2,T3 activated, the answer should be the same',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: courgette \n6lettres: TOMATO&&',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume',
        enabledTreatments: ['t1', 't2', 't3'],
        qrocBlocksTypes: { '9lettres': 'select', '6lettres': 'text' },
      },
      {
        case: 'With T1,T2,T3 activated, the qroc select should be the same with special char',
        output: { result: ANSWER_OK, resultDetails: { '9lettres': true, '6lettres': true } },
        answer: '9lettres: Courgette&**\n6lettres: TOMATO&&',
        solution: '9lettres:\n- Courgette&**\n6lettres:\n- tomate\n- chicon\n- legume',
        enabledTreatments: ['t1', 't2', 't3'],
        qrocBlocksTypes: { '9lettres': 'select', '6lettres': 'text' },
      },
    ].forEach(function (testCase) {
      it(
        testCase.case +
          ', should return ' +
          testCase.output.result +
          ' when answer is "' +
          testCase.answer +
          '" and solution is "' +
          escape(testCase.solution) +
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
