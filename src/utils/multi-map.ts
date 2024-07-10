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

  findAllKeys(): string[] {
    return Array.from(this.map.keys()).flatMap((value, key) => {
      return (value.split("/").pop() || "").replaceAll(".prompts", "");
    });
  }

  findFile(key: string): string[] {
    let findKey = "";
    this.map.forEach((value, keyIn) => {
      if (findKey === "" && keyIn.includes(key)) {
        findKey = keyIn;
        return;
      }
    });
    if (findKey === "") {
      return [];
    }
    let result: string[] = [];
    this.map.get(findKey)?.forEach((value, key) => {
      result.push(value.tagName);
    });
    return result;
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

  fullReload(key: string) {
    if (!(this.map.has(key))) {
      return;
    }
    const map = this.map.get(key)!;
    map.forEach((value, key) => {
      value.deco.forEach((deco) => {
        deco.dispose();
      });
      value.deco = [];
    });
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