import { css, CSSResult, customElement, html, LitElement, property } from 'lit-element';
import { TemplateResult } from 'lit-html/lib/template-result';

import { BpmnJs } from '../../libs/bpmn-js/bpmn-js';
//import { BpmnJs } from '../../libs/bpmn-js/mymxgraph';
import getStyle from './style';

@customElement('bpmn-visu')
export class BpmnVisu extends LitElement {
  private static containerIdCss = css`visu-container`;

  static get styles(): CSSResult {
    return getStyle(BpmnVisu.containerIdCss);
  }

  @property({ type: String })
  private containerId = '';

  private bpmnJs: BpmnJs;

  constructor() {
    super();
  }

  public render(): TemplateResult {
    /*return html``;*/

    return html`
      <div id="${BpmnVisu.containerIdCss}">
        <slot id="graphContainerSlot" name="graphContainer" ></slot>
      </div>
    `;
  }

  protected firstUpdated(): void {
    // Initialize bpmn-js
    this.bpmnJs = new BpmnJs(document.getElementById(this.containerId));

    this.bpmnJs.loadGraph();
  }
}
