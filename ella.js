// Interactive sequence logic for Ella
const startBtn = document.getElementById('startBtn');
const intro = document.getElementById('intro');
const game = document.getElementById('game');
const reveal = document.getElementById('reveal');
const heartField = document.getElementById('heartField');
const heartCountEl = document.getElementById('heartCount');
const cards = document.getElementById('cards');
const cardCountEl = document.getElementById('cardCount');
const unlockHintEl = document.getElementById('unlockHint');
const nextBtn = document.getElementById('nextBtn');
const question = document.getElementById('question');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const openLetterBtn = document.getElementById('openLetterBtn');
const revealTitle = document.getElementById('revealTitle');
const letterEl = document.getElementById('letter');
const downloadBtn = document.getElementById('downloadBtn');
const restartBtn = document.getElementById('restartBtn');
const sfxToggle = document.getElementById('sfxToggle');
const confettiCanvas = document.getElementById('confettiCanvas');

const musicToggle = document.getElementById('musicToggle');
const musicVolume = document.getElementById('musicVolume');
const bgMusic = document.getElementById('bgMusic');

let hearts = 0;
let flippedCards = 0;
let sfxOn = true;

// Initialize audio context early
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();


// Edit your love letter here.
const loveLetter = `My dearest Ella,

Hello, babyyyyy! Thank you ulit for loving me, love na love talaga kita. Andami ko talagang natutunan mula sayo. YKKKKKK, from the moment I saw your smile, something in my chest learned a new language. I learned to Love in ways I never expected. I am very grateful that I get to call you my Girlfriend. Napaka swerte ko na nakilala kita. I promise to always be there for you, support you, and Love you with everything I have. Alam ko marami tayong hindi pagkakaintindihan and I know we can work through anything. I love you more than words can express, and I cannot wait to experience all the adventures we will share together.

Yours always,
— Gabrot`;

function switchTo(from, to){
	from.classList.remove('active');
	to.classList.add('active');
	from.setAttribute('aria-hidden', 'true');
	to.removeAttribute('aria-hidden');
}

function updateUnlockStatus(){
	const unlocked = hearts >= 5 && flippedCards >= 3;
	nextBtn.disabled = !unlocked;
	unlockHintEl.textContent = unlocked ? 'You did it! Tap Next.' : `Collect ${Math.max(0, 5 - hearts)} more heart${hearts >= 4 ? '' : 's'} and flip ${Math.max(0, 3 - flippedCards)} more card${flippedCards >= 2 ? '' : 's'}.`;
}

function resetGameState(){
	hearts = 0;
	flippedCards = 0;
	heartCountEl.textContent = '0';
	cardCountEl.textContent = '0';
	heartField.innerHTML = '';
	unlockHintEl.textContent = 'Tap the heart field to begin.';
	nextBtn.disabled = true;
	document.querySelectorAll('.card').forEach(card => card.classList.remove('is-flipped'));
}

startBtn.addEventListener('click', ()=>{
	// resume audio context on first user gesture for some browsers
	if(audioCtx.state === 'suspended') audioCtx.resume();
	resetGameState();
	switchTo(intro, game);
	playSfx('start');
	startMusic();
});

heartField.addEventListener('click', ()=>{
	if(hearts >= 5) return;
	hearts++;
	heartCountEl.textContent = hearts;
	const el = document.createElement('div');
	el.className = 'heart';
	el.textContent = '❤';
	heartField.appendChild(el);
	playSfx('pop');
	updateUnlockStatus();
	if(hearts === 5){
		playSfx('unlock');
	}
});

// card flip interactions
// Make cards clickable and keyboard-accessible
cards.addEventListener('click', (e)=>{
	const card = e.target.closest('.card');
	if(!card) return;
	flipCard(card);
});

function flipCard(card){
	if(card.classList.contains('is-flipped')) return;
	card.classList.add('is-flipped');
	flippedCards++;
	cardCountEl.textContent = flippedCards;
	playSfx('flip');
	updateUnlockStatus();
}

// add tabindex and keyboard handlers to existing cards
document.querySelectorAll('.card').forEach(c=>{
	c.setAttribute('tabindex','0');
	c.addEventListener('keydown', (ev)=>{
		if(ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); flipCard(c); }
	});
});

nextBtn.addEventListener('click', ()=>{
	switchTo(game, question);
	playSfx('reveal');
});

let noDodgeCount = 0;

yesBtn.addEventListener('click', ()=>{
	switchTo(question, reveal);
	playConfetti();
	playSfx('unlock');
	noDodgeCount = 0;
});

noBtn.addEventListener('mouseenter', dodgeButton);
noBtn.addEventListener('touchstart', (e)=>{ e.stopPropagation(); dodgeButton(e); });
noBtn.addEventListener('click', (e)=>{ e.stopPropagation(); e.preventDefault(); dodgeButton(e); });

function dodgeButton(e){
	if(e) e.stopPropagation();
	noDodgeCount++;
	const randomX = 40 + Math.random() * (window.innerWidth - 120);
	const randomY = 100 + Math.random() * (window.innerHeight - 200);
	noBtn.classList.add('dodging');
	noBtn.style.left = randomX + 'px';
	noBtn.style.top = randomY + 'px';
	playSfx('pop');
	if(noDodgeCount === 1) {
		const hint = document.createElement('div');
		hint.style.cssText = 'position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%); background: rgba(136, 13, 30, 0.9); color: white; padding: 10px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; z-index: 1001; white-space: nowrap;';
		hint.textContent = 'Click YES! 😊';
		document.body.appendChild(hint);
		setTimeout(() => hint.remove(), 2000);
	}
}

