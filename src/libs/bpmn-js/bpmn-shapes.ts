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
export const SHAPE_BPMN_TASK_BUSINESS_RULE = 'bpmn.task.businessrule';
export const SHAPE_BPMN_TASK_USER = 'bpmn.task.user';
export const SHAPE_BPMN_TASK_SERVICE = 'bpmn.task.service';

export const BPMN_SYMBOLS = 'bpmn.symbols';

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
    this.paintTaskSymbol(c, x, y, w, h);

    this.paintSymbols(c, x, y, w, h);
  }

  protected abstract paintTaskSymbol(c: mxgraph.mxXmlCanvas2D, x: number, y: number, w: number, h: number): void;

  protected paintSymbols(c: mxgraph.mxXmlCanvas2D, x: number, y: number, w: number, h: number): void {
    const symbolsString = mxUtils.getValue(this.style, BPMN_SYMBOLS, '') as string;
    const symbols = symbolsString.split(',');
    symbols
      .map(symbol => symbol.trim())
      .filter(s => s.length != 0)
      .forEach(symbol => {
        const symbolBaseSize = Math.min(w, h);

        const xTranslation = x + w / 2;
        const yTranslation = y + (h * 8) / 10;
        c.translate(xTranslation, yTranslation);

        switch (symbol) {
          case 'compensation': {
            this.drawCompensation(c, x, y, symbolBaseSize / 6, symbolBaseSize / 6);
            break;
          }
          case 'loop': {
            this.drawLoop(c, x, y, symbolBaseSize, symbolBaseSize);
            break;
          }
          case 'multi-parallel': {
            this.drawMultipleParallel(c, symbolBaseSize / 6, symbolBaseSize / 6);
            break;
          }
          case 'multi-sequential': {
            this.drawMultipleSequential(c, symbolBaseSize / 6, symbolBaseSize / 6);
            break;
          }
          default: {
            // ignored
          }
        }
        // TODO hack translation
        c.translate(-xTranslation, -yTranslation);
      });
  }

  // from draw.io
  private drawCompensation(c: mxgraph.mxXmlCanvas2D, x: number, y: number, w: number, h: number): void {
    c.begin();
    c.moveTo(0, h * 0.5);
    c.lineTo(w * 0.5, 0);
    c.lineTo(w * 0.5, h);
    c.close();
    c.moveTo(w * 0.5, h * 0.5);
    c.lineTo(w, 0);
    c.lineTo(w, h);
    c.close();
    c.fillAndStroke();
    /*
<shape h="10" name="Compensation" strokewidth="inherit" w="15">
    <connections/>
    <background>
        <path>
            <move x="0" y="5"/>
            <line x="7.5" y="0"/>
            <line x="7.5" y="10"/>
            <close/>
            <move x="7.5" y="5"/>
            <line x="15" y="0"/>
            <line x="15" y="10"/>
            <close/>
        </path>
    </background>
    <foreground>
        <fillstroke/>
    </foreground>
</shape>
     */
  }

  // TODO duplication with parallel
  // TODO we could rotate the parallel symbol
  private drawMultipleSequential(c: mxgraph.mxXmlCanvas2D, w: number, h: number): void {
    c.begin();
    c.setStrokeWidth(1);
    c.setFillColor(this.stroke);
    const h2 = h / 5;
    c.rect(0, 0, w, h2);
    c.fillAndStroke();
    c.rect(0, 2 * h2, w, h2);
    c.fillAndStroke();
    c.rect(0, 4 * h2, w, h2);
    c.close();
    c.fillAndStroke();
  }

  private drawMultipleParallel(c: mxgraph.mxXmlCanvas2D, w: number, h: number): void {
    c.begin();
    c.setStrokeWidth(1);
    c.setFillColor(this.stroke);
    const w2 = w / 5;
    c.rect(0, 0, w2, h);
    c.fillAndStroke();
    c.rect(2 * w2, 0, w2, h);
    c.fillAndStroke();
    c.rect(4 * w2, 0, w2, h);
    c.close();
    c.fillAndStroke();

    /*
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
 */
  }

  private drawLoop(c: mxgraph.mxXmlCanvas2D, x: number, y: number, w: number, h: number): void {
    const baseX = -5;
    const baseY = 5;

    c.begin();
    c.moveTo(baseX, baseY);
    c.arcTo(5, 5, 0, 1, 1, baseX + 2.5, baseY + 1);
    c.moveTo(baseX + 1.0, baseY - 4.5);
    c.lineTo(baseX, baseY);
    c.lineTo(baseX - 4.5, baseY - 1.0);
    c.fillAndStroke();
    c.close();

    /*
    <shape h="21.62" name="Loop" strokewidth="inherit" w="22.49">
        <connections/>
        <background>
            <path>
                <move x="5.5" y="19.08"/>
                <arc large-arc-flag="1" rx="10" ry="10" sweep-flag="1" x="10.5" x-axis-rotation="0" y="21.08"/>
                <move x="5.5" y="14.08"/>
                <line x="5.5" y="19.08"/>
                <line x="0" y="17.58"/>
            </path>
        </background>
        <foreground>
            <stroke/>
        </foreground>
    </shape>
    <shape aspect="fixed" h="10.39" name="Loop Marker" strokewidth="inherit" w="15">
        <connections/>
        <background>
            <path>
                <move x="0" y="1.69"/>
                <arc large-arc-flag="0" rx="5" ry="5" sweep-flag="1" x="7.5" x-axis-rotation="0" y="1.69"/>
                <arc large-arc-flag="0" rx="5" ry="5" sweep-flag="0" x="15" x-axis-rotation="0" y="1.69"/>
                <line x="15" y="8.69"/>
                <arc large-arc-flag="0" rx="5" ry="5" sweep-flag="1" x="7.5" x-axis-rotation="0" y="8.69"/>
                <arc large-arc-flag="0" rx="5" ry="5" sweep-flag="0" x="0" x-axis-rotation="0" y="8.69"/>
                <close/>
                <close/>
            </path>
        </background>
        <foreground>
            <fillstroke/>
        </foreground>
    </shape>
    */
  }
}

