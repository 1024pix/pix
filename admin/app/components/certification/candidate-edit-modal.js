import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class CandidateEditModal extends Component {

  @tracked firstName;
  @tracked lastName;
  @tracked birthdate;
  @tracked birthCity;

}
