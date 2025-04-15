import { ModuleDoesNotExistError } from '../../../../../src/devcomp/domain/errors.js';
import { Module } from '../../../../../src/devcomp/domain/models/module/Module.js';
import { Passage } from '../../../../../src/devcomp/domain/models/Passage.js';
import { PassageStartedEvent } from '../../../../../src/devcomp/domain/models/passage-events/passage-events.js';
import { createPassage } from '../../../../../src/devcomp/domain/usecases/create-passage.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import { UserNotFoundError } from '../../../../../src/shared/domain/errors.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { catchErr, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Devcomp | Domain | UseCases | create-passage', function () {
  beforeEach(function () {
    sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda());
  });

  describe('when module does not exist', function () {
    it('should throw a ModuleDoesNotExist error', async function () {
      // given
      const moduleSlug = 'module-that-does-not-exist';

      const moduleRepositoryStub = {
        getBySlug: sinon.stub(),
      };
      moduleRepositoryStub.getBySlug.withArgs({ slug: moduleSlug }).throws(new NotFoundError());

      // when
      const error = await catchErr(createPassage)({ moduleSlug, moduleRepository: moduleRepositoryStub });

      // then
      expect(error).to.be.instanceOf(ModuleDoesNotExistError);
    });
  });

  describe('when user does not exist', function () {
    it('should throw an UserNotExists error', async function () {
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

  it('should save the passage and record passage started event', async function () {
    // given
    const moduleId = Symbol('moduleId');
    const moduleSlug = 'les-adresses-email';
    const passageId = 1234;
    const userId = Symbol('userId');

    const title = 'Les adresses email';
    const isBeta = false;
    const grains = [Symbol('text')];
    const transitionTexts = [];
    const details = Symbol('details');
    const version = Symbol('version');
    const module = new Module({
      id: moduleId,
      slug: moduleSlug,
      title,
      isBeta,
      grains,
      details,
      transitionTexts,
      version,
    });

    const occurredAt = new Date('2025-01-01');
    const passageCreatedAt = new Date('2025-03-05');
    const passage = new Passage({
      id: passageId,
      moduleId,
      userId,
      createdAt: passageCreatedAt,
    });

    const passageStartedEvent = new PassageStartedEvent({
      contentHash: version,
      occurredAt,
      passageId,
    });

    const userRepositoryStub = {
      get: sinon.stub(),
    };
    userRepositoryStub.get.withArgs(userId).resolves();
    const moduleRepositoryStub = {
      getBySlug: sinon.stub(),
    };
    moduleRepositoryStub.getBySlug.withArgs({ slug: moduleSlug }).resolves(module);
    const passageRepositoryStub = {
      save: sinon.stub(),
    };
    passageRepositoryStub.save.resolves(passage);

    const passageEventRepositoryStub = {
      record: sinon.stub(),
    };

    // when
    const result = await createPassage({
      occurredAt,
      moduleSlug,
      userId,
      passageRepository: passageRepositoryStub,
      passageEventRepository: passageEventRepositoryStub,
      moduleRepository: moduleRepositoryStub,
      userRepository: userRepositoryStub,
    });

    // then
    expect(passageRepositoryStub.save).to.have.been.calledWithExactly({
      moduleId,
      userId,
    });
    expect(passageEventRepositoryStub.record).to.have.been.calledOnceWith(passageStartedEvent);
    expect(result).to.equal(passage);
  });
});
