import { mxgraph } from 'mxgraph';
import { mxgraphFactory } from '../../components/mxgraph-factory';
const {
  mxEvent,
  mxClient,
  mxUtils,
  mxConstants,
  mxGraph,
  mxSwimlaneManager,
  mxConnectionHandler,
  mxEdgeStyle,
  mxGraphModel,
  mxImage,
  mxLayoutManager,
  mxPerimeter,
  mxPoint,
  mxStackLayout,
  mxEdgeHandler,
  mxGraphHandler,
} = mxgraphFactory({
  mxLoadResources: false,
  mxLoadStylesheets: false,
});

export class BpmnJs {
  private readonly graph: mxgraph.mxGraph;

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

      this.autoResizeContainer(graph);
      this.setVertexStyle(graph);
    } catch (e) {
      // Shows an error message if the editor cannot start
      mxUtils.alert('Cannot start application: ' + e.message);
      throw e; // for debugging
    }
  }

  private setVertexStyle(graph: mxgraph.mxGraph = this.graph) {
    let style = graph.getStylesheet().getDefaultVertexStyle();
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_SWIMLANE;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = 'middle';
    style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'white';
    style[mxConstants.STYLE_FILLCOLOR] = '#ffffff';
    style[mxConstants.STYLE_FONTSIZE] = 11;
    style[mxConstants.STYLE_STARTSIZE] = 22;
    style[mxConstants.STYLE_HORIZONTAL] = false;
    style[mxConstants.STYLE_FONTCOLOR] = 'black';
    style[mxConstants.STYLE_STROKECOLOR] = 'black';
    style[mxConstants.STYLE_EDITABLE] = false;
    style[mxConstants.STYLE_CLONEABLE] = false;
    style[mxConstants.STYLE_ROTATABLE] = false;
    style[mxConstants.STYLE_DELETABLE] = false;
    //style[mxConstants.STYLE_MOVABLE] = false;

    style = mxUtils.clone(style);
    delete style[mxConstants.STYLE_FILLCOLOR];
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
    style[mxConstants.STYLE_FONTSIZE] = 10;
    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_HORIZONTAL] = true;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = 'middle';
    delete style[mxConstants.STYLE_STARTSIZE];
    style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'none';
    graph.getStylesheet().putCellStyle('process', style);

    style = mxUtils.clone(style);
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ELLIPSE;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.EllipsePerimeter;
    delete style[mxConstants.STYLE_ROUNDED];
    graph.getStylesheet().putCellStyle('state', style);

    style = mxUtils.clone(style);
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RHOMBUS;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RhombusPerimeter;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = 'top';
    style[mxConstants.STYLE_SPACING_TOP] = 40;
    style[mxConstants.STYLE_SPACING_RIGHT] = 64;
    graph.getStylesheet().putCellStyle('condition', style);

    style = mxUtils.clone(style);
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_DOUBLE_ELLIPSE;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.EllipsePerimeter;
    style[mxConstants.STYLE_SPACING_TOP] = 28;
    style[mxConstants.STYLE_FONTSIZE] = 14;
    style[mxConstants.STYLE_FONTSTYLE] = 1;
    delete style[mxConstants.STYLE_SPACING_RIGHT];
    graph.getStylesheet().putCellStyle('end', style);

    style = graph.getStylesheet().getDefaultEdgeStyle();
    style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector;
    style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_BLOCK;
    style[mxConstants.STYLE_ROUNDED] = true;
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

  private autoResizeContainer(graph: mxgraph.mxGraph = this.graph) {
    // Auto-resizes the container
    graph.border = 40;
    graph.getView().translate = new mxPoint(this.graph.border / 2, this.graph.border / 2);
   // graph.setResizeContainer(true);
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
      const { lane1a, lane1b } = this.createPool1(graph, parent);
      const { lane2a, lane2b } = this.createPool2(graph, parent);

      const { start1, end1, step1, step1Out, step11, step111 } = this.createLane1A(graph, lane1a);
      const { start2, step2, step2In, step22 } = this.createLane2B(graph, lane2b);
      const { step3, step33 } = this.createLane1B(graph, lane1b);
      const { step4, step44, step444, end2, end3 } = this.createLane2A(graph, lane2a);

      let e = null;

      graph.insertEdge(lane1a, null, null, start1, step1);
      graph.insertEdge(lane1a, null, null, step1, step11);
      graph.insertEdge(lane1a, null, null, step11, step111);

      graph.insertEdge(lane2b, null, null, start2, step2);
      graph.insertEdge(lane2b, null, null, step2, step22);
      graph.insertEdge(parent, null, null, step22, step3);

      graph.insertEdge(lane1b, null, null, step3, step33);
      graph.insertEdge(lane2a, null, null, step4, step44);
      graph.insertEdge(lane2a, null, 'No', step44, step444, 'verticalAlign=bottom');
      graph.insertEdge(parent, null, 'Yes', step44, step111, 'verticalAlign=bottom;horizontal=0;');

      graph.insertEdge(lane2a, null, 'Yes', step444, end2, 'verticalAlign=bottom');
      e = graph.insertEdge(lane2a, null, 'No', step444, end3, 'verticalAlign=top');
      e.geometry.points = [new mxPoint(step444.geometry.x + step444.geometry.width / 2, end3.geometry.y + end3.geometry.height / 2)];

      graph.insertEdge(parent, null, null, step1Out, step2In, 'crossover');
      graph.insertEdge(parent, null, null, step3, step11, 'crossover');
      e = graph.insertEdge(lane1a, null, null, step11, step33, 'crossover');
      e.geometry.points = [new mxPoint(step33.geometry.x + step33.geometry.width / 2 + 20, step11.geometry.y + (step11.geometry.height * 4) / 5)];
      graph.insertEdge(parent, null, null, step33, step4);
      graph.insertEdge(lane1a, null, null, step111, end1);
    } finally {
      // Updates the display
      model.endUpdate();
    }
  }

  private createLane2A(graph: mxgraph.mxGraph, lane2a) {
    const step4 = graph.insertVertex(lane2a, null, 'Receive and\nAcknowledge', 290, 20, 80, 50, 'process');
    const step44 = graph.insertVertex(lane2a, null, 'Contract\nConstraints?', 400, 20, 50, 50, 'condition');
    const step444 = graph.insertVertex(lane2a, null, 'Tap for gas\ndelivery?', 480, 20, 50, 50, 'condition');

    const end2 = graph.insertVertex(lane2a, null, 'B', 560, 30, 30, 30, 'end');
    const end3 = graph.insertVertex(lane2a, null, 'C', 560, 84, 30, 30, 'end');
    return { step4, step44, step444, end2, end3 };
  }

  private createLane1B(graph: mxgraph.mxGraph, lane1b) {
    const step3 = graph.insertVertex(lane1b, null, 'Request 1st-\nGate\nInformation', 190, 30, 80, 50, 'process');
    const step33 = graph.insertVertex(lane1b, null, 'Receive 1st-\nGate\nInformation', 290, 30, 80, 50, 'process');
    return { step3, step33 };
  }

  private createLane2B(graph: mxgraph.mxGraph, lane2b) {
    const start2 = graph.insertVertex(lane2b, null, null, 40, 40, 30, 30, 'state');

    const step2 = graph.insertVertex(lane2b, null, 'Receive\nRequest', 90, 30, 80, 50, 'process');
    const step2In = graph.insertVertex(step2, null, 'In', 0.5, -0.5, 25, 20, 'fontSize=9;shape=ellipse;resizable=0;horizontal=1;');
    step2In.geometry.offset = new mxPoint(-10, -10);
    step2In.geometry.relative = true;
    const step22 = graph.insertVertex(lane2b, null, 'Refer to Tap\nSystems\nCoordinator', 190, 30, 80, 50, 'process');
    return { start2, step2, step2In, step22 };
  }

  private createLane1A(graph: mxgraph.mxGraph, lane1a) {
    const start1 = graph.insertVertex(lane1a, null, null, 40, 40, 30, 30, 'state');
    const end1 = graph.insertVertex(lane1a, null, 'A', 560, 40, 30, 30, 'end');

    const step1 = graph.insertVertex(lane1a, null, 'Contact\nProvider', 90, 30, 80, 50, 'process');
    const step1Out = graph.insertVertex(step1, null, 'Out', 0.5, 1, 25, 20, 'fontSize=9;shape=ellipse;resizable=0;horizontal=1;');
    step1Out.geometry.offset = new mxPoint(-10, -10);
    step1Out.geometry.relative = true;
    const step11 = graph.insertVertex(lane1a, null, 'Complete\nAppropriate\nRequest', 190, 30, 80, 50, 'process');
    const step111 = graph.insertVertex(lane1a, null, 'Receive and\nAcknowledge', 385, 30, 80, 50, 'process');
    return { start1, end1, step1, step1Out, step11, step111 };
  }

  private createPool2(graph: mxgraph.mxGraph, parent) {
    const pool2 = graph.insertVertex(parent, null, 'Pool 2', 0, 250, 640, 0);
    pool2.setConnectable(false);

    const lane2a = graph.insertVertex(pool2, null, 'Lane A', 0, 0, 640, 140);
    lane2a.setConnectable(false);

    const lane2b = graph.insertVertex(pool2, null, 'Lane B', 0, 140, 640, 110);
    lane2b.setConnectable(false);
    return { lane2a, lane2b };
  }

  private createPool1(graph: mxgraph.mxGraph, parent) {
    const pool1 = graph.insertVertex(parent, null, 'Pool 1', 0, 0, 640, 0);
    pool1.setConnectable(false);

    const lane1a = graph.insertVertex(pool1, null, 'Lane A', 0, 0, 640, 140);
    lane1a.setConnectable(false);

    const lane1b = graph.insertVertex(pool1, null, 'Lane B', 0, 140, 640, 110);
    lane1b.setConnectable(false);
    return { lane1a, lane1b };
  }
}
