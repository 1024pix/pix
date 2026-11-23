import { PixIcon } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';

const DURATION_SPAN_TRANSLATION_KEYS = {
  very_short: 'pages.catalogue.duration.options.very-short',
  short: 'pages.catalogue.duration.options.short',
  medium: 'pages.catalogue.duration.options.medium',
  long: 'pages.catalogue.duration.options.long',
  very_long: 'pages.catalogue.duration.options.very-long',
};

export default class DurationSpan extends Component {
  @service intl;

  get displayedDurationSpan() {
    const translationKey = DURATION_SPAN_TRANSLATION_KEYS[this.args.durationSpan];
    return translationKey ? this.intl.t(translationKey) : null;
  }

  get ariaLabel() {
    return this.intl.t('pages.catalogue.duration.aria-label', { duration: this.displayedDurationSpan });
  }

  <template>
    {{#if this.displayedDurationSpan}}
      <span class="catalogue-duration-span">
        <PixIcon @name="acute" class="catalogue-duration-span__icon" @ariaHidden={{true}} />
        <span aria-label={{this.ariaLabel}}>{{this.displayedDurationSpan}}</span>
      </span>
    {{/if}}
  </template>
}
