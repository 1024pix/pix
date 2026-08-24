import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { AreaView } from '../../domain/models/AreaView.js';
import { CompetenceView } from '../../domain/models/CompetenceView.js';
import { FrameworkView } from '../../domain/models/FrameworkView.js';
import { LearningContentView } from '../../domain/models/LearningContentView.js';
import { ThematicView } from '../../domain/models/ThematicView.js';
import { TubeView } from '../../domain/models/TubeView.js';

/**
 * Find the LearningContentView model represented by the provided tubeIds
 *
 * @param {string[]} tubeIds
 * @returns {Promise<LearningContentView>}
 */
export async function findByTubeIds(tubeIds) {
  const knexConn = DomainTransaction.getConnection();

  const thematicRows = await knexConn
    .from({ frameworks: 'learningcontent.frameworks' })
    .join({ areas: 'learningcontent.areas' }, 'frameworks.id', 'areas.frameworkId')
    .join({ competences: 'learningcontent.competences' }, 'areas.id', 'competences.areaId')
    .join({ thematics: 'learningcontent.thematics' }, 'competences.id', 'thematics.competenceId')
    .join({ tubes: 'learningcontent.tubes' }, 'thematics.id', 'tubes.thematicId')
    .whereIn('tubes.id', tubeIds)
    .select({
      frameworkId: 'frameworks.id',
      frameworkName: 'frameworks.name',
      areaId: 'areas.id',
      areaCode: 'areas.code',
      areaColor: 'areas.color',
      areaTitle_i18n: 'areas.title_i18n',
      competenceId: 'competences.id',
      competenceIndex: 'competences.index',
      competenceName_i18n: 'competences.name_i18n',
      thematicId: 'thematics.id',
      thematicIndex: 'thematics.index',
      thematicName_i18n: 'thematics.name_i18n',
      thematicTubes: knexConn.raw(`
        json_agg(json_build_object(
          'id', tubes.id,
          'name', tubes.name,
          'practicalTitle_i18n', tubes."practicalTitle_i18n"
        ) order by tubes.id)
    `),
    })
    .groupBy(
      'frameworks.id',
      'frameworks.name',
      'areas.id',
      'areas.code',
      'areas.color',
      'areas.title_i18n',
      'competences.id',
      'competences.index',
      'competences.name_i18n',
      'thematics.id',
      'thematics.index',
      'thematics.name_i18n',
    )
    .orderBy('frameworks.id')
    .orderBy('areas.id')
    .orderBy('competences.id')
    .orderBy('thematics.id');

  const mapFrameworks = new Map();
  const mapAreas = new Map();
  const mapCompetences = new Map();
  for (const thematicRow of thematicRows) {
    let frameworkView = mapFrameworks.get(thematicRow.frameworkId);
    if (!frameworkView) {
      frameworkView = new FrameworkView({
        id: thematicRow.frameworkId,
        name: thematicRow.frameworkName,
        areaViews: [],
      });
      mapFrameworks.set(frameworkView.id, frameworkView);
    }

    let areaView = mapAreas.get(thematicRow.areaId);
    if (!areaView) {
      areaView = new AreaView({
        id: thematicRow.areaId,
        title_i18n: thematicRow.areaTitle_i18n,
        code: thematicRow.areaCode,
        color: thematicRow.areaColor,
        competenceViews: [],
      });
      mapAreas.set(areaView.id, areaView);
      frameworkView.areaViews.push(areaView);
    }

    let competenceView = mapCompetences.get(thematicRow.competenceId);
    if (!competenceView) {
      competenceView = new CompetenceView({
        id: thematicRow.competenceId,
        name_i18n: thematicRow.competenceName_i18n,
        index: thematicRow.competenceIndex,
        thematicViews: [],
      });
      mapCompetences.set(competenceView.id, competenceView);
      areaView.competenceViews.push(competenceView);
    }

    const thematicView = new ThematicView({
      id: thematicRow.thematicId,
      name_i18n: thematicRow.thematicName_i18n,
      index: thematicRow.thematicIndex,
      tubeViews: thematicRow.thematicTubes.map((tubeRow) => new TubeView(tubeRow)),
    });
    competenceView.thematicViews.push(thematicView);
  }

  return new LearningContentView({
    frameworkViews: [...mapFrameworks.values()],
  });
}
