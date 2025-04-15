import { Passage } from '../../../../../src/devcomp/domain/models/Passage.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Passage', function () {
  describe('#constructor', function () {
    it('should create a passage and keep attributes', function () {
      // given
      const id = 1;
      const moduleId = '25530e38-fdb9-497a-923e-9e2d1be47918';
      const userId = 123;
      const createdAt = new Date('2020-01-01');
      const updatedAt = new Date('2020-01-01');

      // when
      const passage = new Passage({ id, moduleId, userId, createdAt, updatedAt });

      // then
      expect(passage.id).to.equal(id);
      expect(passage.moduleId).to.equal(moduleId);
      expect(passage.userId).to.equal(userId);
      expect(passage.createdAt).to.equal(createdAt);
      expect(passage.updatedAt).to.equal(updatedAt);
      expect(passage.terminatedAt).to.be.undefined;
    });
  });

  describe('#terminate', function () {
    let clock;

    beforeEach(function () {
      clock = sinon.useFakeTimers(new Date('2024-01-02'), 'Date');
    });

    afterEach(function () {
      clock.restore();
    });

    it('should create a passage and keep attributes', function () {
      // given
      const passage = new Passage({});

      // when
      passage.terminate();

      // then
      expect(passage.terminatedAt).to.deep.equal(new Date());
    });
  });
});
