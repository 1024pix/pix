import { AnswerStatus } from '../../../../../src/devcomp/domain/models/validator/AnswerStatus.js';
import service from '../../../../../src/devcomp/domain/services/solution-service-qcu.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Services | SolutionServiceQCU ', function () {
  describe('if solution type is QCU', function () {
    it('should return `AnswerStatus.OK` when answer and solution are equal', function () {
      expect(service.match('same value', 'same value')).to.deep.equal(AnswerStatus.OK);
    });

    it('should return `AnswerStatus.KO` when answer and solution are different', function () {
      expect(service.match('answer value', 'different solution value')).to.deep.equal(AnswerStatus.KO);
    });
  });
});
