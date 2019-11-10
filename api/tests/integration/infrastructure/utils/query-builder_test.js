const { expect, databaseBuilder } = require('../../../test-helper');
const queryBuilder = require('../../../../lib/infrastructure/utils/query-builder');

const BookshelfSnapshot = require('../../../../lib/infrastructure/data/snapshot');
const Snapshot = require('../../../../lib/domain/models/Snapshot');
const { NotFoundError } = require('../../../../lib/domain/errors');
const _ = require('lodash');

describe('Integration | Infrastructure | Utils | Query Builder', function() {
  let snapshots;

  beforeEach(() => {
    snapshots = _.sortBy(_.times(10, databaseBuilder.factory.buildSnapshot), 'id');

    return databaseBuilder.commit();
  });

  describe('find', function() {
    it('should return all snapshots', async function() {
      // when
      const results = await queryBuilder.find(BookshelfSnapshot, {
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
      const results = await queryBuilder.find(BookshelfSnapshot, {
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
      const results = await queryBuilder.find(BookshelfSnapshot, {
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
      const result = await queryBuilder.find(BookshelfSnapshot, {
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
      const result = await queryBuilder.find(BookshelfSnapshot, {
        filter: {},
        page: {
          number: 2,
          size: 3,
        },
        sort: ['id'],
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
      const result = await queryBuilder.find(BookshelfSnapshot, {
        filter: {},
        page: {
          number: 3,
          size: 2,
        },
        sort: ['id'],
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

  describe('get', function() {
    let expectedSnapshot;

    beforeEach(() => {
      expectedSnapshot = snapshots[0];
    });

    it('should return the snapshot', async function() {
      // when
      const result = await queryBuilder.get(BookshelfSnapshot, expectedSnapshot.id);

      // then
      expect(result.id).to.be.equal(snapshots[0].id);
      expect(result).to.be.instanceof(Snapshot);
    });

    it('should return the snapshot without calling domain converter', async function() {
      // when
      const result = await queryBuilder.get(BookshelfSnapshot, expectedSnapshot.id, null, false);

      // then
      expect(result).to.be.instanceof(BookshelfSnapshot);
    });

    it('should return the snapshot with organization', async function() {
      // when
      const result = await queryBuilder.get(BookshelfSnapshot, expectedSnapshot.id, {
        include: ['user', 'organization']
      });

      // then
      expect(result.id).to.be.equal(expectedSnapshot.id);
      expect(result.user.id).to.equal(expectedSnapshot.userId);
      expect(result.organization.id).to.equal(expectedSnapshot.organizationId);
    });

    it('should throw a NotFoundError if snapshot can not be found', function() {
      // when
      const promise = queryBuilder.get(BookshelfSnapshot, -1);

      // then
      return expect(promise).to.have.been.rejectedWith(NotFoundError);
    });
  });
});
