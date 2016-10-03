import { expect } from 'chai';
import { describeModel, it } from 'ember-mocha';
import OriginalAssessment from 'pix-live/models/assessment';
import AssessmentSerializer from 'pix-live/serializers/assessment';

describeModel(
  'assessment',
  'Unit | Serializer | Assessment',
  {
    needs: ['model:answer']
  },
  function () {

    const serializer = new AssessmentSerializer();
    const Assessment = OriginalAssessment.extend({}); // copy the class to avoid side effects
    Assessment.modelName = 'assessment';

    function normalizePayload(payload) {
      serializer.normalizeResponse(null, Assessment, payload, payload.id, null);
      return payload;
    }

    it('normalizes correctly', function () {

      const payload = {
        "id": "recgS0TFyy0bXTjIL",
        "fields": {
          "Test": [
            "rec5duNNrPqbSzQ8o"
          ],
          "Reponses": ["rec1234567ABCDEFG", "rec8910111HIJKLMN"],
          "Référence": "recgS0TFyy0bXTjIL",
          "Nom de l'usager": "Jérémy le Grand",
          "Courriel de l'usager": "jbu@octo.com"
        },
        "createdTime": "2016-08-31T23:22:04.000Z"
      };

      const expected = {
        assessment: {
          id: payload.id,
          created: payload.createdTime,
          course: payload.fields['Test'],
          answers: payload.fields['Reponses'],
          userName: payload.fields["Nom de l'usager"],
          userEmail: payload.fields["Courriel de l'usager"]
        }
      };
      const assessment = normalizePayload(payload);

      expect(assessment).to.be.deep.equal(expected);
    });
  }
);
