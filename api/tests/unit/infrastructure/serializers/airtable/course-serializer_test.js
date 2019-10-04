const { expect } = require('../../../../test-helper');
const AirtableRecord = require('airtable').Record;
const Course = require('../../../../../lib/domain/models/Course');
const serializer = require('../../../../../lib/infrastructure/serializers/airtable/course-serializer');

describe('Unit | Serializer | course-serializer', () => {

  describe('#deserialize', () => {

    let airtableRecord;

    beforeEach(() => {
      airtableRecord = new AirtableRecord('Tests', 'recNPB7dTNt5krlMA', {
        fields: {
          'Nom': 'Test de positionnement 1.1',
          'Description': 'A single line of text.',
          'Adaptatif ?': true,
          'Competence': ['recsvLz0W2ShyfD63'],
          'Image': ['https://dl.airtable.com/foo.jpg'],
          'Épreuves': ['reclvHn6Bg3FyfwuL', 'recPHXe5p4ip95Bc6']
        }
      });
    });

    it('should convert record into a Course', () => {
      // given
      const expectedCourse = new Course({
        id: 'recNPB7dTNt5krlMA',
        name: 'Test de positionnement 1.1',
        description: 'A single line of text.',
        type: 'PLACEMENT',
        competences: ['recsvLz0W2ShyfD63'],
        challenges: ['recPHXe5p4ip95Bc6', 'reclvHn6Bg3FyfwuL']
      });

      // when
      const course = serializer.deserialize(airtableRecord);

      // then
      expect(course).to.deep.equal(expectedCourse);

    });

    describe('#competences', () => {

      context('when no competences are defined', () => {
        it('should be an empty array', () => {
          // given
          delete airtableRecord.fields['Competence'];

          // when
          const course = serializer.deserialize(airtableRecord);

          // then
          expect(course.competences).to.deep.equal([]);
        });
      });
    });

    describe('#challenges', () => {

      context('when no challenges are defined', () => {
        it('should be an empty array', () => {
          // given
          delete airtableRecord.fields['Épreuves'];

          // when
          const course = serializer.deserialize(airtableRecord);

          // then
          expect(course.challenges).to.deep.equal([]);
        });
      });
    });

    describe('#type', () => {

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
