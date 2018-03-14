const { expect } = require('../../../../test-helper');
const AssessmentResult = require('../../../../../lib/domain/models/AssessmentResult');
const CompetenceMark = require('../../../../../lib/domain/models/CompetenceMark');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/assessment-result-serializer');

describe('Unit | Serializer | JSONAPI | assessment-result-serializer', () => {
  let jsonAssessmentRating;

  beforeEach(() => {
    jsonAssessmentRating = {
      data: {
        attributes: {
          'estimated-level': 4,
          'pix-score': 24
        },
        relationships: {
          assessment: {
            data: {
              type: 'assessments',
              id: '22'
            }
          }
        },
        type: 'assessment-results'
      }
    };
  });

  describe('#serialize', () => {
    it('should serialize the assessment rating object to jsonapi object excluding email and password', () => {
      // given
      const modelObject = new AssessmentRating({
        id: '234567',
        estimatedLevel: 7,
        pixScore: 526
      });

      // when
      const json = serializer.serialize(modelObject);

      // then
      expect(json).to.be.deep.equal({
        data: {
          attributes: {
            'estimated-level': 7,
            'pix-score': 526,
          },
          id: '234567',
          type: 'assessment-results'
        }
      });
    });
  });

  describe('#deserialize', () => {

    it('should convert JSON API data into an Assessment Rating model object', () => {
      // when
      const assessmentRating = serializer.deserialize(jsonAssessmentRating);

      // then
      expect(assessmentRating).to.be.an.instanceOf(AssessmentResult);
    });

    it('should contain an ID attribute', () => {
      jsonAssessmentRating.data.id = '42';

      // when
      const assessmentRating = serializer.deserialize(jsonAssessmentRating);

      // then
      expect(assessmentRating.id).to.equal('42');
    });

    it('should not contain an ID attribute when not given', () => {
      // when
      const assessmentRating = serializer.deserialize(jsonAssessmentRating);

      // then
      expect(assessmentRating.id).to.be.undefined;
    });

    it('should attach the assessment id', () => {
      // when
      const assessmentRating = serializer.deserialize(jsonAssessmentRating);

      // then
      expect(assessmentRating.assessmentId).to.equal('22');
    });

  });

  describe('#deserializeResultsAdd', () => {

    const jsonReceived = {
      'assessment-id':2,
      'certification-id': 1,
      level: 3,
      'pix-score': 27,
      status: 'validated',
      emitter: 'Jury',
      comment: 'Envie de faire un nettoyage de printemps dans les notes',
      'competences-with-mark' : [
        {
          level: 2,
          score: 18,
          'area-code': 2,
          'competence-code': 2.1
        },{
          level: 3,
          score: 27,
          'area-code': 3,
          'competence-code': 3.2
        },{
          level: 1,
          score: 9,
          'area-code': 1,
          'competence-code': 1.3
        }
      ]
    };

    it('should return a Assessment Result and an Array of Competence Marks', () => {
      // given
      const expectedAssessmentResult = new AssessmentResult({
        assessmentId: 2,
        level: 3,
        pixScore: 27,
        status: 'validated',
        emitter: 'Jury',
        comment: 'Envie de faire un nettoyage de printemps dans les notes'
      });

      const competenceMark1 = new CompetenceMark({
        level: 2,
        score: 18,
        area_code: 2,
        competence_code: 2.1
      });
      const competenceMark2 = new CompetenceMark({
        level: 3,
        score: 27,
        area_code: 3,
        competence_code: 3.2
      });
      const competenceMark3 = new CompetenceMark({
        level: 1,
        score: 9,
        area_code: 1,
        competence_code: 1.3
      });

      // when
      const { assessmentResult, competenceMarks } = serializer.deserializeResultsAdd(jsonReceived);

      // then
      expect(assessmentResult).to.be.instanceOf(AssessmentResult);
      expect(assessmentResult).to.be.deep.equal(expectedAssessmentResult);

      expect(competenceMarks).to.be.instanceOf(Array);
      expect(competenceMarks[0]).to.be.deep.equal(competenceMark1);
      expect(competenceMarks[1]).to.be.deep.equal(competenceMark2);
      expect(competenceMarks[2]).to.be.deep.equal(competenceMark3);
    });
  });
});
