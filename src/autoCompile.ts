import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {CompletionItem, CompletionItemKind, CompletionItemLabel, ProviderResult} from "vscode";


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
      cates = "用途划分：\n" + this.category.map(c => `- ${c}`).join('\n') + "  \n\n";
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
    // 按post_count降序排列
    tags.sort((a, b) => {
      return b.post_count - a.post_count;
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
      return vscode.CompletionItemKind.Method;
    case 1: // 1=artist
      return vscode.CompletionItemKind.Color;
    case 3: // 3=copyright
      return vscode.CompletionItemKind.Variable;
    case 4: // 4=character
      return vscode.CompletionItemKind.User;
    default:
      return vscode.CompletionItemKind.Interface;
  }
};

class CompletionItemWithTag extends CompletionItem {
  raw_kw: string;

  constructor(raw: string, label: string | CompletionItemLabel, kind?: CompletionItemKind) {
    super(label, kind);
    this.raw_kw = raw;
  }
}

function containsCharsInOrder(target: string, chars: string): boolean {
  let index = 0;
  for (let i = 0; i < chars.length; i++) {
    index = target.indexOf(chars[i], index);
    if (index === -1) {
      return false;
    }
    index++;
  }
  return true;
}


export const autoCompileProvider = vscode.languages.registerCompletionItemProvider('tags', {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): vscode.CompletionList<CompletionItemWithTag> {
    const wordRange = document.getWordRangeAtPosition(position);
    const word = document.getText(wordRange);
    let result: CompletionItemWithTag[] = [];
    // 用于测试的测试代码
    if (word === 'fetest') {
      // 遍历 vscode.CompletionItemKind
      for (let i = 0; i < 27; i++) {
        let itemKindElement = i as vscode.CompletionItemKind;
        //@ts-ignore
        const item = new CompletionItemWithTag("fetest", `fetest-vsc.cik.${i} |` + vscode.CompletionItemKind[i].toString(), itemKindElement | undefined);
        result.push(item);
      }
      return new vscode.CompletionList(result, true);
    }

    // 自动分类联想
    if (tagCategories[word]) {
      result.push(...tagCategories[word].map(tag => {
        const item = new CompletionItemWithTag(tag, tag, vscode.CompletionItemKind.TypeParameter);
        item.detail = `This is a ${word} tag`; // 设置右侧的文本
        item.filterText = word;
        return item;
      }));
    }

    // 检查tags是否为空
    if (!tags || tags.length === 0) {
      return new vscode.CompletionList(result, true);
    }
    let rr: CompletionItemWithTag[] = [];
    for (let i = 0; i < tags.length; i++) {
      // if (tags[i].cache_comp !== undefined) {
      //   rr.push(tags[i].cache_comp!);
      //   continue;
      // }
      if (!containsCharsInOrder(tags[i].name,word)) {
        continue;
      }

      //@ts-ignore
      const compItem = new CompletionItemWithTag(tags[i].name, {
        label: tags[i].name,
        detail: tags[i].name_zh ? " - " + tags[i].name_zh : "",
      }, getTypeVsCompiledType(tags[i].type_n));
      compItem.filterText = word;
      compItem.sortText = (99999999 - tags[i].post_count).toString().padStart(7, '0');
      compItem.insertText = tags[i].name + ", ";

      rr.push(compItem);
      // tags[i].cache_comp = compItem;

      // 只保留postcount前3000的
      if (rr.length > 3000) {
        break;
      }
    }
    // 检查tags （之后这个放在外面做缓存！）
    rr.push(...result);
    return new vscode.CompletionList(rr, true);
  },
  resolveCompletionItem(item: CompletionItemWithTag): ProviderResult<CompletionItemWithTag> {
    let index = tagIndexCache[item.raw_kw];
    if (index !== undefined) {
      // item.detail = tags[index].name_zh;
      item.documentation = tags[index].wiki_markdown;
    } else {
      item.detail = "未收录的Tag";
    }
    return item;
  }
});