import { databaseBuffer } from '../database-buffer.js';
import { buildOrganization } from './build-organization.js';
import { buildStructure } from './build-structure.js';

const buildNetwork = function ({
  id = databaseBuffer.getNextId(),
  name = 'Network',
  createdAt = new Date(),
  updatedAt,
} = {}) {
  const values = {
    id,
    name,
    created_at: createdAt,
    updated_at: updatedAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'networks',
    values,
  });
};

/**
 * Creates a network with its head organization (organization + structure + fct_structure).
 *
 * @param {object} [options]
 * @param {number} [options.id] - Network id
 * @param {string} [options.name] - Network name
 * @param {Parameters<typeof buildOrganization>[0]} [options.headOrganization] - Any parameter accepted by buildOrganization
 * @returns {{ network: {id: number, name: string }, structure: {id: number}, organization: object}} The created network, organization, and related structure.
 */
const buildNetworkAndHeadOrganization = function ({
  id = databaseBuffer.getNextId(),
  name = 'Network',
  headOrganization = {},
} = {}) {
  const network = buildNetwork({ id, name });
  const structure = buildStructure();
  const organization = buildOrganization({
    name: 'Head Organization',
    ...headOrganization,
    structureId: structure.id,
    networkId: network.id,
  });
  return { network, structure, organization };
};

/**
 * Creates a network with a multi-level organization hierarchy.
 *
 * @param {object} [options]
 * @param {number} [options.id] - Network id
 * @param {string} [options.name] - Network name
 * @param {number} [options.numberOfLevels=3] - Total number of levels, head included
 * @param {number} [options.childrenPerNode=1] - Number of children per node at each level
 * @returns {{ network: object, head: { organization: object, structure: object }, levels: Array<Array<{ organization: object, structure: object }>> }}
 *   - `network`: the created network
 *   - `head`: the head node `{ organization, structure }`
 *   - `levels`: array starting at level 1, each entry is an array of `{ organization, structure }`
 *
 * @example
 * const { network, head, levels } = buildNetworkWithMultipleLevels({ numberOfLevels: 3, childrenPerNode: 2 });
 * // network  → { id, name }
 * //
 * // head     → { organization: { name: 'Head Organization', ... }, structure: { ... } }
 * //
 * // levels[0] → level 1 : 2 nodes (direct children of head)
 * //   [
 * //     { organization: { name: 'Organization' }, structure: { parentStructureId: head.structure.id } },
 * //     { organization: { name: 'Organization' }, structure: { parentStructureId: head.structure.id } },
 * //   ]
 * //
 * // levels[1] → level 2 : 4 nodes (2 children per level-1 node)
 * //   [
 * //     { organization: { name: 'Organization' }, structure: { parentStructureId: levels[0][0].structure.id } },
 * //     { organization: { name: 'Organization' }, structure: { parentStructureId: levels[0][0].structure.id } },
 * //     { organization: { name: 'Organization' }, structure: { parentStructureId: levels[0][1].structure.id } },
 * //     { organization: { name: 'Organization' }, structure: { parentStructureId: levels[0][1].structure.id } },
 * //   ]
 */
const buildNetworkWithMultipleLevels = function ({
  id = databaseBuffer.getNextId(),
  name = 'Network',
  numberOfLevels = 3,
  childrenPerNode = 1,
} = {}) {
  const network = buildNetwork({ id, name });

  const headStructure = buildStructure();
  const headOrganization = buildOrganization({
    name: 'Head Organization',
    structureId: headStructure.id,
    networkId: network.id,
  });

  const levels = [];
  let parentNodes = [{ organization: headOrganization, structure: headStructure }];

  for (let level = 1; level < numberOfLevels; level++) {
    const currentLevel = [];
    for (const { structure } of parentNodes) {
      for (let i = 0; i < childrenPerNode; i++) {
        currentLevel.push(_createChildNode(structure, level));
      }
    }
    levels.push(currentLevel);
    parentNodes = currentLevel;
  }

  return { network, head: { organization: headOrganization, structure: headStructure }, levels };
};

export { buildNetwork, buildNetworkAndHeadOrganization, buildNetworkWithMultipleLevels };

function _createChildNode(parentStructure, level) {
  const structure = buildStructure();
  const organization = buildOrganization({
    name: `Organization L${level}`,
    structureId: structure.id,
    networkId: parentStructure.networkId,
    parentStructureId: parentStructure.id,
  });
  return { organization, structure };
}
