import collection from "../content/passages.json" with { type: "json" };

export const SKILLS = ["Literal Understanding", "Vocabulary in Context", "Main Idea", "Inference"];
const [L, V, M, I] = SKILLS;
const q = (skill, prompt, options, correct, explanation) => ({ skill, prompt, options, correct, explanation });
const make = (passageId, level, groups, baseline = false) => {
  const p = collection.passages.find((p) => p.id === passageId);
  const id = baseline ? "baseline" : `aesop-${passageId}`;
  return {
    id, title: baseline ? `Reading starting point: ${p.title}` : p.title,
    level, category: baseline ? "Assessment" : "Aesop’s fables", minutes: baseline ? 5 : 3,
    description: `${p.title} — Aesop, translated by George Fyler Townsend.`,
    source: `Passage: Aesop, ${p.title}, in Three hundred Aesop’s fables. Translated by George Fyler Townsend (1814–1900). Source: https://www.gutenberg.org/ebooks/21 . Public domain in the USA; translator’s lifetime also exceeds the Philippine life-plus-50-year term. Wording preserved; whitespace normalized and text divided into sections. Questions, choices and feedback: AI-assisted demo material; educator review required. Reading levels are provisional project labels. Full source and included license: /sources/pg21.txt`,
    published: 1, baseline,
    sections: p.sections.map((text, i) => ({
      id: `${id}-s${i + 1}`, title: `${p.title} · ${i + 1}`, text,
      questions: groups[i].map((question, j) => ({ id: `${id}-s${i + 1}-q${j + 1}`, ...question })),
    })),
  };
};

