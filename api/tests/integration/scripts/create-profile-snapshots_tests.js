const { expect, databaseBuilder, knex, learningContentBuilder, mockLearningContent, sinon } = require('../../test-helper');
const { createProfileSnapshot } = require('../../../scripts/create-profile-snapshots');

describe('Integration | Scripts | create profile snapshots', () => {
  afterEach(async () => {
    await knex('profile-snapshots').delete();
  });

  it('create a profile snapshot for a user', async () => {
    // given
    const user = databaseBuilder.factory.buildUser();
    const learningContent = [{
      id: '1. Information et données',
      competences: [{
        id: 'competence_id',
      }],
    }];

    const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
    mockLearningContent(learningContentObjects);

    const knowledgeElements = Array.from({ length: 4 }, () => databaseBuilder.factory.buildKnowledgeElement({ competenceId: 'competence_id' }));
    const knowledgeElementSnapshot = databaseBuilder.factory.buildKnowledgeElementSnapshot({ userId: user.id, snapshot: JSON.stringify(knowledgeElements) });
    await databaseBuilder.commit();

    // when
    await createProfileSnapshot(knowledgeElementSnapshot);

    // then
    const { count: profileSnapshotsCount } = (await knex('profile-snapshots').count())[0];
    expect(profileSnapshotsCount).to.equal(1);
  });
});
