import {PromptBaseInterface, SimplePrompt} from "./part/simple";
import {parseString} from "./parser";
import {UnparsedPrompt} from "./part/unparsed";
import {MultiPrompt} from "./part/multi";
import {RandomPrompt} from "./part/random";
import {ReplacedPrompt} from "./part/replaced";
import {DecorationWithRange} from "../highlight";


const __s: Record<string, number> = {'[': 3, '{': 2, '(': 1};
const __e: Record<string, number> = {']': 3, '}': 2, ')': 1};

export function haveQuote(prompt: string) {
  return prompt.length >= 2 && (__s[prompt[0]] || 9) - (__e[prompt[prompt.length - 1]] || 6) === 0;
}


export function checkPs(prompt: string, p: string, s: string) {
  return prompt[0] === p && prompt[prompt.length - 1] === s;
}

export class Prompt implements PromptBaseInterface {
  prompts: PromptBaseInterface[];
  seed: number;
  startPos: number;
  endPos: number;
  layer: number;
  line: number;
  beforeEmpty: number;
  afterEmpty: number;

  constructor(ps: PromptBaseInterface[]) {
    this.prompts = ps;
    this.seed = 0;
    this.startPos = this.endPos = this.layer = this.line = 0;
    this.beforeEmpty = this.afterEmpty = 0;
  }

  calculate(startPos: number, layer: number) {
    this.startPos = startPos + this.beforeEmpty;
    this.layer = layer;
    let nextStart = this.startPos;
    for (let i = 0; i < this.prompts.length; i++) {
      const prompt = this.prompts[i];
      let len = prompt.calculate(nextStart, layer);
      nextStart += len + 1; // ','
    }
    this.endPos = nextStart - (this.prompts.length > 0 ? 1 : 0);
    return (this.endPos - this.startPos) + (this.beforeEmpty + this.afterEmpty);
  }

  setLine(line: number) {
    this.line = line;
    this.prompts.forEach(p => p.setLine(line));
  }

  gatherDecos(decos: DecorationWithRange[]) {
    this.prompts.forEach(p => p.gatherDecos(decos));
  }

  static fromString(fr: string, skipEmpty: boolean = false, loop: boolean = false): Prompt {
    let r: PromptBaseInterface[] = [];
    let beforeEmpty = 0;
    let afterEmpty = 0;
    // trimEmpty
    while (fr.length) {
      if (fr[0] === ' ') {
        beforeEmpty++;
        fr = fr.substring(1);
        continue;
      }
      if (fr[fr.length - 1] === ' ') {
        afterEmpty++;
        fr = fr.substring(0, fr.length - 1);
        continue;
      }
      break;
    }

    for (const prompt_ of parseString(fr)) {
      let prompt = prompt_.trim();
      if (prompt === "" && skipEmpty) {
        continue;
      }
      if (prompt.length >= 2 && checkPs(prompt, "$", "$")) {
        r.push(RandomPrompt.fromString(prompt_));
      } else if (prompt.length >= 2 && checkPs(prompt, "&", "&")) {
        r.push(ReplacedPrompt.fromString(prompt_));
      } else if (haveQuote(prompt) || prompt.includes(',')) {
        if (loop && prompt_ === fr) {
          r.push(UnparsedPrompt.fromString(prompt_));
        } else {
          r.push(MultiPrompt.fromString(prompt_));
        }
      } else {
        r.push(SimplePrompt.fromString(prompt_));
      }
    }
    const result = new Prompt(r);
    result.beforeEmpty = beforeEmpty;
    result.afterEmpty = afterEmpty;
    return result;
  }
}