const fs = require('fs');
const transcript = fs.readFileSync('C:/Users/Muhammad Adnan/.gemini/antigravity-ide/brain/c871c29e-8581-4565-946c-8ece224bffb6/.system_generated/logs/transcript_full.jsonl', 'utf-8');
const lines = transcript.split('\n');
for (const line of lines) {
  if (line.includes('ResearchAreas.tsx') && line.includes('view_file')) {
    console.log(line.substring(0, 500));
  }
}
