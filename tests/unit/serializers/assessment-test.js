import { expect } from 'chai';
import { describeModule, it } from 'ember-mocha';
import OriginalAnswer from 'pix-live/models/answer';
import AnswerSerializer from 'pix-live/serializers/answer';

describeModule(
  'serializer:answer',
  'Unit | Serializer | answer',
  {},
  function () {

    const serializer = new AnswerSerializer();
    const Answer = OriginalAnswer.extend({}); // copy the class to avoid side effects
    Answer.modelName = 'answer';

    function normalizePayload(payload) {
      serializer.normalizeResponse(null, Answer, payload, payload.id, null);
      return payload;
    }

    it('normalizes correctly', function () {

      const payload = {
        "id": "recnGZFG9zeroKXLP",
        "fields": {
          "Epreuve": ["rechEFdIiOlMNMQEu"],
          "Evaluation": ["recT57K8NPRjQ3Jyh"],
          "Nom": "recnGZFG9zeroKXLP",
          "Valeur": "1"
        },
        "createdTime": "2016-09-01T12:45:08.000Z"
      };

      const expected = {
        answer: {
          id: payload.id,
          created: payload.createdTime,
          value: payload.fields['Valeur'],
          challenge: payload.fields['Epreuve'],
          assessment: payload.fields['Evaluation']
        }
      };
      const answer = normalizePayload(payload);

      expect(answer).to.be.deep.equal(expected);
    });
  }
);
