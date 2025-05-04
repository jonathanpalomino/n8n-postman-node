import { INode } from "n8n-workflow";

export interface INodeExt extends INode {
    hijos?: INode[];
  }
  