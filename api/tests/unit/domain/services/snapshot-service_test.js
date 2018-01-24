const { describe, it, expect, beforeEach, afterEach, sinon } = require('../../../test-helper');
const snapshotService = require('../../../../lib/domain/services/snapshot-service');
const Snapshot = require('../../../../lib/domain/models/data/snapshot');
const snapshotRepository = require('../../../../lib/infrastructure/repositories/snapshot-repository');

describe('Unit | Service | Snapshot service', function() {

  const snapshot = {
    organizationId: 3,
    testsFinished: 10,
    studentCode: 'student_code',
    campaignCode: 'campaign_code',
    organization: { id: 3 }
  };

  const user = { id: 2 };

  const serializedProfile = {
    data: {
      type: 'users',
      id: 'profile_id',
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

  describe('#create', () => {

    beforeEach(() => {
      sinon.stub(snapshotRepository, 'save');
    });

    afterEach(() => {
      snapshotRepository.save.restore();
    });

    it('should correctly call snapshot repository', () => {
      // given
      const snapshotModel = new Snapshot({ id: 3 });
      snapshotRepository.save.resolves(snapshotModel);

      const snapshotRaw = {
        userId: 2,
        organizationId: 3,
        testsFinished: 10,
        studentCode: 'student_code',
        campaignCode: 'campaign_code',
        score: 128,
        profile: JSON.stringify(serializedProfile)
      };

      // when
      const promise = snapshotService.create(snapshot, user, serializedProfile);

      return promise.then(() => {
        // then
        sinon.assert.calledOnce(snapshotRepository.save);
        sinon.assert.calledWith(snapshotRepository.save, snapshotRaw);
      });

    });

    it('should return a snapshot id, when successfull snapshot saving', () => {
      // given
      const createdSnapshot = {
        get(property) {
          return (property === 'id') ? 3 : null;
        }
      };
      snapshotRepository.save.resolves(createdSnapshot);

      // when
      const promise = snapshotService.create(snapshot, user, serializedProfile);

      // then
      return promise.then((snapshotId) => {
        expect(snapshotId).to.equal(3);
      });

    });

    it('should reject an error has occurred', () => {
      // given
      const error = new Error('Some database error');
      snapshotRepository.save.rejects(error);

      // when
      const promise = snapshotService.create(snapshot, user, serializedProfile);

      // then
      return promise.catch((err) => {
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.equal('Some database error');
      });
    });

  });
});
