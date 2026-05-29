import {
  COMBINED_COURSE_ITEM_TYPES,
  CombinedCourseItem,
} from '../../../../../src/quest/domain/models/combined-course-participation/CombinedCourseItem.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Domain | Models | CombinedCourseItem', function () {
  describe('#constructor', function () {
    it('should return a model with the given parameters', function () {
      // when
      const item = new CombinedCourseItem({
        id: 1,
        title: 'title',
        reference: 'reference',
        type: COMBINED_COURSE_ITEM_TYPES.MODULE,
        redirection: 'redirection',
        participationStatus: 'STARTED',
        isCompleted: true,
        duration: 10,
        image: 'image',
        isLocked: false,
        masteryRate: 0.5,
        totalStagesCount: 4,
        validatedStagesCount: 2,
        shortId: 'short-1',
      });

      // then
      expect(item.id).to.equal(1);
      expect(item.title).to.equal('title');
      expect(item.reference).to.equal('reference');
      expect(item.type).to.equal(COMBINED_COURSE_ITEM_TYPES.MODULE);
      expect(item.redirection).to.equal('redirection');
      expect(item.participationStatus).to.equal('STARTED');
      expect(item.isCompleted).to.be.true;
      expect(item.duration).to.equal(10);
      expect(item.image).to.equal('image');
      expect(item.isLocked).to.be.false;
      expect(item.masteryRate).to.equal(0.5);
      expect(item.totalStagesCount).to.equal(4);
      expect(item.validatedStagesCount).to.equal(2);
      expect(item.shortId).to.equal('short-1');
    });

    it('should apply default values for isLocked, masteryRate, totalStagesCount and validatedStagesCount', function () {
      // when
      const item = new CombinedCourseItem({
        id: 1,
        type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN,
      });

      // then
      expect(item.isLocked).to.be.true;
      expect(item.masteryRate).to.be.null;
      expect(item.totalStagesCount).to.be.null;
      expect(item.validatedStagesCount).to.be.null;
    });
  });

  describe('#shortId', function () {
    it('should set shortId when type is MODULE', function () {
      // when
      const item = new CombinedCourseItem({
        id: 1,
        type: COMBINED_COURSE_ITEM_TYPES.MODULE,
        shortId: 'short-1',
      });

      // then
      expect(item.shortId).to.equal('short-1');
    });

    it('should not set shortId when type is CAMPAIGN', function () {
      // when
      const item = new CombinedCourseItem({
        id: 1,
        type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN,
        shortId: 'short-1',
      });

      // then
      expect(item).to.not.have.property('shortId');
    });

    it('should not set shortId when type is FORMATION', function () {
      // when
      const item = new CombinedCourseItem({
        id: 1,
        type: COMBINED_COURSE_ITEM_TYPES.FORMATION,
        shortId: 'short-1',
      });

      // then
      expect(item).to.not.have.property('shortId');
    });
  });
});
