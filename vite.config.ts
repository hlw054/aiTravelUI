import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { createStyleImportPlugin, ElementPlusResolve } from 'vite-plugin-style-import'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Vue(),
    Pages({
      dirs: 'src/pages',  // 需要生成路由的文件目录
      exclude: ['**/components/*.vue'],  // 排除在外的目录，即不将所有 components 目录下的 .vue 文件生成路由
      extendRoute(route) {
        if (route.path === '/') {
          return {
            ...route,
            redirect: '/home'
          }
        }
      }
    }),
    Layouts({
      // 如果是默认 layouts文件夹，默认 default.vue文件，则不需要配置
      layoutsDirs: 'src/layouts',
      defaultLayout: 'default',
    }),
    Components({
      extensions: ['vue'],
      include: [/\.vue$/, /\.vue\?vue/],
      resolvers: [
        ElementPlusResolver({
          importStyle: 'sass',
        }),
      ],
      dts: 'src/components.d.ts',
    }),
    createStyleImportPlugin({
      resolves: [ElementPlusResolve()],
    }),
  ],
  server: {
    port: 5174,//端口号
    host: true,//ip地址 或 '0.0.0.0' 或 "loaclhost"
    // open: false, //启动后是否自动打开浏览器
    // https: false, // 是否开启 https
    proxy: {
      '/api': {
        target: 'http://localhost:8081', // 目标服务器地址
        // target: 'http://172.19.178.181:8080', // 目标服务器地址
        changeOrigin: true, // 是否改变请求源
        rewrite: (path) => path.replace(/^\/api/, ''), // 重写路径
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
