import { anonymizationAdminController } from '../../../../src/identity-access-management/application/anonymization/anonymization.admin.controller.js';
import { GarAnonymizationParser } from '../../../../src/identity-access-management/domain/services/GarAnonymizationParser.js';
import { usecases } from '../../../../src/identity-access-management/domain/usecases/index.js';
import { anonymizeGarResultSerializer } from '../../../../src/identity-access-management/infrastructure/serializers/jsonapi/anonymize-gar-result.serializer.js';
import { DomainTransaction } from '../../../../src/shared/domain/DomainTransaction.js';
import { createTempFile, expect, hFake, sinon } from '../../../test-helper.js';

describe('Unit | Identity Access Management | Application | Controller | Admin | anonymization', function () {
  describe('anonymizeGarData', function () {
    let csvHeaders;
    let fileData;
    let filePath;
    let request;
    let total;
    let anonymizedUserCount;
    let userIds;
    let expectedJSON;

    beforeEach(async function () {
      csvHeaders = 'User ID';
      fileData = `${csvHeaders}
      1;4;6;15;78`;
      filePath = await createTempFile('test.csv', fileData);
      request = {
        auth: {
          credentials: {
            userId: 777,
          },
        },
        payload: { path: filePath },
      };
      anonymizedUserCount = 4;
      total = 5;
      userIds = [4, 6, 15, 78];
      expectedJSON = {
        data: {
          type: 'anonymize-gar-results',
          attributes: {
            anonymizedUserCount,
            total,
            userIds,
          },
        },
      };

      sinon.stub(GarAnonymizationParser, 'getCsvData').resolves([1, 4, 6, 15, 78]);
      sinon.stub(usecases, 'anonymizeGarAuthenticationMethods').resolves({ anonymizedUserCount, total, userIds });

      const domainTransaction = Symbol('domain transaction');
      sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda(domainTransaction));

      sinon.stub(anonymizeGarResultSerializer, 'serialize').returns(expectedJSON);
    });

    it('calls anonymizeGarAuthenticationMethods usecase', async function () {
      // given
      // when
      await anonymizationAdminController.anonymizeGarData(request, hFake);

      // then
      expect(usecases.anonymizeGarAuthenticationMethods).to.have.been.called;
    });

    it('returns a 200 with anonymizeGarAuthenticationMethods usecase result', async function () {
      // given
      // when
      const result = await anonymizationAdminController.anonymizeGarData(request, hFake);

      // then
      expect(result.statusCode).to.equal(200);
      expect(usecases.anonymizeGarAuthenticationMethods).to.have.been.called;
      expect(result.source).to.deep.equal(expectedJSON);
    });

    it('calls anonymizeGarResultSerializer.serialize', async function () {
      // when
      await anonymizationAdminController.anonymizeGarData(request, hFake);

      // then
      expect(anonymizeGarResultSerializer.serialize).to.have.been.called;
    });

    it('calls parsing function', async function () {
      // when
      await anonymizationAdminController.anonymizeGarData(request, hFake);

      // then
      expect(await GarAnonymizationParser.getCsvData).to.have.been.calledOnce;
      expect(await GarAnonymizationParser.getCsvData.calledWith(filePath)).to.be.true;
    });
  });
});
