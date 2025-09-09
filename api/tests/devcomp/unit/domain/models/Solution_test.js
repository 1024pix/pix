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

    describe('Extended tolerance range (t4-t32)', function () {
      it('should contain t4 when 4th bit is enabled', function () {
        // given
        const solution = new Solution({ id: 'id', tEnabled: 0b1000 }); // t4

        // when
        const enabledTolerances = solution.enabledTolerances;

        // then
        expect(enabledTolerances).to.deep.equal(['t4']);
      });

      it('should contain t10 when 10th bit is enabled', function () {
        // given
        const solution = new Solution({ id: 'id', tEnabled: 1 << 9 }); // t10 (0-based: bit 9)

        // when
        const enabledTolerances = solution.enabledTolerances;

        // then
        expect(enabledTolerances).to.deep.equal(['t10']);
      });

      it('should contain t32 when 32nd bit is enabled', function () {
        // given
        const solution = new Solution({ id: 'id', tEnabled: 1 << 31 }); // t32 (0-based: bit 31)

        // when
        const enabledTolerances = solution.enabledTolerances;

        // then
        expect(enabledTolerances).to.deep.equal(['t32']);
      });

      it('should handle multiple extended tolerances together', function () {
        // given - t4, t8, t16, t24
        const tEnabled = (1 << 3) | (1 << 7) | (1 << 15) | (1 << 23);
        const solution = new Solution({ id: 'id', tEnabled });

        // when
        const enabledTolerances = solution.enabledTolerances;

        // then
        expect(enabledTolerances).to.deep.equal(['t4', 't8', 't16', 't24']);
      });

      it('should handle mixed traditional and extended tolerances', function () {
        // given - t1, t3, t5, t12, t25
        const tEnabled = 0b101 | (1 << 4) | (1 << 11) | (1 << 24);
        const solution = new Solution({ id: 'id', tEnabled });

        // when
        const enabledTolerances = solution.enabledTolerances;

        // then
        expect(enabledTolerances).to.deep.equal(['t1', 't3', 't5', 't12', 't25']);
      });

      it('should handle all 32 tolerances enabled', function () {
        // given - all bits set (2^32 - 1)
        const solution = new Solution({ id: 'id', tEnabled: 0xFFFFFFFF }); // Math.pow(2, 32) - 1

        // when
        const enabledTolerances = solution.enabledTolerances;

        // then
        const expectedTolerances = [];
        for (let i = 1; i <= 32; i++) {
          expectedTolerances.push(`t${i}`);
        }
        expect(enabledTolerances).to.deep.equal(expectedTolerances);
      });

      it('should handle high-bit tolerances (t29, t30, t31, t32)', function () {
        // given
        const tEnabled = (1 << 28) | (1 << 29) | (1 << 30) | (1 << 31);
        const solution = new Solution({ id: 'id', tEnabled });

        // when
        const enabledTolerances = solution.enabledTolerances;

        // then
        expect(enabledTolerances).to.deep.equal(['t29', 't30', 't31', 't32']);
      });
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

    describe('Extended tolerance deactivations (t4-t32)', function () {
      it('should return deactivations.t10 = false when t10 is enabled', function () {
        // given
        const solution = new Solution({ id: 'id', tEnabled: 1 << 9 }); // t10

        // when
        const deactivationsT10 = solution.deactivations.t10;

        // then
        expect(deactivationsT10).to.be.false;
      });

      it('should return deactivations.t10 = true when t10 is not enabled', function () {
        // given
        const solution = new Solution({ id: 'id', tEnabled: 0b111 }); // only t1, t2, t3

        // when
        const deactivationsT10 = solution.deactivations.t10;

        // then
        expect(deactivationsT10).to.be.true;
      });

      it('should return deactivations.t32 = false when t32 is enabled', function () {
        // given
        const solution = new Solution({ id: 'id', tEnabled: 1 << 31 }); // t32

        // when
        const deactivationsT32 = solution.deactivations.t32;

        // then
        expect(deactivationsT32).to.be.false;
      });

      it('should return deactivations.t32 = true when t32 is not enabled', function () {
        // given
        const solution = new Solution({ id: 'id', tEnabled: 0 }); // no tolerances

        // when
        const deactivationsT32 = solution.deactivations.t32;

        // then
        expect(deactivationsT32).to.be.true;
      });

      it('should handle all extended tolerances correctly in deactivations object', function () {
        // given - only t1, t10, t20 enabled
        const tEnabled = 0b1 | (1 << 9) | (1 << 19);
        const solution = new Solution({ id: 'id', tEnabled });

        // when
        const deactivations = solution.deactivations;

        // then
        expect(deactivations.t1).to.be.false;   // enabled
        expect(deactivations.t2).to.be.true;    // not enabled
        expect(deactivations.t10).to.be.false;  // enabled
        expect(deactivations.t15).to.be.true;   // not enabled
        expect(deactivations.t20).to.be.false;  // enabled
        expect(deactivations.t25).to.be.true;   // not enabled
        expect(deactivations.t32).to.be.true;   // not enabled
      });
    });
  });
});
