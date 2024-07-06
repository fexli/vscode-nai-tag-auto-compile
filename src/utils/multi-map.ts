import vscode from "vscode";
import {Prompt} from "../prompts/prompt";

export class MultiDeco {
  deco: vscode.TextEditorDecorationType[];
  tagInfos?: Prompt;
  tagName: string;

  constructor(deco: vscode.TextEditorDecorationType[], tagInfos?: Prompt, tagName: string = "") {
    this.deco = deco;
    this.tagInfos = tagInfos;
    this.tagName = tagName;
  }
}

export class MultiDecos {
  map: Map<string, Map<number, MultiDeco>>;

  constructor() {
    this.map = new Map();
  }

  fullUnload(key: string) {
    if (!(this.map.has(key))) {
      return;
    }
    const map = this.map.get(key)!;
    map.forEach((value, key) => {
      value.deco.forEach((deco) => {
        deco.dispose();
      });
    });
    map.clear();
  }

  unloadAll() {
    console.log("unload all");
    this.map.forEach((value, key) => {
      this.fullUnload(key);
    });
  }

  get(key: string): Map<number, MultiDeco> | undefined {
    return this.map.get(key);
  }

  tryAssign(key: string): Map<number, MultiDeco> {
    if (!(this.map.has(key))) {
      this.map.set(key, new Map());
    }
    return this.map.get(key)!;
  }
}