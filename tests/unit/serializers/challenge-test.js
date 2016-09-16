import { expect } from 'chai';
import { describeModule, it } from 'ember-mocha';
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

    it('#normalizeResponse', function () {

      describe('when challenge is complete', function () {

        it('serializes all the fields', function () {
          const payload = {
            "createdTime": "2016-08-24T16:05:16.000Z",
            "fields": {
              "Consigne": "Quel signe précède toujours une formule dans une cellule de feuille de calcul ?",
              "Propositions": "- #\r\n- =\r\n- !\r\n- :\r\n- $\r",
              "Type d'épreuve": "QCU",
              "Illustration de la consigne": [{
                "url": "https://dl.airtable.com/OvrobamORSOy3O44sSEu_Clipboard04.png"
              }],
              "Pièce jointe": [{
                "url": "https://dl.airtable.com/IqgzfJisSRC6rrR4KFBz_test.pdf",
                "filename": "test.pdf"
              }]
            },
            "id": "rec1LvIU9OZ2sXyuy"
          };
          const expected = {
            challenge: {
              id: payload.id,
              created: payload.createdTime,
              instruction: payload.fields.Consigne,
              proposals: payload.fields.Propositions,
              type: 'QCU',
              illustrationUrl: payload.fields['Illustration de la consigne'][0].url,
              attachmentUrl: payload.fields['Pièce jointe'][0].url,
              attachmentFilename: payload.fields['Pièce jointe'][0].filename
            }
          };
          const challenge = normalizePayload(payload);

          expect(challenge).to.deep.equal(expected);
        });

      });

      describe('when challenge has no illustration', function () {

        it('set illustration URL to undefined', function () {

          const payload = {
            "createdTime": "2016-08-24T16:05:16.000Z",
            "fields": {
              "Illustration de la consigne": null
            },
            "id": "rec1LvIU9OZ2sXyuy"
          };
          const challenge = normalizePayload(payload);

          expect(challenge.illustrationUrl).to.be.undefined;
        });
      });

      describe('when challenge has no illustration', function () {

        it('set attachemnt data to undefined', function () {

          const payload = {
            "createdTime": "2016-08-24T16:05:16.000Z",
            "fields": {
              "Pièce jointe": null
            },
            "id": "rec1LvIU9OZ2sXyuy"
          };
          const challenge = normalizePayload(payload);

          expect(challenge.attachmentUrl).to.be.undefined;
          expect(challenge.attachmentFilename).to.be.undefined;
        });
      });
    });
  }
);
