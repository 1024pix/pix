import { CORE_MESH_CONFIGURATION } from '../constants/mesh-configuration.js';

/**
 * @returns {{key: string, mesh: Mesh, meshIndex: number}}
 */
export function findMeshFromScore({ score, maxReachableLevel }) {
  let cumulativeWeight = 0;
  let currentMeshIndex = 0;

  for (const [key, mesh] of CORE_MESH_CONFIGURATION) {
    cumulativeWeight += mesh.weight;

    if (score < cumulativeWeight || currentMeshIndex === maxReachableLevel) {
      return { key, mesh, meshIndex: currentMeshIndex };
    }

    currentMeshIndex++;
  }

  throw new Error(`Cannot compute mesh for score ${score} and maxReachableLevel ${maxReachableLevel}`);
}

/**
 * @deprecated please use {@link MeshConfiguration#findMeshFromScore}
 */
export function findIntervalIndexFromScore({ score, maxReachableLevel }) {
  let cumulativeWeight = 0;
  let currentLevel = 0;
  for (const mesh of CORE_MESH_CONFIGURATION.values()) {
    cumulativeWeight += mesh.weight;
    if (score < cumulativeWeight || currentLevel === maxReachableLevel) {
      return currentLevel;
    }
    currentLevel++;
  }
  throw new Error(`Cannot compute interval for score ${score} and maxReachableLevel ${maxReachableLevel}`);
}
