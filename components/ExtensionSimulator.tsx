
import React, { useState, useEffect, useRef } from 'react';
import { User, UserStatus, PaymentRequest } from '../types';

interface ExtensionSimulatorProps {
  user: User | null;
  setUser: (u: User | null) => void;
}

const ExtensionSimulator: React.FC<ExtensionSimulatorProps> = ({ user, setUser }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  // Using ReturnType<typeof setTimeout> instead of NodeJS.Timeout to fix the namespace error in browser environment
  const [hoverTimer, setHoverTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [payMethod, setPayMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sample images for the demo
  const sampleImages = [
    { src: 'https://picsum.photos/800/600?random=1', label: 'Landscape' },
    { src: 'https://picsum.photos/600/800?random=2', label: 'Portrait' },
    { src: 'https://picsum.photos/800/800?random=3', label: 'Square' },
    { src: 'https://cdn-icons-png.flaticon.com/512/2111/2111463.png', label: 'Logo (Filtered)', isLogo: true }, // Filtered out
    { src: 'https://picsum.photos/800/600?random=4', label: 'Street Art' },
    { src: 'https://picsum.photos/800/600?random=5', label: 'Abstract' },
  ];

  const handleMouseEnter = (index: number, isLogo?: boolean) => {
    if (isLogo) return; // Skip logos/icons
    
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

    // Check limit
    if (user.status === UserStatus.FREE && user.downloadsToday >= 10) {
      setShowPayModal(true);
      return;
    }

    setDownloadingIndex(index);
    // Simulate JPG conversion and download
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = sampleImages[index].src;
      link.download = `VisionSave_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setDownloadingIndex(null);

      // Update user state
      const updatedUser = { 
        ...user, 
        downloadsToday: user.downloadsToday + 1 
      };
      localStorage.setItem('visionsave_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      alert('Downloaded successfully as JPG!');
    }, 1500);
  };

  const submitPayment = () => {
    if (!phoneNumber || phoneNumber.length < 11) {
      alert('Please enter a valid 11-digit phone number.');
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
      status: 'PENDING'
    };

    // Store in "DB"
    const current = localStorage.getItem('visionsave_payments');
    const requests = current ? JSON.parse(current) : [];
    requests.push(newRequest);
    localStorage.setItem('visionsave_payments', JSON.stringify(requests));

    // Update user status to PENDING
    if (user) {
      const updatedUser = { ...user, status: UserStatus.PENDING };
      localStorage.setItem('visionsave_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setShowPayModal(false);
      alert('Payment info submitted! Please wait for admin approval.');
    }, 1000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold">Extension Simulation</h2>
          <p className="text-gray-500">Hover over images for 1 second to auto-download.</p>
        </div>
        <div className="bg-white border p-4 rounded-xl shadow-sm flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <i className="fas fa-user text-blue-600"></i>
          </div>
          <div>
            <div className="text-sm font-bold text-gray-800">{user?.username}</div>
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${user?.status === UserStatus.PREMIUM ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {user?.status}
              </span>
              <span className="text-xs text-gray-400">Downloads: {user?.downloadsToday}/10</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {sampleImages.map((img, idx) => (
          <div 
            key={idx}
            className="relative group cursor-pointer overflow-hidden rounded-2xl bg-gray-200 aspect-[4/3]"
            onMouseEnter={() => handleMouseEnter(idx, img.isLogo)}
            onMouseLeave={handleMouseLeave}
          >
            <img 
              src={img.src} 
              alt={img.label}
              className={`w-full h-full object-cover transition-all duration-700 ${hoveredIndex === idx ? 'scale-105 blur-sm' : ''}`}
            />
            {/* Hover Glow Effect */}
            {hoveredIndex === idx && (
              <div className="absolute inset-0 border-4 border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.6)] animate-pulse pointer-events-none rounded-2xl z-10"></div>
            )}
            
            {/* Loading Overlay */}
            {downloadingIndex === idx && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white z-20">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-xs font-bold uppercase tracking-widest">Downloading...</p>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
              <p className="text-white text-sm font-medium">{img.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="bg-gray-900 p-8 text-white text-center relative">
              <button onClick={() => setShowPayModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                <i className="fas fa-times"></i>
              </button>
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-crown text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold mb-2">Unlock Premium</h3>
              <p className="text-gray-400 text-sm">You've used your 10 daily free downloads. Go unlimited now!</p>
            </div>
            
            <div className="p-8">
              <div className="mb-6">
                <h4 className="font-bold text-gray-800 mb-4">Subscription Benefits:</h4>
                <ul className="space-y-3">
                  <li className="flex items-center text-sm text-gray-600">
                    <i className="fas fa-check-circle text-green-500 mr-2"></i> Unlimited daily downloads
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <i className="fas fa-check-circle text-green-500 mr-2"></i> High-resolution 4K JPG conversion
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <i className="fas fa-check-circle text-green-500 mr-2"></i> Batch image downloading
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <i className="fas fa-check-circle text-green-500 mr-2"></i> Remove all branding/watermarks
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 border p-4 rounded-xl mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Payment Instructions</p>
                <p className="text-sm text-gray-700 mb-2">Send <strong>500 BDT</strong> to the number below via <strong>bKash</strong> or <strong>Nagad</strong> Send Money:</p>
                <div className="text-center bg-white border p-2 rounded-lg font-mono font-bold text-lg select-all cursor-pointer">
                  +8801339349801
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Method</label>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setPayMethod('bKash')}
                      className={`flex-1 py-2 rounded-lg border-2 font-bold transition-all ${payMethod === 'bKash' ? 'border-pink-500 text-pink-500 bg-pink-50' : 'border-gray-100 text-gray-400'}`}
                    >
                      bKash
                    </button>
                    <button 
                      onClick={() => setPayMethod('Nagad')}
                      className={`flex-1 py-2 rounded-lg border-2 font-bold transition-all ${payMethod === 'Nagad' ? 'border-orange-500 text-orange-500 bg-orange-50' : 'border-gray-100 text-gray-400'}`}
                    >
                      Nagad
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Your Mobile Number (Used to Pay)</label>
                  <input 
                    type="text" 
                    placeholder="01XXXXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-green-500 outline-none transition-all"
                  />
                </div>
                <button 
                  onClick={submitPayment}
                  disabled={isSubmitting}
                  className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 active:scale-95 transition-all"
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm Payment Submission'}
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
