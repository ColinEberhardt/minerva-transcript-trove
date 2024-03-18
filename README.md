# Minerva - the Transcript Trove

A GPT-powered command line tool for analysing meeting transcripts, generating meeting summaries, action lists and querying. The goal of this project is to create a valuable knowledge-base from meeting minutes, helping you become more organised and efficient.

## Installation and usage

Start with the usual, git clone and install dependencies:

~~~
% npm install
~~~

You'll need an OpenAI API key with access to `gpt-3.5-turbo`, supply this via a `.env` file:

~~~
OPENAI_API_KEY = "your-key-here"
~~~

Minerva is executed via a command line interface: 

~~~
% node index.mjs
Usage: minerva [options] [command]

An agent for analysing meeting transcripts using GenAI

Options:
  -h, --help             display help for command

Commands:
  teams-parser <string>  Parse Teams transcripts in docx format, writing the parsed output to the transcripts folder.
  teams-watch <string>   Watch a folder for newly added docx files, which will be parsed and written to the transcripts folder.
  interactive-query      Perform an interactive query on meeting transcripts.
  help [command]         display help for command
~~~

The first thing you'll need to do is add some transcripts. At the moment Minerva supports MS Teams docs file format. You can batch-convert a folder of transcripts as follows:

~~~
% node index.mjs teams-parser "files/docx/*.docx"
~~~

Transcripts are transformed and stored in the `transcripts` folder.

You can also set up a watcher, which you'd typically point at your downloads folder:

~~~
% node index.mjs teams-watch ~/Downloads    
~~~

The watcher will also create a meeting summary and store it in your clipboard, allowing you to paste the result into the meeting chat when complete.

## TODO list

Basic functionality and quality improvements

 - [ ] Implement a more robust way to limit tokens
 - [ ] Allow model selection
 - [ ] Add error handling / failure codepaths - currently the code is happy-path only
 - [ ] Add some example transcripts
 - [ ] Adding meeting summaries to clipboard should be an option for the watcher

New features:

 - [ ] Allow querying over the entire corpus of meetings
 - [ ] Find a way to automatically spot meeting series and navigate between them (perhaps via embeddings)

## Similar projects

There are a number of projects that perform meeting transcription and summarisation: 

 - https://github.com/NickMezacapa/meeting-minutes
 - https://github.com/AutohostAI/meeting-notes
 - https://github.com/Parassharmaa/mom-ai
 - https://github.com/rajpdus/MeetingSummarizer

However, there doesn't seem to be many (any?) that turn this into a queryable knowledgebase.