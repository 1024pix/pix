import sinon from 'sinon';

import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/constants.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { createTempFile, removeTempFile } from '../../../../tooling/test-utils/file.js';

describe('Integration | Organizational Entities | Domain | UseCase | add-organization-feature-in-batch', function () {
  let learnerImportFeature,
    campaignWithoutUserProfileFeature,
    filePath,
    userId,
    learnerImportOrganizationId,
    campaignWithoutUserProfileOrganizationId;

  beforeEach(async function () {
    userId = databaseBuilder.factory.buildUser().id;
    learnerImportFeature = databaseBuilder.factory.buildFeature({
      key: ORGANIZATION_FEATURE.LEARNER_IMPORT.key,
    });
    campaignWithoutUserProfileFeature = databaseBuilder.factory.buildFeature({
      key: ORGANIZATION_FEATURE.CAMPAIGN_WITHOUT_USER_PROFILE.key,
    });

    learnerImportOrganizationId = databaseBuilder.factory.buildOrganization().id;
    campaignWithoutUserProfileOrganizationId = databaseBuilder.factory.buildOrganization().id;

    await databaseBuilder.commit();
  });

  afterEach(async function () {
    await removeTempFile(filePath);
  });

  it('should register feature for right organization', async function () {
    // given
    filePath = await createTempFile(
      'test.csv',
      `Feature Name;Organization ID;Params
    ${learnerImportFeature.key};${learnerImportOrganizationId};{"id": 123}
    ${campaignWithoutUserProfileFeature.key};${campaignWithoutUserProfileOrganizationId};
`,
    );
    // when
    await usecases.addOrganizationFeatureInBatch({ userId, filePath });

    const result = await knex('organization-features');

    expect(result).lengthOf(2);
    //eslint-disable-next-line no-unused-vars
    expect(result.map(({ id, ...data }) => data)).deep.members([
      {
        featureId: learnerImportFeature.id,
        organizationId: learnerImportOrganizationId,
        params: { id: 123 },
      },
      {
        featureId: campaignWithoutUserProfileFeature.id,
        organizationId: campaignWithoutUserProfileOrganizationId,
        params: null,
      },
    ]);
  });

  describe('delete learner cases', function () {
    let activeOrganizationLearnerId, deletedOrganizationLearnerId;
    let oldUserDeletedLearnerId;
    let oldDeletedAt;
    let clock, now;

    beforeEach(async function () {
      now = new Date('2025-01-01');

      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
      oldDeletedAt = new Date('2024-12-12');

      oldUserDeletedLearnerId = databaseBuilder.factory.buildUser().id;
      activeOrganizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: learnerImportOrganizationId,
        deletedAt: null,
        deletedBy: null,
      }).id;
      deletedOrganizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: learnerImportOrganizationId,
        deletedAt: oldDeletedAt,
        deletedBy: oldUserDeletedLearnerId,
      }).id;

      await databaseBuilder.commit();
    });

    afterEach(function () {
      clock.restore();
    });

    it('should not delete learners without parameters', async function () {
      filePath = await createTempFile(
        'test.csv',
        `Feature Name;Organization ID;Params
      ${learnerImportFeature.key};${learnerImportOrganizationId};{"id": 123}
      ${campaignWithoutUserProfileFeature.key};${campaignWithoutUserProfileOrganizationId};
  `,
      );

      // when
      await usecases.addOrganizationFeatureInBatch({ userId, filePath });

      const activeLearners = await knex('organization-learners').whereNull('deletedAt');

      expect(activeLearners).lengthOf(1);
      expect(activeLearners[0].id).equal(activeOrganizationLearnerId);
    });

    it('should delete learners for organizationId given "Delete Learner" parameters to true', async function () {
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: campaignWithoutUserProfileOrganizationId,
        deletedAt: null,
        deletedBy: null,
      });

      await databaseBuilder.commit();

      filePath = await createTempFile(
        'test.csv',
        `"Feature Name";"Organization ID";"Params";"Delete Learner"
      ${learnerImportFeature.key};${learnerImportOrganizationId};{"id": 123};Y
      ${campaignWithoutUserProfileFeature.key};${campaignWithoutUserProfileOrganizationId};;
  `,
      );

      // when
      await usecases.addOrganizationFeatureInBatch({ userId, filePath });

      const deletedLearners = await knex('organization-learners').whereNotNull('deletedAt').orderBy('deletedAt', 'asc');

      expect(deletedLearners).lengthOf(2);
      expect(
        deletedLearners.map(({ id, deletedAt, deletedBy, organizationId }) => {
          return { id, deletedAt, deletedBy, organizationId };
        }),
      ).deep.members([
        {
          id: deletedOrganizationLearnerId,
          deletedAt: oldDeletedAt,
          deletedBy: oldUserDeletedLearnerId,
          organizationId: learnerImportOrganizationId,
        },
        {
          id: activeOrganizationLearnerId,
          deletedAt: now,
          deletedBy: userId,
          organizationId: learnerImportOrganizationId,
        },
      ]);
    });
  });
});
