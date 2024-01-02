import { verifyAndSaveAnswer } from '../../../../../src/devcomp/domain/usecases/verify-and-save-answer.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Devcomp | Domain | UseCases | verify-and-save-answer', function () {
  describe('#verifyAndSaveAnswer', function () {
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
        const validateQcu = await verifyAndSaveAnswer({
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
