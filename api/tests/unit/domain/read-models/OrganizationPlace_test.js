const { expect, sinon } = require('../../../test-helper');
const OrganizationPlace = require('../../../../lib/domain/read-models/OrganizationPlace');

describe('Unit | Domain | ReadModels | OrganizationPlace', function () {
  describe('constructor', function () {
    it('should build an Organization Place from raw JSON', function () {
      // given
      const rawData = {
        id: 1,
        count: 777,
        activationDate: new Date('1986-05-01'),
        expirationDate: new Date('2086-01-01'),
        reference: 'Stargate',
        category: 'T1',
        creatorFirstName: 'Jack',
        creatorLastName: "O'Neill",
      };

      // when
      const organizationPlace = new OrganizationPlace(rawData);

      // then
      expect(organizationPlace.id).to.equal(rawData.id);
      expect(organizationPlace.count).to.equal(rawData.count);
      expect(organizationPlace.activationDate).to.equal(rawData.activationDate);
      expect(organizationPlace.expirationDate).to.equal(rawData.expirationDate);
      expect(organizationPlace.reference).to.equal(rawData.reference);
      expect(organizationPlace.category).to.equal(OrganizationPlace.categories[rawData.category]);
      expect(organizationPlace.creatorFullName).to.equal(`${rawData.creatorFirstName} ${rawData.creatorLastName}`);
    });
  });

  describe('#status', function () {
    let clock;
    const now = new Date('2021-05-01');

    beforeEach(async function () {
      clock = sinon.useFakeTimers(now);
    });

    afterEach(async function () {
      clock.restore();
    });

    it('have expired status when expirationDate has passed.', function () {
      // given
      const rawData = {
        activationDate: new Date('2020-01-12'),
        expirationDate: new Date('2021-01-01'),
      };

      // when
      const organizationPlace = new OrganizationPlace(rawData);

      // then
      expect(organizationPlace.status).to.equal(OrganizationPlace.statuses.EXPIRED);
    });

    it('have active status when place is currently active', function () {
      // given
      const rawData = {
        activationDate: new Date('2020-01-12'),
        expirationDate: new Date('2021-05-15'),
      };

      // when
      const organizationPlace = new OrganizationPlace(rawData);

      // then
      expect(organizationPlace.status).to.equal(OrganizationPlace.statuses.ACTIVE);
    });

    it('have pending status when the place is not yet active', function () {
      // given
      const rawData = {
        activationDate: new Date('2021-05-04'),
        expirationDate: new Date('2022-05-04'),
      };

      // when
      const organizationPlace = new OrganizationPlace(rawData);

      // then
      expect(organizationPlace.status).to.equal(OrganizationPlace.statuses.PENDING);
    });

    describe('#expirationDate to null', function () {
      it('have active status when place is currently active', function () {
        const expirationDate = null;
        // given
        const rawData = {
          activationDate: new Date('2020-01-12'),
          expirationDate,
        };

        // when
        const organizationPlace = new OrganizationPlace(rawData);

        // then
        expect(organizationPlace.status).to.equal(OrganizationPlace.statuses.ACTIVE);
      });

      it('have pending status when the place is not yet active', function () {
        const expirationDate = null;
        // given
        const rawData = {
          activationDate: new Date('2021-05-28'),
          expirationDate,
        };

        // when
        const organizationPlace = new OrganizationPlace(rawData);

        // then
        expect(organizationPlace.status).to.equal(OrganizationPlace.statuses.PENDING);
      });
    });
  });

  describe('#category', function () {
    it('have a free rate category when the given category is T0', function () {
      // given
      const rawData = {
        category: 'T0',
      };

      // when
      const organizationPlace = new OrganizationPlace(rawData);

      // then
      expect(organizationPlace.category).to.equal(OrganizationPlace.categories.T0);
    });

    it('have a public rate category when the given category is T1', function () {
      // given
      const rawData = {
        category: 'T1',
      };

      // when
      const organizationPlace = new OrganizationPlace(rawData);

      // then
      expect(organizationPlace.category).to.equal(OrganizationPlace.categories.T1);
    });

    it('have a reduce rate category when the given category is T2', function () {
      // given
      const rawData = {
        category: 'T2',
      };

      // when
      const organizationPlace = new OrganizationPlace(rawData);

      // then
      expect(organizationPlace.category).to.equal(OrganizationPlace.categories.T2);
    });

    it('have a special reduce rate category when the given category is T2bis', function () {
      // given
      const rawData = {
        category: 'T2bis',
      };

      // when
      const organizationPlace = new OrganizationPlace(rawData);

      // then
      expect(organizationPlace.category).to.equal(OrganizationPlace.categories.T2bis);
    });

    it('have a full rate category when the given category is T3', function () {
      // given
      const rawData = {
        category: 'T3',
      };

      // when
      const organizationPlace = new OrganizationPlace(rawData);

      // then
      expect(organizationPlace.category).to.equal(OrganizationPlace.categories.T3);
    });
  });
});
