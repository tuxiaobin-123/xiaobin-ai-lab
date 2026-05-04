import type { Metadata } from 'next';
import ContentEngine from './ContentEngine';

export const metadata: Metadata = {
  title: '小红书内容引擎',
  description: '输入主题关键词，AI生成爆款标题候选、鱼骨结构正文、抖音30秒口播脚本。',
};

export default function ContentEnginePage() {
  return <ContentEngine />;
}
