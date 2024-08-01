import vscode from "vscode";
import {Prompt} from "../prompts/prompt";
import * as path from "path";

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

  findAllKeys(rootPath: string): string[] {
    return Array.from(this.map.keys()).flatMap((value, key) => {
      // value是prompt文件夹的绝对路径，rootPath是根目录的绝对路径
      // 计算相对路径
      let relativeRootPath = path.relative(rootPath, value);
      console.log("findAllKeys", rootPath, value, relativeRootPath);
      return (relativeRootPath || "").replaceAll(".prompts", "");
    });
  }

  findFile(key: string): string[][] {
    let result: string[][] = [];
    this.map.forEach((value, keyIn) => {
      console.log("findFile", key, keyIn);
      if (!(keyIn.startsWith(key))) {
        return;
      }
      let remainCtx = keyIn.slice(key.length,-8);
      if (remainCtx && remainCtx.startsWith("/")){
        remainCtx = remainCtx.slice(1) + "/";
      }

      value.forEach((value, key) => {
        if (!(value.tagName)){
          return;
        }
        console.log("pushValue", remainCtx, value.tagName);
        result.push([
          remainCtx,
          value.tagName
        ]);
      });
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