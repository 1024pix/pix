import Component from '@glimmer/component';
import config from '../config/environment';

export default class SessionFinalizationFormBuilderLinkStep extends Component {
  formBuilderLinkUrlNoReportsCategorisation = config.formBuilderLinkUrlNoReportsCategorisation;
  formBuilderLinkUrlReportsCategorisation = config.formBuilderLinkUrlReportsCategorisation;

  get text() {
    return this.args.isReportsCategorizationFeatureToggleEnabled ?
      'Cette étape, facultative, vous permet de nous transmettre tout document que vous jugerez utile de nous communiquer pour le traitement des sessions (capture d\'écran d\'un problème technique, PV de fraude...). Pour cela, suivez ce lien' :
      'Pour transmettre le PV de session scanné, suivez ce lien';
  }

  get subText() {
    return this.args.isReportsCategorizationFeatureToggleEnabled ?
      'Il n\'est plus obligatoire de nous transmettre la feuille d\'émargement et le PV d\'incident scannés. En revanche, ces deux documents doivent être conservés par votre établissement pendant une durée de 2 ans et pouvoir être fournis à Pix en cas de besoin.' :
      '';
  }

  get linkTo() {
    return this.args.isReportsCategorizationFeatureToggleEnabled ?
      this.formBuilderLinkUrlReportsCategorisation :
      this.formBuilderLinkUrlNoReportsCategorisation;
  }
}
