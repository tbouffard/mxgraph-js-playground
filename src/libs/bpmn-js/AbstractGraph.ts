import { mxgraph } from 'mxgraph';
import { mxgraphFactory } from '../../components/mxgraph-factory';
const { mxEvent, mxClient, mxUtils, mxConstants, mxGraph, mxEdgeStyle, mxGraphModel, mxPerimeter, mxPoint } = mxgraphFactory({
  mxLoadResources: false,
  mxLoadStylesheets: false,
});

export const LANE_HEIGHT_LARGE = 220;
export const LANE_HEIGHT_LITTLE = 180;
export const LANE_WIDTH = 1500;

export const EVENT_WIDTH = 30;
export const EVENT_Y_LARGE = LANE_HEIGHT_LARGE / 2 - 10;
export const EVENT_Y_LITTLE = LANE_HEIGHT_LITTLE / 2 - 10;

export const TASK_WIDTH = 150;
export const TASK_HEIGHT = 75;
export const TASK_Y_LARGE = EVENT_Y_LARGE - 22;
export const TASK_Y_LITTLE = EVENT_Y_LITTLE - 22;

const EVENT_END_TERMINATE = 'endTerminate';
const EVENT_END = 'end';
const EVENT_START = 'start';
const EVENT_BOUNDARY = 'boundary';
const GATEWAY = 'condition';
const TASK = 'task';
const TASK_CA = 'CallActivity';
const POLL_LANE = 'poolLane';

const TRANSITION_CROSSOVER = 'crossover';
const TRANSITION_ANIMATED = 'animated';

mxGraph.prototype.edgeLabelsMovable = false;
mxGraph.prototype.cellsLocked = true;

// Overrides method to provide a cell label in the display
mxGraph.prototype.convertValueToString = function(cell) {
  if (mxUtils.isNode(cell.value)) {
    if (cell.value.nodeName != undefined && cell.value.nodeName == TASK_CA) {
      return cell.getAttribute('name');
    }
  }

  return cell.value;
};

export default abstract class AbstractGraph {
  protected readonly graph: mxgraph.mxGraph;

  constructor(container: Element) {
    try {
      // Checks if browser is supported
      if (!mxClient.isBrowserSupported()) {
        // Displays an error message if the browser is  not supported.
        return mxUtils.error('Browser is not supported!', 200, false);
      }

      const model = new mxGraphModel();
      this.graph = new mxGraph(container, model);

      this.handleClick();
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

  private handleClick(resizeGraph?: Function) {
    this.graph.addListener(mxEvent.CLICK, function(sender, evt) {
      const cell = evt.getProperty('cell'); // cell may be null

      function isSet(property: string): boolean {
        return property != undefined && property != null && property != 'null' && property.length > 0;
      }

      if (cell != null) {
        if (cell.vertex != null && cell.vertex == 1) {
          if (cell.value.nodeName != undefined && cell.value.nodeName == TASK_CA) {
            const href = cell.getAttribute('href');
            if (isSet.call(this, href)) {
              window.open(href);
            }

            const modalId = cell.getAttribute('modalId');
            if (isSet.call(this, modalId)) {
              const modal = document.getElementById(modalId);
              if (modal != null) {
                modal.style.display = 'block';
              }
            }

            const subProcessId = cell.getAttribute('subProcessId');
            if (isSet.call(this, subProcessId)) {
              const subProcess = document.getElementById(subProcessId);
              if (subProcess != null) {
                subProcess.style.display = 'block';
              }
            }

            if (!isSet.call(this, href) && !isSet.call(this, modalId) && !isSet.call(this, subProcessId)) {
              mxUtils.alert('No URL defined');
              console.log('No URL defined');
            }
          }
        }
      }
      evt.consume();
    });
  }

  private configureStyles() {
    this.configureDefaultVertexStyle();
    this.configurePollLaneStyle();
    this.configureTaskStyle();
    this.configureCallActivityStyle();
    this.configureConditionStyle();
    this.configureStartStyle();
    this.configureEndTerminateStyle();
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
    this.graph.getStylesheet().putCellStyle(POLL_LANE, style);
  }

  private configureTaskStyle() {
    const style = mxUtils.clone(this.graph.getStylesheet().getDefaultVertexStyle());
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = 'middle';
    style[mxConstants.STYLE_STROKECOLOR] = '#2C6DA3';
    style[mxConstants.STYLE_STROKEWIDTH] = 2;

    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_GRADIENTCOLOR] = '#B8B9DA';
    this.graph.getStylesheet().putCellStyle(TASK, style);
  }

  private configureCallActivityStyle() {
    const style = mxUtils.clone(this.graph.getStylesheet().getCellStyle(TASK));
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = 'middle';
    style[mxConstants.STYLE_STROKECOLOR] = '#2C6DA3';
    style[mxConstants.STYLE_STROKEWIDTH] = 2;

    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_GRADIENTCOLOR] = 'Thistle';
    this.graph.getStylesheet().putCellStyle(TASK_CA, style);
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
    this.graph.getStylesheet().putCellStyle(GATEWAY, style);
  }

