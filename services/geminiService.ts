
import { GoogleGenAI, Type } from "@google/genai";
import { DailySummary, DimensionDetail, Sign, Dimension } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SIGN_DATA: Record<Sign, string> = {
  '白羊座': '火象, 守护星:火星. 今日特质: 开创性与竞争意识',
  '金牛座': '土象, 守护星:金星. 今日特质: 物质积累与感官享受',
  '双子座': '风象, 守护星:水星. 今日特质: 信息流转与二元思维',
  '巨蟹座': '水象, 守护星:月亮. 今日特质: 情绪滋养与安全边界',
  '狮子座': '火象, 守护星:太阳. 今日特质: 自我表现与领导魅力',
  '处女座': '土象, 守护星:水星. 今日特质: 精准分析与秩序重建',
  '天秤座': '风象, 守护星:金星. 特质: 平衡协作与审美判断',
  '天蝎座': '水象, 守护星:冥王星. 今日特质: 意志博弈与深刻洞察',
  '射手座': '火象, 守护星:木星. 今日特质: 愿景扩张与真理探索',
  '摩羯座': '土象, 守护星:土星. 今日特质: 架构长期目标与务实克制',
  '水瓶座': '风象, 守护星:天王星. 今日特质: 群体突破与逻辑创新',
  '双鱼座': '水象, 守护星:海王星. 今日特质: 潜意识融合与艺术灵感'
};

function cleanJsonString(input: string): string {
  return input.replace(/```json\n?|```/g, '').trim();
}

export const getDailySummary = async (sign: Sign): Promise<DailySummary> => {
  const today = new Date().toLocaleDateString('zh-CN', { 
    timeZone: 'Asia/Shanghai', 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  });
  
  // 生成一个基于日期和星座的伪随机种子，确保不同星座调用参数不同
  const seed = Array.from(sign + today).reduce((acc, char) => acc + char.charCodeAt(0), 0);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: `你是一个毒舌且精准的占星大师。今天是 ${today}。
      当前任务：为【${sign}】生成【绝对唯一】的今日运势。
      
      【${sign}】的星图基底：${SIGN_DATA[sign]}。
      
      强制差异化指令：
      1. 拒绝平庸：严禁出现“适合学习”、“多喝水”、“注意情绪”等万能套话。如果内容能套用在另一个星座上，就是失败。
      2. 锁定相位：根据今日日期 ${today}，假想一个影响【${sign}】守护星的具体挑战（如：火星逆行带来的阻滞或月亮合相带来的直觉暴涨）。
      3. 维度冲突：五个维度（财务、健康、情绪、家庭、事业）必须有起伏，不能全是正面或全是中性。
      4. 语言风格：专业且具有穿透力，每句话必须包含【${sign}】特有的性格锚点。
      5. 随机扰动种子：${seed}（请根据此随机数调整今日的侧重点）。`,
      config: {
        temperature: 0.9, // 调高随机性，防止模型进入默认模式
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        seed: seed, // 注入种子
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overall: { type: Type.STRING, description: "今日核心星象对该星座的独特影响" },
            dimensions: {
              type: Type.OBJECT,
              properties: {
                finance: { type: Type.OBJECT, properties: { brief: { type: Type.STRING } } },
                health: { type: Type.OBJECT, properties: { brief: { type: Type.STRING } } },
                emotion: { type: Type.OBJECT, properties: { brief: { type: Type.STRING } } },
                family: { type: Type.OBJECT, properties: { brief: { type: Type.STRING } } },
                career: { type: Type.OBJECT, properties: { brief: { type: Type.STRING } } },
              }
            },
            closing: { type: Type.STRING, description: "一句话避坑指南" },
            disclaimer: { type: Type.STRING }
          }
        }
      }
    });

    const result = JSON.parse(cleanJsonString(response.text || '{}')) as DailySummary;
    result.sign = sign;
    result.date = today;
    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const getDimensionDetail = async (sign: Sign, dimension: Dimension): Promise<DimensionDetail> => {
  const today = new Date().toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
  const dimLabel = { finance: '财务', health: '健康', emotion: '情感', family: '家庭', career: '事业' }[dimension];
  const seed = Array.from(sign + dimension + today).reduce((acc, char) => acc + char.charCodeAt(0), 0);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `深度演算【${sign}】（${SIGN_DATA[sign]}）在“${dimLabel}”维度的今日（${today}）深度运势。
      
      要求：
      1. 分析内容不少于 600 字，必须包含一个具体的“星象解释”（例如：土星在你的第几宫逆行）。
      2. 给出 3 个【非常具体】的行为建议（不要说“保持乐观”，要说“在下午3点前检查合同的第二页”）。
      3. 差异化种子：${seed}。`,
      config: {
        temperature: 0.85,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        seed: seed,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            astro_context: { type: Type.STRING },
            analysis: { type: Type.STRING },
            action_tips: { type: Type.ARRAY, items: { type: Type.STRING } },
            lucky: {
              type: Type.OBJECT,
              properties: {
                time_range: { type: Type.STRING },
                color: { type: Type.STRING },
                direction: { type: Type.STRING }
              }
            }
          }
        }
      }
    });

    const result = JSON.parse(cleanJsonString(response.text || '{}')) as DimensionDetail;
    result.sign = sign;
    result.dimension = dimension;
    result.date = today;
    return result;
  } catch (error) {
    throw error;
  }
};
