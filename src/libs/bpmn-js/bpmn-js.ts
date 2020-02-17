import { MxCell, MxGraph } from 'mxgraph';
import { mxgraphFactory } from '../../components/mxgraph-factory';
const { mxClient, mxUtils, mxConstants, mxGraph, mxEdgeStyle, mxGraphModel, mxPerimeter, mxPoint } = mxgraphFactory({
  mxLoadResources: false,
  mxLoadStylesheets: false,
});

const LANE_HEIGHT_LARGE = 220;
const LANE_HEIGHT_LITTLE = 180;
const LANE_WIDTH = 1500;

const EVENT_WIDTH = 30;
const EVENT_Y_LARGE = LANE_HEIGHT_LARGE / 2 - 10;
const EVENT_Y_LITTLE = LANE_HEIGHT_LITTLE / 2 - 10;

const TASK_WIDTH = 150;
const TASK_HEIGHT = 75;
const TASK_Y_LARGE = EVENT_Y_LARGE - 22;
const TASK_Y_LITTLE = EVENT_Y_LITTLE - 22;

export class BpmnJs {
  private readonly graph: MxGraph;

  constructor(container: Element) {
    try {
      // Checks if browser is supported
      if (!mxClient.isBrowserSupported()) {
        // Displays an error message if the browser is  not supported.
        return mxUtils.error('Browser is not supported!', 200, false);
      }

      const model = new mxGraphModel();
      this.graph = new mxGraph(container, model);

      const graph = this.graph;

      mxGraph.prototype.edgeLabelsMovable = false;
      mxGraph.prototype.cellsLocked = true;
      mxGraph.prototype.autoSizeCellsOnAdd = true;

      this.autoResizeContainer(graph);
      this.setVertexStyle(graph);
    } catch (e) {
      // Shows an error message if the editor cannot start
      mxUtils.alert('Cannot start application: ' + e.message);
      throw e; // for debugging
    }
  }

  private setVertexStyle(graph: MxGraph = this.graph) {
    let style = graph.getStylesheet().getDefaultVertexStyle();
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_SWIMLANE;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = 'middle';
    style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'white';
    style[mxConstants.STYLE_FILLCOLOR] = '#ffffff';
    style[mxConstants.STYLE_FONTSIZE] = 20;
    style[mxConstants.STYLE_STARTSIZE] = 30;
    style[mxConstants.STYLE_HORIZONTAL] = false;
    style[mxConstants.STYLE_FONTCOLOR] = 'black';
    style[mxConstants.STYLE_STROKECOLOR] = 'black';
    style[mxConstants.STYLE_EDITABLE] = false;
    style[mxConstants.STYLE_CLONEABLE] = false;
    style[mxConstants.STYLE_ROTATABLE] = false;
    style[mxConstants.STYLE_DELETABLE] = false;
    //style[mxConstants.STYLE_MOVABLE] = false;

    // Task style
    style = mxUtils.clone(style);
    delete style[mxConstants.STYLE_STARTSIZE];
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
    style[mxConstants.STYLE_FONTSIZE] = 15;
    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_HORIZONTAL] = true;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = 'middle';
    style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'none';
    style[mxConstants.STYLE_STROKECOLOR] = '#2C6DA3';
    style[mxConstants.STYLE_STROKEWIDTH] = 2;
    style[mxConstants.STYLE_FILLCOLOR] = 'white';
    style[mxConstants.STYLE_GRADIENTCOLOR] = '#B8B9DA';
    style[mxConstants.STYLE_GRADIENT_DIRECTION] = 'east';
    graph.getStylesheet().putCellStyle('task', style);

    // Condition style
    style = mxUtils.clone(style);
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RHOMBUS;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RhombusPerimeter;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = 'top';
    style[mxConstants.STYLE_SPACING_TOP] = 55;
    style[mxConstants.STYLE_SPACING_RIGHT] = 110;
    style[mxConstants.STYLE_STROKECOLOR] = '#96A826';
    style[mxConstants.STYLE_STROKEWIDTH] = 1.7;
    style[mxConstants.STYLE_FILLCOLOR] = 'white';
    style[mxConstants.STYLE_GRADIENTCOLOR] = '#E9ECB1';
    style[mxConstants.STYLE_GRADIENT_DIRECTION] = 'east';
    delete style[mxConstants.STYLE_ROUNDED];
    graph.getStylesheet().putCellStyle('condition', style);

    // Start style
    style = mxUtils.clone(style);
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ELLIPSE;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.EllipsePerimeter;
    style[mxConstants.STYLE_STROKECOLOR] = '#62A928';
    style[mxConstants.STYLE_STROKEWIDTH] = 1.7;
    style[mxConstants.STYLE_FILLCOLOR] = 'white';
    style[mxConstants.STYLE_GRADIENTCOLOR] = '#E9ECB1';
    style[mxConstants.STYLE_GRADIENT_DIRECTION] = 'east';
    graph.getStylesheet().putCellStyle('start', style);

