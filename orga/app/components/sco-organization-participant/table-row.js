import { CONNECTION_TYPES } from '../../helpers/connection-types';
import Component from '@glimmer/component';

export default class TableRow extends Component {
  get connectionTypes() {
    return CONNECTION_TYPES;
  }
}
