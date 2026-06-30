import { Campaign } from '../../../../../src/quest/domain/models/combined-courses/entities/Campaign.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Domain | Models | Campaign ', function () {
  describe('#constructor', function () {
    it('should construct object', function () {
      // given
      const values = {
        id: 1,
        name: 'name',
        code: 'code',
        targetProfileId: 2,
        organizationId: 3,
        creatorId: 4,
        ownerId: 5,
        title: 'title',
        customResultPageButtonUrl: 'customResultPageButtonUrl',
        customResultPageButtonText: 'customResultPageButtonText',
      };

      // when
      const campaign = new Campaign(values);

      // then
      expect(campaign).deep.equal(values);
    });
  });

  describe('#buildCampaignForCombinedCourse', function () {
    it('should build campaign without recommandable modules in target profile', function () {
      // given
      const targetProfile = { id: 2, internalName: 'internalName', name: 'name' };

      // when
      const campaign = Campaign.buildCampaignForCombinedCourse({
        organizationId: '1',
        targetProfile,
        creatorId: '3',
        combinedCourseCode: 'code',
        recommendableModules: null,
        modules: [],
      });

      // then
      expect(campaign).deep.contain({
        organizationId: 1,
        targetProfileId: targetProfile.id,
        creatorId: 3,
        ownerId: 3,
        name: 'internalName',
        title: 'name',
        customResultPageButtonUrl: '/parcours/code',
        customResultPageButtonText: 'Continuer',
      });
    });

    it('should build campaign without modules matching recommandable modules', function () {
      // given
      const targetProfile = { id: 2, internalName: 'internalName', name: 'name' };

      // when
      const campaign = Campaign.buildCampaignForCombinedCourse({
        organizationId: '1',
        targetProfile,
        creatorId: '3',
        combinedCourseCode: 'code',
        recommendableModules: [{ moduleId: 1 }, { moduleId: 2 }],
        modules: [{ id: 3 }],
      });

      // then
      expect(campaign).deep.contain({
        organizationId: 1,
        targetProfileId: targetProfile.id,
        creatorId: 3,
        ownerId: 3,
        name: 'internalName',
        title: 'name',
        customResultPageButtonUrl: '/parcours/code',
        customResultPageButtonText: 'Continuer',
      });
    });

    it('should build campaign with recommandable modules', function () {
      // given
      const targetProfile = { id: 2, internalName: 'internalName', name: 'name' };

      // when
      const campaign = Campaign.buildCampaignForCombinedCourse({
        organizationId: '1',
        targetProfile,
        creatorId: '3',
        combinedCourseCode: 'code',
        recommendableModules: [{ moduleId: 1 }, { moduleId: 2 }],
        modules: [{ id: 1 }],
      });

      // then
      expect(campaign).deep.contain({
        organizationId: 1,
        targetProfileId: targetProfile.id,
        creatorId: 3,
        ownerId: 3,
        name: 'internalName',
        title: 'name',
        customResultPageButtonUrl: '/parcours/code/chargement',
        customResultPageButtonText: 'Continuer',
      });
    });
  });
});
