import { MissionLearner } from '../../../../../src/school/domain/models/MissionLearner.js';
import {
  filterByGlobalResult,
  filterByStatuses,
} from '../../../../../src/school/domain/usecases/find-paginated-mission-learners.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Domain | Use Cases | find-paginated-mission-learners', function () {
  context('filterByStatuses', function () {
    it('with empty mission learners, returns empty filtered array', function () {
      const filter = [];
      const missionLearners = [];
      const filteredMissionLearners = filterByStatuses(missionLearners, filter);

      expect(filteredMissionLearners).to.deep.equals([]);
    });

    it('should returns mission learner corresponding to the status filter', function () {
      const notStartedMissionAssessement = new MissionLearner({
        missionStatus: 'not-started',
      });
      const completedMissionAssessement = new MissionLearner({
        missionStatus: 'completed',
      });
      const startedMissionAssessement = new MissionLearner({
        missionStatus: 'started',
      });

      const missionLearners = [notStartedMissionAssessement, completedMissionAssessement, startedMissionAssessement];
      const statusFilter = ['completed'];
      const filteredMissionLearners = filterByStatuses(missionLearners, statusFilter);

      expect(filteredMissionLearners).to.deep.equals([completedMissionAssessement]);
    });
  });
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
