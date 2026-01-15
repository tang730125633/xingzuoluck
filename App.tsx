
import React, { useState, useEffect, useCallback } from 'react';
import { Sign, Dimension, DailySummary, DimensionDetail, UserProfile } from './types';
import { getDailySummary, getDimensionDetail } from './services/geminiService';

const SIGNS: Sign[] = ['白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'];
const SIGN_SYMBOLS: Record<Sign, string> = { '白羊座': '♈', '金牛座': '♉', '双子座': '♊', '巨蟹座': '♋', '狮子座': '♌', '处女座': '♍', '天秤座': '♎', '天蝎座': '♏', '射手座': '♐', '摩羯座': '♑', '水瓶座': '♒', '双鱼座': '♓' };
const SIGN_COLORS: Record<Sign, string> = {
  '白羊座': 'from-red-600', '金牛座': 'from-green-600', '双子座': 'from-yellow-500', 
  '巨蟹座': 'from-blue-400', '狮子座': 'from-orange-500', '处女座': 'from-teal-600',
  '天秤座': 'from-pink-500', '天蝎座': 'from-purple-800', '射手座': 'from-indigo-600',
  '摩羯座': 'from-stone-700', '水瓶座': 'from-cyan-500', '双鱼座': 'from-violet-500'
};

const DIMENSION_MAP: Record<Dimension, { label: string; icon: string }> = {
  finance: { label: '财务', icon: '💰' },
  health: { label: '健康', icon: '🌿' },
  emotion: { label: '情感', icon: '💜' },
  family: { label: '家庭', icon: '🏠' },
  career: { label: '事业', icon: '🚀' }
};

const LoadingOverlay: React.FC<{ message?: string }> = ({ message = "同步星轨数据..." }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4"></div>
      <p className="text-purple-300 text-[10px] font-black tracking-widest uppercase animate-pulse">{message}</p>
    </div>
  </div>
);

