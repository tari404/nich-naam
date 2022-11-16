const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: './',
  chainWebpack: (config) => {
    config.plugin('html').tap((args) => {
      args[0].title = 'Flower'
      return args
    })
    config.module
      .rule('glsl')
      .test(/\.(vs|fs|glsl)(\?.*)?$/)
      .use('raw-loader')
      .loader('raw-loader')
      .end()
  },
})
