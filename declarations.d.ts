declare module 'mammoth' {
  export interface MammothResult {
    value: string;
    messages: any[];
  }

  export interface MammothInput {
    arrayBuffer: ArrayBuffer;
  }

  export function convertToHtml(input: MammothInput): Promise<MammothResult>;
  export function extractRawText(input: MammothInput): Promise<MammothResult>;
}

declare module 'html2canvas';
declare module 'jspdf';
