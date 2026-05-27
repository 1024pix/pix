import sinon from 'sinon';

import { deserializeForOrganizationBatchArchive } from '../../../../../../src/organizational-entities/infrastructure/serializers/csv/organization-archive-csv-serializer.js';
import { expect } from '../../../../../test-helper.js';

describe('Organizational Entities | Unit | Infrastructure | Serializers | CSV | organization-archive-csv-serializer', function () {
  describe('#deserializeForOrganizationBatchArchive', function () {
    it('should check the required header', async function () {
      // given
      const filePath = 'file://organizations.csv';
      const checkCsvHeaderStub = sinon.stub();
      const readCsvFileStub = sinon.stub();
      const parseCsvDataStub = sinon.stub();
      parseCsvDataStub.resolves([{ "ID de l'organisation": 1234 }, { "ID de l'organisation": 5678 }]);

      const requiredFieldNames = ["ID de l'organisation"];

      // when
      const serializedData = await deserializeForOrganizationBatchArchive(filePath, {
        checkCsvHeader: checkCsvHeaderStub,
        readCsvFile: readCsvFileStub,
        parseCsvData: parseCsvDataStub,
      });

      // then
      expect(checkCsvHeaderStub).to.have.been.calledWithExactly({ filePath, requiredFieldNames });
      expect(serializedData).to.deep.equal([1234, 5678]);
    });
  });
});
