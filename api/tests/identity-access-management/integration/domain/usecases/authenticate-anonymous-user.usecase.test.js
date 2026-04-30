import { UserCantBeCreatedError } from '../../../../../src/identity-access-management/domain/errors.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

describe('Integration | Identity Access Management | Domain | UseCase | authenticateAnonymousUser', function () {
  const lang = 'en';
  const audience = 'https://app.pix.fr';
  const locale = 'fr-FR';

  it('creates an anonymous user for simplified access campaign', async function () {
    // given
    const targetProfile = databaseBuilder.factory.buildTargetProfile({ isSimplifiedAccess: true });
    const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
    await databaseBuilder.commit();

    // when
    const accessToken = await usecases.authenticateAnonymousUser({
      campaignCode: campaign.code,
      audience,
      locale,
      lang,
    });

    // then
    expect(accessToken).to.be.a('string');

    const user = await knex('users').where({ isAnonymous: true }).first();
    expect(user.firstName).to.equal('');
    expect(user.lastName).to.equal('');
    expect(user.lang).to.equal(lang);
    expect(user.locale).to.equal(locale);
    expect(user.cgu).to.be.false;
    expect(user.isAnonymous).to.be.true;
    expect(user.hasSeenAssessmentInstructions).to.be.false;
  });

  context('when campaign is not simplified access', function () {
    it('throws a UserCantBeCreatedError', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ isSimplifiedAccess: false });
      const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
      await databaseBuilder.commit();

      // when
      const promise = usecases.authenticateAnonymousUser({ campaignCode: campaign.code, audience, lang });

      // then
      await expect(promise).to.be.rejectedWith(UserCantBeCreatedError);
    });
  });
});
