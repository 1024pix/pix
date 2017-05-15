const { describe, it } = require('mocha');
const { expect } = require('chai');
const service = require('../../../../lib/domain/services/solution-service-utils');

describe('Unit | Domain | Services | solution-service-utils', function() {

  describe('treatmentT1T2T3', function() {
    it('Should exist', function() {
      expect(service.treatmentT1T2T3).to.exist;
    });
    it('Should return null if adminAnswers is not an array of String', function() {
      expect(service.treatmentT1T2T3('quack', [new Date(), new Date()])).to.equal(null);
    });
    it('Should return t1 treatment', function() {
      expect(service.treatmentT1T2T3(' Crème BrûLée 1 ', ['any']).t1).to.equal('cremebrulee1');
    });
    it('Should return t2 treatment', function() {
      expect(service.treatmentT1T2T3('Th!!is.,', ['any']).t2).to.equal('This');
    });
    it('Should return t1 & t2 treatment', function() {
      expect(service.treatmentT1T2T3('Th!!is., is  Crème BrûLée 1 ', ['any']).t1t2).to.equal('thisiscremebrulee1');
    });
    it('Should return t3 ratio', function() {
      expect(service.treatmentT1T2T3('beck', ['back', 'book']).t3Ratio).to.equal(0.25);
    });
    it('Should return t3 ratio applied to t1', function() {
      expect(service.treatmentT1T2T3(' Béck ', ['back', 'book']).t1t3Ratio).to.equal(0.25);
    });
    it('Should return t3 ratio applied to t2', function() {
      expect(service.treatmentT1T2T3('th!!is.', ['that', 'those']).t2t3Ratio).to.equal(0.5);
    });
    it('Should return t3 ratio applied to t1 and t2', function() {
      expect(service.treatmentT1T2T3('éeE1', ['eee12', 'blabla']).t1t2t3Ratio).to.equal(0.25);
    });
  });

});
