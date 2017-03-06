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

  function buildSolution(type, value, scoring, deactivations) {
    const solution = new Solution({id: 'solution_id'});
    solution.type = type;
    solution.value = value;
    solution.scoring = _.ensureString(scoring).replace(/@/g, '');
    solution.deactivations = deactivations;
    return solution;
  }

  function buildAnswer(value, timeout) {
    const answer = new Answer({id: 'answer_id'});
    answer.attributes = {value, timeout};
    return answer;
  }

  describe('#match', function () {

    describe('if solution type is QCU', function () {

      it('Should return "aband" if answer is #ABAND#', function () {
        const answer = buildAnswer('#ABAND#');
        const solution = buildSolution('QCU', 'some value');
        expect(service.match(answer, solution)).to.equal('aband');
      });

      it('Should return result of solution-service-qcu.match() | user didnt abandoned | no timeout', function () {

        // Given
        const answer = buildAnswer('qcuAnswer');
        const solution = buildSolution('QCU', 'qcuSolution');

        sinon.stub(serviceQcu, 'match').withArgs('qcuAnswer', 'qcuSolution').returns('qcuMatching');
        sinon.stub(service, '_timedOut').returns('resultOfTimeout');

        // When
        const underTest = service.match(answer, solution);

        // Then
        expect(underTest).to.equal('qcuMatching');
        serviceQcu.match.restore();
        service._timedOut.restore();

      });

      it('Should be verified against _timedOut function | user didnt abandoned | with timeout', function () {

        // Given
        const answer = buildAnswer('qcuAnswer', -15);
        const solution = buildSolution('QCU', 'qcuSolution');

        sinon.stub(serviceQcu, 'match').withArgs('qcuAnswer', 'qcuSolution').returns('qcuMatching');
        sinon.stub(service, '_timedOut').returns('resultOfTimeout');

        // When
        const underTest = service.match(answer, solution);

        // Then
        expect(underTest).to.equal('resultOfTimeout');
        serviceQcu.match.restore();
        service._timedOut.restore();

      });

    });

    describe('if solution type is QRU', function () {

      it('Should return "aband" if answer is #ABAND#', function () {
        const answer = buildAnswer('#ABAND#');
        const solution = buildSolution('QRU', 'some value');
        expect(service.match(answer, solution)).to.equal('aband');
      });

      it('Should return result of solution-service-qru.match() | user didnt abandoned | no timeout', function () {

        // Given
        const answer = buildAnswer('qruAnswer');
        const solution = buildSolution('QRU', 'qruSolution');

        sinon.stub(serviceQru, 'match').withArgs('qruAnswer', 'qruSolution').returns('qruMatching');
        sinon.stub(service, '_timedOut').returns('resultOfTimeout');

        // When
        const underTest = service.match(answer, solution);

        // Then
        expect(underTest).to.equal('qruMatching');
        serviceQru.match.restore();
        service._timedOut.restore();

      });

      it('Should be verified against _timedOut function | user didnt abandoned | with timeout', function () {

        // Given
        const answer = buildAnswer('qruAnswer', -15);
        const solution = buildSolution('QRU', 'qruSolution');

        sinon.stub(serviceQru, 'match').withArgs('qruAnswer', 'qruSolution').returns('qruMatching');
        sinon.stub(service, '_timedOut').returns('resultOfTimeout');

        // When
        const underTest = service.match(answer, solution);

        // Then
        expect(underTest).to.equal('resultOfTimeout');
        serviceQru.match.restore();
        service._timedOut.restore();

      });

    });

    describe('if solution type is QCM', function () {

      it('Should return "aband" if answer is #ABAND#', function () {
        const answer = buildAnswer('#ABAND#');
        const solution = buildSolution('QCM', 'some value');
        expect(service.match(answer, solution)).to.equal('aband');
      });

      it('Should return result of solution-service-qcm.match() | user didnt abandoned | no timeout', function () {

        // Given
        const answer = buildAnswer('qcmAnswer');
        const solution = buildSolution('QCM', 'qcmSolution');

        sinon.stub(serviceQcm, 'match').withArgs('qcmAnswer', 'qcmSolution').returns('qcmMatching');
        sinon.stub(service, '_timedOut').returns('resultOfTimeout');

        // When
        const underTest = service.match(answer, solution);

        // Then
        expect(underTest).to.equal('qcmMatching');
        serviceQcm.match.restore();
        service._timedOut.restore();

      });

      it('Should be verified against _timedOut function | user didnt abandoned | with timeout', function () {

        // Given
        const answer = buildAnswer('qcmAnswer', -15);
        const solution = buildSolution('QCM', 'qcmSolution');

        sinon.stub(serviceQcm, 'match').withArgs('qcmAnswer', 'qcmSolution').returns('qcmMatching');
        sinon.stub(service, '_timedOut').returns('resultOfTimeout');

        // When
        const underTest = service.match(answer, solution);

        // Then
        expect(underTest).to.equal('resultOfTimeout');
        serviceQcm.match.restore();
        service._timedOut.restore();

      });

    });


    describe('if solution type is QROC', function () {

      it('Should return "aband" if answer is #ABAND#', function () {
        const answer = buildAnswer('#ABAND#');
        const solution = buildSolution('QROC', 'some value');
        expect(service.match(answer, solution)).to.equal('aband');
      });

      it('Should return result of solution-service-qroc.match() | user didnt abandoned | no timeout', function () {

        // Given
        const answer = buildAnswer('qrocAnswer');
        const solution = buildSolution('QROC', 'qrocSolution', null, {t1:true});

        const serviceQroc$match = sinon.stub(serviceQroc, 'match');
        const service$_timedOut = sinon.stub(service, '_timedOut');

        serviceQroc$match.returns('qrocMatching');

        // When
        const underTest = service.match(answer, solution);

        // Then
        sinon.assert.calledOnce(serviceQroc$match);
        sinon.assert.calledWithExactly(serviceQroc$match, 'qrocAnswer', 'qrocSolution', {t1:true});
        sinon.assert.notCalled(service$_timedOut);
        expect(underTest).to.equal('qrocMatching');
        serviceQroc.match.restore();
        service._timedOut.restore();

      });

      it('Should be verified against _timedOut function | user didnt abandoned | with timeout', function () {

        // Given
        const answer = buildAnswer('qrocAnswer', -15);
        const solution = buildSolution('QROC', 'qrocSolution', null, {t1:true});
        const serviceQroc$match = sinon.stub(serviceQroc, 'match');
        const service$_timedOut = sinon.stub(service, '_timedOut');

        serviceQroc$match.returns('qrocMatching');
        service$_timedOut.returns('resultOfTimeout');

        // When
        const underTest = service.match(answer, solution);

        // Then
        sinon.assert.calledOnce(serviceQroc$match);
        sinon.assert.calledWithExactly(serviceQroc$match, 'qrocAnswer', 'qrocSolution', {t1:true});
        sinon.assert.calledOnce(service$_timedOut);
        sinon.assert.calledWithExactly(service$_timedOut, 'qrocMatching', -15);

        expect(underTest).to.equal('resultOfTimeout');

        serviceQroc.match.restore();
        service._timedOut.restore();

      });

    });


    describe('if solution type is QROCM-ind', function () {

      it('Should return "aband" if answer is #ABAND#', function () {
        const answer = buildAnswer('#ABAND#');
        const solution = buildSolution('QROCM-ind', 'some value');
        expect(service.match(answer, solution)).to.equal('aband');
      });

      it('Should return result of solution-service-qrocmInd.match() | user didnt abandoned | no timeout', function () {

        // Given
        const answer = buildAnswer('qrocmIndAnswer');
        const solution = buildSolution('QROCM-ind', 'qrocmIndSolution', null, {t1:true});
        const serviceQrocmInd$match = sinon.stub(serviceQrocmInd, 'match');
        const service$_timedOut = sinon.stub(service, '_timedOut');

        serviceQrocmInd$match.returns('qrocmIndMatching');

        // When
        const underTest = service.match(answer, solution);

        // Then
        sinon.assert.calledOnce(serviceQrocmInd$match);
        sinon.assert.calledWithExactly(serviceQrocmInd$match, 'qrocmIndAnswer', 'qrocmIndSolution', {t1:true});
        sinon.assert.notCalled(service$_timedOut);
        expect(underTest).to.equal('qrocmIndMatching');
        serviceQrocmInd.match.restore();
        service._timedOut.restore();

      });

      it('Should be verified against _timedOut function | user didnt abandoned | with timeout', function () {

        // Given
        const answer = buildAnswer('qrocmIndAnswer', -15);
        const solution = buildSolution('QROCM-ind', 'qrocmIndSolution', null, {t1:true});
        const serviceQrocmInd$match = sinon.stub(serviceQrocmInd, 'match');
        const service$_timedOut = sinon.stub(service, '_timedOut');

        serviceQrocmInd$match.returns('qrocmIndMatching');
        service$_timedOut.returns('resultOfTimeout');

        // When
        const underTest = service.match(answer, solution);

        // Then
        sinon.assert.calledOnce(serviceQrocmInd$match);
        sinon.assert.calledWithExactly(serviceQrocmInd$match, 'qrocmIndAnswer', 'qrocmIndSolution', {t1:true});
        sinon.assert.calledOnce(service$_timedOut);
        sinon.assert.calledWithExactly(service$_timedOut, 'qrocmIndMatching', -15);

        expect(underTest).to.equal('resultOfTimeout');
        serviceQrocmInd.match.restore();
        service._timedOut.restore();

      });

    });

    describe('if solution type is QROCM-dep', function () {

      it('Should return "aband" if answer is #ABAND#', function () {
        const answer = buildAnswer('#ABAND#');
        const solution = buildSolution('QROCM-dep', 'some value');
        expect(service.match(answer, solution)).to.equal('aband');
      });

      it('Should return result of solution-service-qrocmDep.match() | user didnt abandoned | no timeout', function () {

        // Given
        const answer = buildAnswer('qrocmDepAnswer');
        const solution = buildSolution('QROCM-dep', 'qrocmDepSolution', 'anyScoring', {t1:true});
        const serviceQrocmDep$match = sinon.stub(serviceQrocmDep, 'match');
        const service$_timedOut = sinon.stub(service, '_timedOut');

        serviceQrocmDep$match.returns('qrocmDepMatching');

        // When
        const underTest = service.match(answer, solution);

        // Then
        sinon.assert.calledOnce(serviceQrocmDep$match);
        sinon.assert.calledWithExactly(serviceQrocmDep$match, 'qrocmDepAnswer', 'qrocmDepSolution', 'anyScoring', {t1:true});
        sinon.assert.notCalled(service$_timedOut);
        expect(underTest).to.equal('qrocmDepMatching');
        serviceQrocmDep.match.restore();
        service._timedOut.restore();

      });

      it('Should be verified against _timedOut function | user didnt abandoned | with timeout', function () {

        // Given
        const answer = buildAnswer('qrocmDepAnswer', -15);
        const solution = buildSolution('QROCM-dep', 'qrocmDepSolution', 'anyScoring', {t1:true});
        const serviceQrocmDep$match = sinon.stub(serviceQrocmDep, 'match');
        const service$_timedOut = sinon.stub(service, '_timedOut');

        serviceQrocmDep$match.returns('qrocmDepMatching');
        service$_timedOut.returns('resultOfTimeout');

        // When
        const underTest = service.match(answer, solution);

        // Then
        sinon.assert.calledOnce(serviceQrocmDep$match);
        sinon.assert.calledWithExactly(serviceQrocmDep$match, 'qrocmDepAnswer', 'qrocmDepSolution', 'anyScoring', {t1:true});
        sinon.assert.calledOnce(service$_timedOut);
        sinon.assert.calledWithExactly(service$_timedOut, 'qrocmDepMatching', -15);

        expect(underTest).to.equal('resultOfTimeout');
        serviceQrocmDep.match.restore();
        service._timedOut.restore();

      });

    });

    describe('if solution type is unknown', function () {


      it('should return "aband" if answer is #ABAND#', function () {
        const answer = buildAnswer('#ABAND#');
        const solution = buildSolution('SOME_TYPE');
        expect(service.match(answer, solution)).to.equal('aband');
      });

      it('should return "unimplemented" if answer is not #ABAND#', function () {
        const answer = buildAnswer('some value');
        const solution = buildSolution('SOME_TYPE');
        expect(service.match(answer, solution)).to.equal('unimplemented');
      });

    });

  });



});
