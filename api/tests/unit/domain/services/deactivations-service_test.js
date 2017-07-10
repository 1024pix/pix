const { describe, it, expect } = require('../../../test-helper');

const service = require('../../../../lib/domain/services/deactivations-service');

describe('Unit | Service | DeactivationsService ', function() {

  describe('isDefault | all treatments should apply by default', function() {
    const allCases = [
      { when:'No deactivations at all', output: true, deactivations: undefined },
      { when:'Deactivations is of wrong type', output: true, deactivations: new Date() },
      { when:'Deactivations is empty', output: true, deactivations: {} },
      { when:'Deactivations has t1, t2, t3 empty', output: true, deactivations: { t1: null, t2: null, t3: null } },
      { when:'Deactivations has t1, t2, t3 falsey', output: true, deactivations: { t1: null, t2: 0, t3: '' } },
      { when:'Deactivations has t1 with true value', output: false, deactivations: { t1: true, t2: 0, t3: 0 } },
      { when:'Deactivations has t1 with truthy value', output: false, deactivations: { t1: 'any', t2: 0, t3: 0 } },
      { when:'Deactivations has t2 with true value', output: false, deactivations: { t1: false, t2: true, t3: 0 } },
      { when:'Deactivations has t2 with truthy value', output: false, deactivations: { t1: '', t2: 'any', t3: 0 } },
      { when:'Deactivations has t3 with true value', output: false, deactivations: { t1: false, t2: '', t3: true } },
      { when:'Deactivations has t3 with truthy value', output: false, deactivations: { t1: false, t2: false, t3: 'any' } },
      { when:'Deactivations has t1, t2 with truthy value', output: false, deactivations: { t1: true, t2: 'any', t3: false } },
      { when:'Deactivations has t1, t3 with truthy value', output: false, deactivations: { t1: true, t2: false, t3: 'any' } },
      { when:'Deactivations has t2, t3 with truthy value', output: false, deactivations: { t1: false, t2: 'other', t3: 'any' } },
      { when:'Deactivations has t1, t2, t3 with truthy value', output: false, deactivations: { t1: true, t2: 'other', t3: 'any' } },
    ];

    allCases.forEach(function(caze) {
      it(caze.when + ' : ' + JSON.stringify(caze.deactivations) + '  =>  ' + caze.output, function() {
        expect(service.isDefault(caze.deactivations)).to.equal(caze.output);
      });
    });
  });

  describe('hasOnlyT1 | only T1 is declared as deactivated  ', function() {
    const allCases = [
      { when:'No deactivations at all', output: false, deactivations: undefined },
      { when:'Deactivations is of wrong type', output: false, deactivations: new Date() },
      { when:'Deactivations is empty', output: false, deactivations: {} },
      { when:'Deactivations has t1, t2, t3 empty', output: false, deactivations: { t1: null, t2: null, t3: null } },
      { when:'Deactivations has t1, t2, t3 falsey', output: false, deactivations: { t1: null, t2: 0, t3: '' } },
      { when:'Deactivations has t1 with true value', output: true, deactivations: { t1: true, t2: 0, t3: 0 } },
      { when:'Deactivations has t1 with truthy value', output: true, deactivations: { t1: 'any', t2: 0, t3: 0 } },
      { when:'Deactivations has t2 with true value', output: false, deactivations: { t1: false, t2: true, t3: 0 } },
      { when:'Deactivations has t2 with truthy value', output: false, deactivations: { t1: '', t2: 'any', t3: 0 } },
      { when:'Deactivations has t3 with true value', output: false, deactivations: { t1: false, t2: '', t3: true } },
      { when:'Deactivations has t3 with truthy value', output: false, deactivations: { t1: false, t2: false, t3: 'any' } },
      { when:'Deactivations has t1, t2 with truthy value', output: false, deactivations: { t1: true, t2: 'any', t3: false } },
      { when:'Deactivations has t1, t3 with truthy value', output: false, deactivations: { t1: true, t2: false, t3: 'any' } },
      { when:'Deactivations has t2, t3 with truthy value', output: false, deactivations: { t1: false, t2: 'other', t3: 'any' } },
      { when:'Deactivations has t1, t2, t3 with truthy value', output: false, deactivations: { t1: true, t2: 'other', t3: 'any' } },
    ];

    allCases.forEach(function(caze) {
      it(caze.when + ' : ' + JSON.stringify(caze.deactivations) + '  =>  ' + caze.output, function() {
        expect(service.hasOnlyT1(caze.deactivations)).to.equal(caze.output);
      });
    });
  });

  describe('hasOnlyT2 | only T2 is declared as deactivated  ', function() {
    const allCases = [
      { when:'No deactivations at all', output: false, deactivations: undefined },
      { when:'Deactivations is of wrong type', output: false, deactivations: new Date() },
      { when:'Deactivations is empty', output: false, deactivations: {} },
      { when:'Deactivations has t1, t2, t3 empty', output: false, deactivations: { t1: null, t2: null, t3: null } },
      { when:'Deactivations has t1, t2, t3 falsey', output: false, deactivations: { t1: null, t2: 0, t3: '' } },
      { when:'Deactivations has t1 with true value', output: false, deactivations: { t1: true, t2: 0, t3: 0 } },
      { when:'Deactivations has t1 with truthy value', output: false, deactivations: { t1: 'any', t2: 0, t3: 0 } },
      { when:'Deactivations has t2 with true value', output: true, deactivations: { t1: false, t2: true, t3: 0 } },
      { when:'Deactivations has t2 with truthy value', output: true, deactivations: { t1: '', t2: 'any', t3: 0 } },
      { when:'Deactivations has t3 with true value', output: false, deactivations: { t1: false, t2: '', t3: true } },
      { when:'Deactivations has t3 with truthy value', output: false, deactivations: { t1: false, t2: false, t3: 'any' } },
      { when:'Deactivations has t1, t2 with truthy value', output: false, deactivations: { t1: true, t2: 'any', t3: false } },
      { when:'Deactivations has t1, t3 with truthy value', output: false, deactivations: { t1: true, t2: false, t3: 'any' } },
      { when:'Deactivations has t2, t3 with truthy value', output: false, deactivations: { t1: false, t2: 'other', t3: 'any' } },
      { when:'Deactivations has t1, t2, t3 with truthy value', output: false, deactivations: { t1: true, t2: 'other', t3: 'any' } },
    ];

    allCases.forEach(function(caze) {
      it(caze.when + ' : ' + JSON.stringify(caze.deactivations) + '  =>  ' + caze.output, function() {
        expect(service.hasOnlyT2(caze.deactivations)).to.equal(caze.output);
      });
    });
  });

  describe('hasOnlyT3 | only T3 is declared as deactivated', function() {
    const allCases = [
      { when:'No deactivations at all', output: false, deactivations: undefined },
      { when:'Deactivations is of wrong type', output: false, deactivations: new Date() },
      { when:'Deactivations is empty', output: false, deactivations: {} },
      { when:'Deactivations has t1, t2, t3 empty', output: false, deactivations: { t1: null, t2: null, t3: null } },
      { when:'Deactivations has t1, t2, t3 falsey', output: false, deactivations: { t1: null, t2: 0, t3: '' } },
      { when:'Deactivations has t1 with true value', output: false, deactivations: { t1: true, t2: 0, t3: 0 } },
      { when:'Deactivations has t1 with truthy value', output: false, deactivations: { t1: 'any', t2: 0, t3: 0 } },
      { when:'Deactivations has t2 with true value', output: false, deactivations: { t1: false, t2: true, t3: 0 } },
      { when:'Deactivations has t2 with truthy value', output: false, deactivations: { t1: '', t2: 'any', t3: 0 } },
      { when:'Deactivations has t3 with true value', output: true, deactivations: { t1: false, t2: '', t3: true } },
      { when:'Deactivations has t3 with truthy value', output: true, deactivations: { t1: false, t2: false, t3: 'any' } },
      { when:'Deactivations has t1, t2 with truthy value', output: false, deactivations: { t1: true, t2: 'any', t3: false } },
      { when:'Deactivations has t1, t3 with truthy value', output: false, deactivations: { t1: true, t2: false, t3: 'any' } },
      { when:'Deactivations has t2, t3 with truthy value', output: false, deactivations: { t1: false, t2: 'other', t3: 'any' } },
      { when:'Deactivations has t1, t2, t3 with truthy value', output: false, deactivations: { t1: true, t2: 'other', t3: 'any' } },
    ];

    allCases.forEach(function(caze) {
      it(caze.when + ' : ' + JSON.stringify(caze.deactivations) + '  =>  ' + caze.output, function() {
        expect(service.hasOnlyT3(caze.deactivations)).to.equal(caze.output);
      });
    });
  });

  describe('hasOnlyT1T2 | only T1 and T2 are declared as deactivated', function() {
    const allCases = [
      { when:'No deactivations at all', output: false, deactivations: undefined },
      { when:'Deactivations is of wrong type', output: false, deactivations: new Date() },
      { when:'Deactivations is empty', output: false, deactivations: {} },
      { when:'Deactivations has t1, t2, t3 empty', output: false, deactivations: { t1: null, t2: null, t3: null } },
      { when:'Deactivations has t1, t2, t3 falsey', output: false, deactivations: { t1: null, t2: 0, t3: '' } },
      { when:'Deactivations has t1 with true value', output: false, deactivations: { t1: true, t2: 0, t3: 0 } },
      { when:'Deactivations has t1 with truthy value', output: false, deactivations: { t1: 'any', t2: 0, t3: 0 } },
      { when:'Deactivations has t2 with true value', output: false, deactivations: { t1: false, t2: true, t3: 0 } },
      { when:'Deactivations has t2 with truthy value', output: false, deactivations: { t1: '', t2: 'any', t3: 0 } },
      { when:'Deactivations has t3 with true value', output: false, deactivations: { t1: false, t2: '', t3: true } },
      { when:'Deactivations has t3 with truthy value', output: false, deactivations: { t1: false, t2: false, t3: 'any' } },
      { when:'Deactivations has t1, t2 with truthy value', output: true, deactivations: { t1: true, t2: 'any', t3: false } },
      { when:'Deactivations has t1, t3 with truthy value', output: false, deactivations: { t1: true, t2: false, t3: 'any' } },
      { when:'Deactivations has t2, t3 with truthy value', output: false, deactivations: { t1: false, t2: 'other', t3: 'any' } },
      { when:'Deactivations has t1, t2, t3 with truthy value', output: false, deactivations: { t1: true, t2: 'other', t3: 'any' } },
    ];

    allCases.forEach(function(caze) {
      it(caze.when + ' : ' + JSON.stringify(caze.deactivations) + '  =>  ' + caze.output, function() {
        expect(service.hasOnlyT1T2(caze.deactivations)).to.equal(caze.output);
      });
    });
  });

  describe('hasOnlyT1T3 | only T1 and T3 are declared as deactivated', function() {
    const allCases = [
      { when:'No deactivations at all', output: false, deactivations: undefined },
      { when:'Deactivations is of wrong type', output: false, deactivations: new Date() },
      { when:'Deactivations is empty', output: false, deactivations: {} },
      { when:'Deactivations has t1, t2, t3 empty', output: false, deactivations: { t1: null, t2: null, t3: null } },
      { when:'Deactivations has t1, t2, t3 falsey', output: false, deactivations: { t1: null, t2: 0, t3: '' } },
      { when:'Deactivations has t1 with true value', output: false, deactivations: { t1: true, t2: 0, t3: 0 } },
      { when:'Deactivations has t1 with truthy value', output: false, deactivations: { t1: 'any', t2: 0, t3: 0 } },
      { when:'Deactivations has t2 with true value', output: false, deactivations: { t1: false, t2: true, t3: 0 } },
      { when:'Deactivations has t2 with truthy value', output: false, deactivations: { t1: '', t2: 'any', t3: 0 } },
      { when:'Deactivations has t3 with true value', output: false, deactivations: { t1: false, t2: '', t3: true } },
      { when:'Deactivations has t3 with truthy value', output: false, deactivations: { t1: false, t2: false, t3: 'any' } },
      { when:'Deactivations has t1, t2 with truthy value', output: false, deactivations: { t1: true, t2: 'any', t3: false } },
      { when:'Deactivations has t1, t3 with truthy value', output: true, deactivations: { t1: true, t2: false, t3: 'any' } },
      { when:'Deactivations has t2, t3 with truthy value', output: false, deactivations: { t1: false, t2: 'other', t3: 'any' } },
      { when:'Deactivations has t1, t2, t3 with truthy value', output: false, deactivations: { t1: true, t2: 'other', t3: 'any' } },
    ];

    allCases.forEach(function(caze) {
      it(caze.when + ' : ' + JSON.stringify(caze.deactivations) + '  =>  ' + caze.output, function() {
        expect(service.hasOnlyT1T3(caze.deactivations)).to.equal(caze.output);
      });
    });
  });

  describe('hasOnlyT2T3 | only T2 and T3 are declared as deactivated', function() {
    const allCases = [
      { when:'No deactivations at all', output: false, deactivations: undefined },
      { when:'Deactivations is of wrong type', output: false, deactivations: new Date() },
      { when:'Deactivations is empty', output: false, deactivations: {} },
      { when:'Deactivations has t1, t2, t3 empty', output: false, deactivations: { t1: null, t2: null, t3: null } },
      { when:'Deactivations has t1, t2, t3 falsey', output: false, deactivations: { t1: null, t2: 0, t3: '' } },
      { when:'Deactivations has t1 with true value', output: false, deactivations: { t1: true, t2: 0, t3: 0 } },
      { when:'Deactivations has t1 with truthy value', output: false, deactivations: { t1: 'any', t2: 0, t3: 0 } },
      { when:'Deactivations has t2 with true value', output: false, deactivations: { t1: false, t2: true, t3: 0 } },
      { when:'Deactivations has t2 with truthy value', output: false, deactivations: { t1: '', t2: 'any', t3: 0 } },
      { when:'Deactivations has t3 with true value', output: false, deactivations: { t1: false, t2: '', t3: true } },
      { when:'Deactivations has t3 with truthy value', output: false, deactivations: { t1: false, t2: false, t3: 'any' } },
      { when:'Deactivations has t1, t2 with truthy value', output: false, deactivations: { t1: true, t2: 'any', t3: false } },
      { when:'Deactivations has t1, t3 with truthy value', output: false, deactivations: { t1: true, t2: false, t3: 'any' } },
      { when:'Deactivations has t2, t3 with truthy value', output: true, deactivations: { t1: false, t2: 'other', t3: 'any' } },
      { when:'Deactivations has t1, t2, t3 with truthy value', output: false, deactivations: { t1: true, t2: 'other', t3: 'any' } },
    ];

    allCases.forEach(function(caze) {
      it(caze.when + ' : ' + JSON.stringify(caze.deactivations) + '  =>  ' + caze.output, function() {
        expect(service.hasOnlyT2T3(caze.deactivations)).to.equal(caze.output);
      });
    });
  });

  describe('hasT1T2T3 | T1, T2 and T3 are declared as deactivated', function() {
    const allCases = [
      { when:'No deactivations at all', output: false, deactivations: undefined },
      { when:'Deactivations is of wrong type', output: false, deactivations: new Date() },
      { when:'Deactivations is empty', output: false, deactivations: {} },
      { when:'Deactivations has t1, t2, t3 empty', output: false, deactivations: { t1: null, t2: null, t3: null } },
      { when:'Deactivations has t1, t2, t3 falsey', output: false, deactivations: { t1: null, t2: 0, t3: '' } },
      { when:'Deactivations has t1 with true value', output: false, deactivations: { t1: true, t2: 0, t3: 0 } },
      { when:'Deactivations has t1 with truthy value', output: false, deactivations: { t1: 'any', t2: 0, t3: 0 } },
      { when:'Deactivations has t2 with true value', output: false, deactivations: { t1: false, t2: true, t3: 0 } },
      { when:'Deactivations has t2 with truthy value', output: false, deactivations: { t1: '', t2: 'any', t3: 0 } },
      { when:'Deactivations has t3 with true value', output: false, deactivations: { t1: false, t2: '', t3: true } },
      { when:'Deactivations has t3 with truthy value', output: false, deactivations: { t1: false, t2: false, t3: 'any' } },
      { when:'Deactivations has t1, t2 with truthy value', output: false, deactivations: { t1: true, t2: 'any', t3: false } },
      { when:'Deactivations has t1, t3 with truthy value', output: false, deactivations: { t1: true, t2: false, t3: 'any' } },
      { when:'Deactivations has t2, t3 with truthy value', output: false, deactivations: { t1: false, t2: 'other', t3: 'any' } },
      { when:'Deactivations has t1, t2, t3 with truthy value', output: true, deactivations: { t1: true, t2: 'other', t3: 'any' } },
    ];

    allCases.forEach(function(caze) {
      it(caze.when + ' : ' + JSON.stringify(caze.deactivations) + '  =>  ' + caze.output, function() {
        expect(service.hasT1T2T3(caze.deactivations)).to.equal(caze.output);
      });
    });
  });

});

