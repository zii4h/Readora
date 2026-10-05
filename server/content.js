export const SKILLS = [
  "Literal Understanding",
  "Vocabulary in Context",
  "Main Idea",
  "Inference",
];
const q = (skill, prompt, options, correct, explanation) => ({
  id: crypto.randomUUID(),
  skill,
  prompt,
  options,
  correct,
  explanation,
});
const s = (title, text, questions) => ({
  id: crypto.randomUUID(),
  title,
  text,
  questions,
});
const exercise = (
  id,
  title,
  level,
  category,
  description,
  sections,
  baseline = false,
) => ({
  id,
  title,
  level,
  category,
  description,
  minutes: 5,
  source: "Original passage written for Readora. Reusable with this project.",
  published: 1,
  baseline,
  sections,
});
export const seedExercises = [
  exercise(
    "baseline",
    "Your reading starting point",
    "Intermediate",
    "Assessment",
    "A short, eight-question check across all four skills. This is a starting point, not a grade.",
    [
      s(
        "The empty corner",
        "Every afternoon, Nila passed an empty corner of the school courtyard. Most students hurried past it on their way home. One Monday, she placed three pots of herbs there. She also left a small notebook so anyone could record when the plants had been watered.",
        [
          q(
            SKILLS[0],
            "What did Nila place in the courtyard?",
            [
              "Three pots of herbs",
              "A wooden bench",
              "A box of books",
              "Three empty notebooks",
            ],
            0,
            "The passage explicitly says she placed three pots of herbs there.",
          ),
          q(
            SKILLS[3],
            "Why did Nila most likely leave the notebook?",
            [
              "To sell it to a student",
              "To help people coordinate plant care",
              "To keep the corner empty",
              "To record exam marks",
            ],
            1,
            "Recording watering helps different people care for the same plants without guessing.",
          ),
        ],
      ),
      s(
        "An unexpected helper",
        "By Wednesday, one pot had wilted. Its leaves hung loosely over the rim. Tomas, who rarely spoke in class, moved it into partial shade. The next morning its leaves stood upright again. He wrote a brief note: “Less direct sun for this one.”",
        [
          q(
            SKILLS[1],
            "What does “wilted” mean here?",
            [
              "Grown taller",
              "Lost its firmness and drooped",
              "Changed into a flower",
              "Become heavier",
            ],
            1,
            "The hanging leaves show that the plant had drooped.",
          ),
          q(
            SKILLS[0],
            "What did Tomas do?",
            [
              "Watered every pot twice",
              "Threw the pot away",
              "Moved a pot into partial shade",
              "Moved all pots indoors",
            ],
            2,
            "Tomas moved the struggling pot into partial shade.",
          ),
        ],
      ),
      s(
        "Small contributions",
        "During the following week, students brought spare pots and seeds. No one was appointed leader. Instead, they checked the notebook and did whichever small task was needed. The corner gradually became a shared garden, although each student spent only a few minutes there.",
        [
          q(
            SKILLS[2],
            "What is the main idea of this section?",
            [
              "A garden needs one strict leader",
              "Seeds grow immediately",
              "Small shared efforts can create something useful",
              "Students should avoid outdoor tasks",
            ],
            2,
            "The section emphasizes how many small contributions built the garden.",
          ),
          q(
            SKILLS[1],
            "What does “gradually” mean?",
            ["All at once", "Over time", "Secretly", "By accident"],
            1,
            "The garden developed during the week, through successive contributions.",
          ),
        ],
      ),
      s(
        "More than plants",
        "At the end of the month, Nila read the notebook. Alongside watering notes, she found drawings, questions, and thank-you messages. She had hoped to grow herbs, but she now saw students from different classes greeting each other beside the pots.",
        [
          q(
            SKILLS[3],
            "What can you infer about the garden?",
            [
              "It helped students form connections",
              "It replaced every lesson",
              "It was closed to other classes",
              "It stopped needing care",
            ],
            0,
            "The messages and greetings suggest social connections formed through the garden.",
          ),
          q(
            SKILLS[2],
            "Which title best captures the whole passage?",
            [
              "The Fastest Way Home",
              "A Corner That Brought People Together",
              "How to Pass a Gardening Exam",
              "Why Plants Need No Sun",
            ],
            1,
            "The passage follows an unused corner becoming a garden and a place for community.",
          ),
        ],
      ),
    ],
    true,
  ),
  exercise(
    "last-bus",
    "The last bus home",
    "Beginner",
    "Everyday stories",
    "A small choice at a bus stop reveals more than it first seems.",
    [
      s(
        "At the stop",
        "Mara reached the bus stop just before sunset. The timetable showed one final bus at six. Beside her, a boy searched his backpack, pulling out books and a lunch box. He checked the same small pocket twice.",
        [
          q(
            SKILLS[0],
            "When was the final bus scheduled?",
            ["Five", "Six", "Seven", "Sunset exactly"],
            1,
            "The timetable listed the final bus at six.",
          ),
          q(
            SKILLS[3],
            "What does the boy’s repeated searching suggest?",
            [
              "He is looking for something he cannot find",
              "He is showing Mara his books",
              "He is packing for a holiday",
              "He is cleaning the bus stop",
            ],
            0,
            "Repeatedly checking a pocket suggests he is trying to find a missing item.",
          ),
        ],
      ),
      s(
        "A quiet offer",
        "When the bus arrived, the boy stayed on the pavement. Mara paused, then asked the driver for two tickets. “You can sit by the window,” she told the boy. He hesitated before climbing aboard.",
        [
          q(
            SKILLS[1],
            "What does “hesitated” mean?",
            [
              "Moved with great speed",
              "Paused because he was uncertain",
              "Laughed loudly",
              "Fell asleep",
            ],
            1,
            "He paused before accepting the offer and boarding.",
          ),
        ],
      ),
      s(
        "The ride",
        "The boy thanked Mara and explained that he had left his fare on the kitchen table. Mara nodded. She remembered a stranger helping her on a rainy evening years before. Outside the window, the streetlights began to glow.",
        [
          q(
            SKILLS[2],
            "What is the main idea of the story?",
            [
              "Buses always arrive late",
              "Remembered kindness can inspire someone to help another person",
              "Backpacks are difficult to organize",
              "Every journey must happen at night",
            ],
            1,
            "Mara helps the boy and remembers a time when someone helped her.",
          ),
        ],
      ),
    ],
  ),
  exercise(
    "seed-library",
    "The seed library",
    "Beginner",
    "Nature & community",
    "Discover how one library shares something other than books.",
    [
      s(
        "A different shelf",
        "The town library added a shelf of seed packets beside its books. Residents could take a packet home and plant the seeds. Each packet had a label naming the plant and explaining how much light it needed.",
        [
          q(
            SKILLS[0],
            "What information was on each packet?",
            [
              "The librarian’s address",
              "The plant’s name and light needs",
              "The price of a book",
              "A weather forecast",
            ],
            1,
            "The labels named the plant and described its light needs.",
          ),
        ],
      ),
      s(
        "A patient process",
        "Lena planted beans in a sunny container. At first, the soil looked unchanged. She kept it moist without flooding it. After several days, a small shoot emerged through the surface.",
        [
          q(
            SKILLS[1],
            "What does “emerged” mean?",
            [
              "Disappeared",
              "Came into view",
              "Became dry",
              "Moved underground",
            ],
            1,
            "The shoot came through the soil and became visible.",
          ),
          q(
            SKILLS[3],
            "Why did Lena keep caring for the soil before seeing a shoot?",
            [
              "She understood that growth takes time",
              "She wanted to flood the container",
              "She knew the seeds were plastic",
              "She planned to stop the beans growing",
            ],
            0,
            "Her continued care despite no visible change suggests patience with the growth process.",
          ),
        ],
      ),
      s(
        "Giving back",
        "At harvest time, Lena saved some seeds and returned them to the shelf. The library did not require every visitor to return seeds, but it encouraged those who could. This helped more residents try gardening the next season.",
        [
          q(
            SKILLS[2],
            "What is the main purpose of the seed library?",
            [
              "To replace all books",
              "To help people grow plants and share resources",
              "To sell expensive containers",
              "To prevent people from gardening",
            ],
            1,
            "People receive seeds, grow plants, and can contribute seeds for others.",
          ),
        ],
      ),
    ],
  ),
  exercise(
    "lighthouse",
    "A light through the fog",
    "Intermediate",
    "Adventure",
    "Read between the lines of a keeper’s unusual decision.",
    [
      s(
        "The routine",
        "Each evening, Ivo checked the lighthouse lamp and recorded the weather. Its beam swept the bay at regular intervals. On clear nights, he could see fishing boats turning toward the harbor. Tonight, a dense fog concealed everything beyond the rocks.",
        [
          q(
            SKILLS[1],
            "What does “concealed” mean in this passage?",
            ["Made brighter", "Hid from view", "Moved closer", "Destroyed"],
            1,
            "The fog prevented Ivo from seeing beyond the rocks.",
          ),
          q(
            SKILLS[0],
            "What did Ivo record each evening?",
            [
              "The price of fish",
              "The weather",
              "Every sailor’s name",
              "The depth of the whole bay",
            ],
            1,
            "The opening sentence states he recorded the weather.",
          ),
        ],
      ),
      s(
        "A second signal",
        "The lamp continued working, but Ivo carried a bell onto the lower platform. He rang it at steady intervals. A visitor asked why he bothered when the light was already on. Ivo pointed into the fog, where even the nearest buoy had vanished from sight.",
        [
          q(
            SKILLS[3],
            "Why did Ivo ring the bell?",
            [
              "The lamp had stopped working",
              "Sound could provide a signal when the light was hard to see",
              "He wanted to announce a celebration",
              "The visitor asked him to",
            ],
            1,
            "The lamp worked, but the fog blocked visibility. An audible signal could still guide boats.",
          ),
        ],
      ),
      s(
        "An arrival",
        "An hour later, a small boat reached the harbor. Its captain could not see the lighthouse until she was close to shore, but she had heard the bell. Ivo added one line to his record: “Light checked. Bell used. Boat arrived safely.”",
        [
          q(
            SKILLS[2],
            "Which statement best expresses the story’s main idea?",
            [
              "A familiar method may need support when conditions change",
              "Written records are always unnecessary",
              "A bell is always better than a light",
              "Visitors should never ask questions",
            ],
            0,
            "Ivo supplements the usual light with sound because the fog changes what sailors can perceive.",
          ),
        ],
      ),
    ],
  ),
  
  exercise(
    "repair-cafe",
    "Saturday at the repair café",
    "Intermediate",
    "Community",
    "Explore the difference between fixing an object and sharing knowledge.",
    [
      s(
        "A slow queue",
        "The repair café opened in a school hall on Saturday. People brought broken lamps, loose chair legs, and torn bags. Volunteers worked slowly because they explained each step to the owners. Some visitors had expected a quick drop-off service.",
        [
          q(
            SKILLS[0],
            "Why did volunteers work slowly?",
            [
              "They were explaining the steps",
              "The hall was closed",
              "No visitors arrived",
              "They refused to use tools",
            ],
            0,
            "The passage directly links the slower work to explaining each step.",
          ),
        ],
      ),
      s(
        "Learning the repair",
        "A volunteer showed Arman how a loose connection had stopped his lamp working. Rather than taking over, she let him tighten the connection while the lamp was unplugged. Arman was initially reluctant, but after checking her instructions, he tried.",
        [
          q(
            SKILLS[1],
            "What does “reluctant” mean here?",
            [
              "Unwilling or hesitant",
              "Already expert",
              "Very noisy",
              "Completely unaware",
            ],
            0,
            "He hesitated before attempting the task.",
          ),
          q(
            SKILLS[3],
            "Why did the volunteer let Arman do the repair?",
            [
              "To help him gain practical confidence",
              "To avoid ever explaining anything",
              "To damage the lamp",
              "To end the café immediately",
            ],
            0,
            "The guided participation suggests the goal is helping him learn, not only fixing the object.",
          ),
        ],
      ),
      s(
        "Taking something home",
        "Arman left with a working lamp and a page of notes. The next week, he helped his sister mend a bag using a technique another volunteer had demonstrated. The café had repaired belongings, but it had also made repair feel possible.",
        [
          q(
            SKILLS[2],
            "Which best summarizes the passage?",
            [
              "Replacing items is the only solution",
              "A repair café can share skills as well as restore belongings",
              "Only volunteers may learn repairs",
              "Queues make all community events fail",
            ],
            1,
            "The story focuses on both repaired objects and knowledge people can use again.",
          ),
        ],
      ),
    ],
  ),
  exercise(
    "river-data",
    "What the river numbers missed",
    "Advanced",
    "Science & society",
    "Consider what evidence can—and cannot—tell us.",
    [
      s(
        "A reassuring average",
        "A town’s monthly river report showed an average oxygen level within the expected range. Officials described the result as reassuring. Yet fishers reported finding distressed fish near a drainage outlet early in the morning. Their observations appeared to conflict with the report.",
        [
          q(
            SKILLS[0],
            "Where did fishers report distressed fish?",
            [
              "Near a drainage outlet",
              "Inside the town hall",
              "Throughout every ocean",
              "Only in laboratory tanks",
            ],
            0,
            "The passage locates the observations near a drainage outlet.",
          ),
        ],
      ),
      s(
        "Looking closer",
        "A student team examined how the samples had been collected. Most measurements came from an upstream station at midday. The team added measurements near the outlet before sunrise and found brief periods of low oxygen. Those local episodes had been obscured by the broader average.",
        [
          q(
            SKILLS[1],
            "What does “obscured” mean here?",
            [
              "Made less apparent",
              "Deliberately invented",
              "Permanently removed",
              "Accurately predicted",
            ],
            0,
            "The average made the short, local changes less apparent.",
          ),
          q(
            SKILLS[3],
            "What is the strongest inference from the new measurements?",
            [
              "The original data were necessarily fabricated",
              "The original sampling did not capture every relevant condition",
              "All averages are useless",
              "Fish never need oxygen at midday",
            ],
            1,
            "The new times and location revealed conditions missing from the original sampling, without proving fraud or making all averages useless.",
          ),
        ],
      ),
      s(
        "A revised report",
        "The town kept the monthly average but added results by location and time. The revised report was longer and less tidy. It also gave officials a clearer basis for investigating the outlet. The student team cautioned that low oxygen alone did not identify the source of the problem.",
        [
          q(
            SKILLS[2],
            "Which best states the main idea?",
            [
              "Simple summaries should be interpreted alongside relevant detail",
              "Longer reports always prove the cause",
              "Averages should be banned",
              "Only officials can collect useful evidence",
            ],
            0,
            "The passage shows the value of details alongside an average, while avoiding an unsupported conclusion about cause.",
          ),
        ],
      ),
    ],
  ),
  exercise(
    "quiet-square",
    "The quiet square",
    "Advanced",
    "Culture & perspective",
    "Weigh competing interpretations of a changing public space.",
    [
      s(
        "An apparent success",
        "After a city renovated its central square, complaints about noise fell sharply. A report called the project a success. New benches faced decorative planters, and signs prohibited ball games. On weekday afternoons, the square was almost silent.",
        [
          q(
            SKILLS[0],
            "What change did the report emphasize?",
            [
              "Fewer noise complaints",
              "Higher market prices",
              "More ball games",
              "Fewer planters",
            ],
            0,
            "The report described the sharp fall in noise complaints.",
          ),
        ],
      ),
      s(
        "Another measure",
        "A neighborhood group counted visitors before and after the renovation. Older residents still came in the morning, but far fewer families stayed after school. One parent said the square looked inviting in photographs but offered little for children to do. The group argued that silence was an ambiguous indicator of success.",
        [
          q(
            SKILLS[1],
            "What does “ambiguous” mean in this context?",
            [
              "Open to more than one interpretation",
              "Perfectly precise",
              "Entirely false",
              "Impossible to count",
            ],
            0,
            "Silence could mean reduced nuisance or reduced use; it does not have only one interpretation.",
          ),
          q(
            SKILLS[3],
            "What can reasonably be inferred about the lower noise level?",
            [
              "It may partly reflect fewer families using the square",
              "Every resident dislikes the square",
              "The visitor count proves intentional exclusion",
              "The square is always empty",
            ],
            0,
            "Reduced family attendance offers a plausible additional explanation for less noise, without proving the stronger claims.",
          ),
        ],
      ),
      s(
        "Redefining the goal",
        "The city kept the quiet seating area but tested a small play zone on the opposite side. Future reviews would count visitors and ask about their experiences as well as track complaints. Officials agreed that a public space should be assessed by whom it serves, not only by what it prevents.",
        [
          q(
            SKILLS[2],
            "What is the central argument of the passage?",
            [
              "A single measure can overlook important effects of a public project",
              "All public squares should be silent",
              "Photographs are the best form of evaluation",
              "Complaints should never be recorded",
            ],
            0,
            "The square’s evaluation improves by considering use and experience alongside complaints.",
          ),
        ],
      ),
    ],
  ),
];
