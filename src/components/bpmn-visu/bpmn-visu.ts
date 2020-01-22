import {css, customElement, html, LitElement, property} from 'lit-element';

import {BpmnJs} from '../../libs/bpmn-js/bpmn-js';
import getStyle from './style';


@customElement('bpmn-visu')
export class BpmnVisu extends LitElement {
  private static containerIdCss = css`visu-container`;

  static get styles() {
    return getStyle(BpmnVisu.containerIdCss);
  }

  @property({type: String})
  private config = '';

  private bpmnJs: BpmnJs;

  constructor() {
    super();
  }

  public render() {
    return html`
      <div id="${BpmnVisu.containerIdCss}">
        <slot id="graphSlot" name="graph"></slot>
        <slot id="statusSlot" name="status"></slot>
      </div>
    `;
  }

  protected firstUpdated(_changedProperties: Map<PropertyKey, unknown>): void {
    // Initialize bpmn-js
    this.bpmnJs = new BpmnJs(this.config);

    this.bpmnJs.loadSampleGraph();
  }
}
