import mammoth from "mammoth";
// pdf-parse v2 exports a PDFParse class, not a plain function (v1 API).
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PDFParse } = require("pdf-parse");

/**
 * Extracts plain text from an uploaded PDF or DOCX File.
 * Throws if the file type isn't supported or extraction fails.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }

  if (fileName.endsWith(".pdf")) {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result.text.trim();
    } finally {
      await parser.destroy();
    }
  }

  throw new Error(
    `Unsupported file type: ${file.name}. Only PDF and DOCX are supported.`
  );
}