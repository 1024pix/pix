import PixAccordions from '@1024pix/pix-ui/components/pix-accordions';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import Component from '@glimmer/component';

export default class ExpandableAccordion extends Component {
  accordionId = guidFor(this);

  get isExpanded() {
    return this.args.expansion?.isExpanded(this.accordionId);
  }

  @action
  onToggle(isExpanded) {
    this.args.expansion?.setExpansion(this.accordionId, isExpanded);
  }

  <template>
    <PixAccordions @isExpanded={{this.isExpanded}} @onToggle={{this.onToggle}} ...attributes>
      <:title>{{yield to="title"}}</:title>
      <:content>{{yield to="content"}}</:content>
    </PixAccordions>
  </template>
}
