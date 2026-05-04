export type Prompt = {
  id: string;
  title: string;
  category: '创作' | '分析' | '代码' | '商业' | '学习';
  tags: string[];
  template: string;
  example: string;
  difficulty: '入门' | '进阶' | '专家';
};

export const prompts: Prompt[] = [
  {
    id: 'p001',
    title: '爆款小红书标题生成器',
    category: '创作',
    tags: ['小红书', '标题', '内容创作'],
    template: `你是一位小红书爆款内容专家。
<task>为以下主题生成10个高点击率标题</task>
<context>
- 平台：小红书
- 目标受众：{{target_audience}}
- 内容主题：{{topic}}
</context>
<constraints>
- 每个标题≤20字
- 含emoji
- 采用疑问/数字/反转等钩子形式
- 触发收藏欲（干货感）
</constraints>
请按格式输出：序号. 标题 [类型标注]`,
    example: '主题：AI副业赚钱 → 「打工3年不如AI搞副业1个月？我算了一笔账😱」',
    difficulty: '入门',
  },
  {
    id: 'p002',
    title: '财报关键指标提取器',
    category: '分析',
    tags: ['投研', '财报', '数据提取'],
    template: `你是一位专业投资研究分析师。
<instructions>
从下方财报文本中提取关键财务指标，以Markdown表格输出。
</instructions>
<data>
{{financial_report_text}}
</data>
<output_format>
| 指标 | 本期数值 | 同比变化 | 行业均值 | 评级 |
|------|---------|---------|---------|-----|
（提取：营收、净利润、毛利率、净利率、PE、PB、ROE、资产负债率）
</output_format>
最后附：3个核心风险点 + 3个催化剂事件（各50字以内）`,
    example: '输入任何上市公司财报文本 → 输出结构化分析表格',
    difficulty: '进阶',
  },
  {
    id: 'p003',
    title: '代码Review专家',
    category: '代码',
    tags: ['代码审查', 'TypeScript', '最佳实践'],
    template: `你是一位资深全栈工程师，专注于代码质量和安全。
<task>对以下代码进行全面Review</task>
<code language="{{language}}">
{{code_to_review}}
</code>
<review_dimensions>
1. 安全漏洞（OWASP Top 10）
2. 性能问题（时间/空间复杂度）
3. 可读性与命名规范
4. 错误处理完整性
5. 可测试性
</review_dimensions>
输出格式：
## 🔴 严重问题（必须修复）
## 🟡 建议优化
## ✅ 写得好的地方
## 📝 修改后的代码片段`,
    example: '粘贴任何代码 → 获得结构化代码审查报告',
    difficulty: '进阶',
  },
  {
    id: 'p004',
    title: '竞品分析框架生成器',
    category: '商业',
    tags: ['竞品分析', '商业分析', 'SWOT'],
    template: `你是一位McKinsey级别的商业分析师。
<task>对{{company_name}}进行深度竞品分析</task>
<context>
- 分析视角：{{my_company}}的竞争策略制定
- 市场：{{market}}
- 分析深度：{{depth}}（概览/深度）
</context>
请使用以下框架：
1. 产品矩阵对比（功能/定价/用户群）
2. 流量来源分析（SEO/社交/付费）
3. SWOT矩阵
4. 差异化机会点（我方可切入的3个缺口）
5. 威胁预警（未来6个月需关注的动态）`,
    example: '输入"分析字节跳动" → 获得完整竞品分析框架',
    difficulty: '专家',
  },
  {
    id: 'p005',
    title: '费曼学习法知识内化器',
    category: '学习',
    tags: ['费曼技巧', '学习方法', '知识内化'],
    template: `你是一位苏格拉底式导师，擅长用费曼学习法帮助学习。
<task>用费曼学习法帮我深度理解：{{concept}}</task>
<steps>
1. 用小学生能懂的语言解释这个概念（≤100字）
2. 给出3个生活中的真实类比
3. 提出5个深度理解测试题（从简单到复杂）
4. 指出最容易搞混的3个误区
5. 给出深入学习的资源路径
</steps>
<style>对话式、启发式，多用反问</style>`,
    example: '输入"Transformer注意力机制" → 获得费曼式深度讲解',
    difficulty: '入门',
  },
  {
    id: 'p006',
    title: '产品需求文档(PRD)生成器',
    category: '商业',
    tags: ['PRD', '产品经理', '需求文档'],
    template: `你是一位经验丰富的产品经理，熟悉硅谷和国内互联网产品方法论。
<task>为以下产品功能撰写PRD</task>
<feature>{{feature_description}}</feature>
<context>
- 产品：{{product_name}}
- 用户规模：{{user_scale}}
- 上线时间：{{deadline}}
</context>
PRD结构：
## 背景与目标（SMART指标）
## 用户故事（As a... I want... So that...）
## 功能规格（主流程/异常流程/边界条件）
## 非功能需求（性能/安全/兼容性）
## 数据埋点方案
## 验收标准`,
    example: '输入"用户评论功能" → 输出完整PRD文档',
    difficulty: '进阶',
  },
  {
    id: 'p007',
    title: '抖音口播脚本生成器',
    category: '创作',
    tags: ['抖音', '口播', '视频脚本'],
    template: `你是一位抖音头部博主的内容策划，熟悉短视频算法和用户心理。
<task>为以下主题写一个30秒口播脚本</task>
<topic>{{topic}}</topic>
<target>{{target_audience}}</target>
<hook_type>{{hook_type}}（痛点/好奇/反常识/数字冲击）</hook_type>
脚本格式：
【0-3秒 黄金钩子】（必须让人停下来）
【4-15秒 核心内容】（1个核心观点，不超过3个信息点）
【16-25秒 价值输出】（干货/情绪价值）
【26-30秒 强CTA】（关注/收藏/评论引导）
备注：预估完播率，说明为何选择该钩子形式`,
    example: '输入"AI副业" → 输出30秒完播率优化口播脚本',
    difficulty: '入门',
  },
  {
    id: 'p008',
    title: 'SQL查询优化器',
    category: '代码',
    tags: ['SQL', '数据库优化', '性能'],
    template: `你是一位数据库专家，精通MySQL/PostgreSQL查询优化。
<task>分析并优化以下SQL查询</task>
<sql>
{{sql_query}}
</sql>
<context>
- 数据库：{{database_type}}
- 表数据量：{{table_size}}
- 当前执行时间：{{current_time}}ms
</context>
输出：
1. 问题诊断（全表扫描/索引缺失/N+1等）
2. 优化后的SQL（含注释说明每处改动）
3. 建议添加的索引（含CREATE INDEX语句）
4. 预期性能提升（百分比）
5. EXPLAIN分析解读`,
    example: '粘贴慢SQL → 获得优化方案和性能提升预估',
    difficulty: '专家',
  },
  {
    id: 'p009',
    title: '个人品牌定位战略师',
    category: '商业',
    tags: ['个人品牌', '定位', '内容策略'],
    template: `你是一位个人品牌战略顾问，服务过多位百万粉丝博主。
<task>为我制定个人品牌定位策略</task>
<profile>
- 职业背景：{{background}}
- 核心技能：{{skills}}
- 目标平台：{{platforms}}
- 变现目标：{{monetization}}
</profile>
<deliverables>
1. 人设定位（一句话：我是谁/我能帮谁/解决什么问题）
2. 差异化标签（3个独特卖点）
3. 内容矩阵（主内容/辅助内容/引流内容各2类）
4. 90天冷启动计划（关键里程碑）
5. 变现路径设计（初级/中级/高级）
</deliverables>`,
    example: '输入你的背景 → 获得完整个人品牌战略',
    difficulty: '进阶',
  },
  {
    id: 'p010',
    title: '情绪价值写作助手',
    category: '创作',
    tags: ['情绪写作', '共鸣', '文案'],
    template: `你是一位擅长触动人心的文案创作者，深谙NLP和情感共鸣原理。
<task>将以下干货内容改写为有情绪温度的版本</task>
<original_content>
{{dry_content}}
</original_content>
<tone>{{tone}}（治愈/励志/幽默/深沉）</tone>
改写原则：
- 开头：用一个让人代入的场景/问题
- 中间：穿插具体的人物故事或感受
- 数据：转化为可感知的生活场景
- 结尾：留下情感余韵，不说教
保留核心信息量，增加情感密度`,
    example: '输入枯燥数据 → 输出有温度的情感化文案',
    difficulty: '进阶',
  },
];

export const categories = ['全部', '创作', '分析', '代码', '商业', '学习'] as const;
export type Category = (typeof categories)[number];
