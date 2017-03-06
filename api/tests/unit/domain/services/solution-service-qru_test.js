const { describe, it, expect } = require('../../../test-helper');

const service = require('../../../../lib/domain/services/solution-service-qru');

describe('Unit | Service | SolutionServiceQRU ', function () {

  describe('if solution type is QRU', function () {

    it('should return "unimplemented" in all cases', function () {
      expect(service.match()).to.equal('unimplemented');
    });

  });
});

