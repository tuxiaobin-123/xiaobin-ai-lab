import type { Metadata } from 'next';
import PromptGallery from './PromptGallery';

export const metadata: Metadata = {
  title: 'AI提示词画廊',
  description: '30+ 精选提示词模板，一键 Remix 生成专属 AI 指令。涵盖创作、分析、代码、商业、学习五大类别。',
};

export default function PromptGalleryPage() {
  return <PromptGallery />;
}
