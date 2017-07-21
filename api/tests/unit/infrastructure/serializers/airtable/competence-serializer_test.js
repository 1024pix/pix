const { describe, it, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/airtable/competence-serializer');

describe('Unit | Serializer | competence-serializer', function() {
  describe('#Deserialize', () => {
    it('should be a function', function() {
      // then
      expect(serializer.deserialize).to.be.a('function');
    });

    describe('Success deserialization', () => {
      const airtableCompetencesRecord = {
        id: 'recsvLDFHShyfDXXXXX',
        fields: {
          'Référence': '1.1 Mener une recherche d\'information',
          'Titre': 'Mener une recherche d\'information',
          'Sous-domaine': '1.1',
          'Domaine': [
            'recvoGdo0z0z0pXWZ'
          ],
          'Epreuves': [
            'recsvLz0W2ShyfD00',
            'recsvLz0W2ShyfD01'
          ],
          'Tests': ['Test de positionnement 1.1'],
          'Tests Record ID': ['recAY0W7x9urA11OLZJJ']
        }
      };

      const airtableCompetencesRecordWithNoCourseIdAssociated = {
        id: 'recsvLDFHShyfDXXXXX',
        fields: {
          'Référence': '1.1 Mener une recherche d\'information',
          'Titre': 'Mener une recherche d\'information',
          'Sous-domaine': '1.1',
          'Domaine': [
            'recvoGdo0z0z0pXWZ'
          ],
          'Epreuves': [
            'recsvLz0W2ShyfD00',
            'recsvLz0W2ShyfD01'
          ]
        }
      };

      it('should get a new competence Model object', () => {
        // When
        const competences = serializer.deserialize(airtableCompetencesRecord);

        // Then
        expect(competences.id).to.be.equal(airtableCompetencesRecord.id);
        expect(competences.name).to.be.equal(airtableCompetencesRecord.fields['Titre']);
        expect(competences.index).to.be.equal(airtableCompetencesRecord.fields['Sous-domaine']);
        expect(competences.areaId).to.be.equal(airtableCompetencesRecord.fields['Domaine']);
        expect(competences.courseId).to.be.equal(airtableCompetencesRecord.fields['Tests Record ID'][0]);
        expect(competences.Epreuves).to.not.exist;
      });

      it('should get a new competence Model even if there is no course associated', () => {
        // When
        const competences = serializer.deserialize(airtableCompetencesRecordWithNoCourseIdAssociated);

        // Then
        expect(competences.id).to.be.equal(airtableCompetencesRecord.id);
        expect(competences.name).to.be.equal(airtableCompetencesRecord.fields['Titre']);
        expect(competences.index).to.be.equal(airtableCompetencesRecord.fields['Sous-domaine']);
        expect(competences.areaId).to.deep.equal(airtableCompetencesRecord.fields['Domaine']);
        expect(competences.courseId).to.be.equal('');
        expect(competences.Epreuves).to.not.exist;
      });
    });

  });
});
