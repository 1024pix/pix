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

  describe('ceiling date', function () {
    it('should keep the date of the failure that set the ceiling', function () {
      // when
      const knowledgeState = new KnowledgeState({
        userId: 123,
        tubeId: 'tube_web',
        ceiling: 4,
        ceilingAt: new Date('2026-01-12'),
        updatedAt: new Date('2026-02-01'),
      });

      // then
      expect(knowledgeState.ceilingAt).to.deep.equal(new Date('2026-01-12'));
    });

    it('should date the ceiling from the last move when no date is given', function () {
      // when
      const knowledgeState = new KnowledgeState({
        userId: 123,
        tubeId: 'tube_web',
        ceiling: 4,
        updatedAt: new Date('2026-02-01'),
      });

      // then
      expect(knowledgeState.ceilingAt).to.deep.equal(new Date('2026-02-01'));
    });

    it('should have no ceiling date without ceiling', function () {
      // when
      const knowledgeState = new KnowledgeState({ userId: 123, tubeId: 'tube_web', floor: 2 });

      // then
      expect(knowledgeState.ceilingAt).to.equal(null);
    });

    it('should refuse a ceiling date without ceiling', function () {
      // when
      const build = () =>
        new KnowledgeState({ userId: 123, tubeId: 'tube_web', ceiling: null, ceilingAt: new Date('2026-01-12') });

      // then
      expect(build).to.throw('Knowledge state of tube tube_web has a ceiling date without ceiling');
    });
  });
});
