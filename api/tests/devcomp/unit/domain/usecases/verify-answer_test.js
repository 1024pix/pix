import { validateAnswer } from '../../../../../src/devcomp/domain/usecases/validate-answer.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Devcomp | Usecases | validate-answer', function () {
  describe('#validateAnswer', function () {
    describe('When the selected proposal is valid', function () {
      it('should return a valid Correction Response', async function () {
        // given
        const moduleSlug = 'moduleSlug';
        const elementId = 'elementId';
        const userResponse = ['totoId'];

        const mockedModuleRepo = {
          getBySlugForVerification: sinon.stub(),
        };

        const expectedModule = {
          getElementById: sinon.stub(),
        };

        mockedModuleRepo.getBySlugForVerification.withArgs({ slug: moduleSlug }).resolves(expectedModule);

        const stubElement = {
          assess: sinon.stub(),
        };
        expectedModule.getElementById.withArgs(elementId).returns(stubElement);

        const expectedQcuResponse = Symbol('answer');
        stubElement.assess.withArgs(userResponse).returns(expectedQcuResponse);

        // when
        const validateQcu = await validateAnswer({
          moduleSlug: moduleSlug,
          elementId: elementId,
          userResponse: userResponse,
          moduleRepository: mockedModuleRepo,
        });

        // then
        expect(validateQcu).to.deep.equal(expectedQcuResponse);
      });
    });
  });
});
