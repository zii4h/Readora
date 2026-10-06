
const make = (id, title, author, work, book, level, category, text, questions) => ({
  id, title, level, category, minutes: 3, published: 1, baseline: false,
  description: `An excerpt from ${work} by ${author}.`,
  source: `Passage: ${author}, ${work}. Source: https://www.gutenberg.org/ebooks/${book} . Original wording preserved. Public-domain original text (published before 1900; authors died in 1898 and 1930 respectively). Project Gutenberg license: https://www.gutenberg.org/license . Questions and feedback: AI-assisted demo material; educator review required. Reading levels are provisional project labels.`,
  sections: [{ id: `${id}-s1`, title, text, questions: questions.map(([skill, prompt, options, correct, explanation], i) => ({ id: `${id}-q${i + 1}`, skill, prompt, options, correct, explanation })) }],
});
export const variedExercises = [
  make('carroll-curious-alice', 'Alice and the White Rabbit', 'Lewis Carroll', "Alice’s Adventures in Wonderland, Chapter I", 11, 'Intermediate', 'Fantasy',
    'Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, “and what is the use of a book,” thought Alice “without pictures or conversations?”\n\nSo she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.',
    [
      ['Literal Understanding', 'Who was sitting beside Alice?', ['Her sister', 'Her teacher', 'A gardener', 'The Rabbit'], 0, 'The opening sentence places Alice beside her sister on the bank.'],
      ['Vocabulary in Context', 'What does “peeped” mean here?', ['Read aloud', 'Looked briefly', 'Closed firmly', 'Wrote slowly'], 1, 'Alice briefly looks into the book her sister is reading.'],
      ['Main Idea', 'What change occurs in this excerpt?', ['Alice finishes a book', 'Her sister leaves', 'A Rabbit interrupts Alice’s idle thoughts', 'Alice completes a daisy-chain'], 2, 'Alice is bored and considering an activity when the White Rabbit appears.'],
      ['Inference', 'What kind of book would likely interest Alice more?', ['One with only numbers', 'One with no words', 'One about weather alone', 'One with pictures and conversations'], 3, 'Her question about the usefulness of a book without pictures or conversations suggests she enjoys those features.'],
    ]),
  make('doyle-facts-theories', 'Holmes: Facts Before Theories', 'Arthur Conan Doyle', 'The Adventures of Sherlock Holmes, A Scandal in Bohemia', 1661, 'Advanced', 'Mystery',
    '“This is indeed a mystery,” I remarked. “What do you imagine that it means?”\n\n“I have no data yet. It is a capital mistake to theorise before one has data. Insensibly one begins to twist facts to suit theories, instead of theories to suit facts. But the note itself. What do you deduce from it?”\n\nI carefully examined the writing, and the paper upon which it was written.',
    [
      ['Literal Understanding', 'What does the narrator examine?', ['A map and a key', 'The writing and its paper', 'A photograph', 'A newspaper advertisement'], 1, 'The final sentence explicitly mentions examining the writing and the paper.'],
      ['Vocabulary in Context', 'What does “capital” mean in “a capital mistake”?', ['Related to a city', 'Written in large letters', 'Serious or major', 'Financial'], 2, 'Holmes uses the word to emphasize how serious this mistake is.'],
      ['Main Idea', 'What principle does Holmes explain?', ['Gather evidence before forming a theory', 'Ignore facts that disagree with you', 'Every note is a mystery', 'Paper matters more than writing'], 0, 'He warns that premature theories can lead people to distort the facts.'],
      ['Inference', 'Why is examining the note a useful next step?', ['It proves the case is solved', 'It replaces the need for evidence', 'It guarantees the writer’s identity', 'It gathers evidence before drawing conclusions'], 3, 'Studying the note follows Holmes’s advice to obtain data first.'],
    ]),
];
