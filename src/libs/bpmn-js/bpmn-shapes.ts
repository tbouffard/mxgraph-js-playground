import { mxgraph, mxgraphFactory } from 'mxgraph-factory';

const { mxShape, mxConnectionConstraint, mxPoint } = mxgraphFactory({
  mxLoadResources: false, // for graph and editors resources files
  mxLoadStylesheets: false,
});

export enum BpmnGatewayType {
  PARALLEL,
  EXCLUSIVE,
}

export const SHAPE_BPMN_GATEWAY = 'bpmn.gateway';

export class BpmnGatewayShape extends mxShape {
  constructor(bounds: mxgraph.mxRectangle, fill: any, stroke: any, strokewidth: number) {
    super();
    console.warn('@@@@BpmnGatewayShape');
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = strokewidth != null ? strokewidth : 1;
  }

  public paintVertexShape(c: mxgraph.mxXmlCanvas2D, x, y, w, h): void {
    // BACKGROUND
    c.setShadow(false);

    // BACKGROUND
    c.begin();
    c.moveTo(w / 2, 0);
    c.lineTo(w, h / 2);
    c.lineTo(w / 2, h);
    c.lineTo(0, h / 2);
    c.close();
    c.fillAndStroke();
    //     'gateway': function(c, x, y, w, h)
    // {
    //     c.begin();
    //     c.moveTo(w / 2, 0);
    //     c.lineTo(w, h / 2);
    //     c.lineTo(w / 2, h);
    //     c.lineTo(0, h / 2);
    //     c.close();
    //     c.fillAndStroke();
    // }

    // from rhombus shape
    // var hw = w / 2;
    // var hh = h / 2;
    //
    // var arcSize = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, mxConstants.LINE_ARCSIZE) / 2;
    // c.begin();
    // this.addPoints(c, [new mxPoint(x + hw, y), new mxPoint(x + w, y + hh), new mxPoint(x + hw, y + h),
    //     new mxPoint(x, y + hh)], this.isRounded, arcSize, true);
    // c.fillAndStroke();

    // OUTLINE
    // c.translate(w / 4, h / 4);
    // h /= 2;
    // w /= 2;

    //add rhombus connections here
    // this.constraints = [
    //   new mxConnectionConstraint(new mxPoint(0.5, 0), true),
    //   new mxConnectionConstraint(new mxPoint(0.5, 1), true),
    //   new mxConnectionConstraint(new mxPoint(0, 0.5), true),
    //   new mxConnectionConstraint(new mxPoint(1, 0.5), true),
    //   new mxConnectionConstraint(new mxPoint(0.25, 0.25), false),
    //   new mxConnectionConstraint(new mxPoint(0.25, 0.75), false),
    //   new mxConnectionConstraint(new mxPoint(0.75, 0.25), false),
    //   new mxConnectionConstraint(new mxPoint(0.75, 0.75), false),
    // ];

    // SYMBOL

    // exclusive gateway
    // c.translate(w * 0.12, 0);
    // w = w * 0.76;

    this.addParallelGwSymbol(c, x, y, w, h);
  }

  private addParallelGwSymbol(c: mxgraph.mxXmlCanvas2D, x: number, y: number, w: number, h: number): void {
    // const strokeColor = c.state.strokeColor;
    // const fillColor = c.state.fillColor;
    // c.setStrokeColor(fillColor);
    // c.setFillColor(strokeColor);

    c.begin();
    c.moveTo(w * 0.105, 0);
    c.lineTo(w * 0.5, h * 0.38);
    c.lineTo(w * 0.895, h * 0);
    c.lineTo(w, h * 0.11);
    c.lineTo(w * 0.6172, h * 0.5);
    c.lineTo(w, h * 0.89);
    c.lineTo(w * 0.895, h);
    c.lineTo(w * 0.5, h * 0.62);
    c.lineTo(w * 0.105, h);
    c.lineTo(0, h * 0.89);
    c.lineTo(w * 0.3808, h * 0.5);
    c.lineTo(0, h * 0.11);
    c.close();
    c.fillAndStroke();

    // c.setStrokeColor(strokeColor);
    // c.setFillColor(fillColor);
  }

  private addExclusiveGwSymbol(c: mxgraph.mxXmlCanvas2D, x: number, y: number, w: number, h: number): void {
    // const strokeColor = c.state.strokeColor;
    // const fillColor = c.state.fillColor;
    // c.setStrokeColor(fillColor);
    // c.setFillColor(strokeColor);

    c.begin();
    c.moveTo(w * 0.38, 0);
    c.lineTo(w * 0.62, 0);
    c.lineTo(w * 0.62, h * 0.38);
    c.lineTo(w, h * 0.38);
    c.lineTo(w, h * 0.62);
    c.lineTo(w * 0.62, h * 0.62);
    c.lineTo(w * 0.62, h);
    c.lineTo(w * 0.38, h);
    c.lineTo(w * 0.38, h * 0.62);
    c.lineTo(0, h * 0.62);
    c.lineTo(0, h * 0.38);
    c.lineTo(w * 0.38, h * 0.38);
    c.close();
    c.fillAndStroke();

    // c.setStrokeColor(strokeColor);
    // c.setFillColor(fillColor);
  }
}
