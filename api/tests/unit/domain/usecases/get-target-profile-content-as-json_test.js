import { expect, sinon, catchErr, domainBuilder, MockDate } from '../../../test-helper';
import { ForbiddenAccess } from '../../../../lib/domain/errors';
import learningContentConversionService from '../../../../lib/domain/services/learning-content/learning-content-conversion-service';
import getTargetProfileContentAsJson from '../../../../lib/domain/usecases/get-target-profile-content-as-json';

describe('Unit | UseCase | get-target-profile-content-as-json', function () {
  let targetProfileForAdminRepository;
  let adminMemberRepository;

  afterEach(function () {
    MockDate.reset();
  });

  context('when the user does not have the authorization to get the content', function () {
    beforeEach(function () {
      targetProfileForAdminRepository = { get: sinon.stub() };
      targetProfileForAdminRepository.get.rejects(new Error('I should not be called'));
      sinon.stub(learningContentConversionService, 'findActiveSkillsForCappedTubes');
      learningContentConversionService.findActiveSkillsForCappedTubes.rejects(new Error('I should not be called'));
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
      const area = domainBuilder.buildArea({ id: 'recArea', frameworkId: 'recFramework' });
      const targetProfileForAdmin = domainBuilder.buildTargetProfileForAdmin({
        name: 'Profil Rentrée scolaire',
        areas: [area],
        competences: [domainBuilder.buildCompetence({ id: 'recCompetence', area, areaId: area.id })],
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
      targetProfileForAdminRepository = { get: sinon.stub() };
      targetProfileForAdminRepository.get.withArgs({ id: 123 }).resolves(targetProfileForAdmin);
      const skillsForTube1 = [domainBuilder.buildSkill({ id: 'skill1Tube1', tubeId: 'recTube1' })];
      const skillsForTube2 = [
        domainBuilder.buildSkill({ id: 'skill1Tube2', tubeId: 'recTube2' }),
        domainBuilder.buildSkill({ id: 'skill2Tube2', tubeId: 'recTube2' }),
      ];
      const skillsForTube3 = [];
      sinon.stub(learningContentConversionService, 'findActiveSkillsForCappedTubes');
      learningContentConversionService.findActiveSkillsForCappedTubes
        .withArgs([
          {
            id: 'recTube1',
            level: 8,
          },
          {
            id: 'recTube2',
            level: 7,
          },
          {
            id: 'recTube3',
            level: 1,
          },
        ])
        .resolves([...skillsForTube1, ...skillsForTube2, ...skillsForTube3]);
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
          '[{"id":"recTube1","level":8,"frameworkId":"recFramework","skills":["skill1Tube1"]},{"id":"recTube2","level":7,"frameworkId":"recFramework","skills":["skill1Tube2","skill2Tube2"]},{"id":"recTube3","level":1,"frameworkId":"recFramework","skills":[]}]'
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
          '[{"id":"recTube1","level":8,"frameworkId":"recFramework","skills":["skill1Tube1"]},{"id":"recTube2","level":7,"frameworkId":"recFramework","skills":["skill1Tube2","skill2Tube2"]},{"id":"recTube3","level":1,"frameworkId":"recFramework","skills":[]}]'
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
          '[{"id":"recTube1","level":8,"frameworkId":"recFramework","skills":["skill1Tube1"]},{"id":"recTube2","level":7,"frameworkId":"recFramework","skills":["skill1Tube2","skill2Tube2"]},{"id":"recTube3","level":1,"frameworkId":"recFramework","skills":[]}]'
        );
      });
    });
  });
});
