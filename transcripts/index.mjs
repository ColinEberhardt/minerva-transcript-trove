import path from "path";
import fs from "fs";
import { stringify, parse } from "yaml";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let transcripts = [];

export async function init() {
  // load all the transcripts into memory
  const files = fs.readdirSync(__dirname).filter((f) => f.endsWith(".md"));

  files.forEach((file) => {
    const filePath = path.join(__dirname, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const [frontMatterString, body] = fileContent.split("---\n").slice(1);
    const frontMatter = parse(frontMatterString);
    transcripts.push({ ...frontMatter, transcript: body });
  });
}

export function getMeetingsWithAttendee(attendee) {
  const meetings = transcripts.filter((t) => t.attendees.includes(attendee));
  meetings.sort((a, b) => new Date(b.date) - new Date(a.date));
  return meetings;
}

export function getAllAttendees() {
  const allAttendees = transcripts.reduce((acc, t) => {
    acc.push(...t.attendees);
    return acc;
  }, []);
  allAttendees.sort();
  return [...new Set(allAttendees)];
}

export async function save(transcript) {
  // move all the properties, other than the transcript, into the front matter
  const { transcript: body, ...frontMatter } = transcript;
  const markdown = `---\n${stringify(frontMatter)}---\n${body}`;

  // write the markdown file
  const outputPath = path.join(
    "transcripts",
    `${frontMatter.title}_${frontMatter.date}.md`
  );
  console.log(`writing ${outputPath}`);
  fs.writeFileSync(outputPath, markdown);
}
