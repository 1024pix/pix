import _ from 'lodash';

import { createServer } from '../../../../server.js';
import { ORGANIZATION_FEATURE } from '../../../../src/shared/constants.js';
import { expect } from '../../../test-helper.js';
import { databaseBuilder } from '../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../tooling/test-utils/http-server.js';

describe('Acceptance | Team | Application | Controller | prescriber-informations', function () {
  let user;
  let organization;
  let membership;
  let userOrgaSettingsId;
  let options;
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  function createExpectedPrescriber({ user, membership, userOrgaSettingsId, organization }) {
    return {
      data: {
        type: 'prescribers',
        attributes: {
          'first-name': user.firstName,
          'last-name': user.lastName,
          'pix-orga-terms-of-service-status': 'requested',
          'pix-orga-terms-of-service-document-path': null,
          'are-new-year-organization-learners-imported': false,
          'participant-count': 0,
          lang: user.lang,
          features: {
            [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: { active: false, params: null },
            [ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: { active: false, params: null },
          },
        },
        relationships: {
          memberships: {
            data: [
              {
                id: membership.id.toString(),
                type: 'memberships',
              },
            ],
          },
          'user-orga-settings': {
            data: {
              id: userOrgaSettingsId.toString(),
              type: 'userOrgaSettings',
            },
          },
        },
      },
      included: [
        {
          id: organization.id.toString(),
          type: 'organizations',
          attributes: {
            credit: organization.credit,
            'external-id': organization.externalId,
            'is-managing-students': organization.isManagingStudents,
            name: organization.name,
            type: organization.type,
          },
          relationships: {
            'combined-courses': {
              links: {
                related: `/api/organizations/${organization.id}/combined-courses`,
              },
            },
            'combined-course-blueprints': {
              links: {
                related: `/api/organizations/${organization.id}/combined-course-blueprints`,
              },
            },
            divisions: {
              links: {
                related: `/api/organizations/${organization.id}/divisions`,
              },
            },
            memberships: {
              links: {
                related: `/api/organizations/${organization.id}/memberships`,
              },
            },
            groups: {
              links: {
                related: `/api/organizations/${organization.id}/groups`,
              },
            },
            'organization-invitations': {
              links: {
                related: `/api/organizations/${organization.id}/invitations`,
              },
            },
            'participation-statistics': {
              links: {
                related: `/api/organizations/${organization.id}/participation-statistics`,
              },
            },
            'target-profiles': {
              links: {
                related: `/api/organizations/${organization.id}/target-profiles`,
              },
            },
            'learner-filters-options': {
              links: {
                related: `/api/organizations/${organization.id}/organization-learners/filters`,
              },
            },
          },
        },
        {
          id: membership.id.toString(),
          type: 'memberships',
          attributes: {
            'organization-role': membership.organizationRole,
          },
          relationships: {
            organization: {
              data: {
                id: organization.id.toString(),
                type: 'organizations',
              },
            },
          },
        },
        {
          id: userOrgaSettingsId.toString(),
          type: 'userOrgaSettings',
          attributes: {
            user: undefined,
          },
          relationships: {
            organization: {
              data: {
                id: organization.id.toString(),
                type: 'organizations',
              },
            },
          },
        },
      ],
    };
  }

  describe('GET /api/prescription/prescribers/:id', function () {
    beforeEach(async function () {
      user = databaseBuilder.factory.buildUser();
      organization = databaseBuilder.factory.buildOrganization({
        credit: 5,
        isManagingStudents: true,
      });
      membership = databaseBuilder.factory.buildMembership({ organizationId: organization.id, userId: user.id });
      userOrgaSettingsId = databaseBuilder.factory.buildUserOrgaSettings({
        currentOrganizationId: organization.id,
        userId: user.id,
      }).id;
      databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT);
      databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY);
      await databaseBuilder.commit();

      options = {
        method: 'GET',
        url: `/api/prescription/prescribers/${user.id}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
      };
    });

    describe('Resource access management', function () {
      it('should respond with a 401 - unauthorized access - if user is not authenticated', async function () {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if requested user is not the same as authenticated user', async function () {
        // given
        const otherUserId = 9999;
        options.headers = generateAuthenticatedUserRequestHeaders({ userId: otherUserId });

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('Success case', function () {
      it('should 200 HTTP status code', async function () {
        // given
        const expectedPrescriber = createExpectedPrescriber({ user, membership, userOrgaSettingsId, organization });

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(_.omit(response.result, ['data.id'])).to.deep.equal(expectedPrescriber);
      });
    });
  });
});
