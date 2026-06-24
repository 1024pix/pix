import { CombinedCoursesDisabledError } from '../../../../../src/quest/domain/errors.js';
import { VerifiedCode } from '../../../../../src/quest/domain/models/prescription/value-objects/VerifiedCode.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { featureToggles } from '../../../../../src/shared/infrastructure/feature-toggles/index.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Quest | Integration | Domain | Usecases | getVerifiedCode', function () {
  it('it returns verified code for a campaign', async function () {
    const campaign = databaseBuilder.factory.buildCampaign();
    await databaseBuilder.commit();

    const verifiedCode = await usecases.getVerifiedCode({ code: campaign.code });

    expect(verifiedCode).to.be.instanceOf(VerifiedCode);
    expect(verifiedCode.id).to.equal(campaign.code);
    expect(verifiedCode.type).to.be.equal('campaign');
  });

  it('it returns verified code for a combined course', async function () {
    const organizationId = databaseBuilder.factory.buildOrganization().id;
    const quest = databaseBuilder.factory.buildCombinedCourse({
      name: 'Combinix',
      code: 'COMBINIX1',
      organizationId,
    });
    await databaseBuilder.commit();

    const verifiedCode = await usecases.getVerifiedCode({ code: quest.code });

    expect(verifiedCode).to.be.instanceOf(VerifiedCode);
    expect(verifiedCode.id).to.equal(quest.code);
    expect(verifiedCode.type).to.equal('combined-course');
  });

  it('it throws a NotFoundError when the provided code is not linked to a campaign nor a quest', async function () {
    const err = await catchErr(usecases.getVerifiedCode)({
      code: 'NOCAMPAIGN',
    });

    expect(err).to.be.instanceOf(NotFoundError);
  });
  context('when combined courses are disabled by feature toggle', function () {
    beforeEach(async function () {
      await featureToggles.set('areCombinedCoursesEnabled', false);
    });
    it('when the code is correct, it should return a CombinedCourseDisabledError', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const quest = databaseBuilder.factory.buildCombinedCourse({
        name: 'Combinix',
        code: 'COMBINIX1',
        organizationId,
      });
      await databaseBuilder.commit();

      const err = await catchErr(usecases.getVerifiedCode)({ code: quest.code });

      expect(err).to.be.instanceOf(CombinedCoursesDisabledError);
    });
  });
});
