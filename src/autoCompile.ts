import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {CancellationToken, CompletionItem, ProviderResult} from "vscode";


// TODO: 自动标签联想
let tagCategories: Record<string, string[]> = {
  'clothes': ['dress', 'shirt', 'pants'],
  // 添加更多的分类和标签...
};

class TagData implements Record<string, any> {
  n: string;
  z: string;
  w: string;
  o: string;
  wm: vscode.MarkdownString | undefined;
  c: string[];
  r: number;

  // ccmp: vscode.CompletionItem | undefined;

  constructor(v: Record<string, any>) {
    this.n = v.n;
    this.z = v.z || '';
    this.w = v.w || '';
    this.o = v.o || '';
    this.c = v.c;
    this.r = v.r;
    let cates = "";
    if (this.category) {
      cates = "用途划分：\n" + this.category.map(c => `- ${c}`).join('\n') + "  \n";
    }
    this.wm = new vscode.MarkdownString(
      this.o +
      "使用量：`" + this.post_count.toString() + "次`  \n" +
      "分类：`" + this.type_s + "`  \n" + cates + (v.w || "") + "\n\n_@Danbooru AutoTagCompiler_"
    );
    // this.ccmp = undefined;
  }

  get name() {
    return this.n;
  }

  get name_zh() {
    return this.z;
  }

  get wiki_markdown(): vscode.MarkdownString | undefined {
    return this.wm;
  }

  get category() {
    return this.c;
  }

  get post_count(): number {
    // 返回 this.r/16 的整数值
    return Math.floor(this.r / 16);
  }

  get is_deleted(): boolean {
    // 返回 r%16>=8
    return this.r % 16 >= 8;
  }

  get type_n(): number {
    // 返回 category=r%16%8
    // 0=general 1=artist 3=copyright 4=character
    return this.r % 16 % 8;
  }

  get type_s(): string {
    // 返回 category=r%16%8
    // 0=general 1=artist 3=copyright 4=character
    return {
      0: 'general',
      1: 'artist',
      3: 'copyright',
      4: 'character'
    }[this.r % 16 % 8] || 'unknown';
  }

  // set cache_comp(value: vscode.CompletionItem) {
  //   this.ccmp = value;
  // }
  //
  // get cache_comp(): vscode.CompletionItem | undefined {
  //   return this.ccmp;
  // }
}

let tags: TagData[] = [];
let tagIndexCache: Record<string, number> = {};

export const getTags = (): TagData[] => {
  return tags;
};

export const getTagIndexCache = (): Record<string, number> => {
  return tagIndexCache;
};

export const loadTags = () => {
  // TODO: 缓存读取
  const config = vscode.workspace.getConfiguration('tags');
  const tagsFile = config.get<string>('tagsFile');
  if (tagsFile) {
    tags = JSON.parse(fs.readFileSync(path.resolve(vscode.workspace.rootPath || '', tagsFile)).toString()).map((tag: Record<string, any>) => {
      return new TagData(tag);
    });
    tags.forEach((tag, index) => {
      tagIndexCache[tag.name] = index;
    });
  }
};

export const unloadTags = () => {
  tags = [];
  tagCategories = {};
};

const getTypeVsCompiledType = (type: number): vscode.CompletionItemKind => {
  switch (type) {
    case 0: // 0=general
      return vscode.CompletionItemKind.Value;
    case 1: // 1=artist
      return vscode.CompletionItemKind.Class;
    case 3: // 3=copyright
      return vscode.CompletionItemKind.Module;
    case 4: // 4=character
      return vscode.CompletionItemKind.Interface;
    default:
      return vscode.CompletionItemKind.Keyword;
  }
};

export const autoCompileProvider = vscode.languages.registerCompletionItemProvider('tags', {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
    const wordRange = document.getWordRangeAtPosition(position);
    const word = document.getText(wordRange);
    let result: vscode.CompletionItem[] = [];

    // 自动分类联想
    if (tagCategories[word]) {
      result.push(...tagCategories[word].map(tag => {
        const item = new vscode.CompletionItem(tag, vscode.CompletionItemKind.Operator);
        item.detail = `This is a ${word} tag`; // 设置右侧的文本
        item.filterText = word;
        return item;
      }));
    }

    // 检查tags是否为空
    if (!tags || tags.length === 0) {
      return result;
    }
    let rr: vscode.CompletionItem[] = [];
    for (let i = 0; i < tags.length; i++) {
      // if (tags[i].cache_comp !== undefined) {
      //   rr.push(tags[i].cache_comp!);
      //   continue;
      // }

      //@ts-ignore
      const compItem = new vscode.CompletionItem(tags[i].name, getTypeVsCompiledType(tags[i].type_n));
      compItem.sortText = tags[i].post_count.toString().padStart(7, '0') + word;
      compItem.insertText = tags[i].name + ", ";
      rr.push(compItem);
      // tags[i].cache_comp = compItem;
    }
    // 检查tags （之后这个放在外面做缓存！）
    rr.push(...result);
    return rr;
  },
  resolveCompletionItem(item: CompletionItem): ProviderResult<CompletionItem> {
    let index = tagIndexCache[item.label.toString()];
    if (index !== undefined) {
      item.detail = tags[index].name_zh;
      item.documentation = tags[index].wiki_markdown;
    } else {
      item.detail = "未收录的Tag";
    }
    return item;
  }
});