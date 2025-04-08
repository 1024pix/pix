import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import { action } from '@ember/object';
import Component from '@glimmer/component';

import TableHeader from './header';

export default class HeaderSort extends Component {
  get classname() {
    const className = ['table__column--sort'];
    if (this.args.display === 'left') {
      className.push('table__column--sort-no-center');
    }
    return className.join(' ');
  }

  get icon() {
    if (!this.args.order) {
      return 'sort';
    }
    return this.args.order === 'asc' ? 'arrowTop' : 'arrowBottom';
  }

  get ariaLabel() {
    if (!this.args.order) {
      return this.args.ariaLabelDefaultSort;
    }
    return this.args.order === 'asc' ? this.args.ariaLabelSortUp : this.args.ariaLabelSortDown;
  }

  @action
  toggleSort() {
    if (this.args.order === 'asc') {
      this.args.onSort('desc');
    } else {
      this.args.onSort('asc');
    }
  }

  <template>
    <TableHeader @size={{@size}} @align={{@align}} aria-sort={{@order}} ...attributes>
      <span class={{this.classname}}>
        {{yield}}
        {{#unless @isDisabled}}
          <PixIconButton
            @iconName={{this.icon}}
            @triggerAction={{this.toggleSort}}
            @size="small"
            @color="dark-grey"
            aria-label={{this.ariaLabel}}
          />
        {{/unless}}
      </span>
    </TableHeader>
  </template>
}
