const { expect } = require('../../../test-helper');
const AssessmentCompleted = require('../../../../lib/domain/events/AssessmentCompleted');

describe('Unit | Domain | Events | AssessmentCompleted', () => {

  describe('#isCertificationType', () => {
    it('should return true when assessment is of type certification', () => {
      // given
      const assessmentCompleted = new AssessmentCompleted({
        certificationCourseId: 123,
      });

      // when / then
      expect(assessmentCompleted.isCertificationType).to.be.true;
    });
    it('should return true when assessment is not of type certification', () => {
      // given
      const assessmentCompleted = new AssessmentCompleted({
        certificationCourseId: null,
      });

      // when / then
      expect(assessmentCompleted.isCertificationType).to.be.false;
    });
  });

  describe('#isCampaignType', () => {
    it('should return true when assessment is of type campaign', () => {
      // given
      const assessmentCompleted = new AssessmentCompleted({
        campaignParticipationId: 123,
      });

      // when / then
      expect(assessmentCompleted.isCampaignType).to.be.true;
    });
    it('should return true when assessment is not of type campaign', () => {
      // given
      const assessmentCompleted = new AssessmentCompleted({
        campaignParticipationId: null,
      });

      // when / then
      expect(assessmentCompleted.isCampaignType).to.be.false;
    });
  });
});
