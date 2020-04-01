const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/assessment-serializer');
const Assessment = require('../../../../../lib/domain/models/Assessment');

describe('Unit | Serializer | JSONAPI | assessment-serializer', function() {

  describe('#serialize()', function() {

    it('should convert an Assessment model object (of type CERTIFICATION) into JSON API data', function() {
      //given
      const certificationCourseId = 1;
      const assessment = domainBuilder.buildAssessment({ certificationCourseId });
      const expectedJson = {
        data: {
          id: assessment.id.toString(),
          type: 'assessments',
          attributes: {
            'certification-number': certificationCourseId,
            state: assessment.state,
            type: assessment.type,
            title: assessment.courseId.toString(),
            'competence-id': assessment.competenceId,
          },
          relationships: {
            answers: {
              data: [
                {
                  id: assessment.answers[0].id.toString(),
                  type: 'answers',
                }
              ],
              links: {
                related: '/api/answers?assessment=' + assessment.id.toString()
              }
            },
            course: {
              data: {
                id: assessment.courseId.toString(),
                type: 'courses'
              }
            },
            'certification-course': {
              links: {
                related: `/api/certification-courses/${certificationCourseId}`,
              }
            },
          },
        },
        included: [{
          id: assessment.course.id.toString(),
          type: 'courses',
          attributes: {
            description: assessment.course.description,
            name: assessment.course.name,
            'nb-challenges': assessment.course.nbChallenges,
          },
        }]
      };

      // when
      const json = serializer.serialize(assessment);

      // then
      expect(json).to.deep.equal(expectedJson);
    });

    it('should convert an Assessment model object with type COMPETENCE_EVALUATION into JSON API data', function() {
      //given
      const assessment = domainBuilder.buildAssessment({
        type: Assessment.types.COMPETENCE_EVALUATION,
      });

      assessment.title = 'Traiter des données';

      const expectedProgressionJson = {
        data: {
          id: `progression-${assessment.id}`,
          type: 'progressions',
        },
        links: {
          related: `/api/progressions/progression-${assessment.id}`,
        }
      };

      // when
      const json = serializer.serialize(assessment);

      // then
      expect(json.data.relationships['progression']).to.deep.equal(expectedProgressionJson);
      expect(json.data.attributes['certification-number']).to.be.null;
      expect(json.data.attributes['title']).to.equal('Traiter des données');
    });

    it('should convert an Assessment model object with type SMARTPLACEMENT into JSON API data', function() {
      //given
      const assessment = domainBuilder.buildAssessment({
        type: Assessment.types.SMARTPLACEMENT,
        campaignParticipation: { campaign: { code: 'Konami' } },
      });
      const expectedProgressionJson = {
        data: {
          id: `progression-${assessment.id}`,
          type: 'progressions',
        },
        links: {
          related: `/api/progressions/progression-${assessment.id}`,
        }
      };

      // when
      const json = serializer.serialize(assessment);

      // then
      expect(json.data.relationships['progression']).to.deep.equal(expectedProgressionJson);
      expect(json.data.attributes['certification-number']).to.be.null;
      expect(json.data.attributes['code-campaign']).to.equal('Konami');
    });

    it('should convert an Assessment model object without course into JSON API data', function() {
      //given
      const assessment = domainBuilder.buildAssessment({
        course: null
      });
      const expectedCourseJson = {
        data: {
          id: assessment.courseId.toString(),
          type: 'courses',
        },
      };

      // when
      const json = serializer.serialize(assessment);

      // then
      expect(json.data.relationships['course']).to.deep.equal(expectedCourseJson);
      expect(json.included).to.be.undefined;
    });

  });

  describe('#deserialize()', () => {

    const jsonAssessment = {
      data: {
        type: 'assessments',
        id: 'assessmentId',
        attributes: {
          type: Assessment.types.CERTIFICATION,
        },
        relationships: {
          course: {
            data: {
              type: 'courses',
              id: 'courseId',
            },
          },
        },
      },
    };

    it('should convert JSON API data into an Assessment object', () => {
      // when
      const assessment = serializer.deserialize(jsonAssessment);

      // then
      expect(assessment).to.be.instanceOf(Assessment);
      expect(assessment.id).to.equal(jsonAssessment.data.id);
      expect(assessment.type).to.equal(jsonAssessment.data.attributes.type);
      expect(assessment.courseId).to.equal(jsonAssessment.data.relationships.course.data.id);
    });

    it('should have a null courseId for type SMARTPLACEMENT', () => {
      //given
      jsonAssessment.data.attributes.type = Assessment.types.SMARTPLACEMENT;

      // when
      const assessment = serializer.deserialize(jsonAssessment);

      // then
      expect(assessment.courseId).to.be.null;
    });

    it('should have a null courseId for type PREVIEW', () => {
      //given
      jsonAssessment.data.attributes.type = Assessment.types.PREVIEW;

      // when
      const assessment = serializer.deserialize(jsonAssessment);

      // then
      expect(assessment.courseId).to.be.null;
    });

  });

});
