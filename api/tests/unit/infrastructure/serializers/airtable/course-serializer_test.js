const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/airtable/course-serializer');

describe('Unit | Serializer | course-serializer', function() {

  describe('#deserialize', function() {

    let airtableRecord;

    beforeEach(() => {
      airtableRecord = {
        'id': 'recNPB7dTNt5krlMA',
        'fields': {
          'Nom': 'Test de positionnement 1.1',
          'Épreuves': [
            'reclvHn6Bg3FyfwuL',
            'recPHXe5p4ip95Bc6'
          ],
          'Adaptatif ?': true,
          'Statut': 'Publié',
          'Competence': [
            'recsvLz0W2ShyfD63'
          ],
          'Preview': 'https://pix.beta.gouv.fr/courses/recNPB7dTNt5krlMA',
          'Nb d\'épreuves': 137,
          'Acquis': '@url1,@rechinfo3,@rechinfo1,@rechinfo3,@rechinfo5,@rechinfo4,@rechinfo1,@utiliserserv3,@utiliserserv5,@requete4,@rechinfo4,@rechinfo4,@rechinfo2,@rechinfo3,@rechinfo2,@rechinfo1,@web4,@url6,@publi4,@modèleEco1,@rechinfo1,@utiliserserv1,@publi1,@rechinfo4,@rechinfo2,@rechinfo1,@url5,@eval3,@rechinfo3,@publi2,@Moteur1,@rechinfo3,@url4,@utiliserserv4,@requete3,@eval4,@citation5,@publi3,@citation5,@modèleEco3,@eval2,@url2,@Moteur4,@Moteur2,@rechinfo2,@rechinfo1,@rechinfo4,@eval1,@informé3,@utiliserserv6,@rechinfo5,@rechinfo4,@rechinfo3,@publi5,@modèleEco2,@citation4,@utiliserserv2,@rechinfo5,@rechinfo5,@rechinfo5,@rechinfo5,@rechinfo2,@rechinfo2,@utiliserserv1,@utiliserserv1,@utiliserserv1,@utiliserserv1,@utiliserserv1,@utiliserserv2,@utiliserserv2,@utiliserserv2,@utiliserserv2,@utiliserserv2,@utiliserserv3,@utiliserserv3,@utiliserserv3,@utiliserserv3,@utiliserserv3,@utiliserserv4,@utiliserserv4,@utiliserserv4,@utiliserserv4,@utiliserserv4,@utiliserserv5,@utiliserserv5,@utiliserserv5,@utiliserserv5,@requete3,@requete3,@requete3,@requete3,@requete4,@requete4,@requete4,@requete4,@requete4,@url1,@url1,@url1,@url1,@url1,@url2,@url2,@url2,@url2,@url2,@url4,@url4,@url4,@url4,@url4,@url5,@url5,@url5,@url5,@url5,@url6,@url6,@url6,@url6,@url6,@web5,@web5,@web5,@web5,@web5,@modèleEco1,@modèleEco1,@modèleEco1,@modèleEco1,@modèleEco1,@modèleEco2,@modèleEco2,@modèleEco2,@modèleEco2,@modèleEco2,@modèleEco3',
          'Record ID': 'recNPB7dTNt5krlMA'
        },
        'createdTime': '2017-03-01T14:05:06.000Z'
      };
    });

    it('should convert record "id" into "id" property', function() {
      // given
      const airtableRecord = { id: 'rec123', fields: {} };

      // when
      const course = serializer.deserialize(airtableRecord);

      // then
      expect(course.id).to.equal(airtableRecord.id);
    });

    it('should convert record into a Course', () => {
      // when
      const course = serializer.deserialize(airtableRecord);

      // then
      expect(course).to.deep.equal({
        'challenges': [
          'recPHXe5p4ip95Bc6',
          'reclvHn6Bg3FyfwuL'
        ],
        'description': undefined,
        'duration': undefined,
        'id': 'recNPB7dTNt5krlMA',
        'isAdaptive': true,
        'type': 'PLACEMENT',
        'name': 'Test de positionnement 1.1',
        'competences': ['recsvLz0W2ShyfD63']
      });

    });

    it('should add an empty array if no competences defined', () => {
      // given
      delete airtableRecord.fields.Competence;

      // when
      const course = serializer.deserialize(airtableRecord);

      // then
      expect(course).to.deep.equal({
        'challenges': [
          'recPHXe5p4ip95Bc6',
          'reclvHn6Bg3FyfwuL'
        ],
        'description': undefined,
        'duration': undefined,
        'id': 'recNPB7dTNt5krlMA',
        'isAdaptive': true,
        'type': 'PLACEMENT',
        'name': 'Test de positionnement 1.1',
        'competences': []
      });

    });

    describe('field type', () => {
      context('when the course is adaptive', () => {
        it('should equal "PLACEMENT"', () => {
          // given
          airtableRecord.fields['Adaptatif ?'] = true;

          // when
          const course = serializer.deserialize(airtableRecord);

          // then
          expect(course.type).to.equal('PLACEMENT');
        });

      });

      context('when the course is not adaptive', () => {
        it('should equal "DEMO"', () => {
          // given
          airtableRecord.fields['Adaptatif ?'] = false;

          // when
          const course = serializer.deserialize(airtableRecord);

          // then
          expect(course.type).to.equal('DEMO');
        });

      });
    });

  });
});
