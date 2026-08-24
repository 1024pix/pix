import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CombinedCourseParticipationDetailsRoute extends Route {
  @service store;
  @service currentUser;
  @service router;

  beforeModel() {
    if (!this.currentUser.canAccessCampaignsPage) {
      return this.router.replaceWith('authenticated.index');
    }
  }

  sortItemsByStep = (items) =>
    items.reduce((itemsBySteps, item) => {
      if (itemsBySteps.length === 0 || ['formation'].includes(item.type)) {
        itemsBySteps.push([item]);
        return itemsBySteps;
      }

      const lastStep = itemsBySteps[itemsBySteps.length - 1];

      if (lastStep[0].type === item.type || (lastStep[0].type === 'formation' && item.type === 'module')) {
        lastStep.push(item);
        return itemsBySteps;
      }

      itemsBySteps.push([item]);
      return itemsBySteps;
    }, []);

  async model(params) {
    const combinedCourse = this.modelFor('authenticated.combined-course');
    return this.store
      .queryRecord('combined-course-participation-detail', {
        combinedCourseId: combinedCourse.id,
        participationId: params.participation_id,
      })
      .then(({ items, participation }) => {
        return { combinedCourse, participation, itemsBySteps: this.sortItemsByStep(items) };
      })
      .catch(() => {
        this.router.replaceWith('not-found');
      });
  }
}