let letterOpen = false;

openLetterBtn.addEventListener('click', ()=>{
	if(letterOpen) return;
	letterOpen = true;
	letterEl.hidden = false;
	letterEl.textContent = loveLetter;
	revealTitle.hidden = true;
	openLetterBtn.hidden = true;
	playSfx('paper');
});

downloadBtn.addEventListener('click', ()=>{
	const blob = new Blob([loveLetter], {type:'text/plain;charset=utf-8'});
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url; a.download = 'for-ella.txt'; document.body.appendChild(a); a.click(); a.remove();
	URL.revokeObjectURL(url);
});

restartBtn.addEventListener('click', ()=>{ location.reload(); });

sfxToggle.addEventListener('click', ()=>{ sfxOn = !sfxOn; sfxToggle.textContent = sfxOn ? '🔊' : '🔈'; });

// expose aria state for SFX toggle
sfxToggle.setAttribute('aria-pressed', String(sfxOn));
sfxToggle.addEventListener('click', ()=>{ sfxOn = !sfxOn; sfxToggle.textContent = sfxOn ? '🔊' : '🔈'; sfxToggle.setAttribute('aria-pressed', String(sfxOn)); });

// Background music using the uploaded MP3 file
let musicOn = false;

function startMusic(){
  if(musicOn) return;
  if(audioCtx.state === 'suspended') audioCtx.resume();
  bgMusic.volume = parseFloat(musicVolume.value || 0.6);
  const playPromise = bgMusic.play();
  if(playPromise && typeof playPromise.then === 'function') {
    playPromise.catch(()=>{});
  }
  musicOn = true;
  musicToggle.setAttribute('aria-pressed', 'true');
  musicToggle.textContent = '🎶';
}

function stopMusic(){
  if(!musicOn) return;
  bgMusic.pause();
  musicOn = false;
  musicToggle.setAttribute('aria-pressed', 'false');
  musicToggle.textContent = '🎵';
}

musicToggle.addEventListener('click', ()=>{
  if(audioCtx.state === 'suspended') audioCtx.resume();
  if(musicOn) stopMusic(); else startMusic();
});

musicVolume.addEventListener('input', ()=>{
  bgMusic.volume = parseFloat(musicVolume.value || 0.6);
});

// Simple sfx using WebAudio API
function playTone(freq, time=0.08){
	if(!sfxOn) return;
	const o = audioCtx.createOscillator();
	const g = audioCtx.createGain();
	o.type = 'sine'; 
	o.frequency.value = freq; 
	g.gain.value = 0;
	o.connect(g); 
	g.connect(audioCtx.destination);
	const now = audioCtx.currentTime;
	g.gain.linearRampToValueAtTime(0.08, now + 0.05);
	g.gain.linearRampToValueAtTime(0.0001, now + time);
	o.start(now); 
	o.stop(now + time);
}

function playRomanticChord(freq1, freq2, freq3, time=0.3){
	if(!sfxOn) return;
	[freq1, freq2, freq3].forEach((freq, idx)=>{
		const o = audioCtx.createOscillator();
		const g = audioCtx.createGain();
		o.type = 'sine'; 
		o.frequency.value = freq;
		g.gain.value = 0;
		o.connect(g); 
		g.connect(audioCtx.destination);
		const now = audioCtx.currentTime;
		g.gain.linearRampToValueAtTime(0.05, now + 0.08);
		g.gain.linearRampToValueAtTime(0.0001, now + time);
		o.start(now); 
		o.stop(now + time);
	});
}

function playSfx(name){
	return;
}

// Small confetti impl
function playConfetti(){
	const ctx = confettiCanvas.getContext('2d');
	const width = window.innerWidth;
	const height = window.innerHeight;
	confettiCanvas.width = width;
	confettiCanvas.height = height;
	const pieces = Array.from({length:120}).map(()=>({
		x: Math.random()*width,
		y: Math.random()*height - height,
		r: Math.random()*6+4,
		d: Math.random()*40+10,
		color: [getComputedStyle(document.documentElement).getPropertyValue('--raspberry').trim(), getComputedStyle(document.documentElement).getPropertyValue('--bubblegum-pink').trim(), getComputedStyle(document.documentElement).getPropertyValue('--pink-mist').trim()][Math.floor(Math.random()*3)],
		tilt: Math.random()*10-5,
		velocity: Math.random()*1.2 + 0.8
	}));

	let angle = 0;
	let animationFrameId = null;

	function draw(){
		ctx.clearRect(0,0,width,height);
		for(const p of pieces){
			ctx.beginPath(); ctx.fillStyle = p.color; ctx.ellipse(p.x, p.y, p.r, p.r/2, p.tilt, 0, Math.PI*2); ctx.fill();
			p.x += Math.sin(angle) * 1.4 + 0.3;
			p.y += p.velocity + 0.6;
			p.tilt += 0.02;
			if(p.y > height + 20){ p.y = -10; p.x = Math.random()*width; }
		}
		angle += 0.01;
		animationFrameId = requestAnimationFrame(draw);
	}

	if(animationFrameId) cancelAnimationFrame(animationFrameId);
	animationFrameId = requestAnimationFrame(draw);
}

// Mobile-friendly touch hint
(function addTapHint(){
	const hint = document.createElement('div'); hint.style.cssText = 'position:fixed;bottom:18px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,0.85);padding:8px 12px;border-radius:20px;color:var(--crushed-berry);font-weight:600;z-index:1000;font-size:13px';
	hint.textContent = 'Tap to collect hearts and flip cards';
	document.body.appendChild(hint);
	setTimeout(()=>hint.remove(),4200);
})();
