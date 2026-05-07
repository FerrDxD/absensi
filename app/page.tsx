"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Camera, UploadCloud, CheckCircle2, Loader2, CalendarX2, Orbit, Sparkles } from 'lucide-react';

export default function AttendanceForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().split('T')[0]);
  const [sesi, setSesi] = useState('Pagi');
  const [program, setProgram] = useState('SASAMU');
  
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Menyimpan nama petugas langsung dari Database Jadwal
  const [petugas, setPetugas] = useState<{ nama: string, status: string }[]>([]);

  // AJAIB: Tarik data otomatis setiap Tanggal/Sesi/Program diubah!
  useEffect(() => {
    const fetchSchedule = async () => {
      setIsLoadingSchedule(true);
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('tanggal', tanggal)
        .eq('sesi', sesi)
        .eq('program', program)
        .single();

      if (data && data.petugas) {
        setPetugas(data.petugas.map((nama: string) => ({ nama, status: 'Hadir' })));
      } else {
        setPetugas([]); // Kosong jika jadwal hari itu tidak ada
      }
      setIsLoadingSchedule(false);
    };

    fetchSchedule();
  }, [tanggal, sesi, program]);

  const handleStatusChange = (index: number, newStatus: string) => {
    const newPetugas = [...petugas];
    newPetugas[index].status = newStatus;
    setPetugas(newPetugas);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (petugas.length === 0) return alert("Jadwal tidak ditemukan. Pilih tanggal yang valid!");
    if (!photo) return alert("Wajib melampirkan foto bukti penjagaan!");

    setIsSubmitting(true);
    try {
      const fileExt = photo.name.split('.').pop();
      const fileName = `absen_${tanggal}_${program}_${sesi}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('attendance_photos').upload(fileName, photo);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('attendance_photos').getPublicUrl(fileName);

      const { error: insertError } = await supabase.from('attendance').insert([{
        tanggal, sesi, program,
        foto_url: publicUrlData.publicUrl,
        data_kehadiran: petugas // Data absen yang dikirim rapi
      }]);

      if (insertError) throw insertError;

      alert("✅ Absensi berhasil dikirim! Terima kasih atas tugasnya hari ini.");
      setPhoto(null); setPhotoPreview(null);
      // Refresh status kembali ke Hadir
      setPetugas(petugas.map(p => ({ ...p, status: 'Hadir' })));

    } catch (error: any) {
      console.error("Gagal submit:", error);
      alert("❌ Terjadi kesalahan: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 font-sans pb-24 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* ✨ EFEK BACKGROUND GALAKSI ALA FOTO */}
      <div className="absolute inset-0 z-0 bg-[url('/5.jpg')] bg-cover bg-center opacity-30 blur-sm scale-105" />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-950/80 via-slate-900/90 to-slate-950" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500" />
      
      <div className="max-w-2xl mx-auto space-y-6 relative z-10">
        <header className="text-center space-y-2 mb-8 p-6 bg-slate-800/40 rounded-3xl border border-white/5 backdrop-blur-xl flex flex-col items-center">
          <div className="p-3 bg-slate-700/50 rounded-2xl border border-indigo-500/30">
            <Orbit className="w-10 h-10 text-indigo-400 animate-spin-slow" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">E-Absensi Penjagaan</h1>
          <p className="text-indigo-300 font-medium text-sm flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> Auto-Sync dengan Jadwal Pusat</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SEKSI 1: PILIH JADWAL - ALA KONTROL KAPAL LUAR ANGKASA */}
          <div className="bg-slate-800/60 p-6 rounded-[2rem] shadow-2xl border border-white/10 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2.5">📅 <span className="text-slate-100/90">Pilih Jadwal Tugas Hari Ini</span></h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2.5 ml-1">Tanggal</label>
                <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="w-full p-4 bg-slate-700/50 text-white border-2 border-indigo-900/50 rounded-xl focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer text-lg font-bold" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2.5 ml-1">Program</label>
                <select value={program} onChange={(e) => setProgram(e.target.value)} className="w-full p-4 bg-slate-700/50 text-white border-2 border-indigo-900/50 rounded-xl focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-lg font-bold">
                  <option value="SASAMU" className="bg-slate-800">SASAMU</option>
                  <option value="JAMPARIKU" className="bg-slate-800">JAMPARIKU</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2.5 ml-1">Sesi</label>
                <select value={sesi} onChange={(e) => setSesi(e.target.value)} className="w-full p-4 bg-slate-700/50 text-white border-2 border-indigo-900/50 rounded-xl focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-lg font-bold">
                  <option value="Pagi" className="bg-slate-800">🌅 Pagi</option>
                  <option value="Siang" className="bg-slate-800">🌇 Siang</option>
                </select>
              </div>
            </div>
          </div>

          {/* SEKSI 2: DAFTAR PETUGAS (AUTO-FILL) - ALA MODUL SISTEM */}
          <div className="bg-slate-800/60 p-6 rounded-[2rem] shadow-2xl border border-white/10 backdrop-blur-xl min-h-[300px]">
            <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2.5">👥 <span className="text-slate-100/90">Absensi Kehadiran</span></h2>
            
            {isLoadingSchedule ? (
              <div className="flex flex-col items-center justify-center h-48 text-indigo-300 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-base font-semibold tracking-wider">Mencari Data Jadwal...</p>
              </div>
            ) : petugas.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-4 bg-slate-700/30 rounded-2xl border-2 border-dashed border-slate-600">
                <CalendarX2 className="w-12 h-12 text-slate-500" />
                <p className="text-sm font-medium text-center px-4 leading-relaxed text-slate-300">Tidak ada jadwal ditemukan pada tanggal/sesi ini.<br/>Silakan cek kembali hari pilihanmu.</p>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <p className="text-xs text-indigo-200 font-bold tracking-wider bg-indigo-900/50 text-indigo-100 px-5 py-2.5 rounded-xl inline-block mb-3 border border-indigo-700/50">
                  ✨ Jadwal Ditemukan! Klik status jika ada yang tidak hadir.
                </p>
                {petugas.map((p, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row md:items-center gap-4 p-5 bg-slate-700/30 rounded-2xl border border-indigo-900/50 hover:border-indigo-600/30 transition-colors">
                    <span className="font-bold text-indigo-400 text-lg hidden md:block">{idx + 1}.</span>
                    <div className="flex-1 font-bold text-white text-base tracking-tight">{p.nama}</div>
                    
                    {/* Tombol Status Kehadiran Warna-Warni */}
                    <div className="flex gap-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-700/60 shrink-0">
                      {[
                        { status: 'Hadir', icon: '✅', color: 'emerald' },
                        { status: 'Sakit', icon: '🤒', color: 'amber' },
                        { status: 'Izin', icon: '📝', color: 'blue' },
                        { status: 'Alpa', icon: '❌', color: 'red' },
                      ].map((item) => (
                        <button
                          key={item.status} type="button"
                          onClick={() => handleStatusChange(idx, item.status)}
                          className={`px-3 py-2 rounded-lg text-[11px] font-bold tracking-wider transition-colors flex items-center gap-1 ${
                            p.status === item.status 
                              ? item.color === 'emerald' ? 'bg-emerald-500 text-white' : item.color === 'red' ? 'bg-red-500 text-white' : item.color === 'blue' ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'
                              : 'text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {item.icon} {item.status.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SEKSI 3: UPLOAD BUKTI FOTO - ALA DOKUMEN FOTOGRAFIK */}
          <div className="bg-slate-800/60 p-6 rounded-[2rem] shadow-2xl border border-white/10 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2.5">📸 <span className="text-slate-100/90">Bukti Kehadiran</span></h2>
            <p className="text-xs text-indigo-300 font-medium mb-5">Wajib foto bersama di pos penjagaan untuk verifikasi sistem.</p>
            
            <label className={`flex flex-col items-center justify-center w-full h-56 border-4 border-dashed rounded-2xl cursor-pointer transition-all ${photoPreview ? 'border-indigo-500 bg-indigo-900/30' : 'border-slate-600 bg-slate-700/30 hover:border-indigo-600/50 hover:bg-slate-700/50'}`}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                {photoPreview ? (
                  <div className="relative w-full h-48 flex justify-center">
                    <img src={photoPreview} alt="Preview" className="h-full rounded-2xl object-contain shadow-2xl border border-white/10" />
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-12 h-12 text-slate-500 mb-4" />
                    <p className="mb-2 text-base text-slate-300 leading-relaxed">
                      <span className="font-semibold text-indigo-400">Klik di sini untuk unggah foto</span><br/>atau ambil selfie langsung di pos
                    </p>
                  </>
                )}
              </div>
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || petugas.length === 0} 
            className={`w-full py-4.5 rounded-3xl font-extrabold text-white text-lg shadow-xl tracking-wider transition-all duration-300 ${isSubmitting || petugas.length === 0 ? 'bg-slate-500 cursor-not-allowed opacity-70' : 'bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:-translate-y-1 hover:shadow-indigo-500/30 shadow-[0_0_30px_rgba(79,70,229,0.3)]'}`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2"><Loader2 className="w-6 h-6 animate-spin" /> MENGIRIM DATA...</span>
            ) : (
              <span className="flex items-center justify-center gap-2"><CheckCircle2 className="w-6 h-6" /> KIRIM ABSENSI SEKARANG</span>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}