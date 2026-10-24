import type { CuratedEntry } from '../types.ts';

/**
 * Uniquely Made, more: a third set of entries for families raising a child with a disability,
 * autism or other special needs, plus further everyday moments (birthdays, sleep, protection).
 * The child is whole and loved now, never a problem to fix. Healing is asked for honestly,
 * never promised. Disability is never linked to sin or to anyone’s faith. A meltdown is
 * distress, not defiance. Talk prompts leave room for children who answer without words.
 */
const ALL = ['baby', 'preschool', 'elementary', 'tween', 'teen', 'young-adult', 'adult'] as CuratedEntry['ages'];
const GROWN = ['young-adult', 'adult'] as CuratedEntry['ages'];

export const entries: CuratedEntry[] = [
  // ── Wonderfully made ───────────────────────────────────────────
  {
    id: 'wonderfully-made-ecc-3-11',
    topic: 'wonderfully-made',
    ref: 'ECC 3:11',
    contextRef: 'ECC 3:9-14',
    contextNote:
      'The Teacher reflects on the seasons of life and the limits of human understanding. He sees that God makes each thing beautiful in its own time, even though people cannot see the whole of God’s work from beginning to end.',
    reflection:
      'Milestone charts assume every child moves at the same speed. This verse speaks of a different clock: God makes things beautiful in their time, not ours. A child who walks late, speaks late or never speaks the way others do is not behind in God’s eyes, but growing on a timeline held by the One who sees the whole story.',
    blessing:
      'You are growing in your own time, and your time is a good time. May you never feel rushed or measured against anyone else. May the beauty God has placed in you show itself as you grow, in ways that surprise and delight the people who love you. Whatever pace you keep, you are not late, and you are not less.',
    prayer:
      'Lord, you see the whole of {name}’s life, from beginning to end. When we compare {name} with charts and with other children, quiet our hearts. Help us notice and celebrate each small step, however long it took. Give {name} patient people who wait well, and let {them} grow in {their} own time, sure of your love. Amen.',
    talk: {
      little: 'Cheer one small thing they did today and say: “You are growing in your own time.”',
      child: 'What is something you can do now that you couldn’t do before? Tell me or show me.',
      teen: 'Do you ever feel rushed to be where other people your age are?',
      adult: 'Where do you feel pressure to keep up with others? How can I pray for you in that?',
    },
    ages: ALL,
    keywords: ['milestones', 'delayed', 'development', 'own pace', 'behind', 'comparison', 'speech delay', 'growing'],
    notes:
      'Ecclesiastes speaks of God’s timing in general; do not use it to promise that a child will reach any particular milestone. The point is beauty and worth now, not catching up later.',
  },
  {
    id: 'wonderfully-made-job-33-4',
    topic: 'wonderfully-made',
    ref: 'JOB 33:4',
    contextRef: 'JOB 33:1-7',
    contextNote:
      'Elihu, a younger man, speaks to Job after Job’s friends have run out of words. Much of his speech is debated, but here he echoes Genesis: God’s Spirit made him, God’s breath gives him life, and he is formed from the same clay as Job, equal before God.',
    reflection:
      'Every breath a child takes is a gift from the breath of God. Elihu also reminds Job that the two of them are made of the same clay, standing side by side before God. No one is more fully human than anyone else, whatever their body or mind can do.',
    blessing:
      'The breath in your lungs is a gift from God. He made you by his Spirit, and your whole life comes from him. May you know that you stand side by side with everyone else, never above and never below. May each new day remind you that you are alive on purpose, and deeply loved.',
    prayer:
      'God of life, thank you for every breath {name} takes. You made {name} by your Spirit, from the same clay as all of us. Keep us from ever treating {name} as less than anyone else, and keep {name} from believing it. Fill {their} days with life and wonder, and let {them} rest in your love. Amen.',
    talk: {
      little: 'Rest your cheek against theirs and whisper: “God gave you life. You are so loved.”',
      child: 'What makes you feel happy to be alive? Tell me or show me.',
      teen: 'Do you ever feel people treat you as less than others? What do you wish they knew?',
      adult: 'When do you feel most alive? I would love to thank God for that with you.',
    },
    ages: ALL,
    keywords: ['alive', 'worth', 'equal', 'dignity', 'disability', 'special needs', 'medically complex', 'same as everyone'],
    notes:
      'Elihu’s speeches as a whole are disputed; this verse echoes Genesis 2:7 and is safe to apply by principle. Avoid breathing imagery that could pressure children with breathing difficulties.',
  },
  {
    id: 'wonderfully-made-mat-21-14',
    topic: 'wonderfully-made',
    ref: 'MAT 21:14-16',
    contextRef: 'MAT 21:12-16',
    contextNote:
      'After Jesus clears the temple courts, the blind and the lame come to him there, and children start shouting praise. The religious leaders are indignant, but Jesus defends the children, quoting Psalm 8: God has drawn praise from the mouths of children and infants.',
    reflection:
      'The people others kept at the edges came straight to Jesus in the temple, and he welcomed them. The children’s noisy praise annoyed the leaders, but Jesus called it praise God himself had prepared. Worship does not need to be polished or quiet. A hum, a flap of the hands or a joyful shout can be just as welcome to God.',
    blessing:
      'Your praise matters to God. Whether you sing, hum, clap, rock or sit in quiet wonder, he welcomes it. May you never be shushed out of God’s house, and may you always find a place close to Jesus. May your joy, whatever it sounds like, be received as a gift.',
    prayer:
      'Jesus, you welcomed the ones kept at the edges, and you defended the children when others wanted them quiet. Thank you for the way {name} praises you. Make our church a place where {name} is welcomed, noise and all. Let {name} come close to you without fear, and receive {their} joy as you received the children’s praise in the temple. Amen.',
    talk: {
      little: 'Clap or hum a song together, then say: “God loves to hear you.”',
      child: 'How do you like to praise God? Tell me, sing it, or show me.',
      teen: 'Have you ever felt you had to be quieter or different to fit in at church?',
      adult: 'Where do you feel most free to worship as yourself? How can I pray for you?',
    },
    ages: ALL,
    keywords: ['church', 'worship', 'noisy', 'stimming', 'loud', 'praise', 'belonging', 'autism'],
    notes:
      'Jesus healed in this scene, but the focus here is his welcome and his defense of children’s praise. Never imply a disabled child’s worship is acceptable only after healing.',
  },

  // ── Seen and understood ────────────────────────────────────────
  {
    id: 'seen-and-understood-exo-3-7',
    topic: 'seen-and-understood',
    ref: 'EXO 3:7',
    contextRef: 'EXO 3:1-10',
    contextNote:
      'God speaks to Moses from the burning bush about the Israelites enslaved in Egypt. He says he has seen their misery, heard their cries and knows their suffering, and he is about to act. It is spoken of a whole people, and applies by principle to God’s care for anyone in distress.',
    reflection:
      'Before God sends help, he says three things: I have seen, I have heard, I know. When a child is overwhelmed and cannot explain why, this passage reminds us that their distress is noticed. A meltdown is not defiance; it is a cry, and God hears cries.',
    blessing:
      'God sees you when things are hard. He hears you when you cry, and he knows what hurts, even when no one else does. May you feel safe with him on the loud days and the heavy days. May the people around you slow down, listen, and see what God sees: someone deeply loved.',
    prayer:
      'Lord, you see {name}, you hear {name}, and you know what {name} is feeling, even when we cannot tell. On overwhelming days, give us calm hearts and gentle hands. Help us read {their} distress as a cry for help, not as trouble. Show us what {name} needs, and let {them} feel safe and understood with you and with us. Amen.',
    talk: {
      little: 'After a hard moment, hold them gently and whisper: “I see you. God sees you too.”',
      child: 'When everything feels too much, what helps you feel better? Tell me or show me.',
      teen: 'When you’re overwhelmed, what do you wish the people around you would do?',
      adult: 'What has felt heavy lately that you haven’t had words for? I’m here to listen.',
    },
    ages: ALL,
    keywords: ['meltdown', 'overwhelmed', 'sensory overload', 'distress', 'crying', 'shutdown', 'autism', 'misunderstood'],
    notes:
      'The passage is about Israel’s oppression; apply by principle to God’s attention to suffering. Never frame a child’s meltdown as rebellion or sin.',
  },
  {
    id: 'seen-and-understood-1ki-19-11',
    topic: 'seen-and-understood',
    ref: '1KI 19:11-12',
    contextRef: '1KI 19:9-13',
    contextNote:
      'Elijah, exhausted and afraid, has fled to a mountain. God passes by: a great wind, an earthquake and a fire, but God is not in them. Then comes a still, small voice, and Elijah steps out to meet God there.',
    reflection:
      'God was not in the loudest things on the mountain. He met Elijah in a quiet whisper. For a child who finds noise, crowds and bright lights too much, this is a tender picture. God does not need us to push through the overload to find him; he can meet us in the quiet.',
    blessing:
      'God can meet you in the quiet. When the world is too loud and too bright, may you find a calm place, and may you sense that God is there with you. May your quiet be respected and your need for rest be understood. In the stillness, may you know you are safe and loved.',
    prayer:
      'Lord, you came to Elijah in a whisper, not in the wind or the fire. When the world is too loud for {name}, give {them} a quiet place to rest. Help us understand how {name} experiences sound, light and crowds, and protect {their} need for calm. Meet {name} in the stillness, and let {them} feel your gentle nearness. Amen.',
    talk: {
      little: 'Turn the lights down low, sit close and whisper: “God is here in the quiet.”',
      child: 'Where is your favorite quiet place? Can you tell me or show me?',
      teen: 'What helps when everything around you gets too loud?',
      adult: 'Where do you find quiet when life gets loud? How can I help protect that for you?',
    },
    ages: ALL,
    keywords: ['sensory', 'noise', 'loud', 'quiet', 'overstimulated', 'sensory processing', 'calm', 'autism'],
    notes:
      'Elijah’s story is about God meeting a weary prophet; do not turn it into a rule that God only speaks quietly. Applied gently to people who need low-sensory spaces.',
  },
  {
    id: 'seen-and-understood-psa-147-4',
    topic: 'seen-and-understood',
    ref: 'PSA 147:4-5',
    contextRef: 'PSA 147:1-6',
    contextNote:
      'A psalm of praise sung after the exiles returned to Jerusalem. It holds together God’s vast power, counting and naming every star, with his tender care for the brokenhearted and the humble. His understanding, the psalm says, has no limit.',
    reflection:
      'The God who names every star also understands every child completely. His understanding has no limit, so no child is too complex, too different or too hard to read for him. When we feel lost trying to understand, we can lean on the One who never is.',
    blessing:
      'The God who names the stars knows your name too. His understanding has no limit, so nothing about you confuses him or wears him out. May you feel completely understood by him. And on the days when people misunderstand you, may you remember that God never does.',
    prayer:
      'God, you count the stars and call each one by name, and your understanding has no limit. You understand {name} better than any of us ever could. When we are confused or worn out, lend us some of your understanding. Help us see {name} clearly and love {them} well, one day at a time. Amen.',
    talk: {
      little: 'Look at the stars together and say: “God knows every star, and God knows you.”',
      child: 'What is something about you that you wish people understood? Tell me or show me.',
      teen: 'Who understands you best right now, and what makes them easy to be around?',
      adult: 'Is there something about you that feels hard to explain? I would love to understand better.',
    },
    ages: ALL,
    keywords: ['understood', 'misunderstood', 'complex', 'confusing', 'autism', 'adhd', 'different', 'stars'],
    notes:
      'The psalm praises God’s greatness and care; do not imply that because God understands, others need not make the effort. It invites us to seek understanding too.',
  },

  // ── Healing and hope ───────────────────────────────────────────
  {
    id: 'healing-luk-4-40',
    topic: 'healing',
    ref: 'LUK 4:40',
    contextRef: 'LUK 4:38-41',
    contextNote:
      'At the end of a Sabbath day in Capernaum, as the sun sets, people bring everyone who is sick to Jesus. Luke notes that he lays his hands on each one, not on the crowd as a whole.',
    reflection:
      'Luke wants us to notice the detail: Jesus touched each one. Every sick person was treated as a person, not a problem in a queue. We can bring our loved ones to him in the same way, asking honestly for healing and trusting that he gives his full attention to each one.',
    blessing:
      'Jesus cares about your body and how it feels. He sees you one by one, never lost in a crowd. May you feel his care through gentle hands: the people who help you, hold you and look after you. May your pain be eased, may your body find rest, and may you always know how loved you are.',
    prayer:
      'Jesus, as the sun set people brought their sick to you, and you laid your hands on each one. We bring {name} to you now. Please bring healing and relief where {name} hurts. Guide the hands of every doctor, nurse and therapist who cares for {them}. Whatever comes, hold {name} close and let {them} feel your tender care. Amen.',
    talk: {
      little: 'Rest your hand gently on them and pray: “Jesus, please help where it hurts.”',
      child: 'Is there anywhere in your body that hurts or feels uncomfortable today? Tell me or show me.',
      teen: 'How is your body doing lately? Is there anything you’d like me to pray about?',
      adult: 'How is your health, really? What would you like me to ask God for?',
    },
    ages: ALL,
    occasions: ['illness', 'surgery'],
    keywords: ['sick', 'pain', 'healing', 'hospital', 'doctors', 'therapy', 'touch', 'chronic illness'],
    notes:
      'The passage records Jesus healing; it is not a promise that every prayer for healing will be answered the same way. Never imply that a lack of healing reflects a lack of faith.',
  },
  {
    id: 'healing-php-2-27',
    topic: 'healing',
    ref: 'PHP 2:27',
    contextRef: 'PHP 2:25-30',
    contextNote:
      'Paul writes from prison about Epaphroditus, a coworker who became so ill he nearly died. Paul does not hide his fear; he says God had mercy on Epaphroditus, and on Paul too, sparing him sorrow upon sorrow.',
    reflection:
      'Paul was not embarrassed to admit how close he came to grief, or how much he wanted his friend to live. He calls the recovery mercy, not something earned. We can be just as honest: we long for healing, we fear loss, and we bring both to God, who is merciful whatever the outcome.',
    blessing:
      'You are so precious, and your life matters so much. May God have mercy on you in your body and in your spirit. May you be comforted when you are sick or sore, and strengthened when you are tired. May the people who love you surround you, and may you feel how deeply you are cherished.',
    prayer:
      'God of mercy, Paul was honest about his fear, and we are too. Please have mercy on {name}. Bring healing, ease pain and give rest. Spare us sorrow upon sorrow, if it is your will, and carry us through whatever comes. Thank you for every good day with {name}, and keep {them} close to your heart. Amen.',
    talk: {
      little: 'Hold them close and say softly: “You are precious. God is with you.”',
      child: 'What helps you feel better when you are sick? Tell me or show me.',
      teen: 'When you’re unwell, what do you need most from the people around you?',
      adult: 'Is there a fear you’ve been carrying about your health? I would like to pray with you.',
    },
    ages: ALL,
    occasions: ['illness', 'surgery'],
    keywords: ['seriously ill', 'hospital', 'scared', 'recovery', 'sick', 'mercy', 'medical', 'icu'],
    notes:
      'Epaphroditus recovered, but the passage describes mercy rather than promising recovery. Do not suggest that those who were not healed received less mercy.',
  },
  {
    id: 'healing-mrk-5-23',
    topic: 'healing',
    ref: 'MRK 5:23',
    contextRef: 'MRK 5:21-24',
    contextNote:
      'Jairus, a respected synagogue leader, falls at Jesus’ feet and begs him to come and lay hands on his dying daughter. Jesus goes with him at once, though the journey is interrupted along the way.',
    reflection:
      'Jairus did not come with polished words. He fell down and begged, as anyone who loved her would. Jesus did not scold him for his urgency; he went with him. We are free to plead for the ones we love, and to know that Jesus walks with us, even when the road takes longer than we hoped.',
    blessing:
      'You are so loved that we bring you to Jesus with everything we have. May he come close to you, and may his care bring comfort and help. May you feel peace in your body and in your heart. And may you always know that you are carried by love, ours and God’s.',
    prayer:
      'Jesus, like Jairus we come to you pleading. Please come close to {name}. Lay your hands on {them}, bring healing, and give {them} life and strength. Walk with us on this road, even when it is long and the waiting is hard. We trust {name} to you, and we hold on to your love. Amen.',
    talk: {
      little: 'Hold their hand and pray: “Jesus, please come close to us.”',
      child: 'What would you like to ask Jesus for today? Tell me or show me.',
      teen: 'Is there something you want to ask God for, even if it feels hard to hope?',
      adult: 'What are you asking God for right now? Could we ask together?',
    },
    ages: ALL,
    occasions: ['illness', 'surgery'],
    keywords: ['desperate', 'please heal', 'seriously ill', 'hospital', 'pleading', 'prayer for healing', 'waiting', 'begging god'],
    notes:
      'Jairus’s daughter was raised, but the story is not a promise that every child will be healed. Keep the focus on bringing loved ones to Jesus and his willingness to come with us.',
  },

  // ── Strength for caregivers ────────────────────────────────────
  {
    id: 'caregiver-strength-psa-55-22',
    topic: 'caregiver-strength',
    ref: 'PSA 55:22',
    contextRef: 'PSA 55:16-22',
    contextNote:
      'David writes in deep distress, betrayed by a close friend. Earlier in the psalm he wishes he had wings like a dove so he could fly away and rest. He ends by urging others to throw their burdens onto the Lord, who will hold them up.',
    reflection:
      'David admitted he wanted to fly away. Caregivers know that feeling, and it is not a failure of love. The psalm offers sustaining strength rather than escape: we hand the weight to God and let him hold us up. The load may not vanish, but we do not carry it alone.',
    blessing:
      'You carry so much, and you carry it with love. When you long to fly away and rest, may you know that the feeling does not make you a bad caregiver. May you hand your burdens to God, one by one, and may he hold you up. May you find rest today, even in small ways.',
    prayer:
      'Lord, {name} carries a heavy load, often without being seen. When {name} wants to fly away, meet {them} with kindness, not guilt. Take the weight {name} hands to you, and hold {them} up when {their} strength runs low. Send real help, real rest and friends who notice. Thank you that {name} is never carrying this alone. Amen.',
    talk: {
      child: 'What is one thing we could do this week to make their load a little lighter?',
      teen: 'What do you think is the hardest part of caring for someone every day?',
      adult: 'What is the heaviest thing you are carrying this week? How can I pray, or help?',
    },
    ages: GROWN,
    keywords: ['caregiver', 'exhausted', 'burnout', 'overwhelmed', 'tired', 'want to run away', 'special needs parent', 'respite'],
    notes:
      'David’s wish to flee is presented honestly; do not shame caregivers for similar feelings. The psalm does not promise the burden will be removed.',
  },
  {
    id: 'caregiver-strength-jhn-19-26',
    topic: 'caregiver-strength',
    ref: 'JHN 19:26-27',
    contextRef: 'JHN 19:25-27',
    contextNote:
      'From the cross, Jesus sees his mother standing nearby with the disciple he loved. In his own suffering he makes sure she will be cared for, entrusting her to that disciple, who takes her into his home.',
    reflection:
      'Even in his final hours, Jesus noticed the one who had cared for him all his life, and made sure she would be cared for too. Caregivers often look after everyone except themselves. This moment reminds us that Jesus sees the carer, and that he often provides through people who take us in.',
    blessing:
      'You spend so much of yourself looking after someone else. May you know that Jesus sees you too, not only the one you care for. May he bring people into your life who look after you, open their homes and share the load. May you let yourself be cared for, without guilt.',
    prayer:
      'Jesus, even on the cross you made sure Mary was cared for. Please see {name} in the same way. Bring people around {name} who will step in, show up and take {them} in when {name} needs it. Help {name} receive help without shame, and remind {them} that {their} needs matter to you too. Amen.',
    talk: {
      child: 'How could we help look after the person who looks after everyone?',
      teen: 'Who takes care of you while you’re taking care of others?',
      adult: 'Who looks after you? Is there something I could take off your plate this week?',
    },
    ages: GROWN,
    keywords: ['caregiver', 'support', 'help', 'respite', 'lonely', 'looked after', 'no one to help', 'self care'],
    notes:
      'Jesus’ words concern his mother at a unique moment; applied by principle to God’s care for those who give care. Do not use the passage to pressure anyone into taking on care they cannot give.',
  },
  {
    id: 'caregiver-strength-2co-1-8',
    topic: 'caregiver-strength',
    ref: '2CO 1:8-9',
    contextRef: '2CO 1:8-11',
    contextNote:
      'Paul tells the church in Corinth about a crisis in Asia that crushed him beyond his strength, so that he despaired even of life. He says it taught him to rely on God rather than on himself, and he thanks them for helping by their prayers.',
    reflection:
      'Paul, a strong and seasoned leader, admitted that he reached the end of his strength. He did not dress it up. Being pushed beyond what he could bear taught him to stop relying on himself and to let others help through prayer. Caregivers are not meant to be endlessly self-sufficient.',
    blessing:
      'You were never meant to be the strength for everything. On the days when you feel past what you can bear, may you know that it is safe to say so. May God carry what you cannot, and may the prayers of others hold you up. May you rest in him, and not only in your own strength.',
    prayer:
      'Father, {name} has been pushed past {their} own strength more than once. Thank you that {name} does not have to pretend. When {name} reaches the end of what {name} can do, be {their} hope and help. Surround {them} with people who pray and practical help that arrives on time. If {name} is struggling to cope, give {them} courage to reach out for support. Amen.',
    talk: {
      child: 'How could we pray for the people who take care of us?',
      teen: 'Have you ever felt past what you could handle? What helped?',
      adult: 'Are you running on empty? I’d like to pray for you, and help in a practical way.',
    },
    ages: GROWN,
    keywords: ['exhausted', 'end of my rope', 'can’t cope', 'burnout', 'caregiver', 'depleted', 'overwhelmed', 'prayer support'],
    notes:
      'Paul’s despair is described honestly; do not minimise it or treat it as weak faith. If a caregiver speaks of hopelessness or self-harm, they need real support beyond prayer.',
  },

  // ── Worry and the future ───────────────────────────────────────
  {
    id: 'worry-and-future-isa-33-2',
    topic: 'worry-and-future',
    ref: 'ISA 33:2',
    contextRef: 'ISA 33:2-6',
    contextNote:
      'Isaiah prays on behalf of God’s people in a time of threat. Instead of asking for the whole future to be settled, the prayer asks for strength every morning and help in the time of trouble. A few lines later, God is called the sure foundation of their times.',
    reflection:
      'This prayer does not ask for a map of the next twenty years. It asks for strength for this morning, and then for the next. When the future feels too big to think about, we can pray this small, honest prayer and trust God to be there again tomorrow.',
    blessing:
      'You do not have to face the whole future today. May God give you strength this morning, and again tomorrow morning, and every morning after that. May you find help in the hard times, and steady ground under your feet. May you wake each day knowing that God is already there.',
    prayer:
      'Lord, be gracious to us; we wait for you. Be {name}’s strength this morning. When we worry about the years ahead for {name}, bring us back to today. Give {name} what {name} needs for this day, and help in every time of trouble. Be the sure foundation of {their} life, one morning at a time. Amen.',
    talk: {
      little: 'In the morning, hold them close and pray: “God, be our strength today.”',
      child: 'What is one thing about today you’d like God’s help with? Tell me or show me.',
      teen: 'Do you ever worry about the future? Which part feels biggest right now?',
      adult: 'What about the future keeps you up at night? Could we pray about today together?',
    },
    ages: ALL,
    keywords: ['future', 'what if', 'worry', 'one day at a time', 'morning', 'long term', 'planning', 'scared'],
    notes:
      'Spoken for Judah in a time of threat; applied by principle. Do not promise specific future outcomes; the prayer is for daily strength.',
  },
  {
    id: 'worry-and-future-num-27-16',
    topic: 'worry-and-future',
    ref: 'NUM 27:16-17',
    contextRef: 'NUM 27:12-20',
    contextNote:
      'Near the end of his life, Moses learns he will not go on with the people he has led for forty years. His first prayer is for them: that God would appoint someone to go out and come in before them, so they will not be like sheep without a shepherd. God answers by naming Joshua.',
    reflection:
      'Moses faced the moment many caregivers dread: he could not go on with the ones he had carried for so long. He did not pretend that was fine, and he did not despair. He brought his worry to God as a prayer for faithful people to come after him, and God heard it.',
    blessing:
      'You will always be watched over by the God who sees the whole of your life. Wherever you go in the years to come, may there be kind and faithful people beside you. May you never be left without care, and may you always know that the Lord himself is your Shepherd.',
    prayer:
      'God of all life, like Moses we bring you our worry about the years ahead. When we fear who will care for {name} when we are older or gone, quiet our hearts. Raise up faithful, kind people to walk with {them}, and give us wisdom to plan well today. Be {name}’s Shepherd, all {their} life long. Amen.',
    talk: {
      little: 'Name the people who love them, one by one, and say: “So many people love you.”',
      child: 'Who are the people who help take care of you? Tell me or show me.',
      teen: 'When you think about your future, who do you hope will be part of it?',
      adult: 'What worries you about the years ahead? How could we plan and pray about it together?',
    },
    ages: ALL,
    keywords: ['future', 'who will care', 'long term care', 'guardianship', 'after we are gone', 'planning', 'getting older', 'worry'],
    notes:
      'Moses prays for Israel’s leadership at a unique transition; applied by principle to praying for future carers. Do not use it to discourage practical planning; the prayer asks for wisdom to plan.',
  },
  {
    id: 'worry-and-future-luk-12-32',
    topic: 'worry-and-future',
    ref: 'LUK 12:32',
    contextRef: 'LUK 12:22-32',
    contextNote:
      'Jesus is teaching his disciples about worry, pointing them to the ravens and the wildflowers that God cares for. He ends tenderly, calling them his little flock and telling them not to be afraid, because the Father is glad to give them his kingdom.',
    reflection:
      'Jesus does not scold his worried friends; he calls them his little flock. The reason not to fear is not that everything will go to plan, but that the Father is glad to give. When the future looks thin and uncertain, we can remember that we are dealing with a generous Father, not a reluctant one.',
    blessing:
      'You are part of God’s little flock, and he is glad to care for you. When the future feels uncertain, may you not be afraid. May you know that God, your heavenly Father, delights to give you what is good, and may you rest today in his kindness.',
    prayer:
      'Father, thank you that you are glad to care for your little flock. When {name}’s heart fills with what-ifs, and ours too, remind us that you are generous and kind. Calm {their} fears about what is coming. Help us live today well, and trust you with the needs of tomorrow. Amen.',
    talk: {
      little: 'Cuddle them close and say: “You are God’s little lamb. He loves to care for you.”',
      child: 'What is something you wonder about that feels a bit scary? Tell me or show me.',
      teen: 'Is there anything about what’s coming next that troubles you?',
      adult: 'Which part of the future feels most uncertain right now? I’d love to pray about it with you.',
    },
    ages: ALL,
    keywords: ['what if', 'afraid', 'future', 'uncertain', 'worry', 'unknown', 'little flock', 'enough'],
    notes:
      'Verse 28 mentions “little faith”; do not use the passage to shame worry or tie provision to the amount of faith. The kingdom is God’s gift, not a promise of earthly comfort.',
  },

  // ── Birthdays ──────────────────────────────────────────────────
  {
    id: 'birthdays-gen-21-6',
    topic: 'birthdays',
    ref: 'GEN 21:6',
    contextRef: 'GEN 21:1-8',
    contextNote:
      'After years of waiting, Sarah gives birth to Isaac in her old age. She says God has brought her laughter, and that everyone who hears will laugh with her. As the boy grows, Abraham throws a great feast to celebrate.',
    reflection:
      'Isaac’s name means laughter, and his arrival filled a home with joy. Sarah’s laughter was not polite; it was the overflowing kind that spills over onto everyone nearby. A birthday is a good day to let that kind of joy loose and thank God out loud for the gift of this person.',
    blessing:
      'Happy birthday. You bring so much joy into the world. May this year be full of laughter, the kind that bubbles up and spills over. May you know what a gift you are, and may everyone who knows you share in the gladness of your life.',
    prayer:
      'God, thank you for the joy {name} brings. Thank you for every laugh we have shared and every good thing this past year held. Fill {name}’s new year with gladness, and let {them} know how much {their} life is celebrated. We laugh and give thanks with you today. Amen.',
    talk: {
      little: 'Tickle them gently and say: “You fill our days with joy.”',
      child: 'What made you laugh the most this past year? Tell me or show me.',
      teen: 'What is a moment from this past year you want to remember?',
      adult: 'What brought you the most joy this past year? What would you love more of this year?',
    },
    ages: ALL,
    occasions: ['birthday'],
    keywords: ['birthday', 'joy', 'laughter', 'celebrate', 'party', 'gift', 'thankful', 'happy'],
    notes:
      'Sarah’s story is about God keeping a specific promise; do not use it to suggest every longing for a child will be fulfilled, or that a birth is the only kind of joy worth celebrating.',
  },
  {
    id: 'birthdays-1sa-1-27',
    topic: 'birthdays',
    ref: '1SA 1:27',
    contextRef: '1SA 1:20-28',
    contextNote:
      'Hannah had longed for a child for years and prayed with tears at the house of the Lord. When Samuel is born and weaned, she brings him back there and tells Eli the priest that this is the child she prayed for.',
    reflection:
      'Hannah’s words are simple: this is the one I prayed for. Every person we love has been carried in someone’s prayers, whether before birth, through adoption or over many years since. A birthday is a chance to say it out loud: you were prayed for, and you still are.',
    blessing:
      'You are prayed for. Before you knew it, and every year since, people have brought your name to God. May you know how wanted you are. May this new year of your life be held in prayer, and may you feel the love behind every one of those prayers.',
    prayer:
      'Lord, thank you for {name}, the one we have prayed for again and again. Thank you for every year you have given us together. We place this new year of {their} life in your hands, as Hannah did. Keep {name} close to you, and let {them} know how loved and wanted {name} is. Amen.',
    talk: {
      little: 'Hold them close and say: “You are the one we prayed for. Happy birthday.”',
      child: 'Did you know people pray for you? Who would you like to pray for today?',
      teen: 'Who do you think has prayed for you over the years?',
      adult: 'How can I be praying for you in this new year of your life?',
    },
    ages: ALL,
    occasions: ['birthday'],
    keywords: ['birthday', 'prayed for', 'wanted', 'gift', 'thankful', 'adoption', 'new year', 'celebrate'],
    notes:
      'Hannah’s dedication of Samuel to service at the house of the Lord was unique; do not suggest every child was longed for in the same way, or shame those whose story began differently.',
  },
  {
    id: 'birthdays-psa-92-13',
    topic: 'birthdays',
    ref: 'PSA 92:13-14',
    contextRef: 'PSA 92:12-15',
    contextNote:
      'A song for the Sabbath, praising God’s faithfulness. It pictures people who trust God as trees planted in the courts of his house, still bearing fruit and staying green in old age.',
    reflection:
      'The psalm pictures growing older not as fading but as fruitfulness. A tree planted near God’s house keeps growing for years. A birthday in adult life is a good moment to celebrate that each year can still bring life, kindness and fruit, rooted in God’s faithfulness.',
    blessing:
      'Happy birthday. May you be like a tree planted close to God, rooted and still growing. May the years ahead be full of life and good fruit, whatever your age. May you stay green and strong in spirit, and may your life keep pointing others to God’s goodness.',
    prayer:
      'God, thank you for every year of {name}’s life, and for the person {name} has become. Keep {them} rooted in you. Let this new year bring life, rest and good fruit, and let {name} stay green and hopeful as the years go on. Thank you for your faithfulness to {them}, year after year. Amen.',
    talk: {
      child: 'What do you love most about the person whose birthday it is?',
      teen: 'What is something you admire about the way they have lived?',
      adult: 'What grew well in your life this past year? What do you hope will grow next?',
    },
    ages: GROWN,
    occasions: ['birthday'],
    keywords: ['birthday', 'getting older', 'milestone birthday', 'aging', 'older', 'fruitful', 'grandparent birthday', 'celebrate'],
    notes:
      'The psalm speaks of “the righteous”; apply by grace, not as a reward for good behaviour, and do not equate fruitfulness with productivity or success.',
  },

  // ── Sleep ──────────────────────────────────────────────────────
  {
    id: 'sleep-psa-139-11',
    topic: 'sleep',
    ref: 'PSA 139:11-12',
    contextRef: 'PSA 139:7-12',
    contextNote:
      'David marvels that there is nowhere he can go to escape God’s presence. Even if darkness tried to cover him, it would not hide him, because to God the night shines as bright as the day.',
    reflection:
      'Many children fear the dark because they cannot see what is there. This psalm reminds us that God sees perfectly in the dark. The night does not hide anyone from his care, and darkness is not dark to him.',
    blessing:
      'The dark is not dark to God. When the lights go out, he can still see you, and he is right here with you. May you rest knowing that the night cannot hide you from his love. May you sleep peacefully, and wake ready for a new day.',
    prayer:
      'Lord, the darkness is not dark to you. When the lights go out and {name} feels small or afraid, remind {them} that you see {them} perfectly. Calm {their} breathing, quiet {their} thoughts and help {their} body rest. Watch over {name} through the night, and give {them} sweet sleep. Amen.',
    talk: {
      little: 'Turn off the light, hold their hand and whisper: “The dark is not dark to God.”',
      child: 'What do you think about when it gets dark at night?',
      teen: 'Is there anything that keeps your mind busy at night lately?',
      adult: 'How have you been sleeping? Is anything keeping you awake that I could pray about?',
    },
    ages: ALL,
    keywords: ['afraid of the dark', 'dark', 'night', 'bedtime', 'can’t sleep', 'nightlight', 'scared at night', 'sleep'],
    notes:
      'The psalm speaks of God’s presence everywhere, not a promise of no bad dreams or perfect sleep.',
  },
  {
    id: 'sleep-psa-74-16',
    topic: 'sleep',
    ref: 'PSA 74:16',
    contextRef: 'PSA 74:12-17',
    contextNote:
      'Asaph laments the ruin of the temple and asks why God seems far away. In the middle of the lament he remembers that God is still King: day and night both belong to him, and he set the sun and moon in place.',
    reflection:
      'This verse sits in a psalm written on a very bad day. Even then, Asaph remembered that the night belongs to God as much as the day does. For a child who dreads bedtime, or a family worn out by broken nights, it is good to know that the night hours are not outside God’s care.',
    blessing:
      'The night belongs to God, just like the day. He made the moon and the sun, and he is with you through both. May you let go of today and rest, knowing that God holds the night. May your sleep be peaceful, and may you wake to his kindness.',
    prayer:
      'God, the day is yours and the night is yours. As {name} lies down, take the worries of today and hold the hours of the night. If {name} wakes in the dark, be near, and help {them} settle again. Give rest to {name} and to everyone who cares for {them}, and let {name} wake to your kindness. Amen.',
    talk: {
      little: 'Look at the moon through the window and whisper: “God made the night. Sleep tight.”',
      child: 'What do you like best about nighttime? Tell me or show me.',
      teen: 'How do you wind down at night when your mind won’t settle?',
      adult: 'What would help you rest better at night right now? I’d love to pray for that.',
    },
    ages: ALL,
    keywords: ['bedtime', 'night waking', 'broken sleep', 'moon', 'rest', 'can’t sleep', 'wakes up at night', 'tired family'],
    notes:
      'The verse comes from a lament; it affirms God’s rule over night and day, not a promise of uninterrupted sleep.',
  },
  {
    id: 'sleep-psa-42-8',
    topic: 'sleep',
    ref: 'PSA 42:8',
    contextRef: 'PSA 42:5-11',
    contextNote:
      'The psalmist is downcast and far from home, asking why God seems to have forgotten him. Yet he holds on: by day God shows his steadfast love, and at night God’s song is with him as a prayer.',
    reflection:
      'This psalm was written by someone sad, not someone serene. Even so, the singer found a song with him in the night. On nights when sadness comes at bedtime, we do not have to cheer up first; we can rest in God’s steady love and let a song or a quiet prayer carry us toward sleep.',
    blessing:
      'God’s love is with you through the day, and his song is with you through the night. When bedtime feels sad or lonely, may you know you are not alone. May a gentle song fill your heart, and may you rest in God’s steady love until morning.',
    prayer:
      'Lord, by day you show your love, and at night your song is with us. If {name} is sad or unsettled tonight, sit close to {them}. Let a song of your love quiet {their} heart, and let {name} fall asleep feeling safe. Thank you for loving {name} in the daytime and in the dark. Amen.',
    talk: {
      little: 'Sing a soft song together, then whisper: “God’s love is with you all night.”',
      child: 'Is there a song that helps you feel calm at bedtime? Can you hum it for me?',
      teen: 'When nights feel heavy, what helps you settle?',
      adult: 'Have nights been hard lately? What would help you rest? I’m here.',
    },
    ages: ALL,
    keywords: ['sad at bedtime', 'lullaby', 'song', 'night', 'lonely', 'can’t sleep', 'bedtime prayer', 'calm'],
    notes:
      'The psalm is honest lament; do not use it to tell a sad child to cheer up. God’s presence is offered, not a promise that sadness lifts by morning.',
  },

  // ── Protection ─────────────────────────────────────────────────
  {
    id: 'protection-deu-33-12',
    topic: 'protection',
    ref: 'DEU 33:12',
    contextRef: 'DEU 33:1-12',
    contextNote:
      'At the end of his life, Moses blesses each of Israel’s tribes. For Benjamin he pictures the beloved of the Lord resting secure, shielded all day long and carried between God’s shoulders, like a child carried close.',
    reflection:
      'This is one of the most tender pictures of protection in Scripture: someone beloved, resting on God’s shoulders. It is a blessing spoken over a tribe, not a promise that nothing hard will happen. Still, it shows us God’s heart: he shields his beloved and carries them close.',
    blessing:
      'You are beloved by God. May you rest secure in him today, wherever you go. May he shield you all day long, and may you feel carried, close and safe, like a child on strong shoulders. And when you are tired, may you remember that you can lean on him.',
    prayer:
      'Lord, {name} is your beloved. Shield {them} all day long, at home, on the road and in every place {name} goes. Keep {them} safe from harm, and when hard things come, carry {name} close to you. Let {them} rest secure, knowing {name} is held. We entrust {name} to your care. Amen.',
    talk: {
      little: 'Carry them on your shoulders or back and say: “God carries you close.”',
      child: 'When do you feel the most safe?',
      teen: 'Where do you feel safe right now, and where don’t you?',
      adult: 'Where would you like to feel more secure this season? How can I pray for you?',
    },
    ages: ALL,
    keywords: ['safe', 'protection', 'carried', 'beloved', 'shield', 'secure', 'keep safe', 'held'],
    notes:
      'Moses’ blessing was spoken over the tribe of Benjamin; applied by principle. Pray for safety and entrust the person to God, never as a promise of immunity from harm.',
  },
  {
    id: 'protection-psa-34-7',
    topic: 'protection',
    ref: 'PSA 34:7',
    contextRef: 'PSA 34:4-10',
    contextNote:
      'David wrote this psalm after escaping from danger at the court of a foreign king. He looks back and praises God for hearing him when he called out, picturing the Lord’s messenger camped all around those who trust him.',
    reflection:
      'David pictures God’s care as a camp pitched all around, guarding on every side. He wrote it after real danger, not from a life without fear. We can pray for safety with the same honesty, trusting that God’s care surrounds the ones we love even when we cannot see it.',
    blessing:
      'You are surrounded by more care than you can see. When something feels scary, may you remember that God’s care is camped all around you. May you not be ruled by fear, and may you know that you are never on your own. May you walk in peace, held by God and by people who love you.',
    prayer:
      'Lord, surround {name} with your care, on every side. When danger feels close, calm {their} fear and give {them} wisdom to know what to do and whom to tell. Keep {name} safe, and put good people and strong help around {them}. Remind {them} that {name} is never alone. Amen.',
    talk: {
      little: 'Wrap them in a big hug and say: “God’s care is all around you.”',
      child: 'Who are the helpers around you when something feels scary?',
      teen: 'When you feel outnumbered or unsafe, who could you go to?',
      adult: 'Is anything making you feel exposed or unsafe lately? I’d like to pray with you.',
    },
    ages: ALL,
    keywords: ['scared', 'unsafe', 'danger', 'surrounded', 'afraid', 'helpers', 'guarded', 'protection'],
    notes:
      'A song of trust after a specific rescue (see the heading and 1 Samuel 21); not a promise that no harm will come. Pray for safety, entrust the person to God, and encourage seeking real help.',
  },
  {
    id: 'protection-isa-25-4',
    topic: 'protection',
    ref: 'ISA 25:4',
    contextRef: 'ISA 25:1-5',
    contextNote:
      'Isaiah sings praise for God’s faithfulness after the fall of a proud, ruthless city. He celebrates God as a refuge for the poor and needy: shelter in a storm and shade in burning heat.',
    reflection:
      'Isaiah’s pictures are practical: a wall against the storm, shade in the heat. God is described as especially close to those who are vulnerable and in need. When the people we love feel exposed or fragile, we can pray for that kind of shelter, and help to provide it ourselves.',
    blessing:
      'May God be your shelter in every storm and your shade when life feels too hot. When you feel small or weak, may you find him close. May you be sheltered and kept, and may you always have a place to run where you are welcome and safe.',
    prayer:
      'God, you are a refuge for the needy and a shelter from the storm. Be that for {name}. When {name} feels exposed, fragile or overwhelmed, cover {them}. Keep {them} from harm, and when storms come anyway, hold {name} steady. Make us part of {their} shelter, a safe place {name} can always come to. Amen.',
    talk: {
      little: 'Make a blanket tent together and say: “God is our shelter.”',
      child: 'If you could build the safest shelter in the world, what would it be like?',
      teen: 'Where do you go when life feels stormy?',
      adult: 'What storms are you facing right now? How could I be a shelter for you?',
    },
    ages: ALL,
    keywords: ['shelter', 'refuge', 'storm', 'vulnerable', 'safe place', 'protection', 'weak', 'fragile'],
    notes:
      'Isaiah celebrates God as refuge after judgment on a ruthless city; apply by principle and never promise exemption from storms.',
  },
];
