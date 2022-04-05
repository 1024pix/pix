import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class NewRoute extends Route {
  queryParams = {
    selectedFrameworkIds: {
      refreshModel: true,
      type: 'array',
    },
  };

  @service store;

  @tracked selectedFrameworkIds = null;

  async model(params) {
    const targetProfile = this.store.createRecord('target-profile', { category: 'OTHER' });
    const frameworks = await this.store.findAll('framework');

    const areasBySelectedFrameworks =
      params.selectedFrameworkIds &&
      (await Promise.all(
        params.selectedFrameworkIds.map((selectedFrameworkId) => {
          return this.store.query('area', { frameworkId: selectedFrameworkId });
        })
      ));

    return { targetProfile, frameworks, areasBySelectedFrameworks };
  }

  orderedAreasBySelectedFrameworks(areasBySelectedFrameworks) {
    if (!areasBySelectedFrameworks) return [];

    const areas = areasBySelectedFrameworks.reduce((accu, areas) => {
      return [...accu, ...areas.toArray()];
    }, []);
    return areas.sort((area1, area2) => {
      return area1.code - area2.code;
    });
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    if (model.areasBySelectedFrameworks.length > 0) {
      const areas = this.orderedAreasBySelectedFrameworks(model.areasBySelectedFrameworks);

      controller.areasState = areas.map((area) => {
        const sortedCompetences = area.sortedCompetences.map((competence) => {
          const sortedThematics = competence.sortedThematics.map((thematic) => {
            const tubes = thematic.tubes.map((tube) => {
              return {
                id: tube.id,
                practicalTitle: tube.practicalTitle,
                practicalDescription: tube.practicalDescription,
                level: 'Illimité',
                mobile: tube.mobile,
                tablet: tube.tablet,
                isSelected: false,
              };
            });
            return { id: thematic.id, name: thematic.name, tubes, isSelected: false };
          });
          return {
            id: competence.id,
            index: competence.index,
            name: competence.name,
            sortedThematics,
            isSelected: false,
          };
        });

        return { code: area.code, title: area.title, color: area.color, sortedCompetences };
      });
    }
  }
}
