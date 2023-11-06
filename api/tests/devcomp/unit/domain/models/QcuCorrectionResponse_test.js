import { expect } from '../../../../test-helper.js';
import { QcuCorrectionResponse } from '../../../../../src/devcomp/domain/models/QcuCorrectionResponse.js';
import { AnswerStatus } from '../../../../../src/devcomp/domain/models/validator/AnswerStatus.js';

describe('Unit | Devcomp | Models | QcuCorrectionResponse', function () {
  describe('#constructor', function () {
    it('should create a QCU correction response and keep attributes', function () {
      // given
      const globalResult = AnswerStatus.OK;
      const feedback = 'Bien joué !';
      const proposalId = 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6';

      // when
      const qcuCorrectionResponse = new QcuCorrectionResponse({ globalResult, feedback, solutionId: proposalId });

      // then
      expect(qcuCorrectionResponse).not.to.be.undefined;
      expect(qcuCorrectionResponse.globalResult).to.deep.equal(globalResult);
      expect(qcuCorrectionResponse.feedback).to.equal(feedback);
      expect(qcuCorrectionResponse.solutionId).to.equal(proposalId);
    });
  });

  describe('A QCU correction response without global result', function () {
    it('should throw an error', function () {
      expect(() => new QcuCorrectionResponse({})).to.throw(
        'Le résultat global est obligatoire pour une réponse de QCU',
      );
    });
  });

  describe('A QCU correction response without feedback', function () {
    it('should throw an error', function () {
      expect(() => new QcuCorrectionResponse({ globalResult: AnswerStatus.OK })).to.throw(
        'Le feedback est obligatoire pour une réponse de QCU',
      );
    });
  });

  describe('A QCU correction response without proposal id', function () {
    it('should throw an error', function () {
      expect(() => new QcuCorrectionResponse({ globalResult: AnswerStatus.OK, feedback: 'Bien joué !' })).to.throw(
        "L'id de la proposition correcte est obligatoire pour une réponse de QCU",
      );
    });
  });
});
