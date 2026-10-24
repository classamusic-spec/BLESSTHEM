import type { CuratedEntry } from '../types.ts';

/**
 * Uniquely Made, deeper: further entries for families raising a child with a disability,
 * autism or other special needs, plus everyday moments (birthdays, sleep, protection) seen
 * through that lens. The child is whole and loved now, never a problem to fix. Healing is
 * asked for honestly, never promised. Disability is never linked to sin or to anyone’s faith.
 * Talk prompts leave room for children who answer without words.
 */
const ALL = ['baby', 'preschool', 'elementary', 'tween', 'teen', 'young-adult', 'adult'] as CuratedEntry['ages'];

export const entries: CuratedEntry[] = [
  // ── Wonderfully made ───────────────────────────────────────────
  {
    id: 'wonderfully-made-gen-1-27',
    topic: 'wonderfully-made',
    ref: 'GEN 1:27',
    contextRef: 'GEN 1:26-31',
    contextNote:
      'At the start of the Bible, God makes people last of all, and makes them in his own image. Then he looks at everything he has made and calls it very good. This is said of humanity as a whole, before anyone had achieved anything.',
    reflection:
      'Every person carries God’s image, and nothing in a diagnosis can remove it. That image is not found in speed, speech or independence; it was given, not earned. When others see only what a child cannot do, this passage invites us to look again and see someone who reflects God.',
    blessing:
      'You carry the image of God, the very first gift he gave to people. No label, no test and no hard day can take it from you. May you see something of God’s goodness when you look at yourself, and may others see it in you too. You were made good, on purpose and with love.',
    prayer:
      'God our Creator, thank you that {name} bears your image. Open our eyes to see you reflected in {them}: in {their} laugh, {their} focus, {their} way of meeting the world. Where others overlook {name}, let them look again. Help us honor {name} the way you do, with delight and deep respect. Amen.',
    talk: {
      little: 'Touch their nose gently and say: “God made you, and God made you good.”',
      child: 'What is something about you that you think God made really well? Tell me or show me.',
      teen: 'Where do you see something of God in the way you are made?',
      adult: 'What part of who you are do you most wish others could see? I would love to hear.',
    },
    ages: ALL,
    keywords: ['image of god', 'worth', 'dignity', 'disability', 'autism', 'special needs', 'made good', 'value'],
    notes:
      'The image of God is shared by all people and is not tied to ability, intellect or speech. Do not use “very good” to deny real pain or the need for care.',
  },
  {
    id: 'wonderfully-made-psa-100-3',
    topic: 'wonderfully-made',
    ref: 'PSA 100:3',
    contextRef: 'PSA 100:1-5',
    contextNote:
      'A short song inviting the whole earth to worship with gladness. In the middle it gives the reason: the Lord made us, and we belong to him, like sheep cared for by their shepherd. It was sung by worshippers coming to the temple.',
    reflection:
      'Before this psalm says anything about what we do, it tells us whose we are. Belonging comes first. A child who does not fit the usual mold still fits here: made by God, and his. A shepherd knows each sheep, including the ones who wander, startle easily or move at their own pace.',
    blessing:
      'You belong to God. He made you, and you are his, today and always. May you feel that you belong wherever you go: at home, at church, at school and at the table. May you never have to earn a place, because you already have one. And may your own kind of joy, loud or quiet, always be welcome.',
    prayer:
      'Lord, you made {name}, and {name} is yours. Thank you that {their} place with you does not depend on fitting in. Make our home, our church and every room {name} enters a place of belonging. Teach us to welcome {their} joy however it sounds, and to guard {their} place among your people. Amen.',
    talk: {
      little: 'Hold them close and say: “You belong to God, and you belong with us.”',
      child: 'Where do you feel like you really belong? Tell me or show me.',
      teen: 'Where do you feel most at home, like you don’t have to explain yourself?',
      adult: 'Where do you feel you belong right now, and where is it harder? How can I pray for you?',
    },
    ages: ALL,
    keywords: ['belong', 'belonging', 'fit in', 'left out', 'church', 'inclusion', 'special needs', 'autism'],
    notes:
      'The sheep image speaks of care and belonging, not passivity; do not use it to describe a disabled person as less capable. The psalm is addressed to all peoples.',
  },
  {
    id: 'wonderfully-made-psa-8-4',
    topic: 'wonderfully-made',
    ref: 'PSA 8:4-5',
    contextRef: 'PSA 8:1-9',
    contextNote:
      'David looks up at the night sky, at the moon and stars God has set in place, and is amazed that God pays attention to human beings at all. Yet God does more than notice: he has crowned people with glory and honor.',
    reflection:
      'Next to the stars, any of us could feel small. David’s wonder is that God cares anyway, and that he has given every person a crown of dignity. That honor does not rise or fall with test scores, therapy goals or what a child can do alone. It was placed there by God.',
    blessing:
      'God thinks of you, and he cares for you. The One who set the stars in place has crowned you with honor. May you carry that crown with quiet confidence wherever you go. May no one ever make you feel small, and may you always know how much you matter to the God who made the sky.',
    prayer:
      'Lord our Lord, how majestic you are, and how kind to care for {name}. Thank you for the honor you have given {them}. When the world treats {name} as less, help us treat {them} with the dignity you have given. Help {name} know {their} worth deep inside, and let wonder at your world fill {their} heart. Amen.',
    talk: {
      little: 'Look at the moon or stars together and whisper: “The God who made those loves you.”',
      child: 'What is something in the sky or in nature that amazes you? Tell me or show me.',
      teen: 'When do you feel small, and what helps you remember that you matter?',
      adult: 'Where do you feel your dignity gets overlooked? How can I honor you better?',
    },
    ages: ALL,
    keywords: ['dignity', 'worth', 'honor', 'matter', 'feel small', 'disability', 'special needs', 'value'],
    notes:
      'Hebrews 2 applies this psalm to Jesus; here it is used as David first sang it, about the dignity of every person. Dignity is given by God, never earned by ability.',
  },

  // ── Seen and understood ────────────────────────────────────────
  {
    id: 'seen-and-understood-gen-16-13',
    topic: 'seen-and-understood',
    ref: 'GEN 16:13',
    contextRef: 'GEN 16:7-14',
    contextNote:
      'Hagar, an enslaved Egyptian woman, has run away into the desert after being mistreated. The angel of the Lord finds her by a spring and speaks to her by name. In response, she gives God a name of her own: the God who sees me.',
    reflection:
      'Hagar was easy to overlook: a servant, a foreigner, alone in the wilderness. Yet she is the first person in Scripture to give God a name, and she names him for seeing her. Children who are misread or left at the edge of things are seen just as clearly, and God does not look away.',
    blessing:
      'You are seen. When others misunderstand you or hurry past, God sees you clearly and kindly. May you feel his gaze as warm, never cold. May you be found in every lonely place, and may you meet people who see you as he does, noticing what you feel, what you love and who you are.',
    prayer:
      'God who sees, thank you that you see {name} fully, beyond every label and every wrong guess. When {name} is overlooked or misread, let {them} know that you see. Give us eyes like yours, so we notice what {name} is telling us, with words or without them. Bring people into {their} life who truly see {them}. Amen.',
    talk: {
      little: 'Look into their eyes with a smile and say: “I see you, and God sees you.”',
      child: 'When do you feel like people really see you? Tell me or show me.',
      teen: 'Who in your life seems to really get you? What do they do differently?',
      adult: 'When have you felt truly seen lately, and where do you feel invisible? I’d love to listen.',
    },
    ages: ALL,
    keywords: ['seen', 'overlooked', 'invisible', 'misunderstood', 'lonely', 'left out', 'autism', 'noticed'],
    notes:
      'Hagar’s story includes mistreatment and a hard instruction to return; never use it to counsel anyone to stay in mistreatment. Focus on God seeing and naming the overlooked.',
  },
  {
    id: 'seen-and-understood-psa-142-2',
    topic: 'seen-and-understood',
    ref: 'PSA 142:2-3',
    contextRef: 'PSA 142:1-7',
    contextNote:
      'David is hiding in a cave from those hunting him, feeling that no one cares for him. He pours out his trouble to God and takes comfort in this: even when his spirit grows faint, God knows the path he is on.',
    reflection:
      'When a child is overwhelmed, the world can feel like a cave: too loud, too bright, too much, and no one quite getting it. David found that God knew his way even when he could barely hold himself together. A meltdown is distress, not defiance, and God understands what is happening inside it.',
    blessing:
      'When everything is too much and your body or heart feels faint, God knows exactly where you are. You can pour it all out to him, with words, with tears or with no words at all. May you be met with gentleness in the hard moments, and may calm return to you, a little at a time.',
    prayer:
      'Lord, you know {name}’s way even when {name} is overwhelmed. When the world is too loud or too much, be near to {them}. Help us respond with patience instead of frustration, and help us understand what {name} needs. Bring calm to {their} body and peace to {their} heart. Thank you that you understand {name} completely. Amen.',
    talk: {
      little: 'Sit close in a quiet spot and whisper: “God knows. You are safe.”',
      child: 'What helps you most when big feelings spill over? Tell me or show me.',
      teen: 'When everything feels like too much, what helps? What doesn’t help?',
      adult: 'What has been overwhelming lately? You don’t have to explain it well. I am here.',
    },
    ages: ALL,
    keywords: ['meltdown', 'overwhelmed', 'sensory overload', 'big feelings', 'shutdown', 'autism', 'distress', 'too much'],
    notes:
      'David’s cave was a place of real danger from enemies; apply by principle. A meltdown or shutdown is distress, not defiance; never frame it as sin or a lack of faith.',
  },
  {
    id: 'seen-and-understood-1sa-1-13',
    topic: 'seen-and-understood',
    ref: '1SA 1:13-15',
    contextRef: '1SA 1:9-18',
    contextNote:
      'Hannah, grieving and longing for a child, prays silently at the house of the Lord. Her lips move but no sound comes out, and the priest Eli misjudges her as drunk. She explains that she has been pouring out her soul to the Lord. Later, God answers her prayer.',
    reflection:
      'Eli watched Hannah’s mouth and got her completely wrong. God listened to her heart and understood. Many children are misjudged the same way: their silence is mistaken for not caring, their movements for misbehavior. A prayer without spoken words is still a prayer, and God hears it.',
    blessing:
      'God hears you, with words or without them. When your voice does not come, or comes in a different way, your heart still speaks to him. May the people around you look past their first guess and take time to understand you. And may you always know that every prayer you pour out is heard.',
    prayer:
      'Lord, you heard Hannah when no one else understood her. Hear {name} too, in every sound, sign, look and silence. Forgive us for the times we have guessed wrong about what {name} meant. Give {name} people who take time to understand, and give {them} ways to share what is in {their} heart. Amen.',
    talk: {
      little: 'Hold their hands and pray quietly together: “God, you hear my heart.”',
      child: 'Did you know you can pray without saying words out loud? What would you tell God?',
      teen: 'Has anyone gotten you wrong lately? What did you wish they understood?',
      adult: 'Is there something you have struggled to put into words? I’m happy to sit with you while you find them.',
    },
    ages: ALL,
    keywords: ['nonverbal', 'non-speaking', 'misunderstood', 'silent prayer', 'communication', 'aac', 'judged', 'autism'],
    notes:
      'Hannah’s story is about grief and infertility; the point applied here is that God hears silent prayer and understands when people misjudge. Do not promise the outcome Hannah received.',
  },

  // ── Healing and hope ───────────────────────────────────────────
  {
    id: 'healing-mrk-7-33',
    topic: 'healing',
    ref: 'MRK 7:33-35',
    contextRef: 'MRK 7:31-37',
    contextNote:
      'People bring Jesus a deaf man who can hardly speak. Rather than heal him in front of the crowd, Jesus takes him aside, communicates through touch, looks up to heaven and sighs. Then the man hears and speaks plainly.',
    reflection:
      'Before the miracle comes the gentleness. Jesus moves the man away from the crowd and speaks to him in a way he can understand, through touch. He treats him as a person, not a spectacle. We can ask honestly for healing, and also ask for that same gentleness in every clinic, therapy and treatment room.',
    blessing:
      'May Jesus meet you gently, the way he met the man away from the crowd. May the people who care for you be patient and kind, and treat you as a person, never a project. We ask God for healing where you hurt and help where things are hard. And whatever comes, may you know you are loved and understood.',
    prayer:
      'Jesus, you took a man aside, away from the noise, and cared for him in a way he could understand. Please care for {name} like that. We ask honestly for healing, for relief and for help with what is hard. Give everyone who treats {name} patience and respect. Meet {them} in quiet places, and hold {them} close whatever the answer. Amen.',
    talk: {
      little: 'Find a quiet spot, hold them gently and say: “Jesus is kind to you.”',
      child: 'What helps you feel calm at the doctor or at therapy? Tell me or show me.',
      teen: 'What would make appointments or treatments feel more respectful to you?',
      adult: 'What would help you feel more cared for in all the appointments? How can I pray for you?',
    },
    ages: ALL,
    occasions: ['illness'],
    keywords: ['healing', 'therapy', 'doctor', 'hospital', 'deaf', 'hearing', 'speech', 'appointments'],
    notes:
      'This is a sign of who Jesus is, not a promise that every deaf or non-speaking person will be cured, or should want to be. Deafness and non-speaking are not lesser ways of being; pray for what the person and family want.',
  },
  {
    id: 'healing-mat-26-39',
    topic: 'healing',
    ref: 'MAT 26:39',
    contextRef: 'MAT 26:36-42',
    contextNote:
      'On the night before his death, Jesus prays in the garden of Gethsemane, overwhelmed with sorrow. He asks his Father plainly to take the suffering away if it is possible, and then entrusts himself to his Father’s will. He prays this more than once.',
    reflection:
      'Jesus shows us that asking for the hard thing to be taken away is not a lack of faith. He asked honestly, more than once, in deep distress. And he also placed himself in his Father’s hands. Both prayers belong together: please take this away, and we trust you with the answer.',
    blessing:
      'You can tell God exactly what you want, even when it is big and even when you have asked before. Jesus did the same. May you never be afraid to ask him for help, for comfort or for healing. And may you feel his love underneath you, steady and sure, whatever the answer turns out to be.',
    prayer:
      'Father, like Jesus in the garden, we ask you plainly: if it is possible, take away what is hurting {name}. Bring healing, ease the pain and lift the hard things. We mean it, and we will keep asking. And we put {name} into your hands, because your love for {them} is deeper than ours. Hold us steady in the waiting. Amen.',
    talk: {
      little: 'Fold their hands in yours and pray simply: “Please help, God. We trust you.”',
      child: 'Is there something you keep asking God for? We can ask together again today.',
      teen: 'Is it hard to keep asking God for the same thing? What has that been like?',
      adult: 'What have you been asking God for, over and over? Can I ask with you today?',
    },
    ages: ALL,
    occasions: ['surgery', 'illness'],
    keywords: ['pray for healing', 'unanswered prayer', 'asking again', 'surrender', 'pain', 'illness', 'trust', 'waiting'],
    notes:
      'Jesus’ prayer concerns his unique death for the world; apply by principle to honest asking and trust. Never use “your will be done” to discourage asking for healing or to suggest suffering is good in itself.',
  },
  {
    id: 'healing-jer-17-14',
    topic: 'healing',
    ref: 'JER 17:14',
    contextRef: 'JER 17:12-17',
    contextNote:
      'Jeremiah has been mocked and opposed for years for speaking God’s word. In this personal prayer he asks God to heal and save him, trusting that real healing comes from God alone, while admitting how hard things are and asking God to be his refuge.',
    reflection:
      'Jeremiah’s prayer is short and honest. He does not pretend he is fine, and he does not look for healing anywhere other than God. We can pray this over our children’s bodies and our own hearts: heal what needs healing, and be our refuge on the hard days, whatever they bring.',
    blessing:
      'May God be your healer and your safe place. Where your body hurts, may he bring relief. Where your heart is tired or sore, may he bring comfort. May you always know that you can bring him everything, and may you find, again and again, that his love is a refuge you can run into.',
    prayer:
      'Lord, heal {name}. Where there is pain, bring relief; where there is illness, bring healing; where there is fear, bring peace. We look to you first, and we thank you for the doctors, nurses and therapists who are part of your care. Be {name}’s refuge in the hard days, and our refuge too. Amen.',
    talk: {
      little: 'Rest your hand where it hurts and pray: “Lord, please heal and comfort {name}.”',
      child: 'Where do you feel sore or tired today? Tell me or show me, and we will pray.',
      teen: 'Is anything hurting, in your body or your heart, that you want me to pray about?',
      adult: 'What is hurting most right now, in body or heart? Can I pray with you about it?',
    },
    ages: ALL,
    occasions: ['illness'],
    keywords: ['heal', 'healing', 'pain', 'sick', 'chronic pain', 'seizures', 'refuge', 'comfort'],
    notes:
      'Jeremiah’s plea concerns his whole distress, not a specific illness; it is a prayer, not a promise of physical healing. Never suggest that healing depends on how well someone prays.',
  },

  // ── Strength for caregivers ────────────────────────────────────
  {
    id: 'caregiver-strength-exo-17-12',
    topic: 'caregiver-strength',
    ref: 'EXO 17:12',
    contextRef: 'EXO 17:8-13',
    contextNote:
      'As Israel fights the Amalekites, Moses stands on a hill holding up his hands. When his arms grow tired, Aaron and Hur sit him on a stone and hold his hands up, one on each side, until the sun goes down.',
    reflection:
      'Even Moses could not hold his arms up all day. The story does not shame him for growing tired; it shows friends who notice and step in, and a stone to sit on. Caregivers are not meant to carry everything alone, and receiving help is part of faithfulness, not a failure of it.',
    blessing:
      'You were never meant to hold everything up on your own. May God send you people who notice when your arms are heavy and quietly step in, one on each side. May you find a place to sit and rest. And may you receive help without guilt, knowing that being held up is part of how love works.',
    prayer:
      'Lord, {name}’s arms are tired. Send {them} people like Aaron and Hur: friends, family, respite workers and neighbors who see what is needed and step in. Give {name} the courage to ask and the grace to receive. Provide a place to sit and breathe. Hold {name} steady until the sun goes down today. Amen.',
    talk: {
      child: 'What is one way I could help you today?',
      teen: 'Who holds your arms up when you are tired? Is there someone you could ask?',
      adult: 'Where are your arms heaviest right now? What is one thing I could hold for you this week?',
    },
    ages: ['young-adult', 'adult'],
    keywords: ['caregiver', 'tired', 'need help', 'respite', 'support', 'asking for help', 'burnout', 'special needs parent'],
    notes:
      'The battle setting is specific to Israel’s history; the principle is shared strength and support. Do not suggest that tiredness reflects weak faith.',
  },
  {
    id: 'caregiver-strength-psa-68-19',
    topic: 'caregiver-strength',
    ref: 'PSA 68:19',
    contextRef: 'PSA 68:15-20',
    contextNote:
      'This song celebrates God’s power and his closeness to his people as he leads them. In the middle of grand pictures of mountains and chariots comes a simple line of praise: the Lord bears our burdens day by day.',
    reflection:
      'Caregiving is daily: medications, routines, phone calls, the same tasks again tomorrow. This psalm says God’s help is daily too. He does not carry the load once and leave; he bears it with us each day. Today’s weight is enough to bring to him; tomorrow’s can wait.',
    blessing:
      'The Lord carries your burdens with you, day by day. May you feel the weight lighten, even a little, because you are not carrying it alone. May each morning bring enough strength for that day. And may you notice the moments, small and ordinary, when God’s help arrives right on time.',
    prayer:
      'Lord, blessed are you, for you bear our burdens every day. Carry what {name} carries today: the routines, the worries, the tasks no one else sees. Lighten {their} load through your presence and through people who help. Give {name} enough strength for this day, and let {them} leave tomorrow’s weight with you. Amen.',
    talk: {
      child: 'What is one job I could do to make today lighter for you?',
      teen: 'What feels heaviest for you today? Could I carry one piece of it?',
      adult: 'What is the heaviest part of your daily load? What is one piece I could carry?',
    },
    ages: ['young-adult', 'adult'],
    keywords: ['caregiver', 'daily grind', 'burden', 'heavy', 'routine', 'tired', 'one day at a time', 'special needs parent'],
    notes:
      'A hymn of Israel’s praise; apply by principle. God bearing our burdens never means a caregiver should not need human help or respite.',
  },
  {
    id: 'caregiver-strength-mrk-6-31',
    topic: 'caregiver-strength',
    ref: 'MRK 6:31',
    contextRef: 'MRK 6:30-34',
    contextNote:
      'The disciples come back from a busy time of work. So many people are coming and going that they cannot even eat, and Jesus invites them to come away with him to a quiet place and rest. Even then, the crowd follows, and Jesus responds with compassion.',
    reflection:
      'Jesus noticed that his friends had not eaten, and he called them to rest. The crowds did not disappear, and the rest was shorter than they hoped. Caregivers live in that tension. Rest may be short and interrupted, but it is still invited, and Jesus himself offers it.',
    blessing:
      'Come away and rest a while. May you hear that invitation as kind, not as one more thing to do. May you find small quiet places in full days: a cup of tea, a walk, a few minutes alone. And when the rest is cut short, may you know that Jesus is still with you and still glad to care for you.',
    prayer:
      'Jesus, you noticed when your friends had no time to eat. You see that in {name} too. Make room for {name} to rest, even in small pieces, and protect those moments. Give {them} people who can step in so rest is possible. When interruptions come, keep {their} heart steady and kind. Thank you that {name} is cared for by you. Amen.',
    talk: {
      child: 'What could we do as a family so you get a little time to yourself?',
      teen: 'What does real rest look like for you? Can I help make space for it?',
      adult: 'If you had one quiet hour this week, what would you do with it? Let’s find it.',
    },
    ages: ['young-adult', 'adult'],
    keywords: ['rest', 'no time', 'busy', 'quiet', 'break', 'caregiver', 'tired', 'respite'],
    notes:
      'The invitation was spoken to the apostles after their mission; apply by principle. Avoid guilt: rest is not presented as another task to perform well.',
  },

  // ── Worry and the future ───────────────────────────────────────
  {
    id: 'worry-and-future-psa-73-23',
    topic: 'worry-and-future',
    ref: 'PSA 73:23-24',
    contextRef: 'PSA 73:21-26',
    contextNote:
      'Asaph has been bitter and confused, watching life seem unfair. When he comes to God, he admits how lost he felt, then realizes that God has been holding his hand all along and will keep guiding him to the end.',
    reflection:
      'The psalmist does not know the future, but he knows whose hand he is holding. Families raising a child with extra needs often face a future that is hard to picture. We may not get a clear map, but we can know the guide, and he does not let go of our hand.',
    blessing:
      'God is holding your hand. Today, tomorrow and all the days you cannot see yet, he is with you. May you take each step without fear of what is ahead, because he will guide you. And may you know, even when the way is unclear, that you are never walking it alone.',
    prayer:
      'Lord, we cannot see {name}’s future, and sometimes that frightens us. Thank you that you hold {name}’s hand, and ours. Guide {name} with your wisdom through every change: school, growing up and the years beyond. Guide us too, as we make decisions for {them}. Keep {name} close to you all {their} life. Amen.',
    talk: {
      little: 'Hold their hand while you walk and say: “God is holding your hand too.”',
      child: 'What is something coming up that you wonder about? Tell me or show me.',
      teen: 'When you think about the future, what feels hopeful and what feels hard?',
      adult: 'What part of the future feels foggiest right now? Can we pray about it together?',
    },
    ages: ALL,
    keywords: ['future', 'what if', 'unknown', 'next steps', 'growing up', 'guidance', 'worry', 'transitions'],
    notes:
      '“Receive me to glory” refers to the psalmist’s hope beyond this life; do not use it to speak of a child’s death. Guidance here is a song of trust, not a forecast of particular outcomes.',
  },
  {
    id: 'worry-and-future-heb-13-5',
    topic: 'worry-and-future',
    ref: 'HEB 13:5-6',
    contextRef: 'HEB 13:1-8',
    contextNote:
      'The writer of Hebrews closes with practical encouragement for believers under pressure. He tells them not to cling to money for security, and reminds them of God’s words to Joshua and to Israel: he will never leave or forsake his people.',
    reflection:
      'Much of our worry about the future is really a search for security: enough savings, the right services, the right plan for when we are gone. Those things matter, and planning well is wise. But this passage reminds us that our deepest security is the God who has promised never to leave his people.',
    blessing:
      'God will never leave you. Through every change and every year, he stays. May you know a calm, steady confidence that does not depend on everything being in place. May you be surrounded by people who love you all your life, and may you always know that the Lord is your helper.',
    prayer:
      'Lord, we worry about who will care for {name} in the years ahead, and what will happen when we cannot. Give us wisdom to plan well, and peace that does not rest only on our plans. Surround {name} with faithful people all {their} life. Above all, thank you for your promise never to leave {name}. Be {their} helper always. Amen.',
    talk: {
      little: 'Hug them tight and say: “God will never leave you.”',
      child: 'Who are some of the people who love and help you? Tell me or show me.',
      teen: 'Who are the people you trust most to have your back?',
      adult: 'What worries you most about the years ahead? I would like to pray about it with you.',
    },
    ages: ALL,
    keywords: ['who will care', 'future planning', 'long term', 'security', 'when i am gone', 'never leave', 'worry', 'adult children'],
    notes:
      'The promise echoes God’s words to Israel and Joshua (Deu 31:6), applied in Hebrews to all believers. Do not discourage practical planning; the point is where ultimate security rests.',
  },
  {
    id: 'worry-and-future-psa-46-1',
    topic: 'worry-and-future',
    ref: 'PSA 46:1-2',
    contextRef: 'PSA 46:1-7',
    contextNote:
      'A song of God’s people in Jerusalem in a time of upheaval. They picture the whole world shaking, with mountains falling into the sea, and still declare that God is their refuge and strength, a help who is always near in trouble.',
    reflection:
      'The psalm does not pretend the ground is steady. It imagines the worst kind of upheaval and still finds God present in it. A new diagnosis, a school change or the move into adulthood can feel like the earth shifting. God does not promise to stop every change, but he is near inside it.',
    blessing:
      'God is your safe place and your strength. When things change around you, when routines move and plans fall through, he does not move. May you feel steady inside even when the world feels shaky. May you know his help is near, not far away, and may peace stay with you through every change.',
    prayer:
      'God our refuge, change is hard for {name}, and sometimes for us too. When routines shift and the ground feels unsteady, be {name}’s safe place and strength. Prepare {them} gently for what is coming. Give us patience and creativity to help {name} through transitions, and remind us all that you are near in every one. Amen.',
    talk: {
      little: 'Hold them steady in your arms and say: “God is my safe place.”',
      child: 'What helps you most when plans change? Tell me or show me.',
      teen: 'What change coming up feels the biggest? How can I help you get ready?',
      adult: 'What change ahead feels most unsettling? How can I support you through it?',
    },
    ages: ALL,
    keywords: ['change', 'routine', 'transition', 'new diagnosis', 'upheaval', 'unsettled', 'autism', 'refuge'],
    notes:
      'The psalm celebrates God’s presence with Jerusalem; apply by principle. It does not promise that upheaval will not come.',
  },

  // ── Birthdays ──────────────────────────────────────────────────
  {
    id: 'birthdays-psa-65-11',
    topic: 'birthdays',
    ref: 'PSA 65:11',
    contextRef: 'PSA 65:9-13',
    contextNote:
      'This harvest song praises God for watering the land and making it grow. At the end of the year, the fields and hills seem to sing. The psalmist pictures God placing a crown of goodness on the whole year.',
    reflection:
      'A birthday is a good moment to look back and notice the goodness God has crowned the year with. It may not be measured in milestones reached on time. A new word, a hard thing faced, a friendship, a laugh: these are the harvest too, and they are worth celebrating.',
    blessing:
      'Happy birthday. May you look back on this year and see how much goodness filled it, big and small. May the year ahead be crowned with good things too: joy, rest, friendship and growth at your own pace. You are a gift, and today we celebrate you exactly as you are.',
    prayer:
      'Father, thank you for {name} and for this past year of {their} life. You crowned it with goodness, even in the hard parts. Thank you for every step {name} has taken, every new thing {name} has learned and every joy {name} has brought us. Bless the year ahead with gladness and growth, and keep {name} close to you. Amen.',
    talk: {
      little: 'Hold up a finger for each year and say: “Thank you, God, for every one.”',
      child: 'What was your favorite thing about this past year? Tell me or show me.',
      teen: 'What are you most proud of from this past year?',
      adult: 'Looking back on this year, what good thing surprised you most?',
    },
    ages: ALL,
    occasions: ['birthday'],
    keywords: ['birthday', 'another year', 'celebrate', 'milestones', 'looking back', 'thankful', 'growth', 'goodness'],
    notes:
      'A harvest psalm of thanksgiving; do not frame a good year as material plenty. Avoid comparing a child’s year with typical milestones.',
  },
  {
    id: 'birthdays-luk-1-58',
    topic: 'birthdays',
    ref: 'LUK 1:58',
    contextRef: 'LUK 1:57-66',
    contextNote:
      'Elizabeth, long unable to have children, gives birth to John, and neighbors and family gather to celebrate with her. His father Zechariah, unable to speak for months, joins in by writing the baby’s name on a tablet, and then praises God.',
    reflection:
      'A birth is meant to be shared. Elizabeth’s neighbors and family came to rejoice with her, and even Zechariah, without his voice, found a way to take part. Every birthday is a chance to gather around someone and celebrate the mercy of their life, however they join in.',
    blessing:
      'The day you were born was a day for joy, and today is too. May you be surrounded by people who are glad you are here. May you feel celebrated in a way that suits you, loud or gentle, crowded or quiet. And may you know that your life is a gift God has given to all of us.',
    prayer:
      'Lord, thank you for the day {name} was born, and for the joy {name} has brought. Gather people around {name} who delight in {them}. Help us celebrate {name} in ways that bring {them} comfort and gladness, not overwhelm. May this birthday remind {name} how deeply {name} is loved, by you and by us. Amen.',
    talk: {
      little: 'Hold them close and say: “We are so glad you were born.”',
      child: 'How would you like to celebrate today? Tell me or show me.',
      teen: 'What would make this birthday feel really good to you?',
      adult: 'Who would you love to celebrate with this year? How can we make the day feel good?',
    },
    ages: ALL,
    occasions: ['birthday'],
    keywords: ['birthday', 'celebrate', 'party', 'born', 'glad you were born', 'sensory friendly', 'family', 'joy'],
    notes:
      'John’s birth was a unique moment in God’s plan; apply by principle (a birth is cause for shared joy). Do not imply every family has a story of long waiting or answered prayer.',
  },
  {
    id: 'birthdays-psa-23-6',
    topic: 'birthdays',
    ref: 'PSA 23:6',
    contextRef: 'PSA 23:1-6',
    contextNote:
      'David, who once was a shepherd, describes the Lord as his shepherd through quiet fields and dark valleys alike. He ends by looking ahead: goodness and steadfast love will follow him all his days.',
    reflection:
      'The psalm ends with a picture of goodness and mercy following us, as if they were walking right behind. On a birthday, we look back at one year and forward to another. Whatever this next year holds, we can hope that God’s goodness will be close behind, every single day.',
    blessing:
      'As you start a new year of life, may goodness and kindness follow you everywhere you go. On easy days and hard ones, may God’s love be right behind you, close enough to catch you. And may you always know there is a home for you with him, a place where you belong forever.',
    prayer:
      'Good Shepherd, thank you for walking with {name} through another year. Let your goodness and mercy follow {name} into this new one, through every day, the quiet ones and the hard ones. Lead {name} beside calm waters when life is loud. Thank you that {name} will always have a home with you. Amen.',
    talk: {
      little: 'Walk a few steps behind them and say: “God’s goodness follows you like this.”',
      child: 'What good things do you hope will happen this year? Tell me or show me.',
      teen: 'What do you hope this next year looks like for you?',
      adult: 'What are you hoping for in this new year of life? How can I pray for you?',
    },
    ages: ALL,
    occasions: ['birthday'],
    keywords: ['birthday', 'new year', 'goodness', 'mercy', 'shepherd', 'all my days', 'looking ahead', 'hope'],
    notes:
      'A psalm of trust, not a promise that the year will be free of hard things; the dark valley is part of the same psalm.',
  },

  // ── Sleep ──────────────────────────────────────────────────────
  {
    id: 'sleep-psa-3-5',
    topic: 'sleep',
    ref: 'PSA 3:5',
    contextRef: 'PSA 3:1-6',
    contextNote:
      'David wrote this psalm while fleeing from his own son Absalom, with danger on every side. In the middle of it he says something surprising: he lay down, slept and woke again, because the Lord was holding him up.',
    reflection:
      'David slept on a night when sleep should have been impossible. He credits his rest and his waking to God’s care, not to everything being sorted out. For children whose bodies and minds find it hard to settle, sleep can be a long struggle. We can pray for rest and trust God to hold them through the night.',
    blessing:
      'Tonight you can lie down and rest. God is holding you up, all through the dark and into the morning. May your body grow calm and your mind grow still. May sleep come gently, and may you wake to a new day knowing you were held all night long.',
    prayer:
      'Lord, you held David up through a frightening night. Hold {name} through this one. Settle {their} body and quiet {their} mind. Where sleep is hard, help us find what helps, and give us patience in the long nights. Let {name} rest deeply, wake gently, and know that you were near the whole time. Amen.',
    talk: {
      little: 'Rub their back slowly and whisper: “Lie down and sleep. God holds you.”',
      child: 'What helps your body feel calm at bedtime? Tell me or show me.',
      teen: 'What makes falling asleep hard for you lately? Is there anything I could help with?',
      adult: 'How have you been sleeping lately? What would help you rest better?',
    },
    ages: ALL,
    keywords: ['sleep', 'bedtime', 'can’t sleep', 'night waking', 'restless', 'settle', 'calm', 'sensory'],
    notes:
      'David’s rest came amid real danger; the psalm does not promise easy sleep. Never suggest that poor sleep reflects a lack of trust; some sleep difficulties need medical help.',
  },
  {
    id: 'sleep-psa-63-6',
    topic: 'sleep',
    ref: 'PSA 63:6-7',
    contextRef: 'PSA 63:1-8',
    contextNote:
      'David is in the wilderness of Judah, thirsty and far from home. Lying awake through the long watches of the night, he turns his thoughts to God and remembers that God has been his help, like a bird sheltering its young under its wings.',
    reflection:
      'Some nights sleep does not come, no matter what we try. David does not scold himself for being awake; he uses the dark hours to remember God’s help. For families who know long nights well, wakefulness does not have to be a battle. God is present in the awake hours too.',
    blessing:
      'If you are awake in the night, you are not alone. God is with you in the dark, as close as a bird keeping its little ones under its wings. May you feel safe and warm. May the quiet hours be gentle, and may rest find you when it is ready.',
    prayer:
      'Father, when {name} lies awake, be near. Shelter {them} under your wings, and let the night feel safe, not lonely. Calm {their} body and fill {their} mind with peace. Give those of us who are awake with {name} patience and strength. Bring rest to all of us, in your time. Amen.',
    talk: {
      little: 'Cup your hands over theirs and say: “God keeps me safe under his wings.”',
      child: 'When you wake up in the night, what could help you feel safe? Tell me or show me.',
      teen: 'What goes through your mind when you can’t sleep?',
      adult: 'What helps on the nights you lie awake? Is there something I can take off your mind?',
    },
    ages: ALL,
    keywords: ['awake at night', 'night waking', 'insomnia', 'can’t sleep', 'long nights', 'safe', 'wings', 'tired'],
    notes:
      'David’s wakefulness here is devotional rather than insomnia; apply gently by principle. Do not frame sleeplessness as a spiritual problem.',
  },

  // ── Protection ─────────────────────────────────────────────────
  {
    id: 'protection-psa-32-7',
    topic: 'protection',
    ref: 'PSA 32:7',
    contextRef: 'PSA 32:6-11',
    contextNote:
      'David writes this psalm after experiencing God’s forgiveness. Having found peace with God, he now speaks of God as a hiding place, someone who shelters him from trouble and surrounds him with songs of rescue.',
    reflection:
      'A hiding place is somewhere you can go when the world is too much. For a child easily overwhelmed by noise, crowds or sudden change, that picture is precious. God is a refuge we can run into, and the songs around us there are songs of rescue, not of blame.',
    blessing:
      'When the world feels too loud or too much, may you find your hiding place in God. May he surround you with calm, like a song that wraps around you. May you be safe in body and in heart, and may you always have quiet places and trusted people to run to.',
    prayer:
      'Lord, be {name}’s hiding place. Protect {them} from harm and from the things that overwhelm {them}. Give {name} safe spaces at home, at school and everywhere {name} goes, and people who notice when {name} needs a break. Surround {name} with your calm today, and keep {them} in your care. Amen.',
    talk: {
      little: 'Make a cozy blanket hideout together and whisper: “God is my hiding place.”',
      child: 'Where is your favorite safe, quiet place? Tell me or show me.',
      teen: 'Where do you go when things get too loud or too much?',
      adult: 'Where do you find a safe, quiet place when life gets loud? How can I help protect it?',
    },
    ages: ALL,
    keywords: ['safe place', 'hiding place', 'overwhelmed', 'sensory', 'loud', 'protect', 'calm down', 'quiet space'],
    notes:
      'The psalm’s wider theme is forgiveness; never connect a child’s need for refuge with sin. A song of trust, not a promise of immunity from trouble.',
  },
  {
    id: 'protection-psa-17-8',
    topic: 'protection',
    ref: 'PSA 17:8',
    contextRef: 'PSA 17:6-9',
    contextNote:
      'David, pursued by people who want to harm him, asks God to keep him as closely guarded as the pupil of an eye, and to hide him under the shadow of his wings.',
    reflection:
      'We protect our eyes by reflex; we blink before we even think. David asks God to guard him with that same instinctive care. Parents of children who wander, cannot sense danger or cannot easily ask for help carry a particular kind of watchfulness. We can pray this prayer for them, and rest in God’s care when our own eyes must close.',
    blessing:
      'May God keep you as the apple of his eye, precious and carefully kept. May he shelter you under his wings wherever you go. May you be safe at home, at school and out in the world, and may there always be kind, watchful people near you. Rest in his care today.',
    prayer:
      'Father, keep {name} as the apple of your eye. Guard {them} when {name} cannot recognize danger or ask for help. Give the adults around {name} alert eyes and wise hearts. Hide {name} in the shadow of your wings. And when our own watching runs out, help us trust {them} to your care. Amen.',
    talk: {
      little: 'Wrap your arms around them like wings and say: “God keeps you close.”',
      child: 'Who are the safe grown-ups you can go to if you need help? Tell me or show me.',
      teen: 'Is there anywhere you don’t feel safe right now? You can always tell me.',
      adult: 'Where do you feel least safe right now? How can I pray for you?',
    },
    ages: ALL,
    keywords: ['safety', 'wandering', 'protect', 'danger', 'elopement', 'keep safe', 'precious', 'watch over'],
    notes:
      'A plea from David under threat; a prayer for safety, not a promise that harm cannot come. Pair prayer with practical safety measures; prayer never replaces supervision.',
  },
];
