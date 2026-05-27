import sinon from 'sinon';

import { deserializeForCertificationCenterBatchArchive } from '../../../../../../src/organizational-entities/infrastructure/serializers/csv/certification-center-archive-csv-serializer.js';
import { expect } from '../../../../../test-helper.js';

describe('Organizational Entities | Unit | Infrastructure | Serializers | CSV | certification-center-archive-csv-serializer', function () {
  describe('#deserializeForCertificationCenterBatchArchive', function () {
    it('should check the required header', async function () {
      // given
      const filePath = 'file://certification-centers.csv';
      const checkCsvHeaderStub = sinon.stub();
      const readCsvFileStub = sinon.stub();
      const parseCsvDataStub = sinon.stub();
      parseCsvDataStub.resolves([{ 'ID du centre de certification': 1234 }, { 'ID du centre de certification': 5678 }]);

      const requiredFieldNames = ['ID du centre de certification'];

      // when
      const serializedData = await deserializeForCertificationCenterBatchArchive(filePath, {
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
