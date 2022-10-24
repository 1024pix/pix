import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class MembersList extends Component {
  @service featureToggles;

  get orderedMemberListWithRefererFirst() {
    const membersArray = this.args.members.toArray();

    membersArray.sort((member1, member2) => {
      if (member1.isReferer) {
        return -1;
      }

      if (member2.isReferer) {
        return 1;
      }

      return member1.lastName.localeCompare(member2.lastName, 'fr-FR', { sensitivity: 'base' });
    });

    return membersArray;
  }

  get shouldDisplayRefererColumn() {
    return (
      this.args.hasCleaHabilitation &&
      this.featureToggles.featureToggles.isCleaResultsRetrievalByHabilitatedCertificationCentersEnabled
    );
  }
}
