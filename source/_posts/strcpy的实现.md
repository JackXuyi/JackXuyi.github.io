---
title: strcpy的实现
date: 2016-11-28 22:12:57
tags: C/C++语言
---

## 不考虑内存重叠

	char * strcpy(char *dest,const char *src)
	{
		char *ret;
		if(dest==NULL || src==NULL)//检查是否为空指针
			return NULL;
		while((*dest++=*src++)!='\0');//复制字符串中的内容
		return ret;
	}


## 考虑内存重叠

	char *strcpy(char *dest,const char *src)
	{
		char *ret=dest;
		if(dest==NULL || src==NULL)//检查是否为空指针
			return NULL;
		memcpy(dest,src,strlen(src)+1);//调用memcpy函数避免内存重复的情况
		return ret;
	}


#### 说明

+ const修饰源字符串避免对源字符串的修改
+ 检查指针的有效性避免非法操作
+ 返回目标字符串的首地址确保字符串的线性
+ 使用`(*dest++=*src++)!='\0'`确保字符串的末尾有结束符






