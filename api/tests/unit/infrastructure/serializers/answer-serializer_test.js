const serializer = require('../../../../lib/infrastructure/serializers/answer-serializer');
const Answer = require('../../../../lib/domain/models/data/answer');

describe('Unit | Serializer | AnswerSerializer', function () {

  const modelObject = new Answer({
    id: 'answer_id',
    value: 'answer_value',
    result: 'result_value',
    assessmentId: 'assessment_id',
    challengeId: 'challenge_id'
  });

  const jsonAnswer = {
    data: {
      type: 'answers',
      id: 'answer_id',
      attributes: {
        value: "answer_value",
        result: "result_value"
      },
      relationships: {
        assessment: {
          data: {
            type: 'assessments',
            id: 'assessment_id'
          }
        },
        challenge: {
          data: {
            type: 'challenges',
            id: 'challenge_id'
          }
        }
      }
    }
  };

  describe('#serialize()', function () {

    it('should convert an Answer model object into JSON API data', function () {
      // when
      const json = serializer.serialize(modelObject);

      // then
      expect(json).to.deep.equal(jsonAnswer);
    });

  });

  describe('#deserialize()', function () {

    it('should convert JSON API data into an Answer model object', function () {
      // when
      const answer = serializer.deserialize(jsonAnswer);

      // then
      expect(answer.id).to.equal(jsonAnswer.data.id);
      expect(answer.get('assessmentId')).to.equal(jsonAnswer.data.relationships.assessment.data.id);
      expect(answer.get('challengeId')).to.equal(jsonAnswer.data.relationships.challenge.data.id);
      expect(answer.get('value')).to.equal(jsonAnswer.data.attributes.value);
      expect(answer.get('result')).to.equal(jsonAnswer.data.attributes.result);
    });

  });

});