  private configureStartStyle() {
    const style = mxUtils.clone(this.graph.getStylesheet().getDefaultVertexStyle());
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ELLIPSE;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.EllipsePerimeter;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = 'top';
    style[mxConstants.STYLE_STROKECOLOR] = '#62A928';
    style[mxConstants.STYLE_STROKEWIDTH] = 1.7;

    style[mxConstants.STYLE_GRADIENTCOLOR] = '#E9ECB1';
    this.graph.getStylesheet().putCellStyle(EVENT_START, style);
  }

  private configureEndTerminateStyle() {
    const style = mxUtils.clone(this.graph.getStylesheet().getDefaultVertexStyle());
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_DOUBLE_ELLIPSE;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.EllipsePerimeter;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = 'top';
    style[mxConstants.STYLE_STROKECOLOR] = '#8A151A';
    style[mxConstants.STYLE_STROKEWIDTH] = 2.7;

    style[mxConstants.STYLE_SPACING_TOP] = 28;
    style[mxConstants.STYLE_FONTSTYLE] = 2;
    this.graph.getStylesheet().putCellStyle(EVENT_END_TERMINATE, style);
  }

  private configureEndStyle() {
    const style = mxUtils.clone(this.graph.getStylesheet().getCellStyle(EVENT_END_TERMINATE));
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ELLIPSE;

    style[mxConstants.STYLE_GRADIENTCOLOR] = 'Crimson';
    style[mxConstants.STYLE_SPACING_TOP] = 35;
    this.graph.getStylesheet().putCellStyle(EVENT_END, style);
  }

  private configureBoundaryEventStyle() {
    const style = mxUtils.clone(this.graph.getStylesheet().getDefaultVertexStyle());
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ELLIPSE;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.EllipsePerimeter;
    style[mxConstants.STYLE_FONTSIZE] = 12;
    style[mxConstants.STYLE_STROKECOLOR] = '#2C6DA3';
    style[mxConstants.STYLE_STROKEWIDTH] = 1.7;

    style[mxConstants.STYLE_RESIZABLE] = false;
    this.graph.getStylesheet().putCellStyle(EVENT_BOUNDARY, style);
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
    this.graph.getStylesheet().putCellStyle(TRANSITION_CROSSOVER, style);
  }

  private configureAnimatedTransitionStyle() {
    const style = mxUtils.clone(this.graph.getStylesheet().getDefaultEdgeStyle());
    style[mxConstants.STYLE_STROKEWIDTH] = 6;
    this.graph.getStylesheet().putCellStyle(TRANSITION_ANIMATED, style);
  }

  private autoResizeContainer() {
    // Auto-resizes the container
    this.graph.border = 40;
    this.graph.getView().translate = new mxPoint(this.graph.border / 2, this.graph.border / 2);
    this.graph.setResizeContainer(true);
    this.graph.graphHandler.setRemoveCellsFromParent(false);
  }

  protected createPool(name: string, y = 0, width: number = LANE_WIDTH): mxgraph.mxCell {
    const pool = this.graph.insertVertex(this.graph.getDefaultParent(), null, name, 0, y, width, 0, POLL_LANE);
    pool.setConnectable(false);
    return pool as mxgraph.mxCell;
  }

  protected createLane(pool: mxgraph.mxCell, name: string, y = 0, height: number = LANE_HEIGHT_LARGE, width: number = LANE_WIDTH): mxgraph.mxCell {
    const lane = this.graph.insertVertex(pool, null, name, 0, y, width, height, POLL_LANE);
    lane.setConnectable(false);
    return lane as mxgraph.mxCell;
  }

  protected createStartEvent(lane: mxgraph.mxCell, y: number = EVENT_Y_LARGE, x = 60): mxgraph.mxCell {
    return this.graph.insertVertex(lane, null, null, x, y, EVENT_WIDTH, EVENT_WIDTH, EVENT_START) as mxgraph.mxCell;
  }

  protected createEndTerminateEvent(lane: mxgraph.mxCell, name: string, y: number = EVENT_Y_LARGE): mxgraph.mxCell {
    return this.graph.insertVertex(lane, null, name, LANE_WIDTH - 100, y, EVENT_WIDTH, EVENT_WIDTH, EVENT_END_TERMINATE) as mxgraph.mxCell;
  }

