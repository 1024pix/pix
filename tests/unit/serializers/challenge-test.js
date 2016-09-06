import {expect} from 'chai';
import {describeModule, it} from 'ember-mocha';
import OriginalChallenge from 'pix-live/models/challenge';
import ChallengeSerializer from 'pix-live/serializers/challenge';

describeModule(
  'serializer:challenge',
  'Unit | Serializer | challenge',
  {},
  function () {

    const serializer = new ChallengeSerializer();
    const Challenge = OriginalChallenge.extend({}); // copy the class to avoid side effects
    Challenge.modelName = 'challenge';

    function normalizePayload(payload) {
      serializer.normalizeResponse(null, Challenge, payload, payload.id, null);
      return payload;
    }

    it('it normalize correctly', function () {
      const payload = {
        "createdTime": "2016-08-24T16:05:16.000Z",
        "fields": {
          "Auteur": [
            "SPS"
          ],
          "Bonnes réponses": "2",
          "Consigne": "Quel signe précède toujours une formule dans une cellule de feuille de calcul ?",
          "Licence image": "no",
          "Preview": "http://staging.pix.beta.gouv.fr/challenges/rec1LvIU9OZ2sXyuy/preview",
          "Propositions": "- #\r\n- =\r\n- !\r\n- :\r\n- $\r",
          "Record ID": "rec1LvIU9OZ2sXyuy",
          "Reponses": [],
          "Type d'épreuve": "QCU",
          "Type péda": "q-situation",
          "_Niveau": [
            "3"
          ],
          "_Preview Temp": "https://docs.google.com/presentation/d/1aEn-VH5_ijVBRmsLDvtQmG83BZihE37PnCz5g2mEbWk/edit#slide=id.g15ad5fc552_0_4",
          "_Statut": "proposé",
          "acquis": [
            "#formuleSimple"
          ],
          "compétence": "1.3. Traiter des données",
          "description": "Signe précédant une formule",
          "domaine": "1.3. Traiter des données",
          "id": 98,
          "versions Alter": [
            "recgPPjKpxqAMaAeX"
          ]
        },
        "id": "rec1LvIU9OZ2sXyuy"
      };
      const expected = {
        challenge: {
          id: payload.id,
          created: payload.createdTime,
          instruction: payload.fields.Consigne,
          proposals: payload.fields.Propositions,
          type: 'QCU'
        }
      };
      const challenge = normalizePayload(payload);

      expect(challenge).to.be.deep.equal(expected);
    });
  }
);
