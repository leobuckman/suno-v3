import { useState, useCallback } from 'react';
import svgPaths from '../../utils/svgPaths';
import useAudioPlayback from './useAudioPlayback';

const InteractiveCircleOfFifths = () => {
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [hoveredKey, setHoveredKey] = useState(null);
  const { playNote, stopNote } = useAudioPlayback();

  const handleKeyHover = useCallback((keyName) => {
    setHoveredKey(keyName);
    playNote(keyName);
  }, [playNote]);

  const handleKeyLeave = useCallback((keyName) => {
    setHoveredKey(null);
    stopNote(keyName);
  }, [stopNote]);

  const handleKeyClick = (keyName) => {
    const existingIndex = selectedKeys.findIndex(k => k.name === keyName);
    
    if (existingIndex >= 0) {
      // Remove key if already selected
      setSelectedKeys(selectedKeys.filter((_, i) => i !== existingIndex));
    } else if (selectedKeys.length < 3) {
      // Add key if less than 3 selected
      setSelectedKeys([...selectedKeys, { name: keyName, section: 'Verse' }]);
    }
  };

  const handleSectionChange = (keyName, section) => {
    setSelectedKeys(selectedKeys.map(k => 
      k.name === keyName ? { ...k, section } : k
    ));
  };

  const isKeySelected = (keyName) => selectedKeys.some(k => k.name === keyName);

  const keys = [
    { name: 'C', path: svgPaths.p13651400, inset: 'inset-[0_37.06%_85.12%_37.06%]', svgInset: 'inset-[-2.21%_-1.55%_-2.7%_-1.55%]', textInset: 'inset-[4.09%_48.89%_92.63%_48.98%]', viewBox: '0 0 162.645 95.1127' },
    { name: 'G', path: svgPaths.p14cd4380, inset: 'inset-[1.7%_14.64%_75.71%_59.41%]', svgInset: 'inset-[-1.78%_-1.79%_-2.05%_-1.55%]', textInset: 'inset-[9.88%_27.3%_86.84%_70.57%]', viewBox: '0 0 163.401 142.919' },
    { name: 'D', path: svgPaths.p30359720, inset: 'inset-[14.64%_1.7%_59.41%_75.71%]', svgInset: 'inset-[-1.79%_-1.78%_-1.55%_-2.05%]', textInset: 'inset-[25.68%_11.66%_71.04%_86.37%]', viewBox: '0 0 142.92 163.401' },
    { name: 'A', path: svgPaths.p82baf00, inset: 'inset-[37.06%_0_37.06%_85.12%]', svgInset: 'inset-[-1.55%_-2.21%_-1.55%_-2.7%]', textInset: 'inset-[47.27%_5.87%_49.45%_92.16%]', viewBox: '0 0 95.1128 162.645' },
    { name: 'E', path: svgPaths.p1dfb3f80, inset: 'inset-[59.41%_1.7%_14.64%_75.71%]', svgInset: 'inset-[-1.55%_-1.78%_-1.79%_-2.05%]', textInset: 'inset-[68.86%_11.87%_27.85%_86.49%]', viewBox: '0 0 142.92 163.401' },
    { name: 'B', path: svgPaths.p2c586b00, inset: 'inset-[75.71%_14.64%_1.7%_59.41%]', svgInset: 'inset-[-2.05%_-1.79%_-1.78%_-1.55%]', textInset: 'inset-[84.67%_27.51%_12.05%_70.68%]', viewBox: '0 0 163.401 142.92' },
    { name: 'F♯', path: svgPaths.p1595fe80, inset: 'inset-[85.12%_37.06%_0_37.06%]', svgInset: 'inset-[-2.7%_-1.55%_-2.21%_-1.55%]', textInset: 'inset-[90.45%_46.69%_6.26%_46.25%]', viewBox: '0 0 162.645 95.1128' },
    { name: 'D♭', path: svgPaths.p232f3f00, inset: 'inset-[75.71%_59.41%_1.7%_14.64%]', svgInset: 'inset-[-2.05%_-1.55%_-1.78%_-1.79%]', textInset: 'inset-[84.67%_70.12%_12.05%_26.93%]', viewBox: '0 0 163.401 142.92' },
    { name: 'A♭', path: svgPaths.p239ca600, inset: 'inset-[59.41%_75.71%_14.64%_1.7%]', svgInset: 'inset-[-1.55%_-2.05%_-1.79%_-1.78%]', textInset: 'inset-[68.86%_86.08%_27.85%_11.13%]', viewBox: '0 0 142.919 163.401' },
    { name: 'E♭', path: svgPaths.p21cedd00, inset: 'inset-[37.06%_85.12%_37.06%_0]', svgInset: 'inset-[-1.55%_-2.7%_-1.55%_-2.21%]', textInset: 'inset-[47.27%_91.92%_49.45%_5.45%]', viewBox: '0 0 95.1127 162.645' },
    { name: 'B♭', path: svgPaths.p3096f200, inset: 'inset-[14.64%_75.71%_59.41%_1.7%]', svgInset: 'inset-[-1.79%_-2.05%_-1.55%_-1.78%]', textInset: 'inset-[25.68%_85.97%_71.04%_11.24%]', viewBox: '0 0 142.919 163.401' },
    { name: 'F', path: svgPaths.p3179b400, inset: 'inset-[1.7%_59.41%_75.71%_14.64%]', svgInset: 'inset-[-1.78%_-1.55%_-2.05%_-1.79%]', textInset: 'inset-[9.88%_70.86%_86.84%_27.5%]', viewBox: '0 0 163.401 142.919' },
    { name: 'Am', path: svgPaths.p264f8500, inset: 'inset-[13.64%_40.59%_71.95%_40.59%]', svgInset: 'inset-[-2.28%_-2.14%_-2.79%_-2.14%]', textInset: 'inset-[17.73%_47.89%_78.99%_47.84%]', viewBox: '0 0 119.623 92.2808' },
    { name: 'Em', path: svgPaths.p1d5c6500, inset: 'inset-[14.88%_24.29%_66.07%_55.88%]', svgInset: 'inset-[-2.11%_-2.34%_-2.44%_-2.03%]', textInset: 'inset-[21.69%_33.17%_75.03%_62.73%]', viewBox: '0 0 126.143 121.409' },
    { name: 'Bm', path: svgPaths.pf1a37c0, inset: 'inset-[24.29%_14.88%_55.88%_66.07%]', svgInset: 'inset-[-2.34%_-2.11%_-2.03%_-2.44%]', textInset: 'inset-[32.5%_22.31%_64.22%_73.43%]', viewBox: '0 0 121.409 126.143' },
    { name: 'F♯m', path: svgPaths.pd524b00, inset: 'inset-[40.59%_13.64%_40.59%_71.95%]', svgInset: 'inset-[-2.14%_-2.28%_-2.14%_-2.79%]', textInset: 'inset-[47.27%_17.6%_49.45%_76.82%]', viewBox: '0 0 92.2807 119.623' },
    { name: 'C♯m', path: svgPaths.p300f9200, inset: 'inset-[55.88%_14.88%_24.29%_66.07%]', svgInset: 'inset-[-2.03%_-2.11%_-2.34%_-2.44%]', textInset: 'inset-[62.05%_21.46%_34.67%_72.63%]', viewBox: '0 0 121.409 126.143' },
    { name: 'G♯m', path: svgPaths.p4eeda00, inset: 'inset-[66.07%_24.29%_14.88%_55.88%]', svgInset: 'inset-[-2.44%_-2.34%_-2.11%_-2.03%]', textInset: 'inset-[72.86%_32.28%_23.86%_61.82%]', viewBox: '0 0 126.143 121.409' },
    { name: 'E♭m', path: svgPaths.p3ca01a00, inset: 'inset-[71.95%_40.59%_13.64%_40.59%]', svgInset: 'inset-[-2.79%_-2.14%_-2.28%_-2.14%]', textInset: 'inset-[76.82%_44.21%_19.9%_43.98%]', viewBox: '0 0 119.623 92.2807' },
    { name: 'B♭m', path: svgPaths.p2a84cd56, inset: 'inset-[66.07%_55.88%_14.88%_24.29%]', svgInset: 'inset-[-2.44%_-2.03%_-2.11%_-2.34%]', textInset: 'inset-[72.86%_62.14%_23.86%_32.61%]', viewBox: '0 0 126.143 121.409' },
    { name: 'Fm', path: svgPaths.p2a0cd40, inset: 'inset-[55.88%_66.07%_24.29%_14.88%]', svgInset: 'inset-[-2.03%_-2.44%_-2.34%_-2.11%]', textInset: 'inset-[62.05%_73.53%_34.67%_22.37%]', viewBox: '0 0 121.409 126.143' },
    { name: 'Cm', path: svgPaths.p39cf5c70, inset: 'inset-[40.59%_71.95%_40.59%_13.64%]', svgInset: 'inset-[-2.14%_-2.79%_-2.14%_-2.28%]', textInset: 'inset-[47.27%_77.39%_49.45%_18.18%]', viewBox: '0 0 92.2808 119.623' },
    { name: 'Gm', path: svgPaths.p226bd500, inset: 'inset-[24.29%_66.07%_55.88%_14.88%]', svgInset: 'inset-[-2.34%_-2.44%_-2.03%_-2.11%]', textInset: 'inset-[32.5%_73.43%_64.22%_22.14%]', viewBox: '0 0 121.409 126.143' },
    { name: 'Dm', path: svgPaths.p50d7400, inset: 'inset-[14.88%_55.88%_66.07%_24.29%]', svgInset: 'inset-[-2.11%_-2.03%_-2.44%_-2.34%]', textInset: 'inset-[21.69%_62.62%_75.03%_32.95%]', viewBox: '0 0 126.143 121.409' }
  ];

  return (
    <div className="relative content-stretch flex flex-row gap-[40px] items-center justify-center px-[44px] py-[24px]" data-name="CircleOfFifths">
        
        {/* Circle */}
        <div className="relative shrink-0 w-[360px] h-[360px] overflow-visible" data-name="Circle">
          <div className="relative w-[360px] h-[360px] overflow-visible">
            {keys.map((key) => {
              const isSelected = isKeySelected(key.name);
              const isHovered = hoveredKey === key.name;
              const fillColor = isSelected 
                ? "#FF1493" 
                : isHovered 
                  ? "#3a3a3f" 
                  : "#252429";
              return (
                <div 
                  key={key.name}
                  className={`absolute ${key.inset} pointer-events-none`} 
                  data-name="Group"
                >
                  <div className={`absolute ${key.svgInset} pointer-events-none`}>
                    <svg className="block size-full overflow-visible pointer-events-none" fill="none" preserveAspectRatio="none" viewBox={key.viewBox}>
                      <path 
                        d={key.path} 
                        fill={fillColor}
                        stroke="#19191B" 
                        strokeWidth="4"
                        className="cursor-pointer pointer-events-auto transition-colors"
                        onClick={() => handleKeyClick(key.name)}
                        onMouseEnter={() => handleKeyHover(key.name)}
                        onMouseLeave={() => handleKeyLeave(key.name)}
                      />
                    </svg>
                  </div>
                </div>
              );
            })}
            {/* Text labels rendered separately on top */}
            {keys.map((key) => {
              const isSelected = isKeySelected(key.name);
              return (
                <p 
                  key={`label-${key.name}`}
                  className={`absolute font-['Inter:Regular','Noto_Sans:Regular',sans-serif] font-normal ${key.textInset} leading-[normal] not-italic text-[12.5px] text-center pointer-events-none ${isSelected ? 'text-white' : 'text-[#a0a0a0]'}`}
                >
                  {key.name}
                </p>
              );
            })}
            {/* Re-render bottom keys on top for better hit detection */}
            {keys.filter(k => ['F♯/G♭', 'D♭', 'B'].includes(k.name)).map((key) => {
              const isSelected = isKeySelected(key.name);
              const isHovered = hoveredKey === key.name;
              const fillColor = isSelected 
                ? "#FF1493" 
                : isHovered 
                  ? "#3a3a3f" 
                  : "#252429";
              return (
                <div 
                  key={`top-${key.name}`}
                  className={`absolute ${key.inset} pointer-events-none z-50`} 
                >
                  <div className={`absolute ${key.svgInset} pointer-events-none`}>
                    <svg className="block size-full overflow-visible pointer-events-none" fill="none" preserveAspectRatio="none" viewBox={key.viewBox}>
                      <path 
                        d={key.path} 
                        fill={fillColor}
                        stroke="#19191B" 
                        strokeWidth="4"
                        className="cursor-pointer pointer-events-auto transition-colors"
                        onClick={() => handleKeyClick(key.name)}
                        onMouseEnter={() => handleKeyHover(key.name)}
                        onMouseLeave={() => handleKeyLeave(key.name)}
                      />
                    </svg>
                  </div>
                </div>
              );
            })}
            {/* Re-render labels for bottom keys */}
            {keys.filter(k => ['F♯/G♭', 'D♭', 'B'].includes(k.name)).map((key) => {
              const isSelected = isKeySelected(key.name);
              return (
                <p 
                  key={`top-label-${key.name}`}
                  className={`absolute font-['Inter:Regular','Noto_Sans:Regular',sans-serif] font-normal ${key.textInset} leading-[normal] not-italic text-[12.5px] text-center pointer-events-none z-50 ${isSelected ? 'text-white' : 'text-[#a0a0a0]'}`}
                >
                  {key.name}
                </p>
              );
            })}
          </div>
        </div>

        {/* Selections */}
        <div className="bg-[#19191b] relative rounded-[14px] w-[370px]" data-name="Selections">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
            
            {/* Title */}
            <div className="h-[40px] relative shrink-0 w-full px-5 mb-4" data-name="SelectedKeysTitle">
              <p className="font-['Inter:Medium',sans-serif] font-medium leading-[40px] not-italic text-[20px] text-white tracking-[-0.4px]">
                Selected Keys ({selectedKeys.length}/3)
              </p>
            </div>

            {/* Selected Keys */}
            <div className="content-stretch flex flex-col gap-[14px] items-center justify-start relative shrink-0 w-full px-5 pb-5" data-name="SelectedKeys">
              {selectedKeys.map((selectedKey, index) => (
                <div key={index} className="bg-[#101012] h-[70px] rounded-[14px] shrink-0 w-full px-[18px]" data-name="SelectedKeyRow">
                  <div className="flex items-center justify-between h-full w-full">
                    {/* Key Name */}
                    <span className="font-['Inter:Medium',sans-serif] font-medium text-[#f1f0ee] text-[18px] tracking-[-0.3px] leading-none">
                      {selectedKey.name}
                    </span>

                    {/* Options */}
                    <div className="flex gap-1.5 items-center" data-name="Options">
                      <button
                        onClick={() => handleSectionChange(selectedKey.name, 'Verse')}
                        className={`h-[32px] px-3 rounded-[10px] transition-colors flex items-center justify-center min-w-[70px] ${
                          selectedKey.section === 'Verse' ? 'bg-[#272729]' : 'bg-transparent hover:bg-[#1a1a1a]'
                        }`}
                      >
                        <span className={`font-['Inter:Medium',sans-serif] font-medium text-[14px] leading-none ${
                          selectedKey.section === 'Verse' ? 'text-white' : 'text-[#5c5b61]'
                        }`}>
                          Verse
                        </span>
                      </button>
                      
                      <button
                        onClick={() => handleSectionChange(selectedKey.name, 'Chorus')}
                        className={`h-[32px] px-3 rounded-[10px] transition-colors flex items-center justify-center min-w-[70px] ${
                          selectedKey.section === 'Chorus' ? 'bg-[#272729]' : 'bg-transparent hover:bg-[#1a1a1a]'
                        }`}
                      >
                        <span className={`font-['Inter:Medium',sans-serif] font-medium text-[14px] leading-none ${
                          selectedKey.section === 'Chorus' ? 'text-white' : 'text-[#5c5b61]'
                        }`}>
                          Chorus
                        </span>
                      </button>

                      <button
                        onClick={() => handleSectionChange(selectedKey.name, 'Bridge')}
                        className={`h-[32px] px-3 rounded-[10px] transition-colors flex items-center justify-center min-w-[70px] ${
                          selectedKey.section === 'Bridge' ? 'bg-[#272729]' : 'bg-transparent hover:bg-[#1a1a1a]'
                        }`}
                      >
                        <span className={`font-['Inter:Medium',sans-serif] font-medium text-[14px] leading-none ${
                          selectedKey.section === 'Bridge' ? 'text-white' : 'text-[#5c5b61]'
                        }`}>
                          Bridge
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Empty Slots */}
              {Array.from({ length: 3 - selectedKeys.length }).map((_, index) => (
                <div key={`empty-${index}`} className="bg-[#101012] h-[70px] relative rounded-[14px] shrink-0 w-full" data-name="SelectedKeyRow">
                  <div className="flex flex-col items-center justify-center size-full">
                    <p className="font-['Inter:Medium',sans-serif] font-medium text-[#5c5b61] text-[13px]">
                      Click a key to select
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
}

export default InteractiveCircleOfFifths;
