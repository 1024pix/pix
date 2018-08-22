const { expect, factory } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/assessment-serializer');
const Assessment = require('../../../../../lib/domain/models/Assessment');
const Campaign = require('../../../../../lib/domain/models/Campaign');
const CampaignParticipation = require('../../../../../lib/domain/models/CampaignParticipation');

describe('Unit | Serializer | JSONAPI | assessment-serializer', function() {

  let modelObject;
  let jsonAssessment;
  let jsonAssessmentSmartPlacement;

  beforeEach(() => {
    const associatedCourse = {
      id: 'course_id',
      nbChallenges: 8,
      description: 'coucou',
      name: 'PIX EST FORMIDABLE',
    };

    modelObject = new Assessment({
      id: 'assessment_id',
      courseId: 'course_id',
      type: 'charade',
      course: associatedCourse,
    });

    jsonAssessment = {
      data: {
        type: 'assessment',
        id: 'assessment_id',
        attributes: {
          'estimated-level': undefined,
          'pix-score': undefined,
          'success-rate': undefined,
          'type': 'charade',
          'certification-number': null,
        },
        relationships: {
          course: {
            data: {
              type: 'courses',
              id: 'course_id',
            },
          },
          answers: {
            data: []
          }
        },
      },
      included: [{
        type: 'courses',
        id: 'course_id',
        attributes: {
          'nb-challenges': '8',
          description: 'coucou',
          name: 'PIX EST FORMIDABLE',
        },
      }],
    };

    jsonAssessmentSmartPlacement = {
      data: {
        type: 'assessment',
        id: 'assessment_id',
        attributes: {
          'estimated-level': undefined,
          'pix-score': undefined,
          'success-rate': 24,
          'type': 'SMART_PLACEMENT',
          'certification-number': null,
        },
      },
    };
  });

  describe('#serialize()', function() {

    it('should convert an Assessment model object into JSON API data', function() {
      // when
      const json = serializer.serialize(modelObject);

      // then
      expect(json).to.deep.equal(jsonAssessment);
    });

    it('should add a relationship for assessments of type SMART_PLACEMENT', function() {
      // given
      const assessmentId = 15615386;
      const assessment = factory.buildAssessment.ofTypeSmartPlacement({ id: assessmentId });
      const expectedSkillReviewRelationship = {
        data: {
          id: 'skill-review-15615386',
          type: 'skill-reviews',
        },
      };

      // when
      const json = serializer.serialize(assessment);

      // then

      expect(json.data).to.have.property('relationships')
        .and.to.contain.key('skill-review');

      expect(json.data.relationships['skill-review']).to.deep.equal(expectedSkillReviewRelationship);
    });

    it('should add campaign-code when the model has a campaign', function() {
      // given
      const codeCampaign = 'CODECAMP';
      modelObject.campaignParticipation = new CampaignParticipation({
        campaign: new Campaign({ code: codeCampaign })
      });
      jsonAssessment.data.attributes['code-campaign'] = codeCampaign;

      // when
      const json = serializer.serialize(modelObject);

      // then
      expect(json).to.deep.equal(jsonAssessment);
    });

  });

  describe('#deserialize()', () => {

    it('should convert JSON API data into an Assessment object', () => {
      // when
      const assessment = serializer.deserialize(jsonAssessment);

      // then
      expect(assessment).to.be.instanceOf(Assessment);
      expect(assessment.id).to.equal(jsonAssessment.data.id);
      expect(assessment.courseId).to.equal(jsonAssessment.data.relationships.course.data.id);
    });

    context('when the assessment is a SMART_PLACEMENT assessment', () => {
      it('should convert JSON API data into an Assessment object with courseId null', () => {
        // when
        const assessment = serializer.deserialize(jsonAssessmentSmartPlacement);

        // then
        expect(assessment).to.be.instanceOf(Assessment);
        expect(assessment.id).to.equal(jsonAssessment.data.id);
        expect(assessment.type).to.equal('SMART_PLACEMENT');
        expect(assessment.courseId).to.equal(null);
      });
    });

    describe('field "type"', () => {

      it('should set "type" attribute value when it is present', () => {
        // given
        jsonAssessment.data.attributes.type = 'PLACEMENT';

        // when
        const assessment = serializer.deserialize(jsonAssessment);

        // then
        expect(assessment.type).to.equal('PLACEMENT');
      });
    });
  });

});
