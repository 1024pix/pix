import { expect } from 'chai';
import sinon from 'sinon';

import { CappedTube } from '../../../../../src/quest/domain/models/combined-course-blueprints/value-objects/CappedTube.js';
import * as cappedTubeRepository from '../../../../../src/quest/infrastructure/repositories/combined-course-blueprints/capped-tube-repository.js';

describe('Quest | Unit | Infrastructure | Repositories | capped-tube', function () {
  describe('#findCappedTubesForTargetProfileIds', function () {
    it('should call findCappedTubesForTargetProfileIds method from targetProfilesApi', async function () {
      // given
      const targetProfileIds = [1, 2];
      const targetProfilesApiStub = {
        findCappedTubesForTargetProfileIds: sinon.stub(),
      };
      targetProfilesApiStub.findCappedTubesForTargetProfileIds.withArgs(targetProfileIds).resolves([]);

      // when
      await cappedTubeRepository.findCappedTubesForTargetProfileIds({
        targetProfileIds,
        targetProfilesApi: targetProfilesApiStub,
      });

      // then
      expect(targetProfilesApiStub.findCappedTubesForTargetProfileIds).to.have.been.calledOnceWithExactly(
        targetProfileIds,
      );
    });

    it('should map the api capped tubes into CappedTube value objects', async function () {
      // given
      const targetProfileIds = [1, 2];
      const targetProfilesApiStub = {
        findCappedTubesForTargetProfileIds: sinon.stub(),
      };
      targetProfilesApiStub.findCappedTubesForTargetProfileIds.withArgs(targetProfileIds).resolves([
        { tubeId: 'tubeId1', level: 3 },
        { tubeId: 'tubeId2', level: 8 },
      ]);

      // when
      const result = await cappedTubeRepository.findCappedTubesForTargetProfileIds({
        targetProfileIds,
        targetProfilesApi: targetProfilesApiStub,
      });

      // then
      expect(result).to.deep.equal([
        new CappedTube({ id: 'tubeId1', level: 3 }),
        new CappedTube({ id: 'tubeId2', level: 8 }),
      ]);
      expect(result[0]).to.be.an.instanceOf(CappedTube);
    });

    it('should return an empty array when the api returns no capped tube', async function () {
      // given
      const targetProfileIds = [1];
      const targetProfilesApiStub = {
        findCappedTubesForTargetProfileIds: sinon.stub().resolves([]),
      };

      // when
      const result = await cappedTubeRepository.findCappedTubesForTargetProfileIds({
        targetProfileIds,
        targetProfilesApi: targetProfilesApiStub,
      });

      // then
      expect(result).to.deep.equal([]);
    });
  });
});
