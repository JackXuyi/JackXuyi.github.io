---
title: git merge和rebase
date: 2022-05-28 21:55:56
tags: [git]
---

### 相同点

- 都是用来合并分支，将不同分支的代码融合在一起

### 不同点

#### 生成的代码树不同

- merge 生成的代码树记录了所有的历史操作过程
  ![merge 生成的代码树](/images/git/merge.png)

- rebase 生成的代码树是一条直线，通过对目标分支进行 “嫁接”，把新提交的 commit 代码添加到源分支的最后
  ![rebase 生成的代码树](/images/git/rebase.png)

#### 处理冲突的方式

- merge 命令合并分支，只需解决一次冲突，但是会产生一个新的 commit
- rebase 命令合并分支，解决完冲突，执行 git add .和 git rebase --continue，不会产生额外的 commit，但是需要重复处理多次冲突。

### 附录

#### 使用建议

当满足以下条件时：

- 能够定期 rebase（避免 rebase 时出现大量冲突需要解决）
- 开发的分支只是自己使用（避免其他人拉去代码时本地产生冲突）
- 非基础公共分支

使用 rebase，其它使用 merge

#### 基本使用

```bash
git rebase [source] [target]
# source 分支作为基线，把 target 分支的 commit 嫁接到 source 分支上，若 target 分支参数不存在则使用当前所在分支
```

#### 小技巧

如果你不熟悉 git rebase，可以随时在临时分支中执行 rebase。

### 参考

- [Merge vs Rebase](https://zhuanlan.zhihu.com/p/57872388)
- [git-rebase ](https://git-scm.com/docs/git-rebase/)
