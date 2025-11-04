export const quotes = [
  "You have no enemies. Nobody has any enemies. There is no one that you need to hurt.",
  "A true warrior needs no sword.",
  "The life of a slave is better than the death of a warrior.",
  "If you have a family you love, then you have everything.",
  "I'll create a land where everyone can live in peace.",
  "If everyone is not special, maybe you can be what you want to be.",
  "Your life is your own. Don't let it be defined by someone else's values.",
  "It's important to know what you can and can't do. It's part of being a responsible adult.",
  "The truth behind one's charm is kindness. Just be a good person, that's all.",
];

export function getRandomQuote(): string {
  return quotes[Math.floor(Math.random() * quotes.length)];
}
