const { describe, it, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/profile-serializer');
const Profile = require('../../../../../lib/domain/models/data/profile');
const User = require('../../../../../lib/domain/models/data/user');
const Assessment = require('../../../../../lib/domain/models/data/assessment');

describe('Unit | Serializer | JSONAPI | profile-serializer', () => {

  describe('#serialize', function() {

    let user;
    let areas;
    let competences;
    let expectedJson;

    beforeEach(() => {
      user = new User({
        id: 'user_id',
        'firstName': 'Luke',
        'lastName': 'Skywalker',
        'email': 'luke@sky.fr'
      });

      areas = [
        {
          id: 'recAreaA',
          name: 'area-name-1'
        },
        {
          id: 'recAreaB',
          name: 'area-name-2'
        }
      ];

      competences = [
        {
          id: 'recCompA',
          name: 'competence-name-1',
          index: '1.1',
          areaId: 'recAreaA',
          courseId: 'recBxPAuEPlTgt72q11'
        },
        {
          id: 'recCompB',
          name: 'competence-name-2',
          index: '1.2',
          areaId: 'recAreaB',
          courseId: 'recBxPAuEPlTgt72q99'
        }];

      expectedJson = {
        data: {
          type: 'users',
          id: 'user_id',
          attributes: {
            'first-name': 'Luke',
            'last-name': 'Skywalker',
            'total-pix-score': 128,
            'email': 'luke@sky.fr'
          },
          relationships: {
            competences: {
              data: [
                { type: 'competences', id: 'recCompA' },
                { type: 'competences', id: 'recCompB' }
              ]
            }
          },

        },
        included: [
          {
            type: 'areas',
            id: 'recAreaA',
            attributes: {
              name: 'area-name-1'
            }
          },
          {
            type: 'areas',
            id: 'recAreaB',
            attributes: {
              name: 'area-name-2'
            }
          },
          {
            type: 'competences',
            id: 'recCompA',
            attributes: {
              name: 'competence-name-1',
              index: '1.1',
              level: -1,
              'course-id': 'recBxPAuEPlTgt72q11'
            },
            relationships: {
              area: {
                data: {
                  type: 'areas',
                  id: 'recAreaA'
                }
              }
            }
          },
          {
            type: 'competences',
            id: 'recCompB',
            attributes: {
              name: 'competence-name-2',
              index: '1.2',
              level: 8,
              'pix-score': 128,
              'course-id': 'recBxPAuEPlTgt72q99'
            },
            relationships: {
              area: {
                data: {
                  type: 'areas',
                  id: 'recAreaB'
                }
              }
            }
          }
        ]
      };
    });

    it('should serialize a Profile into JSON:API data of type "users"', function() {
      // Given
      const profile = new Profile(user, competences, areas,
        [new Assessment(
          {
            courseId: 'courseID1',
            estimatedLevel: 8,
            pixScore: 128
          })],
        [{ id: 'courseID1', competences: ['recCompB'] }]);

      // When
      const userSerialized = serializer.serialize(profile);

      // Then
      expect(userSerialized).to.be.deep.equal(expectedJson);
    });

    it('should not serialize "total-pix-score" user attribute when no assessment', function() {
      // Given
      const profile = new Profile(user, competences, areas, [], []);

      // When
      const userSerialized = serializer.serialize(profile);

      // Then
      expect(userSerialized.data.attributes).not.to.have.property('total-pix-score');
    });
  });

});
