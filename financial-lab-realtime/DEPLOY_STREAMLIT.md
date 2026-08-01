# 免费网页体验版部署

## 你只需要操作一次

1. 将本项目放入 GitHub 仓库。
2. 打开 <https://share.streamlit.io/>，使用 GitHub 登录并授权仓库。
3. 点击 **Create app**，选择仓库与 `main` 分支。
4. Entrypoint file 填写 `streamlit_app.py`。
5. 打开 **Advanced settings**，Python 选择 `3.12`。
6. 将 `.streamlit/secrets.example.toml` 的内容复制到 Secrets，并修改 `APP_PASSWORD`。
7. 点击 **Deploy**，等待生成 `https://...streamlit.app` 地址。
8. 在 App settings → Sharing 中设为私有，避免其他人消耗你的 B.AI 和 iFinD 配额。

## 建议先这样体验

```toml
DATA_MODE = "mock"
BAI_AUTO_ANALYZE = "false"
```

确认页面能正常运行后，再在 Secrets 中填写已重新生成的凭证：

```toml
DATA_MODE = "ifind_http"
IFIND_REFRESH_TOKEN = "你的新iFinD Quant API refresh token"
BAI_API_KEY = "你的新B.AI key"
BAI_AUTO_ANALYZE = "true"
```

不要把密钥提交到 GitHub，也不要粘贴到聊天中。

## 免费版边界

- 无访问流量约12小时后会休眠，再次访问可以唤醒。
- `/tmp` 中的 DuckDB 数据可能在休眠、重启或重新部署后清空；CSV种子会自动恢复。
- 只适合体验页面、指标、事件和规则引擎，不适合全天候1秒监控。