    // End style
    style = mxUtils.clone(style);
    delete style[mxConstants.STYLE_FILLCOLOR];
    delete style[mxConstants.STYLE_GRADIENTCOLOR];
    delete style[mxConstants.STYLE_SPACING_RIGHT];
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_DOUBLE_ELLIPSE;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.EllipsePerimeter;
    style[mxConstants.STYLE_SPACING_TOP] = 28;
    style[mxConstants.STYLE_FONTSIZE] = 15;
    style[mxConstants.STYLE_FONTSTYLE] = 2;
    style[mxConstants.STYLE_STROKECOLOR] = '#8A151A';
    style[mxConstants.STYLE_STROKEWIDTH] = 2.7;
    graph.getStylesheet().putCellStyle('end', style);

    // Boundary event style
    style = mxUtils.clone(graph.getStylesheet().getDefaultVertexStyle());
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ELLIPSE;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.EllipsePerimeter;
    style[mxConstants.STYLE_FONTSIZE] = 12;
    style[mxConstants.STYLE_HORIZONTAL] = true;
    style[mxConstants.STYLE_RESIZABLE] = false;
    style[mxConstants.STYLE_STROKECOLOR] = '#2C6DA3';
    style[mxConstants.STYLE_STROKEWIDTH] = 1.7;
    graph.getStylesheet().putCellStyle('boundary', style);

