import { smartRandomSimulatorController } from '../../../../../src/evaluation/application/smart-random-simulator/smart-random-simulator-controller.js';
import { getSmartRandomLog } from '../../../../../src/evaluation/domain/services/smart-random-log-service.js';
import { expect, hFake, mockLearningContent } from '../../../../test-helper.js';

const request = {
  payload: {
    data: {
      attributes: {
        knowledgeElements: [
          {
            source: 'direct',
            status: 'validated',
            answerId: 12345678,
            skillId: 'rec45678765',
          },
        ],
        answers: [
          {
            id: '1245',
            result: 'ok',
            challengeId: 'rec1234567',
          },
        ],
        skills: [
          {
            id: 'recoaijndozia123',
            name: '@skillname3',
            difficulty: 3,
          },
        ],
        challenges: [
          {
            id: 'challengerec1234567',
            skill: {
              id: 'recoaijndozia123',
              name: '@skillname3',
              difficulty: 3,
            },
            locales: ['fr-fr'],
          },
        ],
        locale: 'fr-fr',
        assessmentId: 12346,
      },
    },
  },
};

describe('Integration | Application | Smart Random Simulator', function () {
  context('#getNextChallenge', function () {
    beforeEach(function () {
      const learningContent = {
        areas: [],
        competences: [],
        thematics: [],
        tubes: [{ id: 'tubeId1' }],
      };
      mockLearningContent(learningContent);
    });

    it('should empty smart random log after execution', async function () {
      // when
      const response = await smartRandomSimulatorController.getNextChallenge(request, hFake);
      // then
      expect(response.smartRandomLog).to.be.not.null;
      const log = getSmartRandomLog();
      expect(log).to.be.null;
    });
  });
});
