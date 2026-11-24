import { useEffect, useMemo, useRef, useState } from 'react';
import { timeline } from './data/timeline.js';
import { gallery } from './data/gallery.js';
import { memes } from './data/memes.js';
import { seals } from './data/seals.js';
import { reasons } from './data/reasons.js';
import { content } from './data/content.js';
import { tracks } from './data/music.js';

function imageUrl(folder, file) {
  return `${import.meta.env.BASE_URL}images/${folder}/${encodeURIComponent(file)}`;
}
function Asset({ folder, file, alt = '', className = '' }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [folder, file]);
  return failed ? <div className={`image-placeholder ${className}`}><span className="placeholder-icon">✧</span><b>PHOTO SLOT</b><small>{file}</small><small>public/images/{folder}/</small></div> : <img className={className} src={imageUrl(folder, file)} alt={alt || file} onError={() => setFailed(true)} />;
}
function SectionTitle({ eyebrow, children, id }) {
  return <div className="section-title" id={id}><span className="eyebrow">{eyebrow}</span><h2>{children}</h2><span className="title-spark">✳ ✦ ✳</span></div>;
}
function Player() {
  const audio = useRef(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [missing, setMissing] = useState(false);
  const current = tracks[index];
  const src = `${import.meta.env.BASE_URL}music/${encodeURIComponent(current.file)}`;
  useEffect(() => { setMissing(false); setTime(0); if (audio.current) { audio.current.pause(); audio.current.load(); } }, [index]);
  const select = (next) => { setIndex((next + tracks.length) % tracks.length); };
  const toggle = async () => {
    if (missing || !audio.current) return;
    if (playing) { audio.current.pause(); setPlaying(false); }
    else { try { await audio.current.play(); setPlaying(true); } catch { setPlaying(false); } }
  };
  const step = (delta) => { const wasPlaying = playing; const next = (index + delta + tracks.length) % tracks.length; setIndex(next); setPlaying(false); if (wasPlaying) window.setTimeout(() => audio.current?.play().then(() => setPlaying(true)).catch(() => {}), 80); };
  const progress = duration ? (time / duration) * 100 : 0;
  const fmt = (n) => `${Math.floor((n || 0) / 60)}:${String(Math.floor((n || 0) % 60)).padStart(2, '0')}`;
  return <div className="player-window window" aria-label="Музыкальный плеер">
    <div className="window-bar"><span>♫ WINDOWS MEDIA PLAYER</span><span className="window-controls">− □ ×</span></div>
    <div className="player-body">
      <div className={`cd ${playing ? 'spinning' : ''}`} aria-hidden="true"><div className="cd-label">POLINA<br/><small>20TH MIX</small></div></div>
      <div className="track-info"><div className="track-label">NOW PLAYING · {index + 1}/{tracks.length}</div><strong title={current.title}>{current.title}</strong><div className="equalizer" aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/></div></div>
      <div className="player-controls"><button aria-label="Предыдущая песня" onClick={() => step(-1)}>◀|</button><button className="play-button" aria-label={playing ? 'Пауза' : 'Play'} onClick={toggle}>{playing ? 'Ⅱ' : '▶'}</button><button aria-label="Следующая песня" onClick={() => step(1)}>|▶</button></div>
      <div className="seek-row"><span>{fmt(time)}</span><input aria-label="Позиция воспроизведения" type="range" min="0" max={duration || 100} value={duration ? time : 0} onChange={(e) => { if (audio.current && duration) audio.current.currentTime = Number(e.target.value); }} style={{ '--progress': `${progress}%` }} /><span>{fmt(duration)}</span></div>
      <div className="playlist">{tracks.map((track, i) => <button key={track.file} className={i === index ? 'active' : ''} onClick={() => select(i)}><span>{String(i + 1).padStart(2, '0')}</span> {track.title}</button>)}</div>
      {missing && <small className="audio-error">Не удалось открыть файл: public/music/{current.file}</small>}
      <audio ref={audio} src={src} preload="metadata" onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)} onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)} onEnded={() => step(1)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setMissing(true)} />
    </div>
  </div>;
}
function PhotoCard({ folder, photo, index, onOpen, style = {} }) {
  return <button className={`photo-card photo-card-${index % 4}`} style={style} onClick={() => onOpen({ folder, file: photo.file, caption: photo.caption })} aria-label={`Открыть фото ${photo.file}`}>
    <Asset folder={folder} file={photo.file} alt={photo.caption || 'Фотография из архива дружбы'} />
    <span className="photo-caption">{photo.caption || <span className="edit-hint">ваша подпись ✎</span>}</span><span className="tape" aria-hidden="true" />
  </button>;
}
function App() {
  const [lightbox, setLightbox] = useState(null);
  const [randomSeal, setRandomSeal] = useState(null);
  const [flipped, setFlipped] = useState({});
  const [showLove, setShowLove] = useState(false);
  const [topVisible, setTopVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setTopVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    const onKey = (e) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', onKey);
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('in-view'); }), { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('keydown', onKey); observer.disconnect(); };
  }, []);
  const allPhotos = useMemo(() => timeline.flatMap((period) => period.photos.map((photo) => ({ ...photo, folder: period.folder }))), []);
  return <>
    <header className="masthead" id="top">
      <div className="masthead-brand"><div className="brand-mark">♡</div><div><div className="site-logo">polina<span>space</span>.com <b>★</b></div><small>A tiny corner of the internet just for you</small></div></div>
      <div className="masthead-ribbon"><span>✦ A FRIENDSHIP TIME CAPSULE ✦</span><span className="date-pill">EST. BESTIES FOREVER</span></div>
      <div className="masthead-decor"><span className="chrome-heart">♥</span><span className="bubble-star">✧</span><span className="mini-player-icon">♫</span></div>
    </header>
    <nav className="main-nav" aria-label="Навигация по сайту"><div className="nav-inner">{[['top','home'],['story','our story'],['fame','hall of fame'],['memes','meme museum'],['seals','seal zone'],['reasons','20 reasons'],['letter','a letter']].map(([id,label]) => <a href={`#${id}`} key={id}>{label}</a>)}</div></nav>
    <main>
      <section className="hero page-grid" aria-labelledby="welcome-title">
        <div className="hero-copy">
          <div className="tiny-label"><span className="blink">●</span> YOU ARE VISITOR #000020</div>
          <h1 id="welcome-title"><span>HAPPY</span><em>20TH</em><span>BIRTHDAY!</span></h1>
          <div className="besties">BEST FRIENDS <b>4EVER</b> <span>♡</span></div>
          <p className="hero-note">{content.welcomeNote || 'WELCOME TO YOUR VERY OWN LITTLE WEB UNIVERSE ✧'}</p>
          <a className="enter-button" href="#story"><span>ENTER THE WEBSITE</span><b>➜</b></a>
          <div className="hero-stickers"><span className="sticker sticker-y2k">Y2K<br/>ANGEL</span><span className="stamp">100%<br/>BESTIE<br/>APPROVED</span><span className="sparkle-type">made with<br/>♡ & glitter</span></div>
        </div>
        <div className="hero-photo-area"><div className="floating-note note-top">HAPPY B-DAY<br/><b>GIRL!!</b> ✦</div><div className="hero-photo-frame"><div className="screen-top"><span>♥ BEST FRIENDS ♥</span><span>_ □ ×</span></div><button className="hero-photo" onClick={() => setLightbox({ ...content.heroPhoto, caption: '' })}><Asset folder={content.heroPhoto.folder} file={content.heroPhoto.file} alt="Совместное фото для главного экрана"/><span>CLICK TO OPEN ✧</span></button><div className="hero-frame-bottom">☆ FRIENDSHIP LOADING... 100% ☆</div></div><div className="floating-note note-bottom">YOU + ME<br/><b>∞</b> YEARS</div><div className="arrow-doodle">↘</div></div>
        <div className="hero-bottom-strip"><span>✧ BESTIES SINCE FOREVER ✧</span><span>NO. 1 FRIENDSHIP WEBSITE ON THE WEB</span><span>♡ MADE FOR POLINA ♡</span></div>
      </section>

      <div className="content-layout">
        <aside className="side-column"><div className="window status-window"><div className="window-bar"><span>my status</span><span>_ □ ×</span></div><div className="status-content"><div className="online-dot"/> <b>Polina's birthday mode</b><p>status: <strong>ICONIC at 20!</strong></p><div className="status-meter"><i/></div><small>friendship.exe is running</small></div></div><Player/><div className="side-sticker">✦<br/><b>BEST<br/>GIRL</b><br/>AWARD<br/>✦</div></aside>
        <div className="main-column">
          <section className="story-section section-block" aria-labelledby="story">
            <SectionTitle id="story" eyebrow="THE ARCHIVE · 5 CHAPTERS">Our Story</SectionTitle>
            <p className="section-intro">A little scrapbook of us, from way back when to right now. Add your own words to every chapter.</p>
            <div className="timeline">{timeline.map((period, pIndex) => <article className={`timeline-card reveal ${pIndex % 2 ? 'timeline-right' : ''}`} key={period.id}><div className="timeline-marker">{String(pIndex + 1).padStart(2,'0')}</div><div className="timeline-heading"><span className="period-sticker">MEMORY FILE</span><h3>{period.title}</h3><span className="period-star">✶</span></div><p className="period-note">{period.note || <span className="edit-hint">Write your memory for this chapter here ✎</span>}</p><div className="period-photos">{period.photos.map((photo, i) => <PhotoCard key={photo.file} folder={period.folder} photo={photo} index={i + pIndex} onOpen={setLightbox}/>)}</div></article>)}</div>
          </section>
          <section className="fame-section section-block" aria-labelledby="fame"><SectionTitle id="fame" eyebrow="THE BEST OF THE BEST · CLICK TO ZOOM">Hall of Fame</SectionTitle><p className="section-intro">Certified legendary moments. Your caption goes right under each photo.</p><div className="fame-grid">{gallery.map((photo,i) => <PhotoCard key={photo.file} folder="memories" photo={photo} index={i} onOpen={setLightbox} style={{'--tilt': `${[-4,2,-2,3,1,-3,4,-1,2,-4][i]}deg`}}/>)}</div><div className="fame-stamp">BEST<br/>MOMENTS<br/>EVER ★</div></section>
          <section className="meme-section section-block" aria-labelledby="memes"><SectionTitle id="memes" eyebrow="PRIVATE JOKE DATABASE // CLASSIFIED">Meme Museum</SectionTitle><div className="meme-warning">⚠ EXTREMELY SILLY CONTENT AHEAD ⚠</div><div className="meme-grid">{memes.map((item,i) => <button className={`meme-card meme-${i%3}`} key={item.file} onClick={() => setLightbox({folder:'memes',...item})}><Asset folder="memes" file={item.file} alt="Мем из личной коллекции"/><span className="meme-pin">{['✿','★','♡','✦','☻'][i]}</span></button>)}</div></section>
        </div>
      </div>

      <section className="seal-section section-block" aria-labelledby="seals"><div className="seal-header"><div><SectionTitle id="seals" eyebrow="A VERY IMPORTANT SCIENTIFIC ZONE">Seal Appreciation Zone</SectionTitle><p className="section-intro">Soft, round, perfect. Seal energy only.</p></div><button className="seal-button" onClick={() => setRandomSeal(seals[Math.floor(Math.random()*seals.length)])}>GIVE ME A SEAL <span>♡</span></button></div><div className="seal-gallery">{seals.map((seal,i) => <button className={`seal-card seal-${i}`} key={seal.file} onClick={() => setLightbox({folder:'seals',...seal})}><Asset folder="seals" file={seal.file} alt="Милый тюлень"/><span>{seal.caption || ['100% fluffy','seal of approval','round friend','little blubber buddy','ocean potato','certified cutie'][i]}</span><i>✧</i></button>)}</div>{randomSeal && <div className="seal-pop" role="status"><button className="pop-close" onClick={() => setRandomSeal(null)} aria-label="Закрыть">×</button><Asset folder="seals" file={randomSeal.file} alt="Ваш случайный тюлень"/><div><b>SEAL DELIVERED!</b><small>the ocean has chosen for you ✦</small></div></div>}</section>

      <section className="reasons-section section-block" aria-labelledby="reasons"><SectionTitle id="reasons" eyebrow="20 YEARS OF BEING THAT GIRL">20 Reasons Why You're Iconic</SectionTitle><p className="section-intro">Тапни карточку, чтобы перевернуть ее.</p><div className="reasons-grid">{reasons.map(({number,text}) => <button key={number} className={`reason-card ${flipped[number]?'flipped':''}`} onClick={() => setFlipped((prev) => ({...prev,[number]:!prev[number]}))} aria-label={`Карточка ${number}, ${flipped[number]?'закрыть':'открыть'}`}><span className="reason-front"><small>REASON</small><b>#{String(number).padStart(2,'0')}</b><i>♡</i><span>tap to reveal</span></span><span className="reason-back"><small>YOU'RE ICONIC BECAUSE...</small><b>{text || <span className="edit-hint">write your reason ✎</span>}</b></span></button>)}</div></section>

      <section className="letter-section section-block" aria-labelledby="letter"><div className="letter-paper"><div className="letter-top"><span>✧ A PRIVATE MESSAGE ✧</span><span>FOR YOUR 20TH ♥</span></div><SectionTitle id="letter" eyebrow="OPEN WHEN YOU NEED A LITTLE LOVE">A Letter For You</SectionTitle><div className="letter-layout"><button className="letter-photo" onClick={() => setLightbox({...content.letterPhoto,caption:content.photoNote})}><Asset folder={content.letterPhoto.folder} file={content.letterPhoto.file} alt="Фотография для письма"/><span>{content.photoNote || 'a favorite photo goes here ✎'}</span></button><div className="letter-copy"><p>{content.closingLetter || <span className="letter-placeholder">Your words go here...<br/><br/><br/><br/><br/><br/><br/>With all my love, ✎</span>}</p><button className={`final-button ${showLove?'celebrate':''}`} onClick={() => setShowLove(true)}>{showLove ? '♡ LOVE YOU TO THE MOON & BACK ♡' : 'CLICK FOR A FINAL HUG ♥'}</button>{showLove && <div className="love-burst" aria-live="polite">♡　✦　♡　✧　♡</div>}</div></div><div className="letter-decoration">♥</div><div className="letter-stars">✦ ✧ ✦</div></div></section>
      <footer className="footer"><span>© POLINASPACE · PERSONAL WEB ARCHIVE</span><span>made with <b>♥</b>, glitter & friendship</span><a href="#top">back to the top ↑</a></footer>
    </main>
    {topVisible && <a className="back-top" href="#top" aria-label="Наверх">↑</a>}
    {lightbox && <div className="lightbox" role="dialog" aria-modal="true" aria-label="Фото крупным планом" onClick={() => setLightbox(null)}><button className="lightbox-close" onClick={() => setLightbox(null)} aria-label="Закрыть">×</button><div className="lightbox-inner" onClick={(e) => e.stopPropagation()}><Asset folder={lightbox.folder} file={lightbox.file} alt={lightbox.caption || 'Фото в увеличенном виде'}/><div>{lightbox.caption || <span className="edit-hint">ваша подпись ✎</span>}</div></div></div>}
  </>;
}

export default App;



