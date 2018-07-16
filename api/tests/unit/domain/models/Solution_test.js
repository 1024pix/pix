const { expect, factory, sinon } = require('../../../test-helper');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const Solution = require('../../../../lib/domain/models/Solution');
const solutionServiceQcm = require('../../../../lib/domain/services/solution-service-qcm');
const solutionServiceQcu = require('../../../../lib/domain/services/solution-service-qcu');
const solutionServiceQroc = require('../../../../lib/domain/services/solution-service-qroc');
const solutionServiceQrocmInd = require('../../../../lib/domain/services/solution-service-qrocm-ind');
const solutionServiceQrocmDep = require('../../../../lib/domain/services/solution-service-qrocm-dep');

describe('Unit | Domain | Models | Solution', () => {

  describe('#enabledTreatments', () => {

    it('should contain nothing, when no treatments are set', () => {
      // given
      const solution = new Solution({ id: 'id' });

      // when
      const enabledTreatments = solution.enabledTreatments;

      // then
      expect(enabledTreatments).to.be.empty;
    });

    it('should contain t1, when isT1Enabled is true', () => {
      // given
      const solution = new Solution({ id: 'id', isT1Enabled: true });

      // when
      const enabledTreatments = solution.enabledTreatments;

      // then
      expect(enabledTreatments).to.deep.equal(['t1']);
    });

    it('should contain t2, when isT2Enabled is true', () => {
      // given
      const solution = new Solution({ id: 'id', isT2Enabled: true });

      // when
      const enabledTreatments = solution.enabledTreatments;

      // then
      expect(enabledTreatments).to.deep.equal(['t2']);
    });

    it('should contain t3, when isT3Enabled is true', () => {
      // given
      const solution = new Solution({ id: 'id', isT3Enabled: true });

      // when
      const enabledTreatments = solution.enabledTreatments;

      // then
      expect(enabledTreatments).to.deep.equal(['t3']);
    });

    it('should contain t1, t2, t3, when isT1Enabled, isT2Enabled, isT3Enabled is true', () => {
      // given
      const solution = new Solution({ id: 'id', isT1Enabled: true, isT2Enabled: true, isT3Enabled: true });

      // when
      const enabledTreatments = solution.enabledTreatments;

      // then
      expect(enabledTreatments).to.deep.equal(['t1', 't2', 't3']);
    });
  });

  describe('#deactivations', () => {

    it('should return an deactivations.t1 = false when t1 is enabled ', () => {
      // given
      const solution = new Solution({ id: 'id', isT1Enabled: true });

      // when
      const deactivationsT1 = solution.deactivations.t1;

      // then
      expect(deactivationsT1).to.be.false;
    });

    it('should return an deactivations.t1 = true when t1 is not enabled ', () => {
      // given
      const solution = new Solution({ id: 'id', isT1Enabled: false });

      // when
      const deactivationsT1 = solution.deactivations.t1;

      // then
      expect(deactivationsT1).to.be.true;
    });

    it('should return an deactivations.t2 = false when t2 is enabled ', () => {
      // given
      const solution = new Solution({ id: 'id', isT2Enabled: true });

      // when
      const deactivationsT2 = solution.deactivations.t2;

      // then
      expect(deactivationsT2).to.be.false;
    });

    it('should return an deactivations.t2 = true when t2 is not enabled ', () => {
      // given
      const solution = new Solution({ id: 'id', isT2Enabled: false });

      // when
      const deactivationsT2 = solution.deactivations.t2;

      // then
      expect(deactivationsT2).to.be.true;
    });

    it('should return an deactivations.t3 = false when t3 is enabled ', () => {
      // given
      const solution = new Solution({ id: 'id', isT3Enabled: true });

      // when
      const deactivationsT3 = solution.deactivations.t3;

      // then
      expect(deactivationsT3).to.be.false;
    });

    it('should return an deactivations.t3 = true when t3 is not enabled ', () => {
      // given
      const solution = new Solution({ id: 'id', isT3Enabled: false });

      // when
      const deactivationsT3 = solution.deactivations.t3;

      // then
      expect(deactivationsT3).to.be.true;
    });
  });

  describe('#match', () => {

    let sandbox;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();

      sandbox.stub(solutionServiceQcm, 'match');
      sandbox.stub(solutionServiceQcu, 'match');
      sandbox.stub(solutionServiceQroc, 'match');
      sandbox.stub(solutionServiceQrocmInd, 'match');
      sandbox.stub(solutionServiceQrocmDep, 'match');
    });

    afterEach(() => {
      sandbox.restore();
    });

    context('when solution is of type QCU', () => {

      const answerValue = 'answerValue';
      let solution;
      let result;

      beforeEach(() => {
        // given
        solutionServiceQcu.match.returns(AnswerStatus.OK);
        solution = factory.buildSolution({ type: 'QCU' });

        // when
        result = solution.match(answerValue);
      });

      it('should call solutionServiceQcu', () => {
        // then
        expect(solutionServiceQcu.match).to.have.been.calledWith(answerValue, solution.value);
      });
      it('should return OK if answer is correct', () => {
        // then
        expect(result.isOK()).to.be.true;
      });
    });

    context('when solution is of type QCM', () => {

      const answerValue = 'answerValue';
      let solution;
      let result;

      beforeEach(() => {
        // given
        solutionServiceQcm.match.returns(AnswerStatus.OK);
        solution = factory.buildSolution({ type: 'QCM' });

        // when
        result = solution.match(answerValue);
      });

      it('should call solutionServiceQcm', () => {
        // then
        expect(solutionServiceQcm.match).to.have.been.calledWith(answerValue, solution.value);
      });
      it('should return OK if answer is correct', () => {
        // then
        expect(result.isOK()).to.be.true;
      });
    });

    context('when solution is of type QROC', () => {

      const answerValue = 'answerValue';
      let solution;
      let result;

      beforeEach(() => {
        // given
        solutionServiceQroc.match.returns(AnswerStatus.OK);
        solution = factory.buildSolution({ type: 'QROC' });

        // when
        result = solution.match(answerValue);
      });

      it('should call solutionServiceQroc', () => {
        // then
        expect(solutionServiceQroc.match).to.have.been.calledWith(answerValue, solution.value, solution.deactivations);
      });
      it('should return OK if answer is correct', () => {
        // then
        expect(result.isOK()).to.be.true;
      });
    });

    context('when solution is of type QROCM-ind', () => {

      const answerValue = 'answerValue';
      let solution;
      let result;

      beforeEach(() => {
        // given
        solutionServiceQrocmInd.match.returns({ result: AnswerStatus.OK, resultDetails: 'result details' });
        solution = factory.buildSolution({ type: 'QROCM-ind' });

        // when
        result = solution.match(answerValue);
      });

      it('should call solutionServiceQrocmInd', () => {
        // then
        expect(solutionServiceQrocmInd.match).to.have.been
          .calledWith(answerValue, solution.value, solution.enabledTreatments);
      });
      it('should return OK if answer is correct', () => {
        // then
        expect(result.isOK()).to.be.true;
      });
    });

    context('when solution is of type QROCM-dep', () => {

      const answerValue = 'answerValue';
      let solution;
      let result;

      beforeEach(() => {
        // given
        solutionServiceQrocmDep.match.returns(AnswerStatus.OK);
        solution = factory.buildSolution({ type: 'QROCM-dep' });

        // when
        result = solution.match(answerValue);
      });

      it('should call solutionServiceQrocmDep', () => {
        // then
        expect(solutionServiceQrocmDep.match).to.have.been
          .calledWith(answerValue, solution.value, solution.scoring, solution.deactivations);
      });
      it('should return OK if answer is correct', () => {
        // then
        expect(result.isOK()).to.be.true;
      });
    });

    context('when solution is of some other type', () => {

      const answerValue = 'answerValue';
      let solution;
      let result;

      beforeEach(() => {
        // given
        solution = factory.buildSolution({ type: 'something strange' });

        // when
        result = solution.match(answerValue);
      });

      it('should return UNIMPLEMENTED', () => {
        // then
        expect(result.isUNIMPLEMENTED()).to.be.true;
      });
    });
  });

  describe('#matchDetails', () => {

    let sandbox;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();

      sandbox.stub(solutionServiceQrocmInd, 'match');
    });

    afterEach(() => {
      sandbox.restore();
    });

    context('when solution is of type QROCM-ind', () => {

      const answerValue = 'answerValue';
      let solution;
      let resultDetails;

      beforeEach(() => {
        // given
        solutionServiceQrocmInd.match.returns({ result: AnswerStatus.OK, resultDetails: 'result details' });
        solution = factory.buildSolution({ type: 'QROCM-ind' });

        // when
        resultDetails = solution.matchDetails(answerValue);
      });

      it('should call solutionServiceQrocmInd', () => {
        // then
        expect(solutionServiceQrocmInd.match).to.have.been
          .calledWith(answerValue, solution.value, solution.enabledTreatments);
      });
      it('should return OK if answer is correct', () => {
        // then
        expect(resultDetails).to.equal('result details');
      });
    });

    context('when solution is of some other type', () => {

      const answerValue = 'answerValue';
      let solution;
      let resultDetails;

      beforeEach(() => {
        // given
        solution = factory.buildSolution({ type: 'QCM' });

        // when
        resultDetails = solution.matchDetails(answerValue);
      });

      it('should return null', () => {
        // then
        expect(resultDetails).to.equal(null);
      });
    });
  });
});
