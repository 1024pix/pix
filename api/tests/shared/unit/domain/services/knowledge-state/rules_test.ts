import { expect } from 'chai';

import { KnowledgeState } from '../../../../../../src/shared/domain/models/KnowledgeState.ts';
import {
  isAssessed,
  isDirect,
  isInvalidated,
  isValidated,
  statusOf,
  update,
} from '../../../../../../src/shared/domain/services/knowledge-state/rules.ts';

const buildKnowledgeState = (overrides = {}) =>
  new KnowledgeState({
    userId: 123,
    tubeId: 'tube_web',
    floor: 2,
    ceiling: 4,
    directLevels: [2, 4],
    updatedAt: new Date('2026-01-10'),
    ...overrides,
  });

describe('Unit | Shared | Domain | Services | knowledge-state | rules', function () {
  describe('reading a knowledge state', function () {
    it('should place every level in one of three zones: validated, invalidated, untested', function () {
      // given
      const knowledgeState = buildKnowledgeState();

      // then
      expect([1, 2].every((level) => isValidated(knowledgeState, level))).to.equal(true);
      expect([4, 5].every((level) => isInvalidated(knowledgeState, level))).to.equal(true);
      expect(isAssessed(knowledgeState, 3)).to.equal(false);
    });

    it('should invalidate nothing when the tube has no ceiling', function () {
      // given
      const knowledgeState = buildKnowledgeState({ ceiling: null });

      // then
      expect(isInvalidated(knowledgeState, 8)).to.equal(false);
    });

    it('should give a level its status, and none to an untested level', function () {
      // given
      const knowledgeState = buildKnowledgeState();

      // then
      expect(statusOf(knowledgeState, 1)).to.equal('validated');
      expect(statusOf(knowledgeState, 3)).to.equal(null);
      expect(statusOf(knowledgeState, 5)).to.equal('invalidated');
    });

    it('should tell the levels actually asked from the inferred ones', function () {
      // given
      const knowledgeState = buildKnowledgeState();

      // then
      expect(isDirect(knowledgeState, 2)).to.equal(true);
      expect(isDirect(knowledgeState, 1)).to.equal(false);
    });
  });

  describe('#update', function () {
    it('should raise the floor on a success, without mutating the initial knowledge state', function () {
      // given
      const knowledgeState = buildKnowledgeState();
      const at = new Date('2026-02-01');

      // when
      const after = update(knowledgeState, { level: 3, isOk: true, at });

      // then
      expect(after).to.deep.include({ floor: 3, ceiling: 4, directLevels: [2, 3, 4], updatedAt: at });
      expect(knowledgeState.floor).to.equal(2);
      expect(knowledgeState.directLevels).to.deep.equal([2, 4]);
    });

    it('should lower the ceiling on a failure', function () {
      // when
      const after = update(buildKnowledgeState(), { level: 3, isOk: false });

      // then
      expect(after).to.deep.include({ floor: 2, ceiling: 3 });
    });

    it('should set the ceiling on a failure when the tube had none', function () {
      // when
      const after = update(buildKnowledgeState({ ceiling: null }), { level: 5, isOk: false });

      // then
      expect(after.ceiling).to.equal(5);
    });

    it('should ignore an answer on an already assessed level, as today creates no knowledge element', function () {
      // given
      const knowledgeState = buildKnowledgeState();

      // then: a success under the floor, a success on the ceiling, a failure on the floor, a failure above the ceiling
      expect(update(knowledgeState, { level: 1, isOk: true })).to.equal(knowledgeState);
      expect(update(knowledgeState, { level: 4, isOk: true })).to.equal(knowledgeState);
      expect(update(knowledgeState, { level: 2, isOk: false })).to.equal(knowledgeState);
      expect(update(knowledgeState, { level: 6, isOk: false })).to.equal(knowledgeState);
    });

    it('should start a blank tube from the answer alone', function () {
      // when
      const after = update(new KnowledgeState({ userId: 123, tubeId: 'tube_web' }), { level: 3, isOk: false });

      // then
      expect(after).to.deep.include({ floor: 0, ceiling: 3, directLevels: [3] });
    });
  });
});
