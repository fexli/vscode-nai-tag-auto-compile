import {PromptBaseInterface, SimplePrompt} from "./simple";
import {parseString} from "../parser";
import {Prompt} from "../prompt";


export class ReplacedPrompt extends SimplePrompt implements PromptBaseInterface {
  from_holder: string;
  raw_content: string;
  count: number;

  constructor(from_holder: string, count: number, raw_content: string = "") {
    super("");
    this.from_holder = from_holder;
    this.count = count;
    this.raw_content = raw_content;
  }

  calculate(startPos: number, layer: number): number {
    this.layer = layer;
    this.startPos = startPos;
    this.endPos = this.raw_content.length + startPos;
    return this.endPos - this.startPos;
  }

  setLine(line: number) {
    this.line = line;
  }

  static fromString(fr: string): ReplacedPrompt {
    if (fr.length < 2) {
      throw new Error("parse ReplacedPrompt failed:len(prompt) must > 2, got " + fr.length + ": " + fr);
    }
    if (fr[0] !== '&' || fr[fr.length - 1] !== '&') {
      throw new Error("parse ReplacedPrompt failed:prompt must start with '&' and end with '&', got " + fr);
    }
    // xx.xx.xx,2
    // ^        ^
    // Tag      Count
    const params = fr.substring(1, fr.length - 1).split(',');
    let randCount = 1;
    if (params.length >= 2) {
      randCount = parseInt(params[1]) || 1;
    }
    return new ReplacedPrompt(params[0], randCount, fr);
  }
}