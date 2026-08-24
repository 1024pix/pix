import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class Tube extends Component {
  @tracked skillAvailabilityMap = [];

  <template>
    <td data-testid="title-{{@id}}">
      {{@title}}
    </td>
    <td class="table__column--center">
      <div class="level-selection">
        <span data-testid="level-{{@id}}">{{@level}}</span>
      </div>
    </td>
  </template>
}
