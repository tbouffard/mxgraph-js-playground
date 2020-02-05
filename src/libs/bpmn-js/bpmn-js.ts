import { mxgraph, mxgraphFactory } from 'mxgraph-factory';

const {
  mxGraph,
  mxEvent,
  mxClient,
  mxUtils,
  mxConstants,
  mxEditor,
  mxPanningManager,
  mxEdgeHandler,
  mxGuide,
  mxGraphHandler,
  // for overlays example
  mxCellOverlay,
  mxCellTracker,
  mxImage,
} = mxgraphFactory({
  mxLoadResources: false,
  mxLoadStylesheets: false,
});

interface VisuEditor extends mxgraph.mxEditor {
  graph: mxgraph.mxGraph;
}

export class BpmnJs {
  private readonly editor: VisuEditor;

  constructor(config) {
    const configNode = mxUtils.load(config).getDocumentElement();
    this.editor = new mxEditor(configNode) as VisuEditor;
    this.init();
  }

  public loadGraph(): void {
    this.loadSampleGraph();
  }

  private loadSampleGraph(): void {
    // Adds cells to the model in a single step
    this.editor.graph.getModel().beginUpdate();

    try {
      const style = mxUtils.clone(this.editor.graph.getStylesheet().getDefaultVertexStyle());

      const styleRhombus = mxUtils.clone(style);
      styleRhombus[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RHOMBUS;
      this.editor.graph.getStylesheet().putCellStyle('condition', styleRhombus);

      const styleCloud = mxUtils.clone(style);
      styleCloud[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_CLOUD;
      this.editor.graph.getStylesheet().putCellStyle('styleCloud', styleCloud);

      const styleEnd = mxUtils.clone(styleRhombus);
      styleEnd[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_DOUBLE_ELLIPSE;
      this.editor.graph.getStylesheet().putCellStyle('end', styleEnd);

      const parent = this.editor.graph.getDefaultParent();

      // already existing styles
      const swimlane = this.editor.graph.insertVertex(parent, null, 'My custom swimlane', 20, 20, 600, 400, 'swimlane');

      const v1 = this.editor.graph.insertVertex(swimlane, null, 'Hello,', 40, 20, 80, 30, 'condition');
      const v2 = this.editor.graph.insertVertex(swimlane, null, 'World!', 200, 150, 80, 30, 'styleCloud');
      this.editor.graph.insertEdge(swimlane, null, '', v1, v2);
      const end = this.editor.graph.insertVertex(swimlane, null, 'end event', 200, 300, 30, 30, 'end');
      this.editor.graph.insertEdge(swimlane, null, '', v2, end);
    } finally {
      // Updates the display
      this.editor.graph.getModel().endUpdate();
    }
  }

  // ===========================================================================================================================================================================
  // CONFIGURATION
  // ===========================================================================================================================================================================

  public init(): void {
    try {
      if (!mxClient.isBrowserSupported()) {
        mxUtils.error('Browser is not supported!', 200, false);
      } else {
        this.initPanning();
        this.enableTitleUpdate();
        this.initOverlays();
        // Displays version in statusbar
        this.editor.setStatus('POC using mxGraph ' + mxClient.VERSION);
      }
    } catch (e) {
      // Shows an error message if the editor cannot start
      mxUtils.alert('Cannot start application: ' + e.message);
      throw e; // for debugging
    }
    this.initView();
  }

  private initView(): void {
    mxConstants.DEFAULT_HOTSPOT = 1;
    mxGraph.prototype.htmlLabels = true;
    mxGraph.prototype.isWrapping = () => true;
    // Enables guides
    mxGraphHandler.prototype.guidesEnabled = true;
    // Alt disables guides
    mxGuide.prototype.isEnabledForEvent = evt => !mxEvent.isAltDown(evt);
    // Enables snapping waypoints to terminals
    mxEdgeHandler.prototype.isSnapToTerminalsEvent = () => true;
  }

  private enableTitleUpdate(): void {
    // Updates the window title after opening new files
    const title = document.title;
    const changeTitleHandler = (sender): void => {
      document.title = title + ' - ' + sender.getTitle();
    };
    this.editor.addListener(mxEvent.OPEN, changeTitleHandler);
    // Prints the current root in the window title if the
    // current root of the graph changes (drilling).
    this.editor.addListener(mxEvent.ROOT, changeTitleHandler);
    changeTitleHandler(this.editor);
  }

  private initPanning(): void {
    // Adds active border for panning inside the container
    this.editor.graph.createPanningManager = function() {
      const pm = new mxPanningManager(this);
      pm.border = 30;
      return pm;
    };
    this.editor.graph.allowAutoPanning = true;
    this.editor.graph.timerAutoScroll = true;
  }

  // ===========================================================================================================================================================================
  // Adapted from the 'overlays' example
  // mainly 'var' --> 'const'
  // ===========================================================================================================================================================================
  private initOverlays(): void {
    const graph = this.editor.graph;
    // Disables basic selection and cell handling --> don't do it here to keep editor features
    // graph.setEnabled(false);

    // Highlights the vertices when the mouse enters
    const highlight = new mxCellTracker(graph, 'red', null); // TS add a function as 3rd argument

    // Enables tooltips for the overlays
    graph.setTooltips(true);

    // Installs a handler for click events in the graph
    // that toggles the overlay for the respective cell
    graph.addListener(mxEvent.CLICK, function(sender, evt) {
      const cell = evt.getProperty('cell');

      if (cell != null) {
        const overlays = graph.getCellOverlays(cell);

        if (overlays == null) {
          // Creates a new overlay with an image and a tooltip
          const overlay = new mxCellOverlay(new mxImage('images/overlays/check.png', 16, 16), 'Overlay tooltip');

          // Installs a handler for clicks on the overlay
          overlay.addListener(mxEvent.CLICK, function(sender, evt2) {
            mxUtils.alert('Overlay clicked');
          });

          // Sets the overlay for the cell in the graph
          graph.addCellOverlay(cell, overlay);
        } else {
          graph.removeCellOverlays(cell);
        }
      }
    });
  }
}
