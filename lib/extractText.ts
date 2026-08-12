import mammoth from "mammoth";
// pdf-parse doesn't ship types cleanly for ESM — require works fine at runtime
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require("pdf-parse");

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
    const result = await pdfParse(buffer);
    return result.text.trim();
  }

  throw new Error(
    `Unsupported file type: ${file.name}. Only PDF and DOCX are supported.`
  );
}