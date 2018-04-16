const Solution = require('../../../../lib/domain/models/Solution');
const { expect } = require('../../../test-helper');

describe('Unit | Domain | Models | Solution', () => {

  describe('#deactivations', () => {

    it('should return an deactivations.t1 = false when t1 is enabled ', () => {
      // given
      const solution = new Solution({ id: 'id', enabledTreatments: ['t1', 't2', 't3'] });

      // when
      const deactivationsT1 = solution.deactivations.t1;

      // then
      expect(deactivationsT1).to.be.false;
    });

    it('should return an deactivations.t1 = true when t1 is not enabled ', () => {
      // given
      const solution = new Solution({ id: 'id', enabledTreatments: ['t2', 't3'] });

      // when
      const deactivationsT1 = solution.deactivations.t1;

      // then
      expect(deactivationsT1).to.be.true;
    });

    it('should return an deactivations.t2 = false when t2 is enabled ', () => {
      // given
      const solution = new Solution({ id: 'id', enabledTreatments: ['t1', 't2', 't3'] });

      // when
      const deactivationsT2 = solution.deactivations.t2;

      // then
      expect(deactivationsT2).to.be.false;
    });

    it('should return an deactivations.t2 = true when t2 is not enabled ', () => {
      // given
      const solution = new Solution({ id: 'id', enabledTreatments: ['t1', 't3'] });

      // when
      const deactivationsT2 = solution.deactivations.t2;

      // then
      expect(deactivationsT2).to.be.true;
    });

    it('should return an deactivations.t3 = false when t3 is enabled ', () => {
      // given
      const solution = new Solution({ id: 'id', enabledTreatments: ['t1', 't2', 't3'] });

      // when
      const deactivationsT3 = solution.deactivations.t3;

      // then
      expect(deactivationsT3).to.be.false;
    });

    it('should return an deactivations.t3 = true when t3 is not enabled ', () => {
      // given
      const solution = new Solution({ id: 'id', enabledTreatments: ['t1', 't2'] });

      // when
      const deactivationsT3 = solution.deactivations.t3;

      // then
      expect(deactivationsT3).to.be.true;
    });
  });
});
