import { usecases } from '../../../../src/learning-content/domain/usecases/index.js';
import { expect } from '../../../test-helper.js';
import { databaseBuilder } from '../../../tooling/databases.js';
import { domainBuilder } from '../../../tooling/domain-builder/domain-builder.js';

describe('Learning Content | Integration | Domain | Usecase | get-learning-content-by-tube-ids', function () {
  let framework1Fr, framework2Fr;
  let area1Fr, area2Fr;
  let competence1Fr, competence2Fr, competence3Fr;
  let thematic1Fr, thematic2Fr, thematic3Fr;
  let tube1Fr, tube2Fr, tube4Fr;

  beforeEach(async function () {
    const framework1DB = databaseBuilder.factory.learningContent.buildFramework({
      id: 'recFramework1',
      name: 'Framework 1',
    });
    const framework2DB = databaseBuilder.factory.learningContent.buildFramework({
      id: 'recFramework2',
      name: 'Framework 2',
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
      origin: 'Pix',
      areaId: 'recArea1',
    });
    const competence2DB = databaseBuilder.factory.learningContent.buildCompetence({
      id: 'recCompetence2',
      name_i18n: { fr: 'competence2_nomFr', en: 'competence2_nameEn' },
      index: '2',
      description_i18n: { fr: 'competence2_descriptionFr', en: 'competence2_descriptionEn' },
      origin: 'Pix',
      areaId: 'recArea1',
    });
    const competence3DB = databaseBuilder.factory.learningContent.buildCompetence({
      id: 'recCompetence3',
      name_i18n: { fr: 'competence3_nomFr', en: 'competence3_nameEn' },
      index: '1',
      description_i18n: { fr: 'competence3_descriptionFr', en: 'competence3_descriptionEn' },
      origin: 'Pix',
      areaId: 'recArea2',
    });

    const thematic1DB = databaseBuilder.factory.learningContent.buildThematic({
      id: 'recThematic1',
      name_i18n: { fr: 'thematique1_nomFr', en: 'thematic1_nameEn' },
      index: 10,
      competenceId: 'recCompetence1',
      tubeIds: ['recTube1'],
    });
    // recThematic2 has two tubes in the referential, but only one of them will be requested
    // by the usecase (recTube3 is voluntarily left out of tubeIds below).
    const thematic2DB = databaseBuilder.factory.learningContent.buildThematic({
      id: 'recThematic2',
      name_i18n: { fr: 'thematique2_nomFr', en: 'thematic2_nameEn' },
      index: 20,
      competenceId: 'recCompetence2',
      tubeIds: ['recTube2', 'recTube3'],
    });
    const thematic3DB = databaseBuilder.factory.learningContent.buildThematic({
      id: 'recThematic3',
      name_i18n: { fr: 'thematique3_nomFr', en: 'thematic3_nameEn' },
      index: 10,
      competenceId: 'recCompetence3',
      tubeIds: ['recTube4'],
    });

    const tube1DB = databaseBuilder.factory.learningContent.buildTube({
      id: 'recTube1',
      name: '@tube1_name',
      title: 'tube1_title',
      description: 'tube1_description',
      practicalTitle_i18n: { fr: 'tube1_practicalTitleFr', en: 'tube1_practicalTitleEn' },
      practicalDescription_i18n: { fr: 'tube1_practicalDescriptionFr', en: 'tube1_practicalDescriptionEn' },
      isMobileCompliant: true,
      isTabletCompliant: false,
      competenceId: 'recCompetence1',
      thematicId: 'recThematic1',
    });
    const tube2DB = databaseBuilder.factory.learningContent.buildTube({
      id: 'recTube2',
      name: '@tube2_name',
      title: 'tube2_title',
      description: 'tube2_description',
      practicalTitle_i18n: { fr: 'tube2_practicalTitleFr', en: 'tube2_practicalTitleEn' },
      practicalDescription_i18n: { fr: 'tube2_practicalDescriptionFr', en: 'tube2_practicalDescriptionEn' },
      isMobileCompliant: false,
      isTabletCompliant: true,
      competenceId: 'recCompetence2',
      thematicId: 'recThematic2',
    });
    // recTube3 exists in the referential (linked to recThematic2/recCompetence2) but is not
    // part of the requested tubeIds: it must not appear anywhere in the result.
    databaseBuilder.factory.learningContent.buildTube({
      id: 'recTube3',
      name: '@tube3_name',
      title: 'tube3_title',
      description: 'tube3_description',
      practicalTitle_i18n: { fr: 'tube3_practicalTitleFr', en: 'tube3_practicalTitleEn' },
      practicalDescription_i18n: { fr: 'tube3_practicalDescriptionFr', en: 'tube3_practicalDescriptionEn' },
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
      practicalDescription_i18n: { fr: 'tube4_practicalDescriptionFr', en: 'tube4_practicalDescriptionEn' },
      isMobileCompliant: false,
      isTabletCompliant: false,
      competenceId: 'recCompetence3',
      thematicId: 'recThematic3',
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
    [tube1Fr, tube2Fr, tube4Fr] = _buildDomainTubesFromDB([tube1DB, tube2DB, tube4DB], 'fr');

    // Tubes returned by the repository are always hydrated with an empty skills collection.
    tube1Fr.skills = [];
    tube2Fr.skills = [];
    tube4Fr.skills = [];

    thematic1Fr.tubes = [tube1Fr];
    // Only the requested tube (recTube2) is attached, recTube3 is left out.
    thematic2Fr.tubes = [tube2Fr];
    thematic3Fr.tubes = [tube4Fr];

    competence1Fr.thematics = [thematic1Fr];
    competence1Fr.tubes = [tube1Fr];
    competence2Fr.thematics = [thematic2Fr];
    competence2Fr.tubes = [tube2Fr];
    competence3Fr.thematics = [thematic3Fr];
    competence3Fr.tubes = [tube4Fr];

    area1Fr.competences = [competence1Fr, competence2Fr];
    area2Fr.competences = [competence3Fr];

    framework1Fr.areas = [area1Fr];
    framework2Fr.areas = [area2Fr];
  });

  it('should return the frameworks, hydrated down to the tubes matching the given tubeIds', async function () {
    // when
    const frameworks = await usecases.getLearningContentByTubeIds({
      tubeIds: ['recTube1', 'recTube2', 'recTube4'],
      locale: 'fr',
    });

    // then
    expect(frameworks).to.lengthOf(2);
    expect(frameworks).to.deep.equal([framework1Fr, framework2Fr]);
  });

  it('should not include tubes, thematics, competences, areas or frameworks that are not reachable from the given tubeIds', async function () {
    // when
    const frameworks = await usecases.getLearningContentByTubeIds({
      tubeIds: ['recTube1', 'recTube2', 'recTube4'],
      locale: 'fr',
    });

    // then
    const [framework1, framework2] = frameworks;
    expect(framework1.areas[0].competences[1].tubes).to.deep.equal([tube2Fr]);
    expect(framework1.areas[0].competences[1].thematics[0].tubes).to.deep.equal([tube2Fr]);
    expect(framework2.areas[0].competences[0].tubes.map(({ id }) => id)).to.not.include('recTube3');
  });

  context('when tubeIds is empty', function () {
    it('should return an empty array', async function () {
      // when
      const frameworks = await usecases.getLearningContentByTubeIds({ tubeIds: [], locale: 'fr' });

      // then
      expect(frameworks).to.deep.equal([]);
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
