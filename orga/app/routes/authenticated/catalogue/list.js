import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AuthenticatedCatalogueFilter extends Route {
  @service store;
  @service currentUser;
  @service router;

  #currentOrgaId = null;

  queryParams = {
    targetProfileId: { refreshModel: true },
    blueprintId: { refreshModel: true },
  };

  beforeModel(transition) {
    if (!['all', 'blueprint', 'targetProfile'].includes(transition.to.params?.type)) {
      return this.router.replaceWith('authenticated.catalogue.list', 'all');
    }
  }

  async model({ type, targetProfileId, blueprintId }) {
    this.handleCache();
    let courses = this.store.peekAll('course');
    let currentCourse;

    if (courses.length === 0) {
      courses = await this.store.findAll('course', {
        backgroundReload: false,
        adapterOptions: { organizationId: this.currentUser.organization.id },
      });
    }

    if (targetProfileId) {
      currentCourse = await this.store.findRecord('target-profile-overview', targetProfileId, {
        adapterOptions: { organizationId: this.currentUser.organization.id },
      });
    }

    if (blueprintId) {
      currentCourse = await this.store.findRecord('combined-course-blueprint-overview', blueprintId, {
        adapterOptions: { organizationId: this.currentUser.organization.id },
      });
    }

    return { courses, currentCourse, type };
  }

  handleCache() {
    const orgId = this.currentUser.organization.id;
    if (this.#currentOrgaId !== orgId) {
      this.store.unloadAll('course');
    }
    this.#currentOrgaId = orgId;
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('targetProfileId', null);
      controller.set('blueprintId', null);
    }
  }
}
