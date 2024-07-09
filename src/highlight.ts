import * as vscode from 'vscode';
import {Prompt} from "./prompts/prompt";
import {MultiDecos} from "./utils/multi-map";

export let multiMapInfo = new MultiDecos();
export let lintInFile = true;
export let lintColor: string = '';
const colorMap: string[] = [
  "#ffc93c",
  "#c264fe",
  "#eaffd0",
  "#ff9a00",
  "#f38181",
  "#fce38a",
  "#fcbad3",
  // "#aa96da",
  // "#ffffd2",
  // "#a8d8ea",
  // "#f73859",
];

export const getColorByLayer = (layer: number): string => {
  return colorMap[layer % colorMap.length];
};

export const getRoundLayer = (layer: number, withArtist: boolean = false, withError: boolean = false, withWaveWarn: boolean = false): DecorationRegistry => {
  switch (layer % colorMap.length) {
    case 0:
      if (withArtist) {
        return DecorationRegistry.Layer0WithArtist;
      }
      if (withError) {
        return DecorationRegistry.Layer0WithError;
      }
      if (withWaveWarn) {
        return DecorationRegistry.Layer0WithWaveWarn;
      }
      return DecorationRegistry.Layer0;
    case 1:
      if (withArtist) {
        return DecorationRegistry.Layer1WithArtist;
      }
      if (withError) {
        return DecorationRegistry.Layer1WithError;
      }
      if (withWaveWarn) {
        return DecorationRegistry.Layer1WithWaveWarn;
      }
      return DecorationRegistry.Layer1;
    case 2:
      if (withArtist) {
        return DecorationRegistry.Layer2WithArtist;
      }
      if (withError) {
        return DecorationRegistry.Layer2WithError;
      }
      if (withWaveWarn) {
        return DecorationRegistry.Layer2WithWaveWarn;
      }
      return DecorationRegistry.Layer2;
    case 3:
      if (withArtist) {
        return DecorationRegistry.Layer3WithArtist;
      }
      if (withError) {
        return DecorationRegistry.Layer3WithError;
      }
      if (withWaveWarn) {
        return DecorationRegistry.Layer3WithWaveWarn;
      }
      return DecorationRegistry.Layer3;
    case 4:
      if (withArtist) {
        return DecorationRegistry.Layer4WithArtist;
      }
      if (withError) {
        return DecorationRegistry.Layer4WithError;
      }
      if (withWaveWarn) {
        return DecorationRegistry.Layer4WithWaveWarn;
      }
      return DecorationRegistry.Layer4;
    case 5:
      if (withArtist) {
        return DecorationRegistry.Layer5WithArtist;
      }
      if (withError) {
        return DecorationRegistry.Layer5WithError;
      }
      if (withWaveWarn) {
        return DecorationRegistry.Layer5WithWaveWarn;
      }
      return DecorationRegistry.Layer5;
    case 6:
      if (withArtist) {
        return DecorationRegistry.Layer6WithArtist;
      }
      if (withError) {
        return DecorationRegistry.Layer6WithError;
      }
      if (withWaveWarn) {
        return DecorationRegistry.Layer6WithWaveWarn;
      }
      return DecorationRegistry.Layer6;
  }
  return DecorationRegistry.Layer6;
};

export const withWaveUnderline = (color: string = "#f73859", style: "solid" | "double" | "dotted" | "dashed" | "wavy" = "wavy"): string => {
  return `;text-decoration-line: underline;text-decoration-style: ${style};text-decoration-color: ${color};`;
};

export const highlightColorByLayer = (layer: number, extraOptions?: vscode.DecorationRenderOptions, colorExt: string = ""): vscode.TextEditorDecorationType => {
  return vscode.window.createTextEditorDecorationType({
    color: getColorByLayer(layer) + colorExt,
    ...extraOptions
  });
};


export const setLintInFile = (lint: boolean) => {
  lintInFile = lint;
};
export const setLintColor = (color: string) => {
  lintColor = color;
};

export class DecorationWithRange {
  range: vscode.Range[];
  decoration: vscode.TextEditorDecorationType;

  constructor(public decorations: vscode.TextEditorDecorationType, public ranges: vscode.Range[]) {
    this.range = ranges;
    this.decoration = decorations;
  }
}

