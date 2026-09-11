import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { modifier } from 'ember-modifier';
import { eq, gt, or } from 'ember-truth-helpers';

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

  get stepList() {
    return [
      'pages.combined-courses.process-custom-passages.list.results-analysis',
      'pages.combined-courses.process-custom-passages.list.select-passages',
      'pages.combined-courses.process-custom-passages.list.generate-personalize-course',
    ];
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
    this.router.transitionTo('combined-courses.programme', this.args.code);
  }

  <template>
    <main role="main" class="process-custom-passages">
      <div class="process-custom-passages__content">
        <img
          class="process-custom-passages__illustration"
          alt=""
          src="https://assets.pix.org/combined-courses/loading-passages-state.svg"
        />
        <h1 class="process-custom-passages__title">{{t "pages.combined-courses.process-custom-passages.title"}}</h1>
        <p class="process-custom-passages__subtitle">{{t
            "pages.combined-courses.process-custom-passages.description"
          }}</p>

        <ol class="process-custom-passages__steps">
          {{#each this.stepList as |step index|}}
            <Line
              @visible={{or (eq this.steps 0) (gt this.steps index)}}
              @iconTransitionDuration={{this.iconTransitionDuration}}
            >
              {{t step}}
            </Line>
          {{/each}}
        </ol>

        <PixButton
          class="process-custom-passages__button"
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
        @ariaHidden={{true}}
      />
      {{yield}}
    </li>
  </template>
}
