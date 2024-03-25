import Component from '@glimmer/component';

export default class CheckpointContinue extends Component {
  get query() {
    return {
      hasSeenCheckpoint: true,
    };
  }
}
