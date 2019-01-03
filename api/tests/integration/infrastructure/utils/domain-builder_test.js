const { expect } = require('../../../test-helper');
const domainBuilder = require('../../../../lib/infrastructure/utils/domain-builder');

const Assessment = require('../../../../lib/infrastructure/data/assessment');
const AssessmentResult = require('../../../../lib/infrastructure/data/assessment-result');
const CampaignParticipation = require('../../../../lib/infrastructure/data/campaign-participation');

describe('Integration | Infrastructure | Utils | Domain Builder', function() {
  let assessmentWithRelated, assessmentWithoutRelated, assessments;

  beforeEach(() => {
    const assessmentResults = [
      new AssessmentResult({ id: 1 }),
      new AssessmentResult({ id: 2 }),
      new AssessmentResult({ id: 3 }),
    ];

    const campaignParticipation = new CampaignParticipation({ id: 1 });

    assessmentWithRelated = new Assessment({
      id: 1,
      assessmentResults,
      campaignParticipation,
    });

    assessmentWithoutRelated = new Assessment({ id: 2 });

    assessments = [assessmentWithRelated, assessmentWithoutRelated];
  });

  describe('buildDomainObjects', function() {
    it('should convert array of bookshelf object to array of corresponding domain object', function() {
      // when
      const domainAssessments = domainBuilder.buildDomainObjects(assessments);
      const domainAssessmentWithRelated = domainAssessments[0];
      const domainAssessmentWithoutRelated = domainAssessments[1];

      // then
      expect(domainAssessments).to.have.lengthOf(2);

      expect(domainAssessmentWithRelated.id).to.equal(1);
      expect(domainAssessmentWithRelated.assessmentResults).to.have.lengthOf(3);
      expect(domainAssessmentWithRelated.assessmentResults[2].id).to.equal(3);
      expect(domainAssessmentWithRelated.campaignParticipation.id).to.equal(1);

      expect(domainAssessmentWithoutRelated.id).to.equal(2);
      expect(domainAssessmentWithoutRelated.assessmentResults).to.be.undefined;
      expect(domainAssessmentWithoutRelated.campaignParticipation).to.be.undefined;
    });

    it('should return empty array if bookshelf array is empty', function() {
      // when
      const domainAssessments = domainBuilder.buildDomainObjects([]);

      // then
      expect(domainAssessments).to.be.empty;
    });
  });

  describe('buildDomainObject', function() {
    it('should convert bookshelf object with relation to corresponding domain object', function() {
      // when
      const domainAssessment = domainBuilder.buildDomainObject(assessmentWithRelated);

      // then
      expect(domainAssessment.id).to.equal(1);
      expect(domainAssessment.assessmentResults).to.have.lengthOf(3);
      expect(domainAssessment.assessmentResults[2].id).to.equal(3);
      expect(domainAssessment.campaignParticipation.id).to.equal(1);
    });

    it('should convert bookshelf object without relation to corresponding domain object', function() {
      // when
      const domainAssessment = domainBuilder.buildDomainObject(assessmentWithoutRelated);

      // then
      expect(domainAssessment.id).to.equal(2);
      expect(domainAssessment.assessmentResults).to.be.undefined;
      expect(domainAssessment.campaignParticipation).to.be.undefined;
    });
  });
});
