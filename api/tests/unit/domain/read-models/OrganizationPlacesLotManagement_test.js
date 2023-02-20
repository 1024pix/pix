import { expect, sinon } from '../../../test-helper';
import OrganizationPlacesLotManagement from '../../../../lib/domain/read-models/OrganizationPlacesLotManagement';

describe('Unit | Domain | ReadModels | organizationPlacesLotManagement', function () {
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
      const organizationPlacesLotManagement = new OrganizationPlacesLotManagement(rawData);

      // then
      expect(organizationPlacesLotManagement.id).to.equal(rawData.id);
      expect(organizationPlacesLotManagement.count).to.equal(rawData.count);
      expect(organizationPlacesLotManagement.activationDate).to.equal(rawData.activationDate);
      expect(organizationPlacesLotManagement.expirationDate).to.equal(rawData.expirationDate);
      expect(organizationPlacesLotManagement.reference).to.equal(rawData.reference);
      expect(organizationPlacesLotManagement.category).to.equal(
        OrganizationPlacesLotManagement.categories[rawData.category]
      );
      expect(organizationPlacesLotManagement.creatorFullName).to.equal(
        `${rawData.creatorFirstName} ${rawData.creatorLastName}`
      );
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
      const organizationPlacesLotManagement = new OrganizationPlacesLotManagement(rawData);

      // then
      expect(organizationPlacesLotManagement.status).to.equal(OrganizationPlacesLotManagement.statuses.EXPIRED);
    });

    it('have active status when place is currently active', function () {
      // given
      const rawData = {
        activationDate: new Date('2020-01-12'),
        expirationDate: new Date('2021-05-15'),
      };

      // when
      const organizationPlacesLotManagement = new OrganizationPlacesLotManagement(rawData);

      // then
      expect(organizationPlacesLotManagement.status).to.equal(OrganizationPlacesLotManagement.statuses.ACTIVE);
    });

    it('have pending status when the place is not yet active', function () {
      // given
      const rawData = {
        activationDate: new Date('2021-05-04'),
        expirationDate: new Date('2022-05-04'),
      };

      // when
      const organizationPlacesLotManagement = new OrganizationPlacesLotManagement(rawData);

      // then
      expect(organizationPlacesLotManagement.status).to.equal(OrganizationPlacesLotManagement.statuses.PENDING);
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
        const organizationPlacesLotManagement = new OrganizationPlacesLotManagement(rawData);

        // then
        expect(organizationPlacesLotManagement.status).to.equal(OrganizationPlacesLotManagement.statuses.ACTIVE);
      });

      it('have pending status when the place is not yet active', function () {
        const expirationDate = null;
        // given
        const rawData = {
          activationDate: new Date('2021-05-28'),
          expirationDate,
        };

        // when
        const organizationPlacesLotManagement = new OrganizationPlacesLotManagement(rawData);

        // then
        expect(organizationPlacesLotManagement.status).to.equal(OrganizationPlacesLotManagement.statuses.PENDING);
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
      const organizationPlacesLotManagement = new OrganizationPlacesLotManagement(rawData);

      // then
      expect(organizationPlacesLotManagement.category).to.equal(OrganizationPlacesLotManagement.categories.T0);
    });

    it('have a public rate category when the given category is T1', function () {
      // given
      const rawData = {
        category: 'T1',
      };

      // when
      const organizationPlacesLotManagement = new OrganizationPlacesLotManagement(rawData);

      // then
      expect(organizationPlacesLotManagement.category).to.equal(OrganizationPlacesLotManagement.categories.T1);
    });

    it('have a reduce rate category when the given category is T2', function () {
      // given
      const rawData = {
        category: 'T2',
      };

      // when
      const organizationPlacesLotManagement = new OrganizationPlacesLotManagement(rawData);

      // then
      expect(organizationPlacesLotManagement.category).to.equal(OrganizationPlacesLotManagement.categories.T2);
    });

    it('have a special reduce rate category when the given category is T2bis', function () {
      // given
      const rawData = {
        category: 'T2bis',
      };

      // when
      const organizationPlacesLotManagement = new OrganizationPlacesLotManagement(rawData);

      // then
      expect(organizationPlacesLotManagement.category).to.equal(OrganizationPlacesLotManagement.categories.T2bis);
    });

    it('have a full rate category when the given category is T3', function () {
      // given
      const rawData = {
        category: 'T3',
      };

      // when
      const organizationPlacesLotManagement = new OrganizationPlacesLotManagement(rawData);

      // then
      expect(organizationPlacesLotManagement.category).to.equal(OrganizationPlacesLotManagement.categories.T3);
    });
  });
});
