
export type Sign = 
  | '白羊座' | '金牛座' | '双子座' | '巨蟹座' 
  | '狮子座' | '处女座' | '天秤座' | '天蝎座' 
  | '射手座' | '摩羯座' | '水瓶座' | '双鱼座';

export type Dimension = 'finance' | 'health' | 'emotion' | 'family' | 'career';

export interface DailySummary {
  date: string;
  sign: Sign;
  overall: string;
  dimensions: {
    [key in Dimension]: { brief: string };
  };
  closing: string;
  disclaimer: string;
}

export interface DimensionDetail {
  date: string;
  sign: Sign;
  dimension: Dimension;
  title: string;
  astro_context: string;
  analysis: string;
  action_tips: string[];
  lucky: {
    time_range: string;
    color: string;
    direction: string;
  };
  disclaimer: string;
}

export interface UserProfile {
  uid: string;
  selectedSign: Sign | null;
  entitlements: Dimension[];
  isPremium: boolean;
}
