import { createRelationsFromPath, createTreeFromData } from '../../../../src/school/scripts/create-tree-data.js';
import { expect } from '../../../test-helper.js';

describe('Unit | Script | create tree data', function () {
  it('should create relation list from a single path', async function () {
    const tree = createRelationsFromPath('1-VALIDATION > 1-TRAINING > 1-VALIDATION > 1-TUTORIAL > 1-TRAINING');
    expect(tree).to.have.deep.members([
      {
        from: '1-VALIDATION',
        to: '1-VALIDATION > 1-TRAINING',
      },
      {
        from: '1-VALIDATION > 1-TRAINING',
        to: '1-VALIDATION > 1-TRAINING > 1-VALIDATION',
      },
      {
        from: '1-VALIDATION > 1-TRAINING > 1-VALIDATION',
        to: '1-VALIDATION > 1-TRAINING > 1-VALIDATION > 1-TUTORIAL',
      },
      {
        from: '1-VALIDATION > 1-TRAINING > 1-VALIDATION > 1-TUTORIAL',
        to: '1-VALIDATION > 1-TRAINING > 1-VALIDATION > 1-TUTORIAL > 1-TRAINING',
      },
    ]);
  });

  it('should create tree from json data', async function () {
    const data = [
      { fullPath: '1-VALIDATION > 1-TRAINING > 1-VALIDATION', number: 5 },
      { fullPath: '1-VALIDATION > 2-VALIDATION', number: 10 },
    ];
    const tree = createTreeFromData(data);
    expect(tree.relations).to.have.deep.members([
      { from: '1-VALIDATION', to: '1-VALIDATION > 1-TRAINING', number: 5 },
      { from: '1-VALIDATION > 1-TRAINING', to: '1-VALIDATION > 1-TRAINING > 1-VALIDATION', number: 5 },
      { from: '1-VALIDATION', to: '1-VALIDATION > 2-VALIDATION', number: 10 },
    ]);
    expect(tree.nodes).to.have.deep.members([
      { id: '1-VALIDATION' },
      { id: '1-VALIDATION > 1-TRAINING' },
      { id: '1-VALIDATION > 1-TRAINING > 1-VALIDATION' },
      { id: '1-VALIDATION > 2-VALIDATION' },
    ]);
  });

  it('should gather same relations and add up numbers', async function () {
    const data = [
      { fullPath: '1-VALIDATION > 1-TRAINING > 1-VALIDATION', number: 5 },
      { fullPath: '1-VALIDATION > 1-TRAINING > 1-TUTORIAL', number: 10 },
    ];
    const tree = createTreeFromData(data);
    expect(tree.relations).to.have.deep.members([
      { from: '1-VALIDATION', to: '1-VALIDATION > 1-TRAINING', number: 15 },
      { from: '1-VALIDATION > 1-TRAINING', to: '1-VALIDATION > 1-TRAINING > 1-VALIDATION', number: 5 },
      { from: '1-VALIDATION > 1-TRAINING', to: '1-VALIDATION > 1-TRAINING > 1-TUTORIAL', number: 10 },
    ]);
  });
});
