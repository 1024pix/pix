const { describe, it, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/snapshot-serializer');

describe('Unit | Serializer | JSONAPI | snapshot-serializer', () => {

  describe('#serialize', () => {

    it('should convert a snapshot into a JSON:API compliant object', () => {
      // given
      const snapshot = {
        id: 1,
        score: '10',
        createdAt: '2017-08-23 12:52:33',
        completionPercentage: '12',
        user: {
          id: 2,
          firstName: 'Barack',
          lastName: 'Afrite'
        }
      };
      const expectedSerializedSnapshot = {
        data: {
          type: 'snapshots',
          id: '1',
          attributes: {
            'completion-percentage': '12',
            'created-at': '2017-08-23 12:52:33',
            score: '10'
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
        included: [{
          attributes: {
            'first-name': 'Barack',
            'last-name': 'Afrite'
          },
          id: '2',
          type: 'users'
        }]
      };

      // when
      const result = serializer.serialize(snapshot);

      // then
      expect(result).to.deep.equal(expectedSerializedSnapshot);
    });

    it('should convert an array of snapshots into a JSON:API compliant array', () => {
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
        data: [{
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
        }, {
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
        }],
        included: [{
          type: 'users',
          id: '1',
          attributes: {
            'first-name': 'Barack',
            'last-name': 'Afrite'
          }
        }, {
          type: 'users',
          id: '2',
          attributes: {
            'first-name': 'Sandro',
            'last-name': 'Mancuso'
          }
        }]
      };

      // when
      const result = serializer.serialize(snapshotsArray);

      // then
      expect(result).to.deep.equal(expectedJson);
    });

    it('should set the score to null when it is not defined', () => {
      // given
      const snapshot = {
        id: 1,
        createdAt: '2017-08-23 12:52:33',
        completionPercentage: '12',
      };

      const expectedSerializedSnapshot = {
        data: {
          id: '1',
          type: 'snapshots',
          attributes: {
            'created-at': '2017-08-23 12:52:33',
            'completion-percentage': '12',
            'score': null
          }
        }
      };

      // when
      const result = serializer.serialize(snapshot);

      // then
      expect(result).to.eql(expectedSerializedSnapshot);
    });

    it('should set the completion percentage to null when it is not defined', () => {
      // given
      const snapshot = {
        id: 1,
        createdAt: '2017-08-23 12:52:33',
        score: '12',
        completionPercentage: null,
      };

      const expectedSerializedSnapshot = {
        data: {
          id: '1',
          type: 'snapshots',
          attributes: {
            'created-at': '2017-08-23 12:52:33',
            'completion-percentage': null,
            'score': '12'
          }
        }
      };

      // when
      const result = serializer.serialize(snapshot);

      // then
      expect(result).to.eql(expectedSerializedSnapshot);
    });

  });

});
