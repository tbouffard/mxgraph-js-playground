import { mxgraph } from 'mxgraph';
import { mxgraphFactory } from '../../../components/mxgraph-factory';
import { MxGraphBpmnStyles } from './MxGraphBpmnStyles';

const { mxUtils, mxConstants, mxEdgeStyle, mxPerimeter } = mxgraphFactory({
  mxLoadResources: false,
  mxLoadStylesheets: false,
});

export default class MxGraphConfigurator {
  private readonly graph: mxgraph.mxGraph;

  constructor(graph: mxgraph.mxGraph) {
    this.graph = graph;
  }

  public configureStyles(): void {
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

  // TODO specify explicit type
  private cloneDefaultVertexStyle(): any {
    return this.graph.getStylesheet().getDefaultVertexStyle();
  }

  // TODO specify explicit type
  private cloneVertexStyle(style: string): any {
    return mxUtils.clone(this.graph.getStylesheet().getCellStyle(style));
  }

  private configureDefaultVertexStyle(): void {
    const style = this.cloneDefaultVertexStyle();
    style[mxConstants.STYLE_HORIZONTAL] = true;
    style[mxConstants.STYLE_FONTSIZE] = 15;
    style[mxConstants.STYLE_FILLCOLOR] = 'white';
    style[mxConstants.STYLE_FONTCOLOR] = 'black';
    style[mxConstants.STYLE_STROKECOLOR] = 'black';
    style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'none';
    style[mxConstants.STYLE_GRADIENT_DIRECTION] = 'east';
  }

  private configurePollLaneStyle(): void {
    const style = this.cloneDefaultVertexStyle();
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_SWIMLANE;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = 'middle';
    style[mxConstants.STYLE_HORIZONTAL] = false;
    style[mxConstants.STYLE_FONTSIZE] = 20;
    style[mxConstants.STYLE_FILLCOLOR] = '#d3d2d1';

    style[mxConstants.STYLE_STARTSIZE] = 30;
    this.graph.getStylesheet().putCellStyle(MxGraphBpmnStyles.POLL_LANE, style);
  }

  private configureTaskStyle(): void {
    const style = this.cloneDefaultVertexStyle();
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = 'middle';
    style[mxConstants.STYLE_STROKECOLOR] = '#2C6DA3';
    style[mxConstants.STYLE_STROKEWIDTH] = 2;

    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_GRADIENTCOLOR] = '#B8B9DA';
    this.graph.getStylesheet().putCellStyle(MxGraphBpmnStyles.TASK, style);
  }

  private configureCallActivityStyle(): void {
    const style = this.cloneVertexStyle(MxGraphBpmnStyles.TASK);
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = 'middle';
    style[mxConstants.STYLE_STROKECOLOR] = '#2C6DA3';
    style[mxConstants.STYLE_STROKEWIDTH] = 2;

    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_GRADIENTCOLOR] = 'Thistle';
    this.graph.getStylesheet().putCellStyle(MxGraphBpmnStyles.TASK_CA, style);
  }

  private configureConditionStyle(): void {
    const style = this.cloneDefaultVertexStyle();
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RHOMBUS;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RhombusPerimeter;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = 'top';
    style[mxConstants.STYLE_STROKECOLOR] = '#96A826';
    style[mxConstants.STYLE_STROKEWIDTH] = 1.7;

    style[mxConstants.STYLE_SPACING_TOP] = 55;
    style[mxConstants.STYLE_SPACING_RIGHT] = 110;
    style[mxConstants.STYLE_GRADIENTCOLOR] = '#E9ECB1';
    this.graph.getStylesheet().putCellStyle(MxGraphBpmnStyles.GATEWAY, style);
  }

  private configureStartStyle(): void {
    const style = this.cloneDefaultVertexStyle();
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ELLIPSE;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.EllipsePerimeter;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = 'top';
    style[mxConstants.STYLE_STROKECOLOR] = '#62A928';
    style[mxConstants.STYLE_STROKEWIDTH] = 1.7;

    style[mxConstants.STYLE_GRADIENTCOLOR] = '#E9ECB1';
    this.graph.getStylesheet().putCellStyle(MxGraphBpmnStyles.EVENT_START, style);
  }

  private configureEndTerminateStyle(): void {
    const style = this.cloneDefaultVertexStyle();
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_DOUBLE_ELLIPSE;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.EllipsePerimeter;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = 'top';
    style[mxConstants.STYLE_STROKECOLOR] = '#8A151A';
    style[mxConstants.STYLE_STROKEWIDTH] = 2.7;

    style[mxConstants.STYLE_SPACING_TOP] = 28;
    style[mxConstants.STYLE_FONTSTYLE] = 2;
    this.graph.getStylesheet().putCellStyle(MxGraphBpmnStyles.EVENT_END_TERMINATE, style);
  }

  private configureEndStyle(): void {
    const style = this.cloneVertexStyle(MxGraphBpmnStyles.EVENT_END_TERMINATE);
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ELLIPSE;

    style[mxConstants.STYLE_GRADIENTCOLOR] = 'Crimson';
    style[mxConstants.STYLE_SPACING_TOP] = 35;
    this.graph.getStylesheet().putCellStyle(MxGraphBpmnStyles.EVENT_END, style);
  }

  private configureBoundaryEventStyle(): void {
    const style = this.cloneDefaultVertexStyle();
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ELLIPSE;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.EllipsePerimeter;
    style[mxConstants.STYLE_FONTSIZE] = 12;
    style[mxConstants.STYLE_STROKECOLOR] = '#2C6DA3';
    style[mxConstants.STYLE_STROKEWIDTH] = 1.7;

    style[mxConstants.STYLE_RESIZABLE] = false;
    this.graph.getStylesheet().putCellStyle(MxGraphBpmnStyles.EVENT_BOUNDARY, style);
  }

  private configureDefaultTransitionStyle(): void {
    const style = this.graph.getStylesheet().getDefaultEdgeStyle();
    style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector;
    style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_BLOCK;
    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_FONTSIZE] = 13;
    style[mxConstants.STYLE_FONTCOLOR] = 'black';
    style[mxConstants.STYLE_STROKECOLOR] = 'black';
  }

  // TODO explicit type
  private cloneDefaultEdgeStyle(): any {
    return mxUtils.clone(this.graph.getStylesheet().getDefaultEdgeStyle());
  }

  private configureCrossoverTransitionStyle(): void {
    const style = this.cloneDefaultEdgeStyle();
    style[mxConstants.STYLE_DASHED] = true;
    style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_OPEN;
    this.graph.getStylesheet().putCellStyle(MxGraphBpmnStyles.TRANSITION_CROSSOVER, style);
  }

  private configureAnimatedTransitionStyle(): void {
    const style = this.cloneDefaultEdgeStyle();
    style[mxConstants.STYLE_STROKEWIDTH] = 6;
    this.graph.getStylesheet().putCellStyle(MxGraphBpmnStyles.TRANSITION_ANIMATED, style);
  }
}
