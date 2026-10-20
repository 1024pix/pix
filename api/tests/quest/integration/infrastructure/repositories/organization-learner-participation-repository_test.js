import { expect } from 'chai';
import dayjs from 'dayjs';
import sinon from 'sinon';

import { StatusesEnumValues } from '../../../../../src/devcomp/domain/models/module/UserModuleStatus.js';
import { CombinedCourseParticipationStatuses } from '../../../../../src/prescription/shared/domain/constants.ts';
import { CombinedCourseParticipation } from '../../../../../src/quest/domain/models/combined-course-participations/entities/CombinedCourseParticipation.js';
import {
  OrganizationLearnerParticipation,
  OrganizationLearnerParticipationStatuses,
  OrganizationLearnerParticipationTypes,
} from '../../../../../src/quest/domain/models/combined-course-participations/entities/OrganizationLearnerParticipation.js';
import * as organizationLearnerParticipationRepository from '../../../../../src/quest/infrastructure/repositories/combined-course-participations/organization-learner-participation-repository.js';
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
      sinon.useFakeTimers({ now, toFake: ['Date'] });
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

  describe('#saveCombinedCourseParticipation', function () {
    it('should insert organization learner participations of type combined course', async function () {
      //given
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse();

      await databaseBuilder.commit();

      //when
      await organizationLearnerParticipationRepository.saveCombinedCourseParticipation({
        organizationLearnerId,
        combinedCourseId,
      });

      //then
      const participations = await knex('organization_learner_participations')
        .select(
          'id as combinedCourseParticipationId',
          'referenceId as combinedCourseParticipationsCombinedCourseId',
          'status as combinedCourseParticipationStatus',
          'organizationLearnerId as combinedCourseParticipationsOrganizationLearnerId',
          'createdAt as combinedCourseParticipationsCreatedAt',
          'updatedAt as combinedCourseParticipationsUpdatedAt',
          'type',
        )
        .where({
          'organization_learner_participations.organizationLearnerId': organizationLearnerId,
          referenceId: combinedCourseId,
        });

      expect(participations).to.have.lengthOf(1);

      const participation = participations[0];

      expect(participation.combinedCourseParticipationsCombinedCourseId).equal(combinedCourseId.toString());
      expect(participation.combinedCourseParticipationStatus).equal(OrganizationLearnerParticipationStatuses.STARTED);
      expect(participation.type).equal(OrganizationLearnerParticipationTypes.COMBINED_COURSE);
      expect(participation.combinedCourseParticipationsOrganizationLearnerId).equal(organizationLearnerId);
    });

    it('should left intact combined course participation for given organization learner and combined course id', async function () {
      // given
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse();
      databaseBuilder.factory.buildOrganizationLearnerParticipation({
        organizationLearnerId,
        combinedCourseId,
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
      });
      await databaseBuilder.commit();

      // when
      await organizationLearnerParticipationRepository.saveCombinedCourseParticipation({ organizationLearnerId, combinedCourseId });

      // then
      const participations = await knex('organization_learner_participations').where({
        organizationLearnerId,
      });

      expect(participations).to.have.lengthOf(1);
      expect(participations[0].organizationLearnerId).to.deep.equal(organizationLearnerId);
      expect(participations[0].status).equal(OrganizationLearnerParticipationStatuses.COMPLETED);
      expect(participations[0].referenceId).equal(combinedCourseId.toString());
    });
  });

  describe('#findCombinedCourseParticipationById', function () {
    it('should return combined course participation for given participationId', async function () {
      // given
      const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner();
      const { id: participationId } = databaseBuilder.factory.buildOrganizationLearnerParticipation({
        organizationLearnerId,
        status: OrganizationLearnerParticipationStatuses.STARTED,
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
      });
      await databaseBuilder.commit();

      // when
      const result = await organizationLearnerParticipationRepository.findCombinedCourseParticipationById({ participationId });

      // then
      expect(result.id).equal(participationId);
      expect(result.organizationLearnerId).equal(organizationLearnerId);
    });

    it('should return null when participation does not have combined course type', async function () {
      // given
      const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner();
      const { id: participationId } = databaseBuilder.factory.buildOrganizationLearnerParticipation({
        organizationLearnerId,
        status: OrganizationLearnerParticipationStatuses.STARTED,
        type: OrganizationLearnerParticipationTypes.PASSAGE,
      });
      await databaseBuilder.commit();

      // when
      const result = await organizationLearnerParticipationRepository.findCombinedCourseParticipationById({ participationId });

      // then
      expect(result).null;
    });

    it('should return null when organization learner is deleted', async function () {
      // given
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
        deletedAt: new Date(),
        deletedBy: userId,
      });
      const { id: participationId } = databaseBuilder.factory.buildOrganizationLearnerParticipation({
        organizationLearnerId,
        status: OrganizationLearnerParticipationStatuses.STARTED,
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
      });
      await databaseBuilder.commit();

      // when
      const result = await organizationLearnerParticipationRepository.findCombinedCourseParticipationById({ participationId });

      // then
      expect(result).null;
    });

    it('should return null when participation has been deleted', async function () {
      // given
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner();
      const { id: participationId } = databaseBuilder.factory.buildOrganizationLearnerParticipation({
        organizationLearnerId,
        status: OrganizationLearnerParticipationStatuses.STARTED,
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        deletedAt: new Date(),
        deletedBy: userId,
      });

      // when
      const result = await organizationLearnerParticipationRepository.findCombinedCourseParticipationById({ participationId });

      // then
      expect(result).null;
    });

    it('should return null when participation does not exist', async function () {
      // when
      const result = await organizationLearnerParticipationRepository.findCombinedCourseParticipationById({ participationId: 12 });

      // then
      expect(result).null;
    });
  });

  describe('#isParticipationOnCombinedCourse', function () {
    it('should return true if participation is on combined course', async function () {
      // given
      const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse();
      const { id: participationId } = databaseBuilder.factory.buildOrganizationLearnerParticipation({
        combinedCourseId,
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        status: OrganizationLearnerParticipationStatuses.STARTED,
      });
      await databaseBuilder.commit();

      // when
      const result = await organizationLearnerParticipationRepository.isParticipationOnCombinedCourse({
        combinedCourseId,
        participationId,
      });

      // then
      expect(result).true;
    });

    it('should return false if participation is not on combined course', async function () {
      // given
      const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse();
      const { id: participationId } = databaseBuilder.factory.buildOrganizationLearnerParticipation({
        combinedCourseId: '123',
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        status: OrganizationLearnerParticipationStatuses.STARTED,
      });
      await databaseBuilder.commit();

      // when
      const result = await organizationLearnerParticipationRepository.isParticipationOnCombinedCourse({
        combinedCourseId,
        participationId,
      });

      // then
      expect(result).false;
    });

    it('should return false if participation is not of COMBINED_COURSE type', async function () {
      // given
      const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse();
      const { id: participationId } = databaseBuilder.factory.buildOrganizationLearnerParticipation({
        combinedCourseId,
        type: OrganizationLearnerParticipationTypes.PASSAGE,
        status: OrganizationLearnerParticipationStatuses.STARTED,
      });
      await databaseBuilder.commit();

      // when
      const result = await organizationLearnerParticipationRepository.isParticipationOnCombinedCourse({
        combinedCourseId,
        participationId,
      });

      // then
      expect(result).false;
    });
  });

  describe('#findByLearnerId', function () {
    it('should return combinedCourse participation for given learnerId and combinedCourse ids', async function () {
      // given
      const { id: organizationLearnerId, organizationId } = databaseBuilder.factory.buildOrganizationLearner();
      const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({ organizationId });
      const expectedCombinedCourseParticipation = databaseBuilder.factory.buildOrganizationLearnerParticipation({
        organizationLearnerId,
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        createdAt: new Date('2025-01-01'),
        combinedCourseId,
      });
      databaseBuilder.factory.buildOrganizationLearnerParticipation({
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        createdAt: new Date('2024-01-01'),
        combinedCourseId,
      });
      await databaseBuilder.commit();

      // when
      const result = await organizationLearnerParticipationRepository.findByLearnerId({
        organizationLearnerId,
        combinedCourseId,
      });

      // then
      expect(result).instanceOf(OrganizationLearnerParticipation);
      expect(result.id).equal(expectedCombinedCourseParticipation.id);
      expect(result.referenceId).equal(combinedCourseId.toString());
      expect(result.organizationLearnerId).equal(organizationLearnerId);
      expect(result.status).equal(OrganizationLearnerParticipationStatuses.COMPLETED);
    });

    it('should return null when participation is not found', async function () {
      // given
      const organizationLearnerId = 1;
      const combinedCourseId = 2;

      // when
      const result = await organizationLearnerParticipationRepository.findByLearnerId({
        organizationLearnerId,
        combinedCourseId,
      });

      // then
      expect(result).null;
    });
  });

  describe('#findByLearnerIds', function () {
    it('should return most recent combinedCourse participation for given learnerIds and combinedCourse ids', async function () {
      // given
      const firstLearner = databaseBuilder.factory.buildOrganizationLearner();
      const secondLearner = databaseBuilder.factory.buildOrganizationLearner();

      const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({
        organizationId: firstLearner.organizationId,
        code: 'COMBINIX1',
      });
      const expectedCombinedCourseParticipation = databaseBuilder.factory.buildOrganizationLearnerParticipation({
        organizationLearnerId: firstLearner.id,
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        createdAt: new Date('2025-01-01'),
        combinedCourseId,
      });
      databaseBuilder.factory.buildOrganizationLearnerParticipation({
        organizationLearnerId: firstLearner.id,
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        createdAt: new Date('2024-01-01'),
        combinedCourseId,
      });

      const secondCombinedCourseParticipation = databaseBuilder.factory.buildOrganizationLearnerParticipation({
        organizationLearnerId: secondLearner.id,
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        createdAt: new Date('2025-01-01'),
        combinedCourseId,
      });

      await databaseBuilder.commit();

      // when
      const result = await organizationLearnerParticipationRepository.findByLearnerIds({
        organizationLearnerIds: [firstLearner.id, secondLearner.id],
        combinedCourseId,
      });

      // then
      const combinedCourseParticipationForFirstLearner = result.find(
        (participation) => participation.organizationLearnerId === firstLearner.id,
      );

      expect(combinedCourseParticipationForFirstLearner).instanceOf(OrganizationLearnerParticipation);

      expect(combinedCourseParticipationForFirstLearner).to.deep.include({
        id: expectedCombinedCourseParticipation.id,
        referenceId: combinedCourseId.toString(),
        organizationLearnerId: firstLearner.id,
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
        createdAt: expectedCombinedCourseParticipation.createdAt,
        updatedAt: expectedCombinedCourseParticipation.updatedAt,
      });

      const combinedCourseParticipationForSecondLearner = result.find(
        (participation) => participation.organizationLearnerId === secondLearner.id,
      );

      expect(combinedCourseParticipationForSecondLearner).instanceOf(OrganizationLearnerParticipation);
      expect(combinedCourseParticipationForSecondLearner).to.deep.include({
        id: secondCombinedCourseParticipation.id,
        referenceId: combinedCourseId.toString(),
        organizationLearnerId: secondLearner.id,
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
        createdAt: secondCombinedCourseParticipation.createdAt,
        updatedAt: secondCombinedCourseParticipation.updatedAt,
      });
    });

    it('should return an empty array when there are no participation', async function () {
      // given
      const organizationLearnerId = 1;
      const combinedCourseId = 2;

      // when
      const result = await organizationLearnerParticipationRepository.findByLearnerIds({
        organizationLearnerIds: [organizationLearnerId],
        combinedCourseId,
      });

      // then
      expect(result).empty;
    });
  });

  describe('#findPaginatedCombinedCourseParticipationById', function () {
    let combinedCourseId;
    let organizationLearner1, organizationLearner2, organizationLearner3, organizationLearner4;

    beforeEach(async function () {
      //given
      const combinedCourse = databaseBuilder.factory.buildCombinedCourse();
      combinedCourseId = combinedCourse.id;

      organizationLearner1 = databaseBuilder.factory.buildOrganizationLearner({
        firstName: 'Georges',
        lastName: 'Zelio',
        division: '6eme',
        group: null,
        organizationId: combinedCourse.organizationId,
      });
      organizationLearner2 = databaseBuilder.factory.buildOrganizationLearner({
        firstName: 'Loubna',
        lastName: 'Aresto',
        division: '6eme',
        group: null,
        organizationId: combinedCourse.organizationId,
      });
      organizationLearner3 = databaseBuilder.factory.buildOrganizationLearner({
        userId: null,
        firstName: 'Nour',
        lastName: 'Aresto',
        division: null,
        group: 'A',
        organizationId: combinedCourse.organizationId,
      });

      organizationLearner4 = databaseBuilder.factory.buildOrganizationLearner({
        userId: null,
        firstName: 'Abc',
        lastName: 'Def',
        division: null,
        group: 'A',
        organizationId: combinedCourse.organizationId,
      });

      databaseBuilder.factory.buildOrganizationLearnerParticipation({
        organizationLearnerId: organizationLearner1.id,
        combinedCourseId,
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        status: OrganizationLearnerParticipationStatuses.STARTED,
      });
      databaseBuilder.factory.buildOrganizationLearnerParticipation({
        organizationLearnerId: organizationLearner2.id,
        combinedCourseId,
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        status: OrganizationLearnerParticipationStatuses.STARTED,
      });
      databaseBuilder.factory.buildOrganizationLearnerParticipation({
        organizationLearnerId: organizationLearner3.id,
        combinedCourseId,
        status: CombinedCourseParticipationStatuses.COMPLETED,
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
      });

      const { id: anotherCombinedCourseId } = databaseBuilder.factory.buildCombinedCourse({
        organizationId: combinedCourse.organizationId,
        code: 'anotherQuest',
      });
      databaseBuilder.factory.buildOrganizationLearnerParticipation({
        organizationLearnerId: organizationLearner1.id,
        combinedCourseId: anotherCombinedCourseId,
        status: CombinedCourseParticipationStatuses.COMPLETED,
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
      });

      databaseBuilder.factory.buildOrganizationLearnerParticipation({
        organizationLearnerId: organizationLearner4.id,
        combinedCourseId,
        status: CombinedCourseParticipationStatuses.COMPLETED,
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        deletedAt: new Date(),
      });

      await databaseBuilder.commit();
    });

    it('should return user ids only for given combinedCourse id', async function () {
      // when
      const { organizationLearners } =
        await organizationLearnerParticipationRepository.findPaginatedCombinedCourseParticipationById({
          combinedCourseId,
        });

      // then
      expect(organizationLearners).deep.equal([
        { id: organizationLearner2.id, userId: organizationLearner2.userId },
        { id: organizationLearner3.id, userId: organizationLearner3.userId },
        { id: organizationLearner1.id, userId: organizationLearner1.userId },
      ]);
    });

    it('should return paginated user ids', async function () {
      // when
      const { organizationLearners } =
        await organizationLearnerParticipationRepository.findPaginatedCombinedCourseParticipationById({
          combinedCourseId,
          page: { size: 1, number: 3 },
        });
      // then
      expect(organizationLearners).deep.equal([{ id: organizationLearner1.id, userId: organizationLearner1.userId }]);
    });

    it('should not return deleted participations to combined course', async function () {
      const { organizationLearners } =
        await organizationLearnerParticipationRepository.findPaginatedCombinedCourseParticipationById({ combinedCourseId });
      expect(organizationLearners).to.not.include({ id: organizationLearner4.id, userId: organizationLearner4.userId });
    });

    describe('filters', function () {
      it('should return participations even with empty filters', async function () {
        // when
        const { organizationLearners } =
          await organizationLearnerParticipationRepository.findPaginatedCombinedCourseParticipationById({
            combinedCourseId,
            filters: {},
          });

        // then
        expect(organizationLearners).deep.equal([
          { id: organizationLearner2.id, userId: organizationLearner2.userId },
          { id: organizationLearner3.id, userId: organizationLearner3.userId },
          { id: organizationLearner1.id, userId: organizationLearner1.userId },
        ]);
      });

      it('should return participation matching learner lastName', async function () {
        // when
        const { organizationLearners } =
          await organizationLearnerParticipationRepository.findPaginatedCombinedCourseParticipationById({
            combinedCourseId,
            filters: { fullName: 'are' },
          });

        // then
        expect(organizationLearners).deep.equal([
          { id: organizationLearner2.id, userId: organizationLearner2.userId },
          { id: organizationLearner3.id, userId: organizationLearner3.userId },
        ]);
      });

      it('should return participation matching learner firstName', async function () {
        // when
        const { organizationLearners } =
          await organizationLearnerParticipationRepository.findPaginatedCombinedCourseParticipationById({
            combinedCourseId,
            filters: { fullName: 'GEO' },
          });

        // then
        expect(organizationLearners).deep.equal([{ id: organizationLearner1.id, userId: organizationLearner1.userId }]);
      });

      it('should return participation matching participation status', async function () {
        // when
        const { organizationLearners } =
          await organizationLearnerParticipationRepository.findPaginatedCombinedCourseParticipationById({
            combinedCourseId,
            filters: { statuses: [CombinedCourseParticipationStatuses.STARTED] },
          });

        // then
        expect(organizationLearners).deep.equal([
          { id: organizationLearner2.id, userId: organizationLearner2.userId },
          { id: organizationLearner1.id, userId: organizationLearner1.userId },
        ]);
      });

      it('should return participations even with empty status filter', async function () {
        // when
        const { organizationLearners } =
          await organizationLearnerParticipationRepository.findPaginatedCombinedCourseParticipationById({
            combinedCourseId,
            filters: { statuses: [] },
          });

        // then
        expect(organizationLearners).deep.equal([
          { id: organizationLearner2.id, userId: organizationLearner2.userId },
          { id: organizationLearner3.id, userId: organizationLearner3.userId },
          { id: organizationLearner1.id, userId: organizationLearner1.userId },
        ]);
      });

      it('should return participations matching learner division', async function () {
        // when
        const { organizationLearners } =
          await organizationLearnerParticipationRepository.findPaginatedCombinedCourseParticipationById({
            combinedCourseId,
            filters: { divisions: ['6eme'] },
          });

        // then
        expect(organizationLearners).deep.equal([
          { id: organizationLearner2.id, userId: organizationLearner2.userId },
          { id: organizationLearner1.id, userId: organizationLearner1.userId },
        ]);
      });

      it('should return participations even with empty division filter', async function () {
        // when
        const { organizationLearners } =
          await organizationLearnerParticipationRepository.findPaginatedCombinedCourseParticipationById({
            combinedCourseId,
            filters: { divisions: [] },
          });

        // then
        expect(organizationLearners).deep.equal([
          { id: organizationLearner2.id, userId: organizationLearner2.userId },
          { id: organizationLearner3.id, userId: organizationLearner3.userId },
          { id: organizationLearner1.id, userId: organizationLearner1.userId },
        ]);
      });

      it('should return participations matching learner group', async function () {
        // when
        const { organizationLearners } =
          await organizationLearnerParticipationRepository.findPaginatedCombinedCourseParticipationById({
            combinedCourseId,
            filters: { groups: ['A'] },
          });

        // then
        expect(organizationLearners).deep.equal([{ id: organizationLearner3.id, userId: organizationLearner3.userId }]);
      });

      it('should return participations even with empty group filter', async function () {
        // when
        const { organizationLearners } =
          await organizationLearnerParticipationRepository.findPaginatedCombinedCourseParticipationById({
            combinedCourseId,
            filters: { groups: [] },
          });

        // then
        expect(organizationLearners).deep.equal([
          { id: organizationLearner2.id, userId: organizationLearner2.userId },
          { id: organizationLearner3.id, userId: organizationLearner3.userId },
          { id: organizationLearner1.id, userId: organizationLearner1.userId },
        ]);
      });
    });
  });

  describe('#update', function () {
    const now = new Date('2025-07-07');

    beforeEach(function () {
      sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    it('should update only given field', async function () {
      //given
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse();
      const combinedCourseParticipationFromDB = databaseBuilder.factory.buildOrganizationLearnerParticipation({
        organizationLearnerId,
        status: OrganizationLearnerParticipationStatuses.STARTED,
        createdAt: new Date('2022-01-01'),
        updatedAt: new Date('2022-02-01'),
        combinedCourseId,
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        referenceId: combinedCourseId.toString(),
      });

      await databaseBuilder.commit();

      //when

      await organizationLearnerParticipationRepository.update({
        id: combinedCourseParticipationFromDB.id,
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
      });

      const updatedParticipation = await knex('organization_learner_participations')
        .where({
          id: combinedCourseParticipationFromDB.id,
        })
        .first();

      //then
      expect(updatedParticipation.id).to.equal(combinedCourseParticipationFromDB.id);
      expect(updatedParticipation.organizationLearnerId).to.equal(
        combinedCourseParticipationFromDB.organizationLearnerId,
      );
      expect(updatedParticipation.type).to.equal(OrganizationLearnerParticipationTypes.COMBINED_COURSE);
      expect(updatedParticipation.referenceId).to.equal(combinedCourseId.toString());
      expect(updatedParticipation.updatedAt).to.deep.equal(new Date('2022-02-01'));
      expect(updatedParticipation.createdAt).to.deep.equal(new Date('2022-01-01'));

      expect(updatedParticipation.status).to.deep.equal(OrganizationLearnerParticipationStatuses.COMPLETED);
    });
  });

  describe('#findByCombinedCourseIds', function () {
    it('should return a list of participations for given combinedCourse ids', async function () {
      // given
      const { id: combinedCourseId1, organizationId } = databaseBuilder.factory.buildCombinedCourse({
        code: 'COMBI1',
      });
      const { id: combinedCourseId2 } = databaseBuilder.factory.buildCombinedCourse({
        code: 'COMBI2',
        organizationId,
      });
      const { id: combinedCourseId3 } = databaseBuilder.factory.buildCombinedCourse({
        code: 'COMBI3',
      });

      const learner1 = databaseBuilder.factory.buildOrganizationLearner({
        firstName: 'Alice',
        lastName: 'Azerty',
        division: '6eme',
        group: 'Groupe 2',
        organizationId,
      });
      const learner2 = databaseBuilder.factory.buildOrganizationLearner({
        firstName: 'Bob',
        lastName: 'Bernard',
        division: '6eme',
        group: 'Groupe 2',
        organizationId,
      });

      databaseBuilder.factory.buildOrganizationLearnerParticipation({
        organizationLearnerId: learner1.id,
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
        combinedCourseId: combinedCourseId1,
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
      });
      databaseBuilder.factory.buildOrganizationLearnerParticipation({
        organizationLearnerId: learner2.id,
        status: OrganizationLearnerParticipationStatuses.STARTED,
        combinedCourseId: combinedCourseId2,
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
      });
      // Participation that should not be included
      databaseBuilder.factory.buildOrganizationLearnerParticipation({
        organizationLearnerId: learner1.id,
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
        combinedCourseId: combinedCourseId3,
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
      });

      await databaseBuilder.commit();

      // when
      const combinedCourseParticipations = await organizationLearnerParticipationRepository.findByCombinedCourseIds({
        combinedCourseIds: [combinedCourseId1, combinedCourseId2],
      });

      // then
      expect(combinedCourseParticipations).lengthOf(2);
      expect(combinedCourseParticipations[0]).instanceOf(CombinedCourseParticipation);
      expect(combinedCourseParticipations[1]).instanceOf(CombinedCourseParticipation);
      expect(combinedCourseParticipations[0].status).to.deep.equal(OrganizationLearnerParticipationStatuses.COMPLETED);
      expect(combinedCourseParticipations[1].status).to.deep.equal(OrganizationLearnerParticipationStatuses.STARTED);
    });

    it('should return empty array when no participations match the combinedCourse ids', async function () {
      // given
      const { id: combinedCourseId1 } = databaseBuilder.factory.buildCombinedCourse({ code: 'COMBI1' });
      const { id: combinedCourseId2 } = databaseBuilder.factory.buildCombinedCourse({ code: 'COMBI2' });
      await databaseBuilder.commit();

      // when
      const combinedCourseParticipations = await organizationLearnerParticipationRepository.findByCombinedCourseIds({
        combinedCourseIds: [combinedCourseId1, combinedCourseId2],
      });

      // then
      expect(combinedCourseParticipations).to.deep.equal([]);
    });

    it('should not return participations for deleted organisation learner', async function () {
      // given
      const { id: combinedCourseId, organizationId } = databaseBuilder.factory.buildCombinedCourse({
        code: 'COMBI1',
      });

      const deletedLearner = databaseBuilder.factory.buildOrganizationLearner({
        firstName: 'Deleted',
        lastName: 'Learner',
        organizationId,
        deletedAt: new Date('2024-01-01'),
      });

      databaseBuilder.factory.buildOrganizationLearnerParticipation({
        organizationLearnerId: deletedLearner.id,
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
        combinedCourseId,
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
      });

      await databaseBuilder.commit();

      // when
      const combinedCourseParticipations = await organizationLearnerParticipationRepository.findByCombinedCourseIds({
        combinedCourseIds: [combinedCourseId],
      });

      // then
      expect(combinedCourseParticipations).to.deep.equal([]);
    });

    it('should not return deleted participations', async function () {
      // given
      const { id: combinedCourseId, organizationId } = databaseBuilder.factory.buildCombinedCourse({
        code: 'COMBI1',
      });

      const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
        firstName: 'Alice',
        lastName: 'Azerty',
        division: '6eme',
        group: 'Groupe 2',
        organizationId,
      });

      databaseBuilder.factory.buildOrganizationLearnerParticipation({
        organizationLearnerId,
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
        combinedCourseId,
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        deletedAt: new Date(),
      });

      await databaseBuilder.commit();

      // when
      const combinedCourseParticipations = await organizationLearnerParticipationRepository.findByCombinedCourseIds({
        combinedCourseIds: [combinedCourseId],
      });

      // then
      expect(combinedCourseParticipations.length).to.equal(0);
    });
  });
});