    // Transitions style
    style = graph.getStylesheet().getDefaultEdgeStyle();
    style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector;
    style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_BLOCK;
    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_FONTSIZE] = 13;
    style[mxConstants.STYLE_FONTCOLOR] = 'black';
    style[mxConstants.STYLE_STROKECOLOR] = 'black';

    style = mxUtils.clone(style);
    style[mxConstants.STYLE_DASHED] = true;
    style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_OPEN;
    graph.getStylesheet().putCellStyle('crossover', style);

    // Installs double click on middle control point and
    // changes style of edges between empty and this value
    graph.alternateEdgeStyle = 'elbow=vertical';
  }

  private autoResizeContainer(graph: MxGraph = this.graph) {
    // Auto-resizes the container
    graph.border = 40;
    graph.getView().translate = new mxPoint(this.graph.border / 2, this.graph.border / 2);
    graph.setResizeContainer(true);
    graph.graphHandler.setRemoveCellsFromParent(false);
  }

  public loadGraph(): void {
    const graph = this.graph;
    const model = this.graph.getModel();
    // Gets the default parent for inserting new cells. This is normally the first child of the root (ie. layer 0).
    const parent = this.graph.getDefaultParent();

    // Adds cells to the model in a single step
    model.beginUpdate();
    try {
      const { step11, step111, step1Out, step3, step33 } = this.createPool1(graph, parent);
      const { step2In, step22, step4, step44 } = this.createPool2(graph, parent);

      let e = null;

      graph.insertEdge(parent, null, null, step22, step3);
      graph.insertEdge(parent, null, 'Yes', step44, step111, 'verticalAlign=bottom;horizontal=0;');

      graph.insertEdge(parent, null, null, step1Out, step2In, 'crossover');
      graph.insertEdge(parent, null, null, step3, step11, 'crossover');
      e = graph.insertEdge(parent, null, null, step11, step33, 'crossover');
      e.geometry.points = [new mxPoint(step33.geometry.x + step33.geometry.width / 2 + 20, step11.geometry.y + (step11.geometry.height * 4) / 5)];
      graph.insertEdge(parent, null, null, step33, step4);
    } finally {
      // Updates the display
      model.endUpdate();
    }
  }

  private createPool1(graph: MxGraph, parent) {
    const pool1 = graph.insertVertex(parent, null, 'Pool 1', 0, 0, LANE_WIDTH, 0);
    pool1.setConnectable(false);

    const { step1Out, step11, step111 } = this.createLane1A(graph, pool1);
    const { step3, step33 } = this.createLane1B(graph, pool1);

    return { step11, step111, step1Out, step3, step33 };
  }

  private createLane1A(graph: MxGraph, pool: MxCell) {
    const lane1a = graph.insertVertex(pool, null, 'Lane A', 0, 0, LANE_WIDTH, LANE_HEIGHT_LARGE);
    lane1a.setConnectable(false);

    const start1 = graph.insertVertex(lane1a, null, null, 60, EVENT_Y_LARGE, EVENT_WIDTH, EVENT_WIDTH, 'start');
    const end1 = graph.insertVertex(lane1a, null, 'A', LANE_WIDTH - 100, EVENT_Y_LARGE, EVENT_WIDTH, EVENT_WIDTH, 'end');

    const step1 = graph.insertVertex(lane1a, null, 'Contact\nProvider', 150, TASK_Y_LARGE, TASK_WIDTH, TASK_HEIGHT, 'task');
    const step1Out = graph.insertVertex(step1, null, 'Out', 0.5, 1, 30, 25, 'boundary');
    step1Out.geometry.offset = new mxPoint(-15, -10);
    step1Out.geometry.relative = true;
    const step11 = graph.insertVertex(lane1a, null, 'Complete\nAppropriate\nRequest', 400, TASK_Y_LARGE, TASK_WIDTH, TASK_HEIGHT, 'task');
    const step111 = graph.insertVertex(lane1a, null, 'Receive and\nAcknowledge', 920, TASK_Y_LARGE, TASK_WIDTH, TASK_HEIGHT, 'task');

    graph.insertEdge(lane1a, null, null, start1, step1);
    graph.insertEdge(lane1a, null, null, step1, step11);
    graph.insertEdge(lane1a, null, null, step11, step111);
    graph.insertEdge(lane1a, null, null, step111, end1);

    return { start1, end1, step1, step1Out, step11, step111 };
  }

  private createLane1B(graph: MxGraph, pool: MxCell) {
    const lane1b = graph.insertVertex(pool, null, 'Lane B', 0, 220, LANE_WIDTH, LANE_HEIGHT_LITTLE);
    lane1b.setConnectable(false);

    const step3 = graph.insertVertex(lane1b, null, 'Request 1st-\nGate\nInformation', 400, TASK_Y_LITTLE, TASK_WIDTH, TASK_HEIGHT, 'task');
    const step33 = graph.insertVertex(lane1b, null, 'Receive 1st-\nGate\nInformation', 650, TASK_Y_LITTLE, TASK_WIDTH, TASK_HEIGHT, 'task');

    graph.insertEdge(lane1b, null, null, step3, step33);

    return { step3, step33 };
  }

  private createPool2(graph: MxGraph, parent) {
    const pool2 = graph.insertVertex(parent, null, 'Pool 2', 0, 400, LANE_WIDTH, 0);
    pool2.setConnectable(false);

    const { step4, step44 } = this.createLane2A(graph, pool2);
    const { step2In, step22 } = this.createLane2B(graph, pool2);

    return { step2In, step22, step4, step44 };
  }

  private createLane2A(graph: MxGraph, pool: MxCell) {
    const lane2a = graph.insertVertex(pool, null, 'Lane A', 0, 0, LANE_WIDTH, LANE_HEIGHT_LARGE);
    lane2a.setConnectable(false);

    const step4 = graph.insertVertex(lane2a, null, 'Receive and\nAcknowledge', 650, TASK_Y_LARGE, TASK_WIDTH, TASK_HEIGHT, 'task');
    const step44 = graph.insertVertex(lane2a, null, 'Contract\nConstraints?', 950, TASK_Y_LARGE, TASK_HEIGHT, TASK_HEIGHT, 'condition');
    const step444 = graph.insertVertex(lane2a, null, 'Tap for gas\ndelivery?', LANE_WIDTH - 300, TASK_Y_LARGE, TASK_HEIGHT, TASK_HEIGHT, 'condition');

    const end2 = graph.insertVertex(lane2a, null, 'B', LANE_WIDTH - 100, TASK_Y_LARGE - EVENT_WIDTH, EVENT_WIDTH, EVENT_WIDTH, 'end');
    const end3 = graph.insertVertex(lane2a, null, 'C', LANE_WIDTH - 100, TASK_Y_LARGE + TASK_HEIGHT, EVENT_WIDTH, EVENT_WIDTH, 'end');

    graph.insertEdge(lane2a, null, null, step4, step44);
    graph.insertEdge(lane2a, null, 'No', step44, step444, 'verticalAlign=bottom');
    let e = graph.insertEdge(lane2a, null, 'Yes', step444, end2, 'verticalAlign=bottom');
    e.geometry.points = [new mxPoint(step444.geometry.x + step444.geometry.width / 2, end2.geometry.y + end2.geometry.height / 2)];
    e = graph.insertEdge(lane2a, null, 'No', step444, end3, 'verticalAlign=top');
    e.geometry.points = [new mxPoint(step444.geometry.x + step444.geometry.width / 2, end3.geometry.y + end3.geometry.height / 2)];

    return { step4, step44, step444, end2, end3 };
  }

  private createLane2B(graph: MxGraph, pool: MxCell) {
    const lane2b = graph.insertVertex(pool, null, 'Lane B', 0, 220, LANE_WIDTH, LANE_HEIGHT_LITTLE);
    lane2b.setConnectable(false);

    const start2 = graph.insertVertex(lane2b, null, null, 60, EVENT_Y_LITTLE, EVENT_WIDTH, EVENT_WIDTH, 'start');

    const step2 = graph.insertVertex(lane2b, null, 'Receive\nRequest', 150, TASK_Y_LITTLE, TASK_WIDTH, TASK_HEIGHT, 'task');
    const step2In = graph.insertVertex(step2, null, 'In', 0.5, -0.5, 30, 25, 'boundary');
    step2In.geometry.offset = new mxPoint(-15, -10);
    step2In.geometry.relative = true;
    const step22 = graph.insertVertex(lane2b, null, 'Refer to Tap\nSystems\nCoordinator', 400, TASK_Y_LITTLE, TASK_WIDTH, TASK_HEIGHT, 'task');

    graph.insertEdge(lane2b, null, null, start2, step2);
    graph.insertEdge(lane2b, null, null, step2, step22);

    return { start2, step2, step2In, step22 };
  }
}
