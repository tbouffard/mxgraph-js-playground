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
      // Defines an icon for creating new connections in the connection handler.
      // This will automatically disable the highlighting of the source vertex.
      mxConnectionHandler.prototype.connectImage = new mxImage('images/connector.gif', 16, 16);

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
      // Disables the built-in context menu
      mxEvent.disableContextMenu(container);

      /*      mxEdgeHandler.prototype.removeEnabled = false;
      mxEdgeHandler.prototype.cloneEnabled = false;
      mxEdgeHandler.prototype.addEnabled = false;
      mxEdgeHandler.prototype.dblClickRemoveEnabled = false;
      mxEdgeHandler.prototype.mergeRemoveEnabled = false;
      mxEdgeHandler.prototype.straightRemoveEnabled = false;
      mxEdgeHandler.prototype.virtualBendsEnabled = false;*/

      this.autoResizeContainer(graph);
      this.setVertexStyle(graph);

      this.addAutomaticLayoutAndVariousSwitches(graph);

      // Applies size changes to siblings and parents
      const swimlaneManager = new mxSwimlaneManager(graph);
      swimlaneManager.setEnabled(false);

      this.createStackLayout(graph, model);

      // Relative children cannot be removed from parent
      graph.graphHandler.shouldRemoveCellsFromParent = function(parent, cells, evt) {
        return cells.length == 0 && !cells[0].geometry.relative && mxGraphHandler.prototype.shouldRemoveCellsFromParent.apply(this, arguments);
      };

      // Removes folding icon for relative children
      graph.isCellFoldable = function(cell, collapse) {
        const childCount = this.model.getChildCount(cell);

        for (let i = 0; i < childCount; i++) {
          const child = this.model.getChildAt(cell, i);
          const geo = this.getCellGeometry(child);

          if (geo != null && geo.relative) {
            return false;
          }
        }

        return childCount > 0;
      };

      // Replaces translation for relative children
      graph.translateCell = function(cell, dx, dy) {
        const rel = this.getRelativePosition(this.view.getState(cell), dx * graph.view.scale, dy * graph.view.scale);

        if (rel != null) {
          let geo = this.model.getGeometry(cell);

          if (geo != null && geo.relative) {
            geo = geo.clone();
            geo.x = rel.x;
            geo.y = rel.y;

            this.model.setGeometry(cell, geo);
          }
        } else {
          mxGraph.prototype.translateCell.apply(this, arguments);
        }
      };

      // Replaces move preview for relative children
      graph.graphHandler.getDelta = function(me) {
        const point = mxUtils.convertPoint(this.graph.container, me.getX(), me.getY());
        let delta = new mxPoint(point.x - this.first.x, point.y - this.first.y);

        if (this.cells != null && this.cells.length > 0 && this.cells[0] != null) {
          const state = this.graph.view.getState(this.cells[0]);
          const rel = this.getRelativePosition(state, delta.x, delta.y);

          if (rel != null) {
            const pstate = this.graph.view.getState(this.graph.model.getParent(state.cell));

            if (pstate != null) {
              delta = new mxPoint(pstate.x + pstate.width * rel.x - state.getCenterX(), pstate.y + pstate.height * rel.y - state.getCenterY());
            }
          }
        }

        return delta;
      };
    } catch (e) {
      // Shows an error message if the editor cannot start
      mxUtils.alert('Cannot start application: ' + e.message);
      throw e; // for debugging
    }
  }

  // Returns the relative position of the given child
  private getRelativePosition(state, dx, dy) {
    (state, dx, dy) => {
      if (state != null) {
        const model = this.graph.getModel();
        const geo = model.getGeometry(state.cell);

        if (geo != null && geo.relative && !model.isEdge(state.cell)) {
          const parent = model.getParent(state.cell);

          if (model.isVertex(parent)) {
            const pstate = this.graph.view.getState(parent);

            if (pstate != null) {
              const scale = this.graph.view.scale;
              let x = state.x + dx;
              let y = state.y + dy;

              if (geo.offset != null) {
                x -= geo.offset.x * scale;
                y -= geo.offset.y * scale;
              }

              x = (x - pstate.x) / pstate.width;
              y = (y - pstate.y) / pstate.height;

              if (Math.abs(y - 0.5) <= Math.abs((x - 0.5) / 2)) {
                x = x > 0.5 ? 1 : 0;
                y = Math.min(1, Math.max(0, y));
              } else {
                x = Math.min(1, Math.max(0, x));
                y = y > 0.5 ? 1 : 0;
              }

              return new mxPoint(x, y);
            }
          }
        }
      }

      return null;
    };
  }

  private addAutomaticLayoutAndVariousSwitches(graph: mxgraph.mxGraph) {
    // Adds automatic layout and various switches if the graph is enabled
    if (graph.isEnabled()) {
      // Disallows new connections, no dangling edges
      graph.setConnectable(false);
      graph.setAllowDanglingEdges(false);

      // End-states are no valid sources
      const previousIsValidSource = graph.isValidSource;

      this.isValidSource(graph, previousIsValidSource);
      this.isValidTarget(graph);

      // Disallows dropping cells into new lanes and lanes into new pools
      graph.setDropEnabled(false);
      // Disallows dropping cells on edges to split edges
      graph.setSplitEnabled(false);

      this.isValidDropTarget(graph);
      this.isPool(graph);
      this.changesSwimlaneOrientation(graph);

      // Keeps widths on collapse/expand
      const foldingHandler = function(sender, evt) {
        const cells = evt.getProperty('cells');

        for (let i = 0; i < cells.length; i++) {
          const geo = graph.model.getGeometry(cells[i]);

          if (geo.alternateBounds != null) {
            geo.width = geo.alternateBounds.width;
          }
        }
      };

      graph.addListener(mxEvent.FOLD_CELLS, foldingHandler);
    }
  }

  private createStackLayout(graph: mxgraph.mxGraph, model: mxgraph.mxGraphModel) {
    // Creates a stack depending on the orientation of the swimlane
    const layout = new mxStackLayout(graph, false);

    // Makes sure all children fit into the parent swimlane
    layout.resizeParent = true;

    // Applies the size to children if parent size changes
    layout.fill = true;

    layout.isVertexIgnored = this.isVertexIgnored(graph);

    // Keeps the lanes and pools stacked
    const layoutMgr = new mxLayoutManager(graph);
    layoutMgr.getLayout = this.getLayout(graph, model, layout);
  }

  private getLayout(graph: mxgraph.mxGraph = this.graph, model: mxgraph.mxGraphModel, layout: mxgraph.mxStackLayout) {
    return function(cell) {
      if (!model.isEdge(cell) && model.getChildCount(cell) > 0 && (model.getParent(cell) == model.getRoot() || graph.isPool(cell))) {
        layout.fill = graph.isPool(cell);

        return layout;
      }

      return null;
    };
  }

  private isVertexIgnored(graph: mxgraph.mxGraph = this.graph) {
    // Only update the size of swimlanes
    return function(vertex) {
      return !graph.isSwimlane(vertex);
    };
  }

  private changesSwimlaneOrientation(graph: mxgraph.mxGraph = this.graph) {
    // Changes swimlane orientation while collapsed
    graph.model.getStyle = function(cell) {
      let style = mxGraphModel.prototype.getStyle.apply(this, arguments);

      if (graph.isCellCollapsed(cell)) {
        if (style != null) {
          style += ';';
        } else {
          style = '';
        }

        style += 'horizontal=1;align=left;spacingLeft=14;';
      }

      return style;
    };
  }

  private isPool(graph: mxgraph.mxGraph = this.graph) {
    // Adds new method for identifying a pool
    graph.isPool = function(cell) {
      const model = this.getModel();
      const parent = model.getParent(cell);

      return parent != null && model.getParent(parent) == model.getRoot();
    };
  }

  private isValidDropTarget(graph: mxgraph.mxGraph = this.graph) {
    // Returns true for valid drop operations
    graph.isValidDropTarget = function(target, cells, evt) {
      if (this.isSplitEnabled() && this.isSplitTarget(target, cells, evt)) {
        return true;
      }

      const model = this.getModel();
      let lane = false;
      let pool = false;
      let cell = false;

      // Checks if any lanes or pools are selected
      for (let i = 0; i < cells.length; i++) {
        const tmp = model.getParent(cells[i]);
        lane = lane || this.isPool(tmp);
        pool = pool || this.isPool(cells[i]);

        cell = cell || !(lane || pool);
      }

      return !pool && cell != lane && ((lane && this.isPool(target)) || (cell && this.isPool(model.getParent(target))));
    };
  }

  private isValidTarget(graph: mxgraph.mxGraph = this.graph) {
    // Start-states are no valid targets, we do not perform a call to the superclass function because this would call isValidSource
    // Note: All states are start states in the example below, so we use the state style below
    graph.isValidTarget = function(cell) {
      const style = this.getModel().getStyle(cell);

      return !this.getModel().isEdge(cell) && !this.isSwimlane(cell) && (style == null || !(style == 'state' || style.indexOf('state') == 0));
    };
  }

  private isValidSource(graph: mxgraph.mxGraph = this.graph, previousIsValidSource) {
    graph.isValidSource = function(cell) {
      if (previousIsValidSource.apply(this, arguments)) {
        const style = this.getModel().getStyle(cell);

        return style == null || !(style == 'end' || style.indexOf('end') == 0);
      }

      return false;
    };
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
    graph.border = 80;
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
      // Pool 1
      const pool1 = graph.insertVertex(parent, null, 'Pool 1', 0, 0, 640, 0);
      pool1.setConnectable(false);

      const lane1a = graph.insertVertex(pool1, null, 'Lane A', 0, 0, 640, 140);
      lane1a.setConnectable(false);

      const lane1b = graph.insertVertex(pool1, null, 'Lane B', 0, 140, 640, 110);
      lane1b.setConnectable(false);

      // Pool 2
      const pool2 = graph.insertVertex(parent, null, 'Pool 2', 0, 250, 640, 0);
      pool2.setConnectable(false);

      const lane2a = graph.insertVertex(pool2, null, 'Lane A', 0, 0, 640, 140);
      lane2a.setConnectable(false);

      const lane2b = graph.insertVertex(pool2, null, 'Lane B', 0, 140, 640, 110);
      lane2b.setConnectable(false);

      const start1 = graph.insertVertex(lane1a, null, null, 40, 40, 30, 30, 'state');
      const end1 = graph.insertVertex(lane1a, null, 'A', 560, 40, 30, 30, 'end');

      const step1 = graph.insertVertex(lane1a, null, 'Contact\nProvider', 90, 30, 80, 50, 'process');
      const step1Out = graph.insertVertex(step1, null, 'Out', 0.5, 1, 25, 20, 'fontSize=9;shape=ellipse;resizable=0;horizontal=1;');
      step1Out.geometry.offset = new mxPoint(-10, -10);
      step1Out.geometry.relative = true;
      const step11 = graph.insertVertex(lane1a, null, 'Complete\nAppropriate\nRequest', 190, 30, 80, 50, 'process');
      const step111 = graph.insertVertex(lane1a, null, 'Receive and\nAcknowledge', 385, 30, 80, 50, 'process');

      const start2 = graph.insertVertex(lane2b, null, null, 40, 40, 30, 30, 'state');

      const step2 = graph.insertVertex(lane2b, null, 'Receive\nRequest', 90, 30, 80, 50, 'process');
      const step2In = graph.insertVertex(step2, null, 'In', 0.5, -0.5, 25, 20, 'fontSize=9;shape=ellipse;resizable=0;horizontal=1;');
      step2In.geometry.offset = new mxPoint(-10, -10);
      step2In.geometry.relative = true;
      const step22 = graph.insertVertex(lane2b, null, 'Refer to Tap\nSystems\nCoordinator', 190, 30, 80, 50, 'process');

      const step3 = graph.insertVertex(lane1b, null, 'Request 1st-\nGate\nInformation', 190, 30, 80, 50, 'process');
      const step33 = graph.insertVertex(lane1b, null, 'Receive 1st-\nGate\nInformation', 290, 30, 80, 50, 'process');

      const step4 = graph.insertVertex(lane2a, null, 'Receive and\nAcknowledge', 290, 20, 80, 50, 'process');
      const step44 = graph.insertVertex(lane2a, null, 'Contract\nConstraints?', 400, 20, 50, 50, 'condition');
      const step444 = graph.insertVertex(lane2a, null, 'Tap for gas\ndelivery?', 480, 20, 50, 50, 'condition');

      const end2 = graph.insertVertex(lane2a, null, 'B', 560, 30, 30, 30, 'end');
      const end3 = graph.insertVertex(lane2a, null, 'C', 560, 84, 30, 30, 'end');

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
}
