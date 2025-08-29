import { Solution } from '../../../../../src/devcomp/domain/models/Solution.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Domain | Models | Solution', function () {
  describe('#enabledTolerances', function () {
    it('should contain nothing, when no tolerances are set', function () {
      // given
      const solution = new Solution({ id: 'id' });

      // when
      const enabledTolerances = solution.enabledTolerances;

      // then
      expect(enabledTolerances).to.be.empty;
    });

    it('should contain t1, when isT1Enabled is true', function () {
      // given
      const solution = new Solution({ id: 'id', tEnabled: 0b1 });

      // when
      const enabledTolerances = solution.enabledTolerances;

      // then
      expect(enabledTolerances).to.deep.equal(['t1']);
    });

    it('should contain t2, when isT2Enabled is true', function () {
      // given
      const solution = new Solution({ id: 'id', tEnabled: 0b10 });

      // when
      const enabledTolerances = solution.enabledTolerances;

      // then
      expect(enabledTolerances).to.deep.equal(['t2']);
    });

    it('should contain t3, when isT3Enabled is true', function () {
      // given
      const solution = new Solution({ id: 'id', tEnabled: 0b100 });

      // when
      const enabledTolerances = solution.enabledTolerances;

      // then
      expect(enabledTolerances).to.deep.equal(['t3']);
    });

    it('should contain t1, t2, t3, when isT1Enabled, isT2Enabled, isT3Enabled is true', function () {
      // given
      const solution = new Solution({ id: 'id', tEnabled: 0b111 });

      // when
      const enabledTolerances = solution.enabledTolerances;

      // then
      expect(enabledTolerances).to.deep.equal(['t1', 't2', 't3']);
    });
  });

  describe('#deactivations', function () {
    it('should return an deactivations.t1 = false when t1 is enabled ', function () {
        // given
      const solution = new Solution({ id: 'id', tEnabled: 0b1 });

      // when
      const deactivationsT1 = solution.deactivations.t1;

      // then
      expect(deactivationsT1).to.be.false;
    });

    it('should return an deactivations.t1 = true when t1 is not enabled ', function () {
      // given
      const solution = new Solution({ id: 'id',tEnabled: 0b110 });

      // when
      const deactivationsT1 = solution.deactivations.t1;

      // then
      expect(deactivationsT1).to.be.true;
    });

    it('should return an deactivations.t2 = false when t2 is enabled ', function () {
      // given
      const solution = new Solution({ id: 'id', tEnabled: 0b010 });

      // when
      const deactivationsT2 = solution.deactivations.t2;

      // then
      expect(deactivationsT2).to.be.false;
    });

    it('should return an deactivations.t2 = true when t2 is not enabled ', function () {
      // given
      const solution = new Solution({ id: 'id', tEnabled: 0b101 });

      // when
      const deactivationsT2 = solution.deactivations.t2;

      // then
      expect(deactivationsT2).to.be.true;
    });

    it('should return an deactivations.t3 = false when t3 is enabled ', function () {
      // given
      const solution = new Solution({ id: 'id', tEnabled: 0b100 });

      // when
      const deactivationsT3 = solution.deactivations.t3;

      // then
      expect(deactivationsT3).to.be.false;
    });

    it('should return an deactivations.t3 = true when t3 is not enabled ', function () {
      // given
      const solution = new Solution({ id: 'id', tEnabled: 0b011 });

      // when
      const deactivationsT3 = solution.deactivations.t3;

      // then
      expect(deactivationsT3).to.be.true;
    });
  });
});
