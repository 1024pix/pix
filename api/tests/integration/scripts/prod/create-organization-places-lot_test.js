import { expect, catchErr } from '../../../test-helper';
import { EntityValidationError } from '../../../../lib/domain/errors';
import { prepareOrganizationPlacesLot } from '../../../../scripts/prod/create-organization-places-lot';

describe('Integration | Scripts | create-organization-places-lot', function () {
  describe('#prepareOrganizationPlacesLot', function () {
    it('should create organization places lot for each organizationId', async function () {
      // given
      const organizationPlacesLotData1 = {
        count: '10',
        category: 'T1',
        createdBy: '123',
        organizationId: '987',
        reference: 'Some reference',
        activationDate: '31/10/2021',
        expirationDate: '31/10/2022',
      };
      const organizationPlacesLotData2 = {
        category: 'T2bis',
        createdBy: '456',
        organizationId: '654',
        reference: 'Some reference bis',
        activationDate: '31/10/2021',
      };

      // when
      const organizationPlacesLotData = await prepareOrganizationPlacesLot(
        [organizationPlacesLotData1, organizationPlacesLotData2],
        false
      );

      // then
      expect(organizationPlacesLotData).to.deep.equal([
        {
          activationDate: '2021-10-31',
          category: organizationPlacesLotData1.category,
          count: organizationPlacesLotData1.count,
          createdBy: organizationPlacesLotData1.createdBy,
          expirationDate: '2022-10-31',
          organizationId: organizationPlacesLotData1.organizationId,
          reference: organizationPlacesLotData1.reference,
        },
        {
          activationDate: '2021-10-31',
          category: organizationPlacesLotData2.category,
          count: null,
          createdBy: organizationPlacesLotData2.createdBy,
          expirationDate: null,
          organizationId: organizationPlacesLotData2.organizationId,
          reference: organizationPlacesLotData2.reference,
        },
      ]);
    });

    it('should throw a validate error when createdBy is not valid', async function () {
      // given
      const organizationPlacesLotData = {
        createdBy: undefined,
        count: '10',
        category: 'T1',
        organizationId: '987',
        reference: 'Some reference',
        activationDate: '10/10/2021',
        expirationDate: '10/10/2022',
      };

      // when
      const error = await catchErr(prepareOrganizationPlacesLot)([organizationPlacesLotData]);

      // then
      expect(error).to.be.instanceOf(EntityValidationError);
      expect(error.invalidAttributes[0].attribute).to.equal('createdBy');
    });

    it('should throw a validate error when organizationId is not valid', async function () {
      // given
      const organizationPlacesLotData = {
        count: '10',
        category: 'T1',
        organizationId: undefined,
        reference: 'Some reference',
        activationDate: '10/10/2021',
        expirationDate: '10/10/2022',
      };

      // when
      const error = await catchErr(prepareOrganizationPlacesLot)([organizationPlacesLotData]);

      // then
      expect(error).to.be.instanceOf(EntityValidationError);
      expect(error.invalidAttributes[0].attribute).to.equal('organizationId');
    });

    it('should throw a validate error when category is not valid', async function () {
      // given
      const organizationPlacesLotData = {
        count: '10',
        category: 'C1',
        organizationId: '987',
        reference: 'Some reference',
        activationDate: '10/10/2020',
        expirationDate: '10/10/2021',
      };

      // when
      const error = await catchErr(prepareOrganizationPlacesLot)([organizationPlacesLotData]);

      // then
      expect(error).to.be.instanceOf(EntityValidationError);
      expect(error.invalidAttributes[0].attribute).to.equal('category');
    });

    it('should throw a validate error when reference is not valid', async function () {
      // given
      const organizationPlacesLotData = {
        count: '10',
        category: 'T1',
        organizationId: '987',
        reference: undefined,
        activationDate: '10/10/2020',
        expirationDate: '10/10/2021',
      };

      // when
      const error = await catchErr(prepareOrganizationPlacesLot)([organizationPlacesLotData]);

      // then
      expect(error).to.be.instanceOf(EntityValidationError);
      expect(error.invalidAttributes[0].attribute).to.equal('reference');
    });

    it('should throw a validate error when activationDate is not valid', async function () {
      // given
      const organizationPlacesLotData = {
        count: '10',
        category: 'T1',
        organizationId: '987',
        reference: 'Some reference',
        activationDate: undefined,
        expirationDate: '10/10/2021',
      };

      // when
      const error = await catchErr(prepareOrganizationPlacesLot)([organizationPlacesLotData]);

      // then
      expect(error).to.be.instanceOf(EntityValidationError);
      expect(error.invalidAttributes[0].attribute).to.equal('activationDate');
    });

    it('should throw a validate error when expirationDate is before activationDate', async function () {
      // given
      const organizationPlacesLotData = {
        count: '10',
        category: 'T1',
        organizationId: '987',
        reference: 'Some reference',
        activationDate: '10/10/2021',
        expirationDate: '10/10/2020',
      };

      // when
      const error = await catchErr(prepareOrganizationPlacesLot)([organizationPlacesLotData]);

      // then
      expect(error).to.be.instanceOf(EntityValidationError);
      expect(error.invalidAttributes[0].attribute).to.equal('expirationDate');
    });

    it('should throw a validate error when count is not valid', async function () {
      // given
      const organizationPlacesLotData = {
        count: '1.2',
        category: 'T1',
        organizationId: '987',
        reference: 'Some reference',
        activationDate: '10/10/2021',
        expirationDate: '10/10/2020',
      };

      // when
      const error = await catchErr(prepareOrganizationPlacesLot)([organizationPlacesLotData]);

      // then
      expect(error).to.be.instanceOf(EntityValidationError);
      expect(error.invalidAttributes[0].attribute).to.equal('count');
    });
  });
});
