const { describe, it, expect } = require('../../../test-helper');

const service = require('../../../../lib/domain/services/solution-service-qcu');

describe('Unit | Service | SolutionServiceQCU ', function () {

  describe('if solution type is QCU', function () {

    it('should return "ok" when answer and solution are equal', function () {
      expect(service.match('same value', 'same value')).to.equal('ok');
    });

    it('should return "ko" when answer and solution are different', function () {
      expect(service.match('answer value', 'different solution value')).to.equal('ko');
    });

  });
});

