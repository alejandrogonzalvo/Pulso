#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const QUOTES_FILE = join(__dirname, 'src', 'data', 'quotes.ts');
const VERSION = '1.0.0';

function readQuotes() {
  const content = readFileSync(QUOTES_FILE, 'utf-8');
  const match = content.match(/export const quotes = \[([\s\S]*?)\];/);
  if (!match) {
    console.error('Error: Could not parse quotes file');
    process.exit(1);
  }

  const quotesStr = match[1];
  const quotes = [];
  const regex = /"([^"\\]*(\\.[^"\\]*)*)"/g;
  let m;

  while ((m = regex.exec(quotesStr)) !== null) {
    quotes.push(m[1]);
  }

  return quotes;
}

function writeQuotes(quotes) {
  const quotesArray = quotes.map(q => `  "${q}",`).join('\n');
  const content = `export const quotes = [
${quotesArray}
];

export function getRandomQuote(): string {
  return quotes[Math.floor(Math.random() * quotes.length)];
}
`;
  writeFileSync(QUOTES_FILE, content, 'utf-8');
}

function showHelp() {
  console.log(`
Pulso CLI - Manage motivational quotes

Usage:
  pulso [command] [options]

Commands:
  quote add <text>     Add a new quote
  quote list           List all quotes
  quote remove <text>  Remove a quote by exact text match
  --help               Show this help message
  --version            Show version number

Examples:
  pulso quote add "Stay focused and keep going"
  pulso quote list
  pulso quote remove "Stay focused and keep going"
`);
}

function showVersion() {
  console.log(`Pulso v${VERSION}`);
}

function quoteAdd(text) {
  if (!text) {
    console.error('Error: Quote text is required');
    console.log('Usage: pulso quote add "Your quote here"');
    process.exit(1);
  }

  const quotes = readQuotes();

  if (quotes.includes(text)) {
    console.log('Quote already exists!');
    return;
  }

  quotes.push(text);
  writeQuotes(quotes);
  console.log(`✓ Quote added successfully! (Total: ${quotes.length})`);
}

function quoteList() {
  const quotes = readQuotes();

  if (quotes.length === 0) {
    console.log('No quotes found.');
    return;
  }

  console.log(`\nFound ${quotes.length} quote${quotes.length === 1 ? '' : 's'}:\n`);
  quotes.forEach((quote, index) => {
    console.log(`${index + 1}. "${quote}"`);
  });
  console.log();
}

function quoteRemove(text) {
  if (!text) {
    console.error('Error: Quote text is required');
    console.log('Usage: pulso quote remove "Your quote here"');
    process.exit(1);
  }

  const quotes = readQuotes();
  const index = quotes.indexOf(text);

  if (index === -1) {
    console.error('Error: Quote not found');
    console.log('\nAvailable quotes:');
    quotes.forEach((q, i) => console.log(`${i + 1}. "${q}"`));
    process.exit(1);
  }

  quotes.splice(index, 1);
  writeQuotes(quotes);
  console.log(`✓ Quote removed successfully! (Remaining: ${quotes.length})`);
}

// Parse arguments
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help') {
  showHelp();
  process.exit(0);
}

if (args[0] === '--version') {
  showVersion();
  process.exit(0);
}

if (args[0] === 'quote') {
  const subcommand = args[1];

  if (!subcommand) {
    console.error('Error: Missing quote subcommand');
    console.log('Available subcommands: add, list, remove');
    console.log('Use "pulso --help" for more information');
    process.exit(1);
  }

  switch (subcommand) {
    case 'add':
      quoteAdd(args.slice(2).join(' '));
      break;
    case 'list':
      quoteList();
      break;
    case 'remove':
      quoteRemove(args.slice(2).join(' '));
      break;
    default:
      console.error(`Error: Unknown subcommand "${subcommand}"`);
      console.log('Available subcommands: add, list, remove');
      process.exit(1);
  }
} else {
  console.error(`Error: Unknown command "${args[0]}"`);
  console.log('Use "pulso --help" for more information');
  process.exit(1);
}