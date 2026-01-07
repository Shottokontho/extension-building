import React, { useState, useEffect } from 'react';
import { User, UserStatus, PaymentRequest, PaymentMethod } from '../types.ts';

interface ExtensionSimulatorProps {
  user: User | null;
  setUser: (u: User | null) => void;
}

const ExtensionSimulator: React.FC<ExtensionSimulatorProps> = ({ user, setUser }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoverTimer, setHoverTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('bKash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sampleImages = [
    { src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400', label: 'Unsplash Landscape' },
    { src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400', label: 'Unsplash Coast' },
    { src: 'https://picsum.photos/800/800?random=10', label: 'Google Placeholder' },
    { src: 'https://cdn-icons-png.flaticon.com/512/2111/2111463.png', label: 'Small Logo (Filtered)', isLogo: true },
    { src: 'https://i.pinimg.com/564x/41/49/a8/4149a889814529f7970d443e263d91f4.jpg', label: 'Pinterest Sample' },
    { src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400', label: 'Forest Deep' },
  ];

  const handleMouseEnter = (index: number, isLogo?: boolean) => {
    if (isLogo) return;
    setHoveredIndex(index);
    const timer = setTimeout(() => {
      initiateDownload(index);
    }, 1000);
    setHoverTimer(timer);
  };

  const handleMouseLeave = () => {
    if (hoverTimer) clearTimeout(hoverTimer);
    setHoveredIndex(null);
    setHoverTimer(null);
  };

  const initiateDownload = (index: number) => {
    if (!user) return;
    if (user.status === UserStatus.FREE && user.downloadsToday >= 10) {
      setShowPayModal(true);
      return;
    }

    setDownloadingIndex(index);
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = sampleImages[index].src;
      link.download = `VisionSave_HighRes_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadingIndex(null);

      const updatedUser = { ...user, downloadsToday: user.downloadsToday + 1 };
      localStorage.setItem('visionsave_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }, 1200);
  };

  const submitPayment = () => {
    if (!phoneNumber || phoneNumber.length < 5) {
      alert('Please enter your payment identification details.');
      return;
    }

    setIsSubmitting(true);
    const newRequest: PaymentRequest = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user?.id || '',
      username: user?.username || '',
      phoneNumber: phoneNumber,
      method: payMethod,
      timestamp: Date.now(),
      status: 'PENDING',
      amount: payMethod === 'Binance' ? 0.100 : 100,
      currency: payMethod === 'Binance' ? 'USD' : 'BDT'
    };

    const current = localStorage.getItem('visionsave_payments');
    const requests = current ? JSON.parse(current) : [];
    requests.push(newRequest);
    localStorage.setItem('visionsave_payments', JSON.stringify(requests));

    if (user) {
      const updatedUser = { ...user, status: UserStatus.PENDING };
      localStorage.setItem('visionsave_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setShowPayModal(false);
      alert('Application submitted! Our admin team will verify your transaction shortly.');
    }, 1500);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Extension Workspace</h2>
          <p className="text-gray-500 font-medium">Automatic high-resolution detection active.</p>
        </div>
        <div className="bg-white border-2 border-gray-100 p-5 rounded-2xl shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-200">
            <i className="fas fa-bolt text-white text-lg"></i>
          </div>
          <div>
            <div className="text-sm font-black text-gray-900">{user?.username}</div>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${user?.status === UserStatus.PREMIUM ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                {user?.status}
              </span>
              <span className="text-[10px] font-bold text-gray-400">Quota: {user?.downloadsToday}/10</span>
            </div>
          </div>
          <button 
            onClick={() => setShowPayModal(true)}
            className="ml-4 bg-black text-white px-4 py-2 rounded-xl text-xs font-bold hover:scale-105 transition-all"
          >
            Upgrade
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {sampleImages.map((img, idx) => (
          <div 
            key={idx}
            className="relative group cursor-pointer overflow-hidden rounded-3xl bg-white border-2 border-transparent hover:border-green-500 transition-all shadow-md aspect-[4/3]"
            onMouseEnter={() => handleMouseEnter(idx, img.isLogo)}
            onMouseLeave={handleMouseLeave}
          >
            <img 
              src={img.src} 
              alt={img.label}
              className={`w-full h-full object-cover transition-all duration-1000 ${hoveredIndex === idx ? 'scale-110' : ''}`}
            />
            {hoveredIndex === idx && (
              <div className="absolute inset-0 bg-green-500/10 border-4 border-green-500 shadow-[0_0_80px_rgba(34,197,94,0.4)] z-10 pointer-events-none rounded-3xl"></div>
            )}
            
            {downloadingIndex === idx && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-white z-20">
                <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Extracting High-Res</p>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
              <p className="text-white text-xs font-black uppercase tracking-widest">{img.label}</p>
              <div className="flex space-x-2 mt-2">
                 <span className="text-[8px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">4K DETECTED</span>
                 <span className="text-[8px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">JPG CONVERT</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showPayModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/90 backdrop-blur-xl">
          <div className="bg-white rounded-[40px] max-w-lg w-full overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border border-white/20">
            <div className="bg-gradient-to-br from-gray-900 to-black p-10 text-white text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-3xl -mr-32 -mt-32 rounded-full"></div>
              <button onClick={() => setShowPayModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
                <i className="fas fa-times text-xl"></i>
              </button>
              <div className="w-20 h-20 bg-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12 shadow-2xl shadow-green-500/20">
                <i className="fas fa-crown text-3xl"></i>
              </div>
              <h3 className="text-3xl font-black mb-2 tracking-tight">VisionSave Premium</h3>
              <p className="text-gray-400 text-sm font-medium">Hello, <span className="text-green-400 font-bold">{user?.username}</span>. Go unlimited today.</p>
            </div>
            
            <div className="p-10">
              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <i className="fas fa-infinity text-green-500 mb-2"></i>
                    <p className="text-[10px] font-black text-gray-400 uppercase">Quota</p>
                    <p className="text-sm font-bold text-gray-900">Unlimited</p>
                 </div>
                 <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <i className="fas fa-expand text-blue-500 mb-2"></i>
                    <p className="text-[10px] font-black text-gray-400 uppercase">Quality</p>
                    <p className="text-sm font-bold text-gray-900">Original 4K</p>
                 </div>
              </div>

              <div className="bg-black text-white p-6 rounded-3xl mb-8 relative overflow-hidden">
                <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-4">Payment Hub</p>
                <div className="space-y-4">
                  {payMethod === 'Binance' ? (
                    <div className="animate-in slide-in-from-right duration-300">
                      <p className="text-sm font-medium text-gray-300 mb-2">Send <strong className="text-white text-lg">0.100 USD</strong> to Binance Pay ID:</p>
                      <div className="bg-white/10 p-3 rounded-xl text-center font-mono text-xl font-bold tracking-wider select-all cursor-pointer border border-white/5">1170147359</div>
                    </div>
                  ) : (
                    <div className="animate-in slide-in-from-left duration-300">
                      <p className="text-sm font-medium text-gray-300 mb-2">Send <strong className="text-white text-lg">100 BDT</strong> to Personal Number:</p>
                      <div className="bg-white/10 p-3 rounded-xl text-center font-mono text-xl font-bold tracking-wider select-all cursor-pointer border border-white/5">+8801339349801</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 text-center">Select Payment Engine</label>
                  <div className="flex space-x-2">
                    {(['bKash', 'Nagad', 'Binance'] as const).map((m) => (
                      <button 
                        key={m}
                        onClick={() => setPayMethod(m)}
                        className={`flex-1 py-3 rounded-2xl border-2 font-black text-xs transition-all uppercase tracking-tighter ${payMethod === m ? (m === 'Binance' ? 'border-yellow-400 text-yellow-500 bg-yellow-50' : m === 'bKash' ? 'border-pink-500 text-pink-500 bg-pink-50' : 'border-orange-500 text-orange-500 bg-orange-50') : 'border-gray-50 text-gray-400 bg-gray-50'}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Transaction Ref (Number/ID)</label>
                  <input 
                    type="text" 
                    placeholder={payMethod === 'Binance' ? "Binance ID or Email" : "Your Phone Number"}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-50 p-4 rounded-2xl focus:border-green-500 focus:bg-white outline-none transition-all font-bold text-sm"
                  />
                </div>
                <button 
                  onClick={submitPayment}
                  disabled={isSubmitting}
                  className="w-full bg-green-500 text-white font-black py-5 rounded-2xl shadow-2xl shadow-green-500/30 hover:bg-green-600 active:scale-95 transition-all text-sm uppercase tracking-widest"
                >
                  {isSubmitting ? 'Verifying Node...' : 'Submit Verification'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtensionSimulator;