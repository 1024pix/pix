import {
  CampaignCombinedCourseItem,
  COMBINED_COURSE_ITEM_TYPES,
  ModuleCombinedCourseItem,
  TrainingCombinedCourseItem,
} from '../../../../../src/quest/domain/models/combined-course-participations/value-objects/CombinedCourseItem.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Domain | Models | CombinedCourseItem', function () {
  describe('TrainingCombinedCourseItem', function () {
    it('should return a model with the given parameters', function () {
      // when
      const item = new TrainingCombinedCourseItem({
        id: 1,
        title: 'title',
        reference: 'reference',
        redirection: 'redirection',
        participationStatus: 'STARTED',
        isCompleted: true,
        duration: 10,
        image: 'image',
        isLocked: false,
      });

      // then
      expect(item.id).to.equal(1);
      expect(item.title).to.equal('title');
      expect(item.reference).to.equal('reference');
      expect(item.type).to.equal(COMBINED_COURSE_ITEM_TYPES.FORMATION);
      expect(item.redirection).to.equal('redirection');
      expect(item.participationStatus).to.equal('STARTED');
      expect(item.isCompleted).to.be.true;
      expect(item.duration).to.equal(10);
      expect(item.image).to.equal('image');
      expect(item.isLocked).to.be.false;
    });
  });

  describe('CampaignCombinedCourseItem', function () {
    it('should apply default values for isLocked, masteryRate, totalStagesCount and validatedStagesCount', function () {
      // when
      const item = new CampaignCombinedCourseItem({
        id: 1,
      });

      // then
      expect(item.isLocked).to.be.true;
      expect(item.masteryRate).to.be.null;
      expect(item.totalStagesCount).to.be.null;
      expect(item.validatedStagesCount).to.be.null;
      expect(item.type).to.equal(COMBINED_COURSE_ITEM_TYPES.CAMPAIGN);
    });
  });
  describe('ModuleCombinedCourseItem', function () {
    it('should set shortId and type at MODULE', function () {
      // when
      const item = new ModuleCombinedCourseItem({
        id: 1,
        shortId: 'short-1',
      });

      // then
      expect(item.shortId).to.equal('short-1');
      expect(item.type).to.equal(COMBINED_COURSE_ITEM_TYPES.MODULE);
    });
  });
});
