import Component from '@glimmer/component';
import ENV from 'mon-pix/config/environment';

export default class Banner extends Component {
  get scoSurveyLink() {
    return ENV.APP.SCO_SURVEY_LINK;
  }
}
