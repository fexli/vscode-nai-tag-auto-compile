import * as vscode from 'vscode';
import {Prompt} from "./prompts/prompt";
import {MultiDecos} from "./utils/multi-map";

export let multiMapInfo = new MultiDecos();
export let lintInFile = true;
export let lintColor: string = '';
const colorMap: string[] = [
  "#ffc93c",
  "#c264fe",
  "#95e1d3",
  "#eaffd0",
  "#fce38a",
  "#f38181",
  "#fcbad3",
  "#aa96da",
  "#ffffd2",
  "#a8d8ea",
  "#ff9a00",
  "#f73859",
];

export const getColorByLayer = (layer: number): string => {
  return colorMap[layer % colorMap.length];
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

export const assignDecorations = (fileName: string, line: number, decorations: DecorationWithRange[], editor?: vscode.TextEditor) => {
  editor = editor == undefined ? vscode.window.activeTextEditor! : editor;
  let map = multiMapInfo.tryAssign(fileName);
  if (!map.has(line)) {
    map.set(line, {
      deco: [],
      tagName: "",
      tagInfos: undefined,
    });
  }
  for (let i = 0; i < decorations.length; i++) {
    let decoration = decorations[i].decoration;
    let ranges = decorations[i].range;
    editor.setDecorations(decoration, ranges);
    map.get(line)!.deco.push(decoration);
  }
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


const highlightByLine = (line: number, ignoreCheck: boolean = false, editor?: vscode.TextEditor) => {
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
    let decorations = new DecorationWithRange(decoration, ranges);
    assignDecorations(document.fileName, line, [decorations], editor);
    return;
  }

  let result: DecorationWithRange[] = [];

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

  result.push(new DecorationWithRange(
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

  let tagParts = Prompt.fromString(tags);
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
    result = result.slice(1);
    result.push(new DecorationWithRange(
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
    console.log("highlightFullProvider", document.fileName)
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
  multiMapInfo.fullUnload(document.fileName);
  for (let i = 0; i < document.lineCount; i++) {
    highlightByLine(i);
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