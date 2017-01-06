/* global describe, it, expect */
const Challenge = require('../../../../../lib/domain/models/referential/challenge');

describe('Unit | Model | Challenge', function () {

  describe('#initialize()', function () {

    it(`should convert record 'id' into 'id' property`, function () {
      // given
      const airtableRecord = { id: 'rec123', fields: {} };

      // when
      const challenge = new Challenge(airtableRecord);

      // then
      expect(challenge.id).to.equal(airtableRecord.id);
    });

    [
    { airtableField: 'Consigne', modelProperty: 'instruction' },
    { airtableField: 'Propositions', modelProperty: 'proposals' },
    { airtableField: 'Type d\'épreuve', modelProperty: 'type' }

    ].forEach(({ airtableField, modelProperty }) => {

      it(`should convert record '${airtableField}' field into '${modelProperty}' property`, function () {
        // given
        const fields = [];
        fields[airtableField] = `${modelProperty}_value`;
        const airtableRecord = { fields };

        // when
        const challenge = new Challenge(airtableRecord);

        // then
        expect(challenge[modelProperty]).to.equal(airtableRecord.fields[airtableField]);
      });

    });

    it(`should convert record 'Illustration de la consigne' into 'illustrationUrl' property`, function () {
      // given
      const airtableRecord = {
        fields: {
          'Illustration de la consigne': [{
            'url': 'https://dl.airtable.com/ZJgAgXfaQ7KgM7atPPI1_Symboles%20CC.png',
          }]
        }
      };

      // when
      const challenge = new Challenge(airtableRecord);

      // then
      expect(challenge.illustrationUrl).to.equal(airtableRecord.fields['Illustration de la consigne'][0].url);
    });

    it(`should convert record 'Pièce jointe' into 'attachmentUrl' and 'attachmentFilename' properties`, function () {
      // given
      const airtableRecord = {
        fields: {
          'Pièce jointe': [{
            'url': 'https://dl.airtable.com/MurPbtCWS9cjyjGmYAMw_PIX_couleur_remplissage.pptx',
            'filename': 'PIX_couleur_remplissage.pptx',
          }]
        }
      };

      // when
      const challenge = new Challenge(airtableRecord);

      // then
      expect(challenge.attachmentUrl).to.equal(airtableRecord.fields['Pièce jointe'][0].url);
      expect(challenge.attachmentFilename).to.equal(airtableRecord.fields['Pièce jointe'][0].filename);
    });
    // XXX : Pay attention to boolean negation : hasntInternetAllowed, instead of hasInternetAllowed,
    // it is because the nominal case is : user is allowed to use internet.
    // we need a boolean to detect the corner case where internet is NOT allowed. Currently Internet and tools are allowed
    describe('should convert field "Internet et outils" into \'hasntInternetAllowed\' boolean property',function(){

      it('should return true if  field "Internet et outils" equal to "Non"', function () {
        // given
        const airtableRecord = {
          fields: {
            'Internet et outils': 'Non'
          }
        };

        // when
        const challenge = new Challenge(airtableRecord);

        // then
        expect(challenge.hasntInternetAllowed).to.equal(true);
      });
      it('should return false if  field "Internet et outils" equal to "Oui"', function () {
        // given
        const airtableRecord = {
          fields: {
            'Internet et outils': 'Oui'
          }
        };

        // when
        const challenge = new Challenge(airtableRecord);

        // then
        expect(challenge.hasntInternetAllowed).to.equal(false);
      });
      it('should not be defined if field "Internet et outils" is not defined', function () {
        // given
        const airtableRecord = {
          fields: {
          }
        };

        // when
        const challenge = new Challenge(airtableRecord);

        // then
        expect(challenge.hasntInternetAllowed).to.equal(undefined);
      });

    });


  });
});
