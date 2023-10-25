import {
  buildLearners,
  buildSchoolOrganization,
  showSchools,
} from '../../../../src/school/scripts/create-school-learners.js';
import { databaseBuilder, expect, knex, sinon } from '../../../test-helper.js';
import { Organization } from '../../../../lib/domain/models/Organization.js';
import { logger } from '../../../../src/shared/infrastructure/utils/logger.js';

describe('Integration | Script | create school learners', function () {
  afterEach(async function () {
    await knex('organization-learners').delete();
    await knex('schools').delete();
    await knex('organizations').delete();
  });
  describe('#buildSchool', function () {
    it('should create a school with a code', async function () {
      const organization = await buildSchoolOrganization({ name: 'Bambino' });
      const school = await knex('schools').where({ organizationId: organization.id }).first();

      expect(organization).to.be.instanceOf(Organization);
      expect(organization.type).to.equal('SCO-1D');
      expect(school).to.exist;
    });
  });

  describe('#buildLearners', function () {
    it('should create 35 leaners', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();

      await buildLearners({ organizationId });

      const learners = await knex('organization-learners').where({ organizationId });
      expect(learners.length).to.equal(35);
    });
  });

  describe('#showSchools', function () {
    it('should display all SCO-1D schools information', async function () {
      sinon.stub(logger, 'info');

      const organization1 = databaseBuilder.factory.buildOrganization({ type: 'SCO-1D' });
      const organization2 = databaseBuilder.factory.buildOrganization({ type: 'SCO-1D' });
      databaseBuilder.factory.buildSchool({ code: 'TESTONS', organizationId: organization1.id });
      databaseBuilder.factory.buildSchool({ code: 'LAVIES789', organizationId: organization2.id });
      await databaseBuilder.commit();

      await showSchools();

      expect(logger.info).to.have.callCount(3);
      expect(logger.info).to.have.been.calledWith('code | organizationId | name');
      expect(logger.info).to.have.been.calledWith(`TESTONS | ${organization1.id} | ${organization1.name}`);
      expect(logger.info).to.have.been.calledWith(`LAVIES789 | ${organization2.id} | ${organization2.name}`);
    });
  });
});
