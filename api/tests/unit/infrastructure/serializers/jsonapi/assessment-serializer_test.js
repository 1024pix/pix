import { expect, domainBuilder } from '../../../../test-helper.js';
import * as serializer from '../../../../../lib/infrastructure/serializers/jsonapi/assessment-serializer.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';

describe('Unit | Serializer | JSONAPI | assessment-serializer', function () {
  describe('#serialize()', function () {
    it('should convert an Assessment model object (of type CERTIFICATION) into JSON API data', function () {
      //given
      const certificationCourseId = 1;
      const assessment = domainBuilder.buildAssessment({ certificationCourseId });
      const expectedJson = {
        data: {
          id: assessment.id.toString(),
          type: 'assessments',
          attributes: {
            'certification-number': certificationCourseId,
            'has-ongoing-live-alert': false,
            state: assessment.state,
            type: assessment.type,
            title: assessment.courseId.toString(),
            'competence-id': assessment.competenceId,
            'last-question-state': Assessment.statesOfLastQuestion.ASKED,
            method: Assessment.methods.CERTIFICATION_DETERMINED,
          },
          relationships: {
            answers: {
              data: [
                {
                  id: assessment.answers[0].id.toString(),
                  type: 'answers',
                },
              ],
              links: {
                related: '/api/answers?assessmentId=' + assessment.id.toString(),
              },
            },
            course: {
              data: {
                id: assessment.courseId.toString(),
                type: 'courses',
              },
            },
            'certification-course': {
              links: {
                related: `/api/certification-courses/${certificationCourseId}`,
              },
            },
          },
        },
        included: [
          {
            id: assessment.course.id.toString(),
            type: 'courses',
            attributes: {
              description: assessment.course.description,
              name: assessment.course.name,
              'nb-challenges': assessment.course.nbChallenges,
            },
          },
        ],
      };

      // when
      const json = serializer.serialize(assessment);

      // then
      expect(json).to.deep.equal(expectedJson);
    });

    it('should convert an Assessment model object with type COMPETENCE_EVALUATION into JSON API data', function () {
      //given
      const assessment = domainBuilder.buildAssessment({
        type: Assessment.types.COMPETENCE_EVALUATION,
        title: 'Traiter des données',
      });

      const expectedProgressionJson = {
        data: {
          id: `progression-${assessment.id}`,
          type: 'progressions',
        },
        links: {
          related: `/api/progressions/progression-${assessment.id}`,
        },
      };

      // when
      const json = serializer.serialize(assessment);

      // then
      expect(json.data.relationships['progression']).to.deep.equal(expectedProgressionJson);
      expect(json.data.attributes['certification-number']).to.be.null;
      expect(json.data.attributes['title']).to.equal('Traiter des données');
    });

    it('should convert an Assessment model object with type CAMPAIGN into JSON API data', function () {
      //given
      const assessment = domainBuilder.buildAssessment({
        type: Assessment.types.CAMPAIGN,
        campaignParticipation: { campaign: { code: 'Konami' } },
        title: 'Parcours',
        campaignCode: 'CAMPAGNE1',
      });
      const expectedProgressionJson = {
        data: {
          id: `progression-${assessment.id}`,
          type: 'progressions',
        },
        links: {
          related: `/api/progressions/progression-${assessment.id}`,
        },
      };

      // when
      const json = serializer.serialize(assessment);

      // then
      expect(json.data.relationships['progression']).to.deep.equal(expectedProgressionJson);
      expect(json.data.attributes['certification-number']).to.be.null;
      expect(json.data.attributes['code-campaign']).to.equal('CAMPAGNE1');
      expect(json.data.attributes['title']).to.equal('Parcours');
    });

    it('should convert an Assessment model object with type CAMPAIGN and method FLASH into JSON API data', function () {
      //given
      const assessment = domainBuilder.buildAssessment.ofTypeCampaign({
        method: Assessment.methods.FLASH,
      });
      const expectedProgressionJson = {
        data: {
          id: `progression-${assessment.id}`,
          type: 'progressions',
        },
        links: {
          related: `/api/progressions/progression-${assessment.id}`,
        },
      };

      // when
      const json = serializer.serialize(assessment);

      // then
      expect(json.data.relationships['progression']).to.deep.equal(expectedProgressionJson);
      expect(json.data.attributes['method']).to.equal(Assessment.methods.FLASH);
    });

    it('should convert an Assessment model object without course into JSON API data', function () {
      //given
      const assessment = domainBuilder.buildAssessment({
        course: null,
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

  describe('#deserialize()', function () {
    const jsonAssessment = {
      data: {
        type: 'assessments',
        id: 'assessmentId',
        attributes: {
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line mocha/no-setup-in-describe
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

    it('should convert JSON API data into an Assessment object', function () {
      // when
      const assessment = serializer.deserialize(jsonAssessment);

      // then
      expect(assessment).to.be.instanceOf(Assessment);
      expect(assessment.id).to.equal(jsonAssessment.data.id);
      expect(assessment.type).to.equal(jsonAssessment.data.attributes.type);
      expect(assessment.courseId).to.equal(jsonAssessment.data.relationships.course.data.id);
      expect(assessment.method).to.equal('CERTIFICATION_DETERMINED');
    });

    it('should have a null courseId for type CAMPAIGN', function () {
      //given
      jsonAssessment.data.attributes.type = Assessment.types.CAMPAIGN;

      // when
      const assessment = serializer.deserialize(jsonAssessment);

      // then
      expect(assessment.courseId).to.be.null;
    });

    it('should have a null courseId for type PREVIEW', function () {
      //given
      jsonAssessment.data.attributes.type = Assessment.types.PREVIEW;

      // when
      const assessment = serializer.deserialize(jsonAssessment);

      // then
      expect(assessment.courseId).to.be.null;
    });
  });
});