export enum DecorationRegistry {
  Layer0 = "layer0",
  Layer1 = "layer1",
  Layer2 = "layer2",
  Layer3 = "layer3",
  Layer4 = "layer4",
  Layer5 = "layer5",
  Layer6 = "layer6",
  Layer0WithError = "layer0WithError",
  Layer1WithError = "layer1WithError",
  Layer2WithError = "layer2WithError",
  Layer3WithError = "layer3WithError",
  Layer4WithError = "layer4WithError",
  Layer5WithError = "layer5WithError",
  Layer6WithError = "layer6WithError",
  Layer0WithArtist = "layer0WithArtist",
  Layer1WithArtist = "layer1WithArtist",
  Layer2WithArtist = "layer2WithArtist",
  Layer3WithArtist = "layer3WithArtist",
  Layer4WithArtist = "layer4WithArtist",
  Layer5WithArtist = "layer5WithArtist",
  Layer6WithArtist = "layer6WithArtist",
  Layer0WithWaveWarn = "layer0WithWaveWarn",
  Layer1WithWaveWarn = "layer1WithWaveWarn",
  Layer2WithWaveWarn = "layer2WithWaveWarn",
  Layer3WithWaveWarn = "layer3WithWaveWarn",
  Layer4WithWaveWarn = "layer4WithWaveWarn",
  Layer5WithWaveWarn = "layer5WithWaveWarn",
  Layer6WithWaveWarn = "layer6WithWaveWarn",
  ImportDeco = "importDeco",
  ReplacedDeco = "replacedDeco",
}

const createMapFn: Record<DecorationRegistry, () => vscode.TextEditorDecorationType> = {
  [DecorationRegistry.Layer0]: () => {
    return highlightColorByLayer(0);
  },
  [DecorationRegistry.Layer1]: () => {
    return highlightColorByLayer(1);
  },
  [DecorationRegistry.Layer2]: () => {
    return highlightColorByLayer(2);
  },
  [DecorationRegistry.Layer3]: () => {
    return highlightColorByLayer(3);
  },
  [DecorationRegistry.Layer4]: () => {
    return highlightColorByLayer(4);
  },
  [DecorationRegistry.Layer5]: () => {
    return highlightColorByLayer(5);
  },
  [DecorationRegistry.Layer6]: () => {
    return highlightColorByLayer(6);
  },
  [DecorationRegistry.Layer0WithError]: () => {
    return highlightColorByLayer(0, {}, withWaveUnderline("#f73859", "dotted"));
  },
  [DecorationRegistry.Layer1WithError]: () => {
    return highlightColorByLayer(1, {}, withWaveUnderline("#f73859", "dotted"));
  },
  [DecorationRegistry.Layer2WithError]: () => {
    return highlightColorByLayer(2, {}, withWaveUnderline("#f73859", "dotted"));
  },
  [DecorationRegistry.Layer3WithError]: () => {
    return highlightColorByLayer(3, {}, withWaveUnderline("#f73859", "dotted"));
  },
  [DecorationRegistry.Layer4WithError]: () => {
    return highlightColorByLayer(4, {}, withWaveUnderline("#f73859", "dotted"));
  },
  [DecorationRegistry.Layer5WithError]: () => {
    return highlightColorByLayer(5, {}, withWaveUnderline("#f73859", "dotted"));
  },
  [DecorationRegistry.Layer6WithError]: () => {
    return highlightColorByLayer(6, {}, withWaveUnderline("#f73859", "dotted"));
  },
  [DecorationRegistry.Layer0WithArtist]: () => {
    return highlightColorByLayer(0, {}, withWaveUnderline("rgb(94,150,217)", "dotted"));
  },
  [DecorationRegistry.Layer1WithArtist]: () => {
    return highlightColorByLayer(1, {}, withWaveUnderline("rgb(94,150,217)", "dotted"));
  },
  [DecorationRegistry.Layer2WithArtist]: () => {
    return highlightColorByLayer(2, {}, withWaveUnderline("rgb(94,150,217)", "dotted"));
  },
  [DecorationRegistry.Layer3WithArtist]: () => {
    return highlightColorByLayer(3, {}, withWaveUnderline("rgb(94,150,217)", "dotted"));
  },
  [DecorationRegistry.Layer4WithArtist]: () => {
    return highlightColorByLayer(4, {}, withWaveUnderline("rgb(94,150,217)", "dotted"));
  },
  [DecorationRegistry.Layer5WithArtist]: () => {
    return highlightColorByLayer(5, {}, withWaveUnderline("rgb(94,150,217)", "dotted"));
  },
  [DecorationRegistry.Layer6WithArtist]: () => {
    return highlightColorByLayer(6, {}, withWaveUnderline("rgb(94,150,217)", "dotted"));
  },
  [DecorationRegistry.Layer0WithWaveWarn]: () => {
    return highlightColorByLayer(0, {}, withWaveUnderline());
  },
  [DecorationRegistry.Layer1WithWaveWarn]: () => {
    return highlightColorByLayer(1, {}, withWaveUnderline());
  },
  [DecorationRegistry.Layer2WithWaveWarn]: () => {
    return highlightColorByLayer(2, {}, withWaveUnderline());
  },
  [DecorationRegistry.Layer3WithWaveWarn]: () => {
    return highlightColorByLayer(3, {}, withWaveUnderline());
  },
  [DecorationRegistry.Layer4WithWaveWarn]: () => {
    return highlightColorByLayer(4, {}, withWaveUnderline());
  },
  [DecorationRegistry.Layer5WithWaveWarn]: () => {
    return highlightColorByLayer(5, {}, withWaveUnderline());
  },
  [DecorationRegistry.Layer6WithWaveWarn]: () => {
    return highlightColorByLayer(6, {}, withWaveUnderline());
  },
  [DecorationRegistry.ImportDeco]: () => {
    return vscode.window.createTextEditorDecorationType({
      color: "#a6e043",
    });
  },
  [DecorationRegistry.ReplacedDeco]: () => {
    return vscode.window.createTextEditorDecorationType({
      color: "#00bbf0",
    });
  },
};

