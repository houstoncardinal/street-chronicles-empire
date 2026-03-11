import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { VEHICLES, WEAPONS, MUSIC_CATALOG, TOOLS, PAINT_COLORS, RIM_OPTIONS, ENGINE_OPTIONS } from '@/data/storeData';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Car, Crosshair, Music, ShoppingCart, Check, Play, ChevronRight, Wrench, Package, Shuffle, SkipBack, SkipForward, Repeat, Pause } from 'lucide-react';

type StoreTab = 'vehicles' | 'weapons' | 'music' | 'tools' | 'inventory' | 'garage';

export function StorePanel() {
  const { state, dispatch } = useGame();
  const [tab, setTab] = useState<StoreTab>('vehicles');
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  if (!state.showPanel) return null;

  const panelType = state.showPanel;
  const isStore = panelType.startsWith('store:') || panelType === 'inventory' || panelType === 'garage';
  if (!isStore) return null;

  // Auto-set tab on open
  const getTab = (): StoreTab => {
    if (panelType === 'inventory') return 'inventory';
    if (panelType === 'garage') return 'garage';
    if (panelType.startsWith('store:')) {
      const t = panelType.split(':')[1] as StoreTab;
      if (['vehicles', 'weapons', 'tools', 'music'].includes(t)) return t;
    }
    return tab;
  };
  const currentTab = getTab();

  const close = () => {
    dispatch({ type: 'SET_SHOW_PANEL', panel: null });
    setSelectedAlbum(null);
    setSelectedVehicle(null);
  };

  // Auto-select tab based on panel type
  const getInitialTab = (): StoreTab => {
    if (panelType === 'inventory') return 'inventory';
    if (panelType === 'garage') return 'garage';
    if (panelType.startsWith('store:')) return panelType.split(':')[1] as StoreTab;
    return 'vehicles';
  };

  const tabs: { id: StoreTab; label: string; icon: React.ReactNode }[] = [
    { id: 'vehicles', label: 'VEHICLES', icon: <Car className="w-3 h-3" /> },
    { id: 'weapons', label: 'WEAPONS', icon: <Crosshair className="w-3 h-3" /> },
    { id: 'tools', label: 'TOOLS', icon: <Wrench className="w-3 h-3" /> },
    { id: 'music', label: 'MUSIC', icon: <Music className="w-3 h-3" /> },
    { id: 'inventory', label: 'INVENTORY', icon: <Package className="w-3 h-3" /> },
    { id: 'garage', label: 'GARAGE', icon: <Car className="w-3 h-3" /> },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto"
        style={{ background: 'radial-gradient(ellipse at center, rgba(240,0,184,0.08) 0%, rgba(0,0,0,0.95) 100%)' }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg tracking-widest text-primary">NBA MARKETPLACE</h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-display text-sm text-accent">${state.money.toLocaleString()}</span>
              <button onClick={close} className="text-muted-foreground hover:text-primary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 flex-wrap">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setSelectedAlbum(null); setSelectedVehicle(null); }}
                className={`flex items-center gap-2 px-3 py-2 text-[10px] font-display border transition-all ${
                  currentTab === t.id
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'bg-card/60 border-border text-muted-foreground hover:border-primary/30'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin" style={{ maxHeight: '65vh' }}>
            {tab === 'vehicles' && <VehicleStore />}
            {tab === 'weapons' && <WeaponStore />}
            {tab === 'tools' && <ToolStore />}
            {tab === 'music' && <MusicStore selectedAlbum={selectedAlbum} onSelectAlbum={setSelectedAlbum} />}
            {tab === 'inventory' && <InventoryPanel />}
            {tab === 'garage' && <GaragePanel selectedVehicle={selectedVehicle} onSelectVehicle={setSelectedVehicle} />}
          </div>

          <div className="text-[9px] text-muted-foreground mt-3 text-center">PRESS ESC TO CLOSE</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Vehicle Store ─── */
function VehicleStore() {
  const { state, dispatch } = useGame();
  const typeLabels: Record<string, string> = { car: '🏎️', suv: '🚙', truck: '🛻', snow: '❄️', motorcycle: '🏍️' };

  return (
    <div>
      <div className="mb-4">
        <h3 className="font-display text-xs text-primary mb-1">NBA AUTO DEALERSHIP</h3>
        <p className="text-[9px] text-muted-foreground">Step into the showroom. Pick your ride.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {VEHICLES.map(v => {
          const owned = state.ownedVehicles.includes(v.id);
          const active = state.activeVehicle === v.id;
          return (
            <motion.div
              key={v.id}
              whileHover={{ scale: 1.02 }}
              className={`p-4 border transition-all ${
                owned ? 'bg-primary/5 border-primary/40' : 'bg-card/80 border-border hover:border-primary/30'
              }`}
            >
              {/* Vehicle preview - rotating platform look */}
              <div className="w-full h-24 mb-3 relative overflow-hidden flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${v.color} 0%, rgba(0,0,0,0.8) 100%)` }}>
                <div className="absolute bottom-0 w-full h-1 bg-primary/20" />
                <div className="text-3xl">{typeLabels[v.type] || '🚗'}</div>
                <div className="absolute top-1 right-1 text-[8px] font-display text-muted-foreground bg-background/60 px-1">{v.type.toUpperCase()}</div>
              </div>

              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-display text-xs">{v.name}</h4>
                  <span className="text-[8px] text-muted-foreground uppercase">{v.type}</span>
                </div>
                {owned && <Check className="w-3 h-3 text-primary" />}
              </div>

              <p className="text-[9px] text-muted-foreground mb-2 leading-relaxed">{v.description}</p>

              <div className="flex gap-3 mb-3">
                <StatMini label="SPD" value={v.speed} />
                <StatMini label="HND" value={v.handling} />
              </div>

              {owned ? (
                <button
                  onClick={() => dispatch({ type: 'SET_ACTIVE_VEHICLE', vehicleId: active ? null : v.id })}
                  className={`w-full py-1.5 text-[9px] font-display border transition-all ${
                    active ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-border text-foreground hover:border-primary/40'
                  }`}
                >
                  {active ? 'EQUIPPED' : 'EQUIP'}
                </button>
              ) : (
                <button
                  onClick={() => dispatch({ type: 'BUY_VEHICLE', vehicleId: v.id })}
                  disabled={state.money < v.price}
                  className="w-full py-1.5 text-[9px] font-display bg-primary text-primary-foreground disabled:opacity-30 hover:brightness-110 transition-all"
                >
                  BUY — ${v.price.toLocaleString()}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Weapon Store ─── */
function WeaponStore() {
  const { state, dispatch } = useGame();

  const typeColors: Record<string, string> = {
    pistol: '#FFD700',
    rifle: '#FF4444',
    shotgun: '#FF8800',
    melee: '#44FF44',
    armor: '#4488FF',
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="font-display text-xs text-primary mb-1">ARMORY</h3>
        <p className="text-[9px] text-muted-foreground">Tactical gear for the streets and the mountain.</p>
      </div>
      <div className="space-y-2">
        {WEAPONS.map(w => {
          const owned = state.ownedWeapons.includes(w.id);
          const equipped = state.equippedWeapon === w.id;
          return (
            <motion.div
              key={w.id}
              whileHover={{ x: 4 }}
              className={`flex items-center gap-4 p-3 border transition-all ${
                owned ? 'bg-primary/5 border-primary/40' : 'bg-card/80 border-border hover:border-primary/30'
              }`}
            >
              <div className="w-12 h-12 flex items-center justify-center border border-border" style={{ background: 'rgba(0,0,0,0.4)' }}>
                <Crosshair className="w-5 h-5" style={{ color: typeColors[w.type] || '#F000B8' }} />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-display text-[11px]">{w.name}</h4>
                  <span className="text-[8px] px-1.5 py-0.5 border border-border text-muted-foreground uppercase">{w.type}</span>
                  {equipped && <span className="text-[8px] px-1.5 py-0.5 bg-primary text-primary-foreground">EQUIPPED</span>}
                </div>
                <p className="text-[9px] text-muted-foreground mt-0.5">{w.description}</p>
                {w.type !== 'armor' && (
                  <div className="flex gap-3 mt-1">
                    <StatMini label="DMG" value={w.damage} />
                    <StatMini label="RNG" value={w.range} />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1">
                {owned ? (
                  <button
                    onClick={() => dispatch({ type: 'EQUIP_WEAPON', weaponId: equipped ? null : w.id })}
                    className={`px-3 py-1.5 text-[9px] font-display border transition-all ${
                      equipped ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-border hover:border-primary/40'
                    }`}
                  >
                    {equipped ? 'UNEQUIP' : 'EQUIP'}
                  </button>
                ) : (
                  <button
                    onClick={() => dispatch({ type: 'BUY_WEAPON', weaponId: w.id })}
                    disabled={state.money < w.price}
                    className="px-3 py-1.5 text-[9px] font-display bg-primary text-primary-foreground disabled:opacity-30 hover:brightness-110 transition-all"
                  >
                    ${w.price.toLocaleString()}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Tool Store ─── */
function ToolStore() {
  const { state, dispatch } = useGame();

  return (
    <div>
      <div className="mb-4">
        <h3 className="font-display text-xs text-primary mb-1">GEAR & TOOLS SHOP</h3>
        <p className="text-[9px] text-muted-foreground">Essential tools for exploration, digging, and survival on GraveDigger Mountain.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {TOOLS.map(t => {
          const owned = state.ownedTools.includes(t.id);
          const equipped = state.equippedTool === t.id;
          return (
            <motion.div
              key={t.id}
              whileHover={{ scale: 1.02 }}
              className={`p-4 border transition-all ${
                owned ? 'bg-primary/5 border-primary/40' : 'bg-card/80 border-border hover:border-primary/30'
              }`}
            >
              <div className="w-full h-16 mb-3 flex items-center justify-center border border-border/30"
                style={{ background: 'linear-gradient(135deg, rgba(0,255,136,0.05) 0%, rgba(0,0,0,0.6) 100%)' }}
              >
                <span className="text-2xl">{t.icon}</span>
              </div>

              <div className="flex items-start justify-between mb-2">
                <h4 className="font-display text-[11px]">{t.name}</h4>
                {owned && <Check className="w-3 h-3 text-primary" />}
              </div>

              <p className="text-[9px] text-muted-foreground mb-2 leading-relaxed">{t.description}</p>

              <div className="text-[8px] text-accent mb-3">ABILITY: {t.ability.toUpperCase()}</div>

              {owned ? (
                <button
                  onClick={() => dispatch({ type: 'EQUIP_TOOL', toolId: equipped ? null : t.id })}
                  className={`w-full py-1.5 text-[9px] font-display border transition-all ${
                    equipped ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-border text-foreground hover:border-primary/40'
                  }`}
                >
                  {equipped ? 'EQUIPPED' : 'EQUIP'}
                </button>
              ) : (
                <button
                  onClick={() => dispatch({ type: 'BUY_TOOL', toolId: t.id })}
                  disabled={state.money < t.price}
                  className="w-full py-1.5 text-[9px] font-display bg-primary text-primary-foreground disabled:opacity-30 hover:brightness-110 transition-all"
                >
                  BUY — ${t.price.toLocaleString()}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Music Store ─── */
function MusicStore({ selectedAlbum, onSelectAlbum }: { selectedAlbum: string | null; onSelectAlbum: (id: string | null) => void }) {
  const { state, dispatch } = useGame();

  const album = selectedAlbum ? MUSIC_CATALOG.find(a => a.id === selectedAlbum) : null;

  if (album) {
    const owned = state.ownedMusic.includes(album.id);
    const isCurrentlyPlaying = state.musicPlayer.currentAlbumId === album.id && state.musicPlayer.isPlaying;
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <button
          onClick={() => onSelectAlbum(null)}
          className="text-[10px] text-muted-foreground hover:text-primary mb-4 flex items-center gap-1 transition-colors"
        >
          ← BACK TO CATALOG
        </button>

        <div className="flex gap-5">
          {/* Album art - holographic style */}
          <div className="w-48 h-48 flex-shrink-0 border border-primary/30 flex flex-col items-center justify-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(240,0,184,0.2) 0%, rgba(155,89,182,0.1) 50%, rgba(0,0,0,0.8) 100%)' }}
          >
            <div className="absolute inset-0 opacity-20" style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(240,0,184,0.1) 5px, rgba(240,0,184,0.1) 6px)' }} />
            <Music className="w-10 h-10 text-primary/60 mb-2" />
            <div className="font-display text-[10px] text-center px-2">{album.title}</div>
            <div className="text-[8px] text-muted-foreground mt-1">{album.year}</div>
            {isCurrentlyPlaying && (
              <div className="absolute bottom-2 flex gap-1">
                {[1,2,3,4,5].map(i => (
                  <motion.div
                    key={i}
                    animate={{ height: [4, 12, 4] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                    className="w-1 bg-primary"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex-1">
            <h3 className="font-display text-sm mb-1">{album.title}</h3>
            <p className="text-[10px] text-muted-foreground mb-3">{album.artist} · {album.year} · {album.tracks.length} TRACKS</p>

            <div className="flex gap-3 mb-4">
              <span className="text-[9px] text-accent">+{album.fansBoost} FANS</span>
              <span className="text-[9px] text-primary">+{album.fameBoost} FAME</span>
            </div>

            {/* Track list with play buttons */}
            <div className="space-y-1 mb-4 max-h-32 overflow-y-auto">
              {album.tracks.map((track, i) => {
                const isPlayingTrack = isCurrentlyPlaying && state.musicPlayer.currentTrackIndex === i;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (owned) dispatch({ type: 'MUSIC_PLAY', albumId: album.id, trackIndex: i });
                    }}
                    disabled={!owned}
                    className={`w-full flex items-center gap-2 text-[9px] py-1.5 px-1 border-b border-border/30 text-left transition-all ${
                      isPlayingTrack ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    } disabled:opacity-50`}
                  >
                    <span className="w-4 text-right text-muted-foreground/50">{i + 1}</span>
                    <Play className={`w-2.5 h-2.5 ${isPlayingTrack ? 'text-primary' : 'text-primary/40'}`} />
                    <span className="flex-1">{track}</span>
                    {isPlayingTrack && <span className="text-primary animate-pulse">♪</span>}
                  </button>
                );
              })}
            </div>

            {owned ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-[10px] text-primary font-display">
                  <Check className="w-3 h-3" /> OWNED
                </div>
                <button
                  onClick={() => dispatch({ type: 'MUSIC_PLAY', albumId: album.id, trackIndex: 0 })}
                  className="px-4 py-1.5 text-[9px] font-display bg-secondary border border-border text-foreground hover:border-primary/40 transition-all"
                >
                  ▶ PLAY ALBUM
                </button>
              </div>
            ) : (
              <button
                onClick={() => dispatch({ type: 'BUY_MUSIC', albumId: album.id })}
                disabled={state.money < album.price}
                className="px-6 py-2 text-[10px] font-display bg-primary text-primary-foreground disabled:opacity-30 hover:brightness-110 transition-all"
              >
                BUY ALBUM — ${album.price.toLocaleString()}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="font-display text-xs text-primary mb-1">YB DIGITAL MUSIC STORE</h3>
        <p className="text-[9px] text-muted-foreground">Holographic listening experience. Collect albums to boost fans and fame.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {MUSIC_CATALOG.map(album => {
          const owned = state.ownedMusic.includes(album.id);
          return (
            <motion.button
              key={album.id}
              whileHover={{ scale: 1.03, y: -2 }}
              onClick={() => onSelectAlbum(album.id)}
              className={`p-3 border text-left transition-all relative overflow-hidden ${
                owned ? 'bg-primary/5 border-primary/40' : 'bg-card/80 border-border hover:border-primary/30'
              }`}
            >
              {/* Holographic album art */}
              <div className="w-full h-28 mb-2 flex items-center justify-center border border-border/30 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(240,0,184,0.15) 0%, rgba(155,89,182,0.08) 50%, rgba(0,0,0,0.6) 100%)' }}
              >
                <div className="absolute inset-0 opacity-10" style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.05) 3px, rgba(255,255,255,0.05) 4px)' }} />
                <Music className="w-8 h-8 text-primary/40" />
                {owned && (
                  <div className="absolute bottom-1 right-1 text-[7px] bg-primary text-primary-foreground px-1">OWNED</div>
                )}
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-display text-[10px] leading-tight">{album.title}</h4>
                  <span className="text-[8px] text-muted-foreground">{album.year} · {album.tracks.length} tracks</span>
                </div>
                <div className="flex items-center gap-1">
                  {owned ? (
                    <Check className="w-3 h-3 text-primary" />
                  ) : (
                    <span className="text-[9px] font-display text-accent">${album.price}</span>
                  )}
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Inventory Panel ─── */
function InventoryPanel() {
  const { state } = useGame();

  const ownedVehicleList = VEHICLES.filter(v => state.ownedVehicles.includes(v.id));
  const ownedWeaponList = WEAPONS.filter(w => state.ownedWeapons.includes(w.id));
  const ownedToolList = TOOLS.filter(t => state.ownedTools.includes(t.id));
  const ownedMusicList = MUSIC_CATALOG.filter(a => state.ownedMusic.includes(a.id));

  const sections = [
    { label: 'VEHICLES', items: ownedVehicleList, icon: '🚗', count: ownedVehicleList.length },
    { label: 'WEAPONS', items: ownedWeaponList, icon: '🔫', count: ownedWeaponList.length },
    { label: 'TOOLS', items: ownedToolList, icon: '🔧', count: ownedToolList.length },
    { label: 'MUSIC', items: ownedMusicList, icon: '🎵', count: ownedMusicList.length },
  ];

  return (
    <div>
      <div className="mb-4">
        <h3 className="font-display text-xs text-primary mb-1">INVENTORY</h3>
        <p className="text-[9px] text-muted-foreground">Everything you own. Your empire's assets.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {sections.map(s => (
          <div key={s.label} className="p-3 bg-card border border-border text-center">
            <div className="text-lg mb-1">{s.icon}</div>
            <div className="font-display text-lg text-primary">{s.count}</div>
            <div className="text-[8px] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Equipped items */}
      <div className="mb-4 p-3 border border-primary/30 bg-primary/5">
        <h4 className="font-display text-[10px] text-primary mb-2">EQUIPPED LOADOUT</h4>
        <div className="grid grid-cols-3 gap-3 text-[9px]">
          <div>
            <span className="text-muted-foreground">VEHICLE: </span>
            <span className="text-foreground">{state.activeVehicle ? VEHICLES.find(v => v.id === state.activeVehicle)?.name : 'NONE'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">WEAPON: </span>
            <span className="text-foreground">{state.equippedWeapon ? WEAPONS.find(w => w.id === state.equippedWeapon)?.name : 'NONE'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">TOOL: </span>
            <span className="text-foreground">{state.equippedTool ? TOOLS.find(t => t.id === state.equippedTool)?.name : 'NONE'}</span>
          </div>
        </div>
      </div>

      {/* Detailed lists */}
      {ownedVehicleList.length > 0 && (
        <InventorySection title="VEHICLES" items={ownedVehicleList.map(v => ({
          name: v.name, detail: `${v.type} · SPD ${v.speed}`, active: state.activeVehicle === v.id,
        }))} />
      )}
      {ownedWeaponList.length > 0 && (
        <InventorySection title="WEAPONS" items={ownedWeaponList.map(w => ({
          name: w.name, detail: `${w.type} · DMG ${w.damage}`, active: state.equippedWeapon === w.id,
        }))} />
      )}
      {ownedToolList.length > 0 && (
        <InventorySection title="TOOLS" items={ownedToolList.map(t => ({
          name: t.name, detail: t.ability, active: state.equippedTool === t.id,
        }))} />
      )}
      {ownedMusicList.length > 0 && (
        <InventorySection title="MUSIC LIBRARY" items={ownedMusicList.map(a => ({
          name: a.title, detail: `${a.artist} · ${a.year}`, active: false,
        }))} />
      )}

      {ownedVehicleList.length + ownedWeaponList.length + ownedToolList.length + ownedMusicList.length === 0 && (
        <div className="text-center text-muted-foreground text-[10px] py-8">
          YOUR INVENTORY IS EMPTY. VISIT THE STORES TO BUILD YOUR EMPIRE.
        </div>
      )}
    </div>
  );
}

function InventorySection({ title, items }: { title: string; items: { name: string; detail: string; active: boolean }[] }) {
  return (
    <div className="mb-4">
      <h4 className="font-display text-[10px] text-muted-foreground mb-2">{title}</h4>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className={`flex items-center justify-between p-2 border ${item.active ? 'border-primary/40 bg-primary/5' : 'border-border bg-card/60'}`}>
            <div>
              <span className="text-[10px] font-display">{item.name}</span>
              <span className="text-[8px] text-muted-foreground ml-2">{item.detail}</span>
            </div>
            {item.active && <span className="text-[8px] text-primary font-display">ACTIVE</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Garage Panel ─── */
function GaragePanel({ selectedVehicle, onSelectVehicle }: { selectedVehicle: string | null; onSelectVehicle: (id: string | null) => void }) {
  const { state, dispatch } = useGame();
  const ownedVehicles = VEHICLES.filter(v => state.ownedVehicles.includes(v.id));

  if (ownedVehicles.length === 0) {
    return (
      <div className="text-center text-muted-foreground text-[10px] py-12">
        <Car className="w-8 h-8 mx-auto mb-3 text-muted-foreground/40" />
        NO VEHICLES IN GARAGE. VISIT THE AUTO DEALERSHIP.
      </div>
    );
  }

  const selected = selectedVehicle ? VEHICLES.find(v => v.id === selectedVehicle) : null;
  const customization = selectedVehicle ? state.vehicleCustomizations[selectedVehicle] : null;

  if (selected && customization) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <button onClick={() => onSelectVehicle(null)} className="text-[10px] text-muted-foreground hover:text-primary mb-4 flex items-center gap-1">
          ← BACK TO GARAGE
        </button>

        <div className="flex gap-6">
          {/* Vehicle preview */}
          <div className="w-64 h-48 flex-shrink-0 border border-primary/30 flex flex-col items-center justify-center relative"
            style={{ background: `linear-gradient(135deg, ${customization.paintColor}40 0%, rgba(0,0,0,0.8) 100%)` }}
          >
            <div className="absolute bottom-0 w-full h-2" style={{ background: customization.neon ? 'rgba(240,0,184,0.4)' : 'transparent', boxShadow: customization.neon ? '0 0 20px rgba(240,0,184,0.6)' : 'none' }} />
            <div className="text-5xl mb-2">{selected.type === 'motorcycle' ? '🏍️' : selected.type === 'truck' ? '🛻' : selected.type === 'suv' ? '🚙' : '🏎️'}</div>
            <div className="font-display text-xs">{selected.name}</div>
          </div>

          <div className="flex-1 space-y-4">
            <h3 className="font-display text-sm">{selected.name} — CUSTOMIZATION</h3>

            {/* Paint colors */}
            <div>
              <h4 className="text-[9px] text-muted-foreground mb-2 font-display">PAINT COLOR</h4>
              <div className="flex flex-wrap gap-2">
                {PAINT_COLORS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => dispatch({ type: 'CUSTOMIZE_VEHICLE', vehicleId: selected.id, customization: { paintColor: c.hex } })}
                    className={`w-8 h-8 border-2 transition-all ${customization.paintColor === c.hex ? 'border-primary scale-110' : 'border-border hover:border-primary/40'}`}
                    style={{ background: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Rims */}
            <div>
              <h4 className="text-[9px] text-muted-foreground mb-2 font-display">RIMS</h4>
              <div className="flex flex-wrap gap-2">
                {RIM_OPTIONS.map(r => (
                  <button
                    key={r.id}
                    onClick={() => dispatch({ type: 'CUSTOMIZE_VEHICLE', vehicleId: selected.id, customization: { rims: r.id } })}
                    className={`px-3 py-1.5 text-[9px] font-display border transition-all ${
                      customization.rims === r.id ? 'bg-primary/20 border-primary text-primary' : 'bg-card border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    {r.name} {r.price > 0 && `· $${r.price}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Engine */}
            <div>
              <h4 className="text-[9px] text-muted-foreground mb-2 font-display">ENGINE</h4>
              <div className="flex flex-wrap gap-2">
                {ENGINE_OPTIONS.map(e => (
                  <button
                    key={e.id}
                    onClick={() => dispatch({ type: 'CUSTOMIZE_VEHICLE', vehicleId: selected.id, customization: { engine: e.id } })}
                    className={`px-3 py-1.5 text-[9px] font-display border transition-all ${
                      customization.engine === e.id ? 'bg-primary/20 border-primary text-primary' : 'bg-card border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    {e.name} {e.speedBoost > 0 && `· +${e.speedBoost} SPD`} {e.price > 0 && `· $${e.price}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Neon */}
            <div>
              <button
                onClick={() => dispatch({ type: 'CUSTOMIZE_VEHICLE', vehicleId: selected.id, customization: { neon: !customization.neon } })}
                className={`px-4 py-2 text-[9px] font-display border transition-all ${
                  customization.neon ? 'bg-primary/20 border-primary text-primary glow-pink' : 'bg-card border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                {customization.neon ? '✓ NEON UNDERGLOW ON' : 'NEON UNDERGLOW — $500'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="font-display text-xs text-primary mb-1">YOUR GARAGE</h3>
        <p className="text-[9px] text-muted-foreground">View and customize your vehicles. Select one to modify.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {ownedVehicles.map(v => {
          const active = state.activeVehicle === v.id;
          const cust = state.vehicleCustomizations[v.id];
          return (
            <motion.div
              key={v.id}
              whileHover={{ scale: 1.02 }}
              className={`p-4 border cursor-pointer transition-all ${active ? 'border-primary bg-primary/5' : 'border-border bg-card/80 hover:border-primary/30'}`}
              onClick={() => onSelectVehicle(v.id)}
            >
              <div className="w-full h-20 mb-3 flex items-center justify-center relative"
                style={{ background: `linear-gradient(135deg, ${cust?.paintColor || v.color}40 0%, rgba(0,0,0,0.6) 100%)` }}
              >
                {cust?.neon && <div className="absolute bottom-0 w-full h-1 bg-primary/40" style={{ boxShadow: '0 0 10px rgba(240,0,184,0.5)' }} />}
                <div className="text-3xl">{v.type === 'motorcycle' ? '🏍️' : v.type === 'truck' ? '🛻' : '🏎️'}</div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display text-xs">{v.name}</h4>
                  <span className="text-[8px] text-muted-foreground">{cust?.rims !== 'stock' ? cust?.rims.toUpperCase() : ''} {cust?.engine !== 'stock' ? `· ${cust?.engine.toUpperCase()}` : ''}</span>
                </div>
                <div className="flex gap-2">
                  {active && <span className="text-[8px] text-primary font-display">ACTIVE</span>}
                  <Wrench className="w-3 h-3 text-muted-foreground" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Stat Mini ─── */
function StatMini({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[8px] text-muted-foreground">{label}</span>
      <div className="w-12 h-1 bg-secondary">
        <div className="h-full bg-primary" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
