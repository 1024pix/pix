import { Badge } from '../../../../../src/evaluation/domain/models/Badge.js';
import { updateBadge } from '../../../../../src/evaluation/domain/usecases/update-badge.js';
import * as badgeRepository from '../../../../../src/evaluation/infrastructure/repositories/badge-repository.js';
import { catchErr, databaseBuilder, expect, mockLearningContent } from '../../../../test-helper.js';

describe('Integration | UseCases | create-badge', function () {
  let targetProfileId;
  let alreadyExistingFirstBadge;
  let alreadyExistingSecondBadge;

  beforeEach(async function () {
    const learningContent = {
      skills: [{ id: 'recSkill1' }],
    };

    mockLearningContent(learningContent);

    targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
    databaseBuilder.factory.buildTargetProfileTube({ tubeId: 'monTubeA', level: 2, targetProfileId });
    databaseBuilder.factory.buildTargetProfileTube({ tubeId: 'monTubeB', level: 8, targetProfileId });
    alreadyExistingFirstBadge = databaseBuilder.factory.buildBadge({ id: 1, key: 'firstBadgeKey' });
    alreadyExistingSecondBadge = databaseBuilder.factory.buildBadge({ id: 2, key: 'secondBadgeKey' });

    await databaseBuilder.commit();
  });

  it('should update the badge', async function () {
    const dataToUpdate = {
      message: 'newMessage',
      altMessage: 'newAltMessage',
      key: 'newKey',
      title: 'newTitle',
      imageUrl: 'newImageUrl',
      isCertifiable: false,
      isAlwaysVisible: true,
    };

    const updatedFirstBadge = await updateBadge({
      badgeId: alreadyExistingFirstBadge.id,
      badge: dataToUpdate,
      badgeRepository,
    });

    expect(updatedFirstBadge).to.be.instanceOf(Badge);

    for (const property in dataToUpdate) {
      expect(updatedFirstBadge[property]).to.equal(dataToUpdate[property]);
    }
  });

  describe('when the badge id does not exists', function () {
    it('should throw a not found error', async function () {
      const error = await catchErr(updateBadge)({
        badgeId: 0,
        badge: {},
        badgeRepository,
      });

      expect(error.name).to.equal('NotFoundError');
    });
  });

  describe('when the badge key has changed and is already taken by another badge', function () {
    it('should throw an AlreadyExistingEntityError', async function () {
      const error = await catchErr(updateBadge)({
        badgeId: alreadyExistingSecondBadge.id,
        badge: { key: alreadyExistingFirstBadge.key },
        badgeRepository,
      });

      expect(error.name).to.equal('AlreadyExistingEntityError');
    });
  });
});