export class BpmnShapeTaskUser extends BpmnShapeTask {
  // TAKEN from mxgraph mxActor
  protected paintTaskSymbol(c: mxgraph.mxXmlCanvas2D, x: number, y: number, w: number, h: number): void {
    const symbolBaseSize = Math.min(w, h);

    const xTranslation = x + w / 10;
    const yTranslation = y + h / 10;

    c.translate(xTranslation, yTranslation);
    //c.translate(x + w/10, y + h/10);
    c.begin();
    this.redrawActor(c, x, y, symbolBaseSize / 6, symbolBaseSize / 6);
    // this.redrawActor(c, x, y, w/6, h/6);
    c.fillAndStroke();

    // TODO hack for translation
    c.translate(-xTranslation, -yTranslation);
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

  /*
<shape h="91.81" name="User Task" strokewidth="inherit" w="94">
    <connections/>
    <background>
        <path>
            <move x="0" y="91.81"/>
            <line x="0" y="63.81"/>
            <arc large-arc-flag="0" rx="50" ry="50" sweep-flag="1" x="24" x-axis-rotation="0" y="42.81"/>
            <arc large-arc-flag="0" rx="25" ry="25" sweep-flag="1" x="33" x-axis-rotation="0" y="41.81"/>
            <arc large-arc-flag="0" rx="17" ry="17" sweep-flag="0" x="48" x-axis-rotation="0" y="58.81"/>
            <arc large-arc-flag="0" rx="17" ry="17" sweep-flag="0" x="66" x-axis-rotation="0" y="41.81"/>
            <arc large-arc-flag="0" rx="25" ry="25" sweep-flag="1" x="76.8" x-axis-rotation="0" y="42.81"/>
            <arc large-arc-flag="0" rx="35" ry="35" sweep-flag="1" x="94" x-axis-rotation="0" y="63.81"/>
            <line x="94" y="91.81"/>
            <close/>
            <move x="66" y="41.81"/>
            <arc large-arc-flag="0" rx="17" ry="17" sweep-flag="1" x="48" x-axis-rotation="0" y="58.81"/>
            <arc large-arc-flag="0" rx="17" ry="17" sweep-flag="1" x="33" x-axis-rotation="0" y="41.81"/>
            <arc large-arc-flag="0" rx="25" ry="25" sweep-flag="0" x="38" x-axis-rotation="0" y="40.81"/>
            <line x="39" y="36.81"/>
            <arc large-arc-flag="0" rx="10" ry="10" sweep-flag="1" x="32" x-axis-rotation="0" y="30.81"/>
            <arc large-arc-flag="1" rx="18" ry="12" sweep-flag="1" x="66" x-axis-rotation="0" y="30.81"/>
            <arc large-arc-flag="0" rx="12" ry="12" sweep-flag="1" x="58" x-axis-rotation="0" y="36.81"/>
            <line x="59" y="40.81"/>
            <close/>
        </path>
    </background>
    <foreground>
        <fillstroke/>
        <path>
            <move x="16" y="75.81"/>
            <line x="16" y="90.81"/>
            <move x="75" y="75.81"/>
            <line x="75" y="90.81"/>
        </path>
        <stroke/>
        <fillcolor color="#000000"/>
        <path>
            <move x="32" y="30.81"/>
            <arc large-arc-flag="0" rx="15" ry="15" sweep-flag="1" x="29" x-axis-rotation="0" y="13.81"/>
            <arc large-arc-flag="0" rx="22" ry="22" sweep-flag="1" x="48" x-axis-rotation="0" y="0.81"/>
            <arc large-arc-flag="0" rx="22" ry="22" sweep-flag="1" x="70" x-axis-rotation="0" y="13.81"/>
            <arc large-arc-flag="0" rx="15" ry="15" sweep-flag="1" x="66" x-axis-rotation="0" y="30.81"/>
            <arc large-arc-flag="0" rx="15" ry="15" sweep-flag="0" x="64" x-axis-rotation="0" y="21.81"/>
            <arc large-arc-flag="0" rx="15" ry="15" sweep-flag="0" x="50" x-axis-rotation="0" y="20.81"/>
            <arc large-arc-flag="0" rx="15" ry="15" sweep-flag="0" x="35" x-axis-rotation="0" y="21.81"/>
            <arc large-arc-flag="0" rx="15" ry="15" sweep-flag="0" x="32" x-axis-rotation="0" y="30.81"/>
            <close/>
        </path>
        <fillstroke/>
    </foreground>
</shape>

 */

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
}

export class BpmnShapeTaskService extends BpmnShapeTask {
  protected paintTaskSymbol(c: mxgraph.mxXmlCanvas2D, x: number, y: number, w: number, h: number): void {
    const xTranslation = x + w / 10;
    const yTranslation = y + h / 10;

    c.translate(xTranslation, yTranslation);

    // TODO do this with configuration
    c.setFillColor('white');
    this.drawServiceSymbol(c, Math.min(w, h), 0.2);

    // TODO hack for translation
    c.translate(-xTranslation, -yTranslation);
  }

