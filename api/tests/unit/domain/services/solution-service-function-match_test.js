const { describe, it, expect, sinon } = require('../../../test-helper');
const service = require('../../../../lib/domain/services/solution-service');
const serviceQru = require('../../../../lib/domain/services/solution-service-qru');
const serviceQcu = require('../../../../lib/domain/services/solution-service-qcu');
const serviceQcm = require('../../../../lib/domain/services/solution-service-qcm');
const serviceQroc = require('../../../../lib/domain/services/solution-service-qroc');
const serviceQrocmInd = require('../../../../lib/domain/services/solution-service-qrocm-ind');
const serviceQrocmDep = require('../../../../lib/domain/services/solution-service-qrocm-dep');
const Answer = require('../../../../lib/domain/models/data/answer');
const Solution = require('../../../../lib/domain/models/referential/solution');
const _ = require('../../../../lib/infrastructure/utils/lodash-utils');

describe('Unit | Service | SolutionService', function () {

  function buildSolution(type, value, scoring, deactivations, enabledTreatments) {
    const solution = new Solution({ id: 'solution_id' });
    solution.type = type;
    solution.value = value;
    solution.scoring = _.ensureString(scoring).replace(/@/g, '');
    solution.deactivations = deactivations;
    solution.enabledTreatments = enabledTreatments;
    return solution;
  }

  function buildAnswer(value, timeout) {
    const answer = new Answer({ id: 'answer_id' });
    answer.attributes = { value, timeout };
    return answer;
  }

  describe('#validate', function () {

    describe('if solution type is QCU', function () {

      it('Should return "aband" if answer is #ABAND#', function () {
        const answer = buildAnswer('#ABAND#');
        const solution = buildSolution('QCU', 'some value');
        expect(service.validate(answer, solution)).to.deep.equal({ result: 'aband', resultDetails: null });
      });

      it('Should return result of solution-service-qcu.match() | user didnt abandoned | no timeout', function () {

        // Given
        const answer = buildAnswer('qcuAnswer');
        const solution = buildSolution('QCU', 'qcuSolution');

        sinon.stub(serviceQcu, 'match').withArgs('qcuAnswer', 'qcuSolution').returns('qcuMatching');
        sinon.stub(service, '_timedOut').returns('resultOfTimeout');

        // When
        const result = service.validate(answer, solution);

        // Then
        serviceQcu.match.restore();
        service._timedOut.restore();

        expect(result).to.deep.equal({result: 'qcuMatching', resultDetails: null});
      });

      it('Should be verified against _timedOut function | user didnt abandoned | with timeout', function () {

        // Given
        const answer = buildAnswer('qcuAnswer', -15);
        const solution = buildSolution('QCU', 'qcuSolution');

        sinon.stub(serviceQcu, 'match').withArgs('qcuAnswer', 'qcuSolution').returns('qcuMatching');
        sinon.stub(service, '_timedOut').returns('resultOfTimeout');

        // When
        const result = service.validate(answer, solution);

        // Then
        serviceQcu.match.restore();
        service._timedOut.restore();

        expect(result).to.deep.equal({result: 'resultOfTimeout', resultDetails: null});
      });

    });

    describe('if solution type is QRU', function () {

      it('Should return "aband" if answer is #ABAND#', function () {
        const answer = buildAnswer('#ABAND#');
        const solution = buildSolution('QRU', 'some value');
        expect(service.validate(answer, solution)).to.deep.equal({result: 'aband', resultDetails: null});
      });

      it('Should return result of solution-service-qru.match() | user didnt abandoned | no timeout', function () {

        // Given
        const answer = buildAnswer('qruAnswer');
        const solution = buildSolution('QRU', 'qruSolution');

        sinon.stub(serviceQru, 'match').withArgs('qruAnswer', 'qruSolution').returns('qruMatching');
        sinon.stub(service, '_timedOut').returns('resultOfTimeout');

        // When
        const result = service.validate(answer, solution);

        // Then
        serviceQru.match.restore();
        service._timedOut.restore();

        expect(result).to.deep.equal({result: 'qruMatching', resultDetails: null});
      });

      it('Should be verified against _timedOut function | user didnt abandoned | with timeout', function () {

        // Given
        const answer = buildAnswer('qruAnswer', -15);
        const solution = buildSolution('QRU', 'qruSolution');

        sinon.stub(serviceQru, 'match').withArgs('qruAnswer', 'qruSolution').returns('qruMatching');
        sinon.stub(service, '_timedOut').returns('resultOfTimeout');

        // When
        const result = service.validate(answer, solution);

        // Then
        serviceQru.match.restore();
        service._timedOut.restore();

        expect(result).to.deep.equal({result: 'resultOfTimeout', resultDetails: null});
      });
    });

    describe('if solution type is QCM', function () {

      it('Should return "aband" if answer is #ABAND#', function () {
        const answer = buildAnswer('#ABAND#');
        const solution = buildSolution('QCM', 'some value');
        expect(service.validate(answer, solution)).to.deep.equal({result: 'aband', resultDetails: null});
      });

      it('Should return result of solution-service-qcm.match() | user didnt abandoned | no timeout', function () {

        // Given
        const answer = buildAnswer('qcmAnswer');
        const solution = buildSolution('QCM', 'qcmSolution');

        sinon.stub(serviceQcm, 'match').withArgs('qcmAnswer', 'qcmSolution').returns('qcmMatching');
        sinon.stub(service, '_timedOut').returns('resultOfTimeout');

        // When
        const result = service.validate(answer, solution);

        // Then
        serviceQcm.match.restore();
        service._timedOut.restore();

        expect(result).to.deep.equal({result: 'qcmMatching', resultDetails: null});
      });

      it('Should be verified against _timedOut function | user didnt abandoned | with timeout', function () {

        // Given
        const answer = buildAnswer('qcmAnswer', -15);
        const solution = buildSolution('QCM', 'qcmSolution');

        sinon.stub(serviceQcm, 'match').withArgs('qcmAnswer', 'qcmSolution').returns('qcmMatching');
        sinon.stub(service, '_timedOut').returns('resultOfTimeout');

        // When
        const result = service.validate(answer, solution);

        // Then
        serviceQcm.match.restore();
        service._timedOut.restore();

        expect(result).to.deep.equal({result: 'resultOfTimeout', resultDetails: null});
      });

    });


    describe('if solution type is QROC', function () {

      it('Should return "aband" if answer is #ABAND#', function () {
        const answer = buildAnswer('#ABAND#');
        const solution = buildSolution('QROC', 'some value');
        expect(service.validate(answer, solution)).to.deep.equal({result: 'aband', resultDetails: null});
      });

      it('Should return result of solution-service-qroc.match() | user didnt abandoned | no timeout', function () {

        // Given
        const answer = buildAnswer('qrocAnswer');
        const solution = buildSolution('QROC', 'qrocSolution', null, { t1: true });

        const serviceQrocMatch = sinon.stub(serviceQroc, 'match');
        const serviceTimedOut = sinon.stub(service, '_timedOut');

        serviceQrocMatch.returns('qrocMatching');

        // When
        const result = service.validate(answer, solution);

        // Then
        serviceQroc.match.restore();
        service._timedOut.restore();

        sinon.assert.calledOnce(serviceQrocMatch);
        sinon.assert.calledWithExactly(serviceQrocMatch, 'qrocAnswer', 'qrocSolution', { t1: true });
        sinon.assert.notCalled(serviceTimedOut);
        expect(result).to.deep.equal({result: 'qrocMatching', resultDetails: null});
      });

      it('Should be verified against _timedOut function | user didnt abandoned | with timeout', function () {

        // Given
        const answer = buildAnswer('qrocAnswer', -15);
        const solution = buildSolution('QROC', 'qrocSolution', null, { t1: true });
        const serviceQrocMatch = sinon.stub(serviceQroc, 'match');
        const serviceTimedOut = sinon.stub(service, '_timedOut');

        serviceQrocMatch.returns('qrocMatching');
        serviceTimedOut.returns('resultOfTimeout');

        // When
        const result = service.validate(answer, solution);

        // Then
        serviceQroc.match.restore();
        service._timedOut.restore();

        sinon.assert.calledOnce(serviceQrocMatch);
        sinon.assert.calledWithExactly(serviceQrocMatch, 'qrocAnswer', 'qrocSolution', { t1: true });
        sinon.assert.calledOnce(serviceTimedOut);
        sinon.assert.calledWithExactly(serviceTimedOut, 'qrocMatching', -15);

        expect(result).to.deep.equal({result: 'resultOfTimeout', resultDetails: null});
      });

    });


    describe('if solution type is QROCM-ind', function () {

      //TODO : FIX ME When refacto of qrocm-dep and qroc done delete deactivations in parameters of buildSolution and delete this one
      function buildSolutionQROCMind(type, value, scoring, enabledTreatments) {
        const solution = new Solution({ id: 'solution_id' });
        solution.type = type;
        solution.value = value;
        solution.scoring = _.ensureString(scoring).replace(/@/g, '');
        solution.enabledTreatments = enabledTreatments;
        return solution;
      }

      it('Should return "aband" if answer is #ABAND#', function () {
        const answer = buildAnswer('#ABAND#');
        const solution = buildSolution('QROCM-ind', 'some value');
        expect(service.validate(answer, solution)).to.deep.equal({result: 'aband', resultDetails: null});
      });

      it('Should return result of solution-service-qrocmInd.match() | user didnt abandoned | no timeout', function () {

        // Given
        const answer = buildAnswer('qrocmIndAnswer');
        const solution = buildSolutionQROCMind('QROCM-ind', 'qrocmIndSolution', null, ['t2', 't3']);
        const serviceQrocmInd$match = sinon.stub(serviceQrocmInd, 'match');
        const serviceTimedOut = sinon.stub(service, '_timedOut');

        serviceQrocmInd$match.returns({result: 'qrocmIndMatching', resultDetails: {shi: true, fu: false, mi: true}});

        // When
        const result = service.validate(answer, solution);

        // Then
        serviceQrocmInd.match.restore();
        service._timedOut.restore();

        sinon.assert.calledOnce(serviceQrocmInd$match);
        sinon.assert.calledWithExactly(serviceQrocmInd$match, 'qrocmIndAnswer', 'qrocmIndSolution', ['t2', 't3']);
        sinon.assert.notCalled(serviceTimedOut);
        expect(result).to.deep.equal({result: 'qrocmIndMatching', resultDetails: {shi: true, fu: false, mi: true}});

      });

      it('Should be verified against _timedOut function | user didnt abandoned | with timeout', function () {

        // Given
        const answer = buildAnswer('qrocmIndAnswer', -15);
        const solution = buildSolutionQROCMind('QROCM-ind', 'qrocmIndSolution', null, ['t2', 't3']);
        const serviceQrocmInd$match = sinon.stub(serviceQrocmInd, 'match');
        const serviceTimedOut = sinon.stub(service, '_timedOut');

        serviceQrocmInd$match.returns({result: 'qrocmIndMatching', resultDetails: {shi: true, fu: false, mi: true}});
        serviceTimedOut.returns('resultOfTimeout');

        // When
        const result = service.validate(answer, solution);

        // Then
        serviceQrocmInd.match.restore();
        service._timedOut.restore();

        sinon.assert.calledOnce(serviceQrocmInd$match);
        sinon.assert.calledWithExactly(serviceQrocmInd$match, 'qrocmIndAnswer', 'qrocmIndSolution', ['t2', 't3']);
        sinon.assert.calledOnce(serviceTimedOut);
        sinon.assert.calledWithExactly(serviceTimedOut, 'qrocmIndMatching', -15);

        expect(result).to.deep.equal({result: 'resultOfTimeout', resultDetails: {shi: true, fu: false, mi: true}});
      });

    });

    describe('if solution type is QROCM-dep', function () {

      it('Should return "aband" if answer is #ABAND#', function () {
        const answer = buildAnswer('#ABAND#');
        const solution = buildSolution('QROCM-dep', 'some value');
        expect(service.validate(answer, solution)).to.deep.equal({result: 'aband', resultDetails: null});
      });

      it('Should return result of solution-service-qrocmDep.match() | user didnt abandoned | no timeout', function () {

        // Given
        const answer = buildAnswer('qrocmDepAnswer');
        const solution = buildSolution('QROCM-dep', 'qrocmDepSolution', 'anyScoring', { t1: true });
        const serviceQrocmDep$match = sinon.stub(serviceQrocmDep, 'match');
        const serviceTimedOut = sinon.stub(service, '_timedOut');

        serviceQrocmDep$match.returns('qrocmDepMatching');

        // When
        const result = service.validate(answer, solution);

        // Then
        serviceQrocmDep.match.restore();
        service._timedOut.restore();

        sinon.assert.calledOnce(serviceQrocmDep$match);
        sinon.assert.calledWithExactly(serviceQrocmDep$match, 'qrocmDepAnswer', 'qrocmDepSolution', 'anyScoring', { t1: true });
        sinon.assert.notCalled(serviceTimedOut);
        expect(result).to.deep.equal({result: 'qrocmDepMatching', resultDetails: null});
      });

      it('Should be verified against _timedOut function | user didnt abandoned | with timeout', function () {

        // Given
        const answer = buildAnswer('qrocmDepAnswer', -15);
        const solution = buildSolution('QROCM-dep', 'qrocmDepSolution', 'anyScoring', { t1: true });
        const serviceQrocmDep$match = sinon.stub(serviceQrocmDep, 'match');
        const serviceTimedOut = sinon.stub(service, '_timedOut');

        serviceQrocmDep$match.returns('qrocmDepMatching');
        serviceTimedOut.returns('resultOfTimeout');

        // When
        const result = service.validate(answer, solution);

        // Then
        serviceQrocmDep.match.restore();
        service._timedOut.restore();

        sinon.assert.calledOnce(serviceQrocmDep$match);
        sinon.assert.calledWithExactly(serviceQrocmDep$match, 'qrocmDepAnswer', 'qrocmDepSolution', 'anyScoring', { t1: true });
        sinon.assert.calledOnce(serviceTimedOut);
        sinon.assert.calledWithExactly(serviceTimedOut, 'qrocmDepMatching', -15);

        expect(result).to.deep.equal({result: 'resultOfTimeout', resultDetails: null});
      });

    });

    describe('if solution type is unknown', function () {


      it('should return "aband" if answer is #ABAND#', function () {
        const answer = buildAnswer('#ABAND#');
        const solution = buildSolution('SOME_TYPE');
        expect(service.validate(answer, solution)).to.deep.equal({result: 'aband', resultDetails: null});
      });

      it('should return "unimplemented" if answer is not #ABAND#', function () {
        const answer = buildAnswer('some value');
        const solution = buildSolution('SOME_TYPE');
        expect(service.validate(answer, solution)).to.deep.equal({result: 'unimplemented', resultDetails: null});
      });

    });

  });


});
