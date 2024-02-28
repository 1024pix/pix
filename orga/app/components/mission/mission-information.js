import Component from '@glimmer/component';

export default class MissionInformation extends Component {
  get displayObjectives() {
    return this.args.mission.learningObjectives?.split('\n');
  }
}
