const { expect } = require('../../../test-helper');
const bookshelfToDomainConverter = require('../../../../lib/infrastructure/utils/bookshelf-to-domain-converter');

const DomainAssessment = require('../../../../lib/domain/models/Assessment');
const DomainAssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const DomainCampaignParticipation = require('../../../../lib/domain/models/CampaignParticipation');

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
      const domainAssessments = bookshelfToDomainConverter.buildDomainObjects(assessments);
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
      const domainAssessments = bookshelfToDomainConverter.buildDomainObjects([]);

      // then
      expect(domainAssessments).to.be.empty;
    });
  });

  describe('buildDomainObject', function() {
    it('should convert bookshelf object with relation to corresponding domain object', function() {
      // when
      const domainAssessment = bookshelfToDomainConverter.buildDomainObject(assessmentWithRelated);

      // then
      expect(domainAssessment).to.be.instanceOf(DomainAssessment);
      expect(domainAssessment.id).to.equal(1);

      expect(domainAssessment.assessmentResults).to.have.lengthOf(3);
      expect(domainAssessment.assessmentResults[1]).to.be.instanceOf(DomainAssessmentResult);
      expect(domainAssessment.assessmentResults[2].id).to.equal(3);

      expect(domainAssessment.campaignParticipation).to.be.instanceOf(DomainCampaignParticipation);
      expect(domainAssessment.campaignParticipation.id).to.equal(1);
    });

    it('should convert bookshelf object without relation to corresponding domain object', function() {
      // when
      const domainAssessment = bookshelfToDomainConverter.buildDomainObject(assessmentWithoutRelated);

      // then
      expect(domainAssessment.id).to.equal(2);
      expect(domainAssessment.assessmentResults).to.be.undefined;
      expect(domainAssessment.campaignParticipation).to.be.undefined;
    });

    it('should convert bookshelf object with attribute with name equal to a model name but are not a relation', function() {
      // given
      const assessment = new Assessment({
        id: 1,
        campaignParticipation: 'Manu',
        assessmentResults: 'EvilCorp',
      });

      // when
      const domainAssessment = bookshelfToDomainConverter.buildDomainObject(assessment);

      // then
      expect(domainAssessment.campaignParticipation).to.equal('Manu');
      expect(domainAssessment.assessmentResults).to.equal('EvilCorp');
    });
  });
});
