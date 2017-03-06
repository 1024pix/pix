const { describe, it, expect } = require('../../../test-helper');

const service = require('../../../../lib/domain/services/solution-service-qrocm-ind');

describe('Unit | Service | SolutionServiceQROCM-ind ', function () {

  describe('Nominal and weird, combined cases', function () {

    const successfulCases = [{
      case: '(nominal case) Each answer strictly respect a corresponding solution',
      answer: '9lettres: courgette\n6lettres: tomate',
      solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume'
    },
    {
      case: 'solution contains numbers',
      answer: 'num1: 888\nnum2: 64',
      solution: 'num1:\n- 888\nnum2:\n- 64'
    },
    {
      case: 'leading/trailing spaces in solution',
      answer: '9lettres: c o u r g e t t e\n6lettres: t o m a t e',
      solution: '9lettres:\n-  courgette   \n6lettres:\n-   tomate    \n-   chicon    \n- legume   '
    },
    {
      case: 'uppercases and leading/trailing spaces in solution',
      answer: '9lettres: c o u r g e t t e\n6lettres: t o m a t e',
      solution: '9lettres:\n-  COUrgETTE   \n6lettres:\n-   TOmaTE    \n-   CHICON    \n- LEGUME   '
    },
    {
      case: 'spaces in answer',
      answer: '9lettres: c o u r g e t t e\n6lettres: t o m a t e',
      solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume'
    },
    {
      case: 'answer with levenshtein distance below 0.25',
      answer: '9lettres: ourgette\n6lettres: tomae',
      solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume'
    },
    {
      case: 'answer with uppercases',
      answer: '9lettres: COURGETTE\n6lettres: TOMATE',
      solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume'
    },
    {
      case: 'answer with uppercases and spaces',
      answer: '9lettres: C O U R G E T T E\n6lettres: T O M A T E',
      solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume'
    },
    {
      case: 'answer with uppercases spaces, and levenshtein > 0 but <= 0.25',
      answer: '9lettres: C O U G E T T E\n6lettres:  O M A T E',
      solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume'
    },
    {
      case: 'answer with uppercases spaces, and levenshtein > 0 but <= 0.25, and accents',
      answer: '9lettres: ç O u -- ;" ;--- _ \' grè TTÊ\n6lettres:  O M A T E',
      solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume'
    },
    {
      case: 'unbreakable spaces in answer',
      answer: '9lettres: c o u r g e t t e\n6lettres: t o m a t e',
      solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume'
    },
    {
      case: 'Solution has spaces in-between',
      answer: '9lettres: abcdefg\n6lettres: ghjkl',
      solution: '9lettres:\n- a b c d e f g\n6lettres:\n- ghjklm\n- ghjklp\n- ghjklz'
    },
    {
      case: '(nominal case) Each answer strictly respect another corresponding solution',
      answer: '9lettres: patate\n6lettres: legume',
      solution: '9lettres:\n- courgette \n- patate\n6lettres:\n- tomate\n- chicon\n- legume'
    },
    {
      case: 'Each answer correctly match its solution, with worst levenshtein distance below or equal to 0.25',
      answer: '9lettres: abcd\n6lettres: ghjkl',
      solution: '9lettres:\n- abcde\n6lettres:\n- ghjklm\n- ghjklp\n- ghjklz'
    }
    ];

    successfulCases.forEach(function (testCase) {
      it(testCase.case + ', should return "ok" when answer is "' + testCase.answer + '" and solution is "' + escape(testCase.solution) + '"', function () {
        expect(service.match(testCase.answer, testCase.solution)).to.equal('ok');
      });
    });

    const failingCases = [
      {case:'solution do not exists', answer: 'any answer'},
      {case:'solution is empty', answer: '', solution : ''},
      {case:'answer is not a String', answer: new Date(), solution : ''},
      {case:'solution is not a String', answer: 'a', solution : new Date()},
      {case:'solution has no separator \\n', answer: 'blabla', solution : 'blabla'},
      {
        case: 'Each answer points to the solution of another question',
        answer: '9lettres: tomate\n6lettres: courgette',
        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume'
      },
      {
        case: 'One of the levenshtein distance is above 0.25',
        answer: '9lettres: abcde\n6lettres: ghjkl',
        //abcdefg below creates a levenshtein distance above 0.25
        solution: '9lettres:\n- abcdefg\n6lettres:\n- ghjklm\n- ghjklp\n- ghjklz'
      },
      {
        case: 'All of the levenshtein distances are above 0.25',
        answer: '9lettres: abcde\n6lettres: ghjklpE11!!',
        solution: '9lettres:\n- abcdefg\n6lettres:\n- ghjklm\n- ghjklp\n- ghjklz'
      }
    ];

    failingCases.forEach(function (testCase) {
      it(testCase.case + ', should return "ko" when answer is "' + testCase.answer + '" and solution is "' + escape(testCase.solution) + '"', function () {
        expect(service.match(testCase.answer, testCase.solution)).to.equal('ko');
      });
    });

  });


  describe('match, strong focus on treatments', function () {

    const allCases = [
      {when:'no stress',                   output: 'ok', answer: '9lettres: courgette\n6lettres: chicon',        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',      deactivations: {}},
      {when:'spaces stress',               output: 'ok', answer: '9lettres: courgette\n6lettres: c h i c o n',   solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',      deactivations: {}},
      {when:'reverted spaces stress',      output: 'ok', answer: '9lettres: courgette\n6lettres: chicon',        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n-  c h i c o n \n- legume\n', deactivations: {}},
      {when:'uppercase stress',            output: 'ok', answer: '9lettres: courgette\n6lettres: CHICON',        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',      deactivations: {}},
      {when:'reverted uppercase stress',   output: 'ok', answer: '9lettres: courgette\n6lettres: chicon',        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- CHICON\n- legume\n',      deactivations: {}},
      {when:'accent stress',               output: 'ok', answer: '9lettres: courgette\n6lettres: îàéùô',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- iaeuo\n- legume\n',       deactivations: {}},
      {when:'reverted accent stress',      output: 'ok', answer: '9lettres: courgette\n6lettres: iaeuo',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- îàéùô\n- legume\n',       deactivations: {}},
      {when:'diacritic stress',            output: 'ok', answer: '9lettres: courgette\n6lettres: ççççç',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- ccccc\n- legume\n',       deactivations: {}},
      {when:'reverted diacritic stress',   output: 'ok', answer: '9lettres: courgette\n6lettres: ccccc',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- ççççç\n- legume\n',       deactivations: {}},
      {when:'punctuation stress',          output: 'ok', answer: '9lettres: courgette\n6lettres: .!p-u-n-c-t',   solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- punct\n- legume\n',       deactivations: {}},
      {when:'reverted punctuation stress', output: 'ok', answer: '9lettres: courgette\n6lettres: punct',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- .!p-u-n-c-t\n- legume\n', deactivations: {}},
      {when:'levenshtein stress',          output: 'ok', answer: '9lettres: courgette\n6lettres: 0123456789',    solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- 123456789\n- legume\n',   deactivations: {}},
      {when:'reverted levenshtein stress', output: 'ok', answer: '9lettres: courgette\n6lettres: 123456789',     solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- 0123456789\n- legume\n',  deactivations: {}},
    ];

    allCases.forEach(function (caze) {
      it(caze.when + ', should return ' + caze.output + ' when answer is "' + caze.answer + '" and solution is "' + escape(caze.solution) + '"', function () {
        expect(service.match(caze.answer, caze.solution, caze.deactivations)).to.equal(caze.output);
      });
    });
  });


  describe('match, t1 deactivated', function () {

    const allCases = [
      {when:'no stress',                   output: 'ok', answer: '9lettres: courgette\n6lettres: chicon',        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',      deactivations: {t1:true}},
      {when:'spaces stress',               output: 'ko', answer: '9lettres: courgette\n6lettres: c h i c o n',   solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',      deactivations: {t1:true}},
      {when:'reverted spaces stress',      output: 'ko', answer: '9lettres: courgette\n6lettres: chicon',        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n-  c h i c o n \n- legume\n', deactivations: {t1:true}},
      {when:'uppercase stress',            output: 'ko', answer: '9lettres: courgette\n6lettres: CHICON',        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',      deactivations: {t1:true}},
      {when:'reverted uppercase stress',   output: 'ko', answer: '9lettres: courgette\n6lettres: chicon',        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- CHICON\n- legume\n',      deactivations: {t1:true}},
      {when:'accent stress',               output: 'ko', answer: '9lettres: courgette\n6lettres: îàéùô',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- iaeuo\n- legume\n',       deactivations: {t1:true}},
      {when:'reverted accent stress',      output: 'ko', answer: '9lettres: courgette\n6lettres: iaeuo',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- îàéùô\n- legume\n',       deactivations: {t1:true}},
      {when:'diacritic stress',            output: 'ko', answer: '9lettres: courgette\n6lettres: ççççç',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- ccccc\n- legume\n',       deactivations: {t1:true}},
      {when:'reverted diacritic stress',   output: 'ko', answer: '9lettres: courgette\n6lettres: ccccc',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- ççççç\n- legume\n',       deactivations: {t1:true}},
      {when:'punctuation stress',          output: 'ok', answer: '9lettres: courgette\n6lettres: .!p-u-n-c-t',   solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- punct\n- legume\n',       deactivations: {t1:true}},
      {when:'reverted punctuation stress', output: 'ok', answer: '9lettres: courgette\n6lettres: punct',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- .!p-u-n-c-t\n- legume\n', deactivations: {t1:true}},
      {when:'levenshtein stress',          output: 'ok', answer: '9lettres: courgette\n6lettres: 0123456789',    solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- 123456789\n- legume\n',   deactivations: {t1:true}},
      {when:'reverted levenshtein stress', output: 'ok', answer: '9lettres: courgette\n6lettres: 123456789',     solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- 0123456789\n- legume\n',  deactivations: {t1:true}},
    ];

    allCases.forEach(function (caze) {
      it(caze.when + ', should return ' + caze.output + ' when answer is "' + caze.answer + '" and solution is "' + escape(caze.solution) + '"', function () {
        expect(service.match(caze.answer, caze.solution, caze.deactivations)).to.equal(caze.output);
      });
    });
  });


  describe('match, t2 deactivated', function () {

    const allCases = [
      {when:'no stress',                   output: 'ok', answer: '9lettres: courgette\n6lettres: chicon',        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',        deactivations: {t2:true}},
      {when:'spaces stress',               output: 'ok', answer: '9lettres: courgette\n6lettres: c h i c o n',   solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',        deactivations: {t2:true}},
      {when:'reverted spaces stress',      output: 'ok', answer: '9lettres: courgette\n6lettres: chicon',        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n-  c h i c o n \n- legume\n', deactivations: {t2:true}},
      {when:'uppercase stress',            output: 'ok', answer: '9lettres: courgette\n6lettres: CHICON',        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',        deactivations: {t2:true}},
      {when:'reverted uppercase stress',   output: 'ok', answer: '9lettres: courgette\n6lettres: chicon',        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- CHICON\n- legume\n',        deactivations: {t2:true}},
      {when:'accent stress',               output: 'ok', answer: '9lettres: courgette\n6lettres: îàéùô',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- iaeuo\n- legume\n',         deactivations: {t2:true}},
      {when:'reverted accent stress',      output: 'ok', answer: '9lettres: courgette\n6lettres: iaeuo',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- îàéùô\n- legume\n',         deactivations: {t2:true}},
      {when:'diacritic stress',            output: 'ok', answer: '9lettres: courgette\n6lettres: ççççç',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- ccccc\n- legume\n',         deactivations: {t2:true}},
      {when:'reverted diacritic stress',   output: 'ok', answer: '9lettres: courgette\n6lettres: ccccc',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- ççççç\n- legume\n',         deactivations: {t2:true}},
      {when:'punctuation stress',          output: 'ko', answer: '9lettres: courgette\n6lettres: .!p-u-n-c-t',   solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- punct\n- legume\n',         deactivations: {t2:true}},
      {when:'reverted punctuation stress', output: 'ko', answer: '9lettres: courgette\n6lettres: punct',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- .!p-u-n-c-t\n- legume\n',   deactivations: {t2:true}},
      {when:'levenshtein stress',          output: 'ok', answer: '9lettres: courgette\n6lettres: 0123456789',    solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- 123456789\n- legume\n',     deactivations: {t2:true}},
      {when:'reverted levenshtein stress', output: 'ok', answer: '9lettres: courgette\n6lettres: 123456789',     solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- 0123456789\n- legume\n',    deactivations: {t2:true}},
    ];

    allCases.forEach(function (caze) {
      it(caze.when + ', should return ' + caze.output + ' when answer is "' + caze.answer + '" and solution is "' + escape(caze.solution) + '"', function () {
        expect(service.match(caze.answer, caze.solution, caze.deactivations)).to.equal(caze.output);
      });
    });
  });


  describe('match, t3 deactivated', function () {

    const allCases = [
      {when:'no stress',                   output: 'ok', answer: '9lettres: courgette\n6lettres: chicon',        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',        deactivations: {t3:true}},
      {when:'spaces stress',               output: 'ok', answer: '9lettres: courgette\n6lettres: c h i c o n',   solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',        deactivations: {t3:true}},
      {when:'reverted spaces stress',      output: 'ok', answer: '9lettres: courgette\n6lettres: chicon',        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n-  c h i c o n \n- legume\n', deactivations: {t3:true}},
      {when:'uppercase stress',            output: 'ok', answer: '9lettres: courgette\n6lettres: CHICON',        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',        deactivations: {t3:true}},
      {when:'reverted uppercase stress',   output: 'ok', answer: '9lettres: courgette\n6lettres: chicon',        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- CHICON\n- legume\n',        deactivations: {t3:true}},
      {when:'accent stress',               output: 'ok', answer: '9lettres: courgette\n6lettres: îàéùô',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- iaeuo\n- legume\n',         deactivations: {t3:true}},
      {when:'reverted accent stress',      output: 'ok', answer: '9lettres: courgette\n6lettres: iaeuo',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- îàéùô\n- legume\n',         deactivations: {t3:true}},
      {when:'diacritic stress',            output: 'ok', answer: '9lettres: courgette\n6lettres: ççççç',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- ccccc\n- legume\n',         deactivations: {t3:true}},
      {when:'reverted diacritic stress',   output: 'ok', answer: '9lettres: courgette\n6lettres: ccccc',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- ççççç\n- legume\n',         deactivations: {t3:true}},
      {when:'punctuation stress',          output: 'ok', answer: '9lettres: courgette\n6lettres: .!p-u-n-c-t',   solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- punct\n- legume\n',         deactivations: {t3:true}},
      {when:'reverted punctuation stress', output: 'ok', answer: '9lettres: courgette\n6lettres: punct',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- .!p-u-n-c-t\n- legume\n',   deactivations: {t3:true}},
      {when:'levenshtein stress',          output: 'ko', answer: '9lettres: courgette\n6lettres: 0123456789',    solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- 123456789\n- legume\n',     deactivations: {t3:true}},
      {when:'reverted levenshtein stress', output: 'ko', answer: '9lettres: courgette\n6lettres: 123456789',     solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- 0123456789\n- legume\n',    deactivations: {t3:true}},
    ];

    allCases.forEach(function (caze) {
      it(caze.when + ', should return ' + caze.output + ' when answer is "' + caze.answer + '" and solution is "' + escape(caze.solution) + '"', function () {
        expect(service.match(caze.answer, caze.solution, caze.deactivations)).to.equal(caze.output);
      });
    });
  });


  describe('match, t1 and t2 deactivated', function () {

    const allCases = [
      {when:'no stress',                   output: 'ok', answer: '9lettres: courgette\n6lettres: chicon',        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',        deactivations: {t1:true, t2:true}},
      {when:'spaces stress',               output: 'ko', answer: '9lettres: courgette\n6lettres: c h i c o n',   solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',        deactivations: {t1:true, t2:true}},
      {when:'reverted spaces stress',      output: 'ko', answer: '9lettres: courgette\n6lettres: chicon',        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n-  c h i c o n \n- legume\n', deactivations: {t1:true, t2:true}},
      {when:'uppercase stress',            output: 'ko', answer: '9lettres: courgette\n6lettres: CHICON',        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',        deactivations: {t1:true, t2:true}},
      {when:'reverted uppercase stress',   output: 'ko', answer: '9lettres: courgette\n6lettres: chicon',        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- CHICON\n- legume\n',        deactivations: {t1:true, t2:true}},
      {when:'accent stress',               output: 'ko', answer: '9lettres: courgette\n6lettres: îàéùô',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- iaeuo\n- legume\n',         deactivations: {t1:true, t2:true}},
      {when:'reverted accent stress',      output: 'ko', answer: '9lettres: courgette\n6lettres: iaeuo',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- îàéùô\n- legume\n',         deactivations: {t1:true, t2:true}},
      {when:'diacritic stress',            output: 'ko', answer: '9lettres: courgette\n6lettres: ççççç',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- ccccc\n- legume\n',         deactivations: {t1:true, t2:true}},
      {when:'reverted diacritic stress',   output: 'ko', answer: '9lettres: courgette\n6lettres: ccccc',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- ççççç\n- legume\n',         deactivations: {t1:true, t2:true}},
      {when:'punctuation stress',          output: 'ko', answer: '9lettres: courgette\n6lettres: .!p-u-n-c-t',   solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- punct\n- legume\n',         deactivations: {t1:true, t2:true}},
      {when:'reverted punctuation stress', output: 'ko', answer: '9lettres: courgette\n6lettres: punct',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- .!p-u-n-c-t\n- legume\n',   deactivations: {t1:true, t2:true}},
      {when:'levenshtein stress',          output: 'ok', answer: '9lettres: courgette\n6lettres: 0123456789',    solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- 123456789\n- legume\n',     deactivations: {t1:true, t2:true}},
      {when:'reverted levenshtein stress', output: 'ok', answer: '9lettres: courgette\n6lettres: 123456789',     solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- 0123456789\n- legume\n',    deactivations: {t1:true, t2:true}},
    ];

    allCases.forEach(function (caze) {
      it(caze.when + ', should return ' + caze.output + ' when answer is "' + caze.answer + '" and solution is "' + escape(caze.solution) + '"', function () {
        expect(service.match(caze.answer, caze.solution, caze.deactivations)).to.equal(caze.output);
      });
    });
  });


  describe('match, t1 and t3 deactivated', function () {

    const allCases = [
      {when:'no stress',                   output: 'ok', answer: '9lettres: courgette\n6lettres: chicon',        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',        deactivations: {t1:true, t3:true}},
      {when:'spaces stress',               output: 'ko', answer: '9lettres: courgette\n6lettres: c h i c o n',   solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',        deactivations: {t1:true, t3:true}},
      {when:'reverted spaces stress',      output: 'ko', answer: '9lettres: courgette\n6lettres: chicon',        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n-  c h i c o n \n- legume\n', deactivations: {t1:true, t3:true}},
      {when:'uppercase stress',            output: 'ko', answer: '9lettres: courgette\n6lettres: CHICON',        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',        deactivations: {t1:true, t3:true}},
      {when:'reverted uppercase stress',   output: 'ko', answer: '9lettres: courgette\n6lettres: chicon',        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- CHICON\n- legume\n',        deactivations: {t1:true, t3:true}},
      {when:'accent stress',               output: 'ko', answer: '9lettres: courgette\n6lettres: îàéùô',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- iaeuo\n- legume\n',         deactivations: {t1:true, t3:true}},
      {when:'reverted accent stress',      output: 'ko', answer: '9lettres: courgette\n6lettres: iaeuo',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- îàéùô\n- legume\n',         deactivations: {t1:true, t3:true}},
      {when:'diacritic stress',            output: 'ko', answer: '9lettres: courgette\n6lettres: ççççç',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- ccccc\n- legume\n',         deactivations: {t1:true, t3:true}},
      {when:'reverted diacritic stress',   output: 'ko', answer: '9lettres: courgette\n6lettres: ccccc',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- ççççç\n- legume\n',         deactivations: {t1:true, t3:true}},
      {when:'punctuation stress',          output: 'ok', answer: '9lettres: courgette\n6lettres: .!p-u-n-c-t',   solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- punct\n- legume\n',         deactivations: {t1:true, t3:true}},
      {when:'reverted punctuation stress', output: 'ok', answer: '9lettres: courgette\n6lettres: punct',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- .!p-u-n-c-t\n- legume\n',   deactivations: {t1:true, t3:true}},
      {when:'levenshtein stress',          output: 'ko', answer: '9lettres: courgette\n6lettres: 0123456789',    solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- 123456789\n- legume\n',     deactivations: {t1:true, t3:true}},
      {when:'reverted levenshtein stress', output: 'ko', answer: '9lettres: courgette\n6lettres: 123456789',     solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- 0123456789\n- legume\n',    deactivations: {t1:true, t3:true}},
    ];

    allCases.forEach(function (caze) {
      it(caze.when + ', should return ' + caze.output + ' when answer is "' + caze.answer + '" and solution is "' + escape(caze.solution) + '"', function () {
        expect(service.match(caze.answer, caze.solution, caze.deactivations)).to.equal(caze.output);
      });
    });
  });

  describe('match, t2 and t3 deactivated', function () {

    const allCases = [
      {when:'no stress',                   output: 'ok', answer: '9lettres: courgette\n6lettres: chicon',        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',        deactivations: {t2:true, t3:true}},
      {when:'spaces stress',               output: 'ok', answer: '9lettres: courgette\n6lettres: c h i c o n',   solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',        deactivations: {t2:true, t3:true}},
      {when:'reverted spaces stress',      output: 'ok', answer: '9lettres: courgette\n6lettres: chicon',        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n-  c h i c o n \n- legume\n', deactivations: {t2:true, t3:true}},
      {when:'uppercase stress',            output: 'ok', answer: '9lettres: courgette\n6lettres: CHICON',        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',        deactivations: {t2:true, t3:true}},
      {when:'reverted uppercase stress',   output: 'ok', answer: '9lettres: courgette\n6lettres: chicon',        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- CHICON\n- legume\n',        deactivations: {t2:true, t3:true}},
      {when:'accent stress',               output: 'ok', answer: '9lettres: courgette\n6lettres: îàéùô',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- iaeuo\n- legume\n',         deactivations: {t2:true, t3:true}},
      {when:'reverted accent stress',      output: 'ok', answer: '9lettres: courgette\n6lettres: iaeuo',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- îàéùô\n- legume\n',         deactivations: {t2:true, t3:true}},
      {when:'diacritic stress',            output: 'ok', answer: '9lettres: courgette\n6lettres: ççççç',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- ccccc\n- legume\n',         deactivations: {t2:true, t3:true}},
      {when:'reverted diacritic stress',   output: 'ok', answer: '9lettres: courgette\n6lettres: ccccc',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- ççççç\n- legume\n',         deactivations: {t2:true, t3:true}},
      {when:'punctuation stress',          output: 'ko', answer: '9lettres: courgette\n6lettres: .!p-u-n-c-t',   solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- punct\n- legume\n',         deactivations: {t2:true, t3:true}},
      {when:'reverted punctuation stress', output: 'ko', answer: '9lettres: courgette\n6lettres: punct',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- .!p-u-n-c-t\n- legume\n',   deactivations: {t2:true, t3:true}},
      {when:'levenshtein stress',          output: 'ko', answer: '9lettres: courgette\n6lettres: 0123456789',    solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- 123456789\n- legume\n',     deactivations: {t2:true, t3:true}},
      {when:'reverted levenshtein stress', output: 'ko', answer: '9lettres: courgette\n6lettres: 123456789',     solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- 0123456789\n- legume\n',    deactivations: {t2:true, t3:true}},
    ];

    allCases.forEach(function (caze) {
      it(caze.when + ', should return ' + caze.output + ' when answer is "' + caze.answer + '" and solution is "' + escape(caze.solution) + '"', function () {
        expect(service.match(caze.answer, caze.solution, caze.deactivations)).to.equal(caze.output);
      });
    });
  });

  describe('match, t1, t2 and t3 deactivated', function () {

    const allCases = [
      {when:'no stress',                   output: 'ok', answer: '9lettres: courgette\n6lettres: chicon',        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',        deactivations: {t1:true, t2:true, t3:true}},
      {when:'spaces stress',               output: 'ko', answer: '9lettres: courgette\n6lettres: c h i c o n',   solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',        deactivations: {t1:true, t2:true, t3:true}},
      {when:'reverted spaces stress',      output: 'ko', answer: '9lettres: courgette\n6lettres: chicon',        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n-  c h i c o n \n- legume\n', deactivations: {t1:true, t2:true, t3:true}},
      {when:'uppercase stress',            output: 'ko', answer: '9lettres: courgette\n6lettres: CHICON',        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- chicon\n- legume\n',        deactivations: {t1:true, t2:true, t3:true}},
      {when:'reverted uppercase stress',   output: 'ko', answer: '9lettres: courgette\n6lettres: chicon',        solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- CHICON\n- legume\n',        deactivations: {t1:true, t2:true, t3:true}},
      {when:'accent stress',               output: 'ko', answer: '9lettres: courgette\n6lettres: îàéùô',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- iaeuo\n- legume\n',         deactivations: {t1:true, t2:true, t3:true}},
      {when:'reverted accent stress',      output: 'ko', answer: '9lettres: courgette\n6lettres: iaeuo',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- îàéùô\n- legume\n',         deactivations: {t1:true, t2:true, t3:true}},
      {when:'diacritic stress',            output: 'ko', answer: '9lettres: courgette\n6lettres: ççççç',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- ccccc\n- legume\n',         deactivations: {t1:true, t2:true, t3:true}},
      {when:'reverted diacritic stress',   output: 'ko', answer: '9lettres: courgette\n6lettres: ccccc',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- ççççç\n- legume\n',         deactivations: {t1:true, t2:true, t3:true}},
      {when:'punctuation stress',          output: 'ko', answer: '9lettres: courgette\n6lettres: .!p-u-n-c-t',   solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- punct\n- legume\n',         deactivations: {t1:true, t2:true, t3:true}},
      {when:'reverted punctuation stress', output: 'ko', answer: '9lettres: courgette\n6lettres: punct',         solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- .!p-u-n-c-t\n- legume\n',   deactivations: {t1:true, t2:true, t3:true}},
      {when:'levenshtein stress',          output: 'ko', answer: '9lettres: courgette\n6lettres: 0123456789',    solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- 123456789\n- legume\n',     deactivations: {t1:true, t2:true, t3:true}},
      {when:'reverted levenshtein stress', output: 'ko', answer: '9lettres: courgette\n6lettres: 123456789',     solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- 0123456789\n- legume\n',    deactivations: {t1:true, t2:true, t3:true}},
    ];

    allCases.forEach(function (caze) {
      it(caze.when + ', should return ' + caze.output + ' when answer is "' + caze.answer + '" and solution is "' + escape(caze.solution) + '"', function () {
        expect(service.match(caze.answer, caze.solution, caze.deactivations)).to.equal(caze.output);
      });
    });
  });

});

