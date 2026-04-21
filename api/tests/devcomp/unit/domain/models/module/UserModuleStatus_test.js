import dayjs from 'dayjs';
import sinon from 'sinon';

import { UserModuleStatus } from '../../../../../../src/devcomp/domain/models/module/UserModuleStatus.js';
import { Passage } from '../../../../../../src/devcomp/domain/models/Passage.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Devcomp | Domain | Models | Module | UserModuleStatus', function () {
  let userId, moduleId, passages;
  let clock;

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now: new Date('2024-05-01'), toFake: ['Date'] });
    userId = '1';
    moduleId = '66f6dea7-1bb3-4ec2-b33d-1c5e7bde3675';

    passages = [
      new Passage({
        id: 1,
        moduleId,
        userId,
        createdAt: dayjs().subtract('30', 'days').toDate(),
        updatedAt: dayjs().subtract('20', 'days').toDate(),
        terminatedAt: dayjs().subtract('20', 'days').toDate(),
      }),
      new Passage({
        id: 2,
        moduleId,
        userId,
        createdAt: dayjs().subtract('18', 'days').toDate(),
        updatedAt: dayjs().subtract('17', 'days').toDate(),
        terminatedAt: dayjs().subtract('15', 'days').toDate(),
      }),
      new Passage({
        id: 3,
        moduleId,
        userId,
        createdAt: dayjs().subtract('10', 'days').toDate(),
        updatedAt: dayjs().subtract('5', 'days').toDate(),
        terminatedAt: null,
      }),
    ];
  });

  afterEach(function () {
    clock.restore();
  });

  it('should init and keep attributes', function () {
    // when
    const userModuleStatus = new UserModuleStatus({ userId, moduleId, passages });

    // then
    expect(userModuleStatus.moduleId).to.equal(moduleId);
    expect(userModuleStatus.passages).to.deep.equal(passages);
    expect(userModuleStatus.userId).to.equal(userId);
    expect(userModuleStatus.status).to.equal('COMPLETED');
    expect(userModuleStatus.createdAt).deep.equal(dayjs().subtract('18', 'days').toDate());
    expect(userModuleStatus.updatedAt).deep.equal(dayjs().subtract('17', 'days').toDate());
    expect(userModuleStatus.terminatedAt).deep.equal(dayjs().subtract('15', 'days').toDate());
  });

  describe('if userId passed is not defined', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(
        () =>
          new UserModuleStatus({
            moduleId,
            passages,
          }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The userId is required for a UserModuleStatus');
    });
  });

  describe('if moduleId passed is not defined', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(
        () =>
          new UserModuleStatus({
            userId,
            passages,
          }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The moduleId is required for a UserModuleStatus');
    });
  });

  describe('if passages passed is not defined', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(
        () =>
          new UserModuleStatus({
            userId,
            moduleId,
          }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The passages field is required for a UserModuleStatus');
    });
  });

  describe('if passages passed do not match userId and moduleId of class attributes', function () {
    it('should throw an error', function () {
      // given
      const otherUserId = 'otherUserId';
      const otherModuleId = 'otherModuleId';
      passages = [
        ...passages,
        new Passage({
          id: 2,
          moduleId: otherModuleId,
          userId: otherUserId,
          createdAt: new Date(),
          updatedAt: new Date(),
          terminatedAt: new Date(),
        }),
      ];

      // when
      const error = catchErrSync(
        () =>
          new UserModuleStatus({
            userId,
            moduleId,
            passages,
          }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('Module and user id of passages must be the same as UserModuleStatus attributes');
    });
  });

  describe('#computeStatus', function () {
    context('when passages is empty', function () {
      it('should return "NOT_STARTED"', function () {
        // given && when
        passages = [];
        const userModuleStatus = new UserModuleStatus({ userId, moduleId, passages });

        // then
        expect(userModuleStatus.status).to.equal('NOT_STARTED');
      });
    });

    describe('when passages passed are not empty', function () {
      context('when all passages do not have a "terminatedAt" attribute', function () {
        it('should return IN_PROGRESS', function () {
          // given && when
          passages = [
            new Passage({
              id: 1,
              moduleId,
              userId,
              createdAt: dayjs().subtract('1', 'hour').toDate(),
              updatedAt: dayjs().subtract('1', 'hour').toDate(),
              terminatedAt: null,
            }),
            new Passage({
              id: 2,
              moduleId,
              userId,
              createdAt: new Date(),
              updatedAt: new Date(),
              terminatedAt: null,
            }),
          ];
          const userModuleStatus = new UserModuleStatus({ userId, moduleId, passages });

          // then
          expect(userModuleStatus.status).to.equal('IN_PROGRESS');
        });
      });
      context('when a passage has a "terminatedAt" attribute', function () {
        it('should set the status attribute to COMPLETED', function () {
          // given && when
          const nowMinusOneHour = dayjs().subtract('1', 'hour').toDate();
          passages = [
            new Passage({
              id: 1,
              moduleId,
              userId,
              createdAt: nowMinusOneHour,
              updatedAt: nowMinusOneHour,
              terminatedAt: nowMinusOneHour,
            }),
            new Passage({
              id: 2,
              moduleId,
              userId,
              createdAt: new Date(),
              updatedAt: new Date(),
              terminatedAt: null,
            }),
          ];
          const userModuleStatus = new UserModuleStatus({ userId, moduleId, passages });

          // then
          expect(userModuleStatus.status).to.equal('COMPLETED');
        });
      });
    });
  });
});
