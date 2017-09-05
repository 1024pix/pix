const { describe, it, expect, beforeEach, afterEach, sinon } = require('../../../test-helper');
const SnapshotService = require('../../../../lib/domain/services/snapshot-service');
const Snapshot = require('../../../../lib/domain/models/data/snapshot');
const SnapshotRepository = require('../../../../lib/infrastructure/repositories/snapshot-repository');

const serializedUserProfile = {
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

describe('Unit | Service | Snapshot service', function() {

  const snapshot = {
    organizationId: 3,
    completionPercentage: 10,
    userId: 2,
    profile: serializedUserProfile
  };

  describe('#create', () => {

    it('should exist', () => {
      // then
      expect(SnapshotService.create).to.exist;
    });

    beforeEach(() => {
      sinon.stub(SnapshotRepository, 'save');
    });

    afterEach(() => {
      SnapshotRepository.save.restore();
    });

    it('should correctly call snapshot repository', () => {
      // given
      const snapshotModel = new Snapshot({ id: 3 });
      SnapshotRepository.save.resolves(snapshotModel);

      const snapshotRaw = {
        organizationId: 3,
        completionPercentage: 10,
        userId: serializedUserProfile.data.id,
        score: 128,
        profile: JSON.stringify(serializedUserProfile)
      };

      // when
      const promise = SnapshotService.create(snapshot);

      return promise.then(() => {
        // then
        sinon.assert.calledWith(SnapshotRepository.save, snapshotRaw);
      });

    });

    it('should return a snapshot id, when successfull snapshot saving', () => {
      // given
      const createdSnapshot = {
        get() {
          return 3;
        }
      };
      SnapshotRepository.save.resolves(createdSnapshot);

      // when
      const promise = SnapshotService.create(snapshot);

      return promise.then((snapshotId) => {
        // then
        expect(snapshotId).to.equal(3);
      });

    });

    it('should reject an error has occurred', () => {
      // given
      const error = new Error();
      SnapshotRepository.save.rejects(error);

      // when
      const promise = SnapshotService.create(snapshot);

      // then
      return promise.catch((err) => {
        expect(err).to.be.an.instanceof(Error);
      });
    });

  });
});
