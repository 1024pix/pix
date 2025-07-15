import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { ChallengeToPlay } from '../../../../../../src/shared/domain/models/ChallengeToPlay.js';
import { Assessment, CampaignTypes } from '../../../../../../src/shared/domain/models/index.js';
import { CampaignAssessment } from '../../../../../../src/shared/domain/read-models/CampaignAssessment.js';
import { CertificationAssessment } from '../../../../../../src/shared/domain/read-models/CertificationAssessment.js';
import { CompetenceEvaluationAssessment } from '../../../../../../src/shared/domain/read-models/CompetenceEvaluationAssessment.js';
import * as serializer from '../../../../../../src/shared/infrastructure/serializers/jsonapi/assessment-serializer.js';
import { catchErrSync, domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | assessment-serializer', function () {
  describe('#serialize', function () {
    it('should convert a CertificationAssessment into JSON API data', function () {
      //given
      const certificationCourseId = 1;
      const answers = [
        domainBuilder.buildAnswer({ id: 123, challengeId: 'challenge0' }),
        domainBuilder.buildAnswer({ id: 456, challengeId: 'challenge1' }),
        domainBuilder.buildAnswer({ id: 789, challengeId: 'challenge2' }),
      ];
      const assessment = domainBuilder.buildAssessment({
        type: Assessment.types.CERTIFICATION,
        certificationCourseId,
        answers,
      });
      const challenge = new ChallengeToPlay({
        id: 'challenge0',
        type: 'QCM',
        instruction: 'Coucou ca va ?',
        competenceId: 'recCompetenceId0',
        proposals: '-prop1, -prop2',
        timer: 180,
        illustrationUrl: 'http://someUrl.com',
        attachments: ['att1'],
        embedUrl: 'http://www.someembed.url',
        embedTitle: 'Title of my embed',
        embedHeight: 700,
        webComponentTagName: 'some webComponentTagName',
        webComponentProps: 'some webComponentProps',
        illustrationAlt: "ceci n'est pas une pipe",
        format: 'mots',
        autoReply: true,
        alternativeInstruction: 'autre instruction',
        focused: true,
        shuffled: true,
        locales: ['fr'],
      });

      const certificationAssessment = new CertificationAssessment(assessment);
      certificationAssessment.nextChallenge = challenge;

      const expectedJson = {
        data: {
          id: assessment.id.toString(),
          type: 'assessments',
          attributes: {
            'certification-number': certificationCourseId,
            'has-ongoing-challenge-live-alert': false,
            'has-ongoing-companion-live-alert': false,
            state: assessment.state,
            type: assessment.type,
            title: certificationCourseId,
            'competence-id': assessment.competenceId,
            'last-question-state': Assessment.statesOfLastQuestion.ASKED,
            method: Assessment.methods.CERTIFICATION_DETERMINED,
            'show-progress-bar': false,
            'show-levelup': false,
            'has-checkpoints': false,
            'show-question-counter': true,
            'ordered-challenge-ids-answered': ['challenge0', 'challenge1', 'challenge2'],
          },
          relationships: {
            answers: {
              data: [
                {
                  id: '123',
                  type: 'answers',
                },
                {
                  id: '456',
                  type: 'answers',
                },
                {
                  id: '789',
                  type: 'answers',
                },
              ],
              links: {
                related: '/api/answers?assessmentId=' + assessment.id.toString(),
              },
            },
            'certification-course': {
              links: {
                related: `/api/certification-courses/${certificationCourseId}`,
              },
            },
            'next-challenge': {
              data: {
                id: 'challenge0',
                type: 'challenges',
              },
            },
          },
        },
        included: [
          {
            id: 'challenge0',
            type: 'challenges',
            attributes: {
              type: 'QCM',
              instruction: 'Coucou ca va ?',
              proposals: '-prop1, -prop2',
              timer: 180,
              'illustration-url': 'http://someUrl.com',
              attachments: ['att1'],
              'embed-url': 'http://www.someembed.url',
              'embed-title': 'Title of my embed',
              'embed-height': 700,
              'web-component-tag-name': 'some webComponentTagName',
              'web-component-props': 'some webComponentProps',
              'illustration-alt': "ceci n'est pas une pipe",
              format: 'mots',
              'auto-reply': true,
              'alternative-instruction': 'autre instruction',
              focused: true,
              shuffled: true,
              locales: ['fr'],
            },
          },
        ],
      };

      // when
      const json = serializer.serialize(certificationAssessment);

      // then
      expect(json).to.deep.equal(expectedJson);
    });

    it('should convert a CompetenceEvaluationAssessment into JSON API data', function () {
      //given
      const assessment = domainBuilder.buildAssessment({
        type: Assessment.types.COMPETENCE_EVALUATION,
        title: 'Traiter des données',
      });
      const competenceEvaluationAssessment = new CompetenceEvaluationAssessment(assessment);

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
      const json = serializer.serialize(competenceEvaluationAssessment);

      // then
      expect(json.data.relationships['progression']).to.deep.equal(expectedProgressionJson);
      expect(json.data.attributes['title']).to.equal('Traiter des données');
    });

    it('should convert a CampaignAssessment into JSON API data', function () {
      //given
      const assessment = domainBuilder.buildAssessment.ofTypeCampaign({
        title: 'Parcours',
        campaign: domainBuilder.buildCampaign({ title: 'Parcours', code: 'CAMPAGNE1' }),
      });
      const campaignAssessment = new CampaignAssessment(assessment);

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
      const json = serializer.serialize(campaignAssessment);

      // then
      expect(json.data.relationships['progression']).to.deep.equal(expectedProgressionJson);
      expect(json.data.attributes['code-campaign']).to.equal('CAMPAGNE1');
      expect(json.data.attributes['title']).to.equal('Parcours');
    });

    it('should convert an exam CampaignAssessment into JSON API data', function () {
      //given
      const assessment = domainBuilder.buildAssessment.ofTypeCampaign({
        title: 'Parcours',
        campaign: domainBuilder.buildCampaign({ title: 'Parcours', code: 'CAMPAGNE1', type: CampaignTypes.EXAM }),
      });
      const campaignAssessment = new CampaignAssessment(assessment);

      const expectedProgressionJson = { data: null };

      // when
      const json = serializer.serialize(campaignAssessment);

      // then
      expect(json.data.relationships['progression']).to.deep.equal(expectedProgressionJson);
      expect(json.data.attributes['has-checkpoints']).to.be.false;
      expect(json.data.attributes['code-campaign']).to.equal('CAMPAGNE1');
      expect(json.data.attributes['title']).to.equal('Parcours');
    });
  });

  describe('#deserialize', function () {
    let jsonAssessment;

    beforeEach(function () {
      jsonAssessment = {
        data: {
          type: 'assessments',
          id: 'assessmentId',
          attributes: {},
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
    });

    context('when assessment is PREVIEW', function () {
      it('should deserialize an assessment of type PREVIEW', function () {
        //given
        jsonAssessment.data.attributes.type = Assessment.types.PREVIEW;

        // when
        const assessment = serializer.deserialize(jsonAssessment);

        // then
        expect(assessment).to.be.instanceOf(Assessment);
        expect(assessment.courseId).to.be.null;
        expect(assessment.id).to.equal(jsonAssessment.data.id);
        expect(assessment.type).to.equal(jsonAssessment.data.attributes.type);
        expect(assessment.method).to.equal(Assessment.methods.CHOSEN);
      });
    });

    context('when assessment is DEMO', function () {
      it('should deserialize an assessment of type DEMO', function () {
        //given
        jsonAssessment.data.attributes.type = Assessment.types.DEMO;

        // when
        const assessment = serializer.deserialize(jsonAssessment);

        // then
        expect(assessment).to.be.instanceOf(Assessment);
        expect(assessment.courseId).to.equal('courseId');
        expect(assessment.id).to.equal(jsonAssessment.data.id);
        expect(assessment.type).to.equal(jsonAssessment.data.attributes.type);
        expect(assessment.method).to.equal(Assessment.methods.COURSE_DETERMINED);
      });
    });

    [
      Assessment.types.EXAM,

      Assessment.types.PIX1D_MISSION,

      Assessment.types.PIX1D_MISSION,

      Assessment.types.CERTIFICATION,

      Assessment.types.CAMPAIGN,

      Assessment.types.COMPETENCE_EVALUATION,
    ].forEach((campaignType) => {
      it(`should throw a DomainError when deserializing an assessment of type ${campaignType}`, function () {
        // given
        jsonAssessment.data.attributes.type = campaignType;

        // when
        const error = catchErrSync(serializer.deserialize)(jsonAssessment);

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('Only allowed to create DEMO or PREVIEW type of assessment');
      });
    });
  });
});
