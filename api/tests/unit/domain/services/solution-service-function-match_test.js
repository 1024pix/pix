const { expect, sinon } = require('../../../test-helper');
const service = require('../../../../lib/domain/services/solution-service');
const serviceQcu = require('../../../../lib/domain/services/solution-service-qcu');
const serviceQcm = require('../../../../lib/domain/services/solution-service-qcm');
const serviceQroc = require('../../../../lib/domain/services/solution-service-qroc');
const serviceQrocmInd = require('../../../../lib/domain/services/solution-service-qrocm-ind');
const serviceQrocmDep = require('../../../../lib/domain/services/solution-service-qrocm-dep');
const Answer = require('../../../../lib/infrastructure/data/answer');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const Solution = require('../../../../lib/domain/models/referential/solution');
const _ = require('../../../../lib/infrastructure/utils/lodash-utils');

const ANSWER_OK = 'ok';
const ANSWER_TIMEDOUT = 'timedout';
const ANSWER_SKIPPED = 'aband';
const ANSWER_UNIMPLEMENTED = 'unimplemented';

describe('Unit | Service | SolutionService', function() {

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

  describe('#validate', function() {

    describe('if solution type is QCU', function() {

      it('Should return "aband" if answer is #ABAND#', function() {
        const answer = buildAnswer('#ABAND#');
        const solution = buildSolution('QCU', 'some value');
        const result = service.validate(answer, solution);
        expect(result).to.deep.equal({ result: ANSWER_SKIPPED, resultDetails: null });
      });

      it('Should return result of solution-service-qcu.match() | user didnt abandoned | no timeout', function() {

        // Given
        const answer = buildAnswer('qcuAnswer');
        const solution = buildSolution('QCU', 'qcuSolution');

        sinon.stub(serviceQcu, 'match').withArgs('qcuAnswer', 'qcuSolution').returns(AnswerStatus.OK);

        // When
        const result = service.validate(answer, solution);

        // Then
        serviceQcu.match.restore();

        expect(result).to.deep.equal({ result: ANSWER_OK, resultDetails: null });
      });

      it('Should be verified against _timedOut function | user didnt abandoned | with timeout', function() {

        // Given
        const answer = buildAnswer('qcuAnswer', -15);
        const solution = buildSolution('QCU', 'qcuSolution');

        sinon.stub(serviceQcu, 'match').withArgs('qcuAnswer', 'qcuSolution').returns(AnswerStatus.OK);

        // When
        const result = service.validate(answer, solution);

        // Then
        serviceQcu.match.restore();

        expect(result).to.deep.equal({ result: ANSWER_TIMEDOUT, resultDetails: null });
      });

    });

    describe('if solution type is QCM', function() {

      it('Should return "aband" if answer is #ABAND#', function() {
        const answer = buildAnswer('#ABAND#');
        const solution = buildSolution('QCM', 'some value');
        const result = service.validate(answer, solution);
        expect(result).to.deep.equal({ result: ANSWER_SKIPPED, resultDetails: null });
      });

      it('Should return result of solution-service-qcm.match() | user didnt abandoned | no timeout', function() {

        // Given
        const answer = buildAnswer('qcmAnswer');
        const solution = buildSolution('QCM', 'qcmSolution');

        sinon.stub(serviceQcm, 'match').withArgs('qcmAnswer', 'qcmSolution').returns(AnswerStatus.OK);

        // When
        const result = service.validate(answer, solution);

        // Then
        serviceQcm.match.restore();

        expect(result).to.deep.equal({ result: ANSWER_OK, resultDetails: null });
      });

      it('Should be verified against _timedOut function | user didnt abandoned | with timeout', function() {

        // Given
        const answer = buildAnswer('qcmAnswer', -15);
        const solution = buildSolution('QCM', 'qcmSolution');

        sinon.stub(serviceQcm, 'match').withArgs('qcmAnswer', 'qcmSolution').returns(AnswerStatus.OK);

        // When
        const result = service.validate(answer, solution);

        // Then
        serviceQcm.match.restore();

        expect(result).to.deep.equal({ result: ANSWER_TIMEDOUT, resultDetails: null });
      });

    });

    describe('if solution type is QROC', function() {

      it('Should return "aband" if answer is #ABAND#', function() {
        const answer = buildAnswer('#ABAND#');
        const solution = buildSolution('QROC', 'some value');
        const result = service.validate(answer, solution);
        expect(result).to.deep.equal({ result: ANSWER_SKIPPED, resultDetails: null });
      });

      it('Should return result of solution-service-qroc.match() | user didnt abandoned | no timeout', function() {

        // Given
        const answer = buildAnswer('qrocAnswer');
        const solution = buildSolution('QROC', 'qrocSolution', null, { t1: true });

        const serviceQrocMatch = sinon.stub(serviceQroc, 'match');

        serviceQrocMatch.returns(AnswerStatus.OK);

        // When
        const result = service.validate(answer, solution);

        // Then
        serviceQroc.match.restore();

        sinon.assert.calledOnce(serviceQrocMatch);
        sinon.assert.calledWithExactly(serviceQrocMatch, 'qrocAnswer', 'qrocSolution', { t1: true });
        expect(result).to.deep.equal({ result: ANSWER_OK, resultDetails: null });
      });

      it('Should be verified against _timedOut function | user didnt abandoned | with timeout', function() {

        // Given
        const answer = buildAnswer('qrocAnswer', -15);
        const solution = buildSolution('QROC', 'qrocSolution', null, { t1: true });
        const serviceQrocMatch = sinon.stub(serviceQroc, 'match');

        serviceQrocMatch.returns(AnswerStatus.OK);

        // When
        const result = service.validate(answer, solution);

        // Then
        serviceQroc.match.restore();

        sinon.assert.calledOnce(serviceQrocMatch);
        sinon.assert.calledWithExactly(serviceQrocMatch, 'qrocAnswer', 'qrocSolution', { t1: true });

        expect(result).to.deep.equal({ result: ANSWER_TIMEDOUT, resultDetails: null });
      });

    });

    describe('if solution type is QROCM-ind', function() {

      //TODO : FIX ME When refacto of qrocm-dep and qroc done delete deactivations in parameters of buildSolution and delete this one
      function buildSolutionQROCMind(type, value, scoring, enabledTreatments) {
        const solution = new Solution({ id: 'solution_id' });
        solution.type = type;
        solution.value = value;
        solution.scoring = _.ensureString(scoring).replace(/@/g, '');
        solution.enabledTreatments = enabledTreatments;
        return solution;
      }

      it('Should return "aband" if answer is #ABAND#', function() {
        const answer = buildAnswer('#ABAND#');
        const solution = buildSolution('QROCM-ind', 'some value');
        const result = service.validate(answer, solution);
        expect(result).to.deep.equal({ result: ANSWER_SKIPPED, resultDetails: null });
      });

      it('Should return result of solution-service-qrocmInd.match() | user didnt abandoned | no timeout', function() {

        // Given
        const answer = buildAnswer('qrocmIndAnswer');
        const solution = buildSolutionQROCMind('QROCM-ind', 'qrocmIndSolution', null, ['t2', 't3']);
        const serviceQrocmInd$match = sinon.stub(serviceQrocmInd, 'match');

        serviceQrocmInd$match.returns({ result: AnswerStatus.OK, resultDetails: { shi: true, fu: false, mi: true } });

        // When
        const result = service.validate(answer, solution);

        // Then
        serviceQrocmInd.match.restore();

        sinon.assert.calledOnce(serviceQrocmInd$match);
        sinon.assert.calledWithExactly(serviceQrocmInd$match, 'qrocmIndAnswer', 'qrocmIndSolution', ['t2', 't3']);
        expect(result).to.deep.equal({ result: ANSWER_OK, resultDetails: { shi: true, fu: false, mi: true } });

      });

      it('Should be verified against _timedOut function | user didnt abandoned | with timeout', function() {

        // Given
        const answer = buildAnswer('qrocmIndAnswer', -15);
        const solution = buildSolutionQROCMind('QROCM-ind', 'qrocmIndSolution', null, ['t2', 't3']);
        const serviceQrocmInd$match = sinon.stub(serviceQrocmInd, 'match');

        serviceQrocmInd$match.returns({ result: AnswerStatus.OK, resultDetails: { shi: true, fu: false, mi: true } });

        // When
        const result = service.validate(answer, solution);

        // Then
        serviceQrocmInd.match.restore();

        sinon.assert.calledOnce(serviceQrocmInd$match);
        sinon.assert.calledWithExactly(serviceQrocmInd$match, 'qrocmIndAnswer', 'qrocmIndSolution', ['t2', 't3']);

        expect(result).to.deep.equal({ result: ANSWER_TIMEDOUT, resultDetails: { shi: true, fu: false, mi: true } });
      });

    });

    describe('if solution type is QROCM-dep', function() {

      it('Should return "aband" if answer is #ABAND#', function() {
        const answer = buildAnswer('#ABAND#');
        const solution = buildSolution('QROCM-dep', 'some value');
        const result = service.validate(answer, solution);
        expect(result).to.deep.equal({ result: ANSWER_SKIPPED, resultDetails: null });
      });

      it('Should return result of solution-service-qrocmDep.match() | user didnt abandoned | no timeout', function() {

        // Given
        const answer = buildAnswer('qrocmDepAnswer');
        const solution = buildSolution('QROCM-dep', 'qrocmDepSolution', 'anyScoring', { t1: true });
        const serviceQrocmDep$match = sinon.stub(serviceQrocmDep, 'match');

        serviceQrocmDep$match.returns(AnswerStatus.OK);

        // When
        const result = service.validate(answer, solution);

        // Then
        serviceQrocmDep.match.restore();

        sinon.assert.calledOnce(serviceQrocmDep$match);
        sinon.assert.calledWithExactly(serviceQrocmDep$match, 'qrocmDepAnswer', 'qrocmDepSolution', 'anyScoring', { t1: true });
        expect(result).to.deep.equal({ result: ANSWER_OK, resultDetails: null });
      });

      it('Should be verified against _timedOut function | user didnt abandoned | with timeout', function() {

        // Given
        const answer = buildAnswer('qrocmDepAnswer', -15);
        const solution = buildSolution('QROCM-dep', 'qrocmDepSolution', 'anyScoring', { t1: true });
        const serviceQrocmDep$match = sinon.stub(serviceQrocmDep, 'match');

        serviceQrocmDep$match.returns(AnswerStatus.OK);

        // When
        const result = service.validate(answer, solution);

        // Then
        serviceQrocmDep.match.restore();

        sinon.assert.calledOnce(serviceQrocmDep$match);
        sinon.assert.calledWithExactly(serviceQrocmDep$match, 'qrocmDepAnswer', 'qrocmDepSolution', 'anyScoring', { t1: true });

        expect(result).to.deep.equal({ result: ANSWER_TIMEDOUT, resultDetails: null });
      });

    });

    describe('if solution type is unknown', function() {

      it('should return "aband" if answer is #ABAND#', function() {
        const answer = buildAnswer('#ABAND#');
        const solution = buildSolution('SOME_TYPE');
        const result = service.validate(answer, solution);
        expect(result).to.deep.equal({ result: ANSWER_SKIPPED, resultDetails: null });
      });

      it('should return "unimplemented" if answer is not #ABAND#', function() {
        const answer = buildAnswer('some value');
        const solution = buildSolution('SOME_TYPE');
        const result = service.validate(answer, solution);
        expect(result).to.deep.equal({ result: ANSWER_UNIMPLEMENTED, resultDetails: null });
      });
    });
  });
});
