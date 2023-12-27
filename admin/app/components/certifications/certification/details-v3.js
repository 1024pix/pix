import Component from '@glimmer/component';

const options = [
  { value: 'ok', label: 'OK', color: 'success' },
  { value: 'ko', label: 'KO', color: 'neutral' },
  { value: null, label: 'Signalement validé', color: 'error' },
  { value: 'aband', label: 'Abandonnée', color: 'tertiary' },
];
export default class DetailsV3 extends Component {
  answerStatusLabel(status) {
    return options.find((option) => option.value === status).label;
  }

  answerStatusColor(status) {
    return options.find((option) => option.value === status).color;
  }

  externalUrlForPreviewChallenge(challengeId) {
    return `https://app.pix.fr/challenges/${challengeId}/preview`;
  }

  externalUrlForPixEditor(challengeId) {
    return `https://editor.pix.fr/challenge/${challengeId}`;
  }
}
