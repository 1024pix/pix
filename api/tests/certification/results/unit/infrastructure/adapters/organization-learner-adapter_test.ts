import { expect } from 'chai';
import type { SinonStub } from 'sinon';
import sinon from 'sinon';

import * as organizationLearnerAdapter from '../../../../../../src/certification/results/infrastructure/adapters/organization-learner-adapter.ts';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Results | Unit | Adapter | Organization learner', function () {
  type OrganizationLearnerApiStub = {
    findByDivisions: SinonStub;
  };

  let organizationLearnerApi: OrganizationLearnerApiStub;
  let dependencies: { organizationLearnerApi: typeof organizationLearnerApi };

  beforeEach(function () {
    organizationLearnerApi = {
      findByDivisions: sinon.stub(),
    };

    dependencies = {
      organizationLearnerApi,
    };
  });

  context('#findInOrganizationByDivision', function () {
    context('when no learners found', function () {
      it('returns an empty array', async function () {
        organizationLearnerApi.findByDivisions
          .withArgs({ organizationId: 123, divisions: ['3èmeC'] })
          .resolves({ organizationLearners: [] });

        const learners = await organizationLearnerAdapter.findInOrganizationByDivision({
          organizationId: 123,
          division: '3èmeC',
          dependencies,
        });

        expect(learners).to.deep.equal([]);
      });
    });

    context('when learners found', function () {
      it('returns Learners', async function () {
        organizationLearnerApi.findByDivisions.withArgs({ organizationId: 123, divisions: ['3èmeC'] }).resolves({
          organizationLearners: [
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            domainBuilder.certification.results.buildLearner({ id: 1 }),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            domainBuilder.certification.results.buildLearner({ id: 2 }),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            domainBuilder.certification.results.buildLearner({ id: 3 }),
          ],
        });

        const learners = await organizationLearnerAdapter.findInOrganizationByDivision({
          organizationId: 123,
          division: '3èmeC',
          dependencies,
        });

        expect(learners).to.deep.equal([
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
          domainBuilder.certification.results.buildLearner({ id: 1 }),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
          domainBuilder.certification.results.buildLearner({ id: 2 }),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
          domainBuilder.certification.results.buildLearner({ id: 3 }),
        ]);
      });
    });
  });
});