const Paywall: React.FC<{ 
  onClose: () => void, 
  onPurchase: (type: 'premium' | Dimension) => void,
  targetDimension?: Dimension | null
}> = ({ onClose, onPurchase, targetDimension }) => {
  return (
    <div className="fixed inset-0 z-[110] bg-slate-950 flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-500 overflow-y-auto pb-20">
      <div className="p-6 flex justify-between items-center border-b border-white/5">
        <button onClick={onClose} className="text-slate-500 text-sm font-bold">关闭</button>
        <span className="text-[10px] font-black text-amber-500 tracking-[0.3em] uppercase">Premium Access</span>
        <div className="w-8"></div>
      </div>
      
      <div className="p-8 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-yellow-200 rounded-3xl rotate-12 flex items-center justify-center shadow-[0_0_50px_rgba(251,191,36,0.3)] mb-8">
          <span className="text-4xl -rotate-12">💎</span>
        </div>
        <h2 className="text-3xl font-black text-white mb-2">解锁深层星象演算</h2>
        <p className="text-slate-400 text-sm leading-relaxed mb-10 max-w-[280px]">
          获取由 Gemini Pro 驱动的深度星盘分析，掌握改变命运的每一个瞬间。
        </p>

        <div className="w-full space-y-4 mb-12">
          <button 
            onClick={() => onPurchase('premium')}
            className="w-full glass p-6 rounded-[32px] border-amber-500/30 bg-amber-500/5 text-left relative overflow-hidden group active:scale-95 transition-all"
          >
            <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[9px] font-black px-4 py-1 rounded-bl-xl uppercase">最受欢迎</div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xl font-black text-white">星钻终身会员</span>
              <span className="text-2xl font-black text-amber-500">¥98</span>
            </div>
            <p className="text-xs text-amber-200/60 mb-4">无限次访问全维度深度解析 + 优先响应</p>
            <div className="flex gap-2 flex-wrap">
              {Object.values(DIMENSION_MAP).map(d => <span key={d.label} className="text-[8px] bg-white/5 px-2 py-0.5 rounded-full text-slate-400">✓ {d.label}</span>)}
            </div>
          </button>

          {targetDimension && (
            <button 
              onClick={() => onPurchase(targetDimension)}
              className="w-full glass p-6 rounded-[32px] border-white/10 text-left active:scale-95 transition-all"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-lg font-bold text-white">单项解锁：{DIMENSION_MAP[targetDimension].label}</span>
                <span className="text-xl font-black text-slate-300">¥9.9</span>
              </div>
              <p className="text-xs text-slate-500">仅解锁当前所选领域的深度演算报告</p>
            </button>
          )}
        </div>

        <div className="w-full space-y-4 text-left glass p-6 rounded-3xl border-white/5 mb-8">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">会员特权对比</h4>
          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">每日基础运势总结</span>
              <span className="text-green-500 font-bold">免费</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">500字+ 深度维度解析</span>
              <span className="text-amber-500 font-bold">仅限会员</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">星象相位精准预测</span>
              <span className="text-amber-500 font-bold">仅限会员</span>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-slate-600">点击购买即表示同意《服务协议》与《隐私政策》</p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile>(() => ({
    uid: 'u_' + Math.random().toString(36).slice(2, 7),
    selectedSign: (localStorage.getItem('selectedSign') as Sign) || null,
    entitlements: JSON.parse(localStorage.getItem('entitlements') || '[]'),
    isPremium: localStorage.getItem('isPremium') === 'true'
  }));

  const [view, setView] = useState<'onboarding' | 'home' | 'detail'>(user.selectedSign ? 'home' : 'onboarding');
  const [showPaywall, setShowPaywall] = useState(false);
  const [pendingDimension, setPendingDimension] = useState<Dimension | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<DimensionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (sign: Sign) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDailySummary(sign);
      if (!data || !data.overall) throw new Error("无效的星轨数据");
      setSummary(data);
    } catch (e) {
      setError("星轨同步异常，请检查网络后重试");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user.selectedSign && view === 'home' && !summary && !error) {
      loadData(user.selectedSign);
    }
  }, [user.selectedSign, view, summary, error, loadData]);

  const handleOpenDetail = async (dim: Dimension) => {
    const isUnlocked = user.isPremium || user.entitlements.includes(dim);
    if (!isUnlocked) {
      setPendingDimension(dim);
      setShowPaywall(true);
      return;
    }
    setLoading(true);
    try {
      const detail = await getDimensionDetail(user.selectedSign!, dim);
      setSelectedDetail(detail);
      setView('detail');
    } catch (e) {
      alert("深度推演失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (type: 'premium' | Dimension) => {
    setLoading(true);
    setTimeout(() => {
      let newUser = { ...user };
      if (type === 'premium') {
        newUser.isPremium = true;
        localStorage.setItem('isPremium', 'true');
      } else {
        const newEnts = [...user.entitlements, type];
        newUser.entitlements = newEnts;
        localStorage.setItem('entitlements', JSON.stringify(newEnts));
      }
      setUser(newUser);
      setLoading(false);
      setShowPaywall(false);
      alert("支付成功！特权已生效。");
      if (type !== 'premium') handleOpenDetail(type);
    }, 1200);
  };

  const resetToOnboarding = () => {
    setSummary(null);
    setSelectedDetail(null);
    setError(null);
    setView('onboarding');
  };

  if (view === 'onboarding') {
    return (
      <div className="min-h-screen p-8 flex flex-col items-center bg-slate-950 star-bg">
        <div className="mt-20 text-center mb-12">
          <div className="text-8xl mb-6 relative">
             <div className="absolute inset-0 blur-3xl bg-purple-500/20 rounded-full animate-pulse"></div>
             <span className="relative">🪐</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">星象时运</h1>
          <p className="text-slate-500 font-bold text-[10px] tracking-[0.4em] uppercase">Individualized Astro Analysis</p>
        </div>
        <div className="grid grid-cols-3 gap-3 w-full max-w-lg">
          {SIGNS.map(s => (
            <button key={s} onClick={() => {
              localStorage.setItem('selectedSign', s);
              setSummary(null);
              setError(null);
              setUser(p => ({ ...p, selectedSign: s }));
              setView('home');
            }} className="glass rounded-3xl p-4 transition-all active:scale-95 border-white/5 hover:border-purple-500/50 group">
              <div className="text-2xl mb-1 group-hover:scale-110">{SIGN_SYMBOLS[s]}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase">{s}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#020617] relative">
      {loading && <LoadingOverlay message={showPaywall ? '验证支付中...' : '推演星图中...'} />}
      {showPaywall && (
        <Paywall 
          onClose={() => setShowPaywall(false)} 
          onPurchase={handlePurchase} 
          targetDimension={pendingDimension}
        />
      )}
      
      {view === 'home' && (
        <div className="p-6 pb-24">
          <header className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${SIGN_COLORS[user.selectedSign!] || 'from-slate-600'} flex items-center justify-center text-xl shadow-lg border border-white/10`}>
                {SIGN_SYMBOLS[user.selectedSign!]}
              </div>
              <h2 className="text-xl font-black text-white">{user.selectedSign}</h2>
            </div>
            
            <button 
              onClick={resetToOnboarding}
              className="text-[9px] font-black bg-white/5 px-4 py-2 rounded-full border border-white/10 text-slate-400 uppercase"
            >
              更换星座
            </button>
          </header>

          <div className="flex items-center gap-4 p-5 glass rounded-[32px] border-white/10 mb-8">
            <div className="w-14 h-16 bg-white rounded-xl flex flex-col items-center justify-center border-b-4 border-red-500 shadow-lg">
              <span className="text-[10px] font-black text-slate-400 uppercase">{new Date().getMonth()+1}月</span>
              <span className="text-2xl font-black text-slate-900">{new Date().getDate()}</span>
            </div>
            <div>
              <h3 className="text-white font-black text-lg">今日星象</h3>
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Aura: Harmonized</p>
            </div>
          </div>

          {error && (
            <div className="py-20 text-center glass rounded-3xl p-8 border-red-500/20">
              <p className="text-red-400 text-sm mb-6">{error}</p>
              <button onClick={() => loadData(user.selectedSign!)} className="bg-purple-600 px-8 py-3 rounded-full text-xs font-black uppercase">点击重试</button>
            </div>
          )}

          {!error && summary && (
            <div className="space-y-6">
              <div className="glass rounded-[40px] p-8 border-white/10 relative overflow-hidden">
                <div className="text-[10px] font-black text-purple-500 mb-6 tracking-[0.4em] uppercase">今日全域综述</div>
                <p className="text-slate-100 text-xl leading-relaxed font-medium">{summary.overall}</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {(Object.keys(DIMENSION_MAP) as Dimension[]).map(dim => {
                  const unlocked = user.isPremium || user.entitlements.includes(dim);
                  const brief = summary.dimensions?.[dim]?.brief || "等待解析...";
                  return (
                    <button key={dim} onClick={() => handleOpenDetail(dim)} className="glass group rounded-[32px] p-6 border-white/5 hover:bg-white/5 text-left relative overflow-hidden transition-all">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-black text-white flex items-center gap-3">
                          <span className="text-2xl">{DIMENSION_MAP[dim].icon}</span>
                          {DIMENSION_MAP[dim].label}
                        </span>
                        <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase border ${unlocked ? 'border-green-500/20 text-green-500' : 'border-white/10 text-slate-500'}`}>
                          {unlocked ? '已解锁' : '解锁深度'}
                        </span>
                      </div>
                      <p className={`text-sm text-slate-400 leading-relaxed ${!unlocked ? 'blur-[6px] opacity-30 select-none' : ''}`}>
                        {brief}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'detail' && selectedDetail && (
        <div className="p-8 pb-32 animate-in fade-in slide-in-from-right-10">
          <button onClick={() => setView('home')} className="mb-10 text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-white">← 返回列表</button>
          <h2 className="text-4xl font-black text-white mb-2">{selectedDetail.title}</h2>
          <p className="text-amber-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Premium Astro Analysis</p>
          
          <div className="glass p-8 rounded-[40px] border-amber-500/20 mb-10 italic text-slate-200 text-lg leading-relaxed">
             {selectedDetail.astro_context}
          </div>

          <p className="text-slate-100 text-xl leading-[2.1] font-light mb-16 whitespace-pre-line text-justify">
            {selectedDetail.analysis}
          </p>

          <div className="glass rounded-[40px] p-10 border-white/5">
            <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.5em] mb-10 text-center">行动指南</h4>
            <ul className="space-y-8">
              {selectedDetail.action_tips?.map((t, i) => (
                <li key={i} className="flex gap-6 text-base text-slate-100 font-medium">
                  <span className="text-amber-500 text-xl">✦</span>
                  <span className="leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      <div className="fixed bottom-0 left-0 right-0 p-4 text-center bg-slate-950/90 backdrop-blur-md border-t border-white/5 z-50">
        <p className="text-[9px] text-slate-600 tracking-tight">内容仅供娱乐，不构成投资或医疗建议。星象数据由 AI 演算生成。</p>
      </div>
    </div>
  );
};

export default App;
