import { usecases } from '../../../../../../src/prescription/target-profile/domain/usecases/index.js';
import { PIX_ORIGIN } from '../../../../../../src/shared/constants.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Integration | UseCases | find-learning-contents-by-organization-id', function () {
  let organizationId;
  let framework1Fr, framework2Fr;
  let area1Fr, area2Fr;
  let competence1Fr, competence2Fr, competence3Fr;
  let thematic1Fr, thematic2Fr, thematic3Fr;
  let tube1Fr, tube2Fr, tube4Fr;

  beforeEach(async function () {
    const framework1DB = databaseBuilder.factory.learningContent.buildFramework({
      id: 'recFramework1',
      name: PIX_ORIGIN,
    });
    const framework2DB = databaseBuilder.factory.learningContent.buildFramework({
      id: 'recFramework2',
      name: 'Pix+',
    });
    const area1DB = databaseBuilder.factory.learningContent.buildArea({
      id: 'recArea1',
      name: 'area1_name',
      title_i18n: { fr: 'domaine1_TitreFr', en: 'area1_TitleEn' },
      color: 'area1_color',
      code: 'area1_code',
      frameworkId: 'recFramework1',
      competenceIds: ['recCompetence1', 'recCompetence2'],
    });
    const area2DB = databaseBuilder.factory.learningContent.buildArea({
      id: 'recArea2',
      name: 'area2_name',
      title_i18n: { fr: 'domaine2_TitreFr', en: 'area2_TitleEn' },
      color: 'area2_color',
      code: 'area2_code',
      frameworkId: 'recFramework2',
      competenceIds: ['recCompetence3'],
    });
    const competence1DB = databaseBuilder.factory.learningContent.buildCompetence({
      id: 'recCompetence1',
      name_i18n: { fr: 'competence1_nomFr', en: 'competence1_nameEn' },
      index: '1',
      description_i18n: { fr: 'competence1_descriptionFr', en: 'competence1_descriptionEn' },
      origin: PIX_ORIGIN,
      areaId: 'recArea1',
    });
    const competence2DB = databaseBuilder.factory.learningContent.buildCompetence({
      id: 'recCompetence2',
      name_i18n: { fr: 'competence2_nomFr', en: 'competence2_nameEn' },
      index: '2',
      description_i18n: { fr: 'competence2_descriptionFr', en: 'competence2_descriptionEn' },
      origin: PIX_ORIGIN,
      areaId: 'recArea1',
    });
    const competence3DB = databaseBuilder.factory.learningContent.buildCompetence({
      id: 'recCompetence3',
      name_i18n: { fr: 'competence3_nomFr', en: 'competence3_nameEn' },
      index: '1',
      description_i18n: { fr: 'competence3_descriptionFr', en: 'competence3_descriptionEn' },
      origin: 'Pix+',
      areaId: 'recArea2',
    });
    const thematic1DB = databaseBuilder.factory.learningContent.buildThematic({
      id: 'recThematic1',
      name_i18n: {
        fr: 'thematique1_nomFr',
        en: 'thematic1_nameEn',
      },
      index: 10,
      competenceId: 'recCompetence1',
      tubeIds: ['recTube1'],
    });
    const thematic2DB = databaseBuilder.factory.learningContent.buildThematic({
      id: 'recThematic2',
      name_i18n: {
        fr: 'thematique2_nomFr',
        en: 'thematic2_nameEn',
      },
      index: 20,
      competenceId: 'recCompetence2',
      tubeIds: ['recTube2', 'recTube3'],
    });
    const thematic3DB = databaseBuilder.factory.learningContent.buildThematic({
      id: 'recThematic3',
      name_i18n: {
        fr: 'thematique3_nomFr',
        en: 'thematic3_nameEn',
      },
      index: 30,
      competenceId: 'recCompetence3',
      tubeIds: ['recTube4'],
    });
    const tube1DB = databaseBuilder.factory.learningContent.buildTube({
      id: 'recTube1',
      name: '@tube1_name',
      title: 'tube1_title',
      description: 'tube1_description',
      practicalTitle_i18n: { fr: 'tube1_practicalTitleFr', en: 'tube1_practicalTitleEn' },
      practicalDescription_i18n: {
        fr: 'tube1_practicalDescriptionFr',
        en: 'tube1_practicalDescriptionEn',
      },
      isMobileCompliant: true,
      isTabletCompliant: false,
      competenceId: 'recCompetence1',
      thematicId: 'recThematic1',
    });
    const tube2DB = databaseBuilder.factory.learningContent.buildTube({
      id: 'recTube2',
      name: '@tube2_name',
      title: '@tube2_title',
      description: '@tube2_description',
      practicalTitle_i18n: { fr: 'tube2_practicalTitleFr', en: 'tube2_practicalTitleEn' },
      practicalDescription_i18n: {
        fr: 'tube2_practicalDescriptionFr',
        en: 'tube2_practicalDescriptionEn',
      },
      isMobileCompliant: false,
      isTabletCompliant: true,
      competenceId: 'recCompetence2',
      thematicId: 'recThematic2',
    });
    const tube3DB = databaseBuilder.factory.learningContent.buildTube({
      id: 'recTube3',
      name: '@tube3_name',
      title: '@tube3_title',
      description: '@tube3_description',
      practicalTitle_i18n: { fr: 'tube3_practicalTitleFr', en: 'tube3_practicalTitleEn' },
      practicalDescription_i18n: {
        fr: 'tube3_practicalDescriptionFr',
        en: 'tube3_practicalDescriptionEn',
      },
      isMobileCompliant: true,
      isTabletCompliant: true,
      competenceId: 'recCompetence2',
      thematicId: 'recThematic2',
    });
    const tube4DB = databaseBuilder.factory.learningContent.buildTube({
      id: 'recTube4',
      name: '@tube4_name',
      title: 'tube4_title',
      description: 'tube4_description',
      practicalTitle_i18n: { fr: 'tube4_practicalTitleFr', en: 'tube4_practicalTitleEn' },
      practicalDescription_i18n: {
        fr: 'tube4_practicalDescriptionFr',
        en: 'tube4_practicalDescriptionEn',
      },
      isMobileCompliant: false,
      isTabletCompliant: false,
      competenceId: 'recCompetence3',
      thematicId: 'recThematic3',
    });

    databaseBuilder.factory.learningContent.buildSkill({
      id: `recSkill1`,
      name: `@tube1_name1`,
      status: 'actif',
      level: 1,
      pixValue: 2,
      version: 1,
      tubeId: `recTube1`,
    });

    databaseBuilder.factory.learningContent.buildSkill({
      id: `recSkill2`,
      name: `@tube2_name1`,
      status: 'actif',
      level: 1,
      pixValue: 3,
      version: 1,
      tubeId: `recTube2`,
    });

    databaseBuilder.factory.learningContent.buildSkill({
      id: `recSkill4`,
      name: `@tube4_name1`,
      status: 'actif',
      level: 1,
      pixValue: 4,
      version: 1,
      tubeId: `recTube4`,
    });

    organizationId = databaseBuilder.factory.buildOrganization().id;
    const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;

    const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
    databaseBuilder.factory.buildTargetProfileShare({ organizationId, targetProfileId });
    databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'recTube1', level: 4 });

    const secondTargetProfileId = databaseBuilder.factory.buildTargetProfile().id;
    databaseBuilder.factory.buildTargetProfileShare({ organizationId, targetProfileId: secondTargetProfileId });
    databaseBuilder.factory.buildTargetProfileTube({
      targetProfileId: secondTargetProfileId,
      tubeId: 'recTube4',
      level: 2,
    });

    const targetProfileIdFromOtherOrganization = databaseBuilder.factory.buildTargetProfile().id;
    databaseBuilder.factory.buildTargetProfileShare({
      organizationId: otherOrganizationId,
      targetProfileId: targetProfileIdFromOtherOrganization,
    });
    databaseBuilder.factory.buildTargetProfileTube({
      targetProfileId: targetProfileIdFromOtherOrganization,
      tubeId: 'recTube3',
      level: 2,
    });

    await databaseBuilder.commit();

    [framework1Fr, framework2Fr] = _buildDomainFrameworksFromDB([framework1DB, framework2DB]);
    [area1Fr, area2Fr] = _buildDomainAreasFromDB([area1DB, area2DB], 'fr');
    [competence1Fr, competence2Fr, competence3Fr] = _buildDomainCompetencesFromDB(
      [competence1DB, competence2DB, competence3DB],
      'fr',
    );

    [thematic1Fr, thematic2Fr, thematic3Fr] = _buildDomainThematicsFromDB(
      [thematic1DB, thematic2DB, thematic3DB],
      'fr',
    );

    [tube1Fr, tube2Fr, , tube4Fr] = _buildDomainTubesFromDB([tube1DB, tube2DB, tube3DB, tube4DB], 'fr');

    // build localised frameworks
    framework1Fr.areas = [area1Fr];
    area1Fr.competences = [competence1Fr, competence2Fr];
    competence1Fr.thematics = [thematic1Fr];
    competence2Fr.thematics = [thematic2Fr];
    competence1Fr.tubes = [tube1Fr];
    competence2Fr.tubes = [tube2Fr];
    thematic1Fr.tubes = [tube1Fr];
    thematic2Fr.tubes = [tube2Fr];
    tube1Fr.skills = [];
    tube2Fr.skills = [];

    framework2Fr.areas = [area2Fr];
    area2Fr.competences = [competence3Fr];
    competence3Fr.thematics = [thematic3Fr];
    competence3Fr.tubes = [tube4Fr];
    thematic3Fr.tubes = [tube4Fr];
    tube4Fr.skills = [];
  });

  it('it should returns frameworks for a given organization', async function () {
    // when
    const frameworks = await usecases.findLearningContentsByOrganizationId({ organizationId, locale: 'fr' });

    // then
    expect(frameworks).lengthOf(2);
    expect(frameworks).deep.members([framework1Fr, framework2Fr]);
  });

  context('when organization has no target profile shares', function () {
    it('it should returns empty array', async function () {
      // when
      const frameworks = await usecases.findLearningContentsByOrganizationId({ organizationId: 213 });

      // then
      expect(frameworks).lengthOf(1);
      expect(frameworks).deep.members([framework1Fr]);
    });
  });
});

