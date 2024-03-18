import mammoth from "mammoth";

import { extractAttendees, summarise } from "./preprocess.mjs";

// parses Teams Transcripts in docx format, into a text format
// with a line for each speaker, colon separated, with their dialogue
export async function parser(docxFilePath) {
  try {
    const { value } = await mammoth.extractRawText({ path: docxFilePath });

    const lines = value.split("\n").map((line) => line.trim());
    let transcript = "";
    lines.forEach((line, index) => {
      if (index % 5 === 0) {
        // Timestamp line, skip
        return;
      } else if (index % 5 === 1) {
        // Speaker line
        transcript += line + ": ";
      } else if (index % 5 === 2) {
        // Dialogue line
        transcript += line;
      } else if (index % 5 === 3) {
        // Blank line, output formatted result
        transcript += "\n";
      }
    });

    // determine the date of the meeting from the filename in format AI Readiness Chat_2024-03-04.docx
    const dateMatch = docxFilePath.match(/(\d{4}-\d{2}-\d{2})/);

    // determine the title of the meeting from the filename
    const titleMatch = docxFilePath.match(/([^/]+)(?=_\d{4}-\d{2}-\d{2})/);

    const summary = await summarise(transcript);

    return {
      transcript,
      summary,
      date: dateMatch ? dateMatch[1] : null,
      title: titleMatch ? titleMatch[1] : null,
      attendees: extractAttendees(transcript),
    };
  } catch (error) {
    console.error(`Error parsing ${docxFilePath}: ${error.message}`);
  }
}
