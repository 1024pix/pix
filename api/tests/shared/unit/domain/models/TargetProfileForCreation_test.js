import { TargetProfileForCreation } from '../../../../../src/shared/domain/models/index.js';
import { domainBuilder, expect } from '../../../../test-helper.js';

describe('Unit | Domain | Models | TargetProfileForCreation', function () {
  describe('#static copyTargetProfile', function () {
    it('it should copy a target profile for creation with a different name', async function () {
      // given
      const targetProfileForCreation = domainBuilder.buildTargetProfileForCreation({
        areKnowledgeElementsResettable: false,
        category: 'CUSTOM',
        comment: 'a comment',
        description: 'a description',
        imageUrl: 'old url',
        name: 'original name',
        tubes: [
          {
            id: 'recTubeId',
            level: 8,
          },
        ],
      });

      // when
      const copiedTargetProfile = TargetProfileForCreation.copyTargetProfile({ ...targetProfileForCreation });

      // then
      expect(copiedTargetProfile.name).to.equal('[Copie] original name');
      expect(copiedTargetProfile.areKnowledgeElementsResettable).to.be.false;
      expect(copiedTargetProfile.category).to.equal('CUSTOM');
      expect(copiedTargetProfile.comment).to.equal('a comment');
      expect(copiedTargetProfile.description).to.equal('a description');
      expect(copiedTargetProfile.imageUrl).to.equal('old url');
      expect(copiedTargetProfile.tubes).to.deep.equal([
        {
          id: 'recTubeId',
          level: 8,
        },
      ]);
    });
  });
});
