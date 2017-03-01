const { describe, it } = require('mocha');
const { expect } = require('chai');
const service = require('../../../../lib/domain/services/solution-service-utils');


describe('Unit | Domain | Services | solution-service-utils', function () {



  describe('_treatmentT1', function() {
    it('Should exist', function () {
      expect(service._treatmentT1).to.exist;
    });

    const successfulCases = [
      { should: 'Should return the input if no treatment applies', input: 'm', output: 'm' },
      { should: 'Should remove accents & diacritics', input: 'çrûlée', output: 'crulee' },
      { should: 'Should remove uppercase', input: 'BrûLée', output: 'brulee' },
      { should: 'Should remove single space between', input: 'Crème BrûLée', output: 'cremebrulee' },
      { should: 'Should replace double space between into one', input: 'Crème  BrûLée', output: 'cremebrulee' },
      { should: 'Should remove all consecutive spaces between into one', input: 'CrèmeBrûLée', output: 'cremebrulee' },
      { should: 'Should remove leading and trailing spaces', input: ' Crème BrûLée  ', output: 'cremebrulee' },
      { should: 'Should remove all spaces, even multiplied & repeated', input: ' Crème BrûLée   1   2  ', output: 'cremebrulee12' }
    ];

    successfulCases.forEach(function (testCase) {
      it(testCase.should + ', for example "' + testCase.input + '" => "' + testCase.output + '"', function () {
        expect(service._treatmentT1(testCase.input)).to.equal(testCase.output);
      });
    });

  });

  describe('_treatmentT2', function() {
    it('Should exist', function () {
      expect(service._treatmentT2).to.exist;
    });
    it('Should remove all punctation from String, example "Th!!is., -/ is #! an $ % ^ & * example ;: {} of a = -_ string with `~)() punctuation" => "This is an example of a string with punctuation"', function () {
      expect(service._treatmentT2('Th!!is., -/ is #! an $ % ^ & * example ;: {} of a = -_ string with `~)() punctuation')).to.equal('This is an example of a string with punctuation');
    });
  });

  describe('_treatmentT3', function() {
    it('Should exist', function () {
      expect(service._treatmentT3).to.exist;
    });
    describe ('Should return the ratio levenshtein / userAnswer.length', function () {

      const successfulCases = [
        { should: 'If only one adminAnswer', userAnswer: 'a1', adminAnswer: ['a1'], output: 0 },
        { should: 'If many adminAnswers', userAnswer: 'a1', adminAnswer: ['a1', 'a2', 'a3'], output: 0 },
        { should: 'If ratio is 0.1, single adminAnswer', userAnswer: 'abbbbbbbbb', adminAnswer: ['bbbbbbbbbb'], output: 0.1 },
        { should: 'If ratio is 0.2, multiple adminAnswer', userAnswer: 'quack', adminAnswer: ['quacks', 'azertyqwerk'], output: 0.2 },
        { should: 'If ratio is 0.5, multiple adminAnswer', userAnswer: 'book', adminAnswer: ['back', 'buck'], output: 0.5 },
        { should: 'If ratio is 10, single adminAnswer', userAnswer: 'a', adminAnswer: ['bbbbbbbbbb'], output: 10 },
      ];

      successfulCases.forEach(function (testCase) {
        it(testCase.should + ', for example userAnswer ' + JSON.stringify(testCase.userAnswer) + ', and adminAnswer ' + JSON.stringify(testCase.adminAnswer) + ' => ' + testCase.output + '', function () {
          expect(service._treatmentT3(testCase.userAnswer, testCase.adminAnswer)).to.equal(testCase.output);
        });
      });
    });
  });

  describe('_getSmallestLevenshteinDistance', function() {

    it('Should exist', function () {
      expect(service._getSmallestLevenshteinDistance).to.exist;
    });

    describe('Should return levenshtein distance if only one adminAnswer is given', function () {

      const successfulCases = [
        { should: 'If both are empty', arg1: '', arg2: [''], output: 0 },
        { should: 'If both are same', arg1: 'a', arg2: ['a'], output: 0 },
        { should: 'If they have one different character', arg1: 'a', arg2: ['ab'], output: 1 },
        { should: 'If they have two different characters', arg1: 'book', arg2: ['back'], output: 2 },
      ];

      successfulCases.forEach(function (testCase) {
        it(testCase.should + ', for example arg1 ' + JSON.stringify(testCase.arg1) + ', and arg2 ' + JSON.stringify(testCase.arg2) + ' => ' + testCase.output + '', function () {
          expect(service._getSmallestLevenshteinDistance(testCase.arg1, testCase.arg2)).to.equal(testCase.output);
        });
      });

    });
    describe('Should return the smallest levenshtein distance if many adminAnswers are given', function () {

      const successfulCases = [
        { should: 'If the smallest difference is 0', arg1: '', arg2: ['', 'a'], output: 0 },
        { should: 'If the smallest difference is 0, with non empty args', arg1: 'a', arg2: ['a', 'ab'], output: 0 },
        { should: 'If the smallest difference is 1, smallest is at position 0 in array', arg1: 'a', arg2: ['ab', 'abdcef'], output: 1 },
        { should: 'If the smallest difference is 1, smallest is at position 1 in array', arg1: 'a', arg2: ['abdcef', 'ab'], output: 1 },
        { should: 'If the smallest difference is 1, with 3 differents String as arg2', arg1: 'a', arg2: ['abcdef', 'ab', 'azerty'], output: 1 },
        { should: 'If the difference is 2 for all elements', arg1: 'book', arg2: ['back', 'buck'], output: 2 },
      ];

      successfulCases.forEach(function (testCase) {
        it(testCase.should + ', for example arg1 ' + JSON.stringify(testCase.arg1) + ', and arg2 ' + JSON.stringify(testCase.arg2) + ' => ' + testCase.output + '', function () {
          expect(service._getSmallestLevenshteinDistance(testCase.arg1, testCase.arg2)).to.equal(testCase.output);
        });
      });
    });
  });

  describe('treatmentT1T2T3', function() {
    it('Should exist', function () {
      expect(service.treatmentT1T2T3).to.exist;
    });
    it('Should return null if adminAnswers is not an array of String', function () {
      expect(service.treatmentT1T2T3('quack', [new Date(), new Date()])).to.equal(null);
    });
    it('Should return t1 treatment', function () {
      expect(service.treatmentT1T2T3(' Crème BrûLée 1 ', ['any']).t1).to.equal('cremebrulee1');
    });
    it('Should return t2 treatment', function () {
      expect(service.treatmentT1T2T3('Th!!is.,', ['any']).t2).to.equal('This');
    });
    it('Should return t1 & t2 treatment', function () {
      expect(service.treatmentT1T2T3('Th!!is., is  Crème BrûLée 1 ', ['any']).t1t2).to.equal('thisiscremebrulee1');
    });
    it('Should return t3 ratio', function () {
      expect(service.treatmentT1T2T3('beck', ['back', 'book']).t3Ratio).to.equal(0.25);
    });
    it('Should return t3 ratio applied to t1', function () {
      expect(service.treatmentT1T2T3(' Béck ', ['back', 'book']).t1t3Ratio).to.equal(0.25);
    });
    it('Should return t3 ratio applied to t2', function () {
      expect(service.treatmentT1T2T3('th!!is.', ['that', 'those']).t2t3Ratio).to.equal(0.5);
    });
    it('Should return t3 ratio applied to t1 and t2', function () {
      expect(service.treatmentT1T2T3('éeE1', ['eee12', 'blabla']).t1t2t3Ratio).to.equal(0.25);
    });
  });


});
