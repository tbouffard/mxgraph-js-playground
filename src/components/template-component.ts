import {css, customElement, html, LitElement, property} from 'lit-element';

import {BpmnJs} from '../libs/bpmn-js/bpmn-js';
import {TemplateService} from '../services/template-service';
import getStyle from './style';


@customElement('template-component')
export class TemplateComponent extends LitElement {
  private static containerIdCss = css`mxgraph-container`;

  static get styles() {
    return getStyle(TemplateComponent.containerIdCss);
  }

  @property({type: String})
  private content = '';

  private service = new TemplateService();
  private container: HTMLElement;
  private bpmnJs: BpmnJs;

  constructor() {
    super();
  }

  public render() {
    return html`
      <div id="${TemplateComponent.containerIdCss}-wrapper"><div id="${TemplateComponent.containerIdCss}"></div></div>
      <div>
          <button @click="${this.serviceCall}">service call</button>
          <span>${this.content}</span>
      </div>
    `;
  }

  protected firstUpdated(_changedProperties: Map<PropertyKey, unknown>): void {
    this.container = this.shadowRoot.getElementById(`${TemplateComponent.containerIdCss}`);
    this.bpmnJs = new BpmnJs(this.container);
    this.bpmnJs.draw();
  }

  private serviceCall() {
    this.content = this.service.test();
  }
}
