import { missionLearnerController } from '../../../../src/school/application/mission-learner-controller.js';
import { MissionLearner } from '../../../../src/school/domain/models/MissionLearner.js';
import { usecases } from '../../../../src/school/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../test-helper.js';

describe('Integration | Controller | mission-learner-controller', function () {
  describe('#findPaginatedMissionLearners', function () {
    it('should return missionLearners', async function () {
      const organizationId = 1;
      const missionId = 1;
      const missionLearner = new MissionLearner({
        id: 1,
        firstName: 'TechnoMechanicus',
        lastName: 'Musk',
        organizationId,
        division: 'CP',
        status: 'not-started',
        result: undefined,
      });
      const pagination = {
        page: 1,
        pageCount: 1,
        pageSize: 50,
        rowCount: 1,
      };

      const findPaginatedMissionLearnersStub = sinon.stub(usecases, 'findPaginatedMissionLearners');
      findPaginatedMissionLearnersStub.resolves({ missionLearners: [missionLearner], pagination });

      const result = await missionLearnerController.findPaginatedMissionLearners(
        {
          params: {
            organizationId,
            missionId,
          },
          query: { 'page[size]': 50, 'page[number]': 1, 'filter[divisions]': 'CP' },
        },
        hFake,
      );

      expect(result.data).to.deep.equal([
        {
          attributes: {
            'first-name': missionLearner.firstName,
            'last-name': missionLearner.lastName,
            division: missionLearner.division,
            'organization-id': missionLearner.organizationId,
            status: missionLearner.status,
            result: undefined,
          },
          id: missionLearner.id.toString(),
          type: 'mission-learners',
        },
      ]);
      expect(result.meta).to.deep.equal(pagination);
      expect(findPaginatedMissionLearnersStub).to.have.been.calledWith({
        organizationId,
        missionId,
        page: { size: 50, number: 1 },
        filter: { divisions: ['CP'] },
      });
    });

    it('should return empty result when there is no mission learners', async function () {
      const organizationId = 1;
      const missionLearner = [];
      const pagination = {
        page: 1,
        pageCount: 1,
        pageSize: 50,
        rowCount: 1,
      };

      sinon.stub(usecases, 'findPaginatedMissionLearners').resolves({ missionLearners: missionLearner, pagination });

      const result = await missionLearnerController.findPaginatedMissionLearners(
        {
          params: {
            id: organizationId,
          },
          query: { 'page[size]': 50, 'page[number]': 1 },
        },
        hFake,
      );

      expect(result.data).to.deep.equal([]);
      expect(result.meta).to.deep.equal(pagination);
    });
  });
});
