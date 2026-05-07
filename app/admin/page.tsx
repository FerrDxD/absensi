"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  BarChart3, Users, Image as ImageIcon, Calendar, 
  CheckCircle, AlertCircle, Clock, UserMinus, 
  ChevronRight,X, Maximize2, Loader2, Orbit
} from 'lucide-react';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Statistik State
  const [stats, setStats] = useState({ hadir: 0, izin: 0, sakit: 0, alpa: 0 });

  useEffect(() => {
    if (isAuthenticated) fetchAttendance();
  }, [isAuthenticated]);

  const fetchAttendance = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setRecords(data);
      // Hitung Rekapitulasi
      let h = 0, i = 0, s = 0, a = 0;
      data.forEach(rec => {
        rec.data_kehadiran.forEach((p: any) => {
          if (p.status === 'Hadir') h++;
          else if (p.status === 'Izin') i++;
          else if (p.status === 'Sakit') s++;
          else if (p.status === 'Alpa') a++;
        });
      });
      setStats({ hadir: h, izin: i, sakit: s, alpa: a });
    }
    setIsLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "OSIS26") {
      setIsAuthenticated(true);
    } else {
      alert("PIN Komando Salah!");
      setPin('');
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="absolute inset-0 z-0 bg-[url('/5.jpg')] bg-cover bg-center opacity-20 blur-md" />
        <div className="relative z-10 bg-slate-900/80 backdrop-blur-2xl p-10 rounded-[3rem] border border-indigo-500/30 w-full max-w-md text-center shadow-[0_0_50px_rgba(79,70,229,0.2)]">
          <Orbit className="w-16 h-16 text-indigo-500 mx-auto mb-6 animate-spin-slow" />
          <h1 className="text-3xl font-black text-white mb-2 tracking-tighter">ADMIN PANEL</h1>
          <p className="text-indigo-300/70 text-sm mb-8 font-medium">Otoritas Akses SMAN 2 Jonggol</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              value={pin} 
              onChange={(e) => setPin(e.target.value)}
              className="w-full p-5 bg-slate-800/50 border-2 border-indigo-900/50 rounded-2xl text-center text-3xl tracking-[0.5em] text-white focus:border-indigo-500 outline-none transition-all"
              placeholder="****"
              autoFocus
            />
            <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg transition-transform hover:-translate-y-1">
              MASUK KE SISTEM
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-10 relative selection:bg-indigo-500 selection:text-white">
      {/* Background Aesthetic */}
      <div className="fixed inset-0 z-0 bg-[url('/5.jpg')] bg-cover bg-center opacity-10" />
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/20" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        
        {/* Header Dashboard */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white">REKAPITULASI TUGAS</h1>
            <p className="text-indigo-400 font-bold text-sm tracking-widest uppercase mt-1">Laporan Real-Time Penjagaan</p>
          </div>
          <button onClick={() => fetchAttendance()} className="p-4 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/50 rounded-2xl transition-all">
            <Clock className="w-6 h-6 text-indigo-300" />
          </button>
        </header>

        {/* Stats Cards - Grid Mobile 2 Col, Desktop 4 Col */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: 'HADIR', val: stats.hadir, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'IZIN', val: stats.izin, icon: ChevronRight, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'SAKIT', val: stats.sakit, icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'ALPA', val: stats.alpa, icon: UserMinus, color: 'text-red-400', bg: 'bg-red-500/10' },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} backdrop-blur-md p-6 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center text-center space-y-2`}>
              <s.icon className={`w-8 h-8 ${s.color}`} />
              <div className="text-3xl md:text-4xl font-black text-white">{s.val}</div>
              <div className={`text-[10px] font-bold tracking-widest ${s.color}`}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* List Absensi & Foto */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-3 px-2">
            <ImageIcon className="w-7 h-7 text-indigo-500" /> Log Aktivitas Petugas
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 animate-spin text-indigo-500" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {records.map((rec) => (
                <div key={rec.id} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row group hover:border-indigo-500/30 transition-all duration-500">
                  {/* Foto Bukti */}
                  <div className="w-full md:w-48 h-48 md:h-auto relative overflow-hidden bg-slate-800">
                    <img src={rec.foto_url} alt="Absen" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <button 
                      onClick={() => setSelectedImage(rec.foto_url)}
                      className="absolute inset-0 bg-indigo-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <Maximize2 className="w-8 h-8 text-white" />
                    </button>
                  </div>

                  {/* Detail Data */}
                  <div className="p-6 flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-bold text-indigo-400 tracking-widest uppercase">{rec.program} • {rec.sesi}</div>
                        <div className="text-lg font-black text-white">{new Date(rec.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      {rec.data_kehadiran.map((p: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-800/50 px-4 py-2 rounded-xl border border-white/5">
                          <span className="text-xs font-bold text-slate-300 truncate max-w-[120px]">{p.nama}</span>
                          <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                            p.status === 'Hadir' ? 'bg-emerald-500/20 text-emerald-400' : 
                            p.status === 'Alpa' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {p.status.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Lightbox Foto */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-20 animate-in fade-in duration-300">
          <button onClick={() => setSelectedImage(null)} className="absolute top-8 right-8 text-white hover:text-red-500 transition-colors">
            <X className="w-10 h-10" />
          </button>
          <img src={selectedImage} className="max-w-full max-h-full rounded-3xl shadow-2xl border border-white/10 object-contain" />
        </div>
      )}
    </main>
  );
}