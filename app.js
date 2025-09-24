/* Breakout per smartphone — pezzaliAPP (MIT) */
(() => {
  const cvs = document.getElementById('game');
  const ctx = cvs.getContext('2d');
  const zone = document.getElementById('touchZone');
  const btnPlayPause = document.getElementById('btnPlayPause');
  const btnRestart = document.getElementById('btnRestart');
  const btnSound = document.getElementById('btnSound');
  const elScore = document.getElementById('score');
  const elLives = document.getElementById('lives');
  const elBest = document.getElementById('best');

  // Stato base
  const state = {
    running: false,
    width: 0, height: 0,
    score: 0, lives: 3, best: Number(localStorage.getItem('brk_best')||0),
    sound: true,
    level: 1,
    bricks: [],
    ball: null,
    paddle: null,
    lastTs: 0
  };
  elBest.textContent = state.best;

  // Audio super semplice (beep via WebAudio)
  let audioCtx = null;
  function beep(freq=600, dur=0.04, vol=0.1){
    if(!state.sound) return;
    if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.frequency.value = freq;
    o.type = 'square';
    g.gain.value = vol;
    o.connect(g); g.connect(audioCtx.destination);
    o.start();
    setTimeout(()=>{ o.stop(); }, dur*1000);
  }

  // Layout responsivo: canvas piena larghezza; altezza dinamica
  function resize(){
    const maxW = Math.min(window.innerWidth, 720);
    const topH = document.querySelector('.topbar').offsetHeight;
    const footerH = 150; // spazio per info + touch zone
    let h = window.innerHeight - topH - footerH;
    h = Math.max(360, Math.min(h, 900));
    cvs.width = Math.floor(maxW * devicePixelRatio);
    cvs.height = Math.floor(h * devicePixelRatio);
    cvs.style.height = h + 'px';
    cvs.style.width = maxW + 'px';
    state.width = cvs.width; state.height = cvs.height;
    initOrScale();
  }
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);

  // Inizializza oggetti di gioco
  function initLevel(level=1){
    const W = state.width, H = state.height;
    const px = v => Math.max(1, Math.round(v * devicePixelRatio));

    // Paddle
    const padW = px(Math.min(W*0.18, 160*devicePixelRatio));
    const padH = px(10*devicePixelRatio);
    state.paddle = {
      w: padW, h: padH,
      x: (W - padW)/2,
      y: H - px(120*devicePixelRatio), // alto per lasciare spazio al pollice
      vx: 0, speed: px(0.9*devicePixelRatio)
    };

    // Ball
    const ballR = px(6*devicePixelRatio);
    state.ball = {
      x: W/2, y: H*0.6,
      vx: px((Math.random()<0.5?-1:1)*(0.42 + 0.08*level)*devicePixelRatio),
      vy: px(-0.55*devicePixelRatio - 0.05*level*devicePixelRatio),
      r: ballR
    };

    // Bricks
    const cols = 10, rows = Math.min(6 + level, 10);
    const margin = px(12*devicePixelRatio), gap = px(6*devicePixelRatio);
    const totalGapW = gap*(cols-1);
    const availW = W - margin*2 - totalGapW;
    const bw = Math.floor(availW/cols);
    const bh = px(18*devicePixelRatio);
    const top = px(60*devicePixelRatio);

    state.bricks = [];
    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        state.bricks.push({
          x: margin + c*(bw+gap),
          y: top + r*(bh+gap),
          w: bw, h: bh,
          hp: 1 + Math.floor(r/3), // alcuni più resistenti
          hue: 200 + r*10
        });
      }
    }
  }

  function initOrScale(){
    const keep = state.score>0 || state.bricks.length>0;
    if(!keep) initLevel(state.level);
  }

  // Disegno
  function roundRect(x,y,w,h,r){
    const rr = Math.min(r, w/2, h/2);
    ctx.beginPath();
    ctx.moveTo(x+rr,y);
    ctx.arcTo(x+w,y,x+w,y+h,rr);
    ctx.arcTo(x+w,y+h,x,y+h,rr);
    ctx.arcTo(x,y+h,x,y,rr);
    ctx.arcTo(x,y,x+w,y,rr);
    ctx.closePath();
  }

  function draw(){
    const W=state.width,H=state.height;
    ctx.clearRect(0,0,W,H);

    // Glow superiore
    const g=ctx.createLinearGradient(0,0,0,H*0.4);
    g.addColorStop(0,'rgba(11,95,255,0.25)');
    g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H*0.4);

    // Bricks
    for(const b of state.bricks){
      if(b.hp<=0) continue;
      ctx.fillStyle = `hsl(${b.hue} 80% 55%)`;
      roundRect(b.x,b.y,b.w,b.h,8*devicePixelRatio);
      ctx.fill();
      // bordo
      ctx.strokeStyle='rgba(255,255,255,0.15)';
      ctx.lineWidth=Math.max(1,1*devicePixelRatio);
      ctx.stroke();
    }

    // Paddle
    const p=state.paddle;
    ctx.fillStyle='#d1e3ff';
    roundRect(p.x,p.y,p.w,p.h,6*devicePixelRatio);
    ctx.fill();

    // Ball
    const ball=state.ball;
    const rad = ctx.createRadialGradient(ball.x,ball.y,ball.r*0.1, ball.x,ball.y,ball.r);
    rad.addColorStop(0,'#fff');
    rad.addColorStop(1,'#7fb0ff');
    ctx.fillStyle=rad;
    ctx.beginPath();
    ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);
    ctx.fill();
  }

  // Fisica & collisioni
  function step(dt){
    const p=state.paddle, b=state.ball, W=state.width, H=state.height;

    // Muovi paddle (inerzia minima)
    p.x += p.vx * dt;
    p.x = Math.max(0, Math.min(W - p.w, p.x));

    // Muovi palla
    b.x += b.vx * dt;
    b.y += b.vy * dt;

    // Pareti
    if(b.x - b.r <= 0){ b.x=b.r; b.vx*=-1; beep(300); }
    if(b.x + b.r >= W){ b.x=W-b.r; b.vx*=-1; beep(300); }
    if(b.y - b.r <= 0){ b.y=b.r; b.vy*=-1; beep(500); }

    // Paddle hit
    if(b.y + b.r >= p.y && b.y + b.r <= p.y + p.h && b.x >= p.x && b.x <= p.x + p.w && b.vy>0){
      b.y = p.y - b.r;
      // angolo in base al punto d'impatto
      const hit = ((b.x - (p.x + p.w/2)) / (p.w/2));
      const speed = Math.hypot(b.vx,b.vy)*1.02;
      const angle = hit * (Math.PI/3); // ±60°
      b.vx = speed * Math.sin(angle);
      b.vy = -Math.abs(speed * Math.cos(angle));
      beep(800);
    }

    // Mattoni
    for(const brick of state.bricks){
      if(brick.hp<=0) continue;
      if(b.x + b.r < brick.x || b.x - b.r > brick.x + brick.w ||
         b.y + b.r < brick.y || b.y - b.r > brick.y + brick.h) continue;

      // collisione semplice: inverti l’asse con penetrazione minore
      const overlapX = (brick.x + brick.w/2) - b.x;
      const overlapY = (brick.y + brick.h/2) - b.y;
      const halfW = brick.w/2 + b.r;
      const halfH = brick.h/2 + b.r;
      if(Math.abs(overlapX) < halfW && Math.abs(overlapY) < halfH){
        const penX = halfW - Math.abs(overlapX);
        const penY = halfH - Math.abs(overlapY);
        if(penX < penY){ b.vx *= -1; b.x += (overlapX>0? -penX: penX); }
        else{ b.vy *= -1; b.y += (overlapY>0? -penY: penY); }
        brick.hp -= 1;
        state.score += 10;
        elScore.textContent = state.score;
        beep(1000);
      }
    }

    // Fine livello?
    if(state.bricks.every(b=>b.hp<=0)){
      state.level++;
      initLevel(state.level);
      beep(1200,0.08);
      beep(1400,0.08);
    }

    // Persa palla?
    if(b.y - b.r > H){
      state.lives--;
      elLives.textContent = state.lives;
      beep(200,0.12);
      if(state.lives<=0){
        // game over
        state.running = false;
        btnPlayPause.textContent = '▶︎';
        // salva best
        if(state.score > state.best){
          state.best = state.score;
          localStorage.setItem('brk_best', state.best);
          elBest.textContent = state.best;
        }
      }else{
        // re-serve
        const padMid = state.paddle.x + state.paddle.w/2;
        state.ball.x = padMid;
        state.ball.y = state.paddle.y - state.ball.r - 4*devicePixelRatio;
        state.ball.vx = (Math.random()<0.5?-1:1) * Math.abs(state.ball.vx);
        state.ball.vy = -Math.abs(state.ball.vy);
      }
    }
  }

  // Game loop
  function loop(ts){
    if(!state.running){ draw(); return; }
    const dt = state.lastTs ? Math.min(32, ts - state.lastTs) : 16;
    state.lastTs = ts;
    step(dt);
    draw();
    requestAnimationFrame(loop);
  }

  // Controlli touch
  let dragging = false;
  function pointerToCanvasX(clientX){
    const rect = cvs.getBoundingClientRect();
    // scala per hiDPI
    const x = (clientX - rect.left) * (cvs.width / rect.width);
    return x;
  }
  function onTouchStart(e){
    dragging = true;
    if(!state.running){ toggleRun(true); }
    const touch = e.changedTouches[0];
    const x = pointerToCanvasX(touch.clientX);
    // centra paddle
    state.paddle.x = Math.max(0, Math.min(state.width - state.paddle.w, x - state.paddle.w/2));
    e.preventDefault();
  }
  function onTouchMove(e){
    if(!dragging) return;
    const touch = e.changedTouches[0];
    const x = pointerToCanvasX(touch.clientX);
    const prev = state.paddle.x;
    state.paddle.x = Math.max(0, Math.min(state.width - state.paddle.w, x - state.paddle.w/2));
    state.paddle.vx = (state.paddle.x - prev); // per dt pixel/frame
    e.preventDefault();
  }
  function onTouchEnd(){ dragging = false; state.paddle.vx = 0; }

  zone.addEventListener('touchstart', onTouchStart, {passive:false});
  zone.addEventListener('touchmove', onTouchMove, {passive:false});
  zone.addEventListener('touchend', onTouchEnd);

  // Tocco su canvas = pausa/continua
  cvs.addEventListener('touchstart', (e)=>{
    if(e.targetTouches.length===1){
      toggleRun();
      e.preventDefault();
    }
  }, {passive:false});

  // Tastiera (desktop)
  let keyLeft=false, keyRight=false;
  window.addEventListener('keydown', e=>{
    if(e.key==='ArrowLeft') keyLeft=true;
    if(e.key==='ArrowRight') keyRight=true;
    if(e.key===' '){ toggleRun(); }
    if(e.key.toLowerCase()==='r'){ restart(); }
  });
  window.addEventListener('keyup', e=>{
    if(e.key==='ArrowLeft') keyLeft=false;
    if(e.key==='ArrowRight') keyRight=false;
  });
  function pollKeys(){
    const p=state.paddle;
    if(keyLeft && !keyRight){ p.vx = -p.speed; p.x += p.vx; }
    else if(keyRight && !keyLeft){ p.vx = p.speed; p.x += p.vx; }
    else p.vx = 0;
    p.x = Math.max(0, Math.min(state.width - p.w, p.x));
  }
  setInterval(pollKeys, 16);

  // Bottoni UI
  function toggleRun(force){
    if(typeof force==='boolean') state.running = force;
    else state.running = !state.running;
    btnPlayPause.textContent = state.running ? '⏸' : '▶︎';
    state.lastTs = 0;
    requestAnimationFrame(loop);
  }
  function restart(){
    state.score = 0; state.lives = 3; state.level = 1;
    elScore.textContent = 0; elLives.textContent = 3;
    initLevel(1);
    toggleRun(true);
  }
  btnPlayPause.addEventListener('click', ()=>toggleRun());
  btnRestart.addEventListener('click', restart);
  btnSound.addEventListener('click', ()=>{
    state.sound = !state.sound;
    btnSound.textContent = state.sound ? '🔈' : '🔇';
  });

  // Avvio
  resize();
  draw();
})();
