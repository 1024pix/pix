import PixButton from '@1024pix/pix-ui/components/pix-button';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { modifier } from 'ember-modifier';

const MAX_EXPAND_PASSES = 20;

export default class ExpandableAccordions extends Component {
  container;
  pendingPass = null;

  setContainer = modifier((element) => {
    this.container = element;
  });

  @action
  expandAll() {
    this.cancelPendingPass();
    this.applyExpandState(true);
  }

  @action
  collapseAll() {
    this.cancelPendingPass();
    this.applyExpandState(false);
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.cancelPendingPass();
  }

  cancelPendingPass() {
    if (this.pendingPass !== null) {
      cancelAnimationFrame(this.pendingPass);
      this.pendingPass = null;
    }
  }

  applyExpandState(shouldExpand, remainingPasses = MAX_EXPAND_PASSES) {
    if (!this.container) return;

    let clicked = false;
    const buttons = this.container.querySelectorAll('button.pix-accordions__title');
    buttons.forEach((button) => {
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      if (isExpanded !== shouldExpand) {
        button.click();
        clicked = true;
      }
    });

    if (shouldExpand && clicked && remainingPasses > 0) {
      this.pendingPass = requestAnimationFrame(() => {
        this.pendingPass = null;
        this.applyExpandState(shouldExpand, remainingPasses - 1);
      });
    }
  }

  <template>
    <div class="expandable-accordions">
      <div class="expandable-accordions__toolbar">
        <PixButton @variant="tertiary" @size="small" @triggerAction={{this.expandAll}}>
          {{t "common.actions.expand-all"}}
        </PixButton>
        <span class="expandable-accordions__separator" aria-hidden="true">-</span>
        <PixButton @variant="tertiary" @size="small" @triggerAction={{this.collapseAll}}>
          {{t "common.actions.collapse-all"}}
        </PixButton>
      </div>

      <div {{this.setContainer}}>
        {{yield}}
      </div>
    </div>
  </template>
}