  private drawServiceSymbol(c: mxgraph.mxXmlCanvas2D, parentSize: number, ratioFromParent: number): void {
    // coordinates below fill a box of 80x80
    //const scaleFactor = 0.2;
    const scaleFactor = parentSize / 80 * ratioFromParent;

    // background
    c.begin();
    c.moveTo(2.06* scaleFactor, 24.62* scaleFactor);
    c.lineTo(10.17* scaleFactor, 30.95* scaleFactor);
    c.lineTo(9.29* scaleFactor, 37.73* scaleFactor);
    c.lineTo(0* scaleFactor, 41.42* scaleFactor);
    c.lineTo(2.95* scaleFactor, 54.24* scaleFactor);
    c.lineTo(13.41* scaleFactor, 52.92* scaleFactor);
    c.lineTo(17.39* scaleFactor, 58.52* scaleFactor);
    c.lineTo(13.56* scaleFactor, 67.66* scaleFactor);
    c.lineTo(24.47* scaleFactor, 74.44* scaleFactor);
    c.lineTo(30.81* scaleFactor, 66.33* scaleFactor);
    c.lineTo(37.88* scaleFactor, 67.21* scaleFactor);
    c.lineTo(41.57* scaleFactor, 76.5* scaleFactor);
    c.lineTo(54.24* scaleFactor, 73.55* scaleFactor);
    c.lineTo(53.06* scaleFactor, 62.94* scaleFactor);
    c.lineTo(58.52* scaleFactor, 58.52* scaleFactor);
    c.lineTo(67.21* scaleFactor, 63.09* scaleFactor);
    c.lineTo(74.58* scaleFactor, 51.88* scaleFactor);
    c.lineTo(66.03* scaleFactor, 45.25* scaleFactor);
    c.lineTo(66.92* scaleFactor, 38.62* scaleFactor);
    c.lineTo(76.5* scaleFactor, 34.93* scaleFactor);
    c.lineTo(73.7* scaleFactor, 22.26* scaleFactor);
    c.lineTo(62.64* scaleFactor, 23.44* scaleFactor);
    c.lineTo(58.81* scaleFactor, 18.42* scaleFactor);
    c.lineTo(62.79* scaleFactor, 8.7* scaleFactor);
    c.lineTo(51.74* scaleFactor, 2.21* scaleFactor);
    c.lineTo(44.81* scaleFactor, 10.47* scaleFactor);
    c.lineTo(38.03* scaleFactor, 9.43* scaleFactor);
    c.lineTo(33.75* scaleFactor, 0* scaleFactor);
    c.lineTo(21.52* scaleFactor, 3.24* scaleFactor);
    c.lineTo(22.7* scaleFactor, 13.56* scaleFactor);
    c.lineTo(18.13* scaleFactor, 17.54* scaleFactor);
    c.lineTo(8.7* scaleFactor, 13.56* scaleFactor);
    c.close();

    const arc1Ray = 13.5 * scaleFactor;
    const arc1StartX = 24.8 * scaleFactor;
    const arc1StartY = 39 * scaleFactor;
    c.moveTo(arc1StartX, arc1StartY);
    c.arcTo(arc1Ray, arc1Ray, 0, 1, 1, arc1StartX + 2 * arc1Ray, arc1StartY);
    c.arcTo(arc1Ray, arc1Ray, 0, 0, 1, arc1StartX, arc1StartY);
    c.close();
    c.fillAndStroke();

    // foreground
    c.begin();
    c.moveTo(16.46* scaleFactor, 41.42* scaleFactor);
    c.lineTo(24.57* scaleFactor, 47.75* scaleFactor);
    c.lineTo(23.69* scaleFactor, 54.53* scaleFactor);
    c.lineTo(14.4* scaleFactor, 58.22* scaleFactor);
    c.lineTo(17.35* scaleFactor, 71.04* scaleFactor);
    c.lineTo(27.81* scaleFactor, 69.72* scaleFactor);
    c.lineTo(31.79* scaleFactor, 75.32* scaleFactor);
    c.lineTo(27.96* scaleFactor, 84.46* scaleFactor);
    c.lineTo(38.87* scaleFactor, 91.24* scaleFactor);
    c.lineTo(45.21* scaleFactor, 83.13* scaleFactor);
    c.lineTo(52.28* scaleFactor, 84.01* scaleFactor);
    c.lineTo(55.97* scaleFactor, 93.3* scaleFactor);
    c.lineTo(68.64* scaleFactor, 90.35* scaleFactor);
    c.lineTo(67.46* scaleFactor, 79.74* scaleFactor);
    c.lineTo(72.92* scaleFactor, 75.32* scaleFactor);
    c.lineTo(81.61* scaleFactor, 79.89* scaleFactor);
    c.lineTo(88.98* scaleFactor, 68.68* scaleFactor);
    c.lineTo(80.43* scaleFactor, 62.05* scaleFactor);
    c.lineTo(81.32* scaleFactor, 55.42* scaleFactor);
    c.lineTo(90.9* scaleFactor, 51.73* scaleFactor);
    c.lineTo(88.1* scaleFactor, 39.06* scaleFactor);
    c.lineTo(77.04* scaleFactor, 40.24* scaleFactor);
    c.lineTo(73.21* scaleFactor, 35.22* scaleFactor);
    c.lineTo(77.19* scaleFactor, 25.5* scaleFactor);
    c.lineTo(66.14* scaleFactor, 19.01* scaleFactor);
    c.lineTo(59.21* scaleFactor, 27.27* scaleFactor);
    c.lineTo(52.43* scaleFactor, 26.23* scaleFactor);
    c.lineTo(48.15* scaleFactor, 16.8* scaleFactor);
    c.lineTo(35.92* scaleFactor, 20.04* scaleFactor);
    c.lineTo(37.1* scaleFactor, 30.36* scaleFactor);
    c.lineTo(32.53* scaleFactor, 34.34* scaleFactor);
    c.lineTo(23.1* scaleFactor, 30.36* scaleFactor);
    c.close();


    const arc2Ray = 13.5 * scaleFactor;
    const arc2StartX = 39.2 * scaleFactor;
    const arc2StartY = 55.8 * scaleFactor;
    c.moveTo(arc2StartX, arc2StartY);
    c.arcTo(arc2Ray, arc2Ray, 0, 1, 1, arc2StartX + 2 * arc2Ray, arc2StartY);
    c.arcTo(arc2Ray, arc2Ray, 0, 0, 1, arc2StartX, arc2StartY);

    // c.moveTo(39.2, 55.8);
    // c.arcTo(12, 12, 0, 1, 1, 66.2, 55.8);
    // c.arcTo(12, 12, 0, 0, 1, 39.2, 55.8);
    c.close();
    c.fillAndStroke();

    /*
    <shape h="93.3" name="Service Task" strokewidth="inherit" w="90.9">
        <connections/>
        <background>
            <path>
                <move x="2.06" y="24.62"/>
                <line x="10.17" y="30.95"/>
                <line x="9.29" y="37.73"/>
                <line x="0" y="41.42"/>
                <line x="2.95" y="54.24"/>
                <line x="13.41" y="52.92"/>
                <line x="17.39" y="58.52"/>
                <line x="13.56" y="67.66"/>
                <line x="24.47" y="74.44"/>
                <line x="30.81" y="66.33"/>
                <line x="37.88" y="67.21"/>
                <line x="41.57" y="76.5"/>
                <line x="54.24" y="73.55"/>
                <line x="53.06" y="62.94"/>
                <line x="58.52" y="58.52"/>
                <line x="67.21" y="63.09"/>
                <line x="74.58" y="51.88"/>
                <line x="66.03" y="45.25"/>
                <line x="66.92" y="38.62"/>
                <line x="76.5" y="34.93"/>
                <line x="73.7" y="22.26"/>
                <line x="62.64" y="23.44"/>
                <line x="58.81" y="18.42"/>
                <line x="62.79" y="8.7"/>
                <line x="51.74" y="2.21"/>
                <line x="44.81" y="10.47"/>
                <line x="38.03" y="9.43"/>
                <line x="33.75" y="0"/>
                <line x="21.52" y="3.24"/>
                <line x="22.7" y="13.56"/>
                <line x="18.13" y="17.54"/>
                <line x="8.7" y="13.56"/>
                <close/>
                <move x="24.8" y="39"/>
                <arc large-arc-flag="1" rx="12" ry="12" sweep-flag="1" x="51.8" x-axis-rotation="0" y="39"/>
                <arc large-arc-flag="0" rx="12" ry="12" sweep-flag="1" x="24.8" x-axis-rotation="0" y="39"/>
                <close/>
            </path>
        </background>
        <foreground>
            <fillstroke/>
            <path>
                <move x="16.46" y="41.42"/>
                <line x="24.57" y="47.75"/>
                <line x="23.69" y="54.53"/>
                <line x="14.4" y="58.22"/>
                <line x="17.35" y="71.04"/>
                <line x="27.81" y="69.72"/>
                <line x="31.79" y="75.32"/>
                <line x="27.96" y="84.46"/>
                <line x="38.87" y="91.24"/>
                <line x="45.21" y="83.13"/>
                <line x="52.28" y="84.01"/>
                <line x="55.97" y="93.3"/>
                <line x="68.64" y="90.35"/>
                <line x="67.46" y="79.74"/>
                <line x="72.92" y="75.32"/>
                <line x="81.61" y="79.89"/>
                <line x="88.98" y="68.68"/>
                <line x="80.43" y="62.05"/>
                <line x="81.32" y="55.42"/>
                <line x="90.9" y="51.73"/>
                <line x="88.1" y="39.06"/>
                <line x="77.04" y="40.24"/>
                <line x="73.21" y="35.22"/>
                <line x="77.19" y="25.5"/>
                <line x="66.14" y="19.01"/>
                <line x="59.21" y="27.27"/>
                <line x="52.43" y="26.23"/>
                <line x="48.15" y="16.8"/>
                <line x="35.92" y="20.04"/>
                <line x="37.1" y="30.36"/>
                <line x="32.53" y="34.34"/>
                <line x="23.1" y="30.36"/>
                <close/>
                <move x="39.2" y="55.8"/>
                <arc large-arc-flag="1" rx="12" ry="12" sweep-flag="1" x="66.2" x-axis-rotation="0" y="55.8"/>
                <arc large-arc-flag="0" rx="12" ry="12" sweep-flag="1" x="39.2" x-axis-rotation="0" y="55.8"/>
                <close/>
            </path>
            <fillstroke/>
        </foreground>
    </shape>
    */
  }
}

export class BpmnShapeTaskBusinessRule extends BpmnShapeTask {
  protected paintTaskSymbol(c: mxgraph.mxXmlCanvas2D, x: number, y: number, w: number, h: number): void {
    const xTranslation = x + w / 10;
    const yTranslation = y + h / 10;
    const symbolBaseSize = Math.min(w, h);

    c.translate(xTranslation, yTranslation);

    this.drawBusinessRuleSymbol(c, x, y, (symbolBaseSize * 1.4) / 5, symbolBaseSize / 5);

    // TODO hack for translation
    c.translate(-xTranslation, -yTranslation);
  }

