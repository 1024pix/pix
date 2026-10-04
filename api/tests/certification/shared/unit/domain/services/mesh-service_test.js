import { expect } from 'chai';

import { CORE_MESH_CONFIGURATION } from '../../../../../../src/certification/shared/domain/constants/mesh-configuration.js';
import { findMeshFromScore } from '../../../../../../src/certification/shared/domain/services/mesh-service.js';

describe('Unit | Shared | Domain | Services | Mesh Service', function () {
  describe('#findMeshFromScore', function () {
    [
      {
        score: 0,
        meshKey: 'LEVEL_PRE_BEGINNER',

        expectedMesh: CORE_MESH_CONFIGURATION.get('LEVEL_PRE_BEGINNER'),
        expectedMeshIndex: 0,
      },
      {
        score: 64,
        meshKey: 'LEVEL_BEGINNER_1',

        expectedMesh: CORE_MESH_CONFIGURATION.get('LEVEL_BEGINNER_1'),
        expectedMeshIndex: 1,
      },
      {
        score: 200,
        meshKey: 'LEVEL_BEGINNER_2',

        expectedMesh: CORE_MESH_CONFIGURATION.get('LEVEL_BEGINNER_2'),
        expectedMeshIndex: 2,
      },
      {
        score: 895,
        meshKey: 'LEVEL_EXPERT_7',

        expectedMesh: CORE_MESH_CONFIGURATION.get('LEVEL_EXPERT_7'),
        expectedMeshIndex: 7,
      },
      {
        score: 1024,
        meshKey: 'LEVEL_EXPERT_8',

        expectedMesh: CORE_MESH_CONFIGURATION.get('LEVEL_EXPERT_8'),
        expectedMeshIndex: 8,
      },
    ].forEach(({ score, meshKey, expectedMesh, expectedMeshIndex }) => {
      it(`returns the interval ${JSON.stringify(expectedMesh)} of key ${meshKey} with meshIndex ${expectedMeshIndex} when score is ${score}`, function () {
        // when
        const result = findMeshFromScore({
          score,
          maxReachableLevel: 8,
        });

        // then
        expect(result.key).to.equal(meshKey);
        expect(result.mesh).to.equal(expectedMesh);
        expect(result.meshIndex).to.equal(expectedMeshIndex);
      });
    });

    [
      {
        score: 0,
        meshKey: 'LEVEL_PRE_BEGINNER',

        expectedMesh: CORE_MESH_CONFIGURATION.get('LEVEL_PRE_BEGINNER'),
        expectedMeshIndex: 0,
      },
      {
        score: 64,
        meshKey: 'LEVEL_BEGINNER_1',

        expectedMesh: CORE_MESH_CONFIGURATION.get('LEVEL_BEGINNER_1'),
        expectedMeshIndex: 1,
      },
      {
        score: 200,
        meshKey: 'LEVEL_BEGINNER_2',

        expectedMesh: CORE_MESH_CONFIGURATION.get('LEVEL_BEGINNER_2'),
        expectedMeshIndex: 2,
      },
      {
        score: 895,
        meshKey: 'LEVEL_EXPERT_7',

        expectedMesh: CORE_MESH_CONFIGURATION.get('LEVEL_EXPERT_7'),
        expectedMeshIndex: 7,
      },
      {
        score: 1024,
        meshKey: 'LEVEL_EXPERT_7',

        expectedMesh: CORE_MESH_CONFIGURATION.get('LEVEL_EXPERT_7'),
        expectedMeshIndex: 7,
      },
    ].forEach(({ score, meshKey, expectedMesh, expectedMeshIndex }) => {
      it(`returns the interval ${JSON.stringify(expectedMesh)} of key ${meshKey} with meshIndex ${expectedMeshIndex} when score is ${score} and max level is ceiled`, function () {
        // when
        const result = findMeshFromScore({
          score,
          maxReachableLevel: 7,
        });

        // then
        expect(result.key).to.equal(meshKey);
        expect(result.mesh).to.equal(expectedMesh);
        expect(result.meshIndex).to.equal(expectedMeshIndex);
      });
    });
    it('throws when giving a score and maxReachableLevel out of range', function () {
      expect(() => findMeshFromScore({ score: 9999, maxReachableLevel: 10 })).to.throw(
        'Cannot compute mesh for score 9999 and maxReachableLevel 10',
      );
    });
  });
});
