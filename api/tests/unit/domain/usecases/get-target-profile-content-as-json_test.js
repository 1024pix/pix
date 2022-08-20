const { expect, sinon, domainBuilder } = require('../../../test-helper');
const getTargetProfileContentAsJson = require('../../../../lib/domain/usecases/get-target-profile-content-as-json');

describe('Unit | UseCase | get-target-profile-content-as-json', function () {
  it('should return the json content and the filename for the target profile to export', async function () {
    // given
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
    const targetProfileForAdminRepository = { getAsNewFormat: sinon.stub() };
    targetProfileForAdminRepository.getAsNewFormat.withArgs({ id: 123 }).resolves(targetProfileForAdmin);

    // when
    const { jsonContent, fileName } = await getTargetProfileContentAsJson({
      targetProfileId: 123,
      targetProfileForAdminRepository,
    });

    // then
    expect(fileName).to.equal('profil_cible_Profil Rentrée scolaire.json');
    expect(jsonContent).to.equal(
      '[{"id":"recTube1","level":8},{"id":"recTube2","level":7},{"id":"recTube3","level":1}]'
    );
  });
});