  private drawBusinessRuleSymbol(c: mxgraph.mxXmlCanvas2D, x: number, y: number, w: number, h: number): void {
    c.begin();
    c.rect(0, 0, w, h);
    // c.setFillColor(this.stroke);
    c.fillAndStroke();
    c.close();

    // c.setStrokeWidth(1);
    // c.setFillColor(this.stroke);

    c.begin();
    // <move x="0" y="15"/>
    c.moveTo(0, h * 0.2);
    // <line x="100" y="15"/>
    c.lineTo(w, h * 0.2);
    // <move x="1" y="40"/>
    c.moveTo(0, h * 0.6);
    // <line x="99.4" y="40"/>
    c.lineTo(w, h * 0.6);
    // <move x="25" y="15"/>
    c.moveTo(w * 0.25, h * 0.2);
    // <line x="25" y="65"/>
    c.lineTo(w * 0.25, h);

    // const w2 = w / 5;

    c.fillAndStroke();
    c.close();

    /*
    from draw.io bpmn stencils
    <shape h="65" name="Business Rule Task" strokewidth="inherit" w="100">
        <connections/>
        <background>
            <rect h="65" w="100" x="0" y="0"/>
        </background>
        <foreground>
            <fillstroke/>
            <path>
                <move x="0" y="15"/>
                <line x="100" y="15"/>
                <move x="1" y="40"/>
                <line x="99.4" y="40"/>
                <move x="25" y="15"/>
                <line x="25" y="65"/>
            </path>
            <stroke/>
        </foreground>
    </shape>
     */
  }
}

/*
<shape h="59.28" name="Manual Task" strokewidth="inherit" w="91.4">
    <connections/>
    <background>
        <path>
            <move x="0" y="14"/>
            <arc large-arc-flag="0" rx="20" ry="20" sweep-flag="1" x="14" x-axis-rotation="0" y="0"/>
            <line x="50" y="0"/>
            <arc large-arc-flag="0" rx="6" ry="6" sweep-flag="1" x="50" x-axis-rotation="0" y="11"/>
            <line x="26" y="11"/>
            <line x="87" y="11"/>
            <arc large-arc-flag="0" rx="7" ry="7" sweep-flag="1" x="87" x-axis-rotation="0" y="24"/>
            <line x="45" y="24"/>
            <line x="87" y="24"/>
            <arc large-arc-flag="0" rx="7" ry="7" sweep-flag="1" x="87" x-axis-rotation="0" y="37"/>
            <line x="49" y="37"/>
            <line x="82" y="37"/>
            <arc large-arc-flag="0" rx="6" ry="6" sweep-flag="1" x="82" x-axis-rotation="0" y="49"/>
            <line x="48" y="49"/>
            <line x="75" y="49"/>
            <arc large-arc-flag="0" rx="5" ry="5" sweep-flag="1" x="75" x-axis-rotation="0" y="59"/>
            <line x="9" y="59"/>
            <arc large-arc-flag="0" rx="8" ry="8" sweep-flag="1" x="0" x-axis-rotation="0" y="52"/>
            <close/>
        </path>
    </background>
    <foreground>
        <fillstroke/>
    </foreground>
</shape>


<shape h="100" name="Script Task" strokewidth="inherit" w="73.4">
    <connections/>
    <background>
        <path>
            <move x="61.7" y="0"/>
            <arc large-arc-flag="0" rx="40" ry="40" sweep-flag="0" x="61.7" x-axis-rotation="0" y="50"/>
            <arc large-arc-flag="0" rx="40" ry="40" sweep-flag="1" x="61.7" x-axis-rotation="0" y="100"/>
            <line x="11.7" y="100"/>
            <arc large-arc-flag="0" rx="40" ry="40" sweep-flag="0" x="11.7" x-axis-rotation="0" y="50"/>
            <arc large-arc-flag="0" rx="40" ry="40" sweep-flag="1" x="11.7" x-axis-rotation="0" y="0"/>
            <close/>
        </path>
    </background>
    <foreground>
        <fillstroke/>
        <path>
            <move x="21.7" y="50"/>
            <line x="51.7" y="50"/>
            <move x="13.7" y="30"/>
            <line x="43.7" y="30"/>
            <move x="15.7" y="10"/>
            <line x="45.7" y="10"/>
            <move x="29.7" y="70"/>
            <line x="59.7" y="70"/>
            <move x="27.7" y="90"/>
            <line x="57.7" y="90"/>
        </path>
        <stroke/>
    </foreground>
</shape>
*/
