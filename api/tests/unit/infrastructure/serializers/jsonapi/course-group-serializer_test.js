const { describe, it, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/course-group-serializer');
const Serie = require('../../../../../lib/domain/models/referential/course-group');

describe('Unit | Serializer | JSONAPI | serie-serializer', function() {

  //given
  const serie = new Serie();
  serie.id = 'fakeId';
  serie.name = 'name of serie';
  serie.courses = [{ id: 'courseId1' }, { id: 'courseId2' }];

  const expectedJsonApiSerie = {
    data: {
      type: 'course-group',
      id: 'fakeId',
      attributes: {
        name: 'name of serie'
      },
      relationship: {
        courses: {
          data: [
            { type: 'course', id: 'courseId1' },
            { type: 'course', id: 'courseId2' }
          ]
        }
      }
    }
  };

  describe('#serialize', function() {

    it('should convert Serie model Object to JSON API', function() {
      // when
      const jsonApiSerie = serializer.serialize(serie);

      // then
      expect(jsonApiSerie).to.deep.equal(expectedJsonApiSerie);
    });
  });

});
