import mammoth from "mammoth";
// Import order matters here: pdf-parse/worker must be imported BEFORE
// pdf-parse itself. This sets up the canvas factory and polyfills the
// DOMMatrix/ImageData/Path2D globals that pdfjs-dist (used internally by
// pdf-parse) expects. Without this exact order, it works locally by
// coincidence but breaks on Vercel, since the bundler only includes files
// it sees statically imported — this import is what makes that happen.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { CanvasFactory } = require("pdf-parse/worker");
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
    const parser = new PDFParse({ data: buffer, CanvasFactory });
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