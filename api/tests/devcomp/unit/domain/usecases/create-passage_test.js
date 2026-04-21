import sinon from 'sinon';

import { ModuleDoesNotExistError } from '../../../../../src/devcomp/domain/errors.js';
import { Module } from '../../../../../src/devcomp/domain/models/module/Module.js';
import { Passage } from '../../../../../src/devcomp/domain/models/Passage.js';
import { createPassage } from '../../../../../src/devcomp/domain/usecases/create-passage.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import { UserNotFoundError } from '../../../../../src/shared/domain/errors.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | Devcomp | Domain | UseCases | create-passage', function () {
  beforeEach(function () {
    sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda());
  });

  describe('when module does not exist', function () {
    it('should throw a ModuleDoesNotExist error', async function () {
      // given
      const moduleId = '4c2161c3-41ee-412d-a0ed-8f8f2082ca82';

      const moduleRepositoryStub = {
        getById: sinon.stub(),
      };
      moduleRepositoryStub.getById.withArgs({ id: moduleId }).throws(new NotFoundError());

      // when
      const error = await catchErr(createPassage)({ moduleId, moduleRepository: moduleRepositoryStub });

      // then
      expect(error).to.be.instanceOf(ModuleDoesNotExistError);
    });
  });

  describe('when user does not exist', function () {
    it('should throw an UserNotExists error', async function () {
      // given
      const userId = Symbol('userId');

      const moduleRepositoryStub = {
        getById: sinon.stub(),
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

  it('should save the passage', async function () {
    // given
    const moduleId = Symbol('moduleId');
    const moduleShortId = 'bds87bds';
    const moduleSlug = 'les-adresses-email';
    const passageId = 1234;
    const userId = Symbol('userId');

    const title = 'Les adresses email';
    const isBeta = false;
    const visibility = Symbol('visibility');
    const sections = [Symbol('text')];
    const details = Symbol('details');
    const version = Symbol('version');
    const module = new Module({
      id: moduleId,
      shortId: moduleShortId,
      slug: moduleSlug,
      title,
      isBeta,
      sections,
      details,
      version,
      visibility,
    });

    const passageCreatedAt = new Date('2025-03-05');
    const passage = new Passage({
      id: passageId,
      moduleId,
      userId,
      createdAt: passageCreatedAt,
    });

    const userRepositoryStub = {
      get: sinon.stub(),
    };
    userRepositoryStub.get.withArgs(userId).resolves();
    const moduleRepositoryStub = {
      getById: sinon.stub(),
    };
    moduleRepositoryStub.getById.withArgs({ id: module.id }).resolves(module);
    const passageRepositoryStub = {
      save: sinon.stub(),
    };
    passageRepositoryStub.save.resolves(passage);

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
    expect(result).to.equal(passage);
  });
});
