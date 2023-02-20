import { expect } from '../../../test-helper';
import AssessmentCompleted from '../../../../lib/domain/events/AssessmentCompleted';

describe('Unit | Domain | Events | AssessmentCompleted', function () {
  describe('#isCertificationType', function () {
    it('should return true when assessment is of type certification', function () {
      // given
      const assessmentCompleted = new AssessmentCompleted({
        certificationCourseId: 123,
      });

      // when / then
      expect(assessmentCompleted.isCertificationType).to.be.true;
    });
    it('should return true when assessment is not of type certification', function () {
      // given
      const assessmentCompleted = new AssessmentCompleted({
        certificationCourseId: null,
      });

      // when / then
      expect(assessmentCompleted.isCertificationType).to.be.false;
    });
  });

  describe('#isCampaignType', function () {
    it('should return true when assessment is of type campaign', function () {
      // given
      const assessmentCompleted = new AssessmentCompleted({
        campaignParticipationId: 123,
      });

      // when / then
      expect(assessmentCompleted.isCampaignType).to.be.true;
    });
    it('should return true when assessment is not of type campaign', function () {
      // given
      const assessmentCompleted = new AssessmentCompleted({
        campaignParticipationId: null,
      });

      // when / then
      expect(assessmentCompleted.isCampaignType).to.be.false;
    });
  });
});
