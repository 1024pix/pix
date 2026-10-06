import { expect } from 'chai';

import { KnowledgeState } from '../../../../../src/shared/domain/models/KnowledgeState.ts';

describe('Unit | Shared | Domain | Models | KnowledgeState', function () {
  it('should sort the direct levels', function () {
    // when
    const knowledgeState = new KnowledgeState({ userId: 123, tubeId: 'tube_web', directLevels: [4, 2, 3] });

    // then
    expect(knowledgeState.directLevels).to.deep.equal([2, 3, 4]);
  });

  it('should refuse a direct level given twice', function () {
    // when
    const build = () => new KnowledgeState({ userId: 123, tubeId: 'tube_web', directLevels: [2, 4, 2] });

    // then
    expect(build).to.throw('Knowledge state of tube tube_web has duplicate direct levels: 2, 4, 2');
  });
});
