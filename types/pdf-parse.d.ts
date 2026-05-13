declare module "pdf-parse" {
  function pdfParse(
    data: Buffer | ArrayBuffer,
    options?: Record<string, any>,
  ): Promise<{
    text: string;
    numpages: number;
    info: any;
    version: string;
  }>;

  export default pdfParse;
  export = pdfParse;
}
