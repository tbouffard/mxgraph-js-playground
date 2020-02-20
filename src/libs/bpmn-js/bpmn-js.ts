import { mxgraph } from 'mxgraph';
import { mxgraphFactory } from '../../components/mxgraph-factory';
const { mxEvent, mxClient, mxUtils, mxConstants, mxGraph, mxEdgeStyle, mxGraphModel, mxPerimeter, mxPoint } = mxgraphFactory({
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

const TASK_KIND_CA = 'CallActivity';

function createPool(graph: mxgraph.mxGraph, name: string, y = 0): mxgraph.mxCell {
  const pool = graph.insertVertex(graph.getDefaultParent(), null, name, 0, y, LANE_WIDTH, 0, 'poolLane');
  pool.setConnectable(false);
  return pool as mxgraph.mxCell;
}

function createLane(graph: mxgraph.mxGraph, pool: mxgraph.mxCell, name: string, y = 0, height = LANE_HEIGHT_LARGE): mxgraph.mxCell {
  const lane = graph.insertVertex(pool, null, name, 0, y, LANE_WIDTH, height, 'poolLane');
  lane.setConnectable(false);
  return lane as mxgraph.mxCell;
}

function createStartEvent(graph: mxgraph.mxGraph, lane: mxgraph.mxCell, y = EVENT_Y_LARGE): mxgraph.mxCell {
  return graph.insertVertex(lane, null, null, 60, y, EVENT_WIDTH, EVENT_WIDTH, 'start') as mxgraph.mxCell;
}

function createEndEvent(graph: mxgraph.mxGraph, lane: mxgraph.mxCell, name: string, y = EVENT_Y_LARGE): mxgraph.mxCell {
  return graph.insertVertex(lane, null, name, LANE_WIDTH - 100, y, EVENT_WIDTH, EVENT_WIDTH, 'end') as mxgraph.mxCell;
}

function createTask(graph: mxgraph.mxGraph, lane: mxgraph.mxCell, name: string, x: number, y = TASK_Y_LARGE): mxgraph.mxCell {
  return graph.insertVertex(lane, null, name, x, y, TASK_WIDTH, TASK_HEIGHT, 'task') as mxgraph.mxCell;
}
function createBoundaryEvent(graph: mxgraph.mxGraph, task: mxgraph.mxCell, name: string, x: number, y: number): mxgraph.mxCell {
  const boundaryEvent = graph.insertVertex(task, null, name, x, y, 30, 25, 'boundary');
  boundaryEvent.geometry.offset = new mxPoint(-15, -10);
  boundaryEvent.geometry.relative = true;
  return boundaryEvent as mxgraph.mxCell;
}

function createCallActivity(graph: mxgraph.mxGraph, lane: mxgraph.mxCell, name: string, href?: string): mxgraph.mxCell {
  // Note that these XML nodes will be enclosing the mxCell nodes for the model cells in the output
  const doc = mxUtils.createXmlDocument();

  const callActivity = doc.createElement(TASK_KIND_CA);
  callActivity.setAttribute('name', name);
  callActivity.setAttribute('href', href);

  return createTask(graph, lane, callActivity, 650) as mxgraph.mxCell;
}

function createCondition(graph: mxgraph.mxGraph, lane: mxgraph.mxCell, name: string, x: number, y = TASK_Y_LARGE): mxgraph.mxCell {
  return graph.insertVertex(lane, null, name, x, y, TASK_HEIGHT, TASK_HEIGHT, 'condition') as mxgraph.mxCell;
}

function createDefaultTransition(graph: mxgraph.mxGraph, source: mxgraph.mxCell, target: mxgraph.mxCell, name = null, style?: string): mxgraph.mxEdge {
  return graph.insertEdge(graph.getDefaultParent(), null, name, source, target, style) as mxgraph.mxEdge;
}

function createDefaultTransitionWithPoint(graph: mxgraph.mxGraph, source: mxgraph.mxCell, target: mxgraph.mxCell, name = null, style?: string): mxgraph.mxEdge {
  const transition = createDefaultTransition(graph, source, target, name, style);
  transition.geometry.points = [new mxPoint(source.geometry.x + source.geometry.width / 2, target.geometry.y + target.geometry.height / 2)];
  return transition as mxgraph.mxEdge;
}

function createCrossoverTransition(graph: mxgraph.mxGraph, source: mxgraph.mxCell, target: mxgraph.mxCell): mxgraph.mxEdge {
  return graph.insertEdge(graph.getDefaultParent(), null, null, source, target, 'crossover');
}

function createCrossoverTransitionWithPoint(graph: mxgraph.mxGraph, source: mxgraph.mxCell, target: mxgraph.mxCell): mxgraph.mxEdge {
  const transition = createCrossoverTransition(graph, source, target);
  transition.geometry.points = [new mxPoint(target.geometry.x + target.geometry.width / 2 + 20, source.geometry.y + (source.geometry.height * 4) / 5)];
  return transition as mxgraph.mxEdge;
}

function createAnimatedTransition(graph: mxgraph.mxGraph, source: mxgraph.mxCell, target: mxgraph.mxCell) {
  return graph.insertEdge(graph.getDefaultParent(), null, null, source, target, 'animated');
}

mxGraph.prototype.edgeLabelsMovable = false;
mxGraph.prototype.cellsLocked = true;

// Overrides method to provide a cell label in the display
mxGraph.prototype.convertValueToString = function(cell) {
  if (mxUtils.isNode(cell.value)) {
    if (cell.value.nodeName != undefined && cell.value.nodeName == TASK_KIND_CA) {
      return cell.getAttribute('name');
    }
  }

  return cell.value;
};

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

      this.graph.addListener(mxEvent.CLICK, function(sender, evt) {
        const cell = evt.getProperty('cell'); // cell may be null

        if (cell != null) {
          if (cell.vertex != null && cell.vertex == 1) {
            if (cell.value.nodeName != undefined && cell.value.nodeName == TASK_KIND_CA) {
              // Do something useful with cell and consume the event
              evt.consume();

              const href = cell.getAttribute('href');
              if (href != null && href.length > 0) {
                window.open(href);
                /*              } else {
                mxUtils.alert('No URL defined');
                console.log('No URL defined');*/
              }
            }
          }
        }
      });

      this.autoResizeContainer();
      this.configureStyles();

      /*// Animation on all transitions
      graph.addListener('size', function() {
        // Adds animation to edge shape and makes "pipe" visible
        graph.view.states.visit(function(key, state) {
          if (graph.model.isEdge(state.cell)) {
            state.shape.node.getElementsByTagName('path')[0].removeAttribute('visibility');
            state.shape.node.getElementsByTagName('path')[0].setAttribute('stroke-width', '3');
            state.shape.node.getElementsByTagName('path')[0].setAttribute('stroke', 'pink');
            state.shape.node.getElementsByTagName('path')[1].setAttribute('class', 'flow');
          }
        });
      });*/
    } catch (e) {
      // Shows an error message if the editor cannot start
      mxUtils.alert('Cannot start application: ' + e.message);
      throw e; // for debugging
    }
  }

  private configureStyles() {
    this.configureDefaultVertexStyle();
    this.configurePollLaneStyle();
    this.configureTaskStyle();
    this.configureConditionStyle();
    this.configureStartStyle();
    this.configureEndStyle();
    this.configureBoundaryEventStyle();
    this.configureDefaultTransitionStyle();
    this.configureAnimatedTransitionStyle();
    this.configureCrossoverTransitionStyle();

    // Installs double click on middle control point and changes style of edges between empty and this value
    this.graph.alternateEdgeStyle = 'elbow=vertical';
  }

  private configureDefaultVertexStyle() {
    const style = this.graph.getStylesheet().getDefaultVertexStyle();
    style[mxConstants.STYLE_HORIZONTAL] = true;
    style[mxConstants.STYLE_FONTSIZE] = 15;
    style[mxConstants.STYLE_FILLCOLOR] = 'white';
    style[mxConstants.STYLE_FONTCOLOR] = 'black';
    style[mxConstants.STYLE_STROKECOLOR] = 'black';
    style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'none';
    style[mxConstants.STYLE_GRADIENT_DIRECTION] = 'east';
  }

  private configurePollLaneStyle() {
    const style = mxUtils.clone(this.graph.getStylesheet().getDefaultVertexStyle());
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_SWIMLANE;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = 'middle';
    style[mxConstants.STYLE_HORIZONTAL] = false;
    style[mxConstants.STYLE_FONTSIZE] = 20;
    style[mxConstants.STYLE_FILLCOLOR] = '#d3d2d1';

    style[mxConstants.STYLE_STARTSIZE] = 30;
    this.graph.getStylesheet().putCellStyle('poolLane', style);
  }

  private configureTaskStyle() {
    const style = mxUtils.clone(this.graph.getStylesheet().getDefaultVertexStyle());
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = 'middle';
    style[mxConstants.STYLE_STROKECOLOR] = '#2C6DA3';
    style[mxConstants.STYLE_STROKEWIDTH] = 2;

    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_GRADIENTCOLOR] = '#B8B9DA';
    this.graph.getStylesheet().putCellStyle('task', style);
  }

  private configureConditionStyle() {
    const style = mxUtils.clone(this.graph.getStylesheet().getDefaultVertexStyle());
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RHOMBUS;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RhombusPerimeter;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = 'top';
    style[mxConstants.STYLE_STROKECOLOR] = '#96A826';
    style[mxConstants.STYLE_STROKEWIDTH] = 1.7;

    style[mxConstants.STYLE_SPACING_TOP] = 55;
    style[mxConstants.STYLE_SPACING_RIGHT] = 110;
    style[mxConstants.STYLE_GRADIENTCOLOR] = '#E9ECB1';
    this.graph.getStylesheet().putCellStyle('condition', style);
  }

  private configureStartStyle() {
    const style = mxUtils.clone(this.graph.getStylesheet().getDefaultVertexStyle());
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ELLIPSE;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.EllipsePerimeter;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = 'top';
    style[mxConstants.STYLE_STROKECOLOR] = '#62A928';
    style[mxConstants.STYLE_STROKEWIDTH] = 1.7;

    style[mxConstants.STYLE_GRADIENTCOLOR] = '#E9ECB1';
    this.graph.getStylesheet().putCellStyle('start', style);
  }

  private configureEndStyle() {
    const style = mxUtils.clone(this.graph.getStylesheet().getDefaultVertexStyle());
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_DOUBLE_ELLIPSE;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.EllipsePerimeter;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = 'top';
    style[mxConstants.STYLE_STROKECOLOR] = '#8A151A';
    style[mxConstants.STYLE_STROKEWIDTH] = 2.7;

    style[mxConstants.STYLE_SPACING_TOP] = 28;
    style[mxConstants.STYLE_FONTSTYLE] = 2;
    this.graph.getStylesheet().putCellStyle('end', style);
  }

  private configureBoundaryEventStyle() {
    const style = mxUtils.clone(this.graph.getStylesheet().getDefaultVertexStyle());
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ELLIPSE;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.EllipsePerimeter;
    style[mxConstants.STYLE_FONTSIZE] = 12;
    style[mxConstants.STYLE_STROKECOLOR] = '#2C6DA3';
    style[mxConstants.STYLE_STROKEWIDTH] = 1.7;
    
    style[mxConstants.STYLE_RESIZABLE] = false;
    this.graph.getStylesheet().putCellStyle('boundary', style);
  }

  private configureDefaultTransitionStyle() {
    const style = this.graph.getStylesheet().getDefaultEdgeStyle();
    style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector;
    style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_BLOCK;
    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_FONTSIZE] = 13;
    style[mxConstants.STYLE_FONTCOLOR] = 'black';
    style[mxConstants.STYLE_STROKECOLOR] = 'black';
  }
  private configureCrossoverTransitionStyle() {
    const style = mxUtils.clone(this.graph.getStylesheet().getDefaultEdgeStyle());
    style[mxConstants.STYLE_DASHED] = true;
    style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_OPEN;
    this.graph.getStylesheet().putCellStyle('crossover', style);
  }

  private configureAnimatedTransitionStyle() {
    const style = mxUtils.clone(this.graph.getStylesheet().getDefaultEdgeStyle());
    style[mxConstants.STYLE_STROKEWIDTH] = 6;
    this.graph.getStylesheet().putCellStyle('animated', style);
  }

  private autoResizeContainer() {
    // Auto-resizes the container
    this.graph.border = 40;
    this.graph.getView().translate = new mxPoint(this.graph.border / 2, this.graph.border / 2);
    this.graph.setResizeContainer(true);
    this.graph.graphHandler.setRemoveCellsFromParent(false);
  }

  public loadGraph(): void {
    const edgesWithTransition = this.updateModel();
    this.addAnimation(edgesWithTransition);
  }

  private updateModel() {
    const model = this.graph.getModel();

    // Adds cells to the model in a single task
    model.beginUpdate();
    try {
      const { task11, task111, task1Out, task3, task33, edgesWithTransition } = this.createPool1();
      const { task2In, task22, task4, task44 } = this.createPool2();

      createDefaultTransition(this.graph, task22, task3);
      createDefaultTransition(this.graph, task44, task111, 'Yes', 'verticalAlign=bottom;horizontal=0;');
      createCrossoverTransition(this.graph, task1Out, task2In);
      createCrossoverTransition(this.graph, task3, task11);
      createCrossoverTransitionWithPoint(this.graph, task11, task33);
      createDefaultTransition(this.graph, task33, task4);

      return edgesWithTransition;
    } finally {
      // Updates the display
      model.endUpdate();
    }
  }

  private createPool1() {
    const pool = createPool(this.graph, 'Pool 1');

    const { task1Out, task11, task111, edgesWithTransition } = this.createLane1A(pool);
    const { task3, task33 } = this.createLane1B(pool);

    return { task11, task111, task1Out, task3, task33, edgesWithTransition };
  }

  private createLane1A(pool: mxgraph.mxCell) {
    const lane = createLane(this.graph, pool, 'Lane A');

    const start1 = createStartEvent(this.graph, lane);
    const end1 = createEndEvent(this.graph, lane, 'A');

    const task1 = createTask(this.graph, lane, 'Contact\nProvider', 150);
    const task1Out = createBoundaryEvent(this.graph, task1, 'Out', 0.5, 1);
    const task11 = createTask(this.graph, lane, 'Complete\nAppropriate\nRequest', 400);
    const task111 = createTask(this.graph, lane, 'Receive and\nAcknowledge', 920);

    const edgesWithTransition = [];
    edgesWithTransition.push(createAnimatedTransition(this.graph, start1, task1));
    edgesWithTransition.push(createAnimatedTransition(this.graph, task1, task11));
    edgesWithTransition.push(createAnimatedTransition(this.graph, task11, task111));
    edgesWithTransition.push(createAnimatedTransition(this.graph, task111, end1));

    return { start1, end1, task1, task1Out, task11, task111, edgesWithTransition };
  }

  private createLane1B(pool: mxgraph.mxCell) {
    const lane = createLane(this.graph, pool, 'Lane B', 220, LANE_HEIGHT_LITTLE);

    const task3 = createTask(this.graph, lane, 'Request 1st-\nGate\nInformation', 400, TASK_Y_LITTLE);
    const task33 = createTask(this.graph, lane, 'Receive 1st-\nGate\nInformation', 650, TASK_Y_LITTLE);

    createDefaultTransition(this.graph, task3, task33);

    return { task3, task33 };
  }

  private createPool2() {
    const pool = createPool(this.graph, 'Pool 2', 400);

    const { task4, task44 } = this.createLane2A(pool);
    const { task2In, task22 } = this.createLane2B(pool);

    return { task2In, task22, task4, task44 };
  }

  private createLane2A(pool: mxgraph.mxCell) {
    const lane = createLane(this.graph, pool, 'Lane A');

    const task4 = createCallActivity(this.graph, lane, 'Receive and\nAcknowledge', 'https://jgraph.github.io/mxgraph/docs/js-api/files/model/mxCell-js.html#mxCell');

    const task44 = createCondition(this.graph, lane, 'Contract\nConstraints?', 950);
    const task444 = createCondition(this.graph, lane, 'Tap for gas\ndelivery?', LANE_WIDTH - 300);

    const end2 = createEndEvent(this.graph, lane, 'B', TASK_Y_LARGE - EVENT_WIDTH);
    const end3 = createEndEvent(this.graph, lane, 'C', TASK_Y_LARGE + TASK_HEIGHT);

    createDefaultTransition(this.graph, task4, task44);
    createDefaultTransition(this.graph, task44, task444, 'No', 'verticalAlign=bottom');
    createDefaultTransitionWithPoint(this.graph, task444, end2, 'Yes', 'verticalAlign=bottom');
    createDefaultTransitionWithPoint(this.graph, task444, end3, 'No', 'verticalAlign=top');

    return { task4, task44, task444, end2, end3 };
  }

  private createLane2B(pool: mxgraph.mxCell) {
    const lane = createLane(this.graph, pool, 'Lane B', 220, LANE_HEIGHT_LITTLE);

    const start2 = createStartEvent(this.graph, lane, EVENT_Y_LITTLE);

    const task2 = createTask(this.graph, lane, 'Receive\nRequest', 150, TASK_Y_LITTLE);
    const task2In = createBoundaryEvent(this.graph, task2, 'In', 0.5, -0.5);
    const task22 = createTask(this.graph, lane, 'Refer to Tap\nSystems\nCoordinator', 400, TASK_Y_LITTLE);

    createDefaultTransition(this.graph, start2, task2);
    createDefaultTransition(this.graph, task2, task22);

    return { start2, task2, task2In, task22 };
  }

  private addAnimation(edgesWithTransition: mxgraph.mxCell[]) {
    // Adds animation to edge shape and makes "pipe" visible
    this.graph.orderCells(true, edgesWithTransition);
    edgesWithTransition.forEach(edge => {
      const state = this.graph.view.getState(edge);
      state.shape.node.getElementsByTagName('path')[0].removeAttribute('visibility');
      state.shape.node.getElementsByTagName('path')[0].setAttribute('stroke-width', '6');
      state.shape.node.getElementsByTagName('path')[0].setAttribute('stroke', 'pink');
      state.shape.node.getElementsByTagName('path')[1].setAttribute('class', 'flow');
    });
  }
}
