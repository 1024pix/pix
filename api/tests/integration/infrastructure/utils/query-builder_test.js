const { expect, databaseBuilder } = require('../../../test-helper');
const QueryBuilder = require('../../../../lib/infrastructure/utils/query-builder');
const Snapshot = require('../../../../lib/infrastructure/data/snapshot');
const _ = require('lodash');

describe('Integration | Infrastructure | Utils | Query Builder', function() {
  let snapshots;

  beforeEach(() => {
    snapshots = _.sortBy(_.times(10, databaseBuilder.factory.buildSnapshot), 'id');

    return databaseBuilder.commit();
  });

  afterEach(() => {
    return databaseBuilder.clean();
  });

  describe('find', function() {
    it('should return all snapshots', async function() {
      // when
      const results = await QueryBuilder.find(Snapshot, {
        filter: {},
        page: {},
        sort: [],
        include: [],
      });

      // then
      expect(results.models).to.have.lengthOf(10);
    });

    it('should return filtered snapshots', async function() {
      // when
      const results = await QueryBuilder.find(Snapshot, {
        filter: {
          organizationId: snapshots[4].organizationId,
        },
        page: {},
        sort: [],
        include: ['organization'],
      });

      // then
      expect(results.models[0].organization.id).to.equal(snapshots[4].organizationId);
    });

    it('should return all snapshots sorted', async function() {
      // when
      const results = await QueryBuilder.find(Snapshot, {
        filter: {},
        page: {},
        sort: ['-createdAt'],
        include: [],
      });

      // then
      expect(results.models).to.have.lengthOf(10);
      expect(results.models).to.have.lengthOf(10).to.be.descendingBy('createdAt');
    });

    it('should return all snapshots with pagination', async function() {
      // when
      const result = await QueryBuilder.find(Snapshot, {
        filter: {},
        page: {
          number: 1,
          size: 10,
        },
        sort: [],
        include: [],
      });

      // then
      expect(result.pagination).to.deep.equal({ page: 1, pageSize: 10, rowCount: 10, pageCount: 1 });
      expect(result.models).to.have.lengthOf(10);
    });

    it('should return a specific page of snapshots', async function() {
      // when
      const result = await QueryBuilder.find(Snapshot, {
        filter: {},
        page: {
          number: 2,
          size: 3,
        },
        sort: [],
        include: [],
      });

      // then
      expect(result.pagination).to.deep.equal({ page: 2, pageSize: 3, rowCount: 10, pageCount: 4 });
      expect(result.models).to.have.lengthOf(3);
      expect(result.models[0].id).to.equal(snapshots[3].id);
      expect(result.models[1].id).to.equal(snapshots[4].id);
      expect(result.models[2].id).to.equal(snapshots[5].id);
    });

    it('should return a specific page of snapshots with related objects', async function() {
      // when
      const result = await QueryBuilder.find(Snapshot, {
        filter: {},
        page: {
          number: 3,
          size: 2,
        },
        sort: [],
        include: ['user', 'organization'],
      });

      // then
      expect(result.pagination).to.deep.equal({ page: 3, pageSize: 2, rowCount: 10, pageCount: 5 });
      expect(result.models).to.have.lengthOf(2);
      expect(result.models[0].user.id).to.equal(snapshots[4].userId);
      expect(result.models[0].organization.id).to.equal(snapshots[4].organizationId);
      expect(result.models[1].user.id).to.equal(snapshots[5].userId);
      expect(result.models[1].organization.id).to.equal(snapshots[5].organizationId);
    });
  });
});
