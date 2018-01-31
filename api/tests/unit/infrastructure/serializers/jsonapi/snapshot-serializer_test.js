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
        testsFinished: '12',
        studentCode: 'ABCD-1234',
        campaignCode: 'EFGH-5678',
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
            'tests-finished': '12',
            'created-at': '2017-08-23 12:52:33',
            'score': '10',
            'student-code': 'ABCD-1234',
            'campaign-code': 'EFGH-5678',
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
        testsFinished: 12,
        user: { id: 1, firstName: 'Barack', lastName: 'Afrite' }
      };
      const snapshot2 = {
        id: 2,
        score: 12,
        createdAt: '2017-07-29 12:52:44',
        testsFinished: 25,
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
            'tests-finished': '12'
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
            'tests-finished': '25',
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
        testsFinished: '12',
        studentCode: 'student_code',
        campaignCode: 'campaign_code',
      };

      const expectedSerializedSnapshot = {
        data: {
          id: '1',
          type: 'snapshots',
          attributes: {
            'created-at': '2017-08-23 12:52:33',
            'tests-finished': '12',
            'score': null,
            'student-code': 'student_code',
            'campaign-code': 'campaign_code',
          }
        }
      };

      // when
      const result = serializer.serialize(snapshot);

      // then
      expect(result).to.deep.equal(expectedSerializedSnapshot);
    });

    it('should set the completion percentage to null when it is not defined', () => {
      // given
      const snapshot = {
        id: 1,
        createdAt: '2017-08-23 12:52:33',
        score: '12',
        testsFinished: null,
        studentCode: 'student_code',
        campaignCode: 'campaign_code',
      };

      const expectedSerializedSnapshot = {
        data: {
          id: '1',
          type: 'snapshots',
          attributes: {
            'created-at': '2017-08-23 12:52:33',
            'tests-finished': null,
            'score': '12',
            'student-code': 'student_code',
            'campaign-code': 'campaign_code',
          }
        }
      };

      // when
      const result = serializer.serialize(snapshot);

      // then
      expect(result).to.deep.equal(expectedSerializedSnapshot);
    });

    it('should set the student code to null when it is not defined', () => {
      // given
      const snapshot = {
        id: 1,
        createdAt: '2017-10-05 22:452:58',
        score: '12',
        studentCode: null,
        campaignCode: 'campaign_code',
      };

      const expectedSerializedSnapshot = {
        data: {
          id: '1',
          type: 'snapshots',
          attributes: {
            'created-at': '2017-10-05 22:452:58',
            'tests-finished': null,
            'score': '12',
            'student-code': null,
            'campaign-code': 'campaign_code',
          }
        }
      };

      // when
      const result = serializer.serialize(snapshot);

      // then
      expect(result).to.deep.equal(expectedSerializedSnapshot);
    });

    it('should set the campaign code to null when it is not defined', () => {
      // given
      const snapshot = {
        id: 1,
        createdAt: '2017-10-05 22:452:58',
        score: '12',
        studentCode: 'student_code',
        campaignCode: null,
      };

      const expectedSerializedSnapshot = {
        data: {
          id: '1',
          type: 'snapshots',
          attributes: {
            'created-at': '2017-10-05 22:452:58',
            'tests-finished': null,
            'score': '12',
            'student-code': 'student_code',
            'campaign-code': null,
          }
        }
      };

      // when
      const result = serializer.serialize(snapshot);

      // then
      expect(result).to.deep.equal(expectedSerializedSnapshot);
    });

  });

  describe('#deserialize', () => {

    it('should convert a JSON:API object into an object literal', () => {
      // given
      const jsonApiObject = {
        data: {
          type: 'snapshots',
          id: '1',
          attributes: {
            'tests-finished': '20',
            'created-at': '2017-10-06 09:33:00',
            'score': '10',
            'student-code': 'ABCD-1234',
            'campaign-code': 'EFGH-5678',
          },
          relationships: {
            organization: { data: { id: '3', type: 'organizations' } }
          }
        }
      };

      const expectedObjectLiteral = {
        id: '1',
        score: '10',
        createdAt: '2017-10-06 09:33:00',
        testsFinished: '20',
        studentCode: 'ABCD-1234',
        campaignCode: 'EFGH-5678',
        organization: {
          id: '3'
        }
      };

      // when
      const promise = serializer.deserialize(jsonApiObject);

      // then
      return promise.then((result) => {
        expect(result).to.deep.equal(expectedObjectLiteral);
      });
    });
  });

});
