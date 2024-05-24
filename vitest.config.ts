import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        globals: true, // 启用全局导入
        environment: 'node', // 设置测试环境
    },
})
