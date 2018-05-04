const Solution = require('../../../../lib/domain/models/Solution');
const { expect } = require('../../../test-helper');

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
});
