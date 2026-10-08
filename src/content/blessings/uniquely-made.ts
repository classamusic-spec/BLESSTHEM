import type { CuratedEntry } from '../types.ts';

/**
 * Uniquely Made: for families raising a child with a disability, autism or other special
 * needs. These blessings speak to the child as whole and loved now, never as a problem to
 * be fixed. Healing is asked for honestly and humbly, never promised. Disability is never
 * linked to sin or to anyone’s lack of faith. Talk prompts leave room for children who
 * answer without words.
 */
const ALL = ['baby', 'preschool', 'elementary', 'tween', 'teen', 'young-adult', 'adult'] as CuratedEntry['ages'];

export const entries: CuratedEntry[] = [
  // ── Wonderfully made ───────────────────────────────────────────
  {
    id: 'wonderfully-made-psa-139-13',
    topic: 'wonderfully-made',
    ref: 'PSA 139:13-14',
    contextRef: 'PSA 139:13-18',
    contextNote:
      'David marvels that God was present and at work before he was born, shaping him in secret. The psalm is praise, not a description of perfection: it says each person is known and intended by God from the very beginning.',
    reflection:
      'Before any diagnosis, any milestone or any chart, God knew this child. David calls the way he was made wonderful, and that word belongs to every child, including those whose bodies and minds work differently. A diagnosis can describe how someone is made; it can never describe how much they are worth.',
    blessing:
      'You were made with care, every part of you. God knew you before anyone saw your face, and he calls his work in you wonderful. May you never believe that you are a mistake or a burden. May you know, deep down, that you are wanted, that you belong, and that you are loved exactly as you are today.',
    prayer:
      'Father, thank you for {name}. You formed {them} with care, and you do not make mistakes. When the world measures {name} by what {name} can or cannot do, remind {them} of what you see. Help us to delight in {name} the way you do, and to celebrate every part of who {name} is. Amen.',
    talk: {
      little: 'Hold their hands and say slowly: “God made you, and God loves you.”',
      child: 'What is something you love about the way God made you? You can tell me or show me.',
      teen: 'Is there anything people get wrong about you that you wish they understood?',
      adult: 'What do you wish more people knew about who you really are?',
    },
    ages: ALL,
    keywords: ['autism', 'autistic', 'disability', 'special needs', 'diagnosis', 'down syndrome', 'different', 'worth', 'fearfully and wonderfully made'],
    notes:
      'Never imply disability is a design flaw God regrets, or that a child must be “fixed” to be whole. The psalm is about being known and intended, not about bodies being free of difficulty.',
  },
  {
    id: 'wonderfully-made-1co-12-21',
    topic: 'wonderfully-made',
    ref: '1CO 12:21-22',
    contextRef: '1CO 12:14-26',
    contextNote:
      'Paul writes to a church that ranked people by status and gifts. He pictures the church as one body where every part is needed. The parts that seem weaker, he says, are the ones the body cannot do without.',
    reflection:
      'Paul turns the world’s ranking upside down. In God’s family, no one is a spare part, and the ones who seem weaker are called indispensable. Our children are not on the edges of God’s people; they belong at the center, and the rest of us are poorer without them.',
    blessing:
      'You are needed. God put you in this family and among his people on purpose, and no one else can take your place. May you be welcomed wherever you go, and may the people around you discover how much they need you. May you always know that you belong, not as a guest, but as family.',
    prayer:
      'Lord, thank you that {name} is a needed part of your family. Open the eyes of the people around {them} to see what {name} brings. Give {name} friends who make room, and churches and classrooms where {name} truly belongs. Where {name} is overlooked or left out, let us be the first to draw {them} in. Amen.',
    talk: {
      little: 'Point to their hands, then their heart, and say: “Every part of you matters.”',
      child: 'Where do you feel most like you belong? You can tell me or point to a picture.',
      teen: 'Where do you feel most welcome right now, and where do you wish you were welcomed more?',
      adult: 'Where do you feel you truly belong? How can I help make more room for you?',
    },
    ages: ALL,
    keywords: ['belong', 'included', 'left out', 'inclusion', 'disability', 'special needs', 'church', 'not welcome'],
    notes:
      'Paul is describing the church as a body, not making a claim about bodily ability; applied by principle to the full belonging of disabled people. Avoid pity language (“less fortunate”).',
  },
  {
    id: 'wonderfully-made-2sa-9-7',
    topic: 'wonderfully-made',
    ref: '2SA 9:7',
    contextRef: '2SA 9:1-13',
    contextNote:
      'King David looks for a way to honor his friend Jonathan, who has died. He finds Jonathan’s son Mephibosheth, who was disabled in his feet after a fall as a child, and gives him a permanent place at the royal table, like one of the king’s own sons.',
    reflection:
      'Mephibosheth expected to be ignored, and instead he was given a seat at the king’s table for life. Scripture mentions his disability plainly, and it never keeps him from the table. That is a picture of God’s welcome: we are seated by love, not by what our bodies can do.',
    blessing:
      'There is a place at the table for you. You do not have to earn it, and nothing about your body or your mind can take it away. May you be welcomed like a son or daughter of the King, wherever you go. May you sit with your head high, knowing you are honored and wanted.',
    prayer:
      'Faithful God, thank you that {name} has a place at your table. Keep {name} from ever feeling less welcome than anyone else. Give us the kindness of David, to go looking for the ones who are left out and to bring them in. Let {name} grow up knowing how honored and loved {name} is. Amen.',
    talk: {
      little: 'At a meal, pull out their chair and say: “This is your place. You belong here.”',
      child: 'Who has made you feel really welcome? What did they do?',
      teen: 'Who has made room for you in a way you didn’t expect?',
      adult: 'Who has made you feel truly welcome lately? Is there someone we could welcome together?',
    },
    ages: ALL,
    keywords: ['wheelchair', 'disabled', 'physical disability', 'cerebral palsy', 'belonging', 'welcome', 'special needs', 'mobility'],
    notes:
      'Mephibosheth’s story is about covenant kindness and welcome; do not make his disability the moral of the story or a symbol of brokenness. 2 Samuel 4:4 explains how he became disabled.',
  },
  {
    id: 'wonderfully-made-isa-43-1',
    topic: 'wonderfully-made',
    ref: 'ISA 43:1',
    contextRef: 'ISA 43:1-4',
    contextNote:
      'God speaks to Israel in exile, a people who felt forgotten and small. He reminds them that he made them, that he calls them by name, and that they belong to him. Applied today by principle: God knows each of his children by name.',
    reflection:
      'Long before a label is written on a form, God calls this child by name. Being known by name is the opposite of being a case or a category. Whatever words the doctors and schools use, the first word God speaks over our children is “mine.”',
    blessing:
      'God knows your name, and he says you are his. You are not a label, a case or a diagnosis; you are you, and you are loved. When people do not understand you, may you remember that the One who made you understands you completely. May you hear him calling you by name, gently, all your life.',
    prayer:
      'Lord, you call {name} by name and claim {them} as your own. When forms and reports try to describe {name}, help us remember that you know {them} best. Give the people around {name} eyes to see the person, not only the diagnosis. Hold {name} close, and let {them} feel safe and known. Amen.',
    talk: {
      little: 'Say their name softly, then: “God knows your name. You are his.”',
      child: 'What do you like most about your name? Say it with me, or show me.',
      teen: 'Do you ever feel like people see a label before they see you?',
      adult: 'Are there labels you wish people would look past? What would you want them to see?',
    },
    ages: ALL,
    keywords: ['label', 'diagnosis', 'autism', 'adhd', 'special needs', 'iep', 'known by name', 'identity'],
    notes:
      'Originally addressed to Israel in exile; applied by principle (God knows and claims his people). Do not set diagnosis against faith; naming a condition can be a real help. The point is that a label is never the whole person.',
  },

  // ── Seen and understood ────────────────────────────────────────
  {
    id: 'seen-and-understood-psa-139-1',
    topic: 'seen-and-understood',
    ref: 'PSA 139:1-4',
    contextRef: 'PSA 139:1-6',
    contextNote:
      'David is amazed that God knows him completely: when he sits and stands, what he thinks, even what he is about to say before he says it. He feels this as comfort, not as being watched.',
    reflection:
      'For a child who speaks differently, or not at all, these verses are a gift. God knows the word before it is on the tongue, and the thought that never becomes a word. Our children are never misunderstood by him, even on days we struggle to understand them ourselves.',
    blessing:
      'God understands you completely. He knows what you mean, even when the words will not come. He knows when you are happy, when you are tired and when everything feels too much. May you feel known and safe with him. May the people who love you learn to listen the way he listens.',
    prayer:
      'Lord, you understand {name} completely, even without words. On the days we cannot tell what {name} needs, give us patience and wisdom. Help us to listen with our eyes and our hearts. Give {name} ways to be heard, and people around {them} who take the time to understand. Thank you that {name} is never misunderstood by you. Amen.',
    talk: {
      little: 'Hold them close and say: “God knows what you mean, always.”',
      child: 'How can I tell when you are happy? Show me in your own way.',
      teen: 'Is there something you wish I understood better about how you feel?',
      adult: 'What helps you feel really understood? How can I listen better?',
    },
    ages: ALL,
    keywords: ['nonverbal', 'non-speaking', 'speech delay', 'communication', 'aac', 'autism', 'can’t talk', 'understood', 'apraxia'],
    notes:
      'God’s complete knowledge is presented as comfort, never surveillance. Do not imply a child must learn to speak to be close to God.',
  },
  {
    id: 'seen-and-understood-rom-8-26',
    topic: 'seen-and-understood',
    ref: 'ROM 8:26',
    contextRef: 'ROM 8:22-28',
    contextNote:
      'Paul admits that creation and God’s people groan as they wait for everything to be made new. Into that groaning he places a promise: when we do not know what to pray, the Spirit prays for us, with sighs too deep for words.',
    reflection:
      'Prayer does not depend on having the right words. Paul says the Spirit carries prayers that are only groans and sighs. That is good news for a child who cannot pray aloud, and for a parent too tired to find words at all.',
    blessing:
      'You can talk to God without any words at all. A sigh, a rock, a hum or a quiet moment can be a prayer, and God hears every one. May you know that he is near when words are hard. May you feel his love in ways that go deeper than words.',
    prayer:
      'Holy Spirit, thank you that you pray for us when we do not know how. Carry the prayers {name} cannot say, and the ones we are too tired to say. Let {name} feel your nearness in quiet and in noise, in sounds and in stillness. Teach us that every way {name} reaches for you is welcome. Amen.',
    talk: {
      little: 'Sit quietly together for a moment, then whisper: “God hears you.”',
      child: 'Do you know you can pray without talking? Let’s try one quiet minute together.',
      teen: 'What helps you feel close to God when words feel hard?',
      adult: 'When prayer feels wordless, what helps you? Would you like to sit in quiet together?',
    },
    ages: ALL,
    keywords: ['nonverbal', 'can’t pray', 'no words', 'communication', 'autism', 'prayer', 'tired', 'groaning'],
    notes:
      'The Spirit’s intercession is for all believers in weakness, not a special category for disabled people. Do not make the child an object lesson; keep the focus on God’s nearness.',
  },
  {
    id: 'seen-and-understood-zep-3-17',
    topic: 'seen-and-understood',
    ref: 'ZEP 3:17',
    contextRef: 'ZEP 3:14-17',
    contextNote:
      'After warnings of judgment, Zephaniah ends with a song of restoration for Jerusalem. God is pictured in the middle of his people, quieting them with love and singing over them with joy.',
    reflection:
      'When the world is too loud, too bright or too fast, God is described as one who quiets with love. He does not shout over an overwhelmed child; he draws near and sings. On hard days, we can pray for that quiet to reach our children, and to reach us.',
    blessing:
      'When everything feels too loud and too much, may God quiet you with his love. May his peace settle around you like a soft blanket. You are never too much for him. He delights in you, and he sings over you with joy, even on the hardest days.',
    prayer:
      'Lord, when {name} is overwhelmed, quiet {them} with your love. Help {name} find calm in noise and comfort in hard moments. Give us gentleness when {name} is struggling, and the wisdom to make the world a little softer around {them}. Thank you that you delight in {name}, even on the hardest days. Amen.',
    talk: {
      little: 'Wrap them in a blanket, rock gently and hum a quiet song.',
      child: 'What helps you feel calm when things get too loud? Let’s make a plan together.',
      teen: 'When everything feels like too much, what actually helps you?',
      adult: 'What does a truly restful moment look like for you right now?',
    },
    ages: ALL,
    keywords: ['meltdown', 'sensory', 'overwhelmed', 'overstimulated', 'too loud', 'shutdown', 'autism', 'calm down'],
    notes:
      'Addressed to restored Jerusalem; applied by principle to God’s tender presence. A meltdown is distress, not defiance; never frame it as sin or something prayer should simply stop.',
  },
  {
    id: 'seen-and-understood-isa-40-11',
    topic: 'seen-and-understood',
    ref: 'ISA 40:11',
    contextRef: 'ISA 40:9-11',
    contextNote:
      'Isaiah announces good news to God’s people: the mighty God is coming. Yet in the same breath he describes God as a shepherd who carries the lambs close and leads the mothers gently.',
    reflection:
      'The God of all power chooses to be gentle with the weak and the young. He carries the lambs and sets the pace for the ones who cannot hurry. Our children do not need to keep up with anyone else to be held close by him.',
    blessing:
      'God carries you close to his heart. You never have to rush to keep up with him; he walks at your pace. May you feel gently held on hard days and happy days alike. May you know that the strongest One there is is also the kindest, and he is kind to you.',
    prayer:
      'Good Shepherd, carry {name} close to your heart. Where the world moves too fast, set a gentle pace for {them}. Lead us too, as we care for {name}, and help us not to compare {their} path with anyone else’s. Thank you for your strength and your tenderness, both given to {name}. Amen.',
    talk: {
      little: 'Carry them for a moment and say: “God carries you close, like this.”',
      child: 'What helps you on days when everything feels too fast?',
      teen: 'Do you ever feel rushed to keep up? What pace feels right to you?',
      adult: 'Where do you feel pressure to keep up? What would going gently look like this week?',
    },
    ages: ALL,
    keywords: ['milestones', 'developmental delay', 'behind', 'slow', 'comparison', 'gentle', 'special needs', 'own pace'],
    notes:
      'The shepherd image describes God’s care for his people; apply by principle. Do not frame a child’s development as falling behind God’s plan.',
  },

  // ── Healing and hope ───────────────────────────────────────────
  {
    id: 'healing-mrk-10-51',
    topic: 'healing',
    ref: 'MRK 10:51',
    contextRef: 'MRK 10:46-52',
    contextNote:
      'Bartimaeus, a blind man begging by the road, calls out to Jesus while the crowd tells him to be quiet. Jesus stops, calls him over, and asks what he wants. He is healed and follows Jesus.',
    reflection:
      'Jesus does not hurry past the man the crowd wanted silenced. He stops and asks a real question: what do you want me to do for you? We are allowed to ask God honestly for healing, for relief from pain and for help, and to trust him with the answer.',
    blessing:
      'Jesus stops for you. He hears you even when others tell you to be quiet. May you always feel free to tell him what you need, and may he give you comfort, strength and relief from what hurts. May you be met with his kindness in every waiting room, every therapy and every hard day.',
    prayer:
      'Jesus, you stopped for Bartimaeus, and you see {name} too. We ask you honestly for healing for {name}, for relief from pain and for strength in {their} body. Give the doctors and therapists wisdom and kindness. Whatever your answer, help us trust your love, and keep {name} close to you. Amen.',
    talk: {
      little: 'Hold their hand and pray simply: “Jesus, please help {name} feel better.”',
      child: 'If Jesus asked you, “What do you want me to do for you?”, what would you say?',
      teen: 'What would you ask Jesus for, if you could ask for anything for yourself?',
      adult: 'What would you ask God for, honestly, if he asked you today? Can I pray that with you?',
    },
    ages: ALL,
    occasions: ['surgery', 'illness'],
    keywords: ['healing', 'pray for healing', 'therapy', 'pain', 'seizures', 'surgery', 'hospital', 'doctor'],
    notes:
      'Jesus’ healings are signs of his kingdom, not a promise that every prayer for healing will be answered in the same way. Never imply healing depends on faith, or that a child is less whole without it.',
  },
  {
    id: 'healing-jhn-9-2',
    topic: 'healing',
    ref: 'JHN 9:2-3',
    contextRef: 'JHN 9:1-7',
    contextNote:
      'Jesus’ disciples see a man blind from birth and ask whose sin caused it, his own or his parents’. Jesus rejects the question entirely: no one is to blame. He then heals the man as a sign of God’s work.',
    reflection:
      'Many parents carry a quiet fear that they caused their child’s disability, or that someone did. Jesus answers that fear plainly: no one sinned to cause this. Our children are not punishments, and we are not being punished; God is at work in their lives, too.',
    blessing:
      'Nothing about you is anyone’s fault, and nothing about you is a punishment. You are a gift. May God’s goodness be seen in your life in big ways and small ones, and may you grow up free from shame. May you know that you are loved, not in spite of who you are, but as you are.',
    prayer:
      'Lord Jesus, you said no one was to blame. Free us from guilt that does not belong to us, and free {name} from any shame the world tries to put on {them}. Heal what needs healing in {name}, in body and in heart. Let your goodness be seen in {their} life, and help us see it too. Amen.',
    talk: {
      little: 'Rest your hand on their head and whisper: “You are a gift.”',
      child: 'Has anyone ever made you feel like something about you was your fault?',
      teen: 'Do you ever feel blamed for things you can’t control? I’m here to listen.',
      adult: 'Is there guilt you have been carrying that isn’t yours to carry? Can we pray about it?',
    },
    ages: ALL,
    keywords: ['guilt', 'my fault', 'blame', 'why did this happen', 'born with', 'disability', 'genetic', 'special needs'],
    notes:
      '“So that the works of God would be displayed” must never be read as God causing disability for a lesson; the main point is the rejection of blame. Do not promise physical healing.',
  },
  {
    id: 'healing-2co-12-9',
    topic: 'healing',
    ref: '2CO 12:9',
    contextRef: '2CO 12:7-10',
    contextNote:
      'Paul describes a “thorn in the flesh” that caused him real pain. He pleaded with God three times to take it away. God did not, but answered that his grace was enough, and that his power shows itself in weakness.',
    reflection:
      'Paul asked for healing more than once, and he was honest that the answer was not what he hoped. God did not shame him for asking or for struggling. When healing does not come the way we pray, grace still comes, and strength can show up in ways we did not expect.',
    blessing:
      'God’s grace is enough for you, on strong days and hard ones. You never have to pretend to be fine with him. May his strength meet you exactly where you feel weakest. May you discover that his love does not wait for you to be well; it is here for you right now.',
    prayer:
      'Father, like Paul, we keep asking you for healing for {name}, and we will keep asking. Where the answer is not yet, give {name} grace that is enough for today. Meet {name} with strength in the hard places. Keep our hearts honest with you and soft toward {name}, whatever comes. Amen.',
    talk: {
      little: 'Hold them gently and say: “God’s love is here, right now.”',
      child: 'What is hard for you right now? We can tell God together.',
      teen: 'Is it hard to keep praying when things don’t change? You can be honest with me.',
      adult: 'How are you holding up with what hasn’t changed? You can be honest with me.',
    },
    ages: ALL,
    occasions: ['illness'],
    keywords: ['unanswered prayer', 'chronic', 'no healing', 'pain', 'weakness', 'disability', 'tired of praying', 'grace'],
    notes:
      'The thorn is never identified; do not equate it with a specific disability. Paul’s weakness is not presented as a failure of faith, and grace does not mean we stop asking.',
  },
  {
    id: 'healing-rev-21-4',
    topic: 'healing',
    ref: 'REV 21:4',
    contextRef: 'REV 21:1-5',
    contextNote:
      'John is shown a vision of the new heaven and new earth at the end of the story. God lives among his people and makes everything new. There will be no more death, mourning, crying or pain.',
    reflection:
      'This is the hope underneath every prayer for healing. One day God will wipe away every tear and end every pain. Until then, our prayers for healing are honest and our waiting is real, but the last word belongs to God, and it is good.',
    blessing:
      'One day there will be no more tears and no more pain, and God himself will wipe your eyes. Until that day, may you know comfort in every hard moment. May hope stay with you, quiet and steady. And may you know that, then and now, you are held by a love that will never let you go.',
    prayer:
      'God of all comfort, thank you for the day when you will make everything new. Until then, bring comfort to {name} in the hard days and relief from pain wherever it hurts. Keep hope alive in {their} heart and in ours. Hold {name} close while we wait. Amen.',
    talk: {
      little: 'Wipe their cheek gently and say: “One day, God will wipe away every tear.”',
      child: 'What do you think will be the best thing about the day God makes everything new?',
      teen: 'What gives you hope on the hard days?',
      adult: 'What keeps you hoping on the hard days? What can I carry with you?',
    },
    ages: ALL,
    keywords: ['hope', 'pain', 'heaven', 'chronic illness', 'tears', 'suffering', 'healing', 'someday'],
    notes:
      'Future hope is not a reason to dismiss present pain or present care. Avoid suggesting disabled bodies are only “fixed” in heaven; keep the focus on the end of pain, sorrow and death.',
  },

  // ── Strength for caregivers ────────────────────────────────────
  {
    id: 'caregiver-strength-isa-40-28',
    topic: 'caregiver-strength',
    ref: 'ISA 40:28-29',
    contextRef: 'ISA 40:27-31',
    contextNote:
      'God’s people in exile feel overlooked, saying their struggle is hidden from God. Isaiah answers that the everlasting God never grows tired, and that he gives strength to the weary and power to the weak.',
    reflection:
      'Caregiving can feel endless: appointments, sleepless nights, meetings and phone calls nobody else sees. Isaiah speaks to people who felt exactly that unseen. The God who never tires notices the tired, and he gives strength to those who have run out.',
    blessing:
      'You are seen. Every sleepless night and every phone call, every meeting and every quiet act of love is noticed by God. May he give you strength when yours is gone. May you rest without guilt, ask for help without shame, and find that you are carried as you carry others.',
    prayer:
      'God everlasting, you never grow tired, but {name} does. Give {name} strength for today and rest for tonight. Send people who will share the load, and help {name} to accept their help. Remind {name} that {their} quiet faithfulness is seen by you, every single day. Amen.',
    talk: {
      child: 'What is one thing that makes your days easier? I’d love to help with it.',
      teen: 'What is one thing that makes your days easier? I’d love to help with it.',
      adult: 'What is one thing I could take off your plate this week?',
    },
    ages: ['young-adult', 'adult'],
    keywords: ['caregiver', 'exhausted', 'tired', 'burnout', 'special needs parent', 'no sleep', 'overwhelmed', 'respite'],
    notes:
      'Originally addressed to Israel in exile; apply by principle. Do not shame tiredness or imply a faithful caregiver should never need rest or help.',
  },
  {
    id: 'caregiver-strength-mat-11-28',
    topic: 'caregiver-strength',
    ref: 'MAT 11:28-30',
    contextRef: 'MAT 11:25-30',
    contextNote:
      'Jesus invites people who are worn out by heavy religious burdens to come to him. He describes himself as gentle and humble, and offers rest for the soul and a load that is shared.',
    reflection:
      'Jesus does not add another task to a caregiver’s list. He offers rest, and he calls himself gentle. A yoke was built for two, so the picture is of a load carried together, not alone.',
    blessing:
      'Come and rest. You do not have to carry everything by yourself. May Jesus take the heaviest part of today’s load, and may you find his gentleness in the middle of the hard work of love. May there be moments of real rest for your body and your soul this week.',
    prayer:
      'Jesus, you invite the weary to come to you, and {name} is weary. Give {name} rest that reaches the soul. Take the heaviest part of the load, and show us how to share it too. Let {name} feel your gentleness in the hard moments, and know that {name} is not carrying this alone. Amen.',
    talk: {
      child: 'What would a really restful day look like for you?',
      teen: 'What would a really restful day look like for you?',
      adult: 'When did you last truly rest? Could we plan a little rest for you this week?',
    },
    ages: ['young-adult', 'adult'],
    keywords: ['weary', 'rest', 'caregiver', 'special needs mom', 'special needs dad', 'burden', 'carrying everything', 'alone'],
    notes:
      'Jesus’ invitation is to all who are weary; it does not promise an easy life. The shared yoke can also encourage practical help from others.',
  },
  {
    id: 'caregiver-strength-gal-6-9',
    topic: 'caregiver-strength',
    ref: 'GAL 6:9',
    contextRef: 'GAL 6:1-10',
    contextNote:
      'Paul encourages the churches in Galatia to carry each other’s burdens and to keep doing good, even when it is tiring and no one seems to notice. He promises that good done in love is never wasted.',
    reflection:
      'Much of a caregiver’s work is unseen and repeated: the same routines, the same therapies, the same patience, day after day. Paul says that faithfulness like this is not wasted. He also says to carry one another’s burdens, so this verse is also an invitation to let others carry some of yours.',
    blessing:
      'The love you give is not wasted. Every routine, every repeated word and every patient moment is good work in God’s eyes. When you feel like giving up, may you find fresh strength. May you see the good that is growing, even slowly, and may others help you carry the load.',
    prayer:
      'Lord, {name} is doing faithful, tiring, often unseen work. Do not let {them} lose heart. Let {name} see signs of the good that is growing. Bring friends, family and community who will share the burden. Give {name} joy in small victories and grace on the days that go badly. Amen.',
    talk: {
      child: 'What is one small win from this week that we can celebrate?',
      teen: 'What is one small win from this week that we can celebrate?',
      adult: 'What small win from this week can we celebrate together?',
    },
    ages: ['young-adult', 'adult'],
    keywords: ['giving up', 'discouraged', 'caregiver', 'therapy', 'routine', 'progress', 'small wins', 'special needs parent'],
    notes:
      'The “harvest” is not a promise of a particular developmental outcome. Keep the emphasis on faithfulness, community and God’s care.',
  },
  {
    id: 'caregiver-strength-mrk-2-3',
    topic: 'caregiver-strength',
    ref: 'MRK 2:3-4',
    contextRef: 'MRK 2:1-12',
    contextNote:
      'A man who cannot walk is carried to Jesus by four friends. When the crowd blocks the way, they open the roof and lower him down. Jesus sees their faith, forgives the man, and then heals him.',
    reflection:
      'Four friends refused to let a crowd keep someone they loved from Jesus. Caregivers know this kind of love: finding a way when there is no easy way in. This story also reminds us that no one carried the mat alone; we were made to carry each other.',
    blessing:
      'Your love keeps finding a way. When doors are closed and the way is blocked, may you find creative courage and good friends to carry with you. May you know that bringing someone you love to Jesus is holy work. And may someone carry you, too, when you need it.',
    prayer:
      'Jesus, thank you for the love that carries {name}’s family through every closed door. Give {name} friends like the four on the roof, who will help carry the load. Open doors in schools, clinics and churches. And when {name} is too tired to carry anyone, carry {them}. Amen.',
    talk: {
      child: 'Who are the people who help carry our family? Let’s thank God for them.',
      teen: 'Who has helped carry you through something hard?',
      adult: 'Who are the four friends on your roof? Is there someone we could ask for help?',
    },
    ages: ['young-adult', 'adult'],
    keywords: ['support', 'friends', 'community', 'advocate', 'iep meeting', 'closed doors', 'caregiver', 'help'],
    notes:
      'Jesus forgives the man before healing him, but this is never a link between disability and sin (see John 9:3). Keep the focus on the friends’ love and the shared carrying.',
  },

  // ── Worry and the future ───────────────────────────────────────
  {
    id: 'worry-and-future-isa-46-4',
    topic: 'worry-and-future',
    ref: 'ISA 46:4',
    contextRef: 'ISA 46:1-4',
    contextNote:
      'Isaiah contrasts the idols of Babylon, which have to be carried by tired animals, with the living God, who carries his people from birth to old age. God is the one who carries, not the one who must be carried.',
    reflection:
      'One of the deepest worries for many parents is who will care for their child when they are older, or gone. This passage does not answer every practical question, but it answers the deepest one: God carried this child from birth and will carry them into old age.',
    blessing:
      'God has carried you since before you were born, and he will carry you all your life. When you are grown, and when you are old, his care will still be there. May you always be surrounded by people who love you well. May you never, for one day, be without his care.',
    prayer:
      'Father, you carry {name} from birth to old age. We give you our fears about {their} future: who will care for {them}, where {name} will live, and who will understand {them}. Give us wisdom to plan well, and faith to rest in you. Surround {name} with faithful love all {their} life. Amen.',
    talk: {
      little: 'Pick them up gently and say: “God carries you, today and always.”',
      child: 'Who are the people who take care of you? Let’s thank God for each one.',
      teen: 'When you think about the future, what are you looking forward to?',
      adult: 'What do you hope your life looks like in a few years? How can I help?',
    },
    ages: ALL,
    keywords: ['future', 'who will care', 'adulthood', 'guardianship', 'when i’m gone', 'worry', 'long term', 'special needs'],
    notes:
      'Originally a word to Israel; applied by principle to God’s lifelong care. Prayer is never a substitute for practical planning; the prayer asks for wisdom to plan.',
  },
  {
    id: 'worry-and-future-mat-6-34',
    topic: 'worry-and-future',
    ref: 'MAT 6:34',
    contextRef: 'MAT 6:25-34',
    contextNote:
      'In the Sermon on the Mount, Jesus speaks to ordinary people worried about food and clothes. He points to birds and flowers cared for by God, and invites them to seek God first and take life one day at a time.',
    reflection:
      'Worry about the future can steal the strength we need for today. Jesus does not shame worry; he gently brings us back to this day, with its own needs and its own grace. Tomorrow’s questions are real, but they can wait until tomorrow, and God will be there too.',
    blessing:
      'Today is enough. You do not have to carry tomorrow’s worries now. May you enjoy the good things in this day: a smile, a song, a meal, a moment of peace. May God give you everything you need for today, and may tomorrow find you held by the same love.',
    prayer:
      'Lord, we bring you our worries about {name}’s future: the next diagnosis, the next school, the next season. Help us to put them down for today. Give {name} everything needed for this day, and give us grace to enjoy who {name} is right now. Tomorrow belongs to you. Amen.',
    talk: {
      little: 'Look out the window together and name one good thing about today.',
      child: 'What was the best part of today? Tell me, or show me.',
      teen: 'What is one good thing about today, even a small one?',
      adult: 'What is one good thing about today we can thank God for together?',
    },
    ages: ALL,
    keywords: ['worry', 'anxious about the future', 'what if', 'diagnosis', 'next steps', 'one day at a time', 'special needs', 'fear'],
    notes:
      'Do not imply worry is sin or that planning is a lack of faith. Jesus’ point is trust in God’s daily care, not passivity.',
  },
  {
    id: 'worry-and-future-lam-3-22',
    topic: 'worry-and-future',
    ref: 'LAM 3:22-23',
    contextRef: 'LAM 3:19-24',
    contextNote:
      'Lamentations is a book of grief after Jerusalem’s fall. In the middle of honest sorrow, the poet remembers that God’s love has not run out and that his mercies are new every morning.',
    reflection:
      'Hope here does not come from pretending things are fine. It comes in the middle of lament, from remembering God’s faithful love. Hard nights are real, and mornings still come, each with fresh mercy for the day ahead.',
    blessing:
      'Every morning God has new mercy for you. Whatever happened yesterday, today is a fresh start, and his love has not run out. May you wake up to his kindness. May each new day bring small gifts, gentle surprises and enough grace for whatever comes.',
    prayer:
      'Faithful God, after hard days and long nights, thank you for new mercy every morning. Meet {name} at the start of each day with your love. Give {them} good mornings, gentle routines and peace. And give us fresh hope, too, because your faithfulness to {name} has never failed. Amen.',
    talk: {
      little: 'In the morning, open the curtains together and say: “New mercies today.”',
      child: 'What would make tomorrow morning a good one for you?',
      teen: 'Is there something from yesterday you’d like a fresh start on?',
      adult: 'After the week we have had, what would a good fresh start look like?',
    },
    ages: ALL,
    keywords: ['hard night', 'bad day', 'fresh start', 'morning', 'hope', 'meltdown', 'exhausted', 'special needs'],
    notes:
      'Written in the context of national grief; the hope is God’s steadfast love, not a promise that every day will be easy.',
  },
  {
    id: 'worry-and-future-php-1-6',
    topic: 'worry-and-future',
    ref: 'PHP 1:6',
    contextRef: 'PHP 1:3-11',
    contextNote:
      'Paul writes from prison to a church he loves. He is confident that God, who started a good work in them, will keep working until it is complete. His confidence rests on God, not on their progress.',
    reflection:
      'Progress for our children can be slow, uneven or invisible to others. Paul’s confidence is not in steady progress but in a faithful God who keeps working. We can stop measuring our children against charts and trust the One who began a good work in them.',
    blessing:
      'God is not finished with you, and he is not in a hurry. The good work he started in you, he will keep doing. May you grow in your own way and your own time. May you know joy in each small step, and may you always know how proud we are of you.',
    prayer:
      'Lord, you began a good work in {name}, and you will keep at it. Free us from comparing {name}’s progress with anyone else’s. Help us notice and celebrate every small step. Keep working in {name}’s heart, and let {them} grow in love for you, in {their} own way and time. Amen.',
    talk: {
      little: 'Clap for one small thing they did today and say: “I’m proud of you.”',
      child: 'What is something you can do now that was hard before?',
      teen: 'What is something you have grown in this year, even if no one noticed?',
      adult: 'Where have you seen growth this year, even slow growth? Can we celebrate it?',
    },
    ages: ALL,
    keywords: ['progress', 'milestones', 'slow progress', 'regression', 'comparison', 'therapy', 'growth', 'special needs'],
    notes:
      'The “good work” is God’s work in believers, not a promise about particular developmental milestones. Celebrate the child without making progress a condition of love.',
  },
];
