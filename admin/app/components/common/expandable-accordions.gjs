import PixButton from '@1024pix/pix-ui/components/pix-button';
import { hash } from '@ember/helper';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class ExpandableAccordions extends Component {
  @tracked isExpandedByDefault = false;
  @tracked expansionByAccordionId = new Map();

  get displayToolbar() {
    return this.args.displayToolbar ?? true;
  }

  @action
  isExpanded(accordionId) {
    return this.expansionByAccordionId.get(accordionId) ?? this.isExpandedByDefault;
  }

  @action
  setExpansion(accordionId, isExpanded) {
    this.expansionByAccordionId = new Map(this.expansionByAccordionId).set(accordionId, isExpanded);
  }

  @action
  expandAll() {
    this.setDefaultExpansion(true);
  }

  @action
  collapseAll() {
    this.setDefaultExpansion(false);
  }

  setDefaultExpansion(isExpandedByDefault) {
    this.isExpandedByDefault = isExpandedByDefault;
    this.expansionByAccordionId = new Map();
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

      {{yield (hash isExpanded=this.isExpanded setExpansion=this.setExpansion)}}
    </div>
  </template>
}
