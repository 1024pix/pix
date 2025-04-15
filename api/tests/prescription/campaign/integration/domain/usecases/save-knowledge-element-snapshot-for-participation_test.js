import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';
import { KnowledgeElementCollection } from '../../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { KnowledgeElement } from '../../../../../../src/shared/domain/models/KnowledgeElement.js';
import { databaseBuilder, domainBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | UseCase | save-knowledge-element-snapshot-for-participation', function () {
  it('should persist knowledgeElement', async function () {
    const knowledgeElement = domainBuilder.buildKnowledgeElement();
    const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation().id;
    await databaseBuilder.commit();

    const knowledgeElementCollection = new KnowledgeElementCollection([knowledgeElement]);
    const result = await usecases.saveKnowledgeElementSnapshotForParticipation({
      campaignParticipationId,
      knowledgeElementCollection,
    });

    expect(result).to.be.instanceOf(Array);
    expect(result[0]).to.be.instanceOf(KnowledgeElement);
    expect(result[0].skillId).to.equal(knowledgeElement.skillId);
  });
});
