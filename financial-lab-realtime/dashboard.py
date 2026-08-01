from __future__ import annotations

import hmac
import os

import pandas as pd
import plotly.graph_objects as go
import streamlit as st

from financial_lab_rt.analytics import calculate_realtime_metrics
from financial_lab_rt.financial_rules import evaluate_financial_rules
from financial_lab_rt.runtime import get_runtime


st.set_page_config(page_title="Financial Lab 2.0 Realtime", page_icon="◈", layout="wide")
st.markdown(
    """
    <style>
    :root { --accent:#42e09a; --danger:#ff716c; --amber:#f2bc64; }
    .stApp { background: radial-gradient(circle at 15% 0%, #102d25 0, #07110f 34%, #07100f 100%); }
    [data-testid="stHeader"] { background: rgba(7,16,15,.72); }
    [data-testid="stSidebar"] { background: #091512; border-right: 1px solid rgba(140,190,172,.12); }
    .block-container { padding-top: 2rem; max-width: 1540px; }
    .lab-title { display:flex; align-items:center; gap:14px; margin-bottom:8px; }
    .lab-mark { width:42px; height:42px; border:1px solid rgba(66,224,154,.45); border-radius:12px; display:grid; place-items:center; color:#42e09a; font-weight:800; }
    .lab-title h1 { font-size:1.65rem; margin:0; letter-spacing:-.03em; }
    .lab-title p { margin:3px 0 0; color:#83a096; font-size:.78rem; }
    .status-line { padding:10px 14px; border:1px solid rgba(66,224,154,.18); background:rgba(66,224,154,.05); border-radius:10px; color:#9bb9ae; font-size:.78rem; margin:12px 0 18px; }
    .status-dot { display:inline-block; width:7px; height:7px; border-radius:50%; background:#42e09a; box-shadow:0 0 10px #42e09a; margin-right:8px; }
    [data-testid="stMetric"] { background:linear-gradient(145deg,rgba(21,41,35,.9),rgba(11,24,21,.9)); border:1px solid rgba(140,190,172,.14); padding:16px 18px; border-radius:14px; }
    [data-testid="stMetricLabel"] { color:#829d94; }
    [data-testid="stMetricValue"] { font-family: ui-monospace,SFMono-Regular,Menlo,monospace; }
    .thesis-box { padding:18px 20px; border:1px solid rgba(91,211,219,.17); background:rgba(91,211,219,.04); border-radius:12px; line-height:1.7; }
    .risk-box { padding:13px 15px; border-left:3px solid #f2bc64; background:rgba(242,188,100,.05); color:#cdbf9f; font-size:.82rem; border-radius:6px; }
    .small-note { color:#799188; font-size:.72rem; }
    div[data-testid="stDataFrame"] { border:1px solid rgba(140,190,172,.12); border-radius:12px; overflow:hidden; }
    </style>
    """,
    unsafe_allow_html=True,
)


def require_access() -> None:
    expected = os.getenv("APP_PASSWORD", "").strip()
    if not expected or st.session_state.get("authenticated"):
        return
    st.markdown("### Financial Lab 访问验证")
    entered = st.text_input("访问密码", type="password", placeholder="输入在 Streamlit Secrets 中设置的密码")
    if st.button("进入系统", width="stretch"):
        if hmac.compare_digest(entered, expected):
            st.session_state["authenticated"] = True
            st.rerun()
        else:
            st.error("密码错误。")
    st.caption("密码仅在服务器内验证，不会写入浏览器或项目代码。")
    st.stop()


require_access()


@st.cache_resource
def runtime_resource():
    return get_runtime()


runtime = runtime_resource()
settings = runtime.settings
store = runtime.store


with st.sidebar:
    st.markdown("### ◈ 运行控制")
    mode_label = "iFinD实时" if settings.data_mode == "ifind_http" else "模拟行情"
    st.write(f"数据模式：**{mode_label}**")
    st.write(f"监控股票：**{len(settings.watch_symbols)}只**")
    st.write(f"目标频率：**{settings.quote_poll_seconds:g}秒**")
    refresh_seconds = st.select_slider("页面刷新频率", options=[1, 3, 5, 10], value=int(settings.dashboard_refresh_seconds))
    selected_symbol = st.selectbox("当前股票", settings.watch_symbols, index=0)
    st.divider()
    if settings.data_mode == "ifind_http" and not settings.live_ready:
        st.error("缺少IFIND_REFRESH_TOKEN")
    elif settings.data_mode == "mock":
        st.warning("当前为模拟行情；配置iFinD后切换。")
    if settings.bai_ready:
        st.success(f"B.AI已配置 · {settings.bai_model}")
    else:
        st.info("B.AI未配置，AI复核自动跳过。")
    if st.button("立即同步公告", width="stretch"):
        runtime.request_announcement_sync()
        st.toast("已提交公告同步任务。")
    st.caption("所有密钥只从本机.env.local读取。")


