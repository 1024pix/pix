import dayjs from 'dayjs';
import sinon from 'sinon';

import { StatusesEnumValues } from '../../../../../src/devcomp/domain/models/module/UserModuleStatus.js';
import {
  OrganizationLearnerParticipationStatuses,
  OrganizationLearnerParticipationTypes,
} from '../../../../../src/quest/domain/models/OrganizationLearnerParticipation.js';
import { repositories } from '../../../../../src/quest/infrastructure/repositories/index.js';
import { databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Quest | Integration | Infrastructure | repositories | organization learner passage participations', function () {
  describe('#synchronize', function () {
    let organizationLearner;
    let modulesApi;
    let clock;
    const now = new Date('2022-11-28T12:00:00Z');

    beforeEach(async function () {
      organizationLearner = databaseBuilder.factory.buildOrganizationLearner();

      await databaseBuilder.commit();

      modulesApi = {
        getUserModuleStatuses: sinon.stub(),
      };
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(async function () {
      clock.restore();
    });

    it('should create passage when participations does not exist', async function () {
      //given
      const moduleApiResponse = [
        {
          id: 1234,
          status: 'COMPLETED',
          createdAt: dayjs().subtract('30', 'days').toDate(),
          updatedAt: now,
          terminatedAt: null,
        },
      ];
      modulesApi.getUserModuleStatuses
        .withArgs({ userId: organizationLearner.userId, moduleIds: [1234] })
        .resolves(moduleApiResponse);

      // when
      await repositories.organizationLearnerPassageParticipationRepository.synchronize({
        organizationLearnerId: organizationLearner.id,
        moduleIds: [1234],
        modulesApi,
      });

      // then
      const result = await knex('organization_learner_participations').where({
        organizationLearnerId: organizationLearner.id,
      });

      expect(result).lengthOf(1);
      expect(result[0].updatedAt).deep.equal(now);
      expect(result[0].createdAt).deep.equal(dayjs().subtract('30', 'days').toDate());
      expect(result[0].completedAt).equal(null);
      expect(result[0].referenceId).deep.equal('1234');
    });

    it('should update passage when participation already exists', async function () {
      const learnerParticipationId = databaseBuilder.factory.buildOrganizationLearnerParticipation({
        status: 'STARTED',
        type: OrganizationLearnerParticipationTypes.PASSAGE,
        organizationLearnerId: organizationLearner.id,
        moduleId: '1234-abcdef',
        createdAt: dayjs().subtract('40', 'days').toDate(),
        updatedAt: dayjs().subtract('35', 'days').toDate(),
        completedAt: null,
      }).id;

      await databaseBuilder.commit();

      const moduleApiResponse = [
        {
          id: '1234-abcdef',
          status: 'COMPLETED',
          createdAt: dayjs().subtract('30', 'days').toDate(),
          updatedAt: now,
          terminatedAt: now,
        },
      ];
      modulesApi.getUserModuleStatuses
        .withArgs({ userId: organizationLearner.userId, moduleIds: ['1234-abcdef'] })
        .resolves(moduleApiResponse);

      // when
      await repositories.organizationLearnerPassageParticipationRepository.synchronize({
        organizationLearnerId: organizationLearner.id,
        moduleIds: ['1234-abcdef'],
        modulesApi,
      });

      // then
      const result = await knex('organization_learner_participations')
        .select(
          'organization_learner_participations.id',
          'updatedAt',
          'createdAt',
          'completedAt',
          'status',
          'referenceId',
        )
        .where({ organizationLearnerId: organizationLearner.id });

      expect(result).lengthOf(1);
      expect(result[0].id).equal(learnerParticipationId);
      expect(result[0].status).deep.equal(OrganizationLearnerParticipationStatuses.COMPLETED);
      expect(result[0].updatedAt).deep.equal(now);
      expect(result[0].referenceId).deep.equal('1234-abcdef');
      expect(result[0].createdAt).deep.equal(dayjs().subtract('30', 'days').toDate());
      expect(result[0].completedAt).deep.equal(now);
    });

    it('should insert more than one line when needed', async function () {
      //given
      const moduleApiResponse = [
        {
          id: '1234',
          status: StatusesEnumValues.COMPLETED,
          createdAt: dayjs().subtract('30', 'days').toDate(),
          updatedAt: now,
          terminatedAt: null,
        },
        {
          id: '4567',
          status: StatusesEnumValues.IN_PROGRESS,
          createdAt: dayjs().subtract('50', 'days').toDate(),
          updatedAt: dayjs().subtract('10', 'days').toDate(),
          terminatedAt: null,
        },
      ];
      modulesApi.getUserModuleStatuses
        .withArgs({ userId: organizationLearner.userId, moduleIds: ['1234', '4567'] })
        .resolves(moduleApiResponse);

      // when
      await repositories.organizationLearnerPassageParticipationRepository.synchronize({
        organizationLearnerId: organizationLearner.id,
        moduleIds: ['1234', '4567'],
        modulesApi,
      });

      // then
      const result = await knex('organization_learner_participations').where({
        organizationLearnerId: organizationLearner.id,
      });

      expect(result).lengthOf(2);
    });
  });
});
