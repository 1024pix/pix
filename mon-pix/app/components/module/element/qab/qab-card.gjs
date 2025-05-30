import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class QabCard extends Component {
  get isError() {
    return this.args.status === 'error';
  }

  get isSuccess() {
    return this.args.status === 'success';
  }

  get hasImage() {
    return this.args.card.image?.url?.length > 0;
  }

  <template>
    <div
      class="qab-card {{if @isAnswered 'qab-card--answered'}}"
      style="
      z-index: {{@zIndex}};
      --reverse-index: {{@zIndex}};
    "
    >
      {{#if this.isSuccess}}
        <p role="status" class="sr-only"> {{t "pages.modulix.qab.correct-answer"}} </p>
      {{/if}}
      {{#if this.isError}}
        <p role="status" class="sr-only"> {{t "pages.modulix.qab.incorrect-answer"}} </p>
      {{/if}}
      <div
        class="qab-card__container
          {{if this.isSuccess 'qab-card__container--success'}}
          {{if this.isError 'qab-card__container--error'}}"
      >
        <div class="qab-card-container-content {{if this.hasImage 'qab-card-container-content--with-image'}}">
          {{#if this.hasImage}}
            <img class="qab-card-container-content__image" src={{@card.image.url}} alt={{@card.image.altText}} />
          {{/if}}
          <p class="qab-card-container-content__text">{{@card.text}}</p>
        </div>
      </div>
    </div>
  </template>
}
