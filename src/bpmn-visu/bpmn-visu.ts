import {css, customElement, html, LitElement, property} from 'lit-element';

import {BpmnJs} from '../libs/bpmn-js/bpmn-js';
import getStyle from './style';


@customElement('bpmn-visu')
export class BpmnVisu extends LitElement {
  private static containerIdCss = css`visu-container`;

  static get styles() {
    return getStyle(BpmnVisu.containerIdCss);
  }

  @property({type: String})
  private config = '';

  private container: HTMLElement;
  private bpmnJs: BpmnJs;

  constructor() {
    super();
  }

  public render() {
    return html`
      <div id="${BpmnVisu.containerIdCss}">
        <slot name="graph"></slot>
        <slot name="status"></slot>
      </div>
    `;
  }

  protected firstUpdated(_changedProperties: Map<PropertyKey, unknown>): void {
    this.container = this.shadowRoot.getElementById(`${BpmnVisu.containerIdCss}`);
    // this.bpmnJs = new BpmnJs(this.container);
    // this.bpmnJs.load();
    console.log(this.container);
    this.bpmnJs = new BpmnJs('config/editor.xml');
    this.bpmnJs.initConfig();
    this.bpmnJs.load();
  }
}
