[English](/README.md) | [中文](/README_zh-CN.md)

# TiddlyWiki5的SuperTag插件

通过简单地添加SuperTag，在tiddler上自动生成输入表单。通过合成现有的TraitTag来创建一个SuperTag。

请看以下资源来学习如何使用：

* talk论坛帖子 [SuperTag插件，在视图模板上自动生成一个字段编辑器](https://talk.tiddlywiki.org/t/supertag-plugin-auto-generate-a-field-editor-on-view-template/6245)
* 演示网站 [SuperTag插件的演示网站](https://tiddly-gittly.github.io/super-tag/)

## 鸣谢

使用[json-editor/json-editor](https://github.com/json-editor/json-editor)进行表单渲染。AFAIK [joshuafontany/TW5-jsoneditor](https://github.com/joshuafontany/TW5-jsoneditor) 也在使用它。

(不使用[eclipsesource/jsonforms](https://github.com/eclipsesource/jsonforms)，因为我们需要vanilly js渲染器，没有ReactJS）。

## 开发期间

有一些脚本你可以运行来促进你的开发。

在`npm i --legacy-peer-deps`之后：

- `npm run dev`将插件打包到`dist/`目录下，这将建立一个网站，当你有变化时，会自动重新加载。但这是开发模式，会产生一个比最终版本大得多的包，所以只能用于开发。
- `npm run dev-html`在本地设置演示网站。重新运行此命令并刷新浏览器以查看变化。通过这种方式，你可以看到真正的包的大小与你的用户将得到的相同。

如果你使用最新的nodejs，在`npm i`时需要`--legacy-peer-deps`。这是npm的一个错误。

### 添加第二个ts文件

在`package.json`的`tsFiles`字段中添加新的文件名（不带`.ts`）。而构建脚本将读取它并编译其中的文件。

## 在插件完成后

### 发布

在你的repo中启用github动作（在你的github repo-设置-动作-一般），如果不允许的话，当你在git提交和推送中标记一个新版本`vx.x.x`，它将自动发布到github release。