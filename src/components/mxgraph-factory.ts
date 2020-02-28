import { mxgraph } from 'mxgraph'; // Typings only - no code!

declare function MxGraphFactory(opts: {
  /** Specifies the path in mxClient.basePath. */
  mxBasePath?: string;
  /** Specifies the path in mxClient.imageBasePath. */
  mxImageBasePath?: string;
  /** Specifies the language for resources in mxClient.language. */
  mxLanguage?: string;
  /** Array of all supported language extensions. */
  mxLanguages?: string[];
  /** Specifies the default language in mxClient.defaultLanguage. */
  mxDefaultLanguage?: string;
  /** Specifies if any resources should be loaded.  Default is true. */
  mxLoadResources?: boolean;
  /** Specifies if any stylesheets should be loaded.  Default is true. */
  mxLoadStylesheets?: boolean;
  /** Force loading the JavaScript files in development mode */
  mxForceIncludes?: boolean;
  /** Specify the extension of resource files. */
  mxResourceExtension?: string;
}): typeof mxgraph;

//export default MxGraphFactory;

export const mxgraphFactory: typeof MxGraphFactory = options => {
  const optionKeys = [
    'mxBasePath',
    'mxDefaultLanguage',
    'mxForceIncludes',
    'mxImageBasePath',
    'mxLanguage',
    'mxLanguages',
    'mxLoadResources',
    'mxLoadStylesheets',
    'mxResourceExtension',
  ];
  optionKeys.forEach((key: string) => {
    (window as any)[key] = (options as any)[key];
  });
  const mxClient: typeof mxgraph = require('mxgraph')({
    mxBasePath: 'mxgraph',
  });
  mxClient.mxCodec.prototype.decode = function(node: Element, into: Element) {
    if (node !== null && node.nodeType === mxClient.mxConstants.NODETYPE_ELEMENT) {
      const ctor = mxClient[node.nodeName as keyof typeof mxgraph] || (window as any)[node.nodeName];
      if (!ctor) {
        throw new Error(`Missing constructor for ${node.nodeName}`);
      }
      const dec = mxClient.mxCodecRegistry.getCodec(ctor);
      if (dec !== null) {
        return dec.decode(this, node, into);
      }
      const obj = node.cloneNode(true) as Element;
      obj.removeAttribute('as');
      return obj;
    }
    return null;
  };
  return mxClient;
};