st.markdown(
    """
    <div class="lab-title"><div class="lab-mark">FL</div><div>
    <h1>Financial Lab 2.0 · Realtime</h1><p>iFinD × Python × DuckDB × B.AI · 证据驱动投资决策</p>
    </div></div>
    """,
    unsafe_allow_html=True,
)


@st.fragment(run_every=f"{refresh_seconds}s")
def live_dashboard():
    status = runtime.status.copy()
    storage_status = store.status()
    latest_tick = status.get("last_tick") or "等待首个实时快照"
    error = status.get("last_error")
    st.markdown(
        f'<div class="status-line"><span class="status-dot"></span>{mode_label} · 实际轮询 {status.get("effective_poll_seconds", 1):g}秒 · 最新更新 {latest_tick}</div>',
        unsafe_allow_html=True,
    )
    if error:
        st.error(f"采集异常：{error}")

    frame = store.recent_quotes(selected_symbol, minutes=60, limit=4000)
    metrics = calculate_realtime_metrics(frame)
    if not metrics:
        st.info("等待行情数据进入。")
        return

    latest = metrics.get("latest")
    change = metrics.get("change_ratio")
    momentum = metrics.get("momentum_60s")
    drawdown = metrics.get("drawdown")
    volume_accel = metrics.get("volume_acceleration")
    cols = st.columns(6)
    cols[0].metric("最新价", f"¥{latest:,.3f}" if latest is not None else "--", f"{change:.2%}" if change is not None else None)
    cols[1].metric("60秒动量", f"{momentum:.2%}" if momentum is not None else "数据积累中")
    cols[2].metric("窗口最大回撤", f"{drawdown:.2%}" if drawdown is not None else "--")
    cols[3].metric("成交速度", f"{volume_accel:.1f}×" if volume_accel is not None else "数据积累中")
    cols[4].metric("行情快照", f"{storage_status['quote_count']:,}")
    cols[5].metric("风险事件", f"{storage_status['event_count']:,}")

    tabs = st.tabs(["实时总览", "投资逻辑", "事件中心", "公告与AI", "数据审计"])
    with tabs[0]:
        chart = go.Figure()
        chart.add_trace(
            go.Scatter(
                x=frame["ts"], y=frame["latest"], mode="lines", name="最新价",
                line=dict(color="#42e09a", width=2), fill="tozeroy", fillcolor="rgba(66,224,154,.06)",
                hovertemplate="%{x|%H:%M:%S}<br>¥%{y:.3f}<extra></extra>",
            )
        )
        chart.update_layout(
            height=430, margin=dict(l=12, r=12, t=20, b=12),
            paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
            font=dict(color="#9db4ac"), xaxis=dict(gridcolor="rgba(150,190,176,.08)"),
            yaxis=dict(gridcolor="rgba(150,190,176,.08)", tickprefix="¥"), showlegend=False,
        )
        st.plotly_chart(chart, width="stretch", config={"displayModeBar": False})
        st.caption(f"数据源：{metrics.get('source')} · 样本：{metrics.get('observations')}条 · 仅展示最近60分钟")

    with tabs[1]:
        left, right = st.columns([1.6, 1])
        with left:
            st.markdown("#### 核心投资逻辑")
            st.markdown(
                '<div class="thesis-box"><b>国产AI算力需求增长</b> → 华为生态合作深化 → 智能硬件与行业数字化业务增长 → 盈利和经营现金流改善。</div>',
                unsafe_allow_html=True,
            )
            st.markdown("#### 逻辑失效规则")
            rules = store.rules(selected_symbol)
            rule_results = evaluate_financial_rules(store.financial_history(selected_symbol), rules)
            if rule_results:
                rule_frame = pd.DataFrame(rule_results)
                rule_frame["observations"] = rule_frame["observations"].map(
                    lambda items: "；".join(f"{item['period']}={item['value']:.2%}" if abs(item["value"]) <= 2 else f"{item['period']}={item['value']:,.2f}" for item in items) or "无可用数据"
                )
                st.dataframe(
                    rule_frame[["rule_id", "name", "condition", "status", "observations", "is_core"]],
                    width="stretch",
                    hide_index=True,
                    column_config={
                        "rule_id": "规则ID", "name": "规则", "condition": "可测量条件",
                        "status": "Python判断", "observations": "连续期证据", "is_core": "核心条件",
                    },
                )
            else:
                st.info("该股票尚未配置投资逻辑失效规则。")
        with right:
            st.markdown("#### 当前判断")
            triggered = [item for item in rule_results if item["triggered"]]
            core_triggered = [item for item in triggered if item["is_core"]]
            insufficient = [item for item in rule_results if item["status"] == "数据不足"]
            if core_triggered:
                st.error(f"逻辑失效预警 · 已触发{len(core_triggered)}条核心条件")
            elif triggered:
                st.warning(f"逻辑削弱 · 已触发{len(triggered)}条质量/风险条件")
            else:
                st.info("逻辑未被规则证伪 · 尚未触发失效条件")
            result_text = (
                f"Python规则引擎基于已保存财报判断：触发{len(triggered)}条，"
                f"核心触发{len(core_triggered)}条，另有{len(insufficient)}条因连续期数或字段不足暂不能判定。"
            )
            st.markdown(
                f'<div class="risk-box">{result_text}</div>',
                unsafe_allow_html=True,
            )

    with tabs[2]:
        events = store.recent_events(100)
        if events.empty:
            st.info("暂无达到阈值的事件。")
        else:
            st.dataframe(
                events[["ts", "symbol", "severity", "title", "detail", "source_ref", "ai_status"]],
                width="stretch", hide_index=True,
                column_config={"ts": "时间", "symbol": "股票", "severity": "等级", "title": "事件", "detail": "观测", "source_ref": "证据", "ai_status": "AI状态"},
            )

    with tabs[3]:
        announcements = store.recent_announcements(30)
        reviews = store.latest_ai_reviews(20)
        alert_rows = store.recent_alerts(30)
        a, b, c = st.columns(3)
        with a:
            st.markdown("#### 最新公告")
            st.dataframe(announcements, width="stretch", hide_index=True) if not announcements.empty else st.info("等待公告同步。")
        with b:
            st.markdown("#### B.AI事件复核")
            st.dataframe(reviews, width="stretch", hide_index=True) if not reviews.empty else st.info("尚无高等级事件需要AI复核。")
        with c:
            st.markdown("#### 预警发送记录")
            st.dataframe(alert_rows, width="stretch", hide_index=True) if not alert_rows.empty else st.info("尚无高等级预警记录。")

    with tabs[4]:
        c1, c2, c3, c4 = st.columns(4)
        c1.metric("数据库快照", f"{storage_status['quote_count']:,}")
        c2.metric("公告记录", f"{storage_status['announcement_count']:,}")
        c3.metric("事件记录", f"{storage_status['event_count']:,}")
        c4.metric("预警记录", f"{storage_status['alert_count']:,}")
        checks = pd.DataFrame([
            {"检查项": "iFinD实时权限", "状态": "OK" if settings.live_ready else "待配置", "说明": "需要Quant HTTP refresh_token，不等同于MCP授权"},
            {"检查项": "B.AI分析", "状态": "OK" if settings.bai_ready else "待配置", "说明": settings.bai_model},
            {"检查项": "公告同步", "状态": "已启用", "说明": "每5分钟"},
            {"检查项": "财务同步", "状态": "已启用" if settings.ifind_financial_indicators else "待配置字段", "说明": "每30分钟检查"},
            {"检查项": "1秒行情", "状态": "运行中" if status.get("running") else "停止", "说明": f"限流时自动降至{status.get('effective_poll_seconds', 1):g}秒"},
        ])
        st.dataframe(checks, width="stretch", hide_index=True)
        st.caption("实时并不等于毫秒级交易。本系统用于个人投研、风险监控和决策复盘，不执行自动下单。")


live_dashboard()
