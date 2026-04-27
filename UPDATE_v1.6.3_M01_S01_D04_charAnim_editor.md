# D-04 对白角色动作面板（charAnim 动作面板）

## 改动内容
- 在 Step-4「对话编辑」的每条对白卡片中，新增「🕺 动作（dialog.charAnim）」面板：
  - 启用/禁用开关（删除/创建 dialog.charAnim）。
  - 角色 charId：下拉候选（来自当前舞台角色 + 当前说话人）+ 可手动输入。
  - 动作 type：对齐 `js/characterAnimations.js` 支持的类型（nod/sway/bounce/jump/shake/heartbeat/hurt/appear/idle）。
  - 时长 duration(ms)：写入 `charAnim.options.duration`（空值会删除该字段）。
  - 选项：`keepAutoSpeaker`（保留说话人自动轻动）。
- 运行时（`js/sceneManager.js`）对“说话人自动轻动”的规则做了**向后兼容增强**：
  - 默认逻辑不变：只要该句存在 `charAnim`，就抑制说话人自动轻动。
  - 若 `charAnim.keepAutoSpeaker === true`，则允许保留说话人自动轻动（同时避免当 `charAnim` 目标就是说话人时重复触发）。

## 测试过程
1. 用浏览器打开 `game_project/editor.html`，进入任意章节/场景，打开 Step-4（对话编辑）。
2. 找任意一条对白卡片：
   - 展开「🕺 动作」面板，勾选“启用动作”，确认会出现 charId/type/duration 等输入控件。
   - 在 charId 下拉中选择一个舞台角色（例如 hina / sora），type 选择 `bounce`，duration 输入 `520`。
3. 点击该对白卡片右上角「预览」：
   - 预览框应能看到相应角色做对应动作（例如 bounce）。
4. 取消勾选“启用动作”或点击“清除动作”：
   - 再次预览，应不再触发该句的手动动作。
5. 验证 `keepAutoSpeaker`（可选但建议）：
   - 找一条有说话者的对白，在 charAnim 里指定**另一个角色**动作，并勾选“保留说话人自动轻动”。
   - 预览该句：说话者仍应触发自动轻动，而另一个角色也会触发手动动作。

## 预期 / 实际结果（验收点）
- 验收点1：编辑器能“可视化编辑” `dialog.charAnim`，不需要手写 JSON。实际：通过（新增动作面板 + 下拉候选 + duration 输入）。
- 验收点2：预览时动作能触发，并且对现有剧本兼容。实际：通过（运行时仍支持旧的 charAnim 写法）。
- 验收点3：默认语义不被破坏（有 charAnim 时依旧抑制自动轻动）。实际：通过（仅在 keepAutoSpeaker=true 时放行）。
- 验收点4：不会因为“保留自动轻动”导致同一角色双触发。实际：通过（当 charAnim 目标匹配说话人时，自动轻动会被抑制）。

备注：这里的“实际”基于代码逻辑检查 + 编辑器 UI 触发链路核对，不包含所有浏览器/分辨率的视觉回归测试。
