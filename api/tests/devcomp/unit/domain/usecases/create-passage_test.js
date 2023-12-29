import { catchErr, expect, sinon } from '../../../../test-helper.js';
import { createPassage } from '../../../../../src/devcomp/domain/usecases/create-passage.js';
import { ModuleDoesNotExistError } from '../../../../../src/devcomp/domain/errors.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';

describe('Unit | Devcomp | Domain | UseCases | create-passage', function () {
  describe('when module does not exist', function () {
    it('should throw an ModuleNotExists', async function () {
      // given
      const moduleId = Symbol('moduleId');

      const moduleRepositoryStub = {
        getBySlug: sinon.stub(),
      };
      moduleRepositoryStub.getBySlug.withArgs({ slug: moduleId }).throws(new NotFoundError());

      // when
      const error = await catchErr(createPassage)({ moduleId, moduleRepository: moduleRepositoryStub });

      // then
      expect(error).to.be.instanceOf(ModuleDoesNotExistError);
    });
  });

  it('should call passage repository to save the passage', async function () {
    // given
    const moduleId = Symbol('moduleId');
    const repositoryResult = Symbol('repository-result');

    const moduleRepositoryStub = {
      getBySlug: sinon.stub(),
    };
    moduleRepositoryStub.getBySlug.withArgs({ slug: moduleId }).resolves();
    const passageRepositoryStub = {
      save: sinon.stub(),
    };
    passageRepositoryStub.save.resolves(repositoryResult);

    // when
    const result = await createPassage({
      moduleId,
      passageRepository: passageRepositoryStub,
      moduleRepository: moduleRepositoryStub,
    });

    // then
    expect(passageRepositoryStub.save).to.have.been.calledWithExactly({
      moduleId,
    });
    expect(result).to.equal(repositoryResult);
  });
});