export class PromptDecorationLinter {
  info: Map<DecorationRegistry, DecorationWithRange>;
  raws: DecorationWithRange[];

  constructor() {
    this.info = new Map();
    this.raws = [];
  }

  tryMakeMap(k: DecorationRegistry) {
    if (this.info.has(k)) {
      return;
    }
    this.info.set(k, new DecorationWithRange(createMapFn[k](), []));
  }

  assign(k: DecorationRegistry, ranges: vscode.Range[]) {
    this.tryMakeMap(k);
    this.info.get(k)?.range.push(...ranges);
  }

  assignRaw(dwr: DecorationWithRange) {
    this.raws.push(dwr);
  }
}

export const unloadByLine = (fileName: string, line: number): vscode.TextEditorDecorationType[] | undefined => {
  let lineDInfos = multiMapInfo.get(fileName)?.get(line);
  if (!lineDInfos) {
    return undefined;
  }
  let result = lineDInfos.deco;
  multiMapInfo.get(fileName)!.delete(line);
  // wtf???
  //@ts-ignore
  return result;
};

const isExtFit = () => {
  let editor = vscode.window.activeTextEditor;
  if (!editor) {
    return false;
  }
  let document = editor.document;
  return document.fileName.endsWith('.prompts');
};

export const assignDecorations = (fileName: string, line: number, decorations: PromptDecorationLinter, editor?: vscode.TextEditor) => {
  editor = editor == undefined ? vscode.window.activeTextEditor! : editor;
  let map = multiMapInfo.tryAssign(fileName);
  if (!map.has(line)) {
    map.set(line, {
      deco: [],
      tagName: "",
      tagInfos: undefined,
    });
  }
  for (let i = 0; i < decorations.raws.length; i++) {
    let decoration = decorations.raws[i].decoration;
    let ranges = decorations.raws[i].range;
    editor.setDecorations(decoration, ranges);
    map.get(line)!.deco.push(decoration);
  }
  decorations.info.forEach((v, k) => {
    let decoration = v.decoration;
    let ranges = v.range;
    //@ts-ignore
    editor.setDecorations(decoration, ranges);
    map.get(line)!.deco.push(decoration);
  });

};

export const assignPrompts = (fileName: string, line: number, prompt: Prompt, name: string) => {
  let map = multiMapInfo.tryAssign(fileName);
  if (!map.has(line)) {
    map.set(line, {
      deco: [],
      tagName: name,
      tagInfos: prompt
    });
  } else {
    map.get(line)!.tagInfos = prompt;
    map.get(line)!.tagName = name;
  }
};


export const getPromptsByLine = (fileName: string, line: number): Prompt | undefined => {
  return multiMapInfo.get(fileName)?.get(line)?.tagInfos;
};


