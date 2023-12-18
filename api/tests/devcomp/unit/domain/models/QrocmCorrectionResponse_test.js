import { expect } from '../../../../test-helper.js';
import { QrocmCorrectionResponse } from '../../../../../src/devcomp/domain/models/QrocmCorrectionResponse.js';
import { AnswerStatus } from '../../../../../src/devcomp/domain/models/validator/AnswerStatus.js';

describe('Unit | Devcomp | Domain | Models | QrocmCorrectionResponse', function () {
  describe('#constructor', function () {
    it('should create a QROCM correction response and keep attributes', function () {
      // given
      const status = AnswerStatus.OK;
      const feedback = 'Bien joué !';
      const solution = Symbol('solution');

      // when
      const qcuCorrectionResponse = new QrocmCorrectionResponse({ status, feedback, solution });

      // then
      expect(qcuCorrectionResponse).not.to.be.undefined;
      expect(qcuCorrectionResponse.status).to.deep.equal(status);
      expect(qcuCorrectionResponse.feedback).to.equal(feedback);
      expect(qcuCorrectionResponse.solution).to.equal(solution);
    });
  });

  describe('A QROCM correction response without status', function () {
    it('should throw an error', function () {
      expect(() => new QrocmCorrectionResponse({})).to.throw('Le résultat est obligatoire pour une réponse de QROCM');
    });
  });

  describe('A QROCM correction response without feedback', function () {
    it('should throw an error', function () {
      expect(() => new QrocmCorrectionResponse({ status: AnswerStatus.OK })).to.throw(
        'Le feedback est obligatoire pour une réponse de QROCM',
      );
    });
  });

  describe('A QROCM correction response without solutions', function () {
    it('should throw an error', function () {
      expect(() => new QrocmCorrectionResponse({ status: AnswerStatus.OK, feedback: 'Bien joué !' })).to.throw(
        'La solution est obligatoire pour une réponse de QROCM',
      );
    });
  });
});
