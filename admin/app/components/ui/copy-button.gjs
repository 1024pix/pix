import { PixIconButton, PixTooltip } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class CopyButton extends Component {
  @service intl;
  @tracked isCopied = false;

  get isSupported() {
    return Boolean(this.args.value) && Boolean(navigator.clipboard);
  }

  get tooltipText() {
    return this.isCopied ? this.intl.t('common.actions.copied') : this.args.tooltip;
  }

  copyToClipboard = async () => {
    if (!this.isSupported) return;
    await navigator.clipboard.writeText(this.args.value);
    this.isCopied = true;
  };

  reset = () => {
    this.isCopied = false;
  };

  <template>
    {{#if this.isSupported}}
      <PixTooltip @id={{@id}} @position="top" @isInline={{true}}>
        <:triggerElement>
          <PixIconButton
            @ariaLabel={{@label}}
            aria-describedby={{@id}}
            @iconName="copy"
            @size="small"
            @triggerAction={{this.copyToClipboard}}
            {{on "focusout" this.reset}}
          />
        </:triggerElement>
        <:tooltip>{{this.tooltipText}}</:tooltip>
      </PixTooltip>
    {{/if}}
  </template>
}
