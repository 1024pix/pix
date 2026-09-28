import { PixBlock, PixButtonLink } from '@1024pix/nebulix-ember';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';

export default class InaccessibleContent extends Component {
  get buttonText() {
    return this.args.buttonText ?? 'navigation.back-to-profile';
  }
  <template>
    <PixBlock ...attributes>
      <div class="inaccessible-content__image-container">
        <div class="inaccessible-content__pix-logo">
          <img class="inaccessible-content__image" src="/images/pix-logo.svg" alt="{{t 'navigation.pix'}}" />
        </div>
      </div>
      <div class="inaccessible-content__error">
        <h1 class="inaccessible-content__error__title">{{yield to="title"}}</h1>
        {{#if (has-block "content")}}
          {{yield to="content"}}
        {{/if}}
        {{#if (has-block "instructions")}}
          <div class="inaccessible-content__error__instructions">{{yield to="instructions"}}</div>
        {{/if}}
        <PixButtonLink @route="authenticated" class="inaccessible-content__button">
          {{t this.buttonText}}
        </PixButtonLink>
      </div>
    </PixBlock>
  </template>
}
