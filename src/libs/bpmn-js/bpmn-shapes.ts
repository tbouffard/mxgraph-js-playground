import { mxgraph, mxgraphFactory } from 'mxgraph-factory';

const { mxShape, mxConstants, mxPoint, mxUtils } = mxgraphFactory({
  mxLoadResources: false, // for graph and editors resources files
  mxLoadStylesheets: false,
});

export const GATEWAY_TYPE = 'gw.type';
export enum BpmnGatewayType {
  PARALLEL = 'para',
  EXCLUSIVE = 'exclu',
  COMPLEX = 'complex',
}

export const SHAPE_BPMN_GATEWAY = 'bpmn.gateway';

export class BpmnGatewayShape extends mxShape {
  constructor(bounds: mxgraph.mxRectangle, fill: any, stroke: any, strokewidth: number) {
    super();
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = strokewidth != null ? strokewidth : 1;
  }

  public paintVertexShape(c: mxgraph.mxXmlCanvas2D, x, y, w, h): void {
    // BACKGROUND
    c.setShadow(false);

    // BACKGROUND
    // from draw.io
    // c.begin();
    // c.moveTo(w / 2, 0);
    // c.lineTo(w, h / 2);
    // c.lineTo(w / 2, h);
    // c.lineTo(0, h / 2);
    // c.close();
    // c.fillAndStroke();
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
    const hw = w / 2;
    const hh = h / 2;
    //
    const arcSize = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, mxConstants.LINE_ARCSIZE) / 2;
    c.begin();
    this.addPoints(c, [new mxPoint(x + hw, y), new mxPoint(x + w, y + hh), new mxPoint(x + hw, y + h), new mxPoint(x, y + hh)], this.isRounded, arcSize, true, null, null);
    c.fillAndStroke();

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
    const gwType = mxUtils.getValue(this.style, GATEWAY_TYPE, BpmnGatewayType.PARALLEL);
    console.info('@@gw type: ', gwType);
    if (gwType == BpmnGatewayType.EXCLUSIVE) {
      console.info('@@exclusive');

      const symbolHeight = (h / 2) * 0.85;
      const symbolWidth = (w / 2) * 0.85;

      const heightDeviation = (h - symbolHeight) / 2;
      const widthDeviation = (w - symbolWidth) / 2;
      c.translate(x + widthDeviation, y + heightDeviation);
      this.addExclusiveGwSymbol(c, x, y, symbolWidth, symbolHeight);

      // c.translate(w * 0.12, 0);

      // w *= 0.76;
      // h *= 0.76;
      // c.translate(x + w / 2, y + h / 2);
      //
      //this.addExclusiveGwSymbol(c, x, y, w, h);
    }
    // PARALLEL
    else {
      console.info('@@parallel');
      const symbolHeight = h / 2;
      const symbolWidth = w / 2;

      const heightDeviation = (h - symbolHeight) / 2;
      const widthDeviation = (w - symbolWidth) / 2;
      c.translate(x + widthDeviation, y + heightDeviation);
      // h /= 2;
      // w /= 2;
      // c.translate(x + w / 2, y + h / 2);
      this.addParallelGwSymbol(c, x, y, symbolWidth, symbolHeight);
    }

    //c.translate(x + w /2, y  + h /2);
    //this.addParallelGwSymbol(c, x, y, w, h);

    // // exclusive gateway
    // // c.translate(w * 0.12, 0);
    // w *= 0.76;
    // h *= 0.76;
    // c.translate(x + w /2, y  + h /2);
    // //
    // this.addExclusiveGwSymbol(c, x, y, w, h);
  }

  private addExclusiveGwSymbol(c: mxgraph.mxXmlCanvas2D, x: number, y: number, w: number, h: number): void {
    // const strokeColor = c.state.strokeColor;
    // const fillColor = c.state.fillColor;
    const strokeColor = 'black';
    const fillColor = 'white';
    c.setStrokeColor(fillColor);
    c.setFillColor(strokeColor);

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

    c.setStrokeColor(strokeColor);
    c.setFillColor(fillColor);
  }

  private addParallelGwSymbol(c: mxgraph.mxXmlCanvas2D, x: number, y: number, w: number, h: number): void {
    // const strokeColor = c.state.strokeColor;
    // const fillColor = c.state.fillColor;
    const strokeColor = 'black';
    const fillColor = 'white';

    c.setStrokeColor(fillColor);
    c.setFillColor(strokeColor);

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

    c.setStrokeColor(strokeColor);
    c.setFillColor(fillColor);
  }
}
