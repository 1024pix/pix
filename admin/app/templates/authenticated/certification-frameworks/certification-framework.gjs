import pageTitle from 'ember-page-title/helpers/page-title';
import Component from "@glimmer/component";
import { service } from "@ember/service";

export default class CertificationFrameworkTemplate extends Component {
  @service intl;

  <template>
    {{pageTitle "Référentiel " @model.frameworkKey " | Pix Admin" replace=true}}
    {{outlet}}
  </template>
}
