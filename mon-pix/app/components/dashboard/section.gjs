import { PixButtonLink } from '@1024pix/nebulix-ember';
import Component from '@glimmer/component';

export default class Section extends Component {
  <template>
    <section class="dashboard-section" ...attributes>
      <div class="dashboard-section__header{{if this.hasLink '--with-button'}}">
        <div>
          <h2 class="dashboard-section__title">{{@title}}</h2>
          <p class="dashboard-section__subtitle">{{@subtitle}}</p>
        </div>
        {{#if this.hasLink}}
          <PixButtonLink
            @route={{@linkRoute}}
            class="dashboard-section__button"
            @variant="secondary"
            aria-label={{@ariaLabelLink}}
          >{{@linkText}}</PixButtonLink>
        {{/if}}
      </div>

      {{yield}}
    </section>
  </template>
  get hasLink() {
    return this.args.linkRoute && this.args.linkText;
  }
}
