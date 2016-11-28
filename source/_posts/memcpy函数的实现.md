---
title: memcpy函数的实现
date: 2016-11-28 22:55:25
tags: C/C++语言
---

## memcpy的代码实现

	void * memcpy(void *dest, const void *src, size_t count)
	{ 
    		if (dest == NULL || src == NULL)//判断是否为空避免非法操作
			return NULL; 
    		char *pdest = static_cast <char*>(dest);
    		const char *psrc  = static_cast <const char*>(src); 
    		int n = count; 
    		if (pdest > psrc && pdest < psrc+count) //目的地址大于源地址且存在内存重叠
    		{ 
        		for (size_t i=n-1; i != -1; --i)//从高位开始复制避免出现字符覆盖的情况
        		{ 
            			*(pdest+i) = *(psrc+i); 
        		} 
    		} 
    		else
    		{ 
        		for (size_t i= 0; i < n; i++) //从低位开始复制
        		{ 
           			*(pdest+i) = *(psrc+i);
        		} 
    		}
    		return dest; 
	}

##### 注：这里没有考虑内存重叠的所有情况

