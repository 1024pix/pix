import { PixIconButton, PixTooltip } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class CopyPasteButton extends Component {
  @tracked tooltipText;

  constructor() {
    super(...arguments);
    this.tooltipText = this.args.defaultMessage;
  }

  get isClipboardSupported() {
    return Boolean(navigator.clipboard);
  }

  get tooltipId() {
    return this.args.tooltipId ?? `tooltip-${crypto.randomUUID().slice(0, 10)}`;
  }

  get tooltipPosition() {
    return this.args.tooltipPosition ?? 'bottom';
  }

  @action
  async copyToClipboard() {
    await navigator.clipboard.writeText(this.args.clipBoardtext);
    this.tooltipText = this.args.successMessage;
  }

  @action
  onClipboardOut() {
    this.tooltipText = this.args.defaultMessage;
  }

  <template>
    {{#if this.isClipboardSupported}}
      <PixTooltip
        @id={{this.tooltipId}}
        @position={{this.tooltipPosition}}
        @isInline={{true}}
        class="copy-paste-button__tooltip hide-on-mobile"
      >
        <:triggerElement>
          <PixIconButton
            @ariaLabel={{@defaultMessage}}
            @iconName="copy"
            @size="small"
            @triggerAction={{this.copyToClipboard}}
            {{on "mouseleave" this.onClipboardOut}}
            aria-describedby={{this.tooltipId}}
            class="copy-paste-button__clipboard"
            ...attributes
          />
        </:triggerElement>
        <:tooltip>
          {{this.tooltipText}}
        </:tooltip>
      </PixTooltip>
    {{/if}}
  </template>
}
