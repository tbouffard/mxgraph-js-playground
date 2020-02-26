import { css, CSSResult, customElement, html, LitElement, property } from 'lit-element';
import { TemplateResult } from 'lit-html/lib/template-result';

import getStyle from './style';
import ModalGraph from '../../libs/bpmn-js/ModalGraph';
import SubGraph from '../../libs/bpmn-js/SubGraph';
import MainGraph from '../../libs/bpmn-js/MainGraph';

@customElement('bpmn-visu')
export class BpmnVisu extends LitElement {
  private static containerIdCss = css`visu-container`;

  static get styles(): CSSResult {
    return getStyle(BpmnVisu.containerIdCss);
  }

  @property({ type: String })
  private containerId = '';

  @property({ type: String })
  private modalContainerId = '';

  @property({ type: String })
  private subContainerId = '';

  constructor() {
    super();
  }

  public render(): TemplateResult {
    return html`
      <div id="${BpmnVisu.containerIdCss}">
        <slot id="graphContainerSlot" name="graphContainer"></slot>
        <slot id="modalGraphContainerSlot" name="modalGraphContainer"></slot>
        <slot id="subGraphContainerSlot" name="subGraphContainer"></slot>
      </div>
    `;
  }

  protected firstUpdated(): void {
    const mainGraph = new MainGraph(document.getElementById(this.containerId));
    mainGraph.loadGraph();

    // const modalGraph = new ModalGraph(document.getElementById(this.modalContainerId));
    // modalGraph.loadGraph();
    //
    // const subGraph = new SubGraph(document.getElementById(this.subContainerId));
    // subGraph.loadGraph();
  }
}