const highlightByLine = (line: number, ignoreCheck: boolean = false, editor?: vscode.TextEditor, fromPrompt?: Prompt) => {
  editor = editor == undefined ? vscode.window.activeTextEditor! : editor;
  let document = editor.document;
  if (!ignoreCheck && document.validateRange(new vscode.Range(line, 0, line, 1)).end.character !== 1) {
    return;
  }
  let text = document.lineAt(line).text;
  if (!text.trim()) {
    return;
  }
  if (text.trim().startsWith("#")) {
    let decoration = vscode.window.createTextEditorDecorationType({
      color: 'rgb(103,103,103)'
    });
    let ranges: vscode.Range[] = [];
    ranges.push(new vscode.Range(
      new vscode.Position(line, 0),
      new vscode.Position(line, text.length)
    ));
    let result = new PromptDecorationLinter();
    result.assignRaw(new DecorationWithRange(decoration, ranges));
    assignDecorations(document.fileName, line, result, editor);
    return;
  }

  // let result: DecorationWithRange[] = [];
  let result = new PromptDecorationLinter();

  let lineParts = text.split("|");
  let tags = text;

  // result.push(new DecorationWithRange(
  //   vscode.window.createTextEditorDecorationType({
  //     before: {
  //       width: '1000px',
  //       height: "3px",
  //       backgroundColor: lintColor,
  //     }
  //   }),
  //   [new vscode.Range(
  //     new vscode.Position(line, 0),
  //     new vscode.Position(line, 1)
  //   )]
  // ));

  result.assignRaw(new DecorationWithRange(
    vscode.window.createTextEditorDecorationType({
      color: "#de95ba",
      fontWeight: "bold",
    }),
    [new vscode.Range(
      new vscode.Position(line, 0),
      new vscode.Position(line, lineParts[0].length)
    )]
  ));

  if (lineParts.length < 2) {
    assignDecorations(document.fileName, line, result, editor);
    return;
  }

  let nameEndPos = lineParts[0].length + 1;
  let name = lineParts[0].trim();
  tags = lineParts.slice(1).join("|");

  let tagParts = fromPrompt || Prompt.fromString(tags);
  tagParts.setLine(line);
  tagParts.calculate(nameEndPos, 0);
  tagParts.gatherDecos(result);
  // console.log("calculate_prompt", tagParts);

  assignPrompts(document.fileName, line, tagParts, name);
  let curInfo = multiMapInfo.get(document.fileName)!;

  // 检查 name是否在之前的line出现过？

  let exist = false;
  for (let i = 0; i < line; i++) {
    if (curInfo.has(i)) {
      if (curInfo.get(i)?.tagName === name) {
        exist = true;
        break;
      }
    }
  }
  if (exist) {
    result.raws = result.raws.slice(1);
    result.assignRaw(new DecorationWithRange(
      vscode.window.createTextEditorDecorationType({
        color: "#de95ba" + (';' + withWaveUnderline("#f73859", "dotted")),
        fontWeight: "bold",
      }),
      [new vscode.Range(
        new vscode.Position(line, 0),
        new vscode.Position(line, name.length)
      )]
    ));
  }

  assignDecorations(document.fileName, line, result, editor);

};

export const highlightFullProvider = () => {
  vscode.window.visibleTextEditors.forEach(editor => {
    let document = editor.document;
    console.log("highlightFullProvider", document.fileName);
    if (!(document.fileName.endsWith('.prompts'))) {
      return;
    }
    multiMapInfo.fullUnload(document.fileName);
    for (let i = 0; i < document.lineCount; i++) {
      highlightByLine(i, false, editor);
    }
  })
};

export const highlightActiveProvider = () => {
  if (!isExtFit()) {
    return;
  }
  let editor = vscode.window.activeTextEditor!;
  let document = editor.document;
  console.log("highlightActiveProvider", document.fileName);
  multiMapInfo.fullReload(document.fileName);
  let map = multiMapInfo.get(document.fileName);
  for (let i = 0; i < document.lineCount; i++) {
    highlightByLine(i, false, editor, map?.get(i)?.tagInfos);
  }
};

const getAffectLines = (s: Record<number, boolean>, changeRange: vscode.Range, text: string): Record<number, boolean> => {
  let lineCount = text.split('\n').length - 1;
  let removedCount = changeRange.end.line - changeRange.start.line;
  if (removedCount > 0) {
    let patched: Record<number, boolean> = {};
    for (let k in s) {
      let n = parseInt(k);
      n = n > changeRange.start.line ? n - 1 : n;
      patched[n] = s[k];
    }
    s = patched;
  }
  if (lineCount > 0) {
    let patched: Record<number, boolean> = {};
    for (let k in s) {
      let n = parseInt(k);
      n = n < changeRange.start.line ? n : n + lineCount;
      patched[n] = s[k];
    }
    s = patched;
  }
  for (let i = changeRange.start.line; i <= changeRange.end.line + lineCount + 1; i++) {
    s[i] = s[i] || i <= changeRange.start.line + lineCount;
  }
  return s;
};

export const highlightLineProvider = (e: vscode.TextDocumentChangeEvent) => {
  if (!isExtFit()) {
    return;
  }
  let editor = vscode.window.activeTextEditor!;
  let document = editor.document;

  let diffLineMap: Record<number, boolean> = {};
  e.contentChanges.forEach(change => {
    diffLineMap = getAffectLines(diffLineMap, change.range, change.text);
  });
  let diffLineSet: number[] = Object.keys(diffLineMap).map(i => parseInt(i)).sort((a, b) => b - a);
  let lineExist = false;
  for (let line = diffLineSet[0]; line >= diffLineSet[diffLineSet.length - 1]; line--) {
    let unloadLines = unloadByLine(document.fileName, line);
    if (diffLineMap[line] || lineExist) {
      lineExist = true;
    }
    highlightByLine(line, lineExist);
    unloadLines?.forEach(decoration => {
      decoration.dispose();
    });
  }
};