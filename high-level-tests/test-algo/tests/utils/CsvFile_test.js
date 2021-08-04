const { expect, sinon } = require('../test-helpers');
const CsvFile = require('../../utils/CsvFile');
const fs = require('fs');

describe('CsvFile', () => {

  beforeEach(() => {
    sinon.stub(CsvFile.prototype, '_createAndAddHeadersIfNotExisting');
  });

  describe('#append', () => {
    it('should called write methods with writeHeaders option to false', async () => {
      // given
      const headers = [ 'fake-headers' ];
      const csvFile = new CsvFile(headers);
      const writeStub = sinon.stub(CsvFile, 'write');
      const writeStream = 'write-stream';
      sinon.stub(fs, 'createWriteStream').returns(writeStream);
      const rows = [{ test: 'test' }];

      // when
      await csvFile.append(rows);

      // then
      expect(writeStub).to.have.been.calledWith(
        writeStream,
        rows,
        { headers, includeEndRowDelimiter: true, writeHeaders: false },
      );
    });
  });
});
