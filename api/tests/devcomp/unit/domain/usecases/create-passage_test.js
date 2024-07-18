import { ModuleDoesNotExistError } from '../../../../../src/devcomp/domain/errors.js';
import { createPassage } from '../../../../../src/devcomp/domain/usecases/create-passage.js';
import { UserNotFoundError } from '../../../../../src/shared/domain/errors.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { catchErr, expect, sinon } from '../../../../test-helper.js';

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

  describe('when user does not exist', function () {
    it('should throw an UserNotExists', async function () {
      // given
      const userId = Symbol('userId');

      const moduleRepositoryStub = {
        getBySlug: sinon.stub(),
      };
      const userRepositoryStub = {
        get: sinon.stub(),
      };
      userRepositoryStub.get.withArgs(userId).throws(new UserNotFoundError());

      // when
      const error = await catchErr(createPassage)({
        userId,
        moduleRepository: moduleRepositoryStub,
        userRepository: userRepositoryStub,
      });

      // then
      expect(error).to.be.instanceOf(UserNotFoundError);
    });
  });

  it('should call passage repository to save the passage', async function () {
    // given
    const moduleId = Symbol('moduleId');
    const userId = Symbol('userId');
    const repositoryResult = Symbol('repository-result');

    const userRepositoryStub = {
      get: sinon.stub(),
    };
    userRepositoryStub.get.withArgs(userId).resolves();
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
      userId,
      passageRepository: passageRepositoryStub,
      moduleRepository: moduleRepositoryStub,
      userRepository: userRepositoryStub,
    });

    // then
    expect(passageRepositoryStub.save).to.have.been.calledWithExactly({
      moduleId,
      userId,
    });
    expect(result).to.equal(repositoryResult);
  });
});
