# Financial Lab 2.0 Realtime

这不是静态CSV页面，而是一个可持续运行的本地实时投研系统：

```text
iFinD Quant HTTP API / THS_RQ
        ↓ 1秒批量行情
asyncio实时采集 + APScheduler定时任务
        ↓
DuckDB历史数据库 + Pandas指标
        ↓
事件引擎 → B.AI deepseek-v4-pro复核
        ↓
Streamlit + Plotly Dashboard
        ↓
企业微信 / 邮件高等级预警
```

## 已实现

- 1秒批量查询自选股，单次请求获取多只股票
- 交易时段控制，非交易时间停止高频请求
- 遇到429限流自动从1秒退避至2/4/8/10秒
- DuckDB保存行情、公告、财务快照、事件、AI复核和预警记录
- Pandas计算60秒动量、窗口回撤、成交速度和短周期波动
- APScheduler每5分钟检查公告、每30分钟检查财务字段
- Python按阈值与连续报告期计算失效规则，B.AI不负责替代数学判断
- B.AI只在高等级事件触发时分析，不按每个价格跳动调用
- 企业微信Webhook与SMTP邮件推送
- 模拟行情模式，无密钥也能先跑通完整界面
- 使用上传的拓维信息CSV初始化历史价格和投资逻辑规则

## Mac运行

1. 解压项目。
2. 双击 `run.command`。
3. 首次运行会创建 `.venv` 并安装依赖。
4. 浏览器打开 `http://127.0.0.1:8765`。

初始为模拟模式，可以直接看到1秒数据流。

## 免费网页体验版

项目已兼容 Streamlit Community Cloud，入口文件是 `streamlit_app.py`。完整步骤见 `DEPLOY_STREAMLIT.md`。

- 部署后直接打开 `https://你的名称.streamlit.app`
- 支持访问密码
- 密钥通过 Streamlit Secrets 保存，不进入代码
- 默认使用模拟行情和 `/tmp` 临时 DuckDB
- 免费服务会休眠，数据可能重置，不适合全天候实时监控

## 切换到iFinD实时行情

复制配置：

```bash
cp .env.example .env.local
```

只在你自己的Mac上编辑 `.env.local`：

```env
DATA_MODE=ifind_http
WATCH_SYMBOLS=002261.SZ
QUOTE_POLL_SECONDS=1
IFIND_REFRESH_TOKEN=你在iFinD Quant API获得的新refresh_token
```

注意：`IFIND_REFRESH_TOKEN` 是Quant HTTP API凭证，不是此前粘贴过的MCP Authorization。不要把任何新密钥发到聊天中。

## 配置B.AI

撤销此前暴露的旧密钥，重新生成后写入本机 `.env.local`：

```env
BAI_API_KEY=你的新B.AI密钥
BAI_BASE_URL=https://api.b.ai
BAI_MODEL=deepseek-v4-pro
BAI_AUTO_ANALYZE=true
```

## 配置企业微信预警

在企业微信群创建机器人，把Webhook仅写入：

```env
WECOM_WEBHOOK_URL=你的机器人Webhook
```

## 配置邮件预警

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_USERNAME=账户
SMTP_PASSWORD=应用专用密码
SMTP_FROM=发件地址
ALERT_EMAIL_TO=收件地址
```

## 财务字段

iFinD基础数据接口要求明确的指标及参数。请通过iFinD超级命令确认你账户可用的指标，再配置：

```env
IFIND_FINANCIAL_INDICATORS_JSON=[{"indicator":"具体指标名","indiparams":["参数"]}]
IFIND_FINANCIAL_FIELD_MAP_JSON={"report_period":"iFinD报告期字段","revenue_yoy":"iFinD营收同比字段","gross_margin_yoy_delta":"iFinD毛利率同比变化字段","cash_conversion":"iFinD现金转化字段","adjusted_profit":"iFinD扣非净利润字段"}
```

系统不会猜测未确认的iFinD字段，避免拉错口径。Python规则引擎只读取映射后的标准字段，并保存每条规则的触发证据与连续期数。

## 测试

```bash
.venv/bin/python -m unittest discover -s tests -v
```

## 官方接口文档

- iFinD Quant API：<https://ftwc.51ifind.com/gwstatic/static/ds_web/quantapi-web/>
- B.AI API：<https://docs.b.ai/llmservice/api/>
- B.AI deepseek-v4-pro：<https://docs.b.ai/llmservice/models/deepseek-v4-pro/>

## 安全边界

- 不包含任何API密钥
- 不在浏览器前端暴露密钥
- 不自动下单
- 不输出“强烈买入”之类结论
- AI输出必须基于事件证据，并保存到DuckDB供复盘
- 研究辅助，不构成投资建议
