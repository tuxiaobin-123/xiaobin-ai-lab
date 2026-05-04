import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = '晓斌AI实验室 — 用AI工具构建个人品牌资产库';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '80px',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1033 50%, #0a0a0a 100%)',
          color: 'white',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: 'absolute',
            top: -200,
            right: -100,
            width: 600,
            height: 600,
            background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -180,
            left: -120,
            width: 500,
            height: 500,
            background: 'radial-gradient(circle, rgba(244,63,94,0.22) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Logo badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
            }}
          >
            ✨
          </div>
          <span style={{ fontSize: 28, color: '#a3a3a3', fontWeight: 500 }}>
            晓斌AI实验室
          </span>
        </div>

        {/* Main heading */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 'auto',
            marginBottom: 'auto',
          }}
        >
          <div
            style={{
              fontSize: 88,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <span>用 AI 工具</span>
            <span
              style={{
                background: 'linear-gradient(90deg, #818cf8, #c084fc, #fb7185)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              构建个人品牌资产库
            </span>
          </div>
          <div
            style={{
              fontSize: 32,
              color: '#a3a3a3',
              marginTop: 32,
              display: 'flex',
              gap: 24,
            }}
          >
            <span>提示词画廊</span>
            <span style={{ color: '#525252' }}>·</span>
            <span>投研助手</span>
            <span style={{ color: '#525252' }}>·</span>
            <span>内容引擎</span>
          </div>
        </div>

        {/* Footer badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 40,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '8px 18px',
              borderRadius: 999,
              background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.3)',
              fontSize: 22,
              color: '#34d399',
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: '#34d399',
                display: 'flex',
              }}
            />
            30 天公开构建实验
          </div>
          <span style={{ fontSize: 22, color: '#737373' }}>
            xiaobin-ai-lab
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