export const seedExercises = [
  make("lion-mouse", "Intermediate", [
    [
      q(L, "What awakened the Lion?", ["A hunter’s shout", "A Mouse running over his face", "A falling tree", "A broken rope"], 1, "The opening sentence says that a Mouse running over his face awakened the Lion."),
      q(V, "What does ‘entreated’ mean in this passage?", ["Demanded angrily", "Ran away", "Begged earnestly", "Laughed loudly"], 2, "The Mouse asks the Lion to spare his life; ‘entreated’ describes this urgent plea."),
      q(M, "Which statement best summarizes this section?", ["A Lion spares a Mouse who promises to repay him", "A Mouse teaches hunters to catch a Lion", "A Lion asks a Mouse for food", "A Mouse refuses to help a Lion"], 0, "This section describes the Mouse’s capture, plea and release, before the hunters appear."),
      q(I, "What does the Lion’s laughter at the Mouse’s promise suggest?", ["He already needs the Mouse’s help", "He is frightened of the Mouse", "He recognizes a hunter", "He doubts that the Mouse could help him"], 3, "Laughing at the promise suggests that the Lion finds help from such a small animal unlikely."),
    ],
    [
      q(L, "How did the Mouse free the Lion?", ["He called other lions", "He frightened the hunters", "He gnawed the rope with his teeth", "He dug a tunnel"], 2, "The passage states that the Mouse gnawed the rope with his teeth and set the Lion free."),
      q(V, "In ‘confer benefits,’ what does ‘confer’ mean?", ["Give or bestow", "Hide or conceal", "Reject or refuse", "Borrow or take"], 0, "The Mouse has given the Lion help, so ‘confer benefits’ means to bestow something beneficial."),
      q(M, "Which idea is supported by the whole fable?", ["Promises are always impossible to keep", "Even someone small can repay kindness with help", "Strength prevents every danger", "Hunters always release their captives"], 1, "The small Mouse repays the Lion’s kindness by doing something the trapped Lion cannot do himself."),
      q(I, "What belief does the Mouse’s action challenge?", ["Ropes can hold animals", "Hunters can capture lions", "Mice have teeth", "A small creature cannot help a powerful one"], 3, "The Mouse frees the powerful Lion, disproving the Lion’s earlier doubt about the Mouse’s usefulness."),
    ],
  ], true),
  make("hare-tortoise", "Beginner", [
    [
      q(L, "Who was chosen to select the course and goal?", ["The Tortoise", "The Hare", "The Fox", "The Lion"], 2, "The Hare and Tortoise agree that the Fox should choose the course and fix the goal."),
      q(V, "What does ‘assented’ mean here?", ["Agreed", "Forgot", "Objected", "Slept"], 0, "The Hare accepts the proposal to race, so ‘assented’ means agreed."),
    ],
    [
      q(I, "Which action most directly helped the Tortoise win?", ["She changed the course", "She kept going while the Hare slept", "She asked the Fox to carry her", "She stopped to wait"], 1, "The Tortoise never stops, while the Hare sleeps. Her steady movement lets her reach the goal first."),
      q(M, "What lesson does the fable emphasize?", ["Winning depends only on speed", "Resting always guarantees success", "Races should have no goal", "Steady effort can overcome an advantage in speed"], 3, "The faster Hare loses after stopping, while the Tortoise’s steady effort wins. The closing moral states this lesson."),
    ],
  ]),
  make("crow-pitcher", "Beginner", [
    [
      q(L, "Why could the Crow not drink at first?", ["The pitcher contained too little water to reach", "The water was frozen", "Another bird guarded it", "The pitcher had no opening"], 0, "The water is present, but its level is too low for the Crow to reach."),
      q(V, "What does ‘in vain’ mean here?", ["With great noise", "By chance", "Without success", "Very quickly"], 2, "The Crow’s initial efforts do not let him reach the water, so they are unsuccessful."),
    ],
    [
      q(I, "Why did dropping stones help the Crow?", ["They cooled the air", "They raised the water within reach", "They broke his beak", "They attracted another bird"], 1, "The story says that adding stones brought the water within reach; the stones displaced the water upward."),
      q(M, "What is the main lesson of the fable?", ["Give up after one failure", "Avoid every unfamiliar object", "Only strength solves problems", "A pressing need can lead to a useful invention"], 3, "The Crow finds a new solution because he urgently needs water, illustrating the closing moral."),
    ],
  ]),
  make("fox-crow", "Intermediate", [
    [
      q(L, "What did the Fox want?", ["The tree", "The Crow’s meat", "A nest", "A crown"], 1, "The narrator directly states that the Fox wanted to possess the meat."),
      q(V, "What is a ‘wily stratagem’?", ["An honest apology", "A loud argument", "A cunning plan", "An accidental meeting"], 2, "The Fox uses calculated praise to obtain the meat, making his stratagem a cunning plan."),
    ],
    [
      q(I, "Why did the Fox question whether the Crow’s voice matched her beauty?", ["To make her open her beak and drop the meat", "To help her find another tree", "To warn her about a hunter", "To ask her to keep silent"], 0, "The Crow responds by cawing and dropping the meat, which the Fox immediately takes."),
      q(M, "Which idea best captures the fable?", ["Good singing always brings rewards", "Beauty prevents mistakes", "Meat cannot be carried in a beak", "Flattery can be used to exploit someone’s vanity"], 3, "The Fox’s praise encourages the Crow to prove herself, allowing him to take her food."),
    ],
  ]),
  make("ants-grasshopper", "Intermediate", [
    [
      q(L, "When had the Ants collected their grain?", ["That winter morning", "During the summer", "During the night", "After meeting the Grasshopper"], 1, "The opening sentence identifies the grain as collected in the summertime."),
      q(V, "What does ‘perishing with famine’ indicate?", ["Suffering severely from lack of food", "Enjoying a large meal", "Practicing a song", "Escaping heavy rain"], 0, "The Grasshopper begs for food because he is suffering from extreme hunger."),
    ],
    [
      q(I, "What do the Ants’ final words suggest about their attitude?", ["They admire his planning", "They want singing lessons", "They disapprove of his failure to prepare", "They did not hear his answer"], 2, "Their mocking reply links his summer singing to having no supper in winter."),
      q(M, "Which contrast is central to this fable?", ["Flying and swimming", "Summer heat and winter sunlight", "Music and dancing as equal jobs", "Preparing for future needs and neglecting them"], 3, "The Ants have stored grain, while the Grasshopper spent the summer singing and now lacks food."),
    ],
  ]),
  make("oak-reeds", "Advanced", [
    [
      q(L, "What happened to the Oak?", ["It was uprooted and thrown across a stream", "It grew taller than the mountain", "It sheltered every Reed", "It dried up in the sun"], 0, "The opening sentence states that the wind uprooted the Oak and threw it across a stream."),
      q(I, "What assumption lies behind the Oak’s surprise?", ["The Reeds are heavier than the Oak", "The stream has no water", "Larger, stronger plants should survive wind better", "The wind never reaches the Reeds"], 2, "The Oak wonders why plants it calls light and weak survived a force that destroyed it."),
    ],
    [
      q(V, "What does ‘contend’ mean in the Reeds’ explanation?", ["Sleep peacefully", "Struggle against", "Grow beside", "Agree with"], 1, "The Reeds pair ‘contend’ with ‘fight’ to describe the Oak’s resistance to the wind."),
      q(M, "Which interpretation is best supported by the contrast?", ["Being large guarantees survival", "Every difficulty should be ignored", "Strength is always harmful", "Flexibility can be more effective than rigid resistance"], 3, "The Reeds bend and survive, while the Oak resists and is destroyed. This supports a lesson about flexibility."),
    ],
  ]),
  make("north-wind-sun", "Advanced", [
    [
      q(L, "How did the Traveler respond to stronger blasts?", ["He threw away his cloak", "He challenged the Sun", "He wrapped his cloak more closely", "He stopped wearing clothes immediately"], 2, "The stronger the Wind’s blasts, the closer the Traveler wrapped his cloak around him."),
      q(I, "Why did the Wind’s approach fail?", ["Its force made the Traveler resist the intended result", "The Traveler could not feel the wind", "The Sun hid the Traveler", "The Wind forgot the contest"], 0, "The Wind tries to strip the Traveler, but its cold blasts make him hold his clothing more closely."),
    ],
    [
      q(V, "What does ‘genial’ suggest about the Sun’s rays?", ["Hostile and freezing", "Warm and pleasant", "Invisible and distant", "Sharp and noisy"], 1, "The passage describes the Sun shining with warmth, which prompts the Traveler to remove his garments."),
      q(M, "Which principle does the fable illustrate?", ["Competition always ends in a tie", "Cold weather makes people remove clothes", "Force is the only way to change behavior", "Gentle influence can succeed where force fails"], 3, "The Wind fails through force, while the Sun succeeds through warmth. The stated moral favors persuasion."),
    ],
  ]),
];
