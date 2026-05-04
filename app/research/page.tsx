import type { Metadata } from 'next';
import ResearchTool from './ResearchTool';

export const metadata: Metadata = {
  title: 'AI投研情报助手',
  description: '粘贴财报或研报文本，AI自动提取PE/PB/营收增速等核心财务指标，生成结构化投研分析报告。',
};

export default function ResearchPage() {
  return <ResearchTool />;
}
