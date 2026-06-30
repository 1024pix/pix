import dayjs from 'dayjs';
import sinon from 'sinon';

import { StatusesEnumValues } from '../../../../../src/devcomp/domain/models/module/UserModuleStatus.js';
import {
  OrganizationLearnerParticipation,
  OrganizationLearnerParticipationStatuses,
  OrganizationLearnerParticipationTypes,
} from '../../../../../src/quest/domain/models/combined-course-participations/entities/OrganizationLearnerParticipation.js';
import * as organizationLearnerParticipationRepository from '../../../../../src/quest/infrastructure/repositories/organization-learner-participation-repository.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

describe('Quest | Integration | Infrastructure | repositories | organization learner participations', function () {
  describe('#findByOrganizationLearnerIdAndModuleIds', function () {
    it('should return participations given learner and modulesIds', async function () {
      // given
      const otherLearner = databaseBuilder.factory.buildOrganizationLearner();
      databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypePassage({
        organizationLearnerId: otherLearner.id,
        moduleId: '123-abcd',
        status: OrganizationLearnerParticipationStatuses.NOT_STARTED,
      });
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner();
      databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypePassage({
        organizationLearnerId: organizationLearner.id,
        moduleId: '123-abcd',
        status: OrganizationLearnerParticipationStatuses.NOT_STARTED,
      });
      databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypePassage({
        organizationLearnerId: organizationLearner.id,
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
        moduleId: '456-abcd',
      });
      databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypePassage({
        organizationLearnerId: organizationLearner.id,
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
        moduleId: '789-abcd',
      });

      await databaseBuilder.commit();

      const result = await organizationLearnerParticipationRepository.findByOrganizationLearnerIdAndModuleIds({
        organizationLearnerId: organizationLearner.id,
        moduleIds: ['123-abcd', '456-abcd'],
      });

      expect(result).lengthOf(2);
      expect(result[0]).instanceOf(OrganizationLearnerParticipation);
      expect(result[1]).instanceOf(OrganizationLearnerParticipation);
    });

    it('return empty result when there is no participation', async function () {
      const result = await organizationLearnerParticipationRepository.findByOrganizationLearnerIdAndModuleIds({
        organizationLearnerId: 1234,
        moduleIds: ['123-abcd'],
      });

      expect(result).empty;
    });

    it('return empty result when there is only deleted participation', async function () {
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner();
      databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypePassage({
        organizationLearnerId: organizationLearner.id,
        moduleId: '123-abcd',
        status: OrganizationLearnerParticipationStatuses.NOT_STARTED,
        deletedAt: new Date('2024-01-01'),
      });

      await databaseBuilder.commit();
      const result = await organizationLearnerParticipationRepository.findByOrganizationLearnerIdAndModuleIds({
        organizationLearnerId: organizationLearner.id,
        moduleIds: ['123-abcd'],
      });

      expect(result).empty;
    });

    it('should fully instantiate model', async function () {
      // given
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner();
      const passage = databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypePassage({
        organizationLearnerId: organizationLearner.id,
        moduleId: '123-abcd',
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
      });

      await databaseBuilder.commit();

      const result = await organizationLearnerParticipationRepository.findByOrganizationLearnerIdAndModuleIds({
        organizationLearnerId: organizationLearner.id,
        moduleIds: ['123-abcd'],
      });

      expect(result[0].id).equal(passage.id);
      expect(result[0].organizationLearnerId).equal(passage.organizationLearnerId);
      expect(result[0].createdAt).deep.equal(passage.createdAt);
      expect(result[0].updatedAt).deep.equal(passage.updatedAt);
      expect(result[0].completedAt).deep.equal(passage.completedAt);
      expect(result[0].deletedAt).deep.equal(passage.deletedAt);
      expect(result[0].deletedBy).equal(passage.deletedBy);
      expect(result[0].status).equal(passage.status);
      expect(result[0].type).equal(passage.type);
      expect(result[0].referenceId).equal(passage.referenceId);
    });
  });

  describe('#findByOrganizationLearnerIdsAndModuleIds', function () {
    it('should return participations given learners and modulesIds', async function () {
      // given
      const otherLearner = databaseBuilder.factory.buildOrganizationLearner();
      databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypePassage({
        organizationLearnerId: otherLearner.id,
        moduleId: '123-abcd',
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
      });
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner();
      databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypePassage({
        organizationLearnerId: organizationLearner.id,
        moduleId: '123-abcd',
        status: OrganizationLearnerParticipationStatuses.NOT_STARTED,
      });
      databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypePassage({
        organizationLearnerId: organizationLearner.id,
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
        moduleId: '456-abcd',
      });
      databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypePassage({
        organizationLearnerId: organizationLearner.id,
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
        moduleId: '789-abcd',
      });

      await databaseBuilder.commit();

      const result = await organizationLearnerParticipationRepository.findByOrganizationLearnerIdsAndModuleIds({
        organizationLearnerIds: [organizationLearner.id, otherLearner.id],
        moduleIds: ['123-abcd', '456-abcd'],
      });

      expect(result.size).to.equal(2);
      expect(
        result
          .get(organizationLearner.id)
          .map(({ organizationLearnerId, referenceId }) => ({ organizationLearnerId, referenceId })),
      ).to.deep.equal([
        { organizationLearnerId: organizationLearner.id, referenceId: '123-abcd' },
        { organizationLearnerId: organizationLearner.id, referenceId: '456-abcd' },
      ]);
      expect(result.get(organizationLearner.id)[0]).instanceOf(OrganizationLearnerParticipation);
      expect(result.get(organizationLearner.id)[1]).instanceOf(OrganizationLearnerParticipation);
    });

    it('return null on empty result', async function () {
      const result = await organizationLearnerParticipationRepository.findByOrganizationLearnerIdsAndModuleIds({
        organizationLearnerIds: [1234],
        moduleIds: ['123-abcd'],
      });

      expect(result).empty;
    });

    it('return null on deleted result', async function () {
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner();
      databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypePassage({
        organizationLearnerId: organizationLearner.id,
        moduleId: '123-abcd',
        status: OrganizationLearnerParticipationStatuses.NOT_STARTED,
        deletedAt: new Date('2024-01-01'),
      });

      await databaseBuilder.commit();
      const result = await organizationLearnerParticipationRepository.findByOrganizationLearnerIdsAndModuleIds({
        organizationLearnerIds: [organizationLearner.id],
        moduleIds: ['123-abcd'],
      });

      expect(result).empty;
    });

    it('should fully instantiate model', async function () {
      // given
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner();
      const passage = databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypePassage({
        organizationLearnerId: organizationLearner.id,
        moduleId: '123-abcd',
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
      });

      await databaseBuilder.commit();

      const result = await organizationLearnerParticipationRepository.findByOrganizationLearnerIdsAndModuleIds({
        organizationLearnerIds: [organizationLearner.id],
        moduleIds: ['123-abcd'],
      });

      const [learnerPassage] = result.get(organizationLearner.id);
      expect(learnerPassage.id).equal(passage.id);
      expect(learnerPassage.organizationLearnerId).equal(passage.organizationLearnerId);
      expect(learnerPassage.createdAt).deep.equal(passage.createdAt);
      expect(learnerPassage.updatedAt).deep.equal(passage.updatedAt);
      expect(learnerPassage.completedAt).deep.equal(passage.completedAt);
      expect(learnerPassage.deletedAt).deep.equal(passage.deletedAt);
      expect(learnerPassage.deletedBy).equal(passage.deletedBy);
      expect(learnerPassage.status).equal(passage.status);
      expect(learnerPassage.type).equal(passage.type);
      expect(learnerPassage.referenceId).equal(passage.referenceId);
    });
  });

  describe('#synchronize', function () {
    let organizationLearner;
    let modulesApi;
    let organizationLearnerApi;
    let clock;
    const now = new Date('2022-11-28T12:00:00Z');

    beforeEach(async function () {
      organizationLearner = databaseBuilder.factory.buildOrganizationLearner();

      await databaseBuilder.commit();

      modulesApi = {
        getUserModuleStatuses: sinon.stub(),
      };

      organizationLearnerApi = {
        get: sinon.stub(),
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

      const organizationLearnerApiResponse = {
        id: organizationLearner.id,
        firstName: organizationLearner.firstName,
        lastName: organizationLearner.lastName,
        isDisabled: organizationLearner.isDisabled,
        userId: organizationLearner.userId,
      };

      organizationLearnerApi.get.withArgs(organizationLearner.id).resolves(organizationLearnerApiResponse);

      modulesApi.getUserModuleStatuses
        .withArgs({ userId: organizationLearner.userId, moduleIds: [1234] })
        .resolves(moduleApiResponse);

      // when
      await organizationLearnerParticipationRepository.synchronize({
        organizationLearnerId: organizationLearner.id,
        moduleIds: [1234],
        modulesApi,
        organizationLearnerApi,
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
      databaseBuilder.factory.buildOrganizationLearnerParticipation({
        moduleId: '1234-abcdef',
        status: 'STARTED',
      });
      const learnerParticipationId = databaseBuilder.factory.buildOrganizationLearnerParticipation({
        status: 'STARTED',
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
        .withArgs({
          userId: organizationLearner.userId,
          moduleIds: ['1234-abcdef'],
        })
        .resolves(moduleApiResponse);

      const organizationLearnerApiResponse = {
        id: organizationLearner.id,
        firstName: organizationLearner.firstName,
        lastName: organizationLearner.lastName,
        isDisabled: organizationLearner.isDisabled,
        userId: organizationLearner.userId,
      };

      organizationLearnerApi.get.withArgs(organizationLearner.id).resolves(organizationLearnerApiResponse);

      // when
      await organizationLearnerParticipationRepository.synchronize({
        organizationLearnerId: organizationLearner.id,
        moduleIds: ['1234-abcdef'],
        modulesApi,
        organizationLearnerApi,
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
        .withArgs({
          userId: organizationLearner.userId,
          moduleIds: ['1234', '4567'],
        })
        .resolves(moduleApiResponse);

      const organizationLearnerApiResponse = {
        id: organizationLearner.id,
        firstName: organizationLearner.firstName,
        lastName: organizationLearner.lastName,
        isDisabled: organizationLearner.isDisabled,
        userId: organizationLearner.userId,
      };

      organizationLearnerApi.get.withArgs(organizationLearner.id).resolves(organizationLearnerApiResponse);
      // when
      await organizationLearnerParticipationRepository.synchronize({
        organizationLearnerId: organizationLearner.id,
        moduleIds: ['1234', '4567'],
        modulesApi,
        organizationLearnerApi,
      });

      // then
      const result = await knex('organization_learner_participations').where({
        organizationLearnerId: organizationLearner.id,
      });

      expect(result).lengthOf(2);
    });
  });

  describe('#deleteCombinedCourseParticipationByCombinedCourseIdAndOrganizationLearnerId', function () {
    it('should delete the exact participation for the given learner id and combined course id', async function () {
      //given
      const organizationId = await databaseBuilder.factory.buildOrganization().id;

      const { userId } = await databaseBuilder.factory.buildMembership({
        organizationId,
      });
      const organizationLearnerId = await databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
      }).id;
      const otherOrganizationLearnerId = await databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
      }).id;
      const combinedCourseId = await databaseBuilder.factory.buildCombinedCourse({ organizationId }).id;

      await databaseBuilder.factory.buildOrganizationLearnerParticipation({
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        organizationLearnerId,
        combinedCourseId,
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
      });

      await databaseBuilder.factory.buildOrganizationLearnerParticipation({
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        organizationLearnerId: otherOrganizationLearnerId,
        combinedCourseId,
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
      });

      await databaseBuilder.commit();

      //when
      await organizationLearnerParticipationRepository.deleteCombinedCourseParticipationByCombinedCourseIdAndOrganizationLearnerId(
        {
          combinedCourseId,
          organizationLearnerId,
          userId,
        },
      );

      //then
      const deletedParticipation = await knex('organization_learner_participations').where({
        referenceId: combinedCourseId.toString(),
        organizationLearnerId,
      });
      const remainingParticipation = await knex('organization_learner_participations').where({
        referenceId: combinedCourseId.toString(),
        organizationLearnerId: otherOrganizationLearnerId,
      });

      expect(deletedParticipation[0].deletedAt).not.to.be.null;
      expect(deletedParticipation[0].deletedBy).to.equal(userId);
      expect(remainingParticipation[0].deletedAt).to.be.null;
      expect(remainingParticipation[0].deletedBy).to.be.null;
    });
  });
  describe('#deleteCombinedCourseParticipation', function () {
    it('should delete the exact participation', async function () {
      //given
      const { id: combinedCourseId } = await databaseBuilder.factory.buildCombinedCourse({ code: 'RANDOM' });
      const { id: otherCombinedCourseId } = await databaseBuilder.factory.buildCombinedCourse();

      const { userId } = await databaseBuilder.factory.buildMembership();

      await databaseBuilder.factory.buildOrganizationLearnerParticipation({
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        combinedCourseId,
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
      });

      await databaseBuilder.factory.buildOrganizationLearnerParticipation({
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        combinedCourseId: otherCombinedCourseId,
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
      });

      await databaseBuilder.commit();

      //when
      await organizationLearnerParticipationRepository.deleteCombinedCourseParticipations({
        combinedCourseIds: [combinedCourseId],
        userId,
      });

      //then
      const deletedParticipation = await knex('organization_learner_participations').where({
        referenceId: combinedCourseId.toString(),
      });
      const remainingParticipation = await knex('organization_learner_participations').where({
        referenceId: otherCombinedCourseId.toString(),
      });

      expect(deletedParticipation[0].deletedAt).not.to.be.null;
      expect(deletedParticipation[0].deletedBy).to.equal(userId);
      expect(remainingParticipation[0].deletedAt).to.be.null;
      expect(remainingParticipation[0].deletedBy).to.be.null;
    });
  });
});
