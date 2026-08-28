import PixButton from '@1024pix/pix-ui/components/pix-button';
import { hash } from '@ember/helper';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { runTask } from 'ember-lifeline';

const ACCORDIONS_PER_WAVE = 3;
const DELAY_BETWEEN_WAVES_MS = 0;

export default class ExpandableAccordions extends Component {
  @tracked expansionByAccordionId = new Map();

  accordionIds = new Set();
  expansionGeneration = 0;

  get displayToolbar() {
    return this.args.displayToolbar ?? true;
  }

  @action
  registerAccordion(accordionId) {
    this.accordionIds.add(accordionId);
  }

  @action
  unregisterAccordion(accordionId) {
    this.accordionIds.delete(accordionId);
  }

  @action
  isExpanded(accordionId) {
    return this.expansionByAccordionId.get(accordionId) ?? false;
  }

  @action
  setExpansion(accordionId, isExpanded) {
    this.expansionByAccordionId = new Map(this.expansionByAccordionId).set(accordionId, isExpanded);
  }

  @action
  expandAll() {
    this.expansionGeneration += 1;
    this.expandNextWave(this.expansionGeneration);
  }

  @action
  collapseAll() {
    this.expansionGeneration += 1;
    this.expansionByAccordionId = new Map();
  }

  expandNextWave(generation) {
    if (generation !== this.expansionGeneration) return;

    const collapsedAccordionIds = [...this.accordionIds].filter((accordionId) => !this.isExpanded(accordionId));
    if (collapsedAccordionIds.length === 0) return;

    collapsedAccordionIds.slice(0, ACCORDIONS_PER_WAVE).forEach((accordionId) => this.setExpansion(accordionId, true));

    runTask(this, () => this.expandNextWave(generation), DELAY_BETWEEN_WAVES_MS);
  }

  <template>
    <div class="expandable-accordions">
      {{#if this.displayToolbar}}
        <div class="expandable-accordions__toolbar">
          <PixButton @variant="tertiary" @size="small" @triggerAction={{this.expandAll}}>
            Tout déplier
          </PixButton>
          <PixButton @variant="tertiary" @size="small" @triggerAction={{this.collapseAll}}>
            Tout replier
          </PixButton>
        </div>
      {{/if}}

      {{yield
        (hash
          isExpanded=this.isExpanded
          setExpansion=this.setExpansion
          registerAccordion=this.registerAccordion
          unregisterAccordion=this.unregisterAccordion
        )
      }}
    </div>
  </template>
}