  protected createEndEvent(lane: mxgraph.mxCell, y: number = EVENT_Y_LARGE, x: number = LANE_WIDTH - 100, name?: string): mxgraph.mxCell {
    return this.graph.insertVertex(lane, null, name, x, y, EVENT_WIDTH, EVENT_WIDTH, EVENT_END) as mxgraph.mxCell;
  }

  protected createBoundaryEvent(task: mxgraph.mxCell, name: string, x: number, y: number): mxgraph.mxCell {
    const boundaryEvent = this.graph.insertVertex(task, null, name, x, y, 30, 25, EVENT_BOUNDARY);
    boundaryEvent.geometry.offset = new mxPoint(-15, -10);
    boundaryEvent.geometry.relative = true;
    return boundaryEvent as mxgraph.mxCell;
  }

  protected createTask(lane: mxgraph.mxCell, name: string, x: number, y: number = TASK_Y_LARGE): mxgraph.mxCell {
    return this.graph.insertVertex(lane, null, name, x, y, TASK_WIDTH, TASK_HEIGHT, TASK) as mxgraph.mxCell;
  }

  protected createCallActivity(
    lane: mxgraph.mxCell,
    name: string,
    x: number,
    y = TASK_Y_LARGE,
    href: string = null,
    modalId: string = null,
    subProcessId: string = null,
  ): mxgraph.mxCell {
    // Note that these XML nodes will be enclosing the mxCell nodes for the model cells in the output
    const doc = mxUtils.createXmlDocument();

    const callActivity = doc.createElement(TASK_CA);
    callActivity.setAttribute('name', name);
    callActivity.setAttribute('href', href);
    callActivity.setAttribute('modalId', modalId);
    callActivity.setAttribute('subProcessId', subProcessId);

    return this.graph.insertVertex(lane, null, callActivity, x, y, TASK_WIDTH, TASK_HEIGHT, TASK_CA) as mxgraph.mxCell;
  }

  protected createCondition(lane: mxgraph.mxCell, name: string, x: number, y = TASK_Y_LARGE): mxgraph.mxCell {
    return this.graph.insertVertex(lane, null, name, x, y, TASK_HEIGHT, TASK_HEIGHT, GATEWAY) as mxgraph.mxCell;
  }

  protected createDefaultTransition(source: mxgraph.mxCell, target: mxgraph.mxCell, name = null, style?: string): mxgraph.mxEdge {
    return this.graph.insertEdge(this.graph.getDefaultParent(), null, name, source, target, style) as mxgraph.mxEdge;
  }

  protected createDefaultTransitionWithPoint(source: mxgraph.mxCell, target: mxgraph.mxCell, name = null, style?: string): mxgraph.mxEdge {
    const transition = this.createDefaultTransition(source, target, name, style);
    transition.geometry.points = [new mxPoint(source.geometry.x + source.geometry.width / 2, target.geometry.y + target.geometry.height / 2)];
    return transition as mxgraph.mxEdge;
  }

  protected createCrossoverTransition(source: mxgraph.mxCell, target: mxgraph.mxCell): mxgraph.mxEdge {
    return this.graph.insertEdge(this.graph.getDefaultParent(), null, null, source, target, TRANSITION_CROSSOVER);
  }

  protected createCrossoverTransitionWithPoint(source: mxgraph.mxCell, target: mxgraph.mxCell): mxgraph.mxEdge {
    const transition = this.createCrossoverTransition(source, target);
    transition.geometry.points = [new mxPoint(target.geometry.x + target.geometry.width / 2 + 20, source.geometry.y + (source.geometry.height * 4) / 5)];
    return transition as mxgraph.mxEdge;
  }

  protected createAnimatedTransition(source: mxgraph.mxCell, target: mxgraph.mxCell) {
    return this.graph.insertEdge(this.graph.getDefaultParent(), null, null, source, target, TRANSITION_ANIMATED);
  }

  protected addAnimation(edgesWithTransition: mxgraph.mxCell[]) {
    // Adds animation to edge shape and makes "pipe" visible
    this.graph.orderCells(true, edgesWithTransition);
    edgesWithTransition.forEach(edge => {
      const state = this.graph.view.getState(edge);
      state.shape.node.getElementsByTagName('path')[0].removeAttribute('visibility');
      state.shape.node.getElementsByTagName('path')[0].setAttribute('stroke-width', '6');
      state.shape.node.getElementsByTagName('path')[0].setAttribute('stroke', 'LightPink');
      state.shape.node.getElementsByTagName('path')[1].setAttribute('class', 'flow');
    });
  }

  abstract loadGraph(): void;
}
