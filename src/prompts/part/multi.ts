import {PromptBaseInterface, SimplePrompt} from "./simple";
import {checkPs, Prompt} from "../prompt";
import {UnparsedPrompt} from "./unparsed";
import {DecorationWithRange, highlightColorByLayer} from "../../highlight";
import * as vscode from "vscode";

export class MultiPrompt extends SimplePrompt implements PromptBaseInterface {
  prompts: PromptBaseInterface[];
  weightL: string;
  weightR: string;

  constructor(
    weightL: string,
    weightR: string,
    ...prompts: PromptBaseInterface[]
  ) {
    super("");
    this.prompts = [];
    this.weightL = weightL;
    this.weightR = weightR;
    for (const p of prompts) {
      this.prompts.push(p);
    }
  }

  setLine(line: number) {
    this.line = line;
    this.prompts.forEach(p => p.setLine(line));
  }

  calculate(startPos: number, layer: number) {
    let nextLayer = this.prompts.length === 1 && this.weightL === "" ? layer : layer + 1;
    this.startPos = startPos;
    this.layer = layer;
    let nextStart = startPos + this.weightL.length;
    for (let i = 0; i < this.prompts.length; i++) {
      const prompt = this.prompts[i];
      let len = prompt.calculate(nextStart, nextLayer);
      nextStart += len + 1; // ','
    }
    this.endPos = nextStart + this.weightR.length - (this.prompts.length > 0 ? 1 : 0);
    return this.endPos - this.startPos;
  }

  gatherDecos(decos: DecorationWithRange[]) {
    let weightCnt = this.weightL.length;
    if (weightCnt > 0) {
      decos.push(new DecorationWithRange(
        highlightColorByLayer(this.layer),
        [new vscode.Range(
          new vscode.Position(this.line, this.startPos),
          new vscode.Position(this.line, this.startPos + weightCnt)
        ), new vscode.Range(
          new vscode.Position(this.line, this.endPos - weightCnt),
          new vscode.Position(this.line, this.endPos)
        )]
      ));
    }
    this.prompts.forEach(p => p.gatherDecos(decos));
  }

  static fromString(fr: string): MultiPrompt | UnparsedPrompt {
    let weightL = "";
    let weightR = "";
    let old_param = fr;
    while (true) {
      if (checkPs(old_param, "{", "}")) {
        old_param = old_param.substring(1, old_param.length - 1);
        weightL = weightL + "{";
        weightR = "}" + weightR;
      } else if (checkPs(old_param, "(", ")")) {
        old_param = old_param.substring(1, old_param.length - 1);
        weightL = weightL + "(";
        weightR = ")" + weightR;
      } else if (checkPs(old_param, "[", "]")) {
        old_param = old_param.substring(1, old_param.length - 1);
        weightL = weightL + "[";
        weightR = "]" + weightR;
      } else {
        break;
      }
    }
    let data = new MultiPrompt(weightL, weightR);
    let loop = old_param === fr;
    data.prompts = (Prompt.fromString(old_param, false, loop) as Prompt).prompts;
    // 如果仅存在Unparsed，直接返回Unparsed原始Prompt
    if (data.prompts.length === 1 && data.prompts[0] instanceof UnparsedPrompt) {
      return data.prompts[0] as UnparsedPrompt;
    }
    return data;
  }
}