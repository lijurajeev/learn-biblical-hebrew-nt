// ============================================
// Hebrew Journey — Main Application
// ============================================

const app = {
  // -------------------------------------------
  // State
  // -------------------------------------------
  progress: null,
  currentView: 'home',
  lessonState: null,

  // -------------------------------------------
  // Initialize
  // -------------------------------------------
  init() {
    this.loadProgress();
    this.loadTheme();
    this.navigate('home');
    this.updateNavProgress();
    // Pre-load speech synthesis voices
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  },

  // -------------------------------------------
  // Theme Toggle
  // -------------------------------------------
  loadTheme() {
    const saved = localStorage.getItem('hebrew-journey-theme');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.getElementById('theme-icon-sun').style.display = 'block';
      document.getElementById('theme-icon-moon').style.display = 'none';
    }
  },

  toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      document.getElementById('theme-icon-sun').style.display = 'none';
      document.getElementById('theme-icon-moon').style.display = 'block';
      localStorage.setItem('hebrew-journey-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.getElementById('theme-icon-sun').style.display = 'block';
      document.getElementById('theme-icon-moon').style.display = 'none';
      localStorage.setItem('hebrew-journey-theme', 'dark');
    }
  },

  // -------------------------------------------
  // Progress Persistence
  // -------------------------------------------
  loadProgress() {
    const saved = localStorage.getItem('hebrew-journey-progress');
    if (saved) {
      this.progress = JSON.parse(saved);
    } else {
      this.progress = {
        alphabetGroups: {},   // { "1": true, "2": true, ... }
        vowelGroups: {},
        chapters: {},
        wordsLearned: 0,
        lessonsCompleted: 0,
        currentStreak: 0,
        lastStudyDate: null,
      };
    }
    this.updateStreak();
  },

  saveProgress() {
    localStorage.setItem('hebrew-journey-progress', JSON.stringify(this.progress));
    this.updateNavProgress();
  },

  updateStreak() {
    const today = new Date().toDateString();
    const last = this.progress.lastStudyDate;
    if (!last) return;
    const lastDate = new Date(last);
    const diff = Math.floor((new Date(today) - lastDate) / (1000 * 60 * 60 * 24));
    if (diff > 1) {
      this.progress.currentStreak = 0;
      this.saveProgress();
    }
  },

  recordStudy() {
    const today = new Date().toDateString();
    const last = this.progress.lastStudyDate;
    if (last !== today) {
      if (last) {
        const diff = Math.floor((new Date(today) - new Date(last)) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          this.progress.currentStreak++;
        } else if (diff > 1) {
          this.progress.currentStreak = 1;
        }
      } else {
        this.progress.currentStreak = 1;
      }
      this.progress.lastStudyDate = today;
      this.saveProgress();
    }
  },

  getTotalProgress() {
    const totalLessons = ALPHABET_GROUPS.length + VOWEL_GROUPS.length + Object.keys(JOHN_CHAPTERS).length;
    const completed = this.progress.lessonsCompleted;
    return Math.min(100, Math.round((completed / totalLessons) * 100));
  },

  updateNavProgress() {
    const pct = this.getTotalProgress();
    const fill = document.getElementById('nav-progress-fill');
    const text = document.getElementById('nav-progress-text');
    if (fill) fill.style.width = pct + '%';
    if (text) text.textContent = pct + '%';
  },

  isLessonUnlocked(type, id) {
    // All lessons unlocked for preview
    return true;
  },

  getLessonStatus(type, id) {
    if (type === 'alphabet') {
      if (this.progress.alphabetGroups[id]) return 'completed';
    } else if (type === 'vowel') {
      if (this.progress.vowelGroups[id]) return 'completed';
    } else if (type === 'chapter') {
      if (this.progress.chapters[id]) return 'completed';
    }
    if (this.isLessonUnlocked(type, id)) return 'current';
    return 'locked';
  },

  completeLesson(type, id) {
    if (type === 'alphabet') this.progress.alphabetGroups[id] = true;
    else if (type === 'vowel') this.progress.vowelGroups[id] = true;
    else if (type === 'chapter') this.progress.chapters[id] = true;
    this.progress.lessonsCompleted++;
    this.recordStudy();
    this.saveProgress();
  },

  // -------------------------------------------
  // Text-to-Speech for Hebrew
  // -------------------------------------------

  // Hebrew letter names in Hebrew — for authentic pronunciation
  _hebrewLetterNames: {
    'א': 'אָלֶף', 'בּ': 'בֵּית', 'ב': 'בֵית', 'גּ': 'גִּימֶל', 'ד': 'דָּלֶת',
    'ה': 'הֵא', 'ו': 'וָו', 'ז': 'זַיִן', 'ח': 'חֵית', 'ט': 'טֵית',
    'י': 'יוֹד', 'כּ': 'כַּף', 'כ': 'כַף', 'ך': 'כַף סוֹפִית', 'ל': 'לָמֶד',
    'מ': 'מֵם', 'ם': 'מֵם סוֹפִית', 'נ': 'נוּן', 'ן': 'נוּן סוֹפִית', 'ס': 'סָמֶך',
    'ע': 'עַיִן', 'פּ': 'פֵּא', 'פ': 'פֵא', 'ף': 'פֵא סוֹפִית',
    'צ': 'צָדִי', 'ץ': 'צָדִי סוֹפִית',
    'ק': 'קוֹף', 'ר': 'רֵישׁ', 'שׁ': 'שִׁין', 'שׂ': 'שִׂין', 'תּ': 'תָּו',
  },

  // Hebrew vowel names in Hebrew
  _hebrewVowelNames: {
    'בַ': 'פַּתָח', 'בָ': 'קָמָץ', 'בֲ': 'חֲטַף פַּתָח',
    'בֶ': 'סֶגוֹל', 'בֵ': 'צֵרֵי', 'בֱ': 'חֲטַף סֶגוֹל',
    'בִ': 'חִירִיק', 'בִי': 'חִירִיק מָלֵא',
    'בֹ': 'חוֹלָם', 'בוֹ': 'חוֹלָם מָלֵא', 'בֳ': 'חֲטַף קָמָץ',
    'בֻ': 'קֻבּוּץ', 'בוּ': 'שׁוּרֶק',
    'בְ': 'שְׁוָא',
  },

  speakHebrew(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    // Resolve what to speak: Hebrew letter/vowel name in Hebrew, or the text itself
    const hebrewText = this._hebrewLetterNames[text]
                    || this._hebrewVowelNames[text]
                    || text;

    // Verses (4+ words) get spoken word-by-word with pauses between
    const wordCount = hebrewText.split(/\s+/).length;
    const isVerse = wordCount > 4;

    if (isVerse) {
      this._speakVerseWordByWord(hebrewText);
    } else {
      const utter = new SpeechSynthesisUtterance(hebrewText);
      utter.lang = 'he-IL';
      utter.rate = 0.7;
      window.speechSynthesis.speak(utter);
    }
  },

  // Speak a verse in small chunks with pauses between them for clarity
  _speakVerseWordByWord(text) {
    // Split into small chunks of 2-3 words for natural phrasing
    const words = text.split(/\s+/);
    const chunks = [];
    for (let i = 0; i < words.length; i += 2) {
      chunks.push(words.slice(i, i + 2).join(' '));
    }

    let i = 0;
    const speakNext = () => {
      if (i >= chunks.length) return;
      const utter = new SpeechSynthesisUtterance(chunks[i]);
      utter.lang = 'he-IL';
      utter.rate = 0.55;
      utter.onend = () => {
        i++;
        setTimeout(speakNext, 350); // 350ms pause between chunks
      };
      window.speechSynthesis.speak(utter);
    };
    speakNext();
  },

  // -------------------------------------------
  // Router
  // -------------------------------------------
  navigate(view, params) {
    this.currentView = view;
    const content = document.getElementById('content');
    content.className = 'fade-in';

    switch (view) {
      case 'home':
        this.renderHome(content);
        break;
      case 'alphabet-lesson':
        this.startAlphabetLesson(content, params.groupId);
        break;
      case 'vowel-lesson':
        this.startVowelLesson(content, params.groupId);
        break;
      case 'chapter':
        this.startChapterLesson(content, params.chapterId);
        break;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // -------------------------------------------
  // Home Screen
  // -------------------------------------------
  renderHome(el) {
    const wordsCount = this.progress.wordsLearned;
    const streak = this.progress.currentStreak;
    const lessons = this.progress.lessonsCompleted;

    el.innerHTML = `
      <div class="home-header">
        <div class="hebrew-subtitle hebrew">בְּשׂוֹרַת יוֹחָנָן</div>
        <h1>Hebrew Journey</h1>
        <p>Learn to read the Gospel of John in Biblical Hebrew, one step at a time.</p>
      </div>

      <div class="home-stats">
        <div class="stat-card">
          <div class="stat-value">${streak}</div>
          <div class="stat-label">Day Streak</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${lessons}</div>
          <div class="stat-label">Lessons Done</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${wordsCount}</div>
          <div class="stat-label">Words Learned</div>
        </div>
      </div>

      <div class="section-title"><span class="icon">א</span> The Hebrew Alphabet</div>
      <div class="lesson-list" id="alphabet-lessons"></div>

      <div class="section-title"><span class="icon">◌ַ</span> Vowels (Niqqud)</div>
      <div class="lesson-list" id="vowel-lessons"></div>

      <div class="section-title"><span class="icon">📖</span> Gospel of John</div>
      <div class="lesson-list" id="chapter-lessons"></div>
    `;

    // Render alphabet lessons
    const alphaList = document.getElementById('alphabet-lessons');
    ALPHABET_GROUPS.forEach(g => {
      const status = this.getLessonStatus('alphabet', g.id);
      alphaList.innerHTML += this.renderLessonCard(
        'alphabet', g.id, g.name, g.subtitle, g.letters, status, 'aleph'
      );
    });

    // Render vowel lessons
    const vowelList = document.getElementById('vowel-lessons');
    VOWEL_GROUPS.forEach(g => {
      const status = this.getLessonStatus('vowel', g.id);
      vowelList.innerHTML += this.renderLessonCard(
        'vowel', g.id, g.name, g.subtitle, '', status, 'vowel'
      );
    });

    // Render chapter lessons
    const chapterList = document.getElementById('chapter-lessons');
    Object.keys(JOHN_CHAPTERS).forEach(ch => {
      const chapter = JOHN_CHAPTERS[ch];
      const status = this.getLessonStatus('chapter', parseInt(ch));
      chapterList.innerHTML += this.renderLessonCard(
        'chapter', parseInt(ch), `Chapter ${ch}`, chapter.title, '', status, 'chapter'
      );
    });
  },

  renderLessonCard(type, id, title, subtitle, preview, status, iconType) {
    const isLocked = status === 'locked';
    const statusClass = status === 'completed' ? 'completed' : status === 'current' ? 'current' : 'locked';
    const badge = status === 'completed' ? '<span class="lesson-badge badge-complete">Complete</span>'
                : status === 'current' ? '<span class="lesson-badge badge-current">Start</span>'
                : '<span class="lesson-badge badge-locked">Locked</span>';

    const iconClass = isLocked ? 'locked-icon' : iconType;
    const iconContent = isLocked ? '🔒'
                      : iconType === 'aleph' ? 'א'
                      : iconType === 'vowel' ? '◌ַ'
                      : iconType === 'chapter' ? id : '';

    const onclick = isLocked ? '' : `onclick="app.navigate('${type === 'alphabet' ? 'alphabet-lesson' : type === 'vowel' ? 'vowel-lesson' : 'chapter'}', { ${type === 'chapter' ? 'chapterId' : 'groupId'}: ${id} })"`;

    return `
      <div class="lesson-card ${statusClass}" ${onclick}>
        <div class="lesson-icon ${iconClass}">${iconContent}</div>
        <div class="lesson-info">
          <h3>${title}</h3>
          <p>${subtitle}${preview ? ' — <span class="hebrew" style="font-size:1rem">' + preview + '</span>' : ''}</p>
        </div>
        ${badge}
      </div>
    `;
  },

  // -------------------------------------------
  // Alphabet Lesson
  // -------------------------------------------
  startAlphabetLesson(el, groupId) {
    const group = ALPHABET_GROUPS.find(g => g.id === groupId);
    const letters = HEBREW_ALPHABET.filter(l => l.group === groupId);

    this.lessonState = {
      type: 'alphabet',
      groupId,
      letters,
      phase: 'flashcard', // flashcard -> quiz -> matching -> complete
      currentIndex: 0,
      score: 0,
      totalQuestions: 0,
      quizQuestions: [],
    };

    this.renderAlphabetFlashcards(el, group, letters);
  },

  renderAlphabetFlashcards(el, group, letters) {
    const state = this.lessonState;
    const letter = letters[state.currentIndex];
    const progress = letters.map((_, i) =>
      i < state.currentIndex ? 'done' : i === state.currentIndex ? 'active' : ''
    ).map(cls => `<div class="step ${cls}"></div>`).join('');

    el.innerHTML = `
      <div class="lesson-header">
        <h1>${group.name}</h1>
        <p>Learn each letter — tap the card to flip it</p>
      </div>
      <div class="lesson-progress">${progress}</div>

      <div class="flashcard-container">
        <div class="flashcard" id="flashcard" onclick="document.getElementById('flashcard').classList.toggle('flipped')">
          <div class="flashcard-face flashcard-front">
            <div class="letter">${letter.letter}</div>
            <div class="hint">Tap to reveal</div>
          </div>
          <div class="flashcard-face flashcard-back">
            <div class="name">${letter.name}</div>
            <div class="pronunciation">${letter.transliteration}</div>
            <div class="description">${letter.description}</div>
            <button class="speak-btn" onclick="event.stopPropagation(); app.speakHebrew('${letter.letter}')" title="Listen">
              <i class="fa-solid fa-volume-high"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="flashcard-nav">
        ${state.currentIndex > 0 ? '<button class="btn btn-outline btn-sm" onclick="app.prevFlashcard()">Previous</button>' : '<div></div>'}
        ${state.currentIndex < letters.length - 1
          ? '<button class="btn btn-primary btn-sm" onclick="app.nextFlashcard()">Next Letter</button>'
          : '<button class="btn btn-primary btn-sm" onclick="app.startAlphabetQuiz()">Start Quiz</button>'
        }
      </div>
    `;
  },

  nextFlashcard() {
    this.lessonState.currentIndex++;
    const group = ALPHABET_GROUPS.find(g => g.id === this.lessonState.groupId);
    this.renderAlphabetFlashcards(document.getElementById('content'), group, this.lessonState.letters);
  },

  prevFlashcard() {
    this.lessonState.currentIndex--;
    const group = ALPHABET_GROUPS.find(g => g.id === this.lessonState.groupId);
    this.renderAlphabetFlashcards(document.getElementById('content'), group, this.lessonState.letters);
  },

  // -------------------------------------------
  // Alphabet Quiz
  // -------------------------------------------
  startAlphabetQuiz() {
    const state = this.lessonState;
    state.phase = 'quiz';
    state.currentIndex = 0;
    state.score = 0;

    // Generate quiz questions
    const questions = [];
    state.letters.forEach(letter => {
      // "What is this letter?" — show Hebrew, pick name
      questions.push({
        type: 'identify',
        prompt: 'What is this letter?',
        display: letter.letter,
        displayClass: 'hebrew-char',
        correct: letter.name,
        hebrewAudio: letter.letter,
        options: this.getRandomOptions(letter.name, HEBREW_ALPHABET.map(l => l.name), 4),
      });
      // "Which letter is X?" — show name, pick Hebrew
      questions.push({
        type: 'find',
        prompt: `Which letter is ${letter.name}?`,
        display: letter.name,
        displayClass: '',
        correct: letter.letter,
        hebrewAudio: letter.letter,
        options: this.getRandomOptions(letter.letter, HEBREW_ALPHABET.map(l => l.letter), 4),
        optionClass: 'option-hebrew',
      });
    });

    state.quizQuestions = this.shuffleArray(questions);
    state.totalQuestions = state.quizQuestions.length;
    this.renderQuizQuestion(document.getElementById('content'));
  },

  renderQuizQuestion(el) {
    const state = this.lessonState;
    if (state.currentIndex >= state.quizQuestions.length) {
      this.renderLessonComplete(el);
      return;
    }

    const q = state.quizQuestions[state.currentIndex];
    const progress = state.quizQuestions.map((_, i) =>
      i < state.currentIndex ? 'done' : i === state.currentIndex ? 'active' : ''
    ).map(cls => `<div class="step ${cls}"></div>`).join('');

    el.innerHTML = `
      <div class="lesson-header">
        <h1>Quiz Time</h1>
        <p>Question ${state.currentIndex + 1} of ${state.quizQuestions.length}</p>
      </div>
      <div class="lesson-progress">${progress}</div>

      <div class="quiz-container">
        <div class="quiz-question">
          <div class="prompt">${q.prompt}</div>
          <div class="${q.displayClass}">${q.display}</div>
          ${q.hebrewAudio ? `<button class="speak-btn" onclick="event.stopPropagation(); app.speakHebrew('${this.escapeStr(q.hebrewAudio)}')" title="Listen" style="margin-top: 12px;"><i class="fa-solid fa-volume-high"></i></button>` : ''}
        </div>
        <div class="quiz-options" id="quiz-options">
          ${q.options.map((opt, i) => `
            <button class="quiz-option" onclick="app.checkQuizAnswer(${i}, '${this.escapeStr(opt)}', '${this.escapeStr(q.correct)}')" id="opt-${i}">
              ${q.optionClass ? `<div class="${q.optionClass}">${opt}</div>` : opt}
            </button>
          `).join('')}
        </div>
        <div id="quiz-feedback"></div>
      </div>
    `;
  },

  checkQuizAnswer(index, selected, correct) {
    const isCorrect = selected === correct;
    const options = document.querySelectorAll('.quiz-option');
    options.forEach((opt, i) => {
      opt.classList.add('disabled');
      const optText = opt.textContent.trim();
      if (opt.id === `opt-${index}`) {
        opt.classList.add(isCorrect ? 'correct' : 'incorrect');
      }
    });

    // Highlight the correct answer
    if (!isCorrect) {
      options.forEach(opt => {
        const val = opt.textContent.trim();
        if (val === correct) opt.classList.add('correct');
      });
    }

    if (isCorrect) this.lessonState.score++;

    const feedback = document.getElementById('quiz-feedback');
    feedback.innerHTML = `
      <div class="quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}">
        <div class="feedback-text">${isCorrect ? 'Correct!' : 'Not quite'}</div>
        ${!isCorrect ? `<div class="feedback-detail">The answer is: ${correct}</div>` : ''}
      </div>
    `;

    setTimeout(() => {
      this.lessonState.currentIndex++;
      this.renderQuizQuestion(document.getElementById('content'));
    }, isCorrect ? 1000 : 2000);
  },

  // -------------------------------------------
  // Matching Exercise
  // -------------------------------------------
  startMatching(letters) {
    const state = this.lessonState;
    state.phase = 'matching';

    const pairs = letters.slice(0, 5).map(l => ({ heb: l.letter, eng: l.name }));
    const shuffledEng = this.shuffleArray([...pairs.map(p => p.eng)]);
    const shuffledHeb = this.shuffleArray([...pairs.map(p => p.heb)]);

    state.matchPairs = pairs;
    state.matchSelected = null;
    state.matchedCount = 0;

    this.renderMatching(document.getElementById('content'), shuffledHeb, shuffledEng, pairs);
  },

  renderMatching(el, hebItems, engItems, pairs) {
    el.innerHTML = `
      <div class="lesson-header">
        <h1>Match the Pairs</h1>
        <p>Tap a Hebrew letter, then tap its English name</p>
      </div>

      <div class="matching-container">
        <div class="matching-column">
          <h3>Hebrew</h3>
          ${hebItems.map((h, i) => `
            <div class="match-item" id="match-heb-${i}" data-type="heb" data-value="${this.escapeStr(h)}"
                 onclick="app.handleMatchClick('heb', ${i}, '${this.escapeStr(h)}')">
              <div class="hebrew-text">${h}</div>
            </div>
          `).join('')}
        </div>
        <div class="matching-column">
          <h3>English</h3>
          ${engItems.map((e, i) => `
            <div class="match-item" id="match-eng-${i}" data-type="eng" data-value="${this.escapeStr(e)}"
                 onclick="app.handleMatchClick('eng', ${i}, '${this.escapeStr(e)}')">
              ${e}
            </div>
          `).join('')}
        </div>
      </div>
      <div id="match-feedback" style="text-align:center; margin-top: 20px;"></div>
    `;
  },

  handleMatchClick(type, index, value) {
    const state = this.lessonState;
    const elId = `match-${type}-${index}`;
    const el = document.getElementById(elId);

    if (el.classList.contains('matched')) return;

    if (!state.matchSelected) {
      state.matchSelected = { type, index, value, elId };
      el.classList.add('selected');
    } else {
      if (state.matchSelected.type === type) {
        // Same column — switch selection
        document.getElementById(state.matchSelected.elId).classList.remove('selected');
        state.matchSelected = { type, index, value, elId };
        el.classList.add('selected');
      } else {
        // Different column — check match
        const heb = type === 'heb' ? value : state.matchSelected.value;
        const eng = type === 'eng' ? value : state.matchSelected.value;
        const pair = state.matchPairs.find(p => p.heb === heb && p.eng === eng);

        if (pair) {
          el.classList.add('matched');
          document.getElementById(state.matchSelected.elId).classList.add('matched');
          el.classList.remove('selected');
          document.getElementById(state.matchSelected.elId).classList.remove('selected');
          state.matchedCount++;

          if (state.matchedCount === state.matchPairs.length) {
            setTimeout(() => {
              this.renderLessonComplete(document.getElementById('content'));
            }, 600);
          }
        } else {
          // Wrong match — show shake animation
          el.classList.add('selected', 'shake');
          document.getElementById(state.matchSelected.elId).classList.add('shake');
          setTimeout(() => {
            el.classList.remove('selected', 'shake');
            document.getElementById(state.matchSelected.elId).classList.remove('selected', 'shake');
            state.matchSelected = null;
          }, 600);
          return;
        }
        state.matchSelected = null;
      }
    }
  },

  // -------------------------------------------
  // Vowel Lesson
  // -------------------------------------------
  startVowelLesson(el, groupId) {
    const group = VOWEL_GROUPS.find(g => g.id === groupId);
    const vowels = HEBREW_VOWELS.filter(v => v.group === groupId);

    this.lessonState = {
      type: 'vowel',
      groupId,
      vowels,
      phase: 'flashcard',
      currentIndex: 0,
      score: 0,
      totalQuestions: 0,
      quizQuestions: [],
    };

    this.renderVowelFlashcards(el, group, vowels);
  },

  renderVowelFlashcards(el, group, vowels) {
    const state = this.lessonState;
    const vowel = vowels[state.currentIndex];
    const progress = vowels.map((_, i) =>
      i < state.currentIndex ? 'done' : i === state.currentIndex ? 'active' : ''
    ).map(cls => `<div class="step ${cls}"></div>`).join('');

    el.innerHTML = `
      <div class="lesson-header">
        <h1>${group.name}</h1>
        <p>${group.subtitle} — tap the card to flip it</p>
      </div>
      <div class="lesson-progress">${progress}</div>

      <div class="flashcard-container">
        <div class="flashcard" id="flashcard" onclick="document.getElementById('flashcard').classList.toggle('flipped')">
          <div class="flashcard-face flashcard-front">
            <div class="letter" style="font-size: 5rem;">${vowel.symbol}</div>
            <div class="hint">Tap to reveal</div>
          </div>
          <div class="flashcard-face flashcard-back">
            <div class="name">${vowel.name}</div>
            <div class="pronunciation">${vowel.sound}</div>
            <div class="description">${vowel.description}</div>
            <button class="speak-btn" onclick="event.stopPropagation(); app.speakHebrew('${vowel.symbol}')" title="Listen">
              <i class="fa-solid fa-volume-high"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="flashcard-nav">
        ${state.currentIndex > 0 ? '<button class="btn btn-outline btn-sm" onclick="app.prevVowelCard()">Previous</button>' : '<div></div>'}
        ${state.currentIndex < vowels.length - 1
          ? '<button class="btn btn-primary btn-sm" onclick="app.nextVowelCard()">Next Vowel</button>'
          : '<button class="btn btn-primary btn-sm" onclick="app.startVowelQuiz()">Start Quiz</button>'
        }
      </div>
    `;
  },

  nextVowelCard() {
    this.lessonState.currentIndex++;
    const group = VOWEL_GROUPS.find(g => g.id === this.lessonState.groupId);
    this.renderVowelFlashcards(document.getElementById('content'), group, this.lessonState.vowels);
  },

  prevVowelCard() {
    this.lessonState.currentIndex--;
    const group = VOWEL_GROUPS.find(g => g.id === this.lessonState.groupId);
    this.renderVowelFlashcards(document.getElementById('content'), group, this.lessonState.vowels);
  },

  startVowelQuiz() {
    const state = this.lessonState;
    state.phase = 'quiz';
    state.currentIndex = 0;
    state.score = 0;

    const questions = [];
    state.vowels.forEach(v => {
      questions.push({
        type: 'identify',
        prompt: 'What vowel is this?',
        display: v.symbol,
        displayClass: 'hebrew-char',
        correct: `${v.name} (${v.transliteration})`,
        hebrewAudio: v.symbol,
        options: this.getRandomOptions(
          `${v.name} (${v.transliteration})`,
          HEBREW_VOWELS.map(vw => `${vw.name} (${vw.transliteration})`),
          4
        ),
      });
      questions.push({
        type: 'sound',
        prompt: `Which vowel makes the "${v.sound}" sound?`,
        display: v.sound,
        displayClass: '',
        correct: v.symbol,
        hebrewAudio: v.symbol,
        options: this.getRandomOptions(v.symbol, HEBREW_VOWELS.map(vw => vw.symbol), 4),
        optionClass: 'option-hebrew',
      });
    });

    state.quizQuestions = this.shuffleArray(questions);
    state.totalQuestions = state.quizQuestions.length;
    this.renderQuizQuestion(document.getElementById('content'));
  },

  // -------------------------------------------
  // Chapter Lesson (John)
  // -------------------------------------------
  startChapterLesson(el, chapterId) {
    const chapter = JOHN_CHAPTERS[chapterId];
    if (!chapter) return;

    this.lessonState = {
      type: 'chapter',
      chapterId,
      chapter,
      phase: 'vocab', // vocab -> read -> quiz -> complete
      currentIndex: 0,
      score: 0,
      totalQuestions: 0,
      quizQuestions: [],
      currentTab: 'vocab',
    };

    this.renderChapterView(el);
  },

  renderChapterView(el) {
    const state = this.lessonState;
    const chapter = state.chapter;

    el.innerHTML = `
      <div class="lesson-header">
        <h1>John Chapter ${state.chapterId}</h1>
        <p class="hebrew" style="font-size:1.3rem; color: var(--gold);">${chapter.titleHebrew}</p>
        <p>${chapter.title}</p>
      </div>

      <div class="tabs">
        <button class="tab ${state.currentTab === 'vocab' ? 'active' : ''}" onclick="app.switchChapterTab('vocab')">Vocabulary</button>
        <button class="tab ${state.currentTab === 'read' ? 'active' : ''}" onclick="app.switchChapterTab('read')">Read</button>
        <button class="tab ${state.currentTab === 'practice' ? 'active' : ''}" onclick="app.switchChapterTab('practice')">Practice</button>
      </div>

      <div id="chapter-content"></div>
    `;

    this.renderChapterTab();
  },

  switchChapterTab(tab) {
    this.lessonState.currentTab = tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    this.renderChapterTab();
  },

  renderChapterTab() {
    const state = this.lessonState;
    const container = document.getElementById('chapter-content');

    switch (state.currentTab) {
      case 'vocab':
        this.renderVocabTab(container);
        break;
      case 'read':
        this.renderReadTab(container);
        break;
      case 'practice':
        this.renderPracticeTab(container);
        break;
    }
  },

  renderVocabTab(el) {
    const chapter = this.lessonState.chapter;
    const prefixes = COMMON_BIBLICAL_WORDS.slice(0, 5);

    el.innerHTML = `
      <div class="section-title">Key Vocabulary</div>
      <p style="color: var(--text-secondary); margin-bottom: 16px;">Tap a word to hear its pronunciation</p>
      <div class="vocab-list">
        ${chapter.vocabulary.map(v => `
          <div class="vocab-item" onclick="app.speakHebrew('${v.heb}')">
            <div class="vocab-hebrew">${v.heb}</div>
            <div class="vocab-transliteration">${v.translit}</div>
            <div class="vocab-meaning">${v.meaning}</div>
          </div>
        `).join('')}
      </div>

      <div class="section-title" style="margin-top: 32px;">Common Prefixes</div>
      <p style="color: var(--text-secondary); margin-bottom: 16px;">These tiny prefixes appear everywhere in Biblical Hebrew</p>
      <div class="vocab-list">
        ${prefixes.map(w => `
          <div class="vocab-item" onclick="app.speakHebrew('${w.heb}')">
            <div class="vocab-hebrew">${w.heb}</div>
            <div class="vocab-transliteration">${w.translit}</div>
            <div class="vocab-meaning">${w.meaning}${w.note ? ' — <em>' + w.note + '</em>' : ''}</div>
          </div>
        `).join('')}
      </div>
    `;
  },

  // Build a lookup dictionary from chapter vocabulary for interlinear tooltips
  // Strip all niqqud (vowel points) for consonant-only matching
  _stripNiqqud(text) {
    return text.replace(/[\u05B0-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7]/g, '');
  },

  // Auto-transliterate Hebrew text (approximate pronunciation for unmatched words)
  _transliterate(text) {
    const consonants = {
      '\u05D0': '', '\u05D1': 'v', '\u05D2': 'g', '\u05D3': 'd',
      '\u05D4': 'h', '\u05D5': 'v', '\u05D6': 'z', '\u05D7': 'kh',
      '\u05D8': 't', '\u05D9': 'y', '\u05DA': 'kh', '\u05DB': 'kh',
      '\u05DC': 'l', '\u05DD': 'm', '\u05DE': 'm', '\u05DF': 'n',
      '\u05E0': 'n', '\u05E1': 's', '\u05E2': '', '\u05E3': 'f',
      '\u05E4': 'f', '\u05E5': 'ts', '\u05E6': 'ts', '\u05E7': 'q',
      '\u05E8': 'r', '\u05E9': 'sh', '\u05EA': 't',
    };
    const vowels = {
      '\u05B7': 'a', '\u05B8': 'a', '\u05B2': 'a',   // patach, qamats, chataf patach
      '\u05B6': 'e', '\u05B5': 'ei', '\u05B1': 'e',   // segol, tsere, chataf segol
      '\u05B4': 'i',                                     // chiriq
      '\u05B9': 'o', '\u05BA': 'o', '\u05B3': 'o',     // cholam, cholam chaser, chataf qamats
      '\u05BB': 'u',                                     // qubbuts
      '\u05B0': '',                                      // shva (usually silent)
    };
    let result = '';
    let prevWasConsonant = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (consonants[ch] !== undefined) {
        // Check for dagesh (next char) — changes b/k/p
        const next = text[i + 1];
        if (next === '\u05BC') { // dagesh
          if (ch === '\u05D1') { result += 'b'; i++; }
          else if (ch === '\u05DB' || ch === '\u05DA') { result += 'k'; i++; }
          else if (ch === '\u05E4' || ch === '\u05E3') { result += 'p'; i++; }
          else if (ch === '\u05EA') { result += 't'; i++; }
          else { result += consonants[ch]; i++; }
        }
        // Check for shin/sin dot
        else if (next === '\u05C1') { result += 'sh'; i++; } // shin dot
        else if (next === '\u05C2') { result += 's'; i++; }  // sin dot
        // Vav as vowel holder
        else if (ch === '\u05D5' && (next === '\u05B9' || next === '\u05BA')) {
          result += 'o'; i++; // cholam malei
        } else if (ch === '\u05D5' && next === '\u05BC') {
          result += 'u'; i++; // shureq
        } else {
          result += consonants[ch];
        }
        prevWasConsonant = true;
      } else if (vowels[ch] !== undefined) {
        result += vowels[ch];
        prevWasConsonant = false;
      } else if (ch === '\u05BC') {
        // dagesh without preceding consonant match — skip
      } else if (ch === '\u05BE') {
        result += '-'; // maqaf
      }
      // skip other marks
    }
    return result || text;
  },

  // Common Hebrew consonantal prefixes (after niqqud removal)
  _consonantPrefixes: [
    'וה', 'וב', 'ול', 'ומ', 'וכ', 'וש',  // vav + prefix
    'שב', 'שה', 'של', 'שמ',               // she + prefix
    'מה',                                    // min-ha
    'ב', 'ל', 'מ', 'כ', 'ש', 'ה', 'ו',    // single prefixes
  ],

  _buildVocabDict(chapter) {
    const dict = {};       // exact pointed keys
    const consDict = {};   // consonant-only keys (niqqud stripped)

    const addEntry = (entry) => {
      dict[entry.heb] = entry;
      const cons = this._stripNiqqud(entry.heb);
      if (!consDict[cons]) consDict[cons] = entry;
    };

    if (chapter.vocabulary) {
      chapter.vocabulary.forEach(addEntry);
    }
    COMMON_BIBLICAL_WORDS.forEach(addEntry);

    // Also add vocabulary from ALL chapters for cross-chapter matching
    for (let i = 1; i <= 21; i++) {
      const ch = JOHN_CHAPTERS[i];
      if (ch && ch.vocabulary) {
        ch.vocabulary.forEach(v => {
          if (!dict[v.heb]) addEntry(v);
        });
      }
    }

    return { dict, consDict };
  },

  _lookupWord(token, vocabData) {
    const { dict, consDict } = vocabData;

    // 1. Exact match (with niqqud)
    let entry = dict[token];
    if (entry) return entry;

    // 2. Consonant-only match
    const cons = this._stripNiqqud(token);
    entry = consDict[cons];
    if (entry) return entry;

    // 3. Try stripping prefixes on consonantal text
    for (const prefix of this._consonantPrefixes) {
      if (cons.startsWith(prefix) && cons.length > prefix.length + 1) {
        const root = cons.slice(prefix.length);
        entry = consDict[root];
        if (entry) return entry;
      }
    }

    // 4. Try stripping common suffixes (possessive pronouns, plural)
    const suffixes = ['ים', 'ות', 'יו', 'יה', 'הם', 'הן', 'ני', 'נו', 'כם', 'ך', 'ו', 'ה', 'י'];
    for (const suffix of suffixes) {
      if (cons.endsWith(suffix) && cons.length > suffix.length + 1) {
        const stem = cons.slice(0, -suffix.length);
        entry = consDict[stem];
        if (entry) return entry;
        // Also try with prefix + suffix stripping
        for (const prefix of this._consonantPrefixes) {
          if (stem.startsWith(prefix) && stem.length > prefix.length + 1) {
            entry = consDict[stem.slice(prefix.length)];
            if (entry) return entry;
          }
        }
      }
    }

    return null;
  },

  // Render a verse's Hebrew text with word tooltips
  _renderVerseWords(verse, vocabData, chapterId) {
    // If verse has per-word annotation, use it
    if (verse.words && verse.words.length > 0) {
      return verse.words.map(w => `
        <span class="verse-word">
          ${w.heb}
          <span class="word-tooltip">
            <strong>${w.meaning}</strong><br>
            <em>${w.translit}</em>
          </span>
        </span>
      `).join(' ');
    }

    // Otherwise, tokenize Hebrew text and look up words in dictionary
    const tokens = verse.hebrew.split(/\s+/);
    return tokens.map(token => {
      // Split maqaf-joined words (e.g., כָּל־שָׂרִיג) into sub-words
      const hasMaqaf = token.includes('\u05BE');
      if (hasMaqaf) {
        const parts = token.split('\u05BE');
        return parts.map((part, i) => {
          const clean = part.replace(/[\u05C3\u0591-\u05AF.:,;]/g, '');
          const entry = this._lookupWord(clean, vocabData);
          const display = i < parts.length - 1 ? part + '\u05BE' : part;
          if (entry) {
            return `<span class="verse-word">${display}<span class="word-tooltip"><strong>${entry.meaning}</strong><br><em>${entry.translit}</em></span></span>`;
          }
          const translit = this._transliterate(clean);
          return `<span class="verse-word">${display}<span class="word-tooltip word-tooltip-translit"><em>${translit}</em></span></span>`;
        }).join('');
      }

      // Clean punctuation for lookup (sof-pasuq, etc.) but display original
      const clean = token.replace(/[\u05C3\u0591-\u05AF.:,;]/g, '');
      const entry = this._lookupWord(clean, vocabData);

      if (entry) {
        return `<span class="verse-word">
          ${token}
          <span class="word-tooltip">
            <strong>${entry.meaning}</strong><br>
            <em>${entry.translit}</em>
          </span>
        </span>`;
      }
      const translit = this._transliterate(clean);
      return `<span class="verse-word">
        ${token}
        <span class="word-tooltip word-tooltip-translit">
          <em>${translit}</em>
        </span>
      </span>`;
    }).join(' ');
  },

  renderReadTab(el) {
    const chapter = this.lessonState.chapter;
    const vocabDict = this._buildVocabDict(chapter);

    el.innerHTML = `
      <div class="section-title">Interlinear Reading</div>
      <p style="color: var(--text-secondary); margin-bottom: 20px;">${'ontouchstart' in window ? 'Tap' : 'Hover over'} Hebrew words to see their meaning. Tap the verse for audio.</p>
      <div class="verse-reader">
        ${chapter.verses.map(v => `
          <div class="verse-block">
            <div class="verse-ref">John ${this.lessonState.chapterId}:${v.num}</div>
            <div class="verse-hebrew" onclick="app.speakHebrew(\`${v.hebrew}\`)">
              ${this._renderVerseWords(v, vocabDict, this.lessonState.chapterId)}
            </div>
            <div class="verse-english">${v.esv}</div>
          </div>
        `).join('')}
      </div>
    `;

    // Clamp tooltips so they don't overflow off-screen on mobile
    el.querySelectorAll('.verse-word').forEach(word => {
      word.addEventListener('mouseenter', () => this._clampTooltip(word));
      word.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        this._clampTooltip(word);
      }, { passive: true });
    });
  },

  _clampTooltip(wordEl) {
    const tip = wordEl.querySelector('.word-tooltip');
    if (!tip) return;
    tip.style.left = '50%';
    tip.style.transform = 'translateX(-50%)';
    requestAnimationFrame(() => {
      const rect = tip.getBoundingClientRect();
      if (rect.left < 4) {
        const shift = 4 - rect.left;
        tip.style.left = `calc(50% + ${shift}px)`;
      } else if (rect.right > window.innerWidth - 4) {
        const shift = rect.right - window.innerWidth + 4;
        tip.style.left = `calc(50% - ${shift}px)`;
      }
    });
  },

  renderPracticeTab(el) {
    const state = this.lessonState;
    const chapter = state.chapter;

    el.innerHTML = `
      <div class="section-title">Practice Exercises</div>
      <p style="color: var(--text-secondary); margin-bottom: 20px;">Test your knowledge of this chapter's vocabulary</p>

      <div class="lesson-list">
        <div class="lesson-card current" onclick="app.startVocabQuiz()">
          <div class="lesson-icon aleph">?</div>
          <div class="lesson-info">
            <h3>Vocabulary Quiz</h3>
            <p>Match Hebrew words to their English meanings</p>
          </div>
          <span class="lesson-badge badge-current">Start</span>
        </div>

        <div class="lesson-card current" onclick="app.startVocabMatching()">
          <div class="lesson-icon vowel">↔</div>
          <div class="lesson-info">
            <h3>Matching Game</h3>
            <p>Connect Hebrew words with their translations</p>
          </div>
          <span class="lesson-badge badge-current">Start</span>
        </div>

        <div class="lesson-card current" onclick="app.startFillBlank()">
          <div class="lesson-icon chapter">_</div>
          <div class="lesson-info">
            <h3>Fill in the Blank</h3>
            <p>Complete verses with the missing Hebrew word</p>
          </div>
          <span class="lesson-badge badge-current">Start</span>
        </div>

        <div class="lesson-card current" onclick="app.startVerseReconstruction()">
          <div class="lesson-icon aleph">📝</div>
          <div class="lesson-info">
            <h3>Verse Builder</h3>
            <p>Arrange Hebrew words to reconstruct a verse</p>
          </div>
          <span class="lesson-badge badge-current">Start</span>
        </div>
      </div>

      <div style="text-align: center; margin-top: 32px;">
        <button class="btn btn-primary btn-lg" onclick="app.markChapterComplete()">
          Complete Chapter ${state.chapterId}
        </button>
      </div>
    `;
  },

  // -------------------------------------------
  // Vocabulary Quiz (Chapter)
  // -------------------------------------------
  startVocabQuiz() {
    const state = this.lessonState;
    const chapter = state.chapter;
    state.phase = 'quiz';
    state.currentIndex = 0;
    state.score = 0;

    const questions = [];
    chapter.vocabulary.forEach(v => {
      questions.push({
        type: 'identify',
        prompt: 'What does this word mean?',
        display: v.heb,
        displayClass: 'hebrew-word',
        correct: v.meaning,
        hebrewAudio: v.heb,
        options: this.getRandomOptions(v.meaning, chapter.vocabulary.map(w => w.meaning), 4),
      });
    });

    state.quizQuestions = this.shuffleArray(questions).slice(0, 10);
    state.totalQuestions = state.quizQuestions.length;
    this.renderQuizQuestion(document.getElementById('content'));
  },

  // -------------------------------------------
  // Vocabulary Matching (Chapter)
  // -------------------------------------------
  startVocabMatching() {
    const state = this.lessonState;
    const chapter = state.chapter;
    state.phase = 'matching';

    const pairs = this.shuffleArray([...chapter.vocabulary]).slice(0, 5).map(v => ({
      heb: v.heb, eng: v.meaning
    }));

    const shuffledEng = this.shuffleArray([...pairs.map(p => p.eng)]);
    const shuffledHeb = this.shuffleArray([...pairs.map(p => p.heb)]);

    state.matchPairs = pairs;
    state.matchSelected = null;
    state.matchedCount = 0;

    const el = document.getElementById('content');
    el.innerHTML = `
      <div class="lesson-header">
        <h1>Match the Words</h1>
        <p>Tap a Hebrew word, then tap its English meaning</p>
      </div>

      <div class="matching-container">
        <div class="matching-column">
          <h3>Hebrew</h3>
          ${shuffledHeb.map((h, i) => `
            <div class="match-item" id="match-heb-${i}" onclick="app.handleMatchClick('heb', ${i}, '${this.escapeStr(h)}')">
              <div class="hebrew-text">${h}</div>
              <button class="speak-btn speak-btn-sm" onclick="event.stopPropagation(); app.speakHebrew('${this.escapeStr(h)}')" title="Listen"><i class="fa-solid fa-volume-high"></i></button>
            </div>
          `).join('')}
        </div>
        <div class="matching-column">
          <h3>English</h3>
          ${shuffledEng.map((e, i) => `
            <div class="match-item" id="match-eng-${i}" onclick="app.handleMatchClick('eng', ${i}, '${this.escapeStr(e)}')">
              ${e}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // -------------------------------------------
  // Fill in the Blank
  // -------------------------------------------
  // Get Hebrew words array from a verse (handles both annotated and plain verses)
  _getVerseWords(verse) {
    if (verse.words && verse.words.length > 0) {
      return verse.words.map(w => w.heb);
    }
    return verse.hebrew.split(/\s+/);
  },

  startFillBlank() {
    const state = this.lessonState;
    const chapter = state.chapter;
    state.phase = 'fillblank';
    state.currentIndex = 0;

    // Pick verses with enough words
    state.fillVerses = chapter.verses.filter(v => this._getVerseWords(v).length >= 4).slice(0, 5);
    this.renderFillBlank(document.getElementById('content'));
  },

  renderFillBlank(el) {
    const state = this.lessonState;
    if (state.currentIndex >= state.fillVerses.length) {
      this.renderChapterView(el);
      return;
    }

    const verse = state.fillVerses[state.currentIndex];
    const words = this._getVerseWords(verse);
    // Pick a random word to blank out (prefer vocab words for better learning)
    const vocabSet = new Set(state.chapter.vocabulary.map(v => this._stripNiqqud(v.heb)));
    const vocabIndices = words.map((w, i) => ({ w, i }))
      .filter(x => vocabSet.has(this._stripNiqqud(x.w)));
    const blankIdx = vocabIndices.length > 0
      ? vocabIndices[Math.floor(Math.random() * vocabIndices.length)].i
      : Math.floor(Math.random() * words.length);
    const blankWord = words[blankIdx];

    // Build display with blank
    const displayWords = words.map((w, i) => {
      if (i === blankIdx) return `<span class="blank" id="blank-target">____</span>`;
      return w;
    });

    // Create choices (correct + 3 distractors from this chapter's vocab)
    const distractors = this.shuffleArray(
      state.chapter.vocabulary.filter(v => v.heb !== blankWord).map(v => v.heb)
    ).slice(0, 3);
    const choices = this.shuffleArray([blankWord, ...distractors]);

    el.innerHTML = `
      <div class="lesson-header">
        <h1>Fill in the Blank</h1>
        <p>John ${state.chapterId}:${verse.num} — Choose the missing word</p>
      </div>

      <div class="fill-blank-container">
        <div class="fill-blank-verse">${displayWords.join(' ')}</div>
        <p style="color: var(--text-secondary); margin-bottom: 16px; font-style: italic;">${verse.esv}</p>
        <div class="fill-blank-choices">
          ${choices.map(c => `
            <button class="fill-blank-choice" onclick="app.checkFillBlank('${this.escapeStr(c)}', '${this.escapeStr(blankWord)}')">
              <span class="hebrew-text">${c}</span>
              <button class="speak-btn speak-btn-sm speak-btn-inline" onclick="event.stopPropagation(); app.speakHebrew('${this.escapeStr(c)}')" title="Listen"><i class="fa-solid fa-volume-high"></i></button>
            </button>
          `).join('')}
        </div>
        <div id="fill-feedback" style="margin-top: 20px;"></div>
      </div>
    `;
  },

  checkFillBlank(selected, correct) {
    const isCorrect = selected === correct;
    const blank = document.getElementById('blank-target');
    const feedback = document.getElementById('fill-feedback');

    if (isCorrect) {
      blank.textContent = correct;
      blank.classList.add('filled');
      feedback.innerHTML = `
        <div class="quiz-feedback correct">
          <div class="feedback-text">Correct!</div>
          <div class="feedback-detail">${correct}</div>
        </div>
      `;
    } else {
      feedback.innerHTML = `
        <div class="quiz-feedback incorrect">
          <div class="feedback-text">Not quite</div>
          <div class="feedback-detail">The answer is: ${correct}</div>
        </div>
      `;
      blank.textContent = correct;
      blank.classList.add('filled');
    }

    document.querySelectorAll('.fill-blank-choice').forEach(c => c.style.pointerEvents = 'none');

    setTimeout(() => {
      this.lessonState.currentIndex++;
      this.renderFillBlank(document.getElementById('content'));
    }, 2000);
  },

  // -------------------------------------------
  // Verse Reconstruction (Word Order)
  // -------------------------------------------
  startVerseReconstruction() {
    const state = this.lessonState;
    const chapter = state.chapter;
    state.phase = 'reconstruct';
    state.currentIndex = 0;

    // Pick short verses (3-8 words)
    state.reconstructVerses = chapter.verses.filter(v => {
      const words = this._getVerseWords(v);
      return words.length >= 3 && words.length <= 8;
    }).slice(0, 3);
    state.placedWords = [];
    this.renderReconstruction(document.getElementById('content'));
  },

  renderReconstruction(el) {
    const state = this.lessonState;
    if (state.currentIndex >= state.reconstructVerses.length) {
      this.lessonState.currentTab = 'practice';
      this.renderChapterView(el);
      return;
    }

    const verse = state.reconstructVerses[state.currentIndex];
    const correctOrder = this._getVerseWords(verse);
    const shuffled = this.shuffleArray([...correctOrder]);
    state.placedWords = [];
    state.correctOrder = correctOrder;
    state.availableWords = shuffled.map((w, i) => ({ word: w, id: i, used: false }));

    el.innerHTML = `
      <div class="lesson-header">
        <h1>Verse Builder</h1>
        <p>Arrange the words in the correct order (right to left)</p>
        <p style="color: var(--text-secondary); font-style: italic; margin-top: 8px;">${verse.esv}</p>
        <button class="speak-btn" onclick="event.stopPropagation(); app.speakHebrew(\`${verse.hebrew}\`)" title="Listen to verse" style="margin-top: 8px;">
          <i class="fa-solid fa-volume-high"></i>
        </button>
      </div>

      <div style="max-width: 500px; margin: 0 auto;">
        <div id="placed-area" style="min-height: 60px; background: var(--bg-secondary); border-radius: var(--radius); padding: 16px; margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 8px; direction: rtl; justify-content: flex-start;">
          <span style="color: var(--text-muted); font-size: 0.9rem;" id="placeholder-text">Tap words below to build the verse...</span>
        </div>

        <div id="word-bank" style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;">
          ${state.availableWords.map(w => `
            <button class="fill-blank-choice" id="bank-${w.id}" onclick="app.placeWord(${w.id})">${w.word}</button>
          `).join('')}
        </div>

        <div id="reconstruct-feedback" style="margin-top: 20px; text-align: center;"></div>
      </div>
    `;
  },

  placeWord(id) {
    const state = this.lessonState;
    const wordObj = state.availableWords.find(w => w.id === id);
    if (!wordObj || wordObj.used) return;

    wordObj.used = true;
    state.placedWords.push(wordObj.word);

    // Update bank
    document.getElementById(`bank-${id}`).classList.add('used');

    // Update placed area
    const placed = document.getElementById('placed-area');
    const placeholder = document.getElementById('placeholder-text');
    if (placeholder) placeholder.remove();

    const chip = document.createElement('span');
    chip.className = 'fill-blank-choice';
    chip.style.cursor = 'pointer';
    chip.style.margin = '0';
    chip.textContent = wordObj.word;
    chip.onclick = () => {
      // Remove word from placed
      const idx = state.placedWords.indexOf(wordObj.word);
      if (idx > -1) state.placedWords.splice(idx, 1);
      wordObj.used = false;
      document.getElementById(`bank-${id}`).classList.remove('used');
      chip.remove();
      if (state.placedWords.length === 0) {
        placed.innerHTML = '<span style="color: var(--text-muted); font-size: 0.9rem;" id="placeholder-text">Tap words below to build the verse...</span>';
      }
    };
    placed.appendChild(chip);

    // Check if complete
    if (state.placedWords.length === state.correctOrder.length) {
      const isCorrect = state.placedWords.every((w, i) => w === state.correctOrder[i]);
      const feedback = document.getElementById('reconstruct-feedback');

      if (isCorrect) {
        feedback.innerHTML = `
          <div class="quiz-feedback correct">
            <div class="feedback-text">Perfect!</div>
            <div class="feedback-detail">You reconstructed the verse correctly!</div>
          </div>
        `;
        setTimeout(() => {
          state.currentIndex++;
          this.renderReconstruction(document.getElementById('content'));
        }, 2000);
      } else {
        feedback.innerHTML = `
          <div class="quiz-feedback incorrect">
            <div class="feedback-text">Not quite right</div>
            <div class="feedback-detail">Tap placed words to remove them and try again</div>
          </div>
        `;
      }
    }
  },

  // -------------------------------------------
  // Mark Chapter Complete
  // -------------------------------------------
  markChapterComplete() {
    const state = this.lessonState;
    this.progress.wordsLearned += state.chapter.vocabulary.length;
    this.completeLesson('chapter', state.chapterId);
    this.renderLessonComplete(document.getElementById('content'));
  },

  // -------------------------------------------
  // Lesson Complete Screen
  // -------------------------------------------
  renderLessonComplete(el) {
    const state = this.lessonState;
    const type = state.type;
    const id = type === 'alphabet' ? state.groupId : type === 'vowel' ? state.groupId : state.chapterId;

    // Complete lesson if quiz/matching phase
    if (state.phase === 'quiz' || state.phase === 'matching') {
      if (type === 'alphabet' || type === 'vowel') {
        this.completeLesson(type, id);
        if (type === 'alphabet') {
          this.progress.wordsLearned += state.letters.length;
        }
        this.saveProgress();
      }
    }

    const score = state.score;
    const total = state.totalQuestions;
    const pct = total > 0 ? Math.round((score / total) * 100) : 100;

    el.innerHTML = `
      <div class="lesson-complete">
        <div class="trophy">&#127942;</div>
        <h2>Lesson Complete!</h2>
        <p>Great work on your Hebrew journey!</p>
        ${total > 0 ? `
          <div class="score">${pct}%</div>
          <p>${score} out of ${total} correct</p>
        ` : ''}
        <div class="actions">
          <button class="btn btn-outline" onclick="app.navigate('home')">Back to Home</button>
          ${this.getNextLessonButton(type, id)}
        </div>
      </div>
    `;
  },

  getNextLessonButton(type, id) {
    if (type === 'alphabet') {
      const nextGroup = ALPHABET_GROUPS.find(g => g.id === id + 1);
      if (nextGroup) {
        return `<button class="btn btn-primary" onclick="app.navigate('alphabet-lesson', { groupId: ${id + 1} })">Next: ${nextGroup.name}</button>`;
      }
      // Move to vowels
      return `<button class="btn btn-primary" onclick="app.navigate('vowel-lesson', { groupId: 1 })">Start Vowels</button>`;
    }
    if (type === 'vowel') {
      const nextGroup = VOWEL_GROUPS.find(g => g.id === id + 1);
      if (nextGroup) {
        return `<button class="btn btn-primary" onclick="app.navigate('vowel-lesson', { groupId: ${id + 1} })">Next: ${nextGroup.name}</button>`;
      }
      // Move to chapters
      return `<button class="btn btn-primary" onclick="app.navigate('chapter', { chapterId: 1 })">Start John Chapter 1</button>`;
    }
    return '';
  },

  // -------------------------------------------
  // Utility Functions
  // -------------------------------------------
  shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  getRandomOptions(correct, pool, count) {
    const filtered = pool.filter(p => p !== correct);
    const shuffled = this.shuffleArray(filtered);
    const options = shuffled.slice(0, count - 1);
    options.push(correct);
    return this.shuffleArray(options);
  },

  escapeStr(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
  },
};

// -------------------------------------------
// Boot
// -------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
