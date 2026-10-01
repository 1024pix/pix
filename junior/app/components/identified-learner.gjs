import { PixButton, PixIcon } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class IdentifiedLearner extends Component {
  @service router;
  @service currentLearner;

  get currentUserDisplayName() {
    return this.currentLearner.learner?.displayName;
  }

  @action
  disconnect() {
    this.router.transitionTo(this.currentLearner.learner?.schoolUrl);
  }

  <template>
    <div class="identified-learner">
      <div class="identified-learner__informations">
        <p>{{this.currentUserDisplayName}}</p>
        <PixButton @variant="tertiary" @iconBefore="logout" @triggerAction={{this.disconnect}}>
          {{t "components.login.logout-button"}}
        </PixButton>
      </div>
      <PixIcon class="identified-learner__icon" @name="userCircle" />
    </div>
  </template>
}
