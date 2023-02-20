import { expect, databaseBuilder, knex } from '../../../test-helper';
import { hideSkills } from '../../../../scripts/prod/hide-skills-in-csv-export';

describe('hideSkills', function () {
  it('should update showSkills to false', async function () {
    databaseBuilder.factory.buildOrganization({ showSkills: true });
    await databaseBuilder.commit();

    await hideSkills();

    const { showSkills } = await knex('organizations').first();

    expect(showSkills).to.be.false;
  });

  it('should not update showSkills', async function () {
    databaseBuilder.factory.buildOrganization({ showSkills: false });
    await databaseBuilder.commit();

    await hideSkills();

    const { showSkills } = await knex('organizations').first();

    expect(showSkills).to.be.false;
  });
});
