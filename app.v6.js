// Breakout mobile-first — riscritto da zero (MIT)
(() => {
  'use strict';

  // === DOM & HUD ===
  const cvs = document.getElementById('game');
  const ctx = cvs.getContext('2d');
  const zone = document.getElementById('touchZone');
  const btnPlayPause = document.getElementById('btnPlayPause');
  const btnRestart = document.getElementById('btnRestart');
  const btnFull = document.getElementById('btnFull');
  const elScore = document.getElementById('score');
  const elLives = document.getElementById('lives');
  const elLevel = document.getElementById('level');
  const elBest = document.getElementById('best');
  // === Face brick (special) ===
  const faceImg = new Image();
  let faceImgReady = false;
  faceImg.onload = ()=>{ faceImgReady = true; };
  faceImg.src = 'icons/face.png';


  // === Stato di gioco ===
  const GS = { MENU:0, PLAY:1, PAUSE:2, GAMEOVER:3 };
  const state = {
    gs: GS.MENU,
    width: 0, height: 0, // in pixel del canvas (hiDPI)
    dpr: Math.max(1, Math.floor(window.devicePixelRatio || 1)),
    score: 0, best: Number(localStorage.getItem('brk_best')||0),
    lives: 3, level: 1,
    paddle: null, ball: null, bricks: [],
    lastTs: 0,
    keyLeft: false, keyRight: false,
    pointerActive: false, pointerX: 0
  };
  elBest.textContent = state.best;

  // === Util ===
  function clamp(v,min,max){ return v<min?min:v>max?max:v; }
  function setHUD(){
    elScore.textContent = state.score;
    elLives.textContent = state.lives;
    elLevel.textContent = state.level;
    elBest.textContent = state.best;
  }

  // === Layout/Resize ===
  function resize(){
    state.dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const topH = document.querySelector('.topbar').offsetHeight;
    const footerH = document.querySelector('.foot').offsetHeight || 100;
    const zoneH = zone.getBoundingClientRect().height || 120;
    const maxW = Math.min(window.innerWidth, 820);
    let h = window.innerHeight - topH - zoneH - 24; // margine
    h = clamp(h, 340, 980);
    cvs.style.width = maxW + 'px';
    cvs.style.height = h + 'px';
    cvs.width = Math.floor(maxW * state.dpr);
    cvs.height = Math.floor(h * state.dpr);
    state.width = cvs.width; state.height = cvs.height;
    // Reinizializza mantenendo livello ma reset palla/paddle se serve
    initLevel(state.level, true);
    draw(); // frame statico
  }
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);

  // === Inizializzazione livello ===
  function initLevel(level=1, keepScore=false){
    const W = state.width, H = state.height, dpr = state.dpr;
    const px = v => Math.max(1, Math.round(v * dpr));

    if(!keepScore){
      state.score = 0; state.lives = 3; state.level = level;
      setHUD();
    }

    // Paddle
    const padW = clamp(Math.round(W*0.16), px(80), px(220));
    const padH = px(10);
    state.paddle = {
      w: padW, h: padH,
      x: (W - padW)/2,
      y: H - px(40), // spazio per pollice
      speed: px(700) // px/s
    };

    // Ball
    const ballR = px(6);
    const baseSpeed = px(300 + 22*(level-1)); // px/s
    // direzione iniziale verso alto con leggera componente X
    const dirX = (Math.random()<0.5? -1: 1) * 0.6;
    const norm = Math.hypot(dirX, -1);
    state.ball = {
      x: state.paddle.x + state.paddle.w/2,
      y: state.paddle.y - ballR - px(4),
      vx: baseSpeed * (dirX / norm),
      vy: baseSpeed * (-1 / norm),
      r: ballR, speed: baseSpeed
    };

    // Bricks
    const cols = 10, rows = Math.min(6 + level, 12);
    const marginX = px(14), gap = px(6);
    const top = px(60);
    const availW = W - marginX*2 - gap*(cols-1);
    const bw = Math.floor(availW/cols);
    const bh = px(18);

    const bricks = [];
    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        bricks.push({
          x: marginX + c*(bw+gap),
          y: top + r*(bh+gap),
          w: bw, h: bh,
          hp: 1 + Math.floor(r/4), // più in alto = più duri
          color: `hsl(${210 + r*9} 80% 60%)`
        });
      }
    }
    // Seleziona un mattone casuale speciale (face)
    if(bricks.length>0){
      const idx = Math.floor(Math.random()*bricks.length);
      bricks[idx].special = true;
    }
    state.bricks = bricks;
  }

  // === Disegno ===
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
  function drawBG(){
    const W=state.width,H=state.height;
    ctx.clearRect(0,0,W,H);
    const g=ctx.createLinearGradient(0,0,0,H*0.45);
    g.addColorStop(0,'rgba(11,95,255,0.25)');
    g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H*0.45);
  }
  function draw(){
    drawBG();
    // Bricks
    for(const b of state.bricks){
      if(b.hp<=0) continue;
      if(b.special && faceImgReady){
        // Clip al brick e disegna l'immagine
        roundRect(b.x,b.y,b.w,b.h,8*state.dpr);
        ctx.save();
        ctx.clip();
        // cover: mantieni proporzioni
        const iw = faceImg.width, ih = faceImg.height;
        const br = b.w/b.h; const ir = iw/ih;
        let dw=b.w, dh=b.h, dx=b.x, dy=b.y;
        if(ir>br){ dh=b.h; dw=dh*ir; dx=b.x-(dw-b.w)/2; dy=b.y; }
        else{ dw=b.w; dh=dw/ir; dx=b.x; dy=b.y-(dh-b.h)/2; }
        ctx.drawImage(faceImg, dx, dy, dw, dh);
        ctx.restore();
        // bordo
        ctx.lineWidth = Math.max(1, 1*state.dpr);
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        roundRect(b.x,b.y,b.w,b.h,8*state.dpr);
        ctx.stroke();
      } else {
        ctx.fillStyle = b.color;
        roundRect(b.x,b.y,b.w,b.h,8*state.dpr);
        ctx.fill();
        ctx.lineWidth = Math.max(1, 1*state.dpr);
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.stroke();
      }
    }
    // Paddle
    const p=state.paddle;
    ctx.fillStyle='#d1e3ff';
    roundRect(p.x,p.y,p.w,p.h,6*state.dpr);
    ctx.fill();
    // Ball
    const ball=state.ball;
    const rad = ctx.createRadialGradient(ball.x,ball.y,ball.r*0.1, ball.x,ball.y,ball.r);
    rad.addColorStop(0,'#fff');
    rad.addColorStop(1,'#7fb0ff');
    ctx.fillStyle=rad;
    ctx.beginPath(); ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2); ctx.fill();

    // Overlay per stati
    if(state.gs===GS.MENU || state.gs===GS.PAUSE || state.gs===GS.GAMEOVER){
      const W=state.width,H=state.height;
      ctx.fillStyle='rgba(0,0,0,0.35)';
      ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#eaeef6';
      ctx.textAlign='center';
      ctx.textBaseline='middle';
      ctx.font = `${Math.round(22*state.dpr)}px system-ui, -apple-system, Segoe UI, Roboto`;
      const line1 = state.gs===GS.GAMEOVER ? 'GAME OVER' : state.gs===GS.PAUSE ? 'PAUSA' : 'BREAKOUT';
      ctx.fillText(line1, W/2, H*0.44);
      ctx.font = `${Math.round(14*state.dpr)}px system-ui, -apple-system, Segoe UI, Roboto`;
      const line2 = state.gs===GS.MENU ? 'Tocca per iniziare • Trascina nella zona sotto per muovere' :
                    state.gs===GS.PAUSE ? 'Tocca per continuare' :
                    'Tocca per ripartire';
      ctx.fillText(line2, W/2, H*0.52);
    }
  }

  // === Fisica ===
  function step(dt){ // dt in secondi
    const p=state.paddle, b=state.ball, W=state.width, H=state.height;

    // Input tastiera
    if(state.keyLeft && !state.keyRight){ p.x -= p.speed*dt; }
    else if(state.keyRight && !state.keyLeft){ p.x += p.speed*dt; }

    // Input touch (segue il dito)
    if(state.pointerActive){
      const targetX = clamp(state.pointerX - p.w/2, 0, W - p.w);
      // interp lineare per evitare jitter
      const k = 20; // responsività
      p.x += clamp((targetX - p.x) * k * dt, -p.speed*dt*1.2, p.speed*dt*1.2);
    }

    p.x = clamp(p.x, 0, W - p.w);

    // Palla
    b.x += b.vx * dt;
    b.y += b.vy * dt;

    // Pareti
    if(b.x - b.r <= 0){ b.x = b.r; b.vx *= -1; }
    if(b.x + b.r >= W){ b.x = W - b.r; b.vx *= -1; }
    if(b.y - b.r <= 0){ b.y = b.r; b.vy *= -1; }

    // Paddle collision
    if(b.vy>0 && b.y + b.r >= p.y && b.y - b.r <= p.y + p.h && b.x >= p.x && b.x <= p.x + p.w){
      b.y = p.y - b.r;
      // angolo: punto d'impatto -> -60°…+60°
      const hit = ((b.x - (p.x + p.w/2)) / (p.w/2));
      const angle = hit * (Math.PI/3);
      const speed = Math.hypot(b.vx,b.vy) * 1.006; // leggero aumento
      b.vx = speed * Math.sin(angle);
      b.vy = -Math.abs(speed * Math.cos(angle));
    }

    // Mattoni collision (AABB)
    for(const brick of state.bricks){
      if(brick.hp<=0) continue;
      if(b.x + b.r < brick.x || b.x - b.r > brick.x + brick.w ||
         b.y + b.r < brick.y || b.y - b.r > brick.y + brick.h) continue;

      const cx = brick.x + brick.w/2, cy = brick.y + brick.h/2;
      const dx = b.x - cx, dy = b.y - cy;
      const px = (brick.w/2 + b.r) - Math.abs(dx);
      const py = (brick.h/2 + b.r) - Math.abs(dy);
      if(px < py){ b.vx *= -1; b.x += (dx<0? -px: px); }
      else{ b.vy *= -1; b.y += (dy<0? -py: py); }

      brick.hp -= 1;
state.score += 10;

// BONUS se era il mattone speciale (face)
if (brick.hp <= 0 && brick.special) {
  state.score += 100; // +100 punti extra
}

setHUD();

if (brick.hp <= 0) {
  // piccola chance di velocizzare la palla
  const boost = 1 + (Math.random() * 0.008);
  b.vx *= boost;
  b.vy *= boost;
}
    }

    // Fine livello?
    if(state.bricks.every(bk=>bk.hp<=0)){
      state.level++;
      setHUD();
      initLevel(state.level, true);
    }

    // Palla persa
    if(b.y - b.r > H){
      state.lives--;
      setHUD();
      if(state.lives<=0){
        // Best
        if(state.score > state.best){
          state.best = state.score;
          localStorage.setItem('brk_best', state.best);
        }
        state.gs = GS.GAMEOVER;
      }else{
        // re-serve
        state.ball.x = state.paddle.x + state.paddle.w/2;
        state.ball.y = state.paddle.y - state.ball.r - 4*state.dpr;
        state.ball.vx = (Math.random()<0.5?-1:1) * Math.abs(state.ball.vx);
        state.ball.vy = -Math.abs(state.ball.vy);
      }
    }
  }

  // === Loop ===
  function loop(ts){
    if(state.gs!==GS.PLAY){ draw(); return; }
    const t = ts || performance.now();
    const dtMs = state.lastTs ? (t - state.lastTs) : 16;
    state.lastTs = t;
    const dt = Math.min(0.033, dtMs/1000); // clamp a 33ms
    step(dt);
    draw();
    requestAnimationFrame(loop);
  }

  // === Input: touch & mouse ===
  function canvasXFromClient(clientX){
    const rect = cvs.getBoundingClientRect();
    return (clientX - rect.left) * (cvs.width / rect.width);
  }
  function onTZStart(e){
    state.pointerActive = true;
    const t = e.changedTouches[0];
    state.pointerX = canvasXFromClient(t.clientX);
    if(state.gs!==GS.PLAY){ startGame(); }
    e.preventDefault();
  }
  function onTZMove(e){
    if(!state.pointerActive) return;
    const t = e.changedTouches[0];
    state.pointerX = canvasXFromClient(t.clientX);
    e.preventDefault();
  }
  function onTZEnd(){ state.pointerActive = false; }

  zone.addEventListener('touchstart', onTZStart, {passive:false});
  zone.addEventListener('touchmove', onTZMove, {passive:false});
  zone.addEventListener('touchend', onTZEnd);

  // Tocco sul canvas: toggle pausa/gioca
  cvs.addEventListener('touchstart', (e)=>{
    if(e.targetTouches.length===1){
      if(state.gs===GS.PLAY) pauseGame();
      else if(state.gs===GS.PAUSE || state.gs===GS.MENU || state.gs===GS.GAMEOVER) startGame(true);
      e.preventDefault();
    }
  }, {passive:false});

  // Mouse (desktop)
  zone.addEventListener('mousedown', (e)=>{
    state.pointerActive = true;
    state.pointerX = canvasXFromClient(e.clientX);
    if(state.gs!==GS.PLAY) startGame();
  });
  zone.addEventListener('mousemove', (e)=>{
    if(!state.pointerActive) return;
    state.pointerX = canvasXFromClient(e.clientX);
  });
  window.addEventListener('mouseup', ()=>{ state.pointerActive=false; });

  // Tastiera
  window.addEventListener('keydown', e=>{
    if(e.key==='ArrowLeft') state.keyLeft = true;
    if(e.key==='ArrowRight') state.keyRight = true;
    if(e.key===' '){ if(state.gs===GS.PLAY) pauseGame(); else startGame(true); }
    if(e.key.toLowerCase()==='r'){ restart(); }
    if(e.key.toLowerCase()==='f'){ toggleFull(); }
  });
  window.addEventListener('keyup', e=>{
    if(e.key==='ArrowLeft') state.keyLeft = false;
    if(e.key==='ArrowRight') state.keyRight = false;
  });

  // === Bottoni UI ===
  function startGame(resume=false){
    if(state.gs===GS.GAMEOVER && !resume){ restart(); return; }
    state.gs = GS.PLAY;
    state.lastTs = 0;
    btnPlayPause.textContent = '⏸';
    requestAnimationFrame(loop);
  }
  function pauseGame(){
    state.gs = GS.PAUSE;
    btnPlayPause.textContent = '▶︎';
    draw();
  }
  function restart(){
    state.score = 0; state.lives = 3; state.level = 1;
    setHUD();
    initLevel(1, true);
    startGame();
  }
  function toggleFull(){
    const el = document.documentElement;
    if(!document.fullscreenElement){
      (el.requestFullscreen && el.requestFullscreen()) || (cvs.requestFullscreen && cvs.requestFullscreen());
    }else{
      document.exitFullscreen && document.exitFullscreen();
    }
  }

  btnPlayPause.addEventListener('click', ()=>{
    if(state.gs===GS.PLAY) pauseGame(); else startGame(true);
  });
  btnRestart.addEventListener('click', restart);
  btnFull.addEventListener('click', toggleFull);

  // Avvio
  resize();
  state.gs = GS.MENU;
  draw();
})();
