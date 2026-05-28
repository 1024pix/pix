import {
  CampaignItem,
  COMBINED_COURSE_ITEM_TYPES,
  CombinedCourseItem,
  FormationItem,
  ModuleItem,
} from '../../../../../src/quest/domain/models/CombinedCourseItem.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Domain | Models | CombinedCourseItem', function () {
  describe('CampaignItem', function () {
    it('should be an instance of CombinedCourseItem', function () {
      const item = new CampaignItem({ id: 1 });

      expect(item).to.be.instanceOf(CombinedCourseItem);
    });

    it('should set type to CAMPAIGN', function () {
      const item = new CampaignItem({ id: 1 });

      expect(item.type).to.equal(COMBINED_COURSE_ITEM_TYPES.CAMPAIGN);
    });

    it('should set campaign-specific properties', function () {
      const item = new CampaignItem({
        id: 1,
        title: 'title',
        reference: 'reference',
        participationStatus: 'STARTED',
        isCompleted: true,
        isLocked: false,
        masteryRate: 0.5,
        totalStagesCount: 4,
        validatedStagesCount: 2,
      });

      expect(item.id).to.equal(1);
      expect(item.title).to.equal('title');
      expect(item.reference).to.equal('reference');
      expect(item.participationStatus).to.equal('STARTED');
      expect(item.isCompleted).to.be.true;
      expect(item.isLocked).to.be.false;
      expect(item.masteryRate).to.equal(0.5);
      expect(item.totalStagesCount).to.equal(4);
      expect(item.validatedStagesCount).to.equal(2);
    });

    it('should apply default values for isLocked, masteryRate, totalStagesCount and validatedStagesCount', function () {
      const item = new CampaignItem({ id: 1 });

      expect(item.isLocked).to.be.true;
      expect(item.masteryRate).to.be.null;
      expect(item.totalStagesCount).to.be.null;
      expect(item.validatedStagesCount).to.be.null;
    });
  });

  describe('ModuleItem', function () {
    it('should be an instance of CombinedCourseItem', function () {
      const item = new ModuleItem({ id: 1 });

      expect(item).to.be.instanceOf(CombinedCourseItem);
    });

    it('should set type to MODULE', function () {
      const item = new ModuleItem({ id: 1 });

      expect(item.type).to.equal(COMBINED_COURSE_ITEM_TYPES.MODULE);
    });

    it('should set module-specific properties', function () {
      const item = new ModuleItem({
        id: 1,
        title: 'title',
        reference: 'reference',
        participationStatus: 'STARTED',
        isCompleted: true,
        isLocked: false,
        redirection: 'redirection',
        duration: 10,
        image: 'image',
        shortId: 'short-1',
      });

      expect(item.id).to.equal(1);
      expect(item.title).to.equal('title');
      expect(item.reference).to.equal('reference');
      expect(item.participationStatus).to.equal('STARTED');
      expect(item.isCompleted).to.be.true;
      expect(item.isLocked).to.be.false;
      expect(item.redirection).to.equal('redirection');
      expect(item.duration).to.equal(10);
      expect(item.image).to.equal('image');
      expect(item.shortId).to.equal('short-1');
    });

    it('should apply default value for isLocked', function () {
      const item = new ModuleItem({ id: 1 });

      expect(item.isLocked).to.be.true;
    });
  });

  describe('FormationItem', function () {
    it('should be an instance of CombinedCourseItem', function () {
      const item = new FormationItem({ id: 1 });

      expect(item).to.be.instanceOf(CombinedCourseItem);
    });

    it('should set type to FORMATION', function () {
      const item = new FormationItem({ id: 1 });

      expect(item.type).to.equal(COMBINED_COURSE_ITEM_TYPES.FORMATION);
    });

    it('should set base properties', function () {
      const item = new FormationItem({
        id: 1,
        reference: 'reference',
      });

      expect(item.id).to.equal(1);
      expect(item.reference).to.equal('reference');
      expect(item.isLocked).to.be.true;
    });
  });
});
