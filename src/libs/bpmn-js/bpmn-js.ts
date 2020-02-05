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
  // to manipulate mxgraph console
  mxLog,
  // for create tasks registration
  mxResources,
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
    this.loadGraphFromFile();
  }

  private loadGraphFromFile(): void {
    const req = mxUtils.load('resources/diagrams/travel-booking.xml');
    const root = req.getDocumentElement();

    // const newGraphModel = mxUtils.parseXml(root);
    // const node = newGraphModel.documentElement;
    this.editor.readGraphModel(root);
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

        // this.registerCreateTasks();

        mxLog.show();
        mxLog.TRACE = true;
        // TODO log warn: js docs explain we can pass a message
        // mxLog.warn('Hello, World!');
        // mxLog.warn();

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

  // private initViewXmlButton(): void {
  //   const graph = this.editor.graph;
  //   const button = mxUtils.button('View XML', function() {
  //     const encoder = new mxCodec();
  //     const node = encoder.encode(graph.getModel());
  //     mxUtils.popup(mxUtils.getPrettyXml(node), true);
  //   });
  // }

  /*
  * 		<add as="myFirstAction"><![CDATA[
			function (editor, cell)
			{
				var encoder = new mxCodec();
				var node = encoder.encode(editor.graph.getModel());
				mxUtils.popup(mxUtils.getPrettyXml(node), true);
			}
		]]></add>
  *
  *
  * */

  private registerCreateTasks() {
    console.log('register create tasks');
    const currentEditor = this.editor;
    mxEditor.prototype.createTasks = function(div) {
      // const mxResources = currentEditor.
      const off = 30;
      console.log('call createTasks');
      // mxUtils.error('call createTasks!', 200, true);

      if (currentEditor.graph != null) {
        const layer = currentEditor.graph.model.root.getChildAt(0);
        mxUtils.para(div, mxResources.get('examples'));
        mxUtils.linkInvoke(div, mxResources.get('newDiagram'), currentEditor, 'open', 'diagrams/empty.xml', off);
        mxUtils.br(div);
        mxUtils.linkInvoke(div, mxResources.get('swimlanes'), currentEditor, 'open', 'diagrams/swimlanes.xml', off);
        mxUtils.br(div);
        mxUtils.linkInvoke(div, mxResources.get('travelBooking'), currentEditor, 'open', 'diagrams/travel-booking.xml', off);
        mxUtils.br(div);

        if (!currentEditor.graph.isSelectionEmpty()) {
          const cell = currentEditor.graph.getSelectionCell();
          if ((currentEditor.graph.getSelectionCount() == 1 && currentEditor.graph.model.isVertex(cell) && cell.getEdgeCount() > 0) || currentEditor.graph.isSwimlane(cell)) {
            mxUtils.para(div, 'Layout');
            mxUtils.linkAction(div, mxResources.get('verticalTree'), currentEditor, 'verticalTree', off);
            mxUtils.br(div);
            mxUtils.linkAction(div, mxResources.get('horizontalTree'), currentEditor, 'horizontalTree', off);
            mxUtils.br(div);
          }

          mxUtils.para(div, 'Format');

          if (mxUtils.isNode(cell.value, 'Symbol')) {
            mxUtils.linkAction(div, mxResources.get('image'), currentEditor, 'image', off);
            mxUtils.br(div);
          } else {
            mxUtils.linkAction(div, mxResources.get('opacity'), currentEditor, 'opacity', off);
            mxUtils.br(div);
            if (currentEditor.graph.model.isVertex(cell) || (cell.style != null && cell.style.indexOf('arrowEdge') >= 0)) {
              mxUtils.linkAction(div, mxResources.get('gradientColor'), currentEditor, 'gradientColor', off);
              mxUtils.br(div);
            }
            if (currentEditor.graph.model.isEdge(cell)) {
              mxUtils.linkAction(div, 'Straight Connector', currentEditor, 'straightConnector', off);
              mxUtils.br(div);
              mxUtils.linkAction(div, 'Elbow Connector', currentEditor, 'elbowConnector', off);
              mxUtils.br(div);
              mxUtils.linkAction(div, 'Arrow Connector', currentEditor, 'arrowConnector', off);
              mxUtils.br(div);
            }
          }

          mxUtils.linkAction(div, 'Rounded', currentEditor, 'toggleRounded', off);
          mxUtils.br(div);
          if (currentEditor.graph.isSwimlane(cell) || currentEditor.graph.model.isEdge(cell)) {
            mxUtils.linkAction(div, 'Orientation', currentEditor, 'toggleOrientation', off);
            mxUtils.br(div);
          }

          if (currentEditor.graph.getSelectionCount() > 1) {
            mxUtils.para(div, mxResources.get('align'));
            mxUtils.linkAction(div, mxResources.get('left'), currentEditor, 'alignCellsLeft', off);
            mxUtils.br(div);
            mxUtils.linkAction(div, mxResources.get('center'), currentEditor, 'alignCellsCenter', off);
            mxUtils.br(div);
            mxUtils.linkAction(div, mxResources.get('right'), currentEditor, 'alignCellsRight', off);
            mxUtils.br(div);
            mxUtils.linkAction(div, mxResources.get('top'), currentEditor, 'alignCellsTop', off);
            mxUtils.br(div);
            mxUtils.linkAction(div, mxResources.get('middle'), currentEditor, 'alignCellsMiddle', off);
            mxUtils.br(div);
            mxUtils.linkAction(div, mxResources.get('bottom'), currentEditor, 'alignCellsBottom', off);
            mxUtils.br(div);
          }

          mxUtils.para(div, mxResources.get('selection'));
          mxUtils.linkAction(div, mxResources.get('clearSelection'), currentEditor, 'selectNone', off);
          mxUtils.br(div);
        } else if (layer.getChildCount() > 0) {
          mxUtils.para(div, mxResources.get('selection'));
          mxUtils.linkAction(div, mxResources.get('selectAll'), currentEditor, 'selectAll', off);
          mxUtils.br(div);
        }

        mxUtils.br(div);
      }
    };
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