function _buildDomainFrameworksFromDB(frameworksDB) {
  return frameworksDB.map((frameworkDB) =>
    domainBuilder.buildFramework({
      id: frameworkDB.id,
      name: frameworkDB.name,
      areas: [],
    }),
  );
}

function _buildDomainAreasFromDB(areasDB, locale) {
  return areasDB.map((areaDB) =>
    domainBuilder.buildArea({
      ...areaDB,
      title: areaDB.title_i18n[locale],
    }),
  );
}

function _buildDomainCompetencesFromDB(competencesDB, locale) {
  return competencesDB.map((competenceDB) =>
    domainBuilder.buildCompetence({
      ...competenceDB,
      name: competenceDB.name_i18n[locale],
      description: competenceDB.description_i18n[locale],
    }),
  );
}

function _buildDomainThematicsFromDB(thematicsDB, locale) {
  return thematicsDB.map((thematicDB) =>
    domainBuilder.buildThematic({
      ...thematicDB,
      name: thematicDB.name_i18n[locale],
    }),
  );
}

function _buildDomainTubesFromDB(tubesDB, locale) {
  return tubesDB.map((tubeDB) =>
    domainBuilder.buildTube({
      ...tubeDB,
      practicalTitle: tubeDB.practicalTitle_i18n[locale],
      practicalDescription: tubeDB.practicalDescription_i18n[locale],
    }),
  );
}
