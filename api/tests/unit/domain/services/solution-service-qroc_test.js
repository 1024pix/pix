const { describe, it, expect } = require('../../../test-helper');

const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const service = require('../../../../lib/domain/services/solution-service-qroc');

const ANSWER_KO = AnswerStatus.KO;
const ANSWER_OK = AnswerStatus.OK;

describe('Unit | Service | SolutionServiceQROC ', function() {

  describe('match, combining most weird cases without deactivations', function() {

    const successfulCases = [

      { case:'(single solution) same answer and solution', answer: 'Answer', solution: 'Answer' },
      { case:'(single solution) same answer and solution, but answer is lowercased, solution is uppercased', answer: 'answer', solution: 'ANSWER' },
      { case:'(single solution) answer with spaces, solution hasnt', answer: 'a b c d e', solution: 'abcde' },
      { case:'(single solution) answer with unbreakable spaces, solution hasnt', answer: 'a b c d e', solution: 'abcde' },
      { case:'(single solution) solution with trailing spaces', answer: 'abcd', solution: '    abcd   ' },
      { case:'(single solution) solution with trailing spaces and uppercase', answer: 'aaa bbb ccc', solution: '    AAABBBCCC   ' },
      { case:'(single solution) answer is 0.1 away from solution', answer: '0123456789', solution: '123456789' },
      { case:'(single solution) answer is 0.25 away from solution', answer: '01234', solution: '1234' },
      { case:'(single solution) solution contains too much spaces', answer: 'a b c d e', solution: 'a b c d e' },
      { case:'(single solution) answer without punctuation, but solution has', answer: ',.!p-u-n-c-t', solution: 'punct' },
      { case:'(single solution) answer with punctuation, but solution has not', answer: 'punct', solution: ',.!p-u-n-c-t' },
      { case:'(single solution) answer without accent, but solution has', answer: 'with accents eee', solution: 'wîth àccénts êêê' },
      { case:'(single solution) answer with accent, but solution has not', answer: 'wîth àccénts êêê', solution: 'with accents eee' },
      { case:'(multiple solutions) answer is amongst solution', answer: 'variant 1', solution: 'variant 1\nvariant 2\nvariant 3\n' },
      { case:'(multiple solutions) answer is 0.2 away from the closest solution', answer: 'quack', solution: 'quacks\nazertysqdf\nblablabla\n' },
      { case:'(multiple solutions) answer is 0.25 away from the closest solution', answer: 'quak', solution: 'qvak\nqwak\nanything\n' }
    ];

    successfulCases.forEach(function(caze) {
      it (caze.case + ', should return "ok" when answer is "' + caze.answer + '" and solution is "' + escape(caze.solution) + '"', function() {
        expect(service.match(caze.answer, caze.solution)).to.deep.equal(ANSWER_OK);
      });
    });

    const failingCases = [
      { case:'solution do not exists', answer: 'any answer' },
      { case:'solution is not a String', answer: 'a', solution : new Date() },
      { case:'solution is empty', answer: '', solution : '' },
      { case:'answer is not a String', answer: new Date(), solution : '' },
      { case:'answer does not match any solution variants', answer: 'abandoned answer', solution: 'unmatched solution variant' },
      { case:'(single solution) answer is 0.3 away from solution', answer: '0123456789', solution: '1234567' },
      { case:'(single solution) answer is 0.5 away from solution', answer: '0123456789', solution: '12345' },
      { case:'(single solution) answer is 10 away from solution', answer: 'a', solution: '0123456789' },
      { case:'(multiple solutions) answer is minimum 0.4 away from a solution', answer: 'quaks', solution: 'qvakes\nqwakes\nanything\n' }
    ];

    failingCases.forEach(function(caze) {
      it(caze.case + ', should return "ko" when answer is "' + caze.answer + '" and solution is "' + escape(caze.solution) + '"', function() {
        expect(service.match(caze.answer, caze.solution)).to.deep.equal(ANSWER_KO);
      });
    });

  });

  describe('match, strong focus on treatments', function() {

    const allCases = [
      { when:'no stress',                   output: ANSWER_OK, answer: 'Answer',      solution: '\nvariant1\nAnswer\n',      deactivations: {} },
      { when:'spaces stress',               output: ANSWER_OK, answer: 'a b c d e',   solution: '\nvariant1\nabcde\n',       deactivations: {} },
      { when:'reverted spaces stress',      output: ANSWER_OK, answer: 'abcde',       solution: '\nvariant1\na b c d e\n',   deactivations: {} },
      { when:'uppercase stress',            output: ANSWER_OK, answer: 'ANSWER',      solution: '\nvariant1\nanswer\n',      deactivations: {} },
      { when:'reverted uppercase stress',   output: ANSWER_OK, answer: 'answer',      solution: '\nvariant1\nANSWER\n',      deactivations: {} },
      { when:'accent stress',               output: ANSWER_OK, answer: 'îàé êêê',     solution: '\nvariant1\niae eee\n',     deactivations: {} },
      { when:'reverted accent stress',      output: ANSWER_OK, answer: 'iae eee',     solution: '\nvariant1\nîàé êêê\n',     deactivations: {} },
      { when:'diacritic stress',            output: ANSWER_OK, answer: 'ççççç',       solution: '\nvariant1\nccccc\n',       deactivations: {} },
      { when:'reverted diacritic stress',   output: ANSWER_OK, answer: 'ccccc',       solution: '\nvariant1\nççççç\n',       deactivations: {} },
      { when:'punctuation stress',          output: ANSWER_OK, answer: '.!p-u-n-c-t', solution: '\nvariant1\npunct\n',       deactivations: {} },
      { when:'reverted punctuation stress', output: ANSWER_OK, answer: 'punct',       solution: '\nvariant1\n.!p-u-n-c-t\n', deactivations: {} },
      { when:'levenshtein stress',          output: ANSWER_OK, answer: '0123456789',  solution: '\nvariant1\n123456789\n',   deactivations: {} },
      { when:'reverted levenshtein stress', output: ANSWER_OK, answer: '123456789',   solution: '\nvariant1\n0123456789\n',  deactivations: {} },
    ];

    allCases.forEach(function(caze) {
      it(caze.when + ', should return ' + caze.output + ' when answer is "' + caze.answer + '" and solution is "' + escape(caze.solution) + '"', function() {
        expect(service.match(caze.answer, caze.solution, caze.deactivations)).to.deep.equal(caze.output);
      });
    });
  });

  describe('match | t1 deactivated', function() {

    const allCases = [
      { when:'no stress',                   output: ANSWER_OK, answer: 'Answer',      solution: '\nvariant1\nAnswer\n',      deactivations: { t1:true } },
      { when:'spaces stress',               output: ANSWER_KO, answer: 'a b c d e',   solution: '\nvariant1\nabcde\n',       deactivations: { t1:true } },
      { when:'reverted spaces stress',      output: ANSWER_KO, answer: 'abcde',       solution: '\nvariant1\na b c d e\n',   deactivations: { t1:true } },
      { when:'uppercase stress',            output: ANSWER_KO, answer: 'ANSWER',      solution: '\nvariant1\nanswer\n',      deactivations: { t1:true } },
      { when:'reverted uppercase stress',   output: ANSWER_KO, answer: 'answer',      solution: '\nvariant1\nANSWER\n',      deactivations: { t1:true } },
      { when:'accent stress',               output: ANSWER_KO, answer: 'îàé êêê',     solution: '\nvariant1\niae eee\n',     deactivations: { t1:true } },
      { when:'reverted accent stress',      output: ANSWER_KO, answer: 'iae eee',     solution: '\nvariant1\nîàé êêê\n',     deactivations: { t1:true } },
      { when:'diacritic stress',            output: ANSWER_KO, answer: 'ççççç',       solution: '\nvariant1\nccccc\n',       deactivations: { t1:true } },
      { when:'reverted diacritic stress',   output: ANSWER_KO, answer: 'ccccc',       solution: '\nvariant1\nççççç\n',       deactivations: { t1:true } },
      { when:'punctuation stress',          output: ANSWER_OK, answer: '.!p-u-n-c-t', solution: '\nvariant1\npunct\n',       deactivations: { t1:true } },
      { when:'reverted punctuation stress', output: ANSWER_OK, answer: 'punct',       solution: '\nvariant1\n.!p-u-n-c-t\n', deactivations: { t1:true } },
      { when:'levenshtein stress',          output: ANSWER_OK, answer: '0123456789',  solution: '\nvariant1\n123456789\n',   deactivations: { t1:true } },
      { when:'reverted levenshtein stress', output: ANSWER_OK, answer: '123456789',   solution: '\nvariant1\n0123456789\n',  deactivations: { t1:true } },
    ];

    allCases.forEach(function(caze) {
      it(caze.when + ', should return ' + caze.output + ' when answer is "' + caze.answer + '" and solution is "' + escape(caze.solution) + '"', function() {
        expect(service.match(caze.answer, caze.solution, caze.deactivations)).to.deep.equal(caze.output);
      });
    });
  });

  describe('match | t2 deactivated', function() {

    const allCases = [
      { when:'no stress',                   output: ANSWER_OK, answer: 'Answer',      solution: '\nvariant1\nAnswer\n',      deactivations: { t2:true } },
      { when:'spaces stress',               output: ANSWER_OK, answer: 'a b c d e',   solution: '\nvariant1\nabcde\n',       deactivations: { t2:true } },
      { when:'reverted spaces stress',      output: ANSWER_OK, answer: 'abcde',       solution: '\nvariant1\na b c d e\n',   deactivations: { t2:true } },
      { when:'uppercase stress',            output: ANSWER_OK, answer: 'ANSWER',      solution: '\nvariant1\nanswer\n',      deactivations: { t2:true } },
      { when:'reverted uppercase stress',   output: ANSWER_OK, answer: 'answer',      solution: '\nvariant1\nANSWER\n',      deactivations: { t2:true } },
      { when:'accent stress',               output: ANSWER_OK, answer: 'îàé êêê',     solution: '\nvariant1\niae eee\n',     deactivations: { t2:true } },
      { when:'reverted accent stress',      output: ANSWER_OK, answer: 'iae eee',     solution: '\nvariant1\nîàé êêê\n',     deactivations: { t2:true } },
      { when:'diacritic stress',            output: ANSWER_OK, answer: 'ççççç',       solution: '\nvariant1\nccccc\n',       deactivations: { t2:true } },
      { when:'reverted diacritic stress',   output: ANSWER_OK, answer: 'ccccc',       solution: '\nvariant1\nççççç\n',       deactivations: { t2:true } },
      { when:'punctuation stress',          output: ANSWER_KO, answer: '.!p-u-n-c-t', solution: '\nvariant1\npunct\n',       deactivations: { t2:true } },
      { when:'reverted punctuation stress', output: ANSWER_KO, answer: 'punct',       solution: '\nvariant1\n.!p-u-n-c-t\n', deactivations: { t2:true } },
      { when:'levenshtein stress',          output: ANSWER_OK, answer: '0123456789',  solution: '\nvariant1\n123456789\n',   deactivations: { t2:true } },
      { when:'reverted levenshtein stress', output: ANSWER_OK, answer: '123456789',   solution: '\nvariant1\n0123456789\n',  deactivations: { t2:true } },
    ];

    allCases.forEach(function(caze) {
      it(caze.when + ', should return ' + caze.output + ' when answer is "' + caze.answer + '" and solution is "' + escape(caze.solution) + '"', function() {
        expect(service.match(caze.answer, caze.solution, caze.deactivations)).to.deep.equal(caze.output);
      });
    });
  });

  describe('match | t3 deactivated', function() {

    const allCases = [
      { when:'no stress',                   output: ANSWER_OK, answer: 'Answer',      solution: '\nvariant1\nAnswer\n',      deactivations: { t3:true } },
      { when:'spaces stress',               output: ANSWER_OK, answer: 'a b c d e',   solution: '\nvariant1\nabcde\n',       deactivations: { t3:true } },
      { when:'reverted spaces stress',      output: ANSWER_OK, answer: 'abcde',       solution: '\nvariant1\na b c d e\n',   deactivations: { t3:true } },
      { when:'uppercase stress',            output: ANSWER_OK, answer: 'ANSWER',      solution: '\nvariant1\nanswer\n',      deactivations: { t3:true } },
      { when:'reverted uppercase stress',   output: ANSWER_OK, answer: 'answer',      solution: '\nvariant1\nANSWER\n',      deactivations: { t3:true } },
      { when:'accent stress',               output: ANSWER_OK, answer: 'îàé êêê',     solution: '\nvariant1\niae eee\n',     deactivations: { t3:true } },
      { when:'reverted accent stress',      output: ANSWER_OK, answer: 'iae eee',     solution: '\nvariant1\nîàé êêê\n',     deactivations: { t3:true } },
      { when:'diacritic stress',            output: ANSWER_OK, answer: 'ççççç',       solution: '\nvariant1\nccccc\n',       deactivations: { t3:true } },
      { when:'reverted diacritic stress',   output: ANSWER_OK, answer: 'ccccc',       solution: '\nvariant1\nççççç\n',       deactivations: { t3:true } },
      { when:'punctuation stress',          output: ANSWER_OK, answer: '.!p-u-n-c-t', solution: '\nvariant1\npunct\n',       deactivations: { t3:true } },
      { when:'reverted punctuation stress', output: ANSWER_OK, answer: 'punct',       solution: '\nvariant1\n.!p-u-n-c-t\n', deactivations: { t3:true } },
      { when:'levenshtein stress',          output: ANSWER_KO, answer: '0123456789',  solution: '\nvariant1\n123456789\n',   deactivations: { t3:true } },
      { when:'reverted levenshtein stress', output: ANSWER_KO, answer: '123456789',   solution: '\nvariant1\n0123456789\n',  deactivations: { t3:true } },
    ];

    allCases.forEach(function(caze) {
      it(caze.when + ', should return ' + caze.output + ' when answer is "' + caze.answer + '" and solution is "' + escape(caze.solution) + '"', function() {
        expect(service.match(caze.answer, caze.solution, caze.deactivations)).to.deep.equal(caze.output);
      });
    });
  });

  describe('match | t1 and t2 deactivated', function() {

    const allCases = [
      { when:'no stress',                   output: ANSWER_OK, answer: 'Answer',      solution: '\nvariant1\nAnswer\n',      deactivations: { t1:true, t2:true } },
      { when:'spaces stress',               output: ANSWER_KO, answer: 'a b c d e',   solution: '\nvariant1\nabcde\n',       deactivations: { t1:true, t2:true } },
      { when:'reverted spaces stress',      output: ANSWER_KO, answer: 'abcde',       solution: '\nvariant1\na b c d e\n',   deactivations: { t1:true, t2:true } },
      { when:'uppercase stress',            output: ANSWER_KO, answer: 'ANSWER',      solution: '\nvariant1\nanswer\n',      deactivations: { t1:true, t2:true } },
      { when:'reverted uppercase stress',   output: ANSWER_KO, answer: 'answer',      solution: '\nvariant1\nANSWER\n',      deactivations: { t1:true, t2:true } },
      { when:'accent stress',               output: ANSWER_KO, answer: 'îàé êêê',     solution: '\nvariant1\niae eee\n',     deactivations: { t1:true, t2:true } },
      { when:'reverted accent stress',      output: ANSWER_KO, answer: 'iae eee',     solution: '\nvariant1\nîàé êêê\n',     deactivations: { t1:true, t2:true } },
      { when:'diacritic stress',            output: ANSWER_KO, answer: 'ççççç',       solution: '\nvariant1\nccccc\n',       deactivations: { t1:true, t2:true } },
      { when:'reverted diacritic stress',   output: ANSWER_KO, answer: 'ccccc',       solution: '\nvariant1\nççççç\n',       deactivations: { t1:true, t2:true } },
      { when:'punctuation stress',          output: ANSWER_KO, answer: '.!p-u-n-c-t', solution: '\nvariant1\npunct\n',       deactivations: { t1:true, t2:true } },
      { when:'reverted punctuation stress', output: ANSWER_KO, answer: 'punct',       solution: '\nvariant1\n.!p-u-n-c-t\n', deactivations: { t1:true, t2:true } },
      { when:'levenshtein stress',          output: ANSWER_OK, answer: '0123456789',  solution: '\nvariant1\n123456789\n',   deactivations: { t1:true, t2:true } },
      { when:'reverted levenshtein stress', output: ANSWER_OK, answer: '123456789',   solution: '\nvariant1\n0123456789\n',  deactivations: { t1:true, t2:true } },
    ];

    allCases.forEach(function(caze) {
      it(caze.when + ', should return ' + caze.output + ' when answer is "' + caze.answer + '" and solution is "' + escape(caze.solution) + '"', function() {
        expect(service.match(caze.answer, caze.solution, caze.deactivations)).to.deep.equal(caze.output);
      });
    });
  });

  describe('match | t1 and t3 deactivated', function() {

    const allCases = [
      { when:'no stress',                   output: ANSWER_OK, answer: 'Answer',      solution: '\nvariant1\nAnswer\n',      deactivations: { t1:true, t3:true } },
      { when:'spaces stress',               output: ANSWER_KO, answer: 'a b c d e',   solution: '\nvariant1\nabcde\n',       deactivations: { t1:true, t3:true } },
      { when:'reverted spaces stress',      output: ANSWER_KO, answer: 'abcde',       solution: '\nvariant1\na b c d e\n',   deactivations: { t1:true, t3:true } },
      { when:'uppercase stress',            output: ANSWER_KO, answer: 'ANSWER',      solution: '\nvariant1\nanswer\n',      deactivations: { t1:true, t3:true } },
      { when:'reverted uppercase stress',   output: ANSWER_KO, answer: 'answer',      solution: '\nvariant1\nANSWER\n',      deactivations: { t1:true, t3:true } },
      { when:'accent stress',               output: ANSWER_KO, answer: 'îàé êêê',     solution: '\nvariant1\niae eee\n',     deactivations: { t1:true, t3:true } },
      { when:'reverted accent stress',      output: ANSWER_KO, answer: 'iae eee',     solution: '\nvariant1\nîàé êêê\n',     deactivations: { t1:true, t3:true } },
      { when:'diacritic stress',            output: ANSWER_KO, answer: 'ççççç',       solution: '\nvariant1\nccccc\n',       deactivations: { t1:true, t3:true } },
      { when:'reverted diacritic stress',   output: ANSWER_KO, answer: 'ccccc',       solution: '\nvariant1\nççççç\n',       deactivations: { t1:true, t3:true } },
      { when:'punctuation stress',          output: ANSWER_OK, answer: '.!p-u-n-c-t', solution: '\nvariant1\npunct\n',       deactivations: { t1:true, t3:true } },
      { when:'reverted punctuation stress', output: ANSWER_OK, answer: 'punct',       solution: '\nvariant1\n.!p-u-n-c-t\n', deactivations: { t1:true, t3:true } },
      { when:'levenshtein stress',          output: ANSWER_KO, answer: '0123456789',  solution: '\nvariant1\n123456789\n',   deactivations: { t1:true, t3:true } },
      { when:'reverted levenshtein stress', output: ANSWER_KO, answer: '123456789',   solution: '\nvariant1\n0123456789\n',  deactivations: { t1:true, t3:true } },
    ];

    allCases.forEach(function(caze) {
      it(caze.when + ', should return ' + caze.output + ' when answer is "' + caze.answer + '" and solution is "' + escape(caze.solution) + '"', function() {
        expect(service.match(caze.answer, caze.solution, caze.deactivations)).to.deep.equal(caze.output);
      });
    });
  });

  describe('match | t2 and t3 deactivated', function() {

    const allCases = [
      { when:'no stress',                   output: ANSWER_OK, answer: 'Answer',      solution: '\nvariant1\nAnswer\n',      deactivations: { t2:true, t3:true } },
      { when:'spaces stress',               output: ANSWER_OK, answer: 'a b c d e',   solution: '\nvariant1\nabcde\n',       deactivations: { t2:true, t3:true } },
      { when:'reverted spaces stress',      output: ANSWER_OK, answer: 'abcde',       solution: '\nvariant1\na b c d e\n',   deactivations: { t2:true, t3:true } },
      { when:'uppercase stress',            output: ANSWER_OK, answer: 'ANSWER',      solution: '\nvariant1\nanswer\n',      deactivations: { t2:true, t3:true } },
      { when:'reverted uppercase stress',   output: ANSWER_OK, answer: 'answer',      solution: '\nvariant1\nANSWER\n',      deactivations: { t2:true, t3:true } },
      { when:'accent stress',               output: ANSWER_OK, answer: 'îàé êêê',     solution: '\nvariant1\niae eee\n',     deactivations: { t2:true, t3:true } },
      { when:'reverted accent stress',      output: ANSWER_OK, answer: 'iae eee',     solution: '\nvariant1\nîàé êêê\n',     deactivations: { t2:true, t3:true } },
      { when:'diacritic stress',            output: ANSWER_OK, answer: 'ççççç',       solution: '\nvariant1\nccccc\n',       deactivations: { t2:true, t3:true } },
      { when:'reverted diacritic stress',   output: ANSWER_OK, answer: 'ccccc',       solution: '\nvariant1\nççççç\n',       deactivations: { t2:true, t3:true } },
      { when:'punctuation stress',          output: ANSWER_KO, answer: '.!p-u-n-c-t', solution: '\nvariant1\npunct\n',       deactivations: { t2:true, t3:true } },
      { when:'reverted punctuation stress', output: ANSWER_KO, answer: 'punct',       solution: '\nvariant1\n.!p-u-n-c-t\n', deactivations: { t2:true, t3:true } },
      { when:'levenshtein stress',          output: ANSWER_KO, answer: '0123456789',  solution: '\nvariant1\n123456789\n',   deactivations: { t2:true, t3:true } },
      { when:'reverted levenshtein stress', output: ANSWER_KO, answer: '123456789',   solution: '\nvariant1\n0123456789\n',  deactivations: { t2:true, t3:true } },
    ];

    allCases.forEach(function(caze) {
      it(caze.when + ', should return ' + caze.output + ' when answer is "' + caze.answer + '" and solution is "' + escape(caze.solution) + '"', function() {
        expect(service.match(caze.answer, caze.solution, caze.deactivations)).to.deep.equal(caze.output);
      });
    });
  });

  describe('match | t1, t2 and t3 deactivated', function() {

    const allCases = [
      { when:'no stress',                   output: ANSWER_OK, answer: 'Answer',      solution: '\nvariant1\nAnswer\n',      deactivations: { t1:true, t2:true, t3:true } },
      { when:'spaces stress',               output: ANSWER_KO, answer: 'a b c d e',   solution: '\nvariant1\nabcde\n',       deactivations: { t1:true, t2:true, t3:true } },
      { when:'reverted spaces stress',      output: ANSWER_KO, answer: 'abcde',       solution: '\nvariant1\na b c d e\n',   deactivations: { t1:true, t2:true, t3:true } },
      { when:'uppercase stress',            output: ANSWER_KO, answer: 'ANSWER',      solution: '\nvariant1\nanswer\n',      deactivations: { t1:true, t2:true, t3:true } },
      { when:'reverted uppercase stress',   output: ANSWER_KO, answer: 'answer',      solution: '\nvariant1\nANSWER\n',      deactivations: { t1:true, t2:true, t3:true } },
      { when:'accent stress',               output: ANSWER_KO, answer: 'îàé êêê',     solution: '\nvariant1\niae eee\n',     deactivations: { t1:true, t2:true, t3:true } },
      { when:'reverted accent stress',      output: ANSWER_KO, answer: 'iae eee',     solution: '\nvariant1\nîàé êêê\n',     deactivations: { t1:true, t2:true, t3:true } },
      { when:'diacritic stress',            output: ANSWER_KO, answer: 'ççççç',       solution: '\nvariant1\nccccc\n',       deactivations: { t1:true, t2:true, t3:true } },
      { when:'reverted diacritic stress',   output: ANSWER_KO, answer: 'ccccc',       solution: '\nvariant1\nççççç\n',       deactivations: { t1:true, t2:true, t3:true } },
      { when:'punctuation stress',          output: ANSWER_KO, answer: '.!p-u-n-c-t', solution: '\nvariant1\npunct\n',       deactivations: { t1:true, t2:true, t3:true } },
      { when:'reverted punctuation stress', output: ANSWER_KO, answer: 'punct',       solution: '\nvariant1\n.!p-u-n-c-t\n', deactivations: { t1:true, t2:true, t3:true } },
      { when:'levenshtein stress',          output: ANSWER_KO, answer: '0123456789',  solution: '\nvariant1\n123456789\n',   deactivations: { t1:true, t2:true, t3:true } },
      { when:'reverted levenshtein stress', output: ANSWER_KO, answer: '123456789',   solution: '\nvariant1\n0123456789\n',  deactivations: { t1:true, t2:true, t3:true } },
    ];

    allCases.forEach(function(caze) {
      it(caze.when + ', should return ' + caze.output + ' when answer is "' + caze.answer + '" and solution is "' + escape(caze.solution) + '"', function() {
        expect(service.match(caze.answer, caze.solution, caze.deactivations)).to.deep.equal(caze.output);
      });
    });
  });

});
