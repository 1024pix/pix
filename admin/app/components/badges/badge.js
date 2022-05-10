import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import uniqBy from 'lodash/uniqBy';
import times from 'lodash/times';

import ENV from 'pix-admin/config/environment';

export default class Badge extends Component {
  @service notifications;
  @service store;

  @tracked editMode = false;
  @tracked form = {};

  IMAGE_BASE_URL = 'https://images.pix.fr/badges/';

  get isCertifiableColor() {
    return this.args.badge.isCertifiable ? 'green' : null;
  }

  get isAlwaysVisibleColor() {
    return this.args.badge.isAlwaysVisible ? 'green' : null;
  }

  get isCertifiableText() {
    return this.args.badge.isCertifiable ? 'Certifiable' : 'Non certifiable';
  }

  get isAlwaysVisibleText() {
    return this.args.badge.isAlwaysVisible ? 'Lacunes' : null;
  }

  get imageName() {
    return this.args.badge.imageUrl.slice(this.IMAGE_BASE_URL.length);
  }

  get badgeCriteria() {
    this.args.badge.badgeCriteria.forEach((badgeCriterion) => {
      badgeCriterion.skillSets.forEach((skillSet) => {
        const skills = skillSet.skills;
        const tubes = uniqBy(
          skills.map((skill) => skill.tube),
          (tube) => tube.get('id')
        );

        tubes.forEach((tube) => {
          tube.skillsWithAllLevels = new Array(ENV.APP.MAX_LEVEL)
            .fill(undefined)
            .map((_, index) =>
              skills
                .filter((skill) => skill.tube.get('id') === tube.get('id'))
                .find((skill) => skill.difficulty === index + 1)
            );
        });
        skillSet.tubes = tubes;
      });
    });
    return this.args.badge.badgeCriteria;
  }

  get allLevels() {
    return times(ENV.APP.MAX_LEVEL, (index) => index + 1);
  }

  scopeExplanation(criterionScope) {
    switch (criterionScope) {
      case 'SkillSet':
        return 'tous les groupes d‘acquis suivants :';
      case 'CampaignParticipation':
        return 'l‘ensemble des acquis du target profile.';
    }
  }

  @action
  async updateBadge(event) {
    event.preventDefault();

    try {
      const badge = await this.store.findRecord('badge', this.args.badge.id);
      const updatedBadge = this._updateBadgeFields(badge);
      updatedBadge.save();
      this.notifications.success('Le résultat thématique a été mis à jour.');
      this.editMode = false;
    } catch (error) {
      console.error(error);
      this.notifications.error('Erreur lors de la mise à jour du résultat thématique.');
    }
  }

  _updateBadgeFields(badge) {
    badge.title = this.form.title;
    badge.key = this.form.key;
    badge.message = this.form.message;
    badge.altMessage = this.form.altMessage;
    badge.isCertifiable = this.form.isCertifiable;
    badge.isAlwaysVisible = this.form.isAlwaysVisible;
    badge.imageUrl = this.IMAGE_BASE_URL + this.form.imageName;
    return badge;
  }

  @action
  cancel() {
    this.toggleEditMode();
  }

  @action
  toggleEditMode() {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this._initForm();
    }
  }

  _initForm() {
    this.form.title = this.args.badge.title;
    this.form.key = this.args.badge.key;
    this.form.message = this.args.badge.message;
    this.form.altMessage = this.args.badge.altMessage;
    this.form.isCertifiable = this.args.badge.isCertifiable;
    this.form.isAlwaysVisible = this.args.badge.isAlwaysVisible;
    this.form.imageName = this.imageName;
  }
}
