import Component from '@glimmer/component';

export default class Category extends Component {
  get category() {
    const { category } = this.args;
    switch (category) {
      case 'COMPETENCES':
        return 'Compétences Pix';
      case 'SUBJECT':
        return 'Thématique';
      case 'DISCIPLINE':
        return 'Disciplinaire';
      case 'CUSTOM':
        return 'Sur-mesure';
      case 'PREDEFINED':
        return 'Prédéfinie';
      default:
        return 'Autre';
    }
  }
}
