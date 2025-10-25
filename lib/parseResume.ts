import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth'

export async function parseResume(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch resume from ${url}: ${response.statusText}`);
      return '';
    }
    const buffer = Buffer.from(await response.arrayBuffer())
    const contentType = response.headers.get('content-type') ?? ''
    const pathname = new URL(url).pathname.toLowerCase()
    const isPdf = pathname.endsWith('.pdf') || contentType.includes('pdf');
    const isDocx =
      pathname.endsWith('.docx') ||
      contentType.includes('wordprocessingml.document') ||
      contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document');

    if (isPdf) {
      const data = await new PDFParse({ data: buffer })
      const result = await data.getText();
      console.log('Parsed PDF text:', result.text);
      return result.text

    } else if (isDocx) {
      const { value } = await mammoth.extractRawText({ buffer });
      console.log('Parsed DOCX text:', value);
      return value

    } else {
      console.warn('Unsupported resume file type:', url);
      return ''
    }
  } catch (error) {
    console.error('Error parsing resume:', error);
    return ''
  }
}