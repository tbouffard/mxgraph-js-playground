import { mxgraph, mxgraphFactory } from 'mxgraph-factory';

const { mxShape, mxConstants, mxPoint, mxUtils, mxRectangleShape } = mxgraphFactory({
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
export const SHAPE_BPMN_TASK_USER = 'bpmn.task.user';

abstract class AbstractBpmnShape extends mxShape {
  protected constructor(bounds: mxgraph.mxRectangle, fill: any, stroke: any, strokewidth: number) {
    super();
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = strokewidth != null ? strokewidth : 1;
  }
}

export class BpmnShapeGateway extends AbstractBpmnShape {
  constructor(bounds: mxgraph.mxRectangle, fill: any, stroke: any, strokewidth: number) {
    super(bounds, fill, stroke, strokewidth);
    // this.bounds = bounds;
    // this.fill = fill;
    // this.stroke = stroke;
    // this.strokewidth = strokewidth != null ? strokewidth : 1;
  }

  // TODO we may only consider x and w to have same proportion with y and h
  public paintVertexShape(c: mxgraph.mxXmlCanvas2D, x: number, y: number, w: number, h: number): void {
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
    // constraints: in design mode, would be interesting
    // in visu mode, to be confirmed depending of configuration defined in the bpmn file (connection point on the shape may be defined there)
    // https://jgraph.github.io/mxgraph/docs/js-api/files/view/mxConnectionConstraint-js.html#mxConnectionConstraint
    // Defines an object that contains the constraints about how to connect one side of an edge to its terminal.
    // the following is taken from draw.io gateway
    // first 4 constraints are for the edge of the rhombus
    // mxShape ts type does not have a 'constraints' field
    //
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
    if (gwType == BpmnGatewayType.EXCLUSIVE) {
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

abstract class BpmnShapeTask extends mxRectangleShape {
  public paintVertexShape(c: mxgraph.mxXmlCanvas2D, x: number, y: number, w: number, h: number): void {
    this.isRounded = true;
    // the following is taken from mxshape
    this.paintBackground(c, x, y, w, h);

    // TODO make it work
    // if (!this.outline || this.style == null || mxUtils.getValue(this.style, mxConstants.STYLE_OUBACKGROUND_OUTLINE, 0) == 0) {
    //   c.setShadow(false);
    //   this.paintForeground(c, x, y, w, h);
    // }

    // custom to add symbols
    // may apply to all bpmn shapes that require adding symbols
    this.paintSymbols(c, x, y, w, h);
  }

  protected abstract paintSymbols(c: mxgraph.mxXmlCanvas2D, x: number, y: number, w: number, h: number): void;
}

export class BpmnShapeTaskUser extends BpmnShapeTask {
  // TAKEN from mxgraph mxActor
  protected paintSymbols(c: mxgraph.mxXmlCanvas2D, x: number, y: number, w: number, h: number): void {
    c.translate(x + w/10, y + h/10);
    c.begin();
    this.redrawActor(c, x, y, w/6, h/6);
    c.fillAndStroke();
  }

  private redrawActor(c: mxgraph.mxXmlCanvas2D, x: number, y: number, w: number, h: number): void {
    const width = w / 3;
    c.moveTo(0, h);
    c.curveTo(0, (3 * h) / 5, 0, (2 * h) / 5, w / 2, (2 * h) / 5);
    c.curveTo(w / 2 - width, (2 * h) / 5, w / 2 - width, 0, w / 2, 0);
    c.curveTo(w / 2 + width, 0, w / 2 + width, (2 * h) / 5, w / 2, (2 * h) / 5);
    c.curveTo(w, (2 * h) / 5, w, (3 * h) / 5, w, h);
    c.close();
  }
}

/*
TAKEN from mxgraph mxActor

mxActor.prototype.paintVertexShape = function(c, x, y, w, h)
{
  c.translate(x, y);
  c.begin();
  this.redrawPath(c, x, y, w, h);
  c.fillAndStroke();
};

mxActor.prototype.redrawPath = function(c, x, y, w, h)
{
  var width = w/3;
  c.moveTo(0, h);
  c.curveTo(0, 3 * h / 5, 0, 2 * h / 5, w / 2, 2 * h / 5);
  c.curveTo(w / 2 - width, 2 * h / 5, w / 2 - width, 0, w / 2, 0);
  c.curveTo(w / 2 + width, 0, w / 2 + width, 2 * h / 5, w / 2, 2 * h / 5);
  c.curveTo(w, 2 * h / 5, w, 3 * h / 5, w, h);
  c.close();
};


 */
