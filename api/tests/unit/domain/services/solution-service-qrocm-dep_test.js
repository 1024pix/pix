const { expect, catchErr } = require('../../../test-helper');

const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const service = require('../../../../lib/domain/services/solution-service-qrocm-dep');

const { YamlParsingError } = require('../../../../lib/domain/errors');

const ANSWER_PARTIALLY = AnswerStatus.PARTIALLY;
const ANSWER_OK = AnswerStatus.OK;
const ANSWER_KO = AnswerStatus.KO;

describe('Unit | Service | SolutionServiceQROCM-dep ', function () {
  const twoPossibleSolutions = 'Google:\n- Google\n- google.fr\n- Google Search\nYahoo:\n- Yahoo\n- Yahoo Answer';
  const threePossibleSolutions =
    'Google:\n- Google\n- google.fr\n- Google Search\nYahoo:\n- Yahoo\n- Yahoo Answer\nBing:\n- Bing';

  describe('if solution type is QROCM-dep', function () {
    const failedCases = [
      {
        when: 'Answer is not a String',
        answer: { foo: 'bar' },
        solution: 'Google:\n- Google\nYahoo:\n- Yahoo',
      },
      {
        when: 'Solution is not a String',
        answer: 'num1: Google\nnum2: Yahoo',
        solution: 0,
      },
      {
        when: 'Answer is empty',
        answer: '',
        solution: '\n',
      },
      {
        when: 'Answer is empty and solution is normal',
        answer: '',
        solution: 'Google:\n- Google\nYahoo:\n- Yahoo',
      },
      {
        when: 'Answer is incorrect',
        answer: 'num1: Foo\nnum2: Bar',
        solution: 'Google:\n- Google\nYahoo:\n- Yahoo',
      },
      {
        when: 'User duplicated a correct answer',
        answer: 'num1: google.fr\nnum2: google.fr',
        solution: 'Google:\n- Google\nYahoo:\n- Yahoo',
      },
    ];

    // eslint-disable-next-line mocha/no-setup-in-describe
    failedCases.forEach((testCase) => {
      it(`should return "ko" when ${testCase.when}`, function () {
        const solution = { value: testCase.solution, deactivations: {} };
        expect(service.match({ answerValue: testCase.answer, solution })).to.deep.equal(ANSWER_KO);
      });
    });

    const maximalScoreCases = [
      {
        when: 'Both answers are correct with 1 solution',
        answer: 'num1: Google\nnum2: Yahoo',
        solution: 'Google:\n- Google\nYahoo:\n- Yahoo',
      },
      {
        when: 'Both answers are correct with 1 solution that contains only numbers',
        answer: 'num1: 123\nnum2: 987',
        solution: 'Google:\n- 987\nYahoo:\n- 123',
      },
      {
        when: 'Both answers are correct with 1 solution that contains only decimal numbers with comma',
        answer: 'num1: "123,00"\nnum2: 987',
        solution: 'Google:\n- 987\nYahoo:\n- 123,00',
      },
      {
        when: 'Both answers are correct with 1 solution that contains only decimal numbers with dot',
        answer: 'num1: "123.00"\nnum2: 987',
        solution: 'Google:\n- 987\nYahoo:\n- 123.00',
      },
      {
        when: 'Both answers are correct with 1 solution that contains spaces before and after',
        answer: 'num1: "  foo "\nnum2: "    bar "',
        solution: 'Google:\n- foo\nYahoo:\n- bar',
      },
      {
        when: 'Both answers are correct with 2 solutions',
        answer: 'num1: Google\nnum2: Yahoo',
        solution: twoPossibleSolutions,
      },
      {
        when: 'Both answers are correct with 2 solutions, and there are unbreakable spaces in both answers',
        answer: 'num1: G o o g l e  \nnum2:  Y a h o o ',
        solution: twoPossibleSolutions,
      },
      {
        when: 'Both answers are correct, and solutions contains spaces everywhere',
        answer: 'num1: Google\nnum2: Yahoo',
        solution: 'Google:\n-  G o o g le  \nYahoo:\n-   Y a h o    o   ',
      },
      {
        when: 'Both answers are correct with 2 solutions, 2nd version',
        answer: 'num1: Google Search\nnum2: Yahoo Answer',
        solution: twoPossibleSolutions,
      },
      {
        when: 'Both answers are correct, with levenshtein 0 < x =< 0.25, uppercase, space and punctuation errors',
        answer: 'num1: GooGLe!!! earch  \nnum2:  Yahoo  n-?swer  ',
        solution: twoPossibleSolutions,
      },
      {
        when: 'Both answers are correct with 2 answers that contains spaces before and after',
        answer: 'num1: "    GoogLe Search  "\nnum2: "  Yahoo Answer  "',
        solution: 'Google:\n- "GoogLe Search"\nYahoo:\n- "Yahoo Answer"',
      },
      {
        when: 'Both answers are correct with 2 solution that contains spaces before and after',
        answer: 'num1: "GoogLe Search"\nnum2: "Yahoo Answer"',
        solution: 'Google:\n- "   Google Search  "\nYahoo:\n- " Yahoo Answer    "',
      },
      {
        when: 'All answers are correct, with 3 solutions',
        answer: 'num1: Google Search\nnum2: Yahoo Answer\nnum3: Bing',
        solution: threePossibleSolutions,
      },
    ];

    // eslint-disable-next-line mocha/no-setup-in-describe
    maximalScoreCases.forEach(function (testCase) {
      it(`Should return "ok" when ${testCase.when}`, function () {
        const solution = { value: testCase.solution, deactivations: {} };
        expect(service.match({ answerValue: testCase.answer, solution })).to.deep.equal(ANSWER_OK);
      });
    });
  });

  describe('if solution type is QROCM-dep with scoring', function () {
    it('should return "ko" for badly formatted solution', function () {
      expect(
        service.match({
          answerValue: 'num1: Google\nnum2: Yahoo',
          solution: { value: 'solution like a QCU', scoring: '1: @acquix', deactivations: {} },
        })
      ).to.deep.equal(ANSWER_KO);
    });

    it('should return "ko" when answer is incorrect', function () {
      expect(
        service.match({
          answerValue: 'num1: Foo\nnum2: Bar',
          solution: { value: twoPossibleSolutions, scoring: '1: acquix', deactivations: {} },
        })
      ).to.deep.equal(ANSWER_KO);
    });

    const maximalScoreCases = [
      {
        when: '3 correct answers are given, and scoring is 1-3',
        answer: 'num1: " google.fr"\nnum2: "yahoo answer "\nnum3: bing',
        solution: threePossibleSolutions,
        scoring: '1: acquix\n2: acquix\n3: acquix',
      },
      {
        when: '3 correct answers are given, (all 3 have punctation, accent and spaces errors), and scoring is 1-3',
        answer: 'num1: " g Ooglé.FR!!--"\nnum2: "  Y?,,a h o o AnSwer "\nnum3: BìNg()()(',
        solution: threePossibleSolutions,
        scoring: '1: acquix\n2: acquix\n3: acquix',
      },
      {
        when: '3 correct answers are given, and scoring is 1-2',
        answer: 'num1: " google.fr"\nnum2: "Yahoo anSwer "\nnum3: bing',
        solution: threePossibleSolutions,
        scoring: '1: acquix\n2: acquix',
      },
    ];

    // eslint-disable-next-line mocha/no-setup-in-describe
    maximalScoreCases.forEach(function (testCase) {
      it(`should return "ok" when ${testCase.when}`, function () {
        const solution = { value: testCase.solution, scoring: testCase.scoring, deactivations: {} };
        expect(service.match({ answerValue: testCase.answer, solution })).to.deep.equal(ANSWER_OK);
      });
    });

    const partialScoreCases = [
      {
        when: '1 correct answers are given + 2 wrong, and scoring is 1-3',
        answer: 'num1: " google.fr"\nnum2: "bad answer"\nnum3: "bad answer"',
        solution: threePossibleSolutions,
        scoring: '1: acquix\n2: acquix\n3: acquix',
      },
      {
        when: '1 correct answers are given (despite accent, punctation and spacing errors) + 2 wrong, and scoring is 1-3',
        answer: 'num1: " gooG lè!!.fr"\nnum2: "bad answer"\nnum3: "bad answer"',
        solution: threePossibleSolutions,
        scoring: '1: acquix\n2: acquix\n3: acquix',
      },
      {
        when: '2 correct answers are given + 1 empty, and scoring is 1-3',
        answer: 'num1: " google.fr"\nnum2: "Yahoo anSwer "\nnum3: ""',
        solution: threePossibleSolutions,
        scoring: '1: acquix\n2: acquix\n3: acquix',
      },
    ];

    // eslint-disable-next-line mocha/no-setup-in-describe
    partialScoreCases.forEach(function (testCase) {
      it(`should return "partially" when ${testCase.when}`, function () {
        const solution = { value: testCase.solution, scoring: testCase.scoring, deactivations: {} };
        expect(service.match({ answerValue: testCase.answer, solution })).to.deep.equal(ANSWER_PARTIALLY);
      });
    });

    const failedCases = [
      {
        when: '2 correct answers are given but scoring requires 3 correct answers',
        answer: 'num1: " google.fr"\nnum2: "Yahoo anSwer "',
        solution: twoPossibleSolutions,
        scoring: '3: acquix',
      },
      {
        when: 'No correct answer is given and scoring is 1-3',
        answer: 'num1: " tristesse"\nnum2: "bad answer"',
        solution: twoPossibleSolutions,
        scoring: '1: acquix\n2: acquix\n3: acquix',
      },
      {
        when: 'Similar good answer is given and scoring is 2-3',
        answer: 'num1: "google"\nnum2: "google.fr"',
        solution: twoPossibleSolutions,
        scoring: '2: acquix\n3: acquix',
      },
      {
        when: 'Duplicate good answer exactly, and scoring is 2-3',
        answer: 'num1: "google"\nnum2: "google"',
        solution: twoPossibleSolutions,
        scoring: '2: acquix\n3: acquix',
      },
    ];

    // eslint-disable-next-line mocha/no-setup-in-describe
    failedCases.forEach(function (testCase) {
      it(`should return "ko" when ${testCase.when}`, function () {
        const solution = { value: testCase.solution, scoring: testCase.scoring, deactivations: {} };
        expect(service.match({ answerValue: testCase.answer, solution })).to.deep.equal(ANSWER_KO);
      });
    });
  });

  describe('match, strong focus on treatments', function () {
    it('when yaml is not valid, should throw an error', async function () {
      const answer = 'lecteur: [ a\nnum2: efgh';
      const solution = 'lecteur:\n- G\n- Perso G\n\nnum2:\n- Eureka\n';
      const enabledTreatments = ['t1', 't2', 't3'];

      const error = await catchErr(service.match)({
        answerValue: answer,
        solution: { value: solution, enabledTreatments },
      });

      expect(error).to.be.an.instanceOf(YamlParsingError);
      expect(error.message).to.equal("Une erreur s'est produite lors de l'interprétation des réponses.");
    });

    const allCases = [
      {
        when: 'no stress',
        output: ANSWER_OK,
        answer: 'num1: pqrs\nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- pqrs\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: {},
      },
      {
        when: 'spaces stress',
        output: ANSWER_OK,
        answer: 'num1: p q r s \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- pqrs\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: {},
      },
      {
        when: 'reverted spaces stress',
        output: ANSWER_OK,
        answer: 'num1: pqrs \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- p q r s \n',
        scoring: '1: acquix\n2: acquix',
        deactivations: {},
      },
      {
        when: 'uppercase stress',
        output: ANSWER_OK,
        answer: 'num1: PQRS \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- pqrs\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: {},
      },
      {
        when: 'reverted uppercase stress',
        output: ANSWER_OK,
        answer: 'num1: pqrs \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- PQRS\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: {},
      },
      {
        when: 'accent stress',
        output: ANSWER_OK,
        answer: 'num1: ÿüôî \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- yuoi\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: {},
      },
      {
        when: 'reverted accent stress',
        output: ANSWER_OK,
        answer: 'num1: yuoi \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- ÿüôî\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: {},
      },
      {
        when: 'diacritic stress',
        output: ANSWER_OK,
        answer: 'num1: ççççç \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- ccccc\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: {},
      },
      {
        when: 'reverted diacritic stress',
        output: ANSWER_OK,
        answer: 'num1: ccccc \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- ççççç\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: {},
      },
      {
        when: 'punctuation stress',
        output: ANSWER_OK,
        answer: 'num1: +p?q-r!s+ \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- pqrs\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: {},
      },
      {
        when: 'reverted punctuation stress',
        output: ANSWER_OK,
        answer: 'num1: pqrs \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- +p?q-r!s+\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: {},
      },
      {
        when: 'levenshtein stress',
        output: ANSWER_OK,
        answer: 'num1: 0123456789 \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- 123456789\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: {},
      },
      {
        when: 'reverted levenshtein stress',
        output: ANSWER_OK,
        answer: 'num1: 123456789 \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- 0123456789\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: {},
      },
    ];

    // eslint-disable-next-line mocha/no-setup-in-describe
    allCases.forEach(function (testCase) {
      it(`${testCase.when}, should return ${testCase.output} when answer is "${testCase.answer}" and solution is "${testCase.solution}"`, function () {
        const solution = { value: testCase.solution, scoring: testCase.scoring, deactivations: testCase.deactivations };
        expect(service.match({ answerValue: testCase.answer, solution })).to.deep.equal(testCase.output);
      });
    });
  });

  describe('match, t1 deactivated', function () {
    const allCases = [
      {
        when: 'no stress',
        output: ANSWER_OK,
        answer: 'num1: pqrs\nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- pqrs\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true },
      },
      {
        when: 'spaces stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: p q r s \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- pqrs\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true },
      },
      {
        when: 'reverted spaces stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: pqrs \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- p q r s \n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true },
      },
      {
        when: 'uppercase stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: PQRS \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- pqrs\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true },
      },
      {
        when: 'reverted uppercase stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: pqrs \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- PQRS\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true },
      },
      {
        when: 'accent stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: ÿüôî \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- yuoi\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true },
      },
      {
        when: 'reverted accent stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: yuoi \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- ÿüôî\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true },
      },
      {
        when: 'diacritic stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: ççççç \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- ccccc\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true },
      },
      {
        when: 'reverted diacritic stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: ccccc \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- ççççç\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true },
      },
      {
        when: 'punctuation stress',
        output: ANSWER_OK,
        answer: 'num1: +p?q-r!s+ \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- pqrs\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true },
      },
      {
        when: 'reverted punctuation stress',
        output: ANSWER_OK,
        answer: 'num1: pqrs \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- +p?q-r!s+\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true },
      },
      {
        when: 'levenshtein stress',
        output: ANSWER_OK,
        answer: 'num1: 0123456789 \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- 123456789\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true },
      },
      {
        when: 'reverted levenshtein stress',
        output: ANSWER_OK,
        answer: 'num1: 123456789 \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- 0123456789\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true },
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
          testCase.solution +
          '"',
        function () {
          const solution = {
            value: testCase.solution,
            scoring: testCase.scoring,
            deactivations: testCase.deactivations,
          };
          expect(service.match({ answerValue: testCase.answer, solution })).to.deep.equal(testCase.output);
        }
      );
    });
  });

  describe('match, t2 deactivated', function () {
    const allCases = [
      {
        when: 'no stress',
        output: ANSWER_OK,
        answer: 'num1: pqrs\nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- pqrs\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t2: true },
      },
      {
        when: 'spaces stress',
        output: ANSWER_OK,
        answer: 'num1: p q r s \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- pqrs\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t2: true },
      },
      {
        when: 'reverted spaces stress',
        output: ANSWER_OK,
        answer: 'num1: pqrs \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- p q r s \n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t2: true },
      },
      {
        when: 'uppercase stress',
        output: ANSWER_OK,
        answer: 'num1: PQRS \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- pqrs\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t2: true },
      },
      {
        when: 'reverted uppercase stress',
        output: ANSWER_OK,
        answer: 'num1: pqrs \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- PQRS\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t2: true },
      },
      {
        when: 'accent stress',
        output: ANSWER_OK,
        answer: 'num1: ÿüôî \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- yuoi\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t2: true },
      },
      {
        when: 'reverted accent stress',
        output: ANSWER_OK,
        answer: 'num1: yuoi \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- ÿüôî\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t2: true },
      },
      {
        when: 'diacritic stress',
        output: ANSWER_OK,
        answer: 'num1: ççççç \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- ccccc\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t2: true },
      },
      {
        when: 'reverted diacritic stress',
        output: ANSWER_OK,
        answer: 'num1: ccccc \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- ççççç\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t2: true },
      },
      {
        when: 'punctuation stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: +p?q-r!s+ \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- pqrs\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t2: true },
      },
      {
        when: 'reverted punctuation stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: pqrs \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- +p?q-r!s+\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t2: true },
      },
      {
        when: 'levenshtein stress',
        output: ANSWER_OK,
        answer: 'num1: 0123456789 \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- 123456789\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t2: true },
      },
      {
        when: 'reverted levenshtein stress',
        output: ANSWER_OK,
        answer: 'num1: 123456789 \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- 0123456789\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t2: true },
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
          testCase.solution +
          '"',
        function () {
          const solution = {
            value: testCase.solution,
            scoring: testCase.scoring,
            deactivations: testCase.deactivations,
          };
          expect(service.match({ answerValue: testCase.answer, solution })).to.deep.equal(testCase.output);
        }
      );
    });
  });

  describe('match, t3 deactivated', function () {
    const allCases = [
      {
        when: 'no stress',
        output: ANSWER_OK,
        answer: 'num1: pqrs\nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- pqrs\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t3: true },
      },
      {
        when: 'spaces stress',
        output: ANSWER_OK,
        answer: 'num1: p q r s \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- pqrs\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t3: true },
      },
      {
        when: 'reverted spaces stress',
        output: ANSWER_OK,
        answer: 'num1: pqrs \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- p q r s \n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t3: true },
      },
      {
        when: 'uppercase stress',
        output: ANSWER_OK,
        answer: 'num1: PQRS \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- pqrs\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t3: true },
      },
      {
        when: 'reverted uppercase stress',
        output: ANSWER_OK,
        answer: 'num1: pqrs \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- PQRS\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t3: true },
      },
      {
        when: 'accent stress',
        output: ANSWER_OK,
        answer: 'num1: ÿüôî \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- yuoi\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t3: true },
      },
      {
        when: 'reverted accent stress',
        output: ANSWER_OK,
        answer: 'num1: yuoi \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- ÿüôî\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t3: true },
      },
      {
        when: 'diacritic stress',
        output: ANSWER_OK,
        answer: 'num1: ççççç \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- ccccc\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t3: true },
      },
      {
        when: 'reverted diacritic stress',
        output: ANSWER_OK,
        answer: 'num1: ccccc \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- ççççç\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t3: true },
      },
      {
        when: 'punctuation stress',
        output: ANSWER_OK,
        answer: 'num1: +p?q-r!s+ \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- pqrs\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t3: true },
      },
      {
        when: 'reverted punctuation stress',
        output: ANSWER_OK,
        answer: 'num1: pqrs \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- +p?q-r!s+\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t3: true },
      },
      {
        when: 'levenshtein stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: 0123456789 \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- 123456789\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t3: true },
      },
      {
        when: 'reverted levenshtein stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: 123456789 \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- 0123456789\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t3: true },
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
          testCase.solution +
          '"',
        function () {
          const solution = {
            value: testCase.solution,
            scoring: testCase.scoring,
            deactivations: testCase.deactivations,
          };
          expect(service.match({ answerValue: testCase.answer, solution })).to.deep.equal(testCase.output);
        }
      );
    });
  });

  describe('match, t3, t2, t1 deactivated', function () {
    const allCases = [
      {
        when: 'no stress',
        output: ANSWER_OK,
        answer: 'num1: pqrs\nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- pqrs\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t2: true, t3: true },
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
          testCase.solution +
          '"',
        function () {
          const solution = {
            value: testCase.solution,
            scoring: testCase.scoring,
            deactivations: testCase.deactivations,
          };
          expect(service.match({ answerValue: testCase.answer, solution })).to.deep.equal(testCase.output);
        }
      );
    });
  });

  describe('match, t1 and t2 deactivated', function () {
    const allCases = [
      {
        when: 'no stress',
        output: ANSWER_OK,
        answer: 'num1: pqrs\nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- pqrs\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'spaces stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: p q r s \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- pqrs\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'reverted spaces stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: pqrs \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- p q r s \n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'uppercase stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: PQRS \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- pqrs\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'reverted uppercase stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: pqrs \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- PQRS\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'accent stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: ÿüôî \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- yuoi\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'reverted accent stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: yuoi \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- ÿüôî\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'diacritic stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: ççççç \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- ccccc\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'reverted diacritic stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: ccccc \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- ççççç\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'punctuation stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: +p?q-r!s+ \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- pqrs\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'reverted punctuation stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: pqrs \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- +p?q-r!s+\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'levenshtein stress',
        output: ANSWER_OK,
        answer: 'num1: 0123456789 \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- 123456789\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t2: true },
      },
      {
        when: 'reverted levenshtein stress',
        output: ANSWER_OK,
        answer: 'num1: 123456789 \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- 0123456789\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t2: true },
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
          testCase.solution +
          '"',
        function () {
          const solution = {
            value: testCase.solution,
            scoring: testCase.scoring,
            deactivations: testCase.deactivations,
          };
          expect(service.match({ answerValue: testCase.answer, solution })).to.deep.equal(testCase.output);
        }
      );
    });
  });

  describe('match, t1 and t3 deactivated', function () {
    const allCases = [
      {
        when: 'no stress',
        output: ANSWER_OK,
        answer: 'num1: pqrs\nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- pqrs\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'spaces stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: p q r s \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- pqrs\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'reverted spaces stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: pqrs \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- p q r s \n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'uppercase stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: PQRS \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- pqrs\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'reverted uppercase stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: pqrs \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- PQRS\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'accent stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: ÿüôî \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- yuoi\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'reverted accent stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: yuoi \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- ÿüôî\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'diacritic stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: ççççç \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- ccccc\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'reverted diacritic stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: ccccc \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- ççççç\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'punctuation stress',
        output: ANSWER_OK,
        answer: 'num1: +p?q-r!s+ \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- pqrs\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'reverted punctuation stress',
        output: ANSWER_OK,
        answer: 'num1: pqrs \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- +p?q-r!s+\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'levenshtein stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: 0123456789 \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- 123456789\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t3: true },
      },
      {
        when: 'reverted levenshtein stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: 123456789 \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- 0123456789\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t3: true },
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
          testCase.solution +
          '"',
        function () {
          const solution = {
            value: testCase.solution,
            scoring: testCase.scoring,
            deactivations: testCase.deactivations,
          };
          expect(service.match({ answerValue: testCase.answer, solution })).to.deep.equal(testCase.output);
        }
      );
    });
  });

  describe('match, t1, t2, and t3 deactivated', function () {
    const allCases = [
      {
        when: 'no stress',
        output: ANSWER_OK,
        answer: 'num1: pqrs\nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- pqrs\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'spaces stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: p q r s \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- pqrs\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'reverted spaces stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: pqrs \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- p q r s \n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'uppercase stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: PQRS \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- pqrs\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'reverted uppercase stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: pqrs \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- PQRS\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'accent stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: ÿüôî \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- yuoi\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'reverted accent stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: yuoi \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- ÿüôî\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'diacritic stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: ççççç \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- ccccc\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'reverted diacritic stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: ccccc \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- ççççç\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'punctuation stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: +p?q-r!s+ \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- pqrs\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'reverted punctuation stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: pqrs \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- +p?q-r!s+\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'levenshtein stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: 0123456789 \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- 123456789\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t2: true, t3: true },
      },
      {
        when: 'reverted levenshtein stress',
        output: ANSWER_PARTIALLY,
        answer: 'num1: 123456789 \nnum2: efgh',
        solution: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- 0123456789\n',
        scoring: '1: acquix\n2: acquix',
        deactivations: { t1: true, t2: true, t3: true },
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
          testCase.solution +
          '"',
        function () {
          const solution = {
            value: testCase.solution,
            scoring: testCase.scoring,
            deactivations: testCase.deactivations,
          };
          expect(service.match({ answerValue: testCase.answer, solution })).to.deep.equal(testCase.output);
        }
      );
    });
  });
});
