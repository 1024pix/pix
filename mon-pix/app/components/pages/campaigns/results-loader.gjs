import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { modifier } from 'ember-modifier';
import { gt } from 'ember-truth-helpers';

const callOnTrue = modifier((element, [action, value]) => {
  if (value) {
    action();
  }
});

export default class ResultsLoader extends Component {
  @service router;
  @tracked steps = 1;
  @tracked isButtonDisabled = true;

  get lineAppearanceInterval() {
    return this.args.lineAppearanceInterval ?? 1200;
  }

  get lineTransitionDuration() {
    return this.args.lineTransitionDuration ?? 300;
  }

  get iconTransitionDuration() {
    return this.args.iconTransitionDuration ?? 300;
  }

  constructor(...args) {
    super(...args);
    const interval = setInterval(() => {
      this.steps++;
      if (this.steps === 3) {
        clearInterval(interval);
        setTimeout(() => {
          this.isButtonDisabled = false;
        }, this.lineTransitionDuration + this.iconTransitionDuration);
      }
    }, this.lineAppearanceInterval);
  }

  @action
  onClick() {
    this.router.transitionTo('campaigns.assessment.results', this.args.code);
  }

  <template>
    <main role="main" class="results-loader">
      <div class="results-loader__content">
        <img class="results-loader__illustration" alt="" src="/images/illustrations/score-computation.svg" />
        <h1 class="results-loader__title">{{t "components.campaigns.results-loader.title"}}</h1>
        <p class="results-loader__subtitle">{{t "components.campaigns.results-loader.subtitle"}}</p>
        <ul class="results-loader__steps">
          <Line @visible={{true}} @iconTransitionDuration={{this.iconTransitionDuration}}>
            {{t "components.campaigns.results-loader.steps.competences"}}
          </Line>
          <Line @visible={{gt this.steps 1}} @iconTransitionDuration={{this.iconTransitionDuration}}>
            {{t "components.campaigns.results-loader.steps.trainings"}}
          </Line>
          <Line @visible={{gt this.steps 2}} @iconTransitionDuration={{this.iconTransitionDuration}}>
            {{t "components.campaigns.results-loader.steps.rewards"}}
          </Line>
        </ul>

        <PixButton
          class="results-loader__button"
          @isDisabled={{this.isButtonDisabled}}
          @triggerAction={{this.onClick}}
        >{{t "common.actions.continue"}}</PixButton>
      </div>
    </main>
  </template>
}

class Line extends Component {
  @tracked isIconDisplayed = false;

  @action
  displayIcon() {
    setTimeout(() => {
      this.isIconDisplayed = true;
    }, this.args.iconTransitionDuration);
  }

  <template>
    <li class="line {{if @visible 'line--visible'}}" {{callOnTrue this.displayIcon @visible}}>
      <PixIcon
        class="line__icon {{if this.isIconDisplayed 'line__icon--visible'}}"
        @name="checkCircle"
        @plainIcon={{true}}
      />
      {{yield}}
    </li>
  </template>
}
