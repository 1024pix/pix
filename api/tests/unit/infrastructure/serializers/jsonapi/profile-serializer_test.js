const { describe, it, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/profile-serializer');
const Profile = require('../../../../../lib/domain/models/data/profile');
const User = require('../../../../../lib/domain/models/data/user');

describe('Unit | Serializer | JSONAPI | profile-serializer', () => {

  describe('#serialize', function() {

    it('should serialize a Profile into JSON:API data of type "users"', function() {
      // given
      const user = new User({
        id: 'user_id',
        'firstName': 'Luke',
        'lastName': 'Skywalker'
      });

      const areas = [
        {
          id: 'recAreaA',
          name: 'area-name-1'
        },
        {
          id: 'recAreaB',
          name: 'area-name-2'
        }
      ];

      const competences = [
        {
          id: 'recCompA',
          name: 'competence-name-1',
          areaId: 'recAreaA'
        },
        {
          id: 'recCompB',
          name: 'competence-name-2',
          areaId: 'recAreaB'
        }];

      const expectedJson = {
        data: [{
          type: 'user',
          id: 'user_id',
          attributes: {
            'first-name': 'Luke',
            'last-name': 'Skywalker'
          },
          relationships: {
            competences: {
              data: [
                { type: 'competences', id: 'recCompA' },
                { type: 'competences', id: 'recCompB' }
              ]
            }
          },

        }],
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
              level: -1
            },
            relationships: {
              area: {
                type: 'areas',
                id: 'recAreaA'
              }
            }
          },
          {
            type: 'competences',
            id: 'recCompB',
            attributes: {
              name: 'competence-name-2',
              level: -1
            },
            relationships: {
              area: {
                type: 'areas',
                id: 'recAreaB'
              }
            }
          }
        ]
      };

      const profile = new Profile(user, competences, areas);
      // when
      const userSerialized = serializer.serialize(profile);

      // then
      expect(userSerialized).to.be.deep.equal(expectedJson);
    });
  });

});
