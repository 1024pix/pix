const { describe, it, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/snapshot-serializer');

describe('Unit | Serializer | JSONAPI | snapshot-serializer', () => {

  describe('#serialize', () => {

    it('should be a function', () => {
      // then
      expect(serializer.serialize).to.be.a('function');
    });

    it('should correctly serialize', () => {
      // given
      const expectedSerialization = {
        data: {
          type: 'snapshots',
          id: '7',
          attributes: {
            'id': '7'
          }
        }
      };

      const snapshot = { id: 7 };

      // when
      const result = serializer.serialize(snapshot);

      // then
      expect(result).to.be.eql(expectedSerialization);
    });
  });

  describe('#serializaArray', () => {

    it('should be a function', () => {
      // then
      expect(serializer.serializeArray).to.be.a('function');
    });

    it('should return a serialized a snapshot', () => {
      // given
      const snapshot = {
        id: '1',
        score: '10',
        createdAt: '2017-08-23 12:52:33',
        completionPercentage: '12',
        user: {
          id: '2',
          firstName: 'Barack',
          lastName: 'Afrite'
        }
      };

      const expectedJson = {
        data:
          {
            id: '1',
            type: 'snapshots',
            attributes: {
              score: '10',
              'created-at': '2017-08-23 12:52:33',
              'completion-percentage': '12',
            },
            relationships: {
              user: {
                data: {
                  id: '2',
                  type: 'users'
                }
              }
            }
          },
        included: [
          {
            type: 'users',
            id: '2',
            attributes: {
              'first-name': 'Barack',
              'last-name': 'Afrite'
            }
          }
        ]
      };

      // when
      const result = serializer.serializeArray(snapshot);

      // then
      expect(result).to.eql(expectedJson);
    });

    it('should return a serialized a snapshot score set to null when its not defined', () => {
      // given
      const snapshot = {
        id: '1',
        score: null,
        createdAt: '2017-08-23 12:52:33',
        completionPercentage: '12',
        user: {
          id: '2',
          firstName: 'Barack',
          lastName: 'Afrite'
        }
      };

      const expectedJson = {
        data:
          {
            id: '1',
            type: 'snapshots',
            attributes: {
              'created-at': '2017-08-23 12:52:33',
              'completion-percentage': '12',
              'score': null
            },
            relationships: {
              user: {
                data: {
                  id: '2',
                  type: 'users'
                }
              }
            }
          },
        included: [
          {
            type: 'users',
            id: '2',
            attributes: {
              'first-name': 'Barack',
              'last-name': 'Afrite'
            }
          }
        ]
      };

      // when
      const result = serializer.serializeArray(snapshot);

      // then
      expect(result).to.eql(expectedJson);
    });

    it('should serialize array of snapshots', () => {
      // given
      const snapshot1 = {
        id: 1,
        score: 10,
        createdAt: '2017-08-23 12:52:33',
        completionPercentage: 12,
        user: { id: 1, firstName: 'Barack', lastName: 'Afrite' }
      };
      const snapshot2 = {
        id: 2,
        score: 12,
        createdAt: '2017-07-29 12:52:44',
        completionPercentage: 25,
        user: { id: 2, firstName: 'Sandro', lastName: 'Mancuso' }
      };
      const snapshotsArray = [snapshot1, snapshot2];
      const expectedJson = {
        data: [
          {
            id: '1',
            type: 'snapshots',
            attributes: {
              score: '10',
              'created-at': '2017-08-23 12:52:33',
              'completion-percentage': '12'
            },
            relationships: {
              user: {
                data: {
                  id: '1',
                  type: 'users'
                }
              }
            }
          },
          {
            id: '2',
            type: 'snapshots',
            attributes: {
              score: '12',
              'completion-percentage': '25',
              'created-at': '2017-07-29 12:52:44'
            },
            relationships: {
              user: {
                data: {
                  id: '2',
                  type: 'users'
                }
              }
            }
          }
        ],
        included: [
          {
            type: 'users',
            id: '1',
            attributes: {
              'first-name': 'Barack',
              'last-name': 'Afrite'
            }
          },
          {
            type: 'users',
            id: '2',
            attributes: {
              'first-name': 'Sandro',
              'last-name': 'Mancuso'
            }
          }
        ]
      };

      // when
      const result = serializer.serializeArray(snapshotsArray);

      // then
      expect(result).to.eql(expectedJson);
    });
  });
});
