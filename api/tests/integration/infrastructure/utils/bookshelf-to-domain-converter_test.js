const { expect } = require('../../../test-helper');
const bookshelfToDomainConverter = require('../../../../lib/infrastructure/utils/bookshelf-to-domain-converter');

const Assessment = require('../../../../lib/domain/models/Assessment');
const SmartPlacementKnowledgeElement = require('../../../../lib/domain/models/SmartPlacementKnowledgeElement');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const CampaignParticipation = require('../../../../lib/domain/models/CampaignParticipation');

const BookshelfAssessment = require('../../../../lib/infrastructure/data/assessment');
const BookshelfUser = require('../../../../lib/infrastructure/data/user');

describe('Integration | Infrastructure | Utils | Bookshelf to domain converter', function() {
  let assessmentWithRelated, assessmentWithoutRelated, assessments;

  beforeEach(() => {
    assessmentWithRelated = new BookshelfAssessment({
      id: 1,
      assessmentResults: [
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ],
      campaignParticipation: { id: 1 },
    });

    assessmentWithoutRelated = new BookshelfAssessment({ id: 2 });

    assessments = [assessmentWithRelated, assessmentWithoutRelated];
  });

  describe('buildDomainObjects', function() {
    it('should convert array of bookshelf object to array of corresponding domain object', function() {
      // when
      const domainAssessments = bookshelfToDomainConverter.buildDomainObjects(BookshelfAssessment, assessments);
      const domainAssessmentWithRelated = domainAssessments[0];
      const domainAssessmentWithoutRelated = domainAssessments[1];

      // then
      expect(domainAssessments).to.have.lengthOf(2);

      expect(domainAssessmentWithRelated.id).to.equal(1);
      expect(domainAssessmentWithRelated.assessmentResults).to.have.lengthOf(3);
      expect(domainAssessmentWithRelated.assessmentResults[2].id).to.equal(3);
      expect(domainAssessmentWithRelated.campaignParticipation.id).to.equal(1);

      expect(domainAssessmentWithoutRelated.id).to.equal(2);
      expect(domainAssessmentWithoutRelated.assessmentResults).to.be.empty;
      expect(domainAssessmentWithoutRelated.campaignParticipation).to.be.undefined;
    });

    it('should return empty array if bookshelf array is empty', function() {
      // when
      const domainAssessments = bookshelfToDomainConverter.buildDomainObjects(BookshelfAssessment, []);

      // then
      expect(domainAssessments).to.be.empty;
    });
  });

  describe('buildDomainObject', function() {
    it('should convert bookshelf object with relation to corresponding domain object', function() {
      // when
      const domainAssessment = bookshelfToDomainConverter.buildDomainObject(BookshelfAssessment, assessmentWithRelated);

      // then
      expect(domainAssessment).to.be.instanceOf(Assessment);
      expect(domainAssessment.id).to.equal(1);

      expect(domainAssessment.assessmentResults).to.have.lengthOf(3);
      expect(domainAssessment.assessmentResults[1]).to.be.instanceOf(AssessmentResult);
      expect(domainAssessment.assessmentResults[2].id).to.equal(3);

      expect(domainAssessment.campaignParticipation).to.be.instanceOf(CampaignParticipation);
      expect(domainAssessment.campaignParticipation.id).to.equal(1);
    });

    it('should convert bookshelf object without relation to corresponding domain object', function() {
      // when
      const domainAssessment = bookshelfToDomainConverter.buildDomainObject(BookshelfAssessment, assessmentWithoutRelated);

      // then
      expect(domainAssessment.id).to.equal(2);
      expect(domainAssessment.assessmentResults).to.be.empty;
      expect(domainAssessment.campaignParticipation).to.be.undefined;
    });

    it('should convert bookshelf object with attribute with name equal to a model name but are not a relation', function() {
      // given
      const assessment = new BookshelfAssessment({
        id: 1,
        campaignParticipation: 'Manu',
        assessmentResults: 'EvilCorp',
      });

      // when
      const domainAssessment = bookshelfToDomainConverter.buildDomainObject(BookshelfAssessment, assessment);

      // then
      expect(domainAssessment.campaignParticipation).to.equal('Manu');
      expect(domainAssessment.assessmentResults).to.equal('EvilCorp');
    });

    // TODO: Remove this after refactoring SmartPlacementKnowledgeElements into KnowledgeElements
    it('should deal with the specific case of knowledge elements whose called differently as a model or as a property', () => {
      // given
      const userWithKnowledgeElements = new BookshelfUser({
        id: 1,
        knowledgeElements: [{ id: 1, status: 'validated' }],
      });
      // when
      const domainUser = bookshelfToDomainConverter.buildDomainObject(BookshelfUser, userWithKnowledgeElements);
      // then
      expect(domainUser.knowledgeElements[0]).to.be.instanceOf(SmartPlacementKnowledgeElement);
    });
  });
});
