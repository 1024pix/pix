import { usecases } from '../../../../../../src/prescription/target-profile/domain/usecases/index.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | Prescription | Domain | Models | TargetProfileOverview', function () {
  it('should return a targetProfilOverview', async function () {
    //given
    const framework = {
      frameworks: [
        {
          id: 'fmk1',
        },
      ],
      areas: [
        {
          id: 'recAreaA',
          title_i18n: {
            fr: 'titleFRA',
            en: 'titleENA',
          },
          color: 'colorA',
          code: 'codeA',
          frameworkId: 'fmk1',
          competenceIds: ['recCompA', 'recCompB'],
        },
      ],
      competences: [
        {
          id: 'recCompA',
          name_i18n: {
            fr: 'nameFRA',
            en: 'nameENA',
          },
          index: '1',
          areaId: 'recAreaA',
          origin: 'Pix',
          thematicIds: ['recThemA', 'recThemB'],
        },
      ],
      thematics: [
        {
          id: 'recThemA',
          name_i18n: {
            fr: 'nameFRA',
            en: 'nameENA',
          },
          index: '1',
          competenceId: 'recCompA',
          tubeIds: ['recTube1'],
        },
      ],
      tubes: [
        {
          id: 'recTube1',
          competenceId: 'recCompA',
          thematicId: 'recThemA',
          name: 'tubeName1',
          practicalTitle_i18n: {
            fr: 'practicalTitleFR1',
            en: 'practicalTitleEN1',
          },
          isMobileCompliant: false,
          isTabletCompliant: true,
          skillIds: ['recSkillTube1'],
        },
      ],
      skills: [
        {
          id: 'recSkillTube1',
          tubeId: 'recTube1',
          status: 'actif',
          level: 1,
        },
      ],
    };
    databaseBuilder.factory.learningContent.build(framework);

    const targetProfile = databaseBuilder.factory.buildTargetProfile({
      description: 'description',
    });
    databaseBuilder.factory.buildTargetProfileTube({
      targetProfileId: targetProfile.id,
      tubeId: 'recTube1',
    });

    await databaseBuilder.commit();

    //when
    const result = await usecases.getTargetProfileOverview({ targetProfileId: targetProfile.id, locale: 'fr-FR' });

    //then
    expect(result).to.deep.equal({
      id: targetProfile.id,
      imageUrl: 'https://images.pix.fr/profil-cible/Illu_GEN.svg',
      internalName: 'Remplir un tableur',
      isSimplifiedAccess: false,
      description: 'description',
      name: 'Remplir un tableur',
      outdated: false,
      category: targetProfile.category,
      badges: [],
      frameworks: [
        {
          id: 'fmk1',
          name: 'Pix',
          areas: [
            {
              id: 'recAreaA',
              name: 'name Domaine A',
              title: 'titleFRA',
              code: 'codeA',
              color: 'colorA',
              frameworkId: 'fmk1',
              competences: [
                {
                  id: 'recCompA',
                  name: 'nameFRA',
                  description: 'description FR Compétence A',
                  index: '1',
                  level: -1,
                  origin: 'Pix',
                  areaId: 'recAreaA',
                  skillIds: [],
                  thematicIds: ['recThemA', 'recThemB'],
                  tubes: [
                    {
                      id: 'recTube1',
                      isMobileCompliant: false,
                      isTabletCompliant: true,
                      name: 'tubeName1',
                      practicalDescription: 'practicalDescription FR Tube A',
                      practicalTitle: 'practicalTitleFR1',
                      competenceId: 'recCompA',
                      skillIds: ['recSkillTube1'],
                      skills: [
                        {
                          competenceId: null,
                          difficulty: 1,
                          hint: 'Un indice',
                          hintStatus: 'hintStatus Acquis A',
                          id: 'recSkillTube1',
                          learningMoreTutorialIds: [],
                          name: 'name Acquis A',
                          pixValue: 2.9,
                          status: 'actif',
                          tubeId: 'recTube1',
                          tutorialIds: [],
                          version: 5,
                        },
                      ],
                      thematicId: 'recThemA',
                    },
                  ],
                  thematics: [
                    {
                      id: 'recThemA',
                      index: 1,
                      name: 'nameFRA',
                      tubeIds: ['recTube1'],
                      competenceId: 'recCompA',
                      tubes: [
                        {
                          id: 'recTube1',
                          isMobileCompliant: false,
                          isTabletCompliant: true,
                          name: 'tubeName1',
                          practicalDescription: 'practicalDescription FR Tube A',
                          practicalTitle: 'practicalTitleFR1',
                          competenceId: 'recCompA',
                          skillIds: ['recSkillTube1'],
                          skills: [
                            {
                              competenceId: null,
                              difficulty: 1,
                              hint: 'Un indice',
                              hintStatus: 'hintStatus Acquis A',
                              id: 'recSkillTube1',
                              learningMoreTutorialIds: [],
                              name: 'name Acquis A',
                              pixValue: 2.9,
                              status: 'actif',
                              tubeId: 'recTube1',
                              tutorialIds: [],
                              version: 5,
                            },
                          ],
                          thematicId: 'recThemA',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
  });
});
