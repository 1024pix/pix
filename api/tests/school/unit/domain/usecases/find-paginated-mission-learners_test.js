import { MissionLearner } from '../../../../../src/school/domain/models/MissionLearner.js';
import { filterByGlobalResult } from '../../../../../src/school/domain/usecases/find-paginated-mission-learners.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Domain | Use Cases | find-paginated-mission-learners', function () {
  context('filterByGlobalResult', function () {
    it('with empty mission learners, returns empty filtered array', function () {
      const filterGlobalResults = [];
      const missionLearners = [];
      const filteredMissionLearners = filterByGlobalResult(missionLearners, filterGlobalResults);

      expect(filteredMissionLearners).to.deep.equals([]);
    });

    it('should returns mission learner corresponding to the filter', function () {
      const missionLearnerExceeded = new MissionLearner({
        result: { global: 'exceeded' },
      });
      const missionLearnerReached = new MissionLearner({
        result: { global: 'reached' },
      });
      const missionLearnerNull = new MissionLearner({
        result: null,
      });

      const missionLearners = [missionLearnerExceeded, missionLearnerReached, missionLearnerNull];
      const filterGlobalResults = ['exceeded'];
      const filteredMissionLearners = filterByGlobalResult(missionLearners, filterGlobalResults);

      expect(filteredMissionLearners).to.deep.equals([missionLearnerExceeded]);
    });
    it('mission learner should be filter when they have no result', function () {
      const missionLearnerGlobalReached = new MissionLearner({
        result: { global: 'reached' },
      });
      const missionLearnerGlobalUndefined = new MissionLearner({
        result: { global: undefined },
      });
      const missionLearnerNull = new MissionLearner({
        result: null,
      });

      const missionLearners = [missionLearnerGlobalReached, missionLearnerGlobalUndefined, missionLearnerNull];
      const filterGlobalResults = ['no-result'];
      const filteredMissionLearners = filterByGlobalResult(missionLearners, filterGlobalResults);

      expect(filteredMissionLearners).to.deep.equals([missionLearnerGlobalUndefined, missionLearnerNull]);
    });
  });
});
