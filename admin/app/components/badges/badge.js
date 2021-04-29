import Component from '@glimmer/component';
import uniqBy from 'lodash/uniqBy';
import times from 'lodash/times';

import ENV from 'pix-admin/config/environment';

export default class Badge extends Component {

  get isCertifiableColor() {
    return this.args.badge.isCertifiable ? 'green' : 'yellow';
  }

  get isCertifiableText() {
    return this.args.badge.isCertifiable ? 'Certifiable' : 'Non certifiable';
  }

  get badgeCriteria() {
    this.args.badge.badgeCriteria.forEach((badgeCriterion) => {
      badgeCriterion.partnerCompetences.forEach((badgePartnerCompetence) => {
        const tubes = uniqBy(badgePartnerCompetence.skills.map((skill) => skill.tube), (tube) => tube.get('id'));
        tubes.forEach((tube) => {
          tube.skillsWithAllLevels = new Array(ENV.APP.MAX_LEVEL).fill(undefined).map((_, index) => tube.get('skills').find((skill) => skill.difficulty === (index + 1)));
        });
        badgePartnerCompetence.tubes = tubes;
      });
    });
    return this.args.badge.badgeCriteria;
  }

  get allLevels() {
    return times(ENV.APP.MAX_LEVEL, (index) => index + 1);
  }

  scopeExplanation(criterionScope) {
    switch (criterionScope) {
      case 'SomePartnerCompetences': return 'tous les groupes d‘acquis suivants :';
      case 'EveryPartnerCompetences': return 'l‘ensemble des groupes d‘acquis liés au badge :';
      case 'CampaignParticipation': return 'l‘ensemble des acquis du target profile.';
    }
  }
}
