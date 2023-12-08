import Component from '@glimmer/component';
import dayjs from 'dayjs';

export default class Title extends Component {
  get todayDate() {
    return dayjs();
  }
}
