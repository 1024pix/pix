import { CORE_MESH_CONFIGURATION } from '../../../../../../src/certification/shared/domain/constants/mesh-configuration.js';
import {
  findIntervalIndexFromScore,
  findMeshFromScore,
} from '../../../../../../src/certification/shared/domain/services/mesh-service.js';

const MAX_REACHABLE_LEVEL = 8;

describe('Unit | Shared | Domain | Services | Mesh Service', function () {
  describe('#findMeshFromScore', function () {
    [
      {
        score: 0,
        meshKey: 'LEVEL_PRE_BEGINNER',

        expectedInterval: CORE_MESH_CONFIGURATION.get('LEVEL_PRE_BEGINNER'),
      },
      {
        score: 64,
        meshKey: 'LEVEL_BEGINNER_1',

        expectedInterval: CORE_MESH_CONFIGURATION.get('LEVEL_BEGINNER_1'),
      },
      {
        score: 200,
        meshKey: 'LEVEL_BEGINNER_2',

        expectedInterval: CORE_MESH_CONFIGURATION.get('LEVEL_BEGINNER_2'),
      },
      {
        score: 895,
        meshKey: 'LEVEL_EXPERT_7',

        expectedInterval: CORE_MESH_CONFIGURATION.get('LEVEL_EXPERT_7'),
      },
      {
        score: 1024,
        meshKey: 'LEVEL_EXPERT_8',

        expectedInterval: CORE_MESH_CONFIGURATION.get('LEVEL_EXPERT_8'),
      },
    ].forEach(({ score, meshKey, expectedInterval }) => {
      it(`returns the interval ${JSON.stringify(expectedInterval)} of key ${meshKey} when score is ${score}`, function () {
        // when
        const result = findMeshFromScore({
          score,
          maxReachableLevel: MAX_REACHABLE_LEVEL,
        });

        // then
        expect(result.key).to.equal(meshKey);
        expect(result.value).to.equal(expectedInterval);
      });
    });
  });

  describe('#findIntervalIndexFromScore', function () {
    [
      {
        score: 0,
        expectedInterval: 0,
      },
      {
        score: 64,
        expectedInterval: 1,
      },
      {
        score: 200,
        expectedInterval: 2,
      },
      {
        score: 895,
        expectedInterval: 7,
      },
      {
        score: 1024,
        expectedInterval: 8,
      },
    ].forEach(({ score, expectedInterval }) => {
      it(`returns the interval ${expectedInterval} when score is ${score}`, function () {
        // when
        const result = findIntervalIndexFromScore({
          score,
          maxReachableLevel: MAX_REACHABLE_LEVEL,
        });

        // then
        expect(result).to.equal(expectedInterval);
      });
    });
  });
});
