import { createServer, expect, mockLearningContent } from '../../../test-helper.js';
import * as learningContentBuilder from '../../../tooling/learning-content-builder/index.js';

describe('Integration | Controller | challenge-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('#get', function () {
    it('should fetch and return the given challenge, serialized as JSONAPI', async function () {
      const challenge = learningContentBuilder.buildChallenge({
        instruction: 'Jean-michel va à la \n***\n plage pour manger un gateau',
      });
      const skill = learningContentBuilder.buildSkill({ id: challenge.skillId });

      mockLearningContent({
        challenges: [challenge],
        skills: [skill],
      });

      const expectedResult = ['Jean-michel va à la \n', '\n plage pour manger un gateau'];

      const response = await server.inject({
        method: 'GET',
        url: `/api/pix1d/challenges/${challenge.id}`,
      });

      expect(response.statusCode).to.equal(200);
      expect(response.result.data.attributes.instruction).to.deep.equal(expectedResult);
    });
  });
});
