const { describe, it, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/airtable/course-group-serializer');
const CourseGroup = require('../../../../../lib/domain/models/referential/course-group');

describe('Unit | Serializer | course-group-serializer', function() {

  describe('#deserialize', function() {

    it('should return a serie object', function() {
      // given
      const airtableRecord = { id: 'recFake', fields: {} };
      // when
      const courseGroupRecord = serializer.deserialize(airtableRecord);
      // then
      expect(courseGroupRecord).to.be.an.instanceOf(CourseGroup);
    });

    it('should convert id field of airtable to id in Serie object', function() {
      //given
      const airtableRecord = { id: 'recFake' };

      //when
      const courseGroupRecord = serializer.deserialize(airtableRecord);

      //then
      expect(courseGroupRecord.id).to.be.equal(airtableRecord.id);
    });

    it('should convert field "Nom" of airtable to "name" in CourseGroup object', function() {
      //given
      const airtableRecord = {
        fields: {
          Nom: 'fakeName'
        }
      };

      //when
      const courseGroupRecord = serializer.deserialize(airtableRecord);

      //then
      expect(courseGroupRecord.name).to.be.equal(airtableRecord.fields['Nom']);
    });

    it('should convert field "Tests" into an array of objects with course ids', function() {
      //given
      const serieAirtableRecord = {
        fields: {
          Tests: ['test1', 'test2']
        }
      };

      //when
      const courseGroupRecord = serializer.deserialize(serieAirtableRecord);

      //then
      expect(courseGroupRecord.courses).to.deep.equal([{ id: 'test1' }, { id: 'test2' }]);
    });

  });

});
