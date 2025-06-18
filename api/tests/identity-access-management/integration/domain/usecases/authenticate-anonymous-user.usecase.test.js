import { UserCantBeCreatedError } from '../../../../../src/identity-access-management/domain/errors.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { anonymousUserTokenRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/anonymous-user-token.repository.js';
import { databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Integration | Identity Access Management | Domain | UseCase | anonymousUserTokenRepository', function () {
  const lang = 'en';
  const audience = 'https://app.pix.fr';

  it('creates an anonymous user for simplified access campaign', async function () {
    // given
    const targetProfile = databaseBuilder.factory.buildTargetProfile({ isSimplifiedAccess: true });
    const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
    await databaseBuilder.commit();

    // when
    const accessToken = await usecases.authenticateAnonymousUser({ campaignCode: campaign.code, audience, lang });

    // then
    expect(accessToken).to.be.a('string');

    const user = await knex('users').where({ isAnonymous: true }).first();
    expect(user.firstName).to.equal('');
    expect(user.lastName).to.equal('');
    expect(user.lang).to.equal(lang);
    expect(user.cgu).to.be.false;
    expect(user.isAnonymous).to.be.true;
    expect(user.hasSeenAssessmentInstructions).to.be.false;

    const anonymousUserToken = await anonymousUserTokenRepository.find(user.id);
    expect(anonymousUserToken).to.be.a('string');
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
