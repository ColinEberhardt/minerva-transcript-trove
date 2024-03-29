import fs from "fs";
import path from "path";

import "dotenv/config";
import clipboard from "clipboardy";
import { program } from "commander";
import inquirer from "inquirer";
import autocomplete from "inquirer-autocomplete-standalone";
import { globby } from "globby";

import {
  save,
  init,
  getAllAttendees,
  getMeetingsWithAttendee,
  getAllMeetings,
} from "./transcripts/index.mjs";
import { parser } from "./loader/teams-parser.mjs";
import { query } from "./query.mjs";

program
  .name("minerva")
  .description("A GPT-powered agent for analysing meeting transcripts");

program
  .command("teams-parser")
  .description(
    "Parse Teams transcripts in docx format, writing the parsed output to the transcripts folder."
  )
  .argument("<string>", "a glob pattern for the files to parse")
  .action(async (glob) => {
    const paths = await globby(glob);
    for (const filePath of paths) {
      console.log(`parsing file ${filePath}`);
      const parsed = await parser(filePath);
      save(parsed);
    }
  });

program
  .command("teams-watch")
  .description(
    "Watch a folder for newly added docx files, which will be parsed and written to the transcripts folder."
  )
  .argument("<string>", "the folder to watch for new docx files")
  .action((folder) => {
    fs.watch(folder, async (eventType, filename) => {
      if (eventType === "change" && path.extname(filename) === ".docx") {
        const filePath = path.join(folder, filename);
        if (fs.existsSync(filePath)) {
          console.log(`Transcript file ${filePath} identified`);
          const parsed = await parser(filePath);
          save(parsed);
          console.log(`Meeting summary copied to clipboard`);
          clipboard.writeSync(`
AI generated meeting summary:
${parsed.summary}
[ generated via https://github.com/ColinEberhardt/minerva-transcript-trove ]
`);
        }
      }
    });
  });

const matches = (a, b) => a.toLowerCase().includes(b ? b.toLowerCase() : "");

async function selectMeeting(meetings) {
  return await autocomplete({
    message: "Select a meeting",
    source: (input) =>
      meetings
        .filter((m) =>
          m.title.toLowerCase().includes(input ? input.toLowerCase() : "")
        )
        .map((m) => ({
          value: m,
          name: `${m.date} - ${m.title}`,
        })),
  });
}

program
  .command("interactive-query")
  .description("Perform an interactive query on meeting transcripts.")
  .action(async () => {
    await init();

    let meeting;
    const method = await inquirer.prompt({
      type: "list",
      name: "method",
      message: "Find meeting by ...",
      choices: ["Attendees", "Date"],
    });
    
    if (method.answer === "Attendees") {
      // select an attendee
      const allAttendees = getAllAttendees();
      const attendee = await autocomplete({
        message: "Select an attendee",
        source: (input) =>
          allAttendees
            .filter((a) => matches(a, input))
            .map((attendee) => ({
              value: attendee,
            })),
      });

      meeting = await selectMeeting(getMeetingsWithAttendee(attendee));
    } else {
      meeting = await selectMeeting(getAllMeetings());
    }

    while (true) {
      const question = await inquirer
        .prompt([
          {
            type: "input",
            name: "question",
            message: "What would you like to ask?",
          },
        ])
        .then((answers) => answers.question);
      const answer = await query(meeting.transcript, question);
      console.log(answer);
    }
  });

program.parse();
