# 写作模板

## 两套模板

- `templates/obsidian/科研随笔.md`、`templates/obsidian/追星随笔.md`：Obsidian 专用，使用普通属性（标题、日期、描述、标签、分类、草稿），没有 `{{...}}` 占位符。Obsidian vault 的 `90templates` 目录放的是这两份的副本。
- `templates/research-note.md`、`templates/fan-note.md`：可直接复制到 `src/content/posts/` 的站点模板，frontmatter 已经是有效示例；默认 `draft: true`。
- `templates/homepage-now.md`、`templates/memory.md`：首页近况与回忆的原有模板，保持不变。

## 直接在 Obsidian 编辑站点文章

Obsidian vault 的 `60site` 是一个指向 `fuwari/src/content/posts` 的本地目录链接。在这里新建或编辑的笔记，保存后就是站点文章，不需要再复制到仓库。

1. 在 Obsidian 的 `60site` 中新建笔记，命名建议 `YYYY-MM-DD-简短标题.md`。
2. 执行“模板：插入模板”，选择 `90templates/科研随笔` 或 `90templates/追星随笔`。
3. 在属性面板直接修改标题、日期、描述、标签和分类；`draft` 勾选表示草稿。
4. 核对内容、日期、事实和照片来源后，取消 `draft` 勾选。
5. 构建并发布网站；只保存笔记不会自动更新正式站。

注意：`60site` 是真实站点目录的链接，不要删除或移动这个文件夹；删除其中的笔记会删除站点源文件（可用 Git 恢复）。已把 `60site` 加入 Nutstore Sync 的排除规则，站点内容由 Git 保留；如果之后需要独立写作区，请告诉我，我可以改回复制发布模式。

## 字段约束

- 科研随笔：`category` 固定为 `科研手记`。
- 追星随笔：`category` 只能是 `线下` 或 `生日`。
- `published` 使用 `YYYY-MM-DD`；文件名也建议使用同一日期前缀。
- `tags` 用列表；没有标签就保留空数组。
- 照片必须使用本地素材并确认来源；相册照片还要同步 `src/data/photos.ts`。
- 不要编造场次、感受、实验数据或引用。

## 模板源与副本

仓库里的 `templates/obsidian/` 是源文件；Obsidian vault 的 `90templates/` 是供核心 Templates 插件使用的副本。修改模板时先改仓库版本，再同步副本，避免两份内容漂移。
