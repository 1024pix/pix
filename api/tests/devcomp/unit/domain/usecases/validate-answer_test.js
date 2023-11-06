import { validateAnswer } from '../../../../../src/devcomp/domain/usecases/validate-answer.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Devcomp | Usecases | validate-answer', function () {
  describe('#validateAnswer', function () {
    describe('When the selected proposal is valid', function () {
      it('should return a valid Correction Response', async function () {
        // given
        const moduleSlug = 'moduleSlug';
        const elementId = 'elementId';
        const proposalSelectedId = 'totoId';

        const mockedModuleRepo = {
          getBySlug: sinon.stub(),
        };

        const expectedModule = {
          getElementById: sinon.stub(),
        };

        mockedModuleRepo.getBySlug.withArgs({ slug: moduleSlug }).resolves(expectedModule);

        const stubElement = {
          assess: sinon.stub(),
        };
        expectedModule.getElementById.withArgs(elementId).returns(stubElement);

        const expectedQcuResponse = Symbol('answer');
        stubElement.assess.withArgs(proposalSelectedId).returns(expectedQcuResponse);

        // when
        const validateQcu = await validateAnswer({
          moduleSlug: moduleSlug,
          elementId: elementId,
          proposalSelectedId: proposalSelectedId,
          moduleRepository: mockedModuleRepo,
        });

        // then
        expect(validateQcu).to.deep.equal(expectedQcuResponse);
      });
    });
  });
});
