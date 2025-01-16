import Component from "@glimmer/component";
import { t } from 'ember-intl';
import PixButton from "@1024pix/pix-ui/components/pix-button";
import { action } from "@ember/object";
import { service} from "@ember/service";

export default class LoginInformation extends Component {
  @service router;
  @service currentLearner;

  @action
  disconnect() {
    this.router.transitionTo(this.currentLearner.learner.schoolUrl);
  }

<template>
    <div class="login-container">
      {{log this.args.learner}}
      {{log this.currentLearner}}
      <p>
        {{t "components.login-information.connected-user"}}
        <strong>{{this.args.learner.firstName}}</strong>
      </p>
      <PixButton @variant="tertiary" @iconBefore="logout" @triggerAction={{this.disconnect}}  >
        {{t "components.login-information.button-label"}}

      </PixButton>
    </div>
  </template>
}
