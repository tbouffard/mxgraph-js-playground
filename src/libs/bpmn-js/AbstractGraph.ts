import { mxgraph } from 'mxgraph';
import { mxgraphFactory } from '../../components/mxgraph-factory';
import MxGraphConfigurator from './mxGraph/MxGraphConfigurator';
import { MxGraphBpmnStyles } from './mxGraph/MxGraphBpmnStyles';
const { mxEvent, mxClient, mxUtils, mxGraph, mxGraphModel, mxPoint } = mxgraphFactory({
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

mxGraph.prototype.edgeLabelsMovable = false;
mxGraph.prototype.cellsLocked = true;

// Overrides method to provide a cell label in the display
mxGraph.prototype.convertValueToString = function(cell) {
  if (mxUtils.isNode(cell.value)) {
    if (cell.value.nodeName != undefined && cell.value.nodeName == MxGraphBpmnStyles.TASK_CA) {
      return cell.getAttribute('name');
    }
  }

  return cell.value;
};

export default abstract class AbstractGraph {
  protected readonly graph: mxgraph.mxGraph;

  protected constructor(container: Element) {
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
      new MxGraphConfigurator(this.graph).configureStyles();
      // this.configureStyles();

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
          if (cell.value.nodeName != undefined && cell.value.nodeName == MxGraphBpmnStyles.TASK_CA) {
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

  private autoResizeContainer() {
    // Auto-resizes the container
    this.graph.border = 40;
    this.graph.getView().translate = new mxPoint(this.graph.border / 2, this.graph.border / 2);
    this.graph.setResizeContainer(true);
    this.graph.graphHandler.setRemoveCellsFromParent(false);
  }

  protected createPool(name: string, y = 0, width: number = LANE_WIDTH): mxgraph.mxCell {
    const pool = this.graph.insertVertex(this.graph.getDefaultParent(), null, name, 0, y, width, 0, MxGraphBpmnStyles.POLL_LANE);
    pool.setConnectable(false);
    return pool as mxgraph.mxCell;
  }

  protected createLane(pool: mxgraph.mxCell, name: string, y = 0, height: number = LANE_HEIGHT_LARGE, width: number = LANE_WIDTH): mxgraph.mxCell {
    const lane = this.graph.insertVertex(pool, null, name, 0, y, width, height, MxGraphBpmnStyles.POLL_LANE);
    lane.setConnectable(false);
    return lane as mxgraph.mxCell;
  }

  protected createStartEvent(lane: mxgraph.mxCell, y: number = EVENT_Y_LARGE, x = 60): mxgraph.mxCell {
    return this.graph.insertVertex(lane, null, null, x, y, EVENT_WIDTH, EVENT_WIDTH, MxGraphBpmnStyles.EVENT_START) as mxgraph.mxCell;
  }

  protected createEndTerminateEvent(lane: mxgraph.mxCell, name: string, y: number = EVENT_Y_LARGE): mxgraph.mxCell {
    return this.graph.insertVertex(lane, null, name, LANE_WIDTH - 100, y, EVENT_WIDTH, EVENT_WIDTH, MxGraphBpmnStyles.EVENT_END_TERMINATE) as mxgraph.mxCell;
  }

  protected createEndEvent(lane: mxgraph.mxCell, y: number = EVENT_Y_LARGE, x: number = LANE_WIDTH - 100, name?: string): mxgraph.mxCell {
    return this.graph.insertVertex(lane, null, name, x, y, EVENT_WIDTH, EVENT_WIDTH, MxGraphBpmnStyles.EVENT_END) as mxgraph.mxCell;
  }

  protected createBoundaryEvent(task: mxgraph.mxCell, name: string, x: number, y: number): mxgraph.mxCell {
    const boundaryEvent = this.graph.insertVertex(task, null, name, x, y, 30, 25, MxGraphBpmnStyles.EVENT_BOUNDARY);
    boundaryEvent.geometry.offset = new mxPoint(-15, -10);
    boundaryEvent.geometry.relative = true;
    return boundaryEvent as mxgraph.mxCell;
  }

  protected createTask(lane: mxgraph.mxCell, name: string, x: number, y: number = TASK_Y_LARGE): mxgraph.mxCell {
    return this.graph.insertVertex(lane, null, name, x, y, TASK_WIDTH, TASK_HEIGHT, MxGraphBpmnStyles.TASK) as mxgraph.mxCell;
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

    const callActivity = doc.createElement(MxGraphBpmnStyles.TASK_CA);
    callActivity.setAttribute('name', name);
    callActivity.setAttribute('href', href);
    callActivity.setAttribute('modalId', modalId);
    callActivity.setAttribute('subProcessId', subProcessId);

    return this.graph.insertVertex(lane, null, callActivity, x, y, TASK_WIDTH, TASK_HEIGHT, MxGraphBpmnStyles.TASK_CA) as mxgraph.mxCell;
  }

  protected createCondition(lane: mxgraph.mxCell, name: string, x: number, y = TASK_Y_LARGE): mxgraph.mxCell {
    return this.graph.insertVertex(lane, null, name, x, y, TASK_HEIGHT, TASK_HEIGHT, MxGraphBpmnStyles.GATEWAY) as mxgraph.mxCell;
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
    return this.graph.insertEdge(this.graph.getDefaultParent(), null, null, source, target, MxGraphBpmnStyles.TRANSITION_CROSSOVER);
  }

  protected createCrossoverTransitionWithPoint(source: mxgraph.mxCell, target: mxgraph.mxCell): mxgraph.mxEdge {
    const transition = this.createCrossoverTransition(source, target);
    transition.geometry.points = [new mxPoint(target.geometry.x + target.geometry.width / 2 + 20, source.geometry.y + (source.geometry.height * 4) / 5)];
    return transition as mxgraph.mxEdge;
  }

  protected createAnimatedTransition(source: mxgraph.mxCell, target: mxgraph.mxCell) {
    return this.graph.insertEdge(this.graph.getDefaultParent(), null, null, source, target, MxGraphBpmnStyles.TRANSITION_ANIMATED);
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
