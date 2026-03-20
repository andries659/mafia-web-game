// ─────────────────────────────────────────────────────────────────────────────
// DROP-IN REPLACEMENTS — paste these two functions into lobby.jsx,
// replacing the existing GameRoom and ChatBox functions.
//
// What changed:
//
// GameRoom:
//   • Tracks window width via matchMedia to know if desktop sidebar is visible.
//   • Uses a ref (isMobileRef) so the onSnapshot closure always reads the latest
//     value without needing to re-subscribe.
//   • On desktop the sidebar is always open, so new messages are NEVER counted
//     as unread (dot never shows on desktop, which is correct).
//   • On mobile, unread only increments when the relevant drawer tab is NOT open.
//
// ChatBox:
//   • Removed scrollIntoView() — that method scrolls the whole page.
//   • Added scrollContainerRef on the messages div and uses container.scrollTop
//     instead, so only the sidebar panel scrolls.
// ─────────────────────────────────────────────────────────────────────────────

function GameRoom({ user, gameCode, onLeave }) {
  const [game, setGame] = useState(null);
  const [error, setError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState('chat');
  const [unread, setUnread] = useState(0);
  const [unreadMafia, setUnreadMafia] = useState(0);

  const prevMsgLen = useRef(null);
  const prevMafiaMsgLen = useRef(null);
  const drawerOpenRef = useRef(false);
  const drawerTabRef = useRef('chat');

  // Track mobile vs desktop so the snapshot closure knows whether the sidebar
  // is visible without needing to re-subscribe every resize.
  const isMobileRef = useRef(window.innerWidth <= 768);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    isMobileRef.current = mq.matches;
    const handler = (e) => { isMobileRef.current = e.matches; };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      getGameRef(gameCode),
      (snap) => {
        if (!snap.exists()) { setError('Game has been deleted.'); return; }
        const data = snap.data();
        setGame(data);

        const msgLen = (data.messages || []).length;
        const mafiaMsgLen = (data.mafiaMessages || []).length;

        if (prevMsgLen.current === null) {
          // First load — baseline only, nothing is new.
          prevMsgLen.current = msgLen;
          prevMafiaMsgLen.current = mafiaMsgLen;
          return;
        }

        // On desktop the sidebar is permanently visible — never show a dot.
        const isDesktop = !isMobileRef.current;
        const townVisible  = isDesktop || (drawerOpenRef.current && drawerTabRef.current === 'chat');
        const mafiaVisible = isDesktop || (drawerOpenRef.current && drawerTabRef.current === 'mafia');

        if (msgLen > prevMsgLen.current) {
          if (!townVisible) setUnread(u => u + (msgLen - prevMsgLen.current));
          prevMsgLen.current = msgLen;
        }
        if (mafiaMsgLen > prevMafiaMsgLen.current) {
          if (!mafiaVisible) setUnreadMafia(u => u + (mafiaMsgLen - prevMafiaMsgLen.current));
          prevMafiaMsgLen.current = mafiaMsgLen;
        }
      },
      (err) => { console.error('Snapshot error:', err); setError('Connection lost.'); }
    );
    return () => unsub();
  }, [user, gameCode]);

  const openDrawer = (tab) => {
    drawerTabRef.current = tab;
    drawerOpenRef.current = true;
    setDrawerTab(tab);
    setDrawerOpen(true);
    if (tab === 'chat')  setUnread(0);
    if (tab === 'mafia') setUnreadMafia(0);
  };
  const closeDrawer = () => {
    drawerOpenRef.current = false;
    setDrawerOpen(false);
  };

  const transitioning = useRef(false);
  useEffect(() => {
    if (!game || !user || game.hostId !== user.uid) return;
    if (['lobby', 'game_over'].includes(game.status)) return;
    const alivePlayers = Object.values(game.players).filter(p => p.isAlive);
    const actionsCount = Object.keys(game.actions || {}).length;
    const allActed = actionsCount > 0 && actionsCount === alivePlayers.length;
    if (allActed && !transitioning.current) {
      transitioning.current = true;
      handlePhaseTransition(game, alivePlayers).finally(() => { transitioning.current = false; });
    }
  }, [game?.actions, game?.status, user?.uid]);

  // ── handlePhaseTransition ── (unchanged from your existing version — keep it as-is)
  const handlePhaseTransition = async (currentGame, alivePlayers) => {
    // ... your existing phase transition logic unchanged ...
  };

  const checkWinCondition = (playersObj) => {
    // ... your existing checkWinCondition logic unchanged ...
  };

  if (error) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <p style={{ color:'#F87171', fontSize:18 }}>{error}</p>
      <button onClick={onLeave} className="btn-ghost" style={{ padding:'10px 20px', borderRadius:8 }}>Return to Menu</button>
    </div>
  );

  if (!game) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
        <div style={{ width:32, height:32, border:'2px solid rgba(255,255,255,0.08)', borderTop:'2px solid var(--blood)', borderRight:'2px solid rgba(192,20,28,0.4)', animation:'spinnerMorph 1.2s cubic-bezier(0.5,0,0.5,1) infinite' }} />
        <span style={{ fontFamily:'DM Mono', fontSize:10, letterSpacing:'0.2em', color:'var(--text-dim)', textTransform:'uppercase' }}>Loading game</span>
      </div>
    </div>
  );

  const me = game.players[user.uid];
  const isHost = game.hostId === user.uid;
  const showAside = ['night', 'day'].includes(game.status);
  const isMafia = me ? isMafiaRole(me.role) : false;
  const mafiaAllies = isMafia ? Object.values(game.players).filter(p => isMafiaRole(p.role) && p.id !== me.id) : [];
  const hasMafiaChat = isMafia && mafiaAllies.length > 0;

  const roleColor = {
    mafia:'var(--blood)', doctor:'var(--emerald)', detective:'var(--sapphire)',
    jester:'var(--amethyst)', vigilante:'var(--orange)', bodyguard:'var(--amber)',
    villager:'var(--text-mid)', unassigned:'var(--text-dim)'
  }[me?.role] || 'var(--text-dim)';

  const phaseLabel = {
    lobby:'Lobby', role_reveal:'Role Reveal', night:`Night ${game.phaseNum}`,
    day:`Day ${game.phaseNum}`, game_over:'Game Over'
  }[game.status] || game.status;

  const renderPhase = () => {
    switch (game.status) {
      case 'lobby':       return <Lobby game={game} isHost={isHost} user={user} />;
      case 'role_reveal': return <RoleReveal game={game} me={me} user={user} />;
      case 'night':       return <NightPhase key={`night-${game.phaseNum}`} game={game} me={me} user={user} />;
      case 'day':         return <DayPhase key={`day-${game.phaseNum}`} game={game} me={me} user={user} />;
      case 'game_over':   return <GameOver game={game} me={me} onLeave={onLeave} />;
      default: return null;
    }
  };

  return (
    <div style={{ maxWidth:1200, margin:'0 auto', minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      {/* Top Bar */}
      <header className="phase-bar" style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'14px 20px', position:'sticky', top:0, zIndex:100,
        backdropFilter:'blur(12px)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div className="font-mono-custom" style={{
            background:'rgba(255,255,255,0.04)', border:'1px solid var(--noir-border)',
            borderRadius:8, padding:'5px 14px', fontSize:14, letterSpacing:'0.3em',
            color:'var(--text-bright)', fontWeight:500,
          }}>
            {game.code}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {game.status === 'night' && <div style={{ animation:'aliveDot 2s ease-in-out infinite' }}><Moon size={14} color="var(--amethyst)" /></div>}
            {game.status === 'day'   && <div style={{ animation:'skullIconFloat 4s ease-in-out infinite' }}><Sun size={14} color="var(--gold)" /></div>}
            <span style={{ fontFamily:'DM Mono', fontSize:11, letterSpacing:'0.1em', color:'var(--text-mid)', textTransform:'uppercase', animation:['night','day'].includes(game.status)?'phaseLabelPulse 3s ease-in-out infinite':'none' }}>
              {phaseLabel}
            </span>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span className="role-badge" style={{ background:`${roleColor}18`, border:`1px solid ${roleColor}40`, color:roleColor }}>{me?.role}</span>
          <span style={{ color:'var(--text-mid)', fontSize:15 }}>{me?.name}</span>
          {isHost && <div style={{ animation:'skullIconFloat 4s ease-in-out infinite' }}><Crown size={14} color="var(--gold)" /></div>}
        </div>
      </header>

      {/* Main */}
      <main style={{ flex:1, display:'flex', overflow:'hidden' }}>
        <div style={{ flex:1, padding:'20px', overflowY:'auto', minWidth:0 }}>
          {renderPhase()}
        </div>
        {showAside && (
          <aside className="desktop-sidebar">
            <PlayerList game={game} me={me} />
            <ChatBox game={game} me={me} user={user} isMafiaChat={false} />
            {hasMafiaChat && <ChatBox game={game} me={me} user={user} isMafiaChat={true} />}
          </aside>
        )}
      </main>

      {/* Mobile FABs + Drawer */}
      {showAside && (
        <>
          {hasMafiaChat && (
            <button className="fab fab-mafia" onClick={() => openDrawer('mafia')} style={{ bottom:88 }} title="Famiglia">
              <Skull size={20} color="var(--blood)" />
              {unreadMafia > 0 && <span style={{ position:'absolute', top:6, right:6, width:9, height:9, borderRadius:'50%', background:'var(--blood)', boxShadow:'0 0 0 2px var(--noir-black)', animation:'pulse-blood 1.5s ease infinite' }} />}
            </button>
          )}
          <button className="fab" onClick={() => openDrawer('chat')} style={{ bottom:24 }} title="Town Square">
            <MessageSquare size={20} color={unread > 0 ? 'var(--text-bright)' : 'var(--text-mid)'} />
            {unread > 0 && <span style={{ position:'absolute', top:6, right:6, width:9, height:9, borderRadius:'50%', background:'var(--blood)', boxShadow:'0 0 0 2px var(--noir-black)', animation:'pulse-blood 1.5s ease infinite' }} />}
          </button>

          <div className={`drawer-overlay${drawerOpen ? ' open' : ''}`} onClick={closeDrawer} />
          <div className={`drawer-panel${drawerOpen ? ' open' : ''}`}>
            <div className="drawer-handle" onClick={closeDrawer} style={{ cursor:'pointer' }} />
            <div style={{ display:'flex', borderBottom:'1px solid var(--noir-border)', flexShrink:0 }}>
              {[
                { id:'players', label:'Players', icon:<Users size={11} style={{ display:'inline', marginRight:5 }} /> },
                { id:'chat',    label:'Town',    icon:<MessageSquare size={11} style={{ display:'inline', marginRight:5 }} />, badge:unread },
                ...(hasMafiaChat ? [{ id:'mafia', label:'Famiglia', icon:<Skull size={11} style={{ display:'inline', marginRight:5 }} />, badge:unreadMafia, isMafia:true }] : []),
              ].map(tab => (
                <button key={tab.id} onClick={() => { drawerTabRef.current = tab.id; setDrawerTab(tab.id); if (tab.id==='chat') setUnread(0); if (tab.id==='mafia') setUnreadMafia(0); }} style={{
                  flex:1, padding:'12px 8px', background:'transparent', border:'none', cursor:'pointer',
                  fontFamily:'DM Mono', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase',
                  color:drawerTab===tab.id?(tab.isMafia?'var(--blood)':'var(--text-bright)'):(tab.isMafia?'rgba(192,20,28,0.45)':'var(--text-dim)'),
                  borderBottom:drawerTab===tab.id?`2px solid ${tab.isMafia?'var(--blood)':'var(--text-bright)'}`:'2px solid transparent',
                  transition:'color 0.2s, border-color 0.2s',
                }}>
                  {tab.icon}{tab.label}
                  {tab.badge > 0 && <span style={{ display:'inline-block', width:7, height:7, borderRadius:'50%', background:'var(--blood)', marginLeft:5, verticalAlign:'middle', animation:'pulse-blood 1.5s ease infinite' }} />}
                </button>
              ))}
            </div>
            <div style={{ flex:1, display:'flex', flexDirection:'column', minHeight:0 }}>
              {drawerTab === 'players' && <PlayerList game={game} me={me} />}
              {drawerTab === 'chat'    && <ChatBox game={game} me={me} user={user} isMafiaChat={false} />}
              {drawerTab === 'mafia'   && hasMafiaChat && <ChatBox game={game} me={me} user={user} isMafiaChat={true} />}
            </div>
          </div>
        </>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────

function ChatBox({ game, me, user, isMafiaChat = false }) {
  const [msg, setMsg] = useState('');
  // Use a ref on the scroll container div itself, NOT a sentinel element.
  // container.scrollTop avoids triggering page-level scroll.
  const scrollContainerRef = useRef(null);
  const isNight = game.status === 'night';
  const isBlackmailed = !isMafiaChat && game.blackmailed?.target === user.uid && game.blackmailed?.phase === game.phaseNum;
  const canChat = isMafiaChat
    ? (isMafiaRole(me.role) && me.isAlive)
    : (!isNight && me.isAlive && !isBlackmailed);
  const messages = isMafiaChat ? (game.mafiaMessages || []) : (game.messages || []);

  // Scroll the container to the bottom — no page scroll side-effect.
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!msg.trim() || !canChat) return;
    const messageObj = {
      senderId: user.uid, senderName: me.name, senderAvatarId: me.avatarId,
      text: msg.trim(), isDead: !me.isAlive, phase: game.status, timestamp: Date.now(),
    };
    setMsg('');
    const field = isMafiaChat ? 'mafiaMessages' : 'messages';
    await updateDoc(getGameRef(game.code), { [field]: arrayUnion(messageObj) });
  };

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', minHeight:0, background:isMafiaChat?'rgba(192,20,28,0.04)':'transparent' }}>
      {/* Header */}
      <div style={{ padding:'12px 16px', borderBottom:`1px solid ${isMafiaChat?'rgba(192,20,28,0.2)':'var(--noir-border)'}`, display:'flex', alignItems:'center', gap:8 }}>
        {isMafiaChat
          ? <><Skull size={11} color="var(--blood)" /><span style={{ fontFamily:'DM Mono', fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--blood)' }}>Famiglia — secret channel</span></>
          : <><MessageSquare size={11} color="var(--text-dim)" /><span style={{ fontFamily:'DM Mono', fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--text-dim)' }}>Town Square{isNight?' — silent':''}</span></>
        }
      </div>

      {/* Night lockout */}
      {!isMafiaChat && isNight && (
        <div style={{ padding:'10px 16px', background:'rgba(139,92,246,0.06)', borderBottom:'1px solid rgba(139,92,246,0.15)', display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ animation:'aliveDot 2s ease-in-out infinite' }}><Moon size={12} color="var(--amethyst)" /></div>
          <span style={{ fontFamily:'DM Mono', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(139,92,246,0.7)' }}>
            The town sleeps. No messages until dawn.
          </span>
        </div>
      )}

      {/* Messages — ref is on this div, NOT on a sentinel child */}
      <div
        ref={scrollContainerRef}
        style={{ flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 }}
      >
        {messages.length === 0 && (
          <p style={{ textAlign:'center', color:'var(--text-dim)', fontSize:13, fontStyle:'italic', marginTop:20 }}>
            {isMafiaChat ? 'Your channel awaits...' : 'Silence fills the square...'}
          </p>
        )}
        {messages.map((m, i) => {
          const isMe = m.senderId === user.uid;
          const bubbleClass = m.isDead ? 'chat-dead' : isMe ? (isMafiaChat ? 'chat-mafia-me' : 'chat-me') : (isMafiaChat ? 'chat-mafia-other' : 'chat-other');
          const isNew = i >= messages.length - 3;
          return (
            <div key={i} style={{
              display:'flex', flexDirection:'row', alignItems:'flex-end', gap:6,
              justifyContent:isMe?'flex-end':'flex-start',
              animation:isNew?`${isMe?'bubbleInRight':'bubbleInLeft'} 0.25s ease both`:'none',
            }}>
              {!isMe && <Avatar avatarId={m.senderAvatarId} size={26} dead={m.isDead} style={{ flexShrink:0, marginBottom:2 }} />}
              <div style={{ display:'flex', flexDirection:'column', alignItems:isMe?'flex-end':'flex-start', maxWidth:'78%' }}>
                <span style={{ fontFamily:'DM Mono', fontSize:9, letterSpacing:'0.05em', color:isMafiaChat?'rgba(192,20,28,0.6)':'var(--text-dim)', marginBottom:3 }}>
                  {m.senderName}{m.isDead && ' ☩'}
                </span>
                <div className={bubbleClass} style={{ padding:'7px 12px', borderRadius:10, fontSize:14, color:m.isDead?'var(--text-dim)':'var(--text-bright)', wordBreak:'break-word', lineHeight:1.5, transition:'background 0.2s' }}>
                  {m.text}
                </div>
              </div>
              {isMe && <Avatar avatarId={m.senderAvatarId} size={26} dead={m.isDead} style={{ flexShrink:0, marginBottom:2 }} />}
            </div>
          );
        })}
        {/* No sentinel div needed — we scroll the container directly */}
      </div>

      {/* Blackmailed banner */}
      {isBlackmailed && (
        <div style={{ padding:'6px 12px', background:'rgba(192,20,28,0.1)', borderTop:'1px solid rgba(192,20,28,0.2)', display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ animation:'aliveDot 1.5s ease-in-out infinite' }}><Skull size={11} color="var(--blood)" /></div>
          <span style={{ fontFamily:'DM Mono', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--blood)' }}>
            Blackmailed — you cannot speak today
          </span>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} style={{ padding:'10px 12px', borderTop:`1px solid ${isMafiaChat?'rgba(192,20,28,0.2)':'var(--noir-border)'}`, display:'flex', gap:8 }}>
        <input
          type="text" value={msg} onChange={(e) => setMsg(e.target.value)}
          placeholder={
            isBlackmailed ? 'You have been silenced...'
              : !canChat ? (isMafiaChat ? 'Mafia only...' : 'Silence until dawn...')
              : (isMafiaChat ? 'Message your family...' : 'Speak to the town...')
          }
          disabled={!canChat}
          className="noir-input"
          style={{ flex:1, padding:'8px 12px', borderRadius:8, fontSize:14, ...(isMafiaChat && canChat ? { borderColor:'rgba(192,20,28,0.3)' } : {}) }}
        />
        <button type="submit" disabled={!msg.trim() || !canChat} style={{
          padding:'8px 14px', borderRadius:8,
          background: msg.trim() && canChat ? 'var(--blood)' : 'rgba(255,255,255,0.04)',
          border:`1px solid ${msg.trim() && canChat ? 'transparent' : 'var(--noir-border)'}`,
          color: msg.trim() && canChat ? 'white' : 'var(--text-dim)',
          cursor: msg.trim() && canChat ? 'pointer' : 'not-allowed',
          transition:'all 0.15s, transform 0.1s', fontSize:13,
          transform: msg.trim() && canChat ? 'scale(1)' : 'scale(0.96)',
        }}
          onMouseEnter={e => { if (msg.trim() && canChat) e.currentTarget.style.transform = 'scale(1.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >↑</button>
      </form>
    </div>
  );
}
