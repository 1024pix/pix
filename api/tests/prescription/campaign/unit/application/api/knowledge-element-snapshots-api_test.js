import * as knowledgeElementSnapshotsApi from '../../../../../../src/prescription/campaign/application/api/knowledge-element-snapshots-api.js';
import { KnowledgeElementSnapshot } from '../../../../../../src/prescription/campaign/application/api/models/KnowledgeElementSnapshot.js';
import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';
import { KnowledgeElementCollection } from '../../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | API | KnowledgeElementSnapshots', function () {
  describe('#save', function () {
    let clock;

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now: Date.now(), toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it('should return true', async function () {
      const snapshotPayload = {
        userId: 123,
        knowledgeElements: [domainBuilder.buildKnowledgeElement()],
        campaignParticipationId: 789,
      };

      const saveSnapshotStub = sinon.stub(usecases, 'saveKnowledgeElementSnapshotForParticipation');
      saveSnapshotStub.rejects('I was not called with the expected args.');
      saveSnapshotStub
        .withArgs({
          knowledgeElementCollection: new KnowledgeElementCollection(snapshotPayload.knowledgeElements),
          campaignParticipationId: snapshotPayload.campaignParticipationId,
        })
        .resolves();

      // when
      const result = await knowledgeElementSnapshotsApi.save(snapshotPayload);

      // then
      expect(result).to.be.true;
    });
  });

  describe('#getByParticipation', function () {
    it('should return the knowledge element snapshot', async function () {
      const campaignParticipationId = 789;
      const knowledgeElements = Symbol('knowledgeElements');
      const getSnapshotStub = sinon.stub(usecases, 'getKnowledgeElementSnapshotForParticipation');
      getSnapshotStub
        .withArgs({
          campaignParticipationId,
        })
        .resolves(knowledgeElements);

      // when
      const result = await knowledgeElementSnapshotsApi.getByParticipation(campaignParticipationId);

      // then
      expect(result).to.deepEqualInstance(
        new KnowledgeElementSnapshot({
          knowledgeElements,
          campaignParticipationId,
        }),
      );
    });
  });
});
