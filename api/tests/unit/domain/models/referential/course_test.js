const Course = require('../../../../../lib/domain/models/referential/course');

describe('Unit | Model | Course', function () {

  describe('#initialize()', function () {

    it(`should convert record "id" into "id" property`, function () {
      // given
      const airtableRecord = { id: 'rec123', fields: {} };

      // when
      const course = new Course(airtableRecord);

      // then
      expect(course.id).to.equal(airtableRecord.id);
    });

    [
      { airtableField: 'Nom', modelProperty: 'name' },
      { airtableField: 'Description', modelProperty: 'description' },
      { airtableField: 'Durée', modelProperty: 'duration' },
      { airtableField: 'Épreuves', modelProperty: 'challenges' }

    ].forEach(({ airtableField, modelProperty }) => {

      it(`should convert record "${airtableField}" field into "${modelProperty}" property`, function () {
        // given
        fields = [];
        fields[airtableField] = `${modelProperty}_value`;
        const airtableRecord = { fields };

        // when
        const course = new Course(airtableRecord);

        // then
        expect(course[modelProperty]).to.equal(airtableRecord.fields[airtableField]);
      });

    });

    it(`should convert record "Image" into "imageUrl" property`, function () {
      // given
      const airtableRecord = {
        fields: {
          "Image": [{
            "url": "https://dl.airtable.com/qiFgajPJQoCJh7cN3251_keyboard-171845_1920.jpg",
          }]
        }
      };

      // when
      const course = new Course(airtableRecord);

      // then
      expect(course.imageUrl).to.equal(airtableRecord.fields['Image'][0].url);
    });

  });
});
