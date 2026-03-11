import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { VEHICLES, WEAPONS, MUSIC_CATALOG } from '@/data/storeData';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Car, Crosshair, Music, ShoppingCart, Check, Play, ChevronRight } from 'lucide-react';

type StoreTab = 'vehicles' | 'weapons' | 'music';

export function StorePanel() {
  const { state, dispatch } = useGame();
  const [tab, setTab] = useState<StoreTab>('vehicles');
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);

  if (!state.showPanel) return null;

  const isStore = state.showPanel === 'store:vehicles' || state.showPanel === 'store:weapons' || state.showPanel === 'store:music';
  if (!isStore) return null;

  // Set initial tab from panel type
  const initialTab = state.showPanel.split(':')[1] as StoreTab;
  if (tab !== initialTab && !['vehicles', 'weapons', 'music'].includes(tab)) {
    setTab(initialTab);
  }

  const close = () => {
    dispatch({ type: 'SET_SHOW_PANEL', panel: null });
    setSelectedAlbum(null);
  };

  const tabs: { id: StoreTab; label: string; icon: React.ReactNode }[] = [
    { id: 'vehicles', label: 'VEHICLES', icon: <Car className="w-3 h-3" /> },
    { id: 'weapons', label: 'WEAPONS', icon: <Crosshair className="w-3 h-3" /> },
    { id: 'music', label: 'MUSIC', icon: <Music className="w-3 h-3" /> },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto"
        style={{ background: 'radial-gradient(ellipse at center, rgba(240,0,184,0.08) 0%, rgba(0,0,0,0.92) 100%)' }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full max-w-3xl mx-4 max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg tracking-widest text-primary">NBA STORE</h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-display text-sm text-accent">${state.money.toLocaleString()}</span>
              <button onClick={close} className="text-muted-foreground hover:text-primary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setSelectedAlbum(null); }}
                className={`flex items-center gap-2 px-4 py-2 text-[10px] font-display border transition-all ${
                  tab === t.id
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'bg-card/60 border-border text-muted-foreground hover:border-primary/30'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin" style={{ maxHeight: '60vh' }}>
            {tab === 'vehicles' && <VehicleStore />}
            {tab === 'weapons' && <WeaponStore />}
            {tab === 'music' && <MusicStore selectedAlbum={selectedAlbum} onSelectAlbum={setSelectedAlbum} />}
          </div>

          <div className="text-[9px] text-muted-foreground mt-3 text-center">PRESS ESC TO CLOSE</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function VehicleStore() {
  const { state, dispatch } = useGame();

  return (
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
            {/* Vehicle preview box */}
            <div className="w-full h-20 mb-3 flex items-center justify-center" style={{ background: v.color }}>
              <div className="flex items-end gap-1">
                <div className="w-16 h-6 rounded-sm" style={{ background: `${v.color}cc`, border: '1px solid rgba(240,0,184,0.3)' }} />
                <div className="w-3 h-3 rounded-full bg-primary/40" />
                <div className="w-3 h-3 rounded-full bg-primary/40" />
              </div>
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
  );
}

function WeaponStore() {
  const { state, dispatch } = useGame();

  const typeColors: Record<string, string> = {
    pistol: '#FFD700',
    rifle: '#FF4444',
    shotgun: '#FF8800',
    melee: '#44FF44',
  };

  return (
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
            {/* Weapon icon */}
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
              <div className="flex gap-3 mt-1">
                <StatMini label="DMG" value={w.damage} />
                <StatMini label="RNG" value={w.range} />
              </div>
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
  );
}

function MusicStore({ selectedAlbum, onSelectAlbum }: { selectedAlbum: string | null; onSelectAlbum: (id: string | null) => void }) {
  const { state, dispatch } = useGame();

  const album = selectedAlbum ? MUSIC_CATALOG.find(a => a.id === selectedAlbum) : null;

  if (album) {
    const owned = state.ownedMusic.includes(album.id);
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <button
          onClick={() => onSelectAlbum(null)}
          className="text-[10px] text-muted-foreground hover:text-primary mb-4 flex items-center gap-1 transition-colors"
        >
          ← BACK TO CATALOG
        </button>

        <div className="flex gap-5">
          {/* Album art */}
          <div className="w-48 h-48 flex-shrink-0 border border-primary/30 flex flex-col items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(240,0,184,0.15) 0%, rgba(0,0,0,0.8) 100%)' }}
          >
            <Music className="w-10 h-10 text-primary/60 mb-2" />
            <div className="font-display text-[10px] text-center px-2">{album.title}</div>
            <div className="text-[8px] text-muted-foreground mt-1">{album.year}</div>
          </div>

          <div className="flex-1">
            <h3 className="font-display text-sm mb-1">{album.title}</h3>
            <p className="text-[10px] text-muted-foreground mb-3">{album.artist} · {album.year} · {album.tracks.length} TRACKS</p>

            <div className="flex gap-3 mb-4">
              <span className="text-[9px] text-accent">+{album.fansBoost} FANS</span>
              <span className="text-[9px] text-primary">+{album.fameBoost} FAME</span>
            </div>

            {/* Track list */}
            <div className="space-y-1 mb-4 max-h-32 overflow-y-auto">
              {album.tracks.map((track, i) => (
                <div key={i} className="flex items-center gap-2 text-[9px] text-muted-foreground py-1 border-b border-border/30">
                  <span className="w-4 text-right text-muted-foreground/50">{i + 1}</span>
                  <Play className="w-2.5 h-2.5 text-primary/40" />
                  <span>{track}</span>
                </div>
              ))}
            </div>

            {owned ? (
              <div className="flex items-center gap-2 text-[10px] text-primary font-display">
                <Check className="w-3 h-3" /> OWNED
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
        <p className="text-[9px] text-muted-foreground">Collect albums to boost your fans and fame. Build the ultimate catalog.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {MUSIC_CATALOG.map(album => {
          const owned = state.ownedMusic.includes(album.id);
          return (
            <motion.button
              key={album.id}
              whileHover={{ scale: 1.03 }}
              onClick={() => onSelectAlbum(album.id)}
              className={`p-3 border text-left transition-all ${
                owned ? 'bg-primary/5 border-primary/40' : 'bg-card/80 border-border hover:border-primary/30'
              }`}
            >
              {/* Mini album art */}
              <div className="w-full h-24 mb-2 flex items-center justify-center border border-border/30"
                style={{ background: 'linear-gradient(135deg, rgba(240,0,184,0.1) 0%, rgba(0,0,0,0.6) 100%)' }}
              >
                <Music className="w-6 h-6 text-primary/40" />
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
