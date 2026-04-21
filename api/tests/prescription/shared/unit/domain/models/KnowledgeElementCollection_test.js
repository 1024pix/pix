import sinon from 'sinon';

import { KnowledgeElementCollection } from '../../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { KnowledgeElement } from '../../../../../../src/shared/domain/models/KnowledgeElement.js';

import { buildKnowledgeElement } from '../../../../../tooling/domain-builder/factory/build-knowledge-element.js';

describe('Unit | Domain | Models | KnowledgeElementCollection', function () {
  describe('#toSnapshot', function () {
    it('should return a stringified JSON array of skills', function () {
      const ke1 = buildKnowledgeElement({
        skillId: 'rec1',
        competenceId: 5,
        createdAt: new Date('2025-01-10'),
        earnedPix: 4,
        answerId: 1,
        assessmentId: 2,
        id: 1,
        userId: 1,
      });
      const keCollection = new KnowledgeElementCollection([ke1]);
      expect(keCollection.toSnapshot()).equal(
        '[{"createdAt":"2025-01-10T00:00:00.000Z","source":"direct","status":"validated","earnedPix":4,"skillId":"rec1","competenceId":5}]',
      );
    });

    it('should call latestUniqNonResetKnowledgeElements method', function () {
      const ke1 = buildKnowledgeElement({
        skillId: 'rec1',
        competenceId: 5,
        createdAt: new Date('2025-01-10'),
        earnedPix: 4,
        answerId: 1,
        assessmentId: 2,
        id: 1,
        userId: 1,
      });
      const keCollection = new KnowledgeElementCollection([ke1]);

      // we stub the method to contorl its output
      const stub = sinon.stub(keCollection, 'latestUniqNonResetKnowledgeElements');
      stub.get(() => []);

      const snapshot = keCollection.toSnapshot();
      expect(snapshot).equals('[]');
    });

    it('should drop id, userId, assessmentId, answerId', function () {
      const ke1 = buildKnowledgeElement({
        skillId: 'rec1',
        competenceId: 5,
        createdAt: new Date('2025-01-10'),
        earnedPix: 4,
        answerId: 1,
        assessmentId: 2,
        id: 1,
        source: KnowledgeElement.SourceType.DIRECT,
        status: KnowledgeElement.StatusType.VALIDATED,
        userId: 1,
      });
      const keCollection = new KnowledgeElementCollection([ke1]);
      const snapshot = keCollection.toSnapshot();
      expect(snapshot).not.match(/"userId":/i);
      expect(snapshot).not.match(/"id":/i);
      expect(snapshot).not.match(/"assessmentId":/i);
      expect(snapshot).not.match(/"answerId":/i);
    });
  });

  describe('latestUniqNonResetKnowledgeElements', function () {
    it('should returns ke', function () {
      const ke1 = buildKnowledgeElement({ skillId: 'rec1', answerId: 1, createdAt: new Date('2025-01-10'), id: 1 });
      const ke2 = buildKnowledgeElement({ skillId: 'rec2', answerId: 2, createdAt: new Date('2025-01-11'), id: 2 });
      const keCollection = new KnowledgeElementCollection([ke1, ke2]);
      expect(keCollection.latestUniqNonResetKnowledgeElements).to.deep.equal([ke2, ke1]);
    });

    it('should drop reset skillId', function () {
      const ke1 = buildKnowledgeElement({
        skillId: 'rec1',
        answerId: 1,
        status: KnowledgeElement.StatusType.RESET,
        createdAt: new Date('2025-01-10'),
        id: 1,
      });
      const keCollection = new KnowledgeElementCollection([ke1]);
      expect(keCollection.latestUniqNonResetKnowledgeElements).to.deep.equal([]);
    });

    it('should return most recent uniq skillId', function () {
      const ke1 = buildKnowledgeElement({ skillId: 'rec1', answerId: 1, createdAt: new Date('2025-01-10'), id: 1 });
      const ke2 = buildKnowledgeElement({ skillId: 'rec1', answerId: 2, createdAt: new Date('2025-01-11'), id: 2 });
      const keCollection = new KnowledgeElementCollection([ke1, ke2]);
      expect(keCollection.latestUniqNonResetKnowledgeElements).to.deep.equal([ke2]);
    });
  });
});
