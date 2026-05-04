export type Prompt = {
  id: string;
  title: string;
  category: '创作' | '分析' | '代码' | '商业' | '学习' | '效率';
  tags: string[];
  template: string;
  example: string;
  difficulty: '入门' | '进阶' | '专家';
};

export const prompts: Prompt[] = [
  // ── 创作 ──
  {
    id: 'p001', title: '爆款小红书标题生成器', category: '创作',
    tags: ['小红书', '标题', '内容创作'], difficulty: '入门',
    template: `你是一位小红书爆款内容专家。
<task>为以下主题生成10个高点击率标题</task>
<context>目标受众：{{target_audience}}｜内容主题：{{topic}}</context>
<constraints>每个标题≤20字，含emoji，采用疑问/数字/反转钩子，触发收藏欲</constraints>
输出格式：序号. 标题 [类型标注]`,
    example: '主题：AI副业 → 「打工3年不如AI搞副业1个月？我算了一笔账😱」',
  },
  {
    id: 'p002', title: '抖音30秒口播脚本', category: '创作',
    tags: ['抖音', '口播', '短视频'], difficulty: '入门',
    template: `你是抖音头部博主的内容策划，熟悉短视频算法和用户心理。
<task>为以下主题写30秒口播脚本</task>
<topic>{{topic}}</topic>
<target>{{target_audience}}</target>
<hook_type>{{hook_type}}（痛点/好奇/反常识/数字冲击）</hook_type>
【0-3秒 黄金钩子】（必须让人停下来）
【4-15秒 核心内容】（1个核心观点）
【16-25秒 价值输出】（干货/情绪价值）
【26-30秒 强CTA】（关注/收藏/评论）
备注：预估完播率，说明为何选择该钩子形式`,
    example: '输入"AI副业" → 30秒完播率优化口播脚本',
  },
  {
    id: 'p003', title: '情绪价值写作助手', category: '创作',
    tags: ['情绪写作', '共鸣', '文案'], difficulty: '进阶',
    template: `你是擅长触动人心的文案创作者，深谙情感共鸣原理。
<task>将以下干货内容改写为有情绪温度的版本</task>
<original_content>{{dry_content}}</original_content>
<tone>{{tone}}（治愈/励志/幽默/深沉）</tone>
改写原则：
- 开头：用让人代入的场景/问题
- 中间：穿插具体人物故事或感受
- 数据：转化为可感知的生活场景
- 结尾：留下情感余韵，不说教`,
    example: '输入枯燥数据 → 有温度的情感化文案',
  },
  {
    id: 'p004', title: 'B站视频脚本策划', category: '创作',
    tags: ['B站', '视频策划', '知识博主'], difficulty: '进阶',
    template: `你是B站知识区头部UP主的内容策划，深谙弹幕文化和长视频留存。
<task>为以下选题规划10-15分钟视频结构</task>
<topic>{{topic}}</topic>
<target_audience>{{audience}}</target_audience>
输出：
1. 视频标题（含关键词，≤25字）
2. 封面设计建议（画面+字体+色彩）
3. 分段结构（开场/铺垫/核心/转折/结尾）
4. 每段的内容要点+留住观众的钩子
5. 互动引导话术（关注/一键三连）`,
    example: '选题"AI改变我的学习方式" → 完整10分钟视频策划',
  },
  {
    id: 'p005', title: '爆款封面文案设计', category: '创作',
    tags: ['封面设计', '图文', '视觉文案'], difficulty: '入门',
    template: `你是小红书/公众号封面文案专家，精通视觉传达。
<task>为以下内容设计5套封面方案</task>
<content>{{content_topic}}</content>
每套方案包含：
- 主标题（≤8字，视觉冲击力强）
- 副标题（≤15字，补充说明）
- 色彩建议（背景+文字+点缀色）
- 构图描述（图形元素+文字排版）
- 情绪基调（活泼/严肃/治愈/高端）`,
    example: '主题"30天AI挑战" → 5套封面设计方案',
  },
  {
    id: 'p006', title: '个人IP故事包装师', category: '创作',
    tags: ['个人品牌', 'IP故事', '人设包装'], difficulty: '进阶',
    template: `你是个人品牌战略顾问，专注于故事叙事和人设包装。
<task>为以下背景包装个人IP故事</task>
<background>{{personal_background}}</background>
<target_platform>{{platform}}</target_platform>
输出：
1. 核心人设标签（3个，每个≤6字）
2. 个人故事弧（起点→转折→现在→未来愿景）
3. 个性化自我介绍（100字，适合不同场景）
4. 内容护城河（我能提供独一无二的什么？）
5. 粉丝第一印象设计`,
    example: '输入你的经历 → 立体化IP故事框架',
  },

  // ── 分析 ──
  {
    id: 'p007', title: '财报关键指标提取器', category: '分析',
    tags: ['投研', '财报', '数据提取'], difficulty: '进阶',
    template: `你是专业投资研究分析师，拥有CFA资质。
<instructions>从下方文本提取关键财务指标，以Markdown表格输出</instructions>
<data>{{financial_report_text}}</data>
| 指标 | 本期 | 同比 | 行业均值 | 评级 |
（提取：营收/净利润/毛利率/净利率/PE/PB/ROE/负债率）
最后附：3个核心风险点 + 3个催化剂事件（各50字）`,
    example: '粘贴任何财报文本 → 结构化分析表格',
  },
  {
    id: 'p008', title: '竞品深度分析框架', category: '分析',
    tags: ['竞品分析', '商业分析', 'SWOT'], difficulty: '专家',
    template: `你是McKinsey级别的商业分析师。
<task>对{{company_name}}进行深度竞品分析</task>
<context>分析视角：{{my_company}} | 市场：{{market}}</context>
分析框架：
1. 产品矩阵对比（功能/定价/用户群）
2. 流量来源分析（SEO/社交/付费）
3. SWOT矩阵
4. 差异化机会点（3个可切入缺口）
5. 威胁预警（未来6个月需关注的动态）`,
    example: '输入"分析字节跳动" → 完整竞品分析框架',
  },
  {
    id: 'p009', title: '用户需求深度挖掘', category: '分析',
    tags: ['用户研究', '需求分析', '心理学'], difficulty: '进阶',
    template: `你是用户研究专家，精通用户心理和行为分析。
<task>深度分析以下产品的用户需求</task>
<product>{{product_description}}</product>
<user_segment>{{target_users}}</user_segment>
输出：
1. 用户画像（人口特征/心理特征/行为特征）
2. 需求层次分析（显性需求→隐性需求→痛点→爽点）
3. 使用场景地图（触点/情绪曲线/决策时刻）
4. 反用户需求洞察（他们说想要X，但真正需要Y）`,
    example: '输入产品描述 → 深度用户需求洞察报告',
  },
  {
    id: 'p010', title: '数据驱动归因分析', category: '分析',
    tags: ['数据分析', '归因', '增长'], difficulty: '专家',
    template: `你是增长分析师，擅长数据归因和增长模型构建。
<task>分析以下数据波动并给出归因</task>
<metric>{{metric_name}}</metric>
<data>{{data_or_description}}</data>
<context>业务背景：{{business_context}}</context>
归因框架：
1. 排除法（外部因素/异常事件过滤）
2. 漏斗拆解（链路中哪个环节出现问题）
3. 对照组分析（What-if假设）
4. 根因结论（置信度标注）
5. 行动建议（下一步验证方案）`,
    example: '输入DAU下降数据 → 系统性归因分析报告',
  },

  // ── 代码 ──
  {
    id: 'p011', title: '代码Review专家', category: '代码',
    tags: ['代码审查', 'TypeScript', '最佳实践'], difficulty: '进阶',
    template: `你是资深全栈工程师，专注代码质量和安全。
<task>对以下代码进行全面Review</task>
<code language="{{language}}">{{code_to_review}}</code>
## 🔴 严重问题（必须修复）
## 🟡 建议优化
## ✅ 写得好的地方
## 📝 修改后的代码片段`,
    example: '粘贴任何代码 → 结构化代码审查报告',
  },
  {
    id: 'p012', title: 'SQL查询优化器', category: '代码',
    tags: ['SQL', '数据库优化', '性能'], difficulty: '专家',
    template: `你是数据库专家，精通MySQL/PostgreSQL优化。
<task>分析并优化以下SQL查询</task>
<sql>{{sql_query}}</sql>
<context>数据库：{{database_type}} | 数据量：{{table_size}} | 当前执行时间：{{current_time}}ms</context>
输出：
1. 问题诊断（全表扫描/索引缺失/N+1等）
2. 优化后的SQL（含改动注释）
3. 建议创建的索引（含CREATE INDEX语句）
4. 预期性能提升（百分比）`,
    example: '粘贴慢SQL → 优化方案和性能提升预估',
  },
  {
    id: 'p013', title: 'API接口设计师', category: '代码',
    tags: ['API设计', 'RESTful', '接口规范'], difficulty: '进阶',
    template: `你是API设计专家，精通RESTful规范和OpenAPI标准。
<task>为以下功能设计API接口</task>
<feature>{{feature_description}}</feature>
<tech_stack>{{stack}}</tech_stack>
输出：
1. API列表（Method + Path + 功能描述）
2. 请求/响应数据结构（JSON示例）
3. 错误码规范（HTTP状态码+业务码+描述）
4. 鉴权方案（JWT/OAuth2等）
5. 版本管理策略`,
    example: '输入"用户评论功能" → 完整API设计文档',
  },
  {
    id: 'p014', title: '正则表达式生成器', category: '代码',
    tags: ['正则表达式', 'Regex', '文本处理'], difficulty: '入门',
    template: `你是正则表达式专家，能写出精准高效的Regex。
<task>为以下需求生成正则表达式</task>
<requirement>{{requirement}}</requirement>
<language>{{programming_language}}</language>
输出：
1. 正则表达式（及其变体版本）
2. 逐字符解释（每个部分的含义）
3. 测试用例（匹配成功 + 匹配失败各5个）
4. 潜在边界情况说明
5. 完整代码示例（含使用方式）`,
    example: '输入"匹配中国手机号" → 带注释的完整正则方案',
  },
  {
    id: 'p015', title: '架构方案评审专家', category: '代码',
    tags: ['系统架构', '技术方案', '设计模式'], difficulty: '专家',
    template: `你是10年经验的系统架构师，参与过大规模系统设计。
<task>评审以下技术方案</task>
<proposal>{{architecture_proposal}}</proposal>
<scale>预期规模：{{scale}} | 团队规模：{{team_size}}</scale>
评审维度：
1. 可扩展性（Scalability）
2. 可用性（Availability，SLA保障）
3. 一致性（Consistency）
4. 安全性（Security）
5. 可维护性（Maintainability）
6. 成本（Cost Efficiency）
给出：总体评分 + 最高风险点 + 改进建议`,
    example: '输入架构方案 → 专业技术评审报告',
  },

  // ── 商业 ──
  {
    id: 'p016', title: '产品需求文档(PRD)生成器', category: '商业',
    tags: ['PRD', '产品经理', '需求文档'], difficulty: '进阶',
    template: `你是经验丰富的产品经理，熟悉硅谷和国内互联网方法论。
<task>为以下功能撰写PRD</task>
<feature>{{feature_description}}</feature>
<context>产品：{{product_name}} | 用户规模：{{user_scale}} | 上线时间：{{deadline}}</context>
## 背景与目标（SMART指标）
## 用户故事（As a... I want... So that...）
## 功能规格（主流程/异常流程/边界条件）
## 非功能需求（性能/安全/兼容性）
## 数据埋点方案
## 验收标准`,
    example: '输入"用户评论功能" → 完整PRD文档',
  },
  {
    id: 'p017', title: '个人品牌定位战略师', category: '商业',
    tags: ['个人品牌', '定位', '内容策略'], difficulty: '进阶',
    template: `你是个人品牌战略顾问，服务过多位百万粉博主。
<task>为我制定个人品牌定位策略</task>
<profile>职业背景：{{background}} | 核心技能：{{skills}} | 目标平台：{{platforms}} | 变现目标：{{monetization}}</profile>
输出：
1. 人设定位（我是谁/我能帮谁/解决什么问题）
2. 差异化标签（3个独特卖点）
3. 内容矩阵（主内容/辅助/引流各2类）
4. 90天冷启动计划（关键里程碑）
5. 变现路径设计（初级/中级/高级）`,
    example: '输入你的背景 → 完整个人品牌战略',
  },
  {
    id: 'p018', title: '融资路演Pitch Deck', category: '商业',
    tags: ['融资', 'Pitch', '投资人'], difficulty: '专家',
    template: `你是连续创业者兼VC投资顾问，深谙投资人思维。
<task>为以下项目设计融资路演内容</task>
<project>{{project_description}}</project>
<stage>融资阶段：{{stage}} | 目标融资额：{{amount}}</stage>
Pitch结构（10分钟版）：
1. Hook（30秒，让投资人坐直身子）
2. 问题（市场痛点，数据支撑）
3. 解决方案（产品演示脚本）
4. 市场规模（TAM/SAM/SOM）
5. 商业模式（收入逻辑）
6. 竞争壁垒（护城河分析）
7. 团队（为什么是我们）
8. 财务预测（3年关键指标）
9. 融资用途
10. 结尾CTA`,
    example: '输入项目描述 → 完整投资人路演脚本',
  },
  {
    id: 'p019', title: '增长黑客策略师', category: '商业',
    tags: ['增长', 'Growth Hacking', '用户获取'], difficulty: '进阶',
    template: `你是增长黑客专家，曾在多家独角兽公司负责增长。
<task>为以下产品制定增长策略</task>
<product>{{product}}</product>
<current_status>当前MAU：{{mau}} | 获客成本：{{cac}} | 留存率：{{retention}}</current_status>
<goal>30天增长目标：{{goal}}</goal>
输出：
1. 增长飞轮诊断（现有哪些，缺少哪些）
2. 最高优先级增长实验（3个，含假设+衡量指标）
3. 病毒传播机制设计
4. 用户旅程优化（关键漏斗节点）
5. 低成本高回报的非常规增长技巧`,
    example: '输入产品现状 → 定制化增长策略方案',
  },
  {
    id: 'p020', title: '定价策略顾问', category: '商业',
    tags: ['定价策略', '商业模式', 'SaaS'], difficulty: '专家',
    template: `你是定价策略专家，曾为多家SaaS公司优化定价模型。
<task>为以下产品设计定价策略</task>
<product>{{product}}</product>
<context>竞品价格：{{competitor_price}} | 目标用户：{{target_users}} | 当前ARR：{{arr}}</context>
输出：
1. 定价模型推荐（Freemium/订阅/按量/License）及理由
2. 套餐设计（3档，含功能差异化）
3. 心理定价技巧应用
4. 试用期/退款策略
5. 提价时机和方式（避免流失）`,
    example: '输入SaaS产品信息 → 完整定价策略方案',
  },

  // ── 学习 ──
  {
    id: 'p021', title: '费曼学习法知识内化器', category: '学习',
    tags: ['费曼技巧', '学习方法', '知识内化'], difficulty: '入门',
    template: `你是苏格拉底式导师，擅长用费曼学习法帮助深度理解。
<task>用费曼学习法帮我深度理解：{{concept}}</task>
1. 用小学生能懂的语言解释（≤100字）
2. 3个生活中的真实类比
3. 5个深度理解测试题（从简单到复杂）
4. 最容易搞混的3个误区
5. 深入学习的资源路径
风格：对话式、启发式，多用反问`,
    example: '输入"Transformer注意力机制" → 费曼式深度讲解',
  },
  {
    id: 'p022', title: '学习计划制定器', category: '学习',
    tags: ['学习规划', '技能提升', '时间管理'], difficulty: '入门',
    template: `你是学习规划专家，精通认知科学和记忆曲线理论。
<task>为以下学习目标制定科学计划</task>
<goal>目标：{{learning_goal}}</goal>
<context>当前水平：{{current_level}} | 每天可用时间：{{daily_time}} | 截止日期：{{deadline}}</context>
输出：
1. 技能拆解（知识树结构）
2. 学习路径（分阶段里程碑）
3. 日/周/月计划模板
4. 推荐资源（书/课程/社区）
5. 进度检验方法（如何知道自己真的学会了）`,
    example: '输入"学习Python数据分析" → 系统化学习路径',
  },
  {
    id: 'p023', title: '苏格拉底辩论伙伴', category: '学习',
    tags: ['批判性思维', '辩论', '思维训练'], difficulty: '进阶',
    template: `你是苏格拉底式辩论伙伴，专门挑战思维定势。
<task>帮我深度思考以下观点</task>
<viewpoint>{{your_viewpoint}}</viewpoint>
流程：
1. 反驳我的观点（找出3个最强的反例/漏洞）
2. 提出更深层的追问（Socratic questions）
3. 呈现对立观点的最强版本（Steel-manning）
4. 帮我重构更严密的论证
5. 最终：这个观点在什么条件下成立，什么条件下不成立？`,
    example: '输入你的观点 → 苏格拉底式深度质疑与重构',
  },
  {
    id: 'p024', title: '概念地图构建师', category: '学习',
    tags: ['知识图谱', '概念理解', '思维导图'], difficulty: '进阶',
    template: `你是知识体系构建专家，擅长连接跨领域知识。
<task>为{{domain}}领域构建概念地图</task>
<focus>重点关注：{{focus_area}}</focus>
输出：
1. 核心概念（5-8个，每个简短定义）
2. 概念关系图（文字版树状结构）
3. 概念间的关键连接（隐藏的相似性或对立关系）
4. 跨领域类比（从其他领域借鉴的洞察）
5. 知识空白（这个领域目前还不知道的是什么）`,
    example: '输入"机器学习" → 结构化知识概念地图',
  },

  // ── 效率 ──
  {
    id: 'p025', title: '会议纪要结构化工具', category: '效率',
    tags: ['会议纪要', '职场效率', '结构化写作'], difficulty: '入门',
    template: `你是职场效率专家，精通结构化信息处理。
<task>将以下会议内容整理为专业纪要</task>
<meeting_content>{{raw_meeting_notes}}</meeting_content>
<meeting_type>{{meeting_type}}（需求评审/进度同步/头脑风暴/决策会）</meeting_type>
输出格式：
## 会议基本信息（时间/参与人/目标）
## 讨论要点（分议题，每点含结论）
## 决议事项（What/Who/When）
## 待定事项（需要后续跟进的问题）
## 下次会议（时间/议题预告）`,
    example: '粘贴混乱会议记录 → 清晰结构化纪要',
  },
  {
    id: 'p026', title: '邮件/消息智能重写', category: '效率',
    tags: ['商务写作', '邮件', '沟通效率'], difficulty: '入门',
    template: `你是商务沟通专家，擅长精准高效的书面表达。
<task>重写以下{{message_type}}（邮件/Slack消息/微信）</task>
<original>{{original_message}}</original>
<goal>目标：{{communication_goal}}（说服/拒绝/催促/感谢/道歉）</goal>
<tone>语气：{{tone}}（正式/友好/简洁/有温度）</tone>
输出：
1. 重写版本（精炼后的正文）
2. 关键改动说明（为什么这样改）
3. 备选开头语（3个）`,
    example: '粘贴原始消息 → 专业高效的重写版本',
  },
  {
    id: 'p027', title: 'OKR目标制定教练', category: '效率',
    tags: ['OKR', '目标管理', 'KPI'], difficulty: '进阶',
    template: `你是OKR专家，曾在Google和多家科技公司推行OKR体系。
<task>帮我制定高质量OKR</task>
<role>角色：{{role}} | 团队规模：{{team_size}}</role>
<context>季度目标方向：{{quarter_theme}}</context>
输出：
1. 3个Objectives（激励性、定性、时限性）
2. 每个O对应2-3个KR（量化、有挑战性、可测量）
3. OKR质量诊断（是否满足SMART原则）
4. 常见OKR写作错误纠正
5. Check-in频率和复盘建议`,
    example: '输入工作方向 → 高质量季度OKR框架',
  },
  {
    id: 'p028', title: '复杂问题决策框架', category: '效率',
    tags: ['决策', '问题解决', '思维框架'], difficulty: '进阶',
    template: `你是决策分析专家，精通多种决策框架。
<task>帮我系统性地分析以下决策问题</task>
<decision>{{decision_to_make}}</decision>
<context>背景：{{context}} | 截止时间：{{deadline}} | 利益相关方：{{stakeholders}}</context>
分析框架（自动选择最适合的）：
□ 二阶效应分析（决策的间接后果）
□ 预期损失/收益矩阵
□ 10/10/10法则（10分钟/10个月/10年后你会怎么看）
□ 反向思考（如果你要搞砸这个决策，你会怎么做？）
最终：给出推荐选项+最大风险点+关键假设`,
    example: '输入复杂决策 → 系统性决策分析报告',
  },
  {
    id: 'p029', title: '知识萃取与总结专家', category: '效率',
    tags: ['知识管理', '读书笔记', '信息提炼'], difficulty: '入门',
    template: `你是知识萃取专家，善于从海量信息中提炼精华。
<task>对以下内容进行深度萃取</task>
<content>{{content_to_summarize}}</content>
<output_type>{{type}}（书籍/文章/视频文稿/课程笔记）</output_type>
输出：
1. 一句话核心观点
2. 3个最重要的洞察（每个含"所以什么？"的追问）
3. 可立即应用的行动建议
4. 与已有知识的连接点
5. 我不同意的地方（批判性评估）`,
    example: '粘贴任何内容 → 结构化知识卡片',
  },
  {
    id: 'p030', title: '系统思考问题诊断', category: '效率',
    tags: ['系统思考', '根因分析', '复杂问题'], difficulty: '专家',
    template: `你是系统思考专家，精通因果反馈环和复杂系统分析。
<task>用系统思考方法分析以下问题</task>
<problem>{{problem_description}}</problem>
<symptoms>表面症状：{{symptoms}}</symptoms>
输出：
1. 问题结构图（文字版因果链：A → B → C）
2. 增强回路识别（使问题恶化的正反馈循环）
3. 调节回路识别（系统内部的自我修正机制）
4. 杠杆点定位（哪里是最小干预最大改变的支点）
5. 系统层面的干预方案（而非治标不治本的解法）`,
    example: '输入棘手问题 → 系统思考全景分析',
  },
];

export const categories = ['全部', '创作', '分析', '代码', '商业', '学习', '效率'] as const;
export type Category = (typeof categories)[number];
