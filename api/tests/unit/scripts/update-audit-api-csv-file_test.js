import { updateAuditCsvFromSwaggerJson } from '../../../scripts/update-audit-api-csv-file.js';
import { expect } from '../../test-helper.js';

describe('update-audit-api-csv-file script', function () {
  describe('updateAuditCsvFromSwaggerJson', function () {
    it('should remove old api route', function () {
      const csvData = [
        { Method: 'GET', URI: '/api/toto' },
        { Method: 'DELETE', URI: '/api/toto' },
      ];
      const jsonData = [{ verb: 'GET', route: '/api/toto' }];
      expect(updateAuditCsvFromSwaggerJson(csvData, jsonData)).to.eq(`Method,URI
GET,/api/toto`);
    });
  });

  it('should keep existing swagger routes', function () {
    const csvData = [{ Method: 'GET', URI: '/api/toto' }];
    const jsonData = [
      { verb: 'GET', route: '/api/toto' },
      { verb: 'POST', route: '/api/toto' },
    ];
    expect(updateAuditCsvFromSwaggerJson(csvData, jsonData)).to.eq(`Method,URI
GET,/api/toto
POST,/api/toto`);
  });
  it('should not duplicate routes', function () {
    const csvData = [{ Method: 'GET', URI: '/api/toto' }];
    const jsonData = [{ verb: 'GET', route: '/api/toto' }];
    expect(updateAuditCsvFromSwaggerJson(csvData, jsonData)).to.eq(`Method,URI
GET,/api/toto`);
  });
});
