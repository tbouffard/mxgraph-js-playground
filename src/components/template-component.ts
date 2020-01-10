import { LitElement, html, css, customElement, property } from 'lit-element';

import { mxgraph, mxgraphFactory } from 'mxgraph-factory';
import { TemplateService } from '../services/template-service'
const { mxGraph, mxGraphModel } = mxgraphFactory({
  mxLoadResources: false,
  mxLoadStylesheets: false,
});


@customElement('template-component')
export class TemplateComponent extends LitElement {

  @property({ type: String }) content = '';

  static get styles() {
    return css`
      .mxgraph-container { position: absolute; top:0; right:0; bottom:0; left:0; }
    `;
  }
  private service = new TemplateService();

  //
  private container: HTMLElement;
  private model: mxgraph.mxGraphModel;
  private graph: mxgraph.mxGraph;
  private parent: mxgraph.mxCell;
  //

  serviceCall() {
    let test = this.service.test();
    this.content = test;
  }

  protected firstUpdated(_changedProperties: Map<PropertyKey, unknown>): void {
    this.container = this.shadowRoot.getElementById("mxgraph-container");
    console.log(this.container);
    if (this.container) {
      this.model  = new mxGraphModel();
      this.graph  = new mxGraph(this.container, this.model);

      // Gets the default parent for inserting new cells. This
      // is normally the first child of the root (ie. layer 0).
      this.parent = this.graph.getDefaultParent();

      // Adds cells to the model in a single step
      this.graph.getModel().beginUpdate();
      try {
        let v1 = this.graph.insertVertex(this.parent, null, 'Hello,', 20, 20, 80, 30);
        let v2 = this.graph.insertVertex(this.parent, null, 'World!', 200, 150, 80, 30);
        let e1 = this.graph.insertEdge(this.parent, null, '', v1, v2);
      } finally {
        // Updates the display
        this.graph.getModel().endUpdate();
      }
    }
  }

  protected updated(_changedProperties: Map<PropertyKey, unknown>): void {
  }

  render() {
    return html`
      <div id="mxgraph-container-wrapper"><div id="mxgraph-container"></div></div>
      <div>
          <p>${this.content}</p>
          <button @click="${this.serviceCall}">service call</button>
      </div>
    `;
  }
}
