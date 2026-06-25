import { service } from '@ember/service';
import Component from '@glimmer/component';
import pageTitle from 'ember-page-title/helpers/page-title';

export default class CertificationFrameworkTemplate extends Component {
  @service intl;

  <template>
    {{pageTitle "Référentiel " @model.frameworkKey " | Pix Admin" replace=true}}
    {{outlet}}
  </template>
}
