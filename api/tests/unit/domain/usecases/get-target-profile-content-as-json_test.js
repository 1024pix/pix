const { expect, sinon, catchErr, domainBuilder, MockDate } = require('../../../test-helper');
const { ForbiddenAccess } = require('../../../../lib/domain/errors');
const getTargetProfileContentAsJson = require('../../../../lib/domain/usecases/get-target-profile-content-as-json');

describe('Unit | UseCase | get-target-profile-content-as-json', function () {
  let targetProfileForAdminRepository;
  let adminMemberRepository;

  afterEach(function () {
    MockDate.reset();
  });

  context('when the user does not have the authorization to get the content', function () {
    beforeEach(function () {
      targetProfileForAdminRepository = { getAsNewFormat: sinon.stub() };
      targetProfileForAdminRepository.getAsNewFormat.rejects(new Error('I should not be called'));
    });

    it('should throw a ForbiddenAccess error', async function () {
      // given
      const certifMember = domainBuilder.buildAdminMember.withRoleCertif({ userId: 66 });
      adminMemberRepository = { get: sinon.stub().withArgs({ userId: 66 }).resolves(certifMember) };

      // when
      const error = await catchErr(getTargetProfileContentAsJson)({
        userId: 66,
        targetProfileId: 123,
        adminMemberRepository,
        targetProfileForAdminRepository,
      });

      // then
      expect(error).to.be.instanceOf(ForbiddenAccess);
      expect(error.message).to.equal("L'utilisateur n'est pas autorisé à effectuer cette opération.");
    });
  });
  context('when the user has the authorization to get the content', function () {
    beforeEach(function () {
      MockDate.set(new Date('2020-12-01'));
      const area = domainBuilder.buildArea({ id: 'recArea' });
      const targetProfileForAdmin = domainBuilder.buildTargetProfileForAdmin({
        name: 'Profil Rentrée scolaire',
        areas: [area],
        competences: [domainBuilder.buildCompetence({ id: 'recCompetence', area })],
        thematics: [
          domainBuilder.buildThematic({ id: 'recThematic1', competenceId: 'recCompetence' }),
          domainBuilder.buildThematic({ id: 'recThematic2', competenceId: 'recCompetence' }),
        ],
        tubesWithLevelThematicMobileAndTablet: [
          {
            ...domainBuilder.buildTube({ id: 'recTube1' }),
            thematicId: 'recThematic1',
            level: 8,
          },
          {
            ...domainBuilder.buildTube({ id: 'recTube3' }),
            thematicId: 'recThematic2',
            level: 1,
          },
          {
            ...domainBuilder.buildTube({ id: 'recTube2' }),
            thematicId: 'recThematic1',
            level: 7,
          },
        ],
      });
      targetProfileForAdminRepository = { getAsNewFormat: sinon.stub() };
      targetProfileForAdminRepository.getAsNewFormat.withArgs({ id: 123 }).resolves(targetProfileForAdmin);
    });

    context('when the user has role SUPPORT', function () {
      it('should return the json content and the filename for the target profile to export', async function () {
        // given
        const supportMember = domainBuilder.buildAdminMember.withRoleSupport({ userId: 66 });
        adminMemberRepository = { get: sinon.stub().withArgs({ userId: 66 }).resolves(supportMember) };

        // when
        const { jsonContent, fileName } = await getTargetProfileContentAsJson({
          userId: 66,
          targetProfileId: 123,
          adminMemberRepository,
          targetProfileForAdminRepository,
        });

        // then
        expect(fileName).to.equal('20201201_profil_cible_Profil Rentrée scolaire.json');
        expect(jsonContent).to.equal(
          '[{"id":"recTube1","level":8},{"id":"recTube2","level":7},{"id":"recTube3","level":1}]'
        );
      });
    });

    context('when the user has role METIER', function () {
      it('should return the json content and the filename for the target profile to export', async function () {
        // given
        const metierMember = domainBuilder.buildAdminMember.withRoleMetier({ userId: 66 });
        adminMemberRepository = { get: sinon.stub().withArgs({ userId: 66 }).resolves(metierMember) };

        // when
        const { jsonContent, fileName } = await getTargetProfileContentAsJson({
          userId: 66,
          targetProfileId: 123,
          adminMemberRepository,
          targetProfileForAdminRepository,
        });

        // then
        expect(fileName).to.equal('20201201_profil_cible_Profil Rentrée scolaire.json');
        expect(jsonContent).to.equal(
          '[{"id":"recTube1","level":8},{"id":"recTube2","level":7},{"id":"recTube3","level":1}]'
        );
      });
    });

    context('when the user has role SUPER_ADMIN', function () {
      it('should return the json content and the filename for the target profile to export', async function () {
        // given
        const superAdminMember = domainBuilder.buildAdminMember.withRoleSuperAdmin({ userId: 66 });
        adminMemberRepository = { get: sinon.stub().withArgs({ userId: 66 }).resolves(superAdminMember) };

        // when
        const { jsonContent, fileName } = await getTargetProfileContentAsJson({
          userId: 66,
          targetProfileId: 123,
          adminMemberRepository,
          targetProfileForAdminRepository,
        });

        // then
        expect(fileName).to.equal('20201201_profil_cible_Profil Rentrée scolaire.json');
        expect(jsonContent).to.equal(
          '[{"id":"recTube1","level":8},{"id":"recTube2","level":7},{"id":"recTube3","level":1}]'
        );
      });
    });
  });
});
